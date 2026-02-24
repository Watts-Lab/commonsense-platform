const request = require("supertest");
const app = require("../../server"); // Imports the app
const db = require("../../models");

// ------------------------------------------------------------------------------------
// We mock external APIs (like Meta) so our tests don't make real internet requests
// ------------------------------------------------------------------------------------
jest.mock("../../controllers/meta", () => ({
  sendMetaEvent: jest.fn().mockResolvedValue({ success: true }),
}));

// We mock this specific function because its raw SQL uses `RAND()` which is MySQL-only.
// Our test DB uses SQLite (which uses `RANDOM()`), so we mock the result to avoid throwing.
jest.mock("../../survey/treatments/weighted-random.treatment", () => ({
  GetStatementsWeighted: jest.fn().mockResolvedValue({
    answer: [{ id: 1, statement: "Mock random statement" }],
  }),
}));

describe("Experiment Route API Tests", () => {
  // ------------------------------------------------------------------------------------
  // TEST DATABASE SETUP AND TEARDOWN
  // SQLite In-Memory Database wipes and syncs at the beginning of this test file!
  // ------------------------------------------------------------------------------------
  beforeAll(async () => {
    // 1. sync({ force: true }) drops, recreate, and zeros out tables in the mapped in-memory db
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // 2. Cleanly close connection
    await db.sequelize.close();
  });

  // ------------------------------------------------------------------------------------
  // Testing a route with specific mock DB state verification!
  // ------------------------------------------------------------------------------------
  describe("POST /api/experiments/save", () => {
    
    it("should fail validation if experimentId is missing or invalid", async () => {
      const response = await request(app).post("/api/experiments/save").send({});
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should update an existing experiment and mark it finished in the database", async () => {
      // 1. MOCK SERVER STATE: Setup the specific database row we want to test!
      const newExp = await db.experiments.create({
        userSessionId: "test-session-123",
        experimentId: "params-123",
        experimentType: "default",
        experimentInfo: { data: "test" },
        statementList: [{ id: 1, statement: "Mock random statement" }],
        urlParams: null,
        finished: false, // Initially false!
      });

      expect(newExp.finished).toBe(false);

      // 2. ACTION: Fire off the router method
      const response = await request(app)
        .post("/api/experiments/save")
        .send({ experimentId: newExp.id });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);

      // 3. VERIFY DB STATE: Re-query the test database specifically to check if the change persisted!
      const updatedExp = await db.experiments.findOne({ where: { id: newExp.id } });
      
      expect(updatedExp).not.toBeNull();
      expect(updatedExp.finished).toBe(true); // <--- BOOM! The API successfully flipped the database bit!
    });
  });

  // ------------------------------------------------------------------------------------
  // Testing a route behavior when looking at DB setup
  // ------------------------------------------------------------------------------------
  describe("GET /api/experiments", () => {
    it("should create a new experiment if there is no unfinished experiment", async () => {
      // Setup - make sure we have no experiments
      await db.experiments.destroy({ where: {} });

      const sessionId = "session-that-has-not-been-seen-yet";
      
      // Fire the request and catch response
      const response = await request(app).get(`/api/experiments?sessionId=${sessionId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("experimentId");
      expect(response.body.isResumed).toBeUndefined(); // It isn't resuming anything

      // Check the DB to see if `createExperiment` created a new record!
      const createdExp = await db.experiments.findOne({ 
        where: { userSessionId: sessionId } 
      });
      
      expect(createdExp).not.toBeNull();
      expect(createdExp.finished).toBe(false); // Starting off unfinished
    });

    it("should retrieve an unfinished experiment from the database instead of creating a new one", async () => {
      // Setup - pre-insert an unfinished experiment in DB
      const existingExp = await db.experiments.create({
        userSessionId: "session-resume-123",
        experimentId: "params-123",
        experimentType: "default",
        experimentInfo: { data: "test" },
        statementList: [{ id: 55, statement: "Previously generated test statement" }],
        urlParams: null,
        finished: false,
      });

      // Fire API Request with same session ID
      const response = await request(app).get(`/api/experiments?sessionId=session-resume-123`);
      
      expect(response.status).toBe(200);
      // Let's assert that the returned experimentID matches the one we pre-inserted
      expect(response.body.experimentId).toBe(existingExp.id);
      expect(response.body.isResumed).toBe(true); // Should signal it was resumed!
    });
  });

});
