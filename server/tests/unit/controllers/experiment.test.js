const mockValidationResult = jest.fn();
const mockAnswersFindAll = jest.fn();
const mockExperimentFindOne = jest.fn();
const mockCreateExperiment = jest.fn();
const mockUpdateExperiment = jest.fn();
const mockSaveIndividualDB = jest.fn();
const mockGetStatementsWeighted = jest.fn();
const mockStringy = jest.fn((v) => JSON.stringify(v));
const mockSendMetaEvent = jest.fn();

jest.mock("express-validator", () => ({
  validationResult: (...args) => mockValidationResult(...args),
}));

jest.mock("../../../models", () => ({
  answers: { findAll: (...args) => mockAnswersFindAll(...args) },
  experiments: { findOne: (...args) => mockExperimentFindOne(...args) },
  Sequelize: { Op: { gte: Symbol("gte") } },
}));

jest.mock("../../../survey/experiments", () => []);

jest.mock("../../../survey/experiments/utils/save-experiment", () => ({
  createExperiment: (...args) => mockCreateExperiment(...args),
  updateExperiment: (...args) => mockUpdateExperiment(...args),
}));

jest.mock("../../../survey/experiments/utils/save-individual", () => ({
  saveIndividualDB: (...args) => mockSaveIndividualDB(...args),
}));

jest.mock("../../../survey/treatments/weighted-random.treatment", () => ({
  GetStatementsWeighted: (...args) => mockGetStatementsWeighted(...args),
}));

jest.mock("../../../survey/treatments/utils/id-generator", () => ({
  stringy: (value) => mockStringy(value),
}));

jest.mock("../../../controllers/meta", () => ({
  sendMetaEvent: (...args) => mockSendMetaEvent(...args),
}));

describe("experiment controller", () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    jest.resetModules();
    jest.clearAllMocks();
    mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
    mockExperimentFindOne.mockResolvedValue(null);
    mockGetStatementsWeighted.mockResolvedValue({ answer: [{ id: 1, statement: "hello" }] });
    mockCreateExperiment.mockResolvedValue({ id: 99, experimentType: "default" });
    mockUpdateExperiment.mockResolvedValue([1]);
    mockSendMetaEvent.mockResolvedValue({ ok: true });
    mockSaveIndividualDB.mockResolvedValue({ id: 1 });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returnStatements returns 400 for validation errors", async () => {
    mockValidationResult.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ msg: "sessionId is required" }],
    });

    const { returnStatements } = require("../../../controllers/experiment");
    const req = { query: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await returnStatements(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returnStatements resumes unfinished experiment when found", async () => {
    mockExperimentFindOne.mockResolvedValueOnce({
      createdAt: new Date("2026-05-20T00:00:00.000Z"),
      statementList: [
        { id: 10, statement: "s1" },
        { id: 20, statement: "s2" },
      ],
      id: 777,
      experimentType: "daily-experiment",
    });
    mockAnswersFindAll.mockResolvedValueOnce([{ statementId: 10 }]);

    const { returnStatements } = require("../../../controllers/experiment");
    const req = { query: { sessionId: "s-1" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await returnStatements(req, res);

    expect(res.json).toHaveBeenCalledWith({
      statements: [
        { id: 10, statement: "s1", answereSaved: true },
        { id: 20, statement: "s2", answereSaved: false },
      ],
      experimentId: 777,
      experimentType: "daily-experiment",
      isResumed: true,
    });
  });

  it("returnStatements creates default experiment when no active experiment exists", async () => {
    const { returnStatements } = require("../../../controllers/experiment");
    const req = { query: { sessionId: "s-2", source: "ad" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await returnStatements(req, res);

    expect(mockGetStatementsWeighted).toHaveBeenCalledWith({
      sessionId: "s-2",
      validStatementList: [],
      numberOfStatements: 15,
      language: "en",
    });
    expect(res.json).toHaveBeenCalledWith({
      statements: [{ id: 1, statement: "hello" }],
      experimentId: 99,
      experimentType: "default",
    });
  });

  it("saveIndividual persists payload and returns ok", async () => {
    const { saveIndividual } = require("../../../controllers/experiment");
    const req = {
      body: { sessionId: "sx", informationType: "demographics", experimentInfo: { a: 1 } },
      query: { source: "newsletter" },
    };
    const res = { json: jest.fn() };

    await saveIndividual(req, res);
    expect(mockSaveIndividualDB).toHaveBeenCalledWith({
      userSessionId: "sx",
      informationType: "demographics",
      experimentInfo: { a: 1 },
      urlParams: "newsletter",
      finished: true,
    });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("saveExperiment handles validation, success, and failure paths", async () => {
    const { saveExperiment } = require("../../../controllers/experiment");

    mockValidationResult.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ msg: "experimentId is required" }],
    });
    const badRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await saveExperiment({ body: {}, cookies: {}, headers: {}, session: {}, socket: {} }, badRes);
    expect(badRes.status).toHaveBeenCalledWith(400);

    mockValidationResult.mockReturnValueOnce({ isEmpty: () => true, array: () => [] });
    const okReq = {
      body: { experimentId: 123 },
      cookies: { _fbp: "fbp-1", _fbc: "fbc-1" },
      headers: {
        referer: "https://commonsensicality.org/path",
        "user-agent": "jest-agent",
        "x-forwarded-for": "8.8.8.8",
      },
      session: { ip: "1.2.3.4" },
      socket: { remoteAddress: "9.9.9.9" },
    };
    const okRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await saveExperiment(okReq, okRes);
    expect(mockUpdateExperiment).toHaveBeenCalledWith(123, { finished: true });
    expect(okRes.json).toHaveBeenCalledWith({ ok: true });

    mockUpdateExperiment.mockRejectedValueOnce(new Error("update failed"));
    mockValidationResult.mockReturnValueOnce({ isEmpty: () => true, array: () => [] });
    const failRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await saveExperiment(okReq, failRes);
    expect(failRes.status).toHaveBeenCalledWith(400);
    expect(failRes.json).toHaveBeenCalledWith({ error: "Failed to save experiment" });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error saving experiment:",
      expect.any(Error),
    );
  });
});
