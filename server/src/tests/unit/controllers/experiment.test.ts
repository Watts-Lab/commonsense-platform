export {};

const validationResultMock = jest.fn();
const answersFindAllMock = jest.fn();
const experimentFindOneMock = jest.fn();
const experimentFindByPkMock = jest.fn();
const createExperimentMock = jest.fn();
const updateExperimentMock = jest.fn();
const saveIndividualDBMock = jest.fn();
const getStatementsWeightedMock = jest.fn();
const stringyMock = jest.fn((v) => JSON.stringify(v));
const sendMetaEventMock = jest.fn();
const bumpCountryRatingsMock = jest.fn();

jest.mock('express-validator', () => ({
  validationResult: (...args: unknown[]) => validationResultMock(...args),
}));

jest.mock('../../../db/models', () => ({
  answers: {
    findAll: (...args: unknown[]) => answersFindAllMock(...args),
  },
  experiments: {
    findOne: (...args: unknown[]) => experimentFindOneMock(...args),
    findByPk: (...args: unknown[]) => experimentFindByPkMock(...args),
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

jest.mock('../../../survey/experiments/utils/besample-matrix', () => ({
  bumpCountryRatings: (...args: unknown[]) => bumpCountryRatingsMock(...args),
}));

describe('experiment controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validationResultMock.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
    experimentFindOneMock.mockResolvedValue(null);
    experimentFindByPkMock.mockResolvedValue(null);
    getStatementsWeightedMock.mockResolvedValue({
      answer: [{ id: 1, statement: 'hello' }],
    });
    createExperimentMock.mockResolvedValue({
      get: (key: string) => (key === 'id' ? 99 : 'default'),
    });
    updateExperimentMock.mockResolvedValue([1]);
    sendMetaEventMock.mockResolvedValue({ ok: true });
    saveIndividualDBMock.mockResolvedValue({});
    bumpCountryRatingsMock.mockResolvedValue(undefined);
    answersFindAllMock.mockResolvedValue([]);
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
      sessionId: 'sx',
      informationType: 'demographics',
      experimentInfo: { a: 1 },
      urlParams: 'newsletter',
      finished: true,
    });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it('saveIndividual bumps country ratings for an organic participant self-reporting a tracked country', async () => {
    const { saveIndividual } = await import('../../../controllers/experiment');

    experimentFindOneMock.mockResolvedValueOnce(null); // no besample-sampling row for this session
    answersFindAllMock.mockResolvedValueOnce([
      { get: (k: string) => (k === 'statementId' ? 10 : null) },
      { get: (k: string) => (k === 'statementId' ? 20 : null) },
    ]);

    const req: any = {
      body: {
        sessionId: 'organic-1',
        informationType: 'demographics',
        experimentInfo: { responses: { country_reside: 'Brazil' } },
      },
      query: {},
    };
    const res: any = { json: jest.fn() };

    await saveIndividual(req, res);
    // The country-bump logic is fire-and-forget; flush microtasks so it runs.
    await new Promise((resolve) => setImmediate(resolve));

    expect(experimentFindOneMock).toHaveBeenCalledWith({
      where: { sessionId: 'organic-1', experimentType: 'besample-sampling' },
    });
    expect(bumpCountryRatingsMock).toHaveBeenCalledWith('076', [10, 20]);
  });

  it('saveIndividual skips the country bump when a besample-sampling row already exists for the session', async () => {
    const { saveIndividual } = await import('../../../controllers/experiment');

    experimentFindOneMock.mockResolvedValueOnce({ id: 1 });

    const req: any = {
      body: {
        sessionId: 'already-besample',
        informationType: 'demographics',
        experimentInfo: { responses: { country_reside: 'Brazil' } },
      },
      query: {},
    };
    const res: any = { json: jest.fn() };

    await saveIndividual(req, res);
    await new Promise((resolve) => setImmediate(resolve));

    expect(bumpCountryRatingsMock).not.toHaveBeenCalled();
  });

  it('saveIndividual does not bump ratings when self-reported country is untracked', async () => {
    const { saveIndividual } = await import('../../../controllers/experiment');

    experimentFindOneMock.mockResolvedValueOnce(null);

    const req: any = {
      body: {
        sessionId: 'organic-2',
        informationType: 'demographics',
        experimentInfo: { responses: { country_reside: 'France' } },
      },
      query: {},
    };
    const res: any = { json: jest.fn() };

    await saveIndividual(req, res);
    await new Promise((resolve) => setImmediate(resolve));

    expect(bumpCountryRatingsMock).not.toHaveBeenCalled();
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

  it('saveExperiment bumps country ratings for a finished besample-sampling assignment', async () => {
    const { saveExperiment } = await import('../../../controllers/experiment');

    experimentFindByPkMock.mockResolvedValueOnce({
      get: (key: string) => {
        if (key === 'experimentType') return 'besample-sampling';
        if (key === 'experimentInfo') {
          return { countryCode: '818', params: { ids: [1, 2, 3] } };
        }
        return undefined;
      },
    });
    validationResultMock.mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    const req: any = {
      body: { experimentId: 456 },
      cookies: {},
      headers: {},
      session: {},
      socket: {},
    };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await saveExperiment(req, res);

    expect(bumpCountryRatingsMock).toHaveBeenCalledWith('818', [1, 2, 3]);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});
