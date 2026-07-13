/// <reference types="cypress" />

// Verifies the BeSample flow end to end:
//  - arriving with BeSample URL params (bpid/bnum/battempt/tc)
//  - completing the survey
//  - the reward box showing the correct completion code (bnum * bkey)
describe("BeSample completion code", () => {
  const BNUM = 629;
  // Example URL from the recruitment platform:
  // /survey?bpid=TEST123&bnum=629&battempt=test&tc=999
  const besampleQuery = `bpid=TEST123&bnum=${BNUM}&battempt=test&tc=999`;

  beforeEach(() => {
    cy.visit(`http://localhost:5173/statements?${besampleQuery}`, {
      onBeforeLoad(win) {
        // Pretend the user already accepted GDPR + consent so we land on the survey.
        win.localStorage.setItem("gdpr-consent", "accepted");
        win.localStorage.setItem("consent", "true");
      },
    });
  });

  it("shows the correct completion code (bnum * bkey) after finishing", () => {
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
      `[data-name="employment_industry"] input[value="Agriculture, Forestry, Fishing, and Hunting"]`
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

    // The BeSample reward box should render the completion code = bnum * bkey.
    const expectedCode = String(61528151); // 629 * bekey = 61528151
    cy.get('[data-cy="besample-completion-code"]')
      .should("be.visible")
      .invoke("text")
      .then((text) => text.trim())
      .should("equal", expectedCode);
  });
});
