/// <reference types="cypress" />

// Exercises the passwordless magic-link sign up / sign in flow end to end.
//
// The app emails users a link of the form /login/:email/:magicLink and logs
// them in when they open it. There's no inbox in CI, but the link is just the
// `magicLink` column on the users row (that's what the email embeds), so we read
// it straight from the DB via cy.queryDb and visit it -- a faithful end-to-end
// exercise of the real flow without needing SMTP.
describe("magic-link authentication", () => {
  const email = "e2e-magic-link@example.com";

  // Start from a clean slate so we deterministically hit the sign-up branch
  // (new user -> register -> fresh, unexpired magic link).
  beforeEach(() => {
    cy.queryDb("DELETE FROM users WHERE email = ?", [email]);
    cy.visit("http://localhost:5173/signin", {
      onBeforeLoad(win) {
        // Dismiss the GDPR banner so it doesn't overlay the form.
        win.localStorage.setItem("gdpr-consent", "accepted");
      },
    });
  });

  afterEach(() => {
    cy.queryDb("DELETE FROM users WHERE email = ?", [email]);
  });

  it("signs a new user in via the emailed magic link", () => {
    // 1. Submit the email on the sign-in page.
    cy.get('input[type="email"]#email').type(email);
    cy.get('form').submit();

    // The form is replaced by the "check your email" notification box.
    cy.get('input[type="email"]#email').should("not.exist");

    // 2. The backend created the user with a magic link. This is exactly what
    //    the email would contain, so read it back from the DB.
    cy.queryDb(
      "SELECT magicLink, magicLinkExpired FROM users WHERE email = ?",
      [email],
    ).then((rows) => {
      expect(rows.length, "user row created on sign up").to.equal(1);
      const { magicLink, magicLinkExpired } = rows[0];
      expect(magicLink, "magic link generated").to.be.a("string").and.not.be
        .empty;
      // A freshly issued link must not be pre-expired.
      expect(magicLinkExpired === 0 || magicLinkExpired === false, "link not yet used")
        .to.be.true;

      // 3. "Click" the link from the email.
      cy.visit(`http://localhost:5173/login/${email}/${magicLink}`, {
        onBeforeLoad(win) {
          win.localStorage.setItem("gdpr-consent", "accepted");
        },
      });

      // 4a. The app verifies the link and redirects to the dashboard.
      cy.url({ timeout: 15000 }).should("include", "/dashboard");

      // 4b. A JWT session was stored client-side.
      cy.window()
        .its("localStorage")
        .invoke("getItem", "user")
        .then((raw) => {
          expect(raw, "user persisted in localStorage").to.be.a("string");
          const stored = JSON.parse(raw);
          expect(stored.email).to.equal(email);
          expect(stored.token, "JWT token issued").to.be.a("string").and.not.be
            .empty;
        });

      // 4c. The magic link is single-use: it's marked expired after login.
      cy.queryDb("SELECT magicLinkExpired FROM users WHERE email = ?", [
        email,
      ]).then((after) => {
        expect(
          after[0].magicLinkExpired === 1 || after[0].magicLinkExpired === true,
          "magic link expired after use",
        ).to.be.true;
      });
    });
  });

  it("rejects an invalid magic link", () => {
    // Create the user (and a valid link we deliberately don't use).
    cy.get('input[type="email"]#email').type(email);
    cy.get('form').submit();
    cy.get('input[type="email"]#email').should("not.exist");

    // Visiting with a bogus link must NOT log the user in.
    cy.visit(`http://localhost:5173/login/${email}/not-a-real-link`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("gdpr-consent", "accepted");
      },
    });

    // Give the verification attempt time to resolve, then confirm no session
    // was created and we're not on the dashboard.
    cy.wait(2000);
    cy.url().should("not.include", "/dashboard");
    cy.window()
      .its("localStorage")
      .invoke("getItem", "user")
      .should((raw) => {
        expect(raw === null || raw === "null").to.be.true;
      });
  });
});
