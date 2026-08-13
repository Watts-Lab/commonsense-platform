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
    // Some tests attribute answers to these sessions; keep runs isolated.
    cy.queryDb("DELETE FROM answers WHERE sessionId IN (?, ?)", [
      "original-survey-session-AAA",
      "new-browser-session-BBB",
    ]);
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

    // The page shows a clear on-page error (no alert popup) and offers a way
    // back to sign in -- it must NOT log the user in or redirect to dashboard.
    cy.get('[data-cy="magic-link-error"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.contains("a", "Back to sign in").should("be.visible");
    cy.url().should("not.include", "/dashboard");
    cy.window()
      .its("localStorage")
      .invoke("getItem", "user")
      .should((raw) => {
        expect(raw === null || raw === "null").to.be.true;
      });
  });

  // The whole point of accounts: a participant can take the survey anonymously,
  // sign up (tying that survey session to their email), then return later in a
  // different browser and log in. Logging in must adopt the account's ORIGINAL
  // registered session -- not the current browser's throwaway session -- so
  // their new answers merge with the old ones and their score accumulates.
  it("adopts the account's registered session on login (merges past answers)", () => {
    // The session tied to the account when they first signed up mid-survey.
    const registeredSession = "original-survey-session-AAA";
    // A different, throwaway session the returning browser currently holds.
    const newBrowserSession = "new-browser-session-BBB";
    const magicLink = "a".repeat(128); // deterministic, valid-shaped link
    // A statement that exists in the seeded DB (answers.statementId is a
    // RESTRICT foreign key, so it must reference a real statement).
    const statementId = 1;

    // Clean any leftover answers from a previous run for these sessions.
    cy.queryDb("DELETE FROM answers WHERE sessionId IN (?, ?)", [
      registeredSession,
      newBrowserSession,
    ]);

    // Simulate "took survey under session A, then signed up": a user row whose
    // sessionId is the registered survey session, with a fresh (unused) link...
    cy.queryDb(
      "INSERT INTO users (email, sessionId, magicLink, magicLinkExpired, createdAt, updatedAt) VALUES (?, ?, ?, 0, NOW(), NOW())",
      [email, registeredSession, magicLink],
    );
    // ...and an answer they gave anonymously under session A (their history).
    cy.queryDb(
      "INSERT INTO answers (statementId, I_agree, I_agree_reason, others_agree, others_agree_reason, perceived_commonsense, sessionId, createdAt, updatedAt) VALUES (?, 1, 'past', 1, 'past', 1, ?, NOW(), NOW())",
      [statementId, registeredSession],
    );

    // Open the magic link in a browser that currently has a DIFFERENT session.
    cy.visit(`http://localhost:5173/login/${email}/${magicLink}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("gdpr-consent", "accepted");
        win.localStorage.setItem("sessionId", newBrowserSession);
      },
    });

    // Login succeeds and lands on the dashboard.
    cy.url({ timeout: 15000 }).should("include", "/dashboard");

    // The browser's session is now the REGISTERED one (A), so subsequent survey
    // answers are attributed to the same account history -- not session B.
    cy.window()
      .its("localStorage")
      .invoke("getItem", "sessionId")
      .should("equal", registeredSession);

    // And the DB still holds the original session (login didn't overwrite it).
    cy.queryDb("SELECT sessionId FROM users WHERE email = ?", [email]).then(
      (rows) => {
        expect(rows[0].sessionId).to.equal(registeredSession);
      },
    );

    // Prove the actual merge end to end: submit a NEW answer exactly how the app
    // does (POST /answers with sessionId read from localStorage), then confirm
    // it landed under session A alongside the pre-existing answer -- i.e. the
    // new response accumulates into the account's history, not the throwaway B.
    cy.window()
      .its("localStorage")
      .invoke("getItem", "sessionId")
      .then((currentSessionId) => {
        cy.request("POST", "http://localhost:4000/api/answers", {
          statementId,
          I_agree: 1,
          I_agree_reason: "new",
          others_agree: 1,
          others_agree_reason: "new",
          perceived_commonsense: 1,
          origLanguage: "en",
          sessionId: currentSessionId,
        })
          .its("status")
          .should("eq", 200);
      });

    // Both the pre-existing (anonymous) answer and the brand-new one are keyed
    // to session A; nothing was orphaned under the throwaway browser session B.
    cy.queryDb("SELECT COUNT(*) AS n FROM answers WHERE sessionId = ?", [
      registeredSession,
    ]).then((rows) => {
      expect(rows[0].n, "answers merged under registered session").to.equal(2);
    });
    cy.queryDb("SELECT COUNT(*) AS n FROM answers WHERE sessionId = ?", [
      newBrowserSession,
    ]).then((rows) => {
      expect(rows[0].n, "no answers orphaned under throwaway session").to.equal(
        0,
      );
    });
  });
});
