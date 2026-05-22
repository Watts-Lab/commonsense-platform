const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../../controllers/emails", () => ({
  send_magic_link: jest.fn().mockResolvedValue({ ok: true }),
  send_report: jest.fn().mockResolvedValue({ ok: true }),
}));

const app = require("../../server");
const db = require("../../models");
const { send_magic_link } = require("../../controllers/emails");

describe("Users Route Integration", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it("POST /api/users/enter should reject invalid email", async () => {
    const response = await request(app)
      .post("/api/users/enter")
      .send({ email: "bad-email", sessionId: "user-session-1" });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(false);
  });

  it("POST /api/users/enter should reject missing email", async () => {
    const response = await request(app)
      .post("/api/users/enter")
      .send({ sessionId: "user-session-1" });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(false);
    expect(response.body.message).toBe("All fields are required");
  });

  it("POST /api/users/enter should register a new user and send signup magic link", async () => {
    const response = await request(app).post("/api/users/enter").send({
      email: "new-user@example.com",
      sessionId: "new-user-session",
    });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.message).toBe("Click the link in the email to sign in");

    const createdUser = await db.users.findOne({
      where: { email: "new-user@example.com" },
    });
    expect(createdUser).not.toBeNull();
    expect(createdUser.sessionId).toBe("new-user-session");
    expect(typeof createdUser.magicLink).toBe("string");
    expect(createdUser.magicLink.length).toBeGreaterThan(20);
    expect(send_magic_link).toHaveBeenCalledWith(
      "new-user@example.com",
      createdUser.magicLink,
      "signup",
    );
  });

  it("POST /api/users/enter should rotate magic link for existing user without token", async () => {
    const existing = await db.users.create({
      email: "existing-user@example.com",
      sessionId: "existing-session",
      magicLink: "old-link",
      magicLinkExpired: true,
    });

    const response = await request(app).post("/api/users/enter").send({
      email: "existing-user@example.com",
      sessionId: "ignored-session",
    });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);

    const updated = await db.users.findByPk(existing.id);
    expect(updated.magicLink).not.toBe("old-link");
    expect(updated.magicLinkExpired).toBe(false);
    expect(send_magic_link).toHaveBeenCalledWith(
      "existing-user@example.com",
      updated.magicLink,
    );
  });

  it("POST /api/users/enter should verify valid magic link and set session for user missing one", async () => {
    const user = await db.users.create({
      email: "magic-user@example.com",
      sessionId: null,
      magicLink: "valid-magic-link",
      magicLinkExpired: false,
    });

    const response = await request(app).post("/api/users/enter").send({
      email: "magic-user@example.com",
      magicLink: "valid-magic-link",
      sessionId: "fresh-session-id",
    });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.message).toBe("Welcome back");
    expect(typeof response.body.token).toBe("string");
    expect(response.body.sessionId).toBe("fresh-session-id");

    const updated = await db.users.findByPk(user.id);
    expect(updated.sessionId).toBe("fresh-session-id");
    expect(updated.magicLinkExpired).toBe(true);
  });

  it("POST /api/users/enter should reject expired or incorrect magic link", async () => {
    await db.users.create({
      email: "expired-link-user@example.com",
      sessionId: "expired-session",
      magicLink: "expired-link",
      magicLinkExpired: true,
    });

    const response = await request(app).post("/api/users/enter").send({
      email: "expired-link-user@example.com",
      magicLink: "expired-link",
      sessionId: "expired-session",
    });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(false);
    expect(response.body.message).toBe("Magic link expired or incorrect");
  });

  it("POST /api/users/verify without auth should return ok=false", async () => {
    const response = await request(app).post("/api/users/verify").send({});
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(false);
  });

  it("POST /api/users/verify should return user data for valid token", async () => {
    await db.users.create({
      email: "verify-user@example.com",
      sessionId: "verify-session-1",
    });

    const token = jwt.sign(
      { email: "verify-user@example.com", sessionId: "verify-session-1" },
      process.env.JWT_SECRET,
    );

    const response = await request(app)
      .post("/api/users/verify")
      .set("Authorization", token)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.email).toBe("verify-user@example.com");
  });

  it("POST /api/users/verify should reject forged token signed with wrong secret", async () => {
    const forged = jwt.sign(
      { email: "verify-user@example.com", sessionId: "verify-session-1" },
      "wrong-secret",
    );

    const response = await request(app)
      .post("/api/users/verify")
      .set("Authorization", forged)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(false);
  });

  it("POST /api/users/deleteaccount should delete matching user for valid token", async () => {
    await db.users.create({
      email: "delete-me@example.com",
      sessionId: "delete-session",
      magicLink: "x",
      magicLinkExpired: true,
    });

    const token = jwt.sign(
      { email: "delete-me@example.com", sessionId: "delete-session" },
      process.env.JWT_SECRET,
    );

    const response = await request(app)
      .post("/api/users/deleteaccount")
      .set("Authorization", token)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);

    const user = await db.users.findOne({
      where: { email: "delete-me@example.com", sessionId: "delete-session" },
    });
    expect(user).toBeNull();
  });

  it("POST /api/users/deleteaccount should reject forged token and keep user", async () => {
    await db.users.create({
      email: "dont-delete@example.com",
      sessionId: "dont-delete-session",
      magicLink: "y",
      magicLinkExpired: false,
    });

    const forged = jwt.sign(
      { email: "dont-delete@example.com", sessionId: "dont-delete-session" },
      "wrong-secret",
    );

    const response = await request(app)
      .post("/api/users/deleteaccount")
      .set("Authorization", forged)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(false);

    const user = await db.users.findOne({
      where: {
        email: "dont-delete@example.com",
        sessionId: "dont-delete-session",
      },
    });
    expect(user).not.toBeNull();
  });
});
