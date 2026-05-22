const request = require("supertest");

jest.mock("../../survey/manifest", () => ({
  treatments: Array.from({ length: 13 }, (_, i) => {
    const id = i + 1;
    if (i === 9) {
      return {
        id,
        description: "mock treatment all",
        statements: jest.fn().mockResolvedValue([{ id: 9010, statement: "all path" }]),
        statements_params: { limit: 1 },
      };
    }
    if (i === 12) {
      return {
        id,
        description: "mock treatment readspace",
        statements: jest.fn().mockResolvedValue([{ id: 9013, statement: "space path" }]),
        statements_params: { limit: 1 },
      };
    }
    return {
      id,
      description: `mock treatment ${id}`,
      statements: [{ id, statement: `mock statement ${id}` }],
      statements_params: { limit: 1 },
    };
  }),
  assignment: {},
}));

const app = require("../../server");
const db = require("../../models");

describe("Treatments Route Integration", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    for (let id = 1; id <= 13; id += 1) {
      await db.treatments.create({
        id,
        code: id,
        description: `seed treatment ${id}`,
        params: "{}",
      });
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it("GET /api/treatments should create unfinished user treatment for new session", async () => {
    const agent = request.agent(app);
    const response = await agent.get("/api/treatments?source=ad&campaign=summer");

    expect(response.status).toBe(200);
    expect(response.body.value).toBeDefined();
    expect(Array.isArray(response.body.value)).toBe(true);

    const rows = await db.usertreatments.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].finished).toBe(false);
    expect(rows[0].urlParams).toBe(
      JSON.stringify({ source: "ad", campaign: "summer" }),
    );
  });

  it("GET /api/treatments should reuse unfinished treatment for same session", async () => {
    const agent = request.agent(app);

    const first = await agent.get("/api/treatments");
    const second = await agent.get("/api/treatments");

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body.value).toEqual(first.body.value);

    const rows = await db.usertreatments.findAll();
    expect(rows).toHaveLength(2);
  });

  it("GET /api/treatments/update should mark unfinished treatment as finished", async () => {
    const agent = request.agent(app);
    await agent.get("/api/treatments");

    const beforeUnfinished = await db.usertreatments.count({
      where: { finished: false },
    });
    expect(beforeUnfinished).toBeGreaterThan(0);

    const updateResponse = await agent.get("/api/treatments/update");
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.value).toBe("success");

    const afterUnfinished = await db.usertreatments.count({
      where: { finished: false },
    });
    expect(afterUnfinished).toBeLessThan(beforeUnfinished);
  });

  it("GET /api/treatments/update should still return success when no active treatment exists", async () => {
    const response = await request(app).get("/api/treatments/update");
    expect(response.status).toBe(200);
    expect(response.body.value).toBe("success");
  });

  it("GET /api/treatments/all should return manifest treatment output", async () => {
    const response = await request(app).get("/api/treatments/all");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 9010, statement: "all path" }]);
  });

  it("GET /api/treatments/readspace should return readspace output", async () => {
    const response = await request(app).get("/api/treatments/readspace");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 9013, statement: "space path" }]);
  });
});
