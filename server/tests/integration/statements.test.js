const request = require("supertest");
const app = require("../../server");
const db = require("../../models");

describe("Statements Route Integration", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    const statementSeed = [6, 149, 901, 2009, 2904, 3621];
    for (const id of statementSeed) {
      await db.statements.create({
        id,
        statement: `Statement ${id}`,
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
        published: true,
      });
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it("GET /api/statements should return base configured statements only", async () => {
    const response = await request(app).get("/api/statements");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const ids = response.body.map((row) => row.id).sort((a, b) => a - b);
    expect(ids).toEqual([6, 149, 2009, 2904, 3621]);
    expect(ids).not.toContain(901);
  });

  it("GET /api/statements/byid/:id should return exact statement for valid id", async () => {
    const response = await request(app).get("/api/statements/byid/901");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].statement).toBe("Statement 901");
  });

  it("GET /api/statements/byid/:id should return empty array for unknown id", async () => {
    const response = await request(app).get("/api/statements/byid/999999");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("GET /api/statements/byid/:id should not allow query-style injection", async () => {
    const response = await request(app).get(
      "/api/statements/byid/901%20OR%201=1",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

});
