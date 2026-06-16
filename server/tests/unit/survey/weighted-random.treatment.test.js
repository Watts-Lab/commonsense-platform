const mockQuery = jest.fn();
const mockSeededShuffle = jest.fn((rows) => rows);
const mockStringy = jest.fn(() => "weighted-id-1");

jest.mock("../../../models", () => ({
  sequelize: {
    query: (...args) => mockQuery(...args),
    QueryTypes: { SELECT: "SELECT" },
  },
}));

jest.mock("../../../survey/treatments/utils/seeded-shuffle", () => ({
  seededShuffle: (rows, seed) => mockSeededShuffle(rows, seed),
}));

jest.mock("../../../survey/treatments/utils/id-generator", () => ({
  stringy: (value) => mockStringy(value),
}));

describe("GetStatementsWeighted treatment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockResolvedValue([
      { id: 1, statement: "one" },
      { id: 2, statement: "two" },
    ]);
  });

  it("queries weighted statements with defaults", async () => {
    const { GetStatementsWeighted } = require("../../../survey/treatments/weighted-random.treatment");
    const result = await GetStatementsWeighted({ sessionId: "s1" });

    const [query, options] = mockQuery.mock.calls[0];
    expect(query).toContain("statements.statement AS statement");
    expect(options.replacements).toEqual({ sessionId: "s1", numberOfStatements: 1 });
    expect(result).toMatchObject({
      id: "weighted-id-1",
      description: "GetStatementsWeighted",
      answer: [
        { id: 1, statement: "one" },
        { id: 2, statement: "two" },
      ],
    });
  });

  it("applies valid statement filter and language mapping", async () => {
    const { GetStatementsWeighted } = require("../../../survey/treatments/weighted-random.treatment");

    await GetStatementsWeighted({
      sessionId: "s2",
      validStatementList: [10, 20],
      numberOfStatements: 2,
      language: "zh",
    });

    const [query, options] = mockQuery.mock.calls[0];
    expect(query).toContain("statements.statement_zh AS statement");
    expect(query).toContain("HAVING statements.id IN (:validStatementList)");
    expect(options.replacements).toEqual({
      sessionId: "s2",
      numberOfStatements: 2,
      validStatementList: [10, 20],
    });
  });

  it("throws for unsupported language", async () => {
    const { GetStatementsWeighted } = require("../../../survey/treatments/weighted-random.treatment");
    await expect(GetStatementsWeighted({ sessionId: "s3", language: "xx" })).rejects.toThrow(
      "An error occurred while retrieving weighted statements.",
    );
  });
});
