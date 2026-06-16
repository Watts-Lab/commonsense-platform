const mockQuery = jest.fn();
const mockFindAll = jest.fn();

jest.mock("sequelize", () => {
  const actual = jest.requireActual("sequelize");
  const mockSequelizeCtor = jest.fn().mockImplementation(() => ({
    query: (...args) => mockQuery(...args),
    QueryTypes: { SELECT: "SELECT" },
  }));
  mockSequelizeCtor.literal = jest.fn(() => "RAND_LITERAL");

  return {
    ...actual,
    Sequelize: mockSequelizeCtor,
  };
});

jest.mock("../../../models", () => ({
  statements: { findAll: (...args) => mockFindAll(...args) },
  statementproperties: {},
  answers: {},
}));

describe("statements controller", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockFindAll.mockResolvedValue([{ id: 6 }]);
    mockQuery.mockResolvedValue([{ id: 1, statement: "A" }]);
  });

  it("getStatementsWeighted includes optional statement list", async () => {
    const { getStatementsWeighted } = require("../../../controllers/statements");

    await getStatementsWeighted("session-1", [1, 2], 2);

    const [query, options] = mockQuery.mock.calls[0];
    expect(query).toContain("HAVING statements.id IN (:validStatementList)");
    expect(options.replacements).toMatchObject({
      sessionId: "session-1",
      validStatementList: [1, 2],
      numberOfStatements: 2,
    });
  });

  it("next returns weighted statements", async () => {
    const { next } = require("../../../controllers/statements");
    const req = { query: { sessionId: "s" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await next(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1, statement: "A" }]);
  });

  it("baseStatements, statementById, saveSubmitedStatements, getStatementFromList", async () => {
    const {
      baseStatements,
      statementById,
      saveSubmitedStatements,
      getStatementFromList,
    } = require("../../../controllers/statements");

    const res = { json: jest.fn() };
    await baseStatements({}, res);
    expect(mockFindAll).toHaveBeenCalledWith({ where: { id: [6, 149, 2009, 2904, 3621] } });

    await statementById({ params: { statementId: 77 } }, res);
    await saveSubmitedStatements({ params: { statementId: 88 } }, res);
    expect(mockFindAll).toHaveBeenCalledWith({ where: { id: 77 } });
    expect(mockFindAll).toHaveBeenCalledWith({ where: { id: 88 } });

    await getStatementFromList([10, 20]);
    expect(mockFindAll).toHaveBeenCalledWith({
      where: { id: [10, 20] },
      attributes: ["id", "statement"],
      order: expect.anything(),
    });
  });
});
