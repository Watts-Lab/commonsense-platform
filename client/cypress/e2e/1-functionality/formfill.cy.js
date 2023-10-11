/// <reference types="cypress" />

describe("fill out the survay", () => {
  beforeEach(() => {
    // go to the url
    cy.visit("http://localhost:5173/statements");
  });

  it("Select radio and click 'Next' in a loop", () => {
    const numberOfIterations = 15;

    for (let i = 0; i < numberOfIterations; i++) {
      cy.get("input[type='radio'][id*='question1ag1']")
        .check({ force: true })
        .should("be.checked");
      cy.get("input[type='radio'][id*=\"question1-It's obvious\"]")
        .check({ force: true })
        .should("be.checked");
      cy.get("input[type='radio'][id*='question2ag1']")
        .check({ force: true })
        .should("be.checked");
      cy.get(
        "input[type='radio'][id*=\"question2-I think most people have good judgement with regard to this topic\"]"
      )
        .check({ force: true })
        .should("be.checked");
      cy.get("input[type='radio'][id*='question3ag1']")
        .check({ force: true })
        .should("be.checked");
      cy.get(
        "input[type='radio'][id*=\"question3-Clear: it is clearly written and I can understand the meaning\"]"
      )
        .check({ force: true })
        .should("be.checked");

      // Check if it's the 15th iteration and select the "Finish" button
      if (i === numberOfIterations - 1) {
        cy.contains("button", "Finish").click({ force: true });
      } else {
        // Otherwise, click the "Next" button (modify the selector as needed)
        cy.contains("button", "Next →").click({ force: true });
      }
    }
  });
});
