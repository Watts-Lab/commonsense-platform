/// <reference types="cypress" />

// statementcountryratings counting: organic participants count toward their
// self-reported country (never their CloudFront viewer country), once per
// experiment, even when demographics and survey completion arrive together.
describe("Self-reported country ratings", () => {
  const API = "http://localhost:4000/api/experiments";
  const RUN = `cy-self-${Date.now()}`;
  const ICELAND = "352"; // self-reported country used only by this spec
  const ICELAND_NAME = "Iceland";

  const parse = (value) =>
    typeof value === "string" ? JSON.parse(value) : value;

  const confirmedFor = (country, statementIds) =>
    cy
      .queryDb(
        "SELECT statementId, confirmedCount FROM statementcountryratings WHERE countryCode = ? AND statementId IN (?)",
        [country, statementIds],
      )
      .then((rows) =>
        Object.fromEntries(
          rows.map((row) => [row.statementId, Number(row.confirmedCount)]),
        ),
      );

  // Assigns a geo (viewer-country) experiment and answers its first two statements.
  const startSession = (sessionId) =>
    cy
      .request({
        url: API,
        qs: { sessionId },
        headers: { "CloudFront-Viewer-Country": "DE" },
      })
      .then(({ body }) => {
        expect(body.experimentType).to.equal("besample-sampling");
        const answered = body.statements.slice(0, 2).map((s) => s.id);
        answered.forEach((statementId) =>
          cy.queryDb(
            "INSERT INTO answers (statementId, sessionId, I_agree, I_agree_reason, others_agree, others_agree_reason, perceived_commonsense, createdAt, updatedAt) VALUES (?, ?, 1, 'r', 1, 'r', 1, NOW(), NOW())",
            [statementId, sessionId],
          ),
        );
        return cy.wrap({ experimentId: body.experimentId, answered });
      });

  let touched = [];

  // Undoes this spec's rating credits and reservations, then removes its rows.
  after(() => {
    cy.queryDb(
      "SELECT experimentInfo FROM experiments WHERE sessionId LIKE ?",
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
    });
    touched.forEach(({ statementId, credited }) =>
      cy.queryDb(
        "UPDATE statementcountryratings SET confirmedCount = GREATEST(confirmedCount - ?, 0) WHERE countryCode = ? AND statementId = ?",
        [credited, ICELAND, statementId],
      ),
    );
    cy.queryDb("DELETE FROM answers WHERE sessionId LIKE ?", [`${RUN}%`]);
    cy.queryDb("DELETE FROM individuals WHERE sessionId LIKE ?", [`${RUN}%`]);
    cy.queryDb("DELETE FROM experiments WHERE sessionId LIKE ?", [`${RUN}%`]);
  });

  it("credits each answered statement once to the self-reported country when demographics and completion race", () => {
    const sessions = Array.from({ length: 8 }, (_, i) => `${RUN}-${i}`);
    const started = [];
    sessions.forEach((sessionId) =>
      startSession(sessionId).then((s) => started.push({ sessionId, ...s })),
    );

    cy.then(() => {
      const statementIds = [
        ...new Set(started.flatMap(({ answered }) => answered)),
      ];
      const expected = {};
      started.forEach(({ answered }) =>
        answered.forEach((id) => {
          expected[id] = (expected[id] || 0) + 1;
        }),
      );

      confirmedFor(ICELAND, statementIds).then((before) => {
        // Fire every session's demographics and completion simultaneously,
        // twice over, to exercise the once-per-experiment claim.
        const post = (path, body) =>
          fetch(`${API}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }).then((response) => response.status);
        const fire = () =>
          Promise.all(
            started.flatMap(({ sessionId, experimentId }) => [
              post("/individual", {
                sessionId,
                informationType: "demographicsLongInternational",
                experimentInfo: {
                  responses: { country_reside: ICELAND_NAME },
                },
              }),
              post("/save", { experimentId }),
              post("/save", { experimentId }),
            ]),
          );
        cy.wrap(fire(), { timeout: 60000 }).then((statuses) => {
          statuses.forEach((status) => expect(status).to.equal(200));
        });

        confirmedFor(ICELAND, statementIds).should((afterCounts) => {
          touched = statementIds.map((statementId) => ({
            statementId,
            credited:
              (afterCounts[statementId] || 0) - (before[statementId] || 0),
          }));
          touched.forEach(({ statementId, credited }) => {
            expect(credited, `statement ${statementId}`).to.equal(
              expected[statementId],
            );
          });
        });

        // Every experiment was claimed exactly once.
        cy.queryDb(
          "SELECT COUNT(*) AS credited FROM experiments WHERE sessionId LIKE ? AND selfReportCredited = 1",
          [`${RUN}%`],
        ).should(([{ credited }]) => {
          expect(Number(credited)).to.equal(sessions.length);
        });
      });
    });
  });

  it("does not count the viewer country", () => {
    const sessionId = `${RUN}-viewer`;
    startSession(sessionId).then(({ experimentId, answered }) => {
      cy.queryDb(
        "SELECT COALESCE(SUM(confirmedCount), 0) AS confirmed FROM statementcountryratings WHERE countryCode = '276' AND statementId IN (?)",
        [answered],
      ).then(([{ confirmed: before }]) => {
        cy.request("POST", `${API}/individual`, {
          sessionId,
          informationType: "demographicsLongInternational",
          experimentInfo: { responses: { country_reside: ICELAND_NAME } },
        });
        cy.request("POST", `${API}/save`, { experimentId });
        cy.queryDb(
          "SELECT COALESCE(SUM(confirmedCount), 0) AS confirmed FROM statementcountryratings WHERE countryCode = '276' AND statementId IN (?)",
          [answered],
        ).then(([{ confirmed: after }]) => {
          expect(Number(after)).to.equal(Number(before));
        });
        confirmedFor(ICELAND, answered).then((counts) => {
          touched.push(
            ...answered.map((statementId) => ({ statementId, credited: 1 })),
          );
          answered.forEach((id) => expect(counts[id]).to.be.at.least(1));
        });
      });
    });
  });
});
