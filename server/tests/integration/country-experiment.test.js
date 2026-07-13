const request = require("supertest");

// ------------------------------------------------------------------------------------
// External / environment mocks
// ------------------------------------------------------------------------------------
// Meta CAPI must never hit the network in tests.
jest.mock("../../controllers/meta", () => ({
  sendMetaEvent: jest.fn().mockResolvedValue({ success: true }),
}));

// GetStatementsWeighted uses MySQL-only `RAND()`; stub it for the SQLite test DB.
jest.mock("../../survey/treatments/weighted-random.treatment", () => ({
  GetStatementsWeighted: jest.fn().mockResolvedValue({
    answer: [{ id: 1, statement: "Mock random statement" }],
  }),
}));

// Skip the date-based daily experiment so it doesn't interfere with selection.
jest.mock("../../survey/experiments/daily.experiment", () => ({
  experimentName: "daily-experiment",
  treatments: [{ params: {}, function: jest.fn(), validity: () => true }],
  treatmentAssigner: jest.fn().mockResolvedValue(null),
}));

// GetStatementById reads statements from the DB; return the requested ids as-is
// so we can assert exactly which block was served without seeding statement text.
jest.mock("../../survey/treatments/statement-by-id.treatment", () => ({
  GetStatementById: jest.fn(async ({ ids }) => ({
    id: `ids:${ids}`,
    description: "GetStatementById (mock)",
    answer: (ids || []).map((id) => ({ id, statement: `Statement ${id}` })),
  })),
}));

const app = require("../../server");
const db = require("../../models");

// Minimal fixture mirroring how the countryblock table is populated in
// production (CSV import via TablePlus): country, countryCode, block,
// statementIds. Egypt has 5 blocks, Brazil has one (using the padded "076").
const COUNTRY_BLOCK_FIXTURE = [
  { country: "Egypt", countryCode: "818", block: 1, statementIds: [101, 102] },
  { country: "Egypt", countryCode: "818", block: 2, statementIds: [201, 202] },
  { country: "Egypt", countryCode: "818", block: 3, statementIds: [301, 302] },
  { country: "Egypt", countryCode: "818", block: 4, statementIds: [401, 402] },
  { country: "Egypt", countryCode: "818", block: 5, statementIds: [501, 502] },
  { country: "Brazil", countryCode: "076", block: 1, statementIds: [601, 602] },
];

describe("Country-targeted bundle experiment", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    await db.countryblock.bulkCreate(COUNTRY_BLOCK_FIXTURE);
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  beforeEach(async () => {
    // Clean the assignment history so round-robin starts fresh each test.
    await db.experiments.destroy({ where: {} });
    // Reset block state: re-enable any disabled blocks and zero the counters
    // (round-robin is driven by assignedCount, which persists across tests).
    await db.countryblock.update(
      { enabled: true, assignedCount: 0, completedCount: 0 },
      { where: {} }
    );
  });

  const getStatements = (query) =>
    request(app).get("/api/experiments").query(query);

  // The GET response only exposes experimentType; country/block live in the
  // saved experiment row, so read them back from the DB.
  const blockFor = async (sessionId) => {
    const row = await db.experiments.findOne({ where: { userSessionId: sessionId } });
    return row && row.experimentInfo ? row.experimentInfo.block : undefined;
  };

  it("serves a country's blocks round-robin by ISO numeric code (tc)", async () => {
    const served = [];
    for (let i = 0; i < 6; i++) {
      const sessionId = `egypt-session-${i}`;
      const res = await getStatements({ sessionId, tc: "818" }); // Egypt
      expect(res.status).toBe(200);
      expect(res.body.experimentType).toBe("country-bundle");
      served.push(await blockFor(sessionId));
    }

    // Egypt has 5 blocks: first five participants get 1..5, the sixth wraps to 1.
    expect(served).toEqual([1, 2, 3, 4, 5, 1]);
  });

  it("zero-pads the tc code so '76' and '076' both resolve (Brazil)", async () => {
    const res = await getStatements({ sessionId: "brazil-a", tc: "76" });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe("country-bundle");

    const row = await db.experiments.findOne({
      where: { userSessionId: "brazil-a" },
    });
    expect(row.experimentInfo.country).toBe("Brazil");
  });

  it("persists the assignment (country/block/urlParams) in the experiments table", async () => {
    const res = await getStatements({
      sessionId: "egypt-persist",
      tc: "818",
      bpid: "TEST123",
      bnum: "629",
      battempt: "test",
    });
    expect(res.status).toBe(200);

    const row = await db.experiments.findOne({
      where: { userSessionId: "egypt-persist" },
    });
    expect(row).not.toBeNull();
    expect(row.experimentType).toBe("country-bundle");
    expect(row.experimentInfo.country).toBe("Egypt");
    expect(row.experimentInfo.block).toBe(1);
    expect(row.finished).toBe(false);
    // URL params (bpid/bnum/battempt/tc) are saved for later export.
    expect(row.urlParams).toContain("tc");
    expect(row.urlParams).toContain("TEST123");
  });

  it("maintains assignedCount and completedCount counters instead of aggregating experiments", async () => {
    // Assign block 1 (Egypt) to a participant.
    const res = await getStatements({ sessionId: "egypt-counter", tc: "818" });
    expect(res.status).toBe(200);

    const row = await db.experiments.findOne({
      where: { userSessionId: "egypt-counter" },
    });
    const { block, countryBlockId } = row.experimentInfo;
    expect(countryBlockId).toBeDefined();

    // assignedCount should have been bumped for the chosen block.
    let cb = await db.countryblock.findByPk(countryBlockId);
    expect(cb.assignedCount).toBe(1);
    expect(cb.completedCount).toBe(0);

    // Completing the survey should bump completedCount.
    const done = await request(app)
      .post("/api/experiments/save")
      .send({ experimentId: row.id });
    expect(done.status).toBe(200);

    cb = await db.countryblock.findByPk(countryBlockId);
    expect(cb.completedCount).toBe(1);
    expect(block).toBe(cb.block);
  });

  it("does not bump assignedCount when resuming an unfinished experiment (refresh)", async () => {
    const sessionId = "egypt-refresh";

    // First request assigns a block and creates an unfinished experiment.
    const first = await getStatements({ sessionId, tc: "818" });
    expect(first.status).toBe(200);
    expect(first.body.experimentType).toBe("country-bundle");

    const row = await db.experiments.findOne({ where: { userSessionId: sessionId } });
    const { countryBlockId } = row.experimentInfo;

    const cbAfterFirst = await db.countryblock.findByPk(countryBlockId);
    expect(cbAfterFirst.assignedCount).toBe(1);

    // Simulate refreshing mid-survey several times. Each should RESUME the same
    // experiment and must NOT increment assignedCount again.
    for (let i = 0; i < 3; i++) {
      const resumed = await getStatements({ sessionId, tc: "818" });
      expect(resumed.status).toBe(200);
      expect(resumed.body.isResumed).toBe(true);
      expect(resumed.body.experimentId).toBe(row.id);
    }

    // Counter stays at 1, and no extra experiment rows were created.
    const cbAfterRefresh = await db.countryblock.findByPk(countryBlockId);
    expect(cbAfterRefresh.assignedCount).toBe(1);

    const experimentCount = await db.experiments.count({
      where: { userSessionId: sessionId },
    });
    expect(experimentCount).toBe(1);
  });

  it("skips disabled blocks when selecting", async () => {
    // Disable blocks 1 and 2 for Egypt.
    await db.countryblock.update(
      { enabled: false },
      { where: { countryCode: "818", block: [1, 2] } }
    );

    const res = await getStatements({ sessionId: "egypt-disabled", tc: "818" });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe("country-bundle");
    // Only blocks 3, 4, 5 remain eligible.
    expect([3, 4, 5]).toContain(await blockFor("egypt-disabled"));
  });

  it("falls back to the default experiment when tc is missing", async () => {
    const res = await getStatements({ sessionId: "no-country" });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).not.toBe("country-bundle");
    expect(res.body.experimentType).toBe("default");
  });

  it("falls back to the default experiment for an unsupported country code", async () => {
    const res = await getStatements({ sessionId: "unknown-country", tc: "999" });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).not.toBe("country-bundle");
    expect(res.body.experimentType).toBe("default");
  });

  it("falls back to the default experiment when a country has no enabled blocks", async () => {
    // Disable every Egyptian block.
    await db.countryblock.update(
      { enabled: false },
      { where: { countryCode: "818" } }
    );

    const res = await getStatements({ sessionId: "egypt-empty", tc: "818" });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe("default");
  });

  it("wins over other eligible experiments via its higher priority", async () => {
    // country-bundle declares priority 100; the default/other experiments are 0.
    // A valid `tc` should therefore always be served the country bundle even
    // though other experiments may also be eligible for this request.
    const experiment = require("../../survey/experiments/country.experiment");
    expect(experiment.priority).toBeGreaterThan(0);

    const res = await getStatements({ sessionId: "egypt-priority", tc: "818" });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe("country-bundle");
  });
});
