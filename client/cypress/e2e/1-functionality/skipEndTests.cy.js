/// <reference types="cypress" />

describe("skip completed end-of-survey tests", () => {
  beforeEach(() => {
    // go to the url
    cy.visit("http://localhost:5173/statements", {
      onBeforeLoad(win) {
        // Pretend the user already accepted GDPR
        win.localStorage.setItem("gdpr-consent", "accepted");
        // Pretend the user already accepted consent
        win.localStorage.setItem("consent", "true");

        // Mock completed end-of-survey tests
        win.localStorage.setItem(
          "CRT",
          JSON.stringify({ surveyName: "CRT", result: { score: 3 } }),
        );
        win.localStorage.setItem(
          "rmeTen",
          JSON.stringify({ surveyName: "rmeten", result: { score: 8 } }),
        );
        win.localStorage.setItem(
          "demographicsLongInternational",
          JSON.stringify({ surveyName: "demographics" }),
        );
      },
    });
  });

  it("should skip CRT, RME, and Demographics and go straight to Results", () => {
    const numberOfIterations = 15;

    for (let i = 0; i < numberOfIterations; i++) {
      cy.log(`Current page: ${i}`);
      cy.wait(500); // Wait for statement to load

      // Select answers for questions 1-5
      cy.get("input[type='radio'][id*='question1-1']").check({ force: true });
      cy.get("input[type='radio'][id*='question2-1']").check({ force: true });
      cy.get("input[type='radio'][id*='question3-2']").check({ force: true });
      cy.get("input[type='radio'][id*='question4-1']").check({ force: true });
      cy.get("input[type='radio'][id*='question5-1']").check({ force: true });

      if (i === numberOfIterations - 1) {
        // Intercept result data fetch
        cy.intercept("POST", "**/api/results").as("resultData");

        // Last statement - should say Continue or Next -> based on implementation
        // From Layout.tsx: isLastStatement ? t("layout.continue") : t("layout.next")
        cy.contains("button", "Continue").click({ force: true });
      } else {
        cy.contains("button", "Next →").click({ force: true });
      }
    }

    // After the last statement, it should NOT show CRT/RME/Demographics
    // It should go directly to the Result page and fetch result data
    cy.wait("@resultData").its("response.statusCode").should("equal", 200);

    // Verify we are on the results page
    cy.get('[data-cy="commonsense-score"]', { timeout: 10000 }).should("exist");

    // Explicitly check that we are NOT seeing survey elements
    cy.get("input[value='Complete']").should("not.exist");
    cy.get("input[name*='rme_item_']").should("not.exist");
  });
});
