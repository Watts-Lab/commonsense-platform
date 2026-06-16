const mockFindByPk = jest.fn();
const mockCreateDaily = jest.fn();
const mockFindExperiment = jest.fn();
const mockQuery = jest.fn();

jest.mock("../../../models", () => ({
  dailyexperiment: {
    findByPk: (...args) => mockFindByPk(...args),
    create: (...args) => mockCreateDaily(...args),
  },
  experiments: {
    findOne: (...args) => mockFindExperiment(...args),
  },
  sequelize: {
    query: (...args) => mockQuery(...args),
    QueryTypes: { SELECT: "SELECT" },
  },
}));

describe("daily experiment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-22T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns null when sessionId is missing", async () => {
    const dailyExperiment = require("../../../survey/experiments/daily.experiment");
    const result = await dailyExperiment.treatmentAssigner([{ params: {}, function: jest.fn() }], { query: {} });
    expect(result).toBeNull();
  });

  it("returns null when user already completed experiment today", async () => {
    mockFindExperiment.mockResolvedValueOnce({ id: 1 });
    const dailyExperiment = require("../../../survey/experiments/daily.experiment");
    const result = await dailyExperiment.treatmentAssigner(
      [{ params: {}, function: jest.fn() }],
      { query: { sessionId: "session-1" } },
    );
    expect(result).toBeNull();
  });

  it("uses existing daily experiment statement ids", async () => {
    mockFindExperiment.mockResolvedValueOnce(null);
    mockFindByPk.mockResolvedValueOnce({ statementIds: [11, 12, 13] });

    const dailyExperiment = require("../../../survey/experiments/daily.experiment");
    const result = await dailyExperiment.treatmentAssigner(
      [{ params: {}, function: jest.fn() }],
      { query: { sessionId: "session-2" } },
    );

    expect(result.params).toEqual({ ids: [11, 12, 13], sessionId: "session-2" });
  });

  it("creates new daily experiment when none exists", async () => {
    mockFindExperiment.mockResolvedValueOnce(null);
    mockFindByPk.mockResolvedValueOnce(null);
    mockQuery.mockResolvedValueOnce([{ statementId: 7 }, { statementId: 8 }, { statementId: 9 }]);
    mockCreateDaily.mockResolvedValueOnce({ statementIds: [7, 8, 9] });

    const dailyExperiment = require("../../../survey/experiments/daily.experiment");
    const result = await dailyExperiment.treatmentAssigner(
      [{ params: {}, function: jest.fn() }],
      { query: { sessionId: "session-3" } },
    );

    expect(mockCreateDaily).toHaveBeenCalledWith({ date: "2026-05-22", statementIds: [7, 8, 9] });
    expect(result.params).toEqual({ ids: [7, 8, 9], sessionId: "session-3" });
  });
});
