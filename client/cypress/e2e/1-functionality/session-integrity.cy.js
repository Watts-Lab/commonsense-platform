/// <reference types="cypress" />

// After a participant completes the whole survey, the same session identifier
// must be recorded consistently across every table that stores it (all use the
// `sessionId` column). We rely on the frontend to send the correct id, so this
// guards against that contract silently breaking.
describe("session id integrity across tables", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/statements", {
      onBeforeLoad(win) {
        win.localStorage.setItem("gdpr-consent", "accepted");
        win.localStorage.setItem("consent", "true");
      },
    });
  });

  it("persists the same sessionId in experiments, answers, and individuals", () => {
    const numberOfIterations = 15;

    // Answer all statements.
    for (let i = 0; i < numberOfIterations; i++) {
      cy.log(`Current page: ${i}`);
      cy.wait(1000);

      cy.get("input[type='radio'][id*='question1-1']").check({ force: true });
      cy.get("input[type='radio'][id*='question2-1']").check({ force: true });
      cy.get("input[type='radio'][id*='question3-2']").check({ force: true });
      cy.get("input[type='radio'][id*='question4-1']").check({ force: true });
      cy.get("input[type='radio'][id*='question5-1']").check({ force: true });

      if (i === numberOfIterations - 1) {
        cy.contains("button", "Continue").click({ force: true });
      } else {
        cy.contains("button", "Next →").click({ force: true });
      }
    }

    // CRT.
    cy.get("input[type='number'][id*='sq_100i']").type("1");
    cy.get("input[type='number'][id*='sq_101i']").type("1");
    cy.get("input[type='number'][id*='sq_102i']").type("1");
    cy.get("input[type='number'][id*='sq_103i']").type("1");
    cy.get("input[type='number'][id*='sq_104i']").type("1");
    cy.get("input[type='number'][id*='sq_105i']").type("1");
    cy.get("input[type='button'][value='Complete']").click();

    // RME (10 questions).
    for (let j = 0; j < 10; j++) {
      cy.get("input[type='radio'][name*='rme_item_']")
        .first()
        .check({ force: true })
        .should("be.checked");

      if (j !== 9) {
        cy.get("input[type='button'][value='Next']").click();
      } else {
        cy.get("input[type='button'][value='Complete']").click();
      }
    }

    // Demographics.
    cy.get(`[data-name="birth_year"] input`).click().type("1990");
    cy.get(`[data-name="gender"] input[value="other"]`).click({ force: true });
    cy.get(`[data-name="gender_other"] input`).click().type("Other gender");
    cy.get(`[data-name="marital_status"] input`).click({ force: true });
    cy.contains("Married or Domestic Partnership").click({ force: true });
    cy.get(`[data-name="language_primary"] input`).click({ force: true });
    cy.contains("French").click({ force: true });
    cy.get(`[data-name="english_written"] input[value="4"]`).click({
      force: true,
    });
    cy.get(`[data-name="english_spoken"] input[value="4"]`).click({
      force: true,
    });
    cy.get(`[data-name="employment_status"] input[value="employed"]`).click({
      force: true,
    });
    cy.get(
      `[data-name="employment_industry"] input[value="Agriculture, Forestry, Fishing, and Hunting"]`,
    ).click({ force: true });
    cy.get(`[data-name="job_title"] input`).click().type("Survey Developer");
    cy.get(`[data-name="country_reside"] input`).click({ force: true });
    cy.contains("United States").click({ force: true });
    cy.get(`input[type="button"][value="Next"]`).click({ force: true });
    cy.get(`[data-name="education_US"] input[value="Doctorate"]`).click({
      force: true,
    });
    cy.get(`[data-name="latin_US"] input[value="Yes"]`)
      .next()
      .click({ force: true });
    cy.get(`[data-name="zipcode_US"] input`).click().type("52066");
    cy.get(`[data-name="race_US"] input[value="White"]`)
      .next()
      .click({ force: true });
    cy.get(`[data-name="income_US"] input[value="$50,000-$74,999"]`).click({
      force: true,
    });

    cy.intercept("http://localhost:4000/api/results").as("resultData");
    cy.get(`input[type="button"][value="Complete"]`).click({ force: true });
    cy.wait("@resultData").its("response.statusCode").should("equal", 200);
    cy.wait(2000);

    // Read the sessionId the frontend used (stored in localStorage). Every table
    // below must reference this exact value.
    cy.window()
      .then((win) => win.localStorage.getItem("sessionId"))
      .then((sessionId) => {
        expect(sessionId, "frontend sessionId").to.be.a("string").and.not.be
          .empty;

        // experiments.sessionId — the survey run itself.
        cy.queryDb(
          "SELECT id, finished FROM experiments WHERE sessionId = ?",
          [sessionId],
        ).then((rows) => {
          expect(rows.length, "experiments rows for session").to.be.greaterThan(
            0,
          );
          // At least one should be marked finished after completion.
          const finished = rows.some(
            (r) => r.finished === 1 || r.finished === true,
          );
          expect(finished, "an experiment marked finished").to.be.true;
        });

        // answers.sessionId — one row per answered statement (15).
        cy.queryDb("SELECT COUNT(*) AS n FROM answers WHERE sessionId = ?", [
          sessionId,
        ]).then((rows) => {
          expect(rows[0].n, "answers rows for session").to.equal(
            numberOfIterations,
          );
        });

        // individuals.sessionId — the CRT / RME / demographics aux surveys.
        // Three distinct aux surveys are completed, so expect >= 3 rows recorded
        // under this session (exact informationType strings come from the
        // surveys package, so we don't hardcode them).
        cy.queryDb(
          "SELECT COUNT(*) AS n FROM individuals WHERE sessionId = ?",
          [sessionId],
        ).then((rows) => {
          expect(rows[0].n, "individuals rows for session").to.be.gte(3);
        });

        // Guard against the naming-drift bug: no orphan rows should exist under
        // the "wrong" column convention for this session.
        cy.queryDb(
          "SELECT COUNT(*) AS n FROM experiments WHERE experimentId = ? OR experimentType = ?",
          [sessionId, sessionId],
        ).then((rows) => {
          expect(rows[0].n, "sessionId leaking into wrong columns").to.equal(0);
        });

        // ipaddresses is written by an async, IP-keyed batch flush (see
        // server.js). `sessionId` is the first session seen from an IP, but
        // `lastSessionId` tracks the most recent one, so on a shared IP (CI
        // localhost) THIS session must be recorded as the last session seen.
        cy.queryDb(
          "SELECT COUNT(*) AS n FROM ipaddresses WHERE lastSessionId = ?",
          [sessionId]
        ).then((rows) => {
          expect(rows[0].n, "ipaddresses lastSessionId for session").to.be.gte(
            1
          );
        });
      });
  });
});

// A second, different Besample assignment landing in the *same browser*
// after the first one finished must never inherit the first participant's
// sessionId, consent, or completed-aux-survey flags (see CHANGES.md §8b) --
// each Besample attempt is a distinct participant and must produce its own
// fully independent, internally-consistent set of experiments/answers/
// individuals rows, exactly like a first-time visitor would.
describe("session id integrity across two Besample attempts on one browser", () => {
  const completeFullSurveyFlow = () => {
    const numberOfIterations = 15;

    for (let i = 0; i < numberOfIterations; i++) {
      cy.wait(1000);

      cy.get("input[type='radio'][id*='question1-1']").check({ force: true });
      cy.get("input[type='radio'][id*='question2-1']").check({ force: true });
      cy.get("input[type='radio'][id*='question3-2']").check({ force: true });
      cy.get("input[type='radio'][id*='question4-1']").check({ force: true });
      cy.get("input[type='radio'][id*='question5-1']").check({ force: true });

      if (i === numberOfIterations - 1) {
        cy.contains("button", "Continue").click({ force: true });
      } else {
        cy.contains("button", "Next →").click({ force: true });
      }
    }

    // CRT.
    cy.get("input[type='number'][id*='sq_100i']").type("1");
    cy.get("input[type='number'][id*='sq_101i']").type("1");
    cy.get("input[type='number'][id*='sq_102i']").type("1");
    cy.get("input[type='number'][id*='sq_103i']").type("1");
    cy.get("input[type='number'][id*='sq_104i']").type("1");
    cy.get("input[type='number'][id*='sq_105i']").type("1");
    cy.get("input[type='button'][value='Complete']").click();

    // RME (10 questions).
    for (let j = 0; j < 10; j++) {
      cy.get("input[type='radio'][name*='rme_item_']")
        .first()
        .check({ force: true })
        .should("be.checked");

      if (j !== 9) {
        cy.get("input[type='button'][value='Next']").click();
      } else {
        cy.get("input[type='button'][value='Complete']").click();
      }
    }

    // Demographics.
    cy.get(`[data-name="birth_year"] input`).click().type("1990");
    cy.get(`[data-name="gender"] input[value="other"]`).click({ force: true });
    cy.get(`[data-name="gender_other"] input`).click().type("Other gender");
    cy.get(`[data-name="marital_status"] input`).click({ force: true });
    cy.contains("Married or Domestic Partnership").click({ force: true });
    cy.get(`[data-name="language_primary"] input`).click({ force: true });
    cy.contains("French").click({ force: true });
    cy.get(`[data-name="english_written"] input[value="4"]`).click({
      force: true,
    });
    cy.get(`[data-name="english_spoken"] input[value="4"]`).click({
      force: true,
    });
    cy.get(`[data-name="employment_status"] input[value="employed"]`).click({
      force: true,
    });
    cy.get(
      `[data-name="employment_industry"] input[value="Agriculture, Forestry, Fishing, and Hunting"]`,
    ).click({ force: true });
    cy.get(`[data-name="job_title"] input`).click().type("Survey Developer");
    cy.get(`[data-name="country_reside"] input`).click({ force: true });
    cy.contains("United States").click({ force: true });
    cy.get(`input[type="button"][value="Next"]`).click({ force: true });
    cy.get(`[data-name="education_US"] input[value="Doctorate"]`).click({
      force: true,
    });
    cy.get(`[data-name="latin_US"] input[value="Yes"]`)
      .next()
      .click({ force: true });
    cy.get(`[data-name="zipcode_US"] input`).click().type("52066");
    cy.get(`[data-name="race_US"] input[value="White"]`)
      .next()
      .click({ force: true });
    cy.get(`[data-name="income_US"] input[value="$50,000-$74,999"]`).click({
      force: true,
    });

    cy.intercept("http://localhost:4000/api/results").as("resultData");
    cy.get(`input[type="button"][value="Complete"]`).click({ force: true });
    cy.wait("@resultData").its("response.statusCode").should("equal", 200);
    cy.wait(2000);
  };

  const assertSessionIsSelfConsistent = (sessionId) => {
    cy.queryDb("SELECT id, finished FROM experiments WHERE sessionId = ?", [
      sessionId,
    ]).then((rows) => {
      expect(rows.length, "experiments rows for session").to.be.greaterThan(0);
      const finished = rows.some(
        (r) => r.finished === 1 || r.finished === true,
      );
      expect(finished, "an experiment marked finished").to.be.true;
    });

    cy.queryDb("SELECT COUNT(*) AS n FROM answers WHERE sessionId = ?", [
      sessionId,
    ]).then((rows) => {
      expect(rows[0].n, "answers rows for session").to.equal(15);
    });

    cy.queryDb("SELECT COUNT(*) AS n FROM individuals WHERE sessionId = ?", [
      sessionId,
    ]).then((rows) => {
      expect(rows[0].n, "individuals rows for session").to.be.gte(3);
    });
  };

  it("gives each Besample attempt its own sessionId, consent, and aux-survey flow", () => {
    // First Besample attempt: consent pre-accepted, as in the other specs.
    cy.visit(
      "http://localhost:5173/statements?bpid=P1&bnum=101&battempt=attempt-1&tc=999",
      {
        onBeforeLoad(win) {
          win.localStorage.setItem("gdpr-consent", "accepted");
          win.localStorage.setItem("consent", "true");
        },
      },
    );

    completeFullSurveyFlow();

    cy.window()
      .then((win) => win.localStorage.getItem("sessionId"))
      .then((firstSessionId) => {
        expect(firstSessionId, "first sessionId").to.be.a("string").and.not.be
          .empty;

        // Second Besample attempt, same browser: deliberately do NOT touch
        // localStorage here -- it must still hold the first attempt's
        // sessionId/consent/CRT/rmeTen/demographicsLongInternational from
        // above, and the app itself (not this test) is responsible for
        // wiping them once it sees a different `battempt`.
        cy.visit(
          "http://localhost:5173/statements?bpid=P2&bnum=202&battempt=attempt-2&tc=999",
        );

        // Consent was cleared -> redirected to the consent gate again.
        cy.location("pathname", { timeout: 10000 }).should("equal", "/survey");
        cy.contains("button", "Participate in the survey").click({
          force: true,
        });
        cy.location("pathname", { timeout: 10000 }).should(
          "equal",
          "/statements",
        );

        completeFullSurveyFlow();

        cy.window()
          .then((win) => win.localStorage.getItem("sessionId"))
          .then((secondSessionId) => {
            expect(secondSessionId, "second sessionId")
              .to.be.a("string")
              .and.not.be.empty;
            expect(
              secondSessionId,
              "second attempt must not reuse the first attempt's sessionId",
            ).to.not.equal(firstSessionId);

            // The historical bug this guards against: the same person's
            // answers/CRT/RME/demographics ending up recorded under
            // *different* sessionIds. Assert both attempts are internally
            // consistent across every table, even though they shared a
            // browser one after another.
            assertSessionIsSelfConsistent(firstSessionId);
            assertSessionIsSelfConsistent(secondSessionId);
          });
      });
  });
});
