const mockFindAll = jest.fn();
const mockSeededShuffle = jest.fn((rows) => rows);
const mockStringy = jest.fn(() => "id-123");

jest.mock("../../../models", () => ({
  statements: { findAll: (...args) => mockFindAll(...args) },
}));

jest.mock("../../../survey/treatments/utils/seeded-shuffle", () => ({
  seededShuffle: (rows, seed) => mockSeededShuffle(rows, seed),
}));

jest.mock("../../../survey/treatments/utils/id-generator", () => ({
  stringy: (value) => mockStringy(value),
}));

describe("GetStatementById treatment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindAll.mockResolvedValue([
      { toJSON: () => ({ id: 1, statement: "one" }) },
      { toJSON: () => ({ id: 2, statement: "two" }) },
    ]);
  });

  it("throws when ids are missing", async () => {
    const { GetStatementById } = require("../../../survey/treatments/statement-by-id.treatment");
    await expect(GetStatementById({})).rejects.toThrow("Missing required parameter: ids");
  });

  it("uses localized statement column and deterministic id", async () => {
    const { GetStatementById } = require("../../../survey/treatments/statement-by-id.treatment");
    const result = await GetStatementById({ ids: [1, 2], language: "fr" });

    expect(mockFindAll).toHaveBeenCalledWith({
      where: { id: [1, 2] },
      attributes: ["id", ["statement_fr", "statement"]],
    });
    expect(result).toMatchObject({
      id: "id-123",
      description: "GetStatementById",
      answer: [
        { id: 1, statement: "one" },
        { id: 2, statement: "two" },
      ],
    });
  });

  it("shuffles when sessionId is provided", async () => {
    mockSeededShuffle.mockReturnValueOnce([{ id: 2, statement: "two" }]);
    const { GetStatementById } = require("../../../survey/treatments/statement-by-id.treatment");

    const result = await GetStatementById({ ids: [1, 2], sessionId: "session-1" });

    expect(mockSeededShuffle).toHaveBeenCalledWith(
      [
        { id: 1, statement: "one" },
        { id: 2, statement: "two" },
      ],
      "session-1",
    );
    expect(result.answer).toEqual([{ id: 2, statement: "two" }]);
  });
});
