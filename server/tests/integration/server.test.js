const request = require("supertest");
const app = require("../../server");
const db = require("../../models");

describe("Express Server API Integration Tests", () => {
  
  beforeAll(async () => {
    // Sync the in-memory DB
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe("GET /api", () => {
    it("should return 200 and a session ID", async () => {
      const response = await request(app).get("/api");
      expect(response.status).toBe(200);
      expect(typeof response.text).toBe("string");
    });
  });

  describe("GET /api/statements/byid/:id", () => {
    it("should return the requested statement after we seed it", async () => {
      // Satisfying the full schema requirements
      const seed = await db.statements.create({
        id: 999,
        statement: "This is a test statement",
        statementSource: "Test Source",
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
        published: true
      });

      const response = await request(app).get(`/api/statements/byid/${seed.id}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty("statement", "This is a test statement");
    });
  });
});
