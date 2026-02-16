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
    cy.get('h3').first().then(($h3) => {
      const firstStatementText = $h3.text();

      // Click Next
      cy.intercept('POST', '**/api/answers').as('saveAnswer');
      cy.contains("button", "Next →").click({ force: true });
      cy.wait('@saveAnswer');

      // Now we should be on the second statement
      cy.get('h3').first().should(($h3next) => {
        expect($h3next.text()).to.not.equal(firstStatementText);
      });

      cy.get('h3').first().then(($h3second) => {
        const secondStatementText = $h3second.text();

        // 2. Refresh the page
        cy.reload();
        cy.wait(3000); // Wait for restoration logic to finish

        // 3. Verify we are still on the second statement (restored from backend/localstorage)
        cy.get('h3').first().should('have.text', secondStatementText);

        // 4. Verify we can still go back and see the first answer (optional, depending on UI)
        // For now, let's just check that we can answer the second one and proceed
        cy.contains("button", "Next →").should('be.visible');
      });
    });
  });

  it("should maintain session ID after refresh", () => {
    // Intercept the /api call that returns the session ID
    cy.request("http://localhost:4000/api").then((response) => {
      const originalSessionId = response.body;
      expect(originalSessionId).to.have.length.at.least(1);

      cy.reload();
      
      cy.request("http://localhost:4000/api").then((secondResponse) => {
        expect(secondResponse.body).to.equal(originalSessionId);
      });
    });
  });
});
