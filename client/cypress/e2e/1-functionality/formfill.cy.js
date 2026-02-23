/// <reference types="cypress" />

describe("fill out the survay", () => {
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

      // Check if it's the 15th iteration and select the "Finish" button (it says "Continue")
      if (i === numberOfIterations - 1) {
        cy.contains("button", "Continue").click({ force: true });
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
    // SurveyJS IDs are dynamic, so we use the stable name prefix 'rme_item'
    const rmeItemPrefixes = [
      "rme_item_2",    // Just examples or generic matching if we know the names, 
      "rme_item_4",    // but better to just find the visible radio on the page.
      "rme_item_6",    
      "rme_item_11",   
      "rme_item_15",   
      "rme_item_17",   
      "rme_item_22",   
      "rme_item_24",   
      "rme_item_27",   
      "rme_item_28",   
    ]; // There are 10 questions in RmeTen normally, but it could be 10 iterations

    for (let j = 0; j < 10; j++) {
      // Find the first radio input on the current page and check it
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

    // Check if the form is submitted
    cy.intercept("http://localhost:4000/api/results").as("resultData");

    cy.get(`input[type="button"][value="Complete"]`).click({ force: true });

    cy.wait("@resultData").its("response.statusCode").should("equal", 200);

    cy.wait(2000); // Wait for 1 second before selecting the radio button

    cy.get('[data-cy="commonsense-score"]')
      .invoke("text")
      .then(parseFloat)
      .should("be.gt", 0);
  });
});
