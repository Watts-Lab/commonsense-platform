/// <reference types="cypress" />

describe("fill out the survay", () => {
  beforeEach(() => {
    // go to the url
    cy.visit("http://localhost:5173/statements");
  });

  it("Select radio and click 'Next' in a loop", () => {
    const numberOfIterations = 15;

    for (let i = 0; i < numberOfIterations; i++) {
      cy.log(`Current page: ${i}`);

      cy.wait(1000); // Wait for 1 second before selecting the radio button

      cy.get("input[type='radio'][id*='question1-No']")
        .check({ force: true })
        .should("be.checked");
      cy.get("input[type='radio'][id*=\"question2-It's obvious\"]")
        .check({ force: true })
        .should("be.checked");
      cy.get("input[type='radio'][id*='question3-No']")
        .check({ force: true })
        .should("be.checked");
      cy.get(
        "input[type='radio'][id*=\"question4-I think most people lack good judgment with regard to this topic\"]"
      )
        .check({ force: true })
        .should("be.checked");
      cy.get("input[type='radio'][id*='question5-No']")
        .check({ force: true })
        .should("be.checked");
      // cy.get(

      //   "input[type='radio'][id*=\"question6-I think most people have good judgement with regard to this topic\"]"
      // )
      //   .check({ force: true })
      //   .should("be.checked");

      // Check if it's the 15th iteration and select the "Finish" button
      if (i === numberOfIterations - 1) {
        cy.contains("button", "Next →").click({ force: true });
      } else {
        // Otherwise, click the "Next" button (modify the selector as needed)
        cy.contains("button", "Next →").click({ force: true });
      }
    }

    // Go to individual question pages

    cy.get("input[type='number'][id*='sq_106i']").type("1");
    cy.get("input[type='number'][id*='sq_107i']").type("1");
    cy.get("input[type='number'][id*='sq_108i']").type("1");
    cy.get("input[type='number'][id*='sq_109i']").type("1");
    cy.get("input[type='number'][id*='sq_110i']").type("1");
    cy.get("input[type='number'][id*='sq_111i']").type("1");

    cy.get("input[type='button'][value='Complete']").click();

    // Go through RME questions

    const list_of_ids = [
      "sq_133i_0",
      "sq_135i_0",
      "sq_137i_0",
      "sq_139i_0",
      "sq_141i_0",
      "sq_143i_0",
      "sq_145i_0",
      "sq_147i_0",
      "sq_149i_0",
    ];

    list_of_ids.forEach((id) => {
      cy.get(`input[type='radio'][id*='${id}']`)
        .check({ force: true })
        .should("be.checked");
      cy.get("input[type='button'][value='Next']").click();
    });

    // Go through the last page
    cy.get(`input[type='radio'][id*='sq_151i_0']`)
      .check({ force: true })
      .should("be.checked");
    cy.get("input[type='button'][value='Complete']").click();

    // Fill the demographic form
    cy.get("input[type='text'][id*='sq_169i']").type("1990");
    cy.get("input[type='radio'][id*='sq_170i_2']")
      .check({ force: true })
      .should("be.checked");

    cy.get("input[type='text'][id*='sq_173i_0']").type("English\n");

    cy.get("input[type='radio'][id*='sq_175i_0']")
      .check({ force: true })
      .should("be.checked");

    cy.get("input[type='radio'][id*='sq_176i_0']")
      .check({ force: true })
      .should("be.checked");

    cy.get("input[type='text'][id*='sq_178i_0']").type("Algeria\n");
    cy.get("input[type='button'][value='Complete']").click();
  });
});
