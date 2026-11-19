/// <reference types="cypress" />

// Country handling on /api/experiments: CloudFront's viewer country, tc precedence, and burst allocation.
describe("Viewer country and country-targeted sampling", () => {
  const API = "http://localhost:4000/api/experiments";
  const RUN = `cy-geo-${Date.now()}`;
  // Cells are capped at 10 confirmed + pending ratings (MIN_RATINGS in besample-matrix.ts).
  const MIN_RATINGS = 10;

  const parse = (value) =>
    typeof value === "string" ? JSON.parse(value) : value;

  const requestStatements = (sessionId, { country, tc } = {}) =>
    cy.request({
      url: API,
      qs: { sessionId, ...(tc ? { tc } : {}) },
      headers: country ? { "CloudFront-Viewer-Country": country } : {},
    });

  const savedInfo = (sessionId) =>
    cy
      .queryDb(
        "SELECT experimentType, experimentInfo FROM experiments WHERE sessionId = ?",
        [sessionId],
      )
      .then((rows) => {
        expect(rows, `experiment row for ${sessionId}`).to.have.length(1);
        return {
          type: rows[0].experimentType,
          info: parse(rows[0].experimentInfo),
        };
      });

  // Releases the pending reservations this spec created, then removes its rows.
  after(() => {
    cy.queryDb(
      "SELECT sessionId, experimentInfo FROM experiments WHERE sessionId LIKE ?",
      [`${RUN}%`],
    ).then((rows) => {
      rows.forEach((row) => {
        const info = parse(row.experimentInfo);
        const ids = (info && info.params && info.params.ids) || [];
        if (info && info.countryCode && ids.length) {
          cy.queryDb(
            "UPDATE statementcountryratings SET pendingCount = GREATEST(pendingCount - 1, 0) WHERE countryCode = ? AND statementId IN (?)",
            [info.countryCode, ids],
          );
        }
      });
      cy.queryDb("DELETE FROM experiments WHERE sessionId LIKE ?", [`${RUN}%`]);
    });
  });

  it("samples a visitor from any country by their CloudFront country", () => {
    const sessionId = `${RUN}-any-country`;
    requestStatements(sessionId, { country: "DE" })
      .its("body.experimentType")
      .should("equal", "besample-sampling");

    savedInfo(sessionId).then(({ type, info }) => {
      expect(type).to.equal("besample-sampling");
      expect(info.countryCode).to.equal("276");
      expect(info.countrySource).to.equal("geo");
      expect(info.viewerCountry).to.equal("DE");
    });
  });

  it("samples a Besample tc country outside the original 16", () => {
    const sessionId = `${RUN}-tc-france`;
    requestStatements(sessionId, { tc: "250" })
      .its("body.experimentType")
      .should("equal", "besample-sampling");

    savedInfo(sessionId).then(({ info }) => {
      expect(info.countryCode).to.equal("250");
      expect(info.countrySource).to.equal("tc");
    });
  });

  it("uses the CloudFront country for a Besample country when tc is absent", () => {
    const sessionId = `${RUN}-geo-only`;
    requestStatements(sessionId, { country: "BR" })
      .its("body.experimentType")
      .should("equal", "besample-sampling");

    savedInfo(sessionId).then(({ type, info }) => {
      expect(type).to.equal("besample-sampling");
      expect(info.countryCode).to.equal("076");
      expect(info.countrySource).to.equal("geo");
      expect(info.viewerCountry).to.equal("BR");
    });
  });

  it("lets the tc parameter win over the CloudFront country", () => {
    const sessionId = `${RUN}-tc-wins`;
    requestStatements(sessionId, { country: "BR", tc: "818" })
      .its("body.experimentType")
      .should("equal", "besample-sampling");

    savedInfo(sessionId).then(({ info }) => {
      expect(info.countryCode).to.equal("818");
      expect(info.countrySource).to.equal("tc");
      // The raw CloudFront country is still recorded.
      expect(info.viewerCountry).to.equal("BR");
    });
  });

  it("omits viewerCountry and skips country sampling when the header is missing or malformed", () => {
    const missing = `${RUN}-no-header`;
    const malformed = `${RUN}-bad-header`;
    requestStatements(missing).its("status").should("equal", 200);
    requestStatements(malformed, { country: "<script>" })
      .its("status")
      .should("equal", 200);

    // Country unknown: the visitor gets the same non-country experiment as before.
    [missing, malformed].forEach((sessionId) => {
      savedInfo(sessionId).then(({ type, info }) => {
        expect(info).to.not.have.property("viewerCountry");
        expect(type).to.not.equal("besample-sampling");
        expect(info).to.not.have.property("countryCode");
      });
    });
  });

  it("never reserves a statement beyond its remaining need under a simultaneous burst", () => {
    const visitors = 10;
    const country = "288"; // Ghana: only used by this test.
    const sessions = Array.from(
      { length: visitors },
      (_, i) => `${RUN}-burst-${i}`,
    );

    cy.queryDb(
      "SELECT COALESCE(SUM(pendingCount), 0) AS pending FROM statementcountryratings WHERE countryCode = ?",
      [country],
    ).then(([{ pending: before }]) => {
      const fire = () =>
        Promise.all(
          sessions.map((sessionId) =>
            fetch(`${API}?sessionId=${sessionId}&tc=${Number(country)}`).then(
              (response) => response.status,
            ),
          ),
        );
      cy.wrap(fire(), { timeout: 60000 }).then((statuses) => {
        statuses.forEach((status) => expect(status).to.equal(200));
      });

      cy.queryDb(
        "SELECT experimentInfo FROM experiments WHERE sessionId LIKE ?",
        [`${RUN}-burst-%`],
      ).then((rows) => {
        expect(rows).to.have.length(visitors);
        const perStatement = {};
        let assigned = 0;
        rows.forEach((row) => {
          const ids = parse(row.experimentInfo).params.ids;
          assigned += ids.length;
          ids.forEach((id) => {
            perStatement[id] = (perStatement[id] || 0) + 1;
          });
        });

        // Every reservation is exactly one new pending count.
        cy.queryDb(
          "SELECT COALESCE(SUM(pendingCount), 0) AS pending FROM statementcountryratings WHERE countryCode = ?",
          [country],
        ).then(([{ pending: after }]) => {
          expect(Number(after) - Number(before)).to.equal(assigned);
        });

        // No cell this burst reserved may exceed the confirmed + pending cap.
        // (Older cells can sit above it from before reservations were
        // enforced in the database; the burst never reserves those.)
        cy.queryDb(
          "SELECT statementId, confirmedCount + pendingCount AS covered FROM statementcountryratings WHERE countryCode = ? AND statementId IN (?)",
          [country, Object.keys(perStatement).map(Number)],
        ).then((cells) => {
          expect(cells).to.have.length(Object.keys(perStatement).length);
          cells.forEach((cell) => {
            expect(
              Number(cell.covered),
              `statement ${cell.statementId}`,
            ).to.be.at.most(MIN_RATINGS);
          });
        });
      });
    });
  });
});
