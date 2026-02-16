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

  it("should maintain session after refresh", () => {
    cy.visit("http://localhost:5173/statements");

    // Optional: trigger something that should set/create the session cookie
    cy.request({
      url: "http://localhost:4000/api/whoami", // or /api/session or whatever returns session info
      credentials: "include",
    });

    // Debug: see what cookies actually exist right now
    cy.getCookies().then((cookies) => {
      cy.log("Cookies after visit:", cookies);
      console.log("Full cookies object:", cookies);
    });

    // Most reliable: specifically check YOUR session cookie exists
    cy.getCookie("survey-session")
      .should("exist") // fails test if missing → good for debugging
      .should("have.property", "value") // has a non-empty value
      .then((cookie) => {
        cy.log("Session cookie value before reload:", cookie.value);
        // optional: save it for later comparison
        cy.wrap(cookie.value).as("originalSessionValue");
      });

    cy.reload();

    cy.wait(1500); // or better: wait for your app's loading spinner/data fetch

    // After reload: cookie should still be there with same value
    cy.getCookie("survey-session")
      .should("exist")
      .should("have.property", "value")
      .then((cookieAfter) => {
        cy.log("Session cookie value after reload:", cookieAfter.value);
      });

    // Optional strict check
    cy.get("@originalSessionValue").then((original) => {
      cy.getCookie("survey-session").its("value").should("equal", original);
    });

    // If you want to also compare session data from API
    cy.request({
      url: "http://localhost:4000/api/whoami",
      credentials: "include",
    })
      .its("body")
      .should(
        "deep.equal" /* expected session shape or use alias from earlier */,
      );
  });
});
