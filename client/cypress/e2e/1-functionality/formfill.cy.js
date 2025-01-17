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

      cy.get("input[type='radio'][id*='question1-1']")
        .check({ force: true })
        .should("be.checked");
      cy.get("input[type='radio'][id*=\"question2-1\"]")
        .check({ force: true })
        .should("be.checked");
      cy.get("input[type='radio'][id*='question3-2']")
        .check({ force: true })
        .should("be.checked");
      cy.get("input[type='radio'][id*=\"question4-1\"]")
        .check({ force: true })
        .should("be.checked");
      cy.get("input[type='radio'][id*='question5-1']")
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
    cy.get(`[data-name="birth_year"] input`).click().type("1990");

    // Gender
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
      `[data-name="employment_industry"] input[value="Agriculture, Forestry, Fishing, and Hunting"]`
    ).click({
      force: true,
    });

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
    cy.get(`[data-name="race_US"] input[value="Other"]`)
      .next()
      .click({ force: true });

    cy.get(`[data-name="income_US"] input[value="$50,000-$74,999"]`).click({
      force: true,
    });

    cy.get(`input[type="button"][value="Complete"]`).click({ force: true });

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
