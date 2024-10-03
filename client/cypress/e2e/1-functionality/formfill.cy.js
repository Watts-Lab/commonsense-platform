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

      cy.get("input[type='radio'][id*='question1-Yes']")
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

    cy.get("input[type='number'][id*='sq_100i']").type("1");
    cy.get("input[type='number'][id*='sq_101i']").type("1");
    cy.get("input[type='number'][id*='sq_102i']").type("1");
    cy.get("input[type='number'][id*='sq_103i']").type("1");
    cy.get("input[type='number'][id*='sq_104i']").type("1");
    cy.get("input[type='number'][id*='sq_105i']").type("1");

    cy.get("input[type='button'][value='Complete']").click();

    // Go through RME questions

    const list_of_ids = [
      "sq_107i_0",
      "sq_109i_0",
      "sq_111i_0",
      "sq_113i_0",
      "sq_115i_0",
      "sq_117i_0",
      "sq_119i_0",
      "sq_121i_0",
      "sq_123i_0",
      "sq_125i_0",
    ];

    list_of_ids.forEach((id, index) => {
      cy.get(`input[type='radio'][id*='${id}']`)
        .check({ force: true })
        .should("be.checked");
      if (index !== list_of_ids.length - 1) {
        cy.get("input[type='button'][value='Next']").click();
      } else {
        cy.get("input[type='button'][value='Complete']").click();
      }
    });

    // Fill the demographic form
    // Birth year
    cy.get("input[type='text'][id*='sq_126i']").type("1990");

    // Gender
    cy.get("input[type='radio'][id*='sq_127i_0']")
      .check({ force: true })
      .should("be.checked");

    cy.get("input[type='text'][id*='sq_129i_0']").type("Other\n", {
      force: true,
    });

    cy.get("input[type='text'][id*='sq_130i_0']").type("English\n", {
      force: true,
    });

    cy.get("input[type='radio'][id*='sq_132i_0']")
      .check({ force: true })
      .should("be.checked");

    cy.get("input[type='radio'][id*='sq_133i_0']")
      .check({ force: true })
      .should("be.checked");

    cy.get("input[type='text'][id*='sq_135i_0']").type("Algeria\n", {
      force: true,
    });

    // Check if the form is submitted
    cy.intercept("http://localhost:4000/api/results").as("resultData");

    cy.get("input[type='button'][value='Complete']").click();

    cy.wait("@resultData").its("response.statusCode").should("equal", 200);

    cy.wait(2000); // Wait for 1 second before selecting the radio button

    cy.get('[data-cy="commonsense-score"]')
      .invoke("text")
      .then(parseFloat)
      .should("be.gt", 0);
  });
});
