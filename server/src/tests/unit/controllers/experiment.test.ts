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
const releasePendingMock = jest.fn();
const creditFinishedExperimentMock = jest.fn();
const creditOnDemographicsMock = jest.fn();

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
  releasePending: (...args: unknown[]) => releasePendingMock(...args),
}));

jest.mock('../../../survey/experiments/utils/self-reported-ratings', () => ({
  isDemographicsType: (type: unknown) =>
    type === 'demographics' || type === 'demographicsLongInternational',
  creditFinishedExperiment: (...args: unknown[]) =>
    creditFinishedExperimentMock(...args),
  creditOnDemographics: (...args: unknown[]) =>
    creditOnDemographicsMock(...args),
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
    releasePendingMock.mockResolvedValue(undefined);
    creditFinishedExperimentMock.mockResolvedValue(undefined);
    creditOnDemographicsMock.mockResolvedValue(undefined);
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

  it('returnStatements stores the CloudFront viewer country on any experiment', async () => {
    const { returnStatements } =
      await import('../../../controllers/experiment');

    const req: any = {
      query: { sessionId: 's-geo' },
      headers: { 'cloudfront-viewer-country': 'de' },
    };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await returnStatements(req, res);

    const saved = createExperimentMock.mock.calls[0][0];
    expect(saved.experimentType).toBe('default');
    expect(saved.experimentInfo.viewerCountry).toBe('DE');
  });

  it('returnStatements omits viewerCountry when the header is missing or malformed', async () => {
    const { returnStatements } =
      await import('../../../controllers/experiment');
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await returnStatements({ query: { sessionId: 's-nogeo' } } as any, res);
    await returnStatements(
      {
        query: { sessionId: 's-bad' },
        headers: { 'cloudfront-viewer-country': '<script>' },
      } as any,
      res,
    );

    for (const [saved] of createExperimentMock.mock.calls) {
      expect(saved.experimentInfo).not.toHaveProperty('viewerCountry');
    }
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

  it('saveIndividual credits self-reported country only for demographics', async () => {
    const { saveIndividual } = await import('../../../controllers/experiment');
    const info = { responses: { country_reside: 'Brazil' } };

    const res = { json: jest.fn() };
    await saveIndividual(
      {
        body: {
          sessionId: 'organic-1',
          informationType: 'demographicsLongInternational',
          experimentInfo: info,
        },
        query: {},
      } as never,
      res as never,
    );
    expect(creditOnDemographicsMock).toHaveBeenCalledWith('organic-1', info);
    expect(res.json).toHaveBeenCalledWith({ ok: true });

    creditOnDemographicsMock.mockClear();
    await saveIndividual(
      {
        body: { sessionId: 'organic-1', informationType: 'CRT' },
        query: {},
      } as never,
      { json: jest.fn() } as never,
    );
    expect(creditOnDemographicsMock).not.toHaveBeenCalled();
  });

  it('saveIndividual still responds ok when saving or crediting fails', async () => {
    const { saveIndividual } = await import('../../../controllers/experiment');
    creditOnDemographicsMock.mockRejectedValueOnce(new Error('db down'));

    const res = { json: jest.fn() };
    await saveIndividual(
      {
        body: { sessionId: 's', informationType: 'demographics' },
        query: {},
      } as never,
      res as never,
    );
    expect(res.json).toHaveBeenCalledWith({ ok: true });

    saveIndividualDBMock.mockRejectedValueOnce(new Error('insert failed'));
    const res2 = { json: jest.fn() };
    await saveIndividual(
      {
        body: { sessionId: 's', informationType: 'demographics' },
        query: {},
      } as never,
      res2 as never,
    );
    expect(res2.json).toHaveBeenCalledWith({ ok: true });
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

    expect(bumpCountryRatingsMock).toHaveBeenCalledWith('818', [1, 2, 3], true);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it('saveExperiment keeps the reservation untouched when a sweep already released it', async () => {
    const { saveExperiment } = await import('../../../controllers/experiment');

    experimentFindByPkMock.mockResolvedValueOnce({
      get: (key: string) => {
        if (key === 'experimentType') return 'besample-sampling';
        if (key === 'staleSwept') return true;
        if (key === 'experimentInfo') {
          return { countryCode: '818', params: { ids: [1] } };
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

    expect(bumpCountryRatingsMock).toHaveBeenCalledWith('818', [1], false);
  });

  it('saveExperiment only releases the reservation for a viewer-country assignment and credits self-report', async () => {
    const { saveExperiment } = await import('../../../controllers/experiment');

    const row = {
      get: (key: string) => {
        if (key === 'sessionId') return 'organic-geo';
        if (key === 'experimentType') return 'besample-sampling';
        if (key === 'experimentInfo') {
          return {
            countryCode: '276',
            countrySource: 'geo',
            params: { ids: [1, 2] },
          };
        }
        return undefined;
      },
    };
    experimentFindByPkMock.mockResolvedValue(row);
    validationResultMock.mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await saveExperiment(
      {
        body: { experimentId: 789 },
        cookies: {},
        headers: {},
        session: {},
        socket: {},
      } as never,
      res as never,
    );

    expect(bumpCountryRatingsMock).not.toHaveBeenCalled();
    expect(releasePendingMock).toHaveBeenCalledWith('276', [1, 2]);
    expect(creditFinishedExperimentMock).toHaveBeenCalledWith(
      789,
      'organic-geo',
    );
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});
