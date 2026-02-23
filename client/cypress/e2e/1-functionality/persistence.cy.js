/// <reference types="cypress" />

describe("survey persistence and session robustness", () => {
  beforeEach(() => {
    // go to the url
    cy.visit("http://localhost:5173/statements", {
      onBeforeLoad(win) {
        // Pretend the user already accepted GDPR
        win.localStorage.setItem("gdpr-consent", "accepted");
        // Pretend the user already accepted consent
        win.localStorage.setItem("consent", "true");
      },
    });
  });

  it("should preserve progress and session after refresh", () => {
    // 1. Answer first statement
    cy.wait(2000); // Wait for statements to load

    // Select answers for the first statement
    cy.get("input[type='radio'][id*='question1-1']").check({ force: true });
    cy.get("input[type='radio'][id*='question2-1']").check({ force: true });
    cy.get("input[type='radio'][id*='question3-1']").check({ force: true });
    cy.get("input[type='radio'][id*='question4-1']").check({ force: true });
    cy.get("input[type='radio'][id*='question5-1']").check({ force: true });

    // Capture the current statement text to verify it stays the same or advances correctly
    cy.get("h3")
      .first()
      .then(($h3) => {
        const firstStatementText = $h3.text();

        // Click Next
        cy.intercept("POST", "**/api/answers").as("saveAnswer");
        cy.contains("button", "Next →").click({ force: true });
        cy.wait("@saveAnswer");

        // Now we should be on the second statement
        cy.get("h3")
          .first()
          .should(($h3next) => {
            expect($h3next.text()).to.not.equal(firstStatementText);
          });

        cy.get("h3")
          .first()
          .then(($h3second) => {
            const secondStatementText = $h3second.text();

            // 2. Refresh the page
            cy.reload();
            cy.wait(3000); // Wait for restoration logic to finish

            // 3. Verify we are still on the second statement (restored from backend/localstorage)
            cy.get("h3").first().should("have.text", secondStatementText);

            // 4. Verify we can still go back and see the first answer (optional, depending on UI)
            // For now, let's just check that we can answer the second one and proceed
            cy.contains("button", "Next →").should("be.visible");
          });
      });
  });

  it("should maintain session cookie after refresh", () => {
    // 1. Visit the statements page — this should create/set the session cookie if not already present
    cy.visit("http://localhost:5173/statements");

    cy.wait(1500); // give time for any initial fetches / session init

    // 2. Debug: show all cookies the browser has right now
    cy.getCookies().then((cookies) => {
      cy.log("Cookies after initial visit:", cookies);
      console.log("Full cookies:", cookies); // also appears in browser console
    });

    // 3. Specifically verify YOUR session cookie exists and has a value
    cy.getCookie("survey-session")
      .should("exist") // ← fails test if missing — great for spotting the issue early
      .its("value")
      .should("not.be.empty")
      .then((cookieValue) => {
        cy.log(`Session cookie value before reload: ${cookieValue}`);
        // Save for comparison after reload
        cy.wrap(cookieValue).as("originalSessionCookieValue");
      });

    // 4. Reload the page
    cy.reload();

    cy.wait(2000); // or intercept your app's data-load request if you know it

    // 5. Check the cookie again — should be identical
    cy.getCookie("survey-session")
      .should("exist")
      .its("value")
      .then((newValue) => {
        cy.log(`Session cookie value after reload: ${newValue}`);
      });

    cy.get("@originalSessionCookieValue").then((originalValue) => {
      cy.getCookie("survey-session")
        .its("value")
        .should("equal", originalValue);
    });

    cy.request({
      method: "GET",
      url: "http://localhost:4000/api",
      failOnStatusCode: false,
    }).then((response) => {
      cy.log(
        "Response from session-aware endpoint after reload:",
        response.status,
        response.body,
      );
      expect(response.status).to.eq(200);
      // response.body should be the sessionID string
      expect(response.body).to.be.a("string");
      expect(response.body).to.not.equal("");
    });
  });
});
