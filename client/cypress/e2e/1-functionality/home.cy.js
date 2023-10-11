/// <reference types="cypress" />

describe("fill out the survay", () => {
  beforeEach(() => {
    // go to the url
    cy.visit("http://localhost:5173/");
  });

  it("check website structure", () => {
    cy.log("checking the menu for the survey link");

    // Locate the menu element by its selector (update this selector)
    cy.get(".bm-item-list").as("menu");

    // Find all <a> links inside the menu
    cy.get("@menu").find("a").as("menuLinks").should("have.length.gt", 0); // Ensure there are links in the menu

    // Iterate through the links and click on the "participate" link

    // cy.get("@menu").contains("button", "Participate").click();
    cy.get("@menu").contains("button", "Participate").click({ force: true });

    cy.get("#concent-modal") 
    .contains("button", "Check Your Common Sense")
    .closest("a")
    .click();
  });

  
  
});
