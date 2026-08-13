export {};

const findByPkMock = jest.fn();
const createDailyMock = jest.fn();
const findExperimentMock = jest.fn();
const queryMock = jest.fn();

jest.mock('../../../db/models', () => ({
  dailyexperiment: {
    findByPk: (...args: unknown[]) => findByPkMock(...args),
    create: (...args: unknown[]) => createDailyMock(...args),
  },
  experiments: {
    findOne: (...args: unknown[]) => findExperimentMock(...args),
  },
  sequelize: {
    query: (...args: unknown[]) => queryMock(...args),
  },
}));

describe('daily experiment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-22T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null when sessionId is missing', async () => {
    const dailyExperiment = (
      await import('../../../survey/experiments/daily.experiment')
    ).default;

    const result = await dailyExperiment.treatmentAssigner(
      [{ params: {}, function: jest.fn() }],
      { query: {} },
    );

    expect(result).toBeNull();
    expect(findExperimentMock).not.toHaveBeenCalled();
  });

  it('returns null when user already completed experiment today', async () => {
    findExperimentMock.mockResolvedValueOnce({ id: 1 });
    const dailyExperiment = (
      await import('../../../survey/experiments/daily.experiment')
    ).default;

    const result = await dailyExperiment.treatmentAssigner(
      [{ params: {}, function: jest.fn() }],
      { query: { sessionId: 'session-1' } },
    );

    expect(result).toBeNull();
  });

  it('uses existing daily experiment statement ids', async () => {
    findExperimentMock.mockResolvedValueOnce(null);
    findByPkMock.mockResolvedValueOnce({
      toJSON: () => ({ statementIds: [11, 12, 13] }),
    });

    const dailyExperiment = (
      await import('../../../survey/experiments/daily.experiment')
    ).default;

    const result = (await dailyExperiment.treatmentAssigner(
      [{ params: {}, function: jest.fn() }],
      { query: { sessionId: 'session-2' } },
    )) as any;

    expect(queryMock).not.toHaveBeenCalled();
    expect(result.params).toEqual({
      ids: [11, 12, 13],
      sessionId: 'session-2',
    });
  });

  it('creates new daily experiment when none exists', async () => {
    findExperimentMock.mockResolvedValueOnce(null);
    findByPkMock.mockResolvedValueOnce(null);
    queryMock.mockResolvedValueOnce([
      { statementId: 7 },
      { statementId: 8 },
      { statementId: 9 },
    ]);
    createDailyMock.mockResolvedValueOnce({
      toJSON: () => ({ statementIds: [7, 8, 9] }),
    });

    const dailyExperiment = (
      await import('../../../survey/experiments/daily.experiment')
    ).default;

    const result = (await dailyExperiment.treatmentAssigner(
      [{ params: {}, function: jest.fn() }],
      { query: { sessionId: 'session-3' } },
    )) as any;

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(createDailyMock).toHaveBeenCalledWith({
      date: '2026-05-22',
      statementIds: [7, 8, 9],
    });
    expect(result.params).toEqual({ ids: [7, 8, 9], sessionId: 'session-3' });
  });
});
