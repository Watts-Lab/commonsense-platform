/// <reference types="cypress" />

describe("fill out the survey", () => {
  beforeEach(() => {
    // go to the url
    cy.visit("http://localhost:5173/");
  });

  it("check website structure", () => {
    cy.log("checking for the Participate button");

    // Wait for the button to be available to interact with
    cy.get(".navbar-end")
      .contains("button", "Participate →")
      .as("participateButton");
    cy.get("@participateButton").should("be.visible").click();

    cy.get("#concent-modal").should("be.visible");

    cy.get("#concent-modal")
      .contains("button", "Check Your Common Sense")
      .click();
    cy.url().should("include", "/statements");
  });
});
