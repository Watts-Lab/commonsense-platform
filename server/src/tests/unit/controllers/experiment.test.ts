export {};

const validationResultMock = jest.fn();
const answersFindAllMock = jest.fn();
const experimentFindOneMock = jest.fn();
const createExperimentMock = jest.fn();
const updateExperimentMock = jest.fn();
const saveIndividualDBMock = jest.fn();
const getStatementsWeightedMock = jest.fn();
const stringyMock = jest.fn((v) => JSON.stringify(v));
const sendMetaEventMock = jest.fn();

jest.mock('express-validator', () => ({
  validationResult: (...args: unknown[]) => validationResultMock(...args),
}));

jest.mock('../../../db/models', () => ({
  answers: {
    findAll: (...args: unknown[]) => answersFindAllMock(...args),
  },
  experiments: {
    findOne: (...args: unknown[]) => experimentFindOneMock(...args),
  },
}));

jest.mock('../../../survey/experiments', () => ({
  __esModule: true,
  default: [],
}));

jest.mock('../../../survey/experiments/utils/save-experiment', () => ({
  createExperiment: (...args: unknown[]) => createExperimentMock(...args),
  updateExperiment: (...args: unknown[]) => updateExperimentMock(...args),
}));

jest.mock('../../../survey/experiments/utils/save-individual', () => ({
  saveIndividualDB: (...args: unknown[]) => saveIndividualDBMock(...args),
}));

jest.mock('../../../survey/treatments/weighted-random.treatment', () => ({
  GetStatementsWeighted: (...args: unknown[]) =>
    getStatementsWeightedMock(...args),
}));

jest.mock('../../../survey/treatments/utils/id-generator', () => ({
  stringy: (value: unknown) => stringyMock(value),
}));

jest.mock('../../../controllers/meta', () => ({
  sendMetaEvent: (...args: unknown[]) => sendMetaEventMock(...args),
}));

describe('experiment controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validationResultMock.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
    experimentFindOneMock.mockResolvedValue(null);
    getStatementsWeightedMock.mockResolvedValue({
      answer: [{ id: 1, statement: 'hello' }],
    });
    createExperimentMock.mockResolvedValue({
      get: (key: string) => (key === 'id' ? 99 : 'default'),
    });
    updateExperimentMock.mockResolvedValue([1]);
    sendMetaEventMock.mockResolvedValue({ ok: true });
    saveIndividualDBMock.mockResolvedValue({});
  });

  it('returnStatements returns 400 for validation errors', async () => {
    validationResultMock.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ msg: 'sessionId is required' }],
    });
    const { returnStatements } =
      await import('../../../controllers/experiment');

    const req: any = { query: {} };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await returnStatements(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ msg: 'sessionId is required' }],
    });
  });

  it('returnStatements resumes unfinished experiment when found', async () => {
    experimentFindOneMock.mockResolvedValueOnce({
      get: (key: string) => {
        if (key === 'createdAt') return new Date('2026-05-20T00:00:00.000Z');
        if (key === 'statementList') {
          return [
            { id: 10, statement: 's1' },
            { id: 20, statement: 's2' },
          ];
        }
        if (key === 'id') return 777;
        if (key === 'experimentType') return 'daily-experiment';
        return undefined;
      },
    });
    answersFindAllMock.mockResolvedValueOnce([
      { get: (k: string) => (k === 'statementId' ? 10 : null) },
    ]);

    const { returnStatements } =
      await import('../../../controllers/experiment');

    const req: any = { query: { sessionId: 's-1' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await returnStatements(req, res);

    expect(res.json).toHaveBeenCalledWith({
      statements: [
        { id: 10, statement: 's1', answereSaved: true },
        { id: 20, statement: 's2', answereSaved: false },
      ],
      experimentId: 777,
      experimentType: 'daily-experiment',
      isResumed: true,
    });
    expect(createExperimentMock).not.toHaveBeenCalled();
  });

  it('returnStatements creates default experiment when no active experiment exists', async () => {
    const { returnStatements } =
      await import('../../../controllers/experiment');

    const req: any = {
      query: { sessionId: 's-2', source: 'ad' },
    };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await returnStatements(req, res);

    expect(getStatementsWeightedMock).toHaveBeenCalledWith({
      sessionId: 's-2',
      validStatementList: [],
      numberOfStatements: 15,
      language: 'en',
    });
    expect(createExperimentMock).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      statements: [{ id: 1, statement: 'hello' }],
      experimentId: 99,
      experimentType: 'default',
    });
  });

  it('returnStatements returns 500 when createExperiment fails', async () => {
    createExperimentMock.mockRejectedValueOnce(new Error('insert failed'));
    const { returnStatements } =
      await import('../../../controllers/experiment');

    const req: any = { query: { sessionId: 's-3' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await returnStatements(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to create experiment',
    });
  });

  it('saveIndividual persists payload and returns ok', async () => {
    const { saveIndividual } = await import('../../../controllers/experiment');

    const req: any = {
      body: {
        sessionId: 'sx',
        informationType: 'demographics',
        experimentInfo: { a: 1 },
      },
      query: { source: 'newsletter' },
    };
    const res: any = { json: jest.fn() };

    await saveIndividual(req, res);

    expect(saveIndividualDBMock).toHaveBeenCalledWith({
      userSessionId: 'sx',
      informationType: 'demographics',
      experimentInfo: { a: 1 },
      urlParams: 'newsletter',
      finished: true,
    });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it('saveExperiment handles validation, success, and failure paths', async () => {
    const { saveExperiment } = await import('../../../controllers/experiment');

    const badReq: any = {
      body: {},
      cookies: {},
      headers: {},
      session: {},
      socket: {},
    };
    const badRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    validationResultMock.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ msg: 'experimentId is required' }],
    });
    await saveExperiment(badReq, badRes);
    expect(badRes.status).toHaveBeenCalledWith(400);

    const okReq: any = {
      body: { experimentId: 123 },
      cookies: { _fbp: 'fbp-1', _fbc: 'fbc-1' },
      headers: {
        referer: 'https://commonsensicality.org/path',
        'user-agent': 'jest-agent',
        'x-forwarded-for': '8.8.8.8',
      },
      session: { ip: '1.2.3.4' },
      socket: { remoteAddress: '9.9.9.9' },
    };
    const okRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    validationResultMock.mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    await saveExperiment(okReq, okRes);
    expect(updateExperimentMock).toHaveBeenCalledWith(123, { finished: true });
    expect(sendMetaEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'SurveyCompleted',
        eventId: 123,
        clientIp: '1.2.3.4',
      }),
    );
    expect(okRes.json).toHaveBeenCalledWith({ ok: true });

    updateExperimentMock.mockRejectedValueOnce(new Error('update failed'));
    const failRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    validationResultMock.mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    await saveExperiment(okReq, failRes);
    expect(failRes.status).toHaveBeenCalledWith(400);
    expect(failRes.json).toHaveBeenCalledWith({
      error: 'Failed to save experiment',
    });
  });
});
