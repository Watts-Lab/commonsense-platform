/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// Query the test database from a spec. Delegates to the `queryDb` node task
// defined in cypress.config.ts (Cypress commands run in the browser, so DB
// access has to happen in the Node process via a task).
Cypress.Commands.add(
  "queryDb",
  (sql: string, params?: unknown[]) => {
    return cy.task("queryDb", { sql, params });
  }
);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Run a SQL query against the test database and yield the resulting rows.
       * @example cy.queryDb("SELECT * FROM answers WHERE sessionId = ?", [id])
       */
      queryDb(sql: string, params?: unknown[]): Chainable<any>;
    }
  }
}

export {};