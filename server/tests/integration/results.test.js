const request = require("supertest");
const app = require("../../server");
const db = require("../../models");

describe("Results Route Integration", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    const statementSeed = [
      { id: 777, statementMedian: 1 },
      { id: 778, statementMedian: 0 },
      { id: 779, statementMedian: 1 },
      { id: 780, statementMedian: 1 },
      { id: 781, statementMedian: 1 },
      { id: 782, statementMedian: 1 },
      { id: 880, statementMedian: 1 },
      { id: 881, statementMedian: 1 },
    ];

    for (const s of statementSeed) {
      await db.statements.create({
        id: s.id,
        statement: `Statement ${s.id}`,
        statementSource: "test",
        origLanguage: "en",
        statement_zh: "zh",
        statement_ru: "ru",
        statement_pt: "pt",
        statement_ja: "ja",
        statement_hi: "hi",
        statement_fr: "fr",
        statement_es: "es",
        statement_bn: "bn",
        statement_ar: "ar",
        statementMedian: s.statementMedian,
        published: true,
      });
    }

    // Session used for /api/results metric check
    await db.answers.create({
      statementId: 777,
      statement_number: 777,
      I_agree: 1,
      I_agree_reason: "yes",
      others_agree: 1,
      others_agree_reason: "yes",
      perceived_commonsense: 1,
      sessionId: "result-session-metrics",
    });
    await db.answers.create({
      statementId: 778,
      statement_number: 778,
      I_agree: 1,
      I_agree_reason: "mixed",
      others_agree: 1,
      others_agree_reason: "mixed",
      perceived_commonsense: 0,
      sessionId: "result-session-metrics",
    });

    // Sessions used for /api/results/all (needs >=5 answers)
    for (const sid of [777, 779, 780, 781, 782]) {
      await db.answers.create({
        statementId: sid,
        statement_number: sid,
        I_agree: 1,
        I_agree_reason: "good",
        others_agree: 1,
        others_agree_reason: "good",
        perceived_commonsense: 1,
        sessionId: "result-session-you",
      });
    }

    for (const sid of [777, 779, 780, 781, 782]) {
      await db.answers.create({
        statementId: sid,
        statement_number: sid,
        I_agree: 0,
        I_agree_reason: "other",
        others_agree: 0,
        others_agree_reason: "other",
        perceived_commonsense: 0,
        sessionId: "result-session-other",
      });
    }

    // Session with <5 answers should not appear in /all
    for (const sid of [777, 779, 780, 781]) {
      await db.answers.create({
        statementId: sid,
        statement_number: sid,
        I_agree: 1,
        I_agree_reason: "short",
        others_agree: 1,
        others_agree_reason: "short",
        perceived_commonsense: 1,
        sessionId: "result-session-short",
      });
    }

    // Data used for agreementPercentage branches
    await db.answers.create({
      statementId: 880,
      statement_number: 880,
      I_agree: 0,
      others_agree: 1,
      I_agree_reason: "single",
      others_agree_reason: "single",
      perceived_commonsense: 0,
      sessionId: "ap-single",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    await db.answers.create({
      statementId: 881,
      statement_number: 881,
      I_agree: 0,
      others_agree: 0,
      I_agree_reason: "old-a",
      others_agree_reason: "old-a",
      perceived_commonsense: 0,
      sessionId: "ap-a",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    await db.answers.create({
      statementId: 881,
      statement_number: 881,
      I_agree: 1,
      others_agree: 1,
      I_agree_reason: "new-a",
      others_agree_reason: "new-a",
      perceived_commonsense: 1,
      sessionId: "ap-a",
      createdAt: new Date("2026-01-01T00:00:01.000Z"),
      updatedAt: new Date("2026-01-01T00:00:01.000Z"),
    });

    await db.answers.create({
      statementId: 881,
      statement_number: 881,
      I_agree: 0,
      others_agree: 0,
      I_agree_reason: "b",
      others_agree_reason: "b",
      perceived_commonsense: 0,
      sessionId: "ap-b",
      createdAt: new Date("2026-01-01T00:00:02.000Z"),
      updatedAt: new Date("2026-01-01T00:00:02.000Z"),
    });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it("GET /api/results should return route message", async () => {
    const response = await request(app).get("/api/results");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Result route");
  });

  it("POST /api/results should reject missing sessionId", async () => {
    const response = await request(app).post("/api/results").send({});
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("POST /api/results should return correct calculated metrics", async () => {
    const response = await request(app)
      .post("/api/results")
      .send({ sessionId: "result-session-metrics" });

    expect(response.status).toBe(200);
    expect(response.body.awareness).toBeCloseTo(1, 5);
    expect(response.body.consensus).toBeCloseTo(0.5, 5);
    expect(response.body.commonsensicality).toBeCloseTo(Math.sqrt(0.5), 5);
  });

  it("GET /api/results/all should label requester as You and exclude sessions with <5 answers", async () => {
    const response = await request(app).get(
      "/api/results/all?sessionId=result-session-you",
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    const youRow = response.body.find((row) => row.sessionId === "You");
    expect(youRow).toBeDefined();
    expect(youRow.commonsensicality).toBeCloseTo(1, 5);

    const others = response.body.filter((row) => row.sessionId !== "You");
    expect(others.length).toBeGreaterThan(0);
    expect(others[0].sessionId).toMatch(/^user\d+$/);

    const containsShort = response.body.some(
      (row) => row.sessionId === "result-session-short",
    );
    expect(containsShort).toBe(false);
  });

  it("POST /api/results/agreementPercentage should validate statementIds", async () => {
    const bad = await request(app)
      .post("/api/results/agreementPercentage")
      .send({ statementIds: "not-array" });

    expect(bad.status).toBe(400);
  });

  it("POST /api/results/agreementPercentage should return correct percentages across branches", async () => {
    const good = await request(app)
      .post("/api/results/agreementPercentage")
      .send({ statementIds: [880, 881, 999] });

    expect(good.status).toBe(200);
    expect(good.body[880]).toEqual({ I_agree: 0, others_agree: 0 });
    expect(good.body[881].I_agree).toBeCloseTo(50, 5);
    expect(good.body[881].others_agree).toBeCloseTo(50, 5);
    expect(good.body[999]).toEqual({ I_agree: 0, others_agree: 0 });
  });
});
