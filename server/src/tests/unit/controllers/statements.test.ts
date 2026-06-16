export {};

const queryMock = jest.fn();
const findAllMock = jest.fn();

jest.mock('../../../db/models', () => ({
  answers: {},
  statements: {
    sequelize: {
      query: (...args: unknown[]) => queryMock(...args),
    },
    findAll: (...args: unknown[]) => findAllMock(...args),
  },
}));

describe('statements controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getStatementsWeighted builds query with optional statement filter', async () => {
    queryMock.mockResolvedValueOnce([{ id: 1, statement: 'A' }]);
    const { getStatementsWeighted } =
      await import('../../../controllers/statements');

    await getStatementsWeighted('session-1', [1, 2], 2);

    const [query, options] = queryMock.mock.calls[0];
    expect(query).toContain('HAVING statements.id IN (:validStatementList)');
    expect(options.replacements).toMatchObject({
      sessionId: 'session-1',
      validStatementList: [1, 2],
      numberOfStatements: 2,
    });
  });

  it('next returns weighted statements response', async () => {
    queryMock.mockResolvedValueOnce([{ id: 5, statement: 'B' }]);
    const { next } = await import('../../../controllers/statements');

    const req: any = { query: { sessionId: 'session-x' } };
    const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await next(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 5, statement: 'B' }]);
  });

  it('next returns 500 when query fails', async () => {
    queryMock.mockRejectedValueOnce(new Error('db error'));
    const { next } = await import('../../../controllers/statements');

    const req: any = { query: {} };
    const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await next(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred' });
  });

  it('baseStatements and statementById query expected ids', async () => {
    findAllMock.mockResolvedValue([{ id: 6 }]);
    const {
      baseStatements,
      statementById,
      saveSubmitedStatements,
      getStatementFromList,
    } = await import('../../../controllers/statements');

    const res: any = { json: jest.fn() };

    await baseStatements({} as any, res);
    expect(findAllMock).toHaveBeenCalledWith({
      where: { id: [6, 149, 2009, 2904, 3621] },
    });

    await statementById({ params: { statementId: 77 } } as any, res);
    await saveSubmitedStatements({ params: { statementId: 88 } } as any, res);
    expect(findAllMock).toHaveBeenCalledWith({ where: { id: 77 } });
    expect(findAllMock).toHaveBeenCalledWith({ where: { id: 88 } });

    await getStatementFromList([10, 20]);
    expect(findAllMock).toHaveBeenCalledWith({
      where: { id: [10, 20] },
      attributes: ['id', 'statement'],
      order: expect.anything(),
    });
  });
});
