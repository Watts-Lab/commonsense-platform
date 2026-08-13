export {};

const findAllMock = jest.fn();
const seededShuffleMock = jest.fn((rows, _seed) => rows);
const stringyMock = jest.fn((_value) => 'id-123');

jest.mock('../../../db/models', () => ({
  statements: {
    findAll: (...args: unknown[]) => findAllMock(...args),
  },
}));

jest.mock('../../../survey/treatments/utils/seeded-shuffle', () => ({
  seededShuffle: (rows: unknown[], seed: string) =>
    seededShuffleMock(rows, seed),
}));

jest.mock('../../../survey/treatments/utils/id-generator', () => ({
  stringy: (value: unknown) => stringyMock(value),
}));

describe('GetStatementById treatment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findAllMock.mockResolvedValue([
      { toJSON: () => ({ id: 1, statement: 'one' }) },
      { toJSON: () => ({ id: 2, statement: 'two' }) },
    ]);
  });

  it('throws when ids are missing', async () => {
    const { GetStatementById } =
      await import('../../../survey/treatments/statement-by-id.treatment');
    await expect(GetStatementById({} as any)).rejects.toThrow(
      'Missing required parameter: ids',
    );
    await expect(GetStatementById({ ids: [] })).rejects.toThrow(
      'Missing required parameter: ids',
    );
  });

  it('uses localized statement column and deterministic id', async () => {
    const { GetStatementById } =
      await import('../../../survey/treatments/statement-by-id.treatment');

    const result = await GetStatementById({ ids: [1, 2], language: 'fr' });

    expect(findAllMock).toHaveBeenCalledWith({
      where: { id: [1, 2] },
      attributes: ['id', ['statement_fr', 'statement']],
    });
    expect(result).toMatchObject({
      id: 'id-123',
      description: 'GetStatementById',
      answer: [
        { id: 1, statement: 'one' },
        { id: 2, statement: 'two' },
      ],
    });
  });

  it('shuffles when sessionId is provided', async () => {
    seededShuffleMock.mockReturnValueOnce([{ id: 2, statement: 'two' }]);

    const { GetStatementById } =
      await import('../../../survey/treatments/statement-by-id.treatment');

    const result = await GetStatementById({
      ids: [1, 2],
      language: 'unknown',
      sessionId: 'session-1',
    });

    expect(findAllMock).toHaveBeenCalledWith({
      where: { id: [1, 2] },
      attributes: ['id', ['statement', 'statement']],
    });
    expect(seededShuffleMock).toHaveBeenCalledWith(
      [
        { id: 1, statement: 'one' },
        { id: 2, statement: 'two' },
      ],
      'session-1',
    );
    expect(result.answer).toEqual([{ id: 2, statement: 'two' }]);
  });
});
