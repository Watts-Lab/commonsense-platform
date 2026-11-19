import request from 'supertest';

// Same environment stubs as besample-experiment.test.ts.
jest.mock('../../controllers/meta', () => ({
  sendMetaEvent: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../../survey/treatments/weighted-random.treatment', () => ({
  GetStatementsWeighted: jest.fn().mockResolvedValue({
    answer: [{ id: 1, statement: 'Mock random statement' }],
  }),
}));

jest.mock('../../survey/experiments/daily.experiment', () => ({
  __esModule: true,
  default: {
    experimentName: 'daily-experiment',
    treatments: [{ params: {}, function: jest.fn(), validity: () => true }],
    treatmentAssigner: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('../../survey/treatments/statement-by-id.treatment', () => ({
  GetStatementById: jest.fn(async ({ ids }: { ids: number[] }) => ({
    id: `ids:${ids}`,
    description: 'GetStatementById (mock)',
    answer: (ids || []).map((id) => ({ id, statement: `Statement ${id}` })),
  })),
}));

import app from '../../server';
import db from '../../db/models';
import { _resetGlobalOrderCacheForTests } from '../../survey/experiments/utils/besample-matrix';

const FRANCE = '250';
const GERMANY = '276';
const EGYPT = '818';

describe('statementcountryratings from self-reported country', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  beforeEach(async () => {
    await db.answers.destroy({ where: {} });
    await db.individuals.destroy({ where: {} });
    await db.experiments.destroy({ where: {} });
    await db.statementcountryratings.destroy({ where: {} });
    await db.statements.destroy({ where: {} });
    _resetGlobalOrderCacheForTests();
  });

  const seedStatements = async (n: number) =>
    (
      await db.statements.bulkCreate(
        Array.from({ length: n }, (_, i) => ({
          statement: `Statement ${i + 1}`,
          statementSource: 'test',
          origLanguage: 'en',
          published: true,
        })),
      )
    ).map((row) => row.get('id') as number);

  const assign = (
    sessionId: string,
    { viewerCountry, tc }: { viewerCountry?: string; tc?: string } = {},
  ) => {
    const req = request(app)
      .get('/api/experiments')
      .query({ sessionId, ...(tc ? { tc } : {}) });
    return viewerCountry
      ? req.set('CloudFront-Viewer-Country', viewerCountry)
      : req;
  };

  const experimentFor = async (sessionId: string) => {
    const rows = await db.experiments.findAll({
      where: { sessionId },
      order: [['id', 'DESC']],
    });
    return rows[0];
  };

  const answer = (sessionId: string, statementIds: number[]) =>
    db.answers.bulkCreate(
      statementIds.map((statementId) => ({
        sessionId,
        statementId,
        I_agree: true,
        I_agree_reason: 'r',
        others_agree: true,
        others_agree_reason: 'r',
        perceived_commonsense: true,
      })),
    );

  const finish = (experimentId: unknown) =>
    request(app).post('/api/experiments/save').send({ experimentId });

  const submitDemographics = (
    sessionId: string,
    countryReside: string,
    informationType = 'demographicsLongInternational',
  ) =>
    request(app)
      .post('/api/experiments/individual')
      .send({
        sessionId,
        informationType,
        experimentInfo: { responses: { country_reside: countryReside } },
      });

  const counts = async () => {
    const rows = (await db.statementcountryratings.findAll({
      raw: true,
    })) as unknown as Array<{
      statementId: number;
      countryCode: string;
      confirmedCount: number;
      pendingCount: number;
    }>;
    return new Map(
      rows.map((row) => [
        `${row.statementId}:${row.countryCode}`,
        { confirmed: row.confirmedCount, pending: row.pendingCount },
      ]),
    );
  };

  it('counts an organic participant under their self-reported country, not their viewer country', async () => {
    const [s1, s2, s3] = await seedStatements(3);
    await assign('organic', { viewerCountry: 'DE' });
    const experiment = await experimentFor('organic');
    expect(experiment.get('experimentInfo')).toMatchObject({
      countryCode: GERMANY,
      countrySource: 'geo',
    });

    await answer('organic', [s1, s2]); // s3 left unanswered
    await submitDemographics('organic', 'France');
    await finish(experiment.get('id'));

    const after = await counts();
    expect(after.get(`${s1}:${FRANCE}`)?.confirmed).toBe(1);
    expect(after.get(`${s2}:${FRANCE}`)?.confirmed).toBe(1);
    expect(after.has(`${s3}:${FRANCE}`)).toBe(false);
    // Germany only held the reservation, now released, and gains no ratings.
    for (const id of [s1, s2, s3]) {
      expect(after.get(`${id}:${GERMANY}`)).toEqual({
        confirmed: 0,
        pending: 0,
      });
    }
  });

  it('credits when demographics arrive after the experiment finished', async () => {
    const [s1] = await seedStatements(1);
    await assign('late-demo', { viewerCountry: 'DE' });
    const experiment = await experimentFor('late-demo');
    await answer('late-demo', [s1]);

    await finish(experiment.get('id'));
    expect((await counts()).has(`${s1}:${FRANCE}`)).toBe(false);

    await submitDemographics('late-demo', 'France', 'demographics');
    expect((await counts()).get(`${s1}:${FRANCE}`)?.confirmed).toBe(1);
  });

  it('counts each experiment once, even if demographics are resubmitted', async () => {
    const [s1] = await seedStatements(1);
    await assign('resubmit', { viewerCountry: 'DE' });
    const experiment = await experimentFor('resubmit');
    await answer('resubmit', [s1]);

    await submitDemographics('resubmit', 'France');
    await finish(experiment.get('id'));
    await finish(experiment.get('id'));
    await submitDemographics('resubmit', 'France');

    expect(
      (await db.experiments.findByPk(experiment.get('id') as number))?.get(
        'selfReportCredited',
      ),
    ).toBe(true);
    expect((await counts()).get(`${s1}:${FRANCE}`)?.confirmed).toBe(1);
  });

  it("credits a returning participant's later experiment from their earlier demographics", async () => {
    const [s1, s2] = await seedStatements(2);
    await db.individuals.create({
      sessionId: 'returning',
      informationType: 'demographics',
      experimentInfo: { responses: { country_reside: 'France' } },
    });
    // A later round served by another experiment type (no demographics step).
    const later = await db.experiments.create({
      sessionId: 'returning',
      experimentId: 'x',
      experimentType: 'daily-experiment',
      statementList: [
        { id: s1, statement: 'a' },
        { id: s2, statement: 'b' },
      ],
      finished: false,
    });
    await answer('returning', [s1, s2]);

    await finish(later.get('id'));

    const after = await counts();
    expect(after.get(`${s1}:${FRANCE}`)?.confirmed).toBe(1);
    expect(after.get(`${s2}:${FRANCE}`)?.confirmed).toBe(1);
  });

  it('counts a statement once per participant across experiments', async () => {
    const [s1, s2] = await seedStatements(2);
    await db.individuals.create({
      sessionId: 'repeat',
      informationType: 'demographics',
      experimentInfo: { responses: { country_reside: 'France' } },
    });
    const makeExperiment = (ids: number[]) =>
      db.experiments.create({
        sessionId: 'repeat',
        experimentId: 'x',
        experimentType: 'daily-experiment',
        statementList: ids.map((id) => ({ id, statement: 's' })),
        finished: false,
      });
    await answer('repeat', [s1, s2]);

    await finish((await makeExperiment([s1])).get('id'));
    await finish((await makeExperiment([s1, s2])).get('id'));

    const after = await counts();
    expect(after.get(`${s1}:${FRANCE}`)?.confirmed).toBe(1);
    expect(after.get(`${s2}:${FRANCE}`)?.confirmed).toBe(1);
  });

  it('leaves Besample participants counted by tc only', async () => {
    const [s1] = await seedStatements(1);
    await assign('besample', { tc: EGYPT, viewerCountry: 'DE' });
    const experiment = await experimentFor('besample');
    await answer('besample', [s1]);

    await submitDemographics('besample', 'France');
    await finish(experiment.get('id'));

    expect((await counts()).get(`${s1}:${EGYPT}`)).toEqual({
      confirmed: 1,
      pending: 0,
    });
    const after = await counts();
    expect(after.has(`${s1}:${FRANCE}`)).toBe(false);
    expect(after.has(`${s1}:${GERMANY}`)).toBe(false);
  });

  it('counts nothing without a recognized self-reported country', async () => {
    const [s1] = await seedStatements(1);
    await assign('no-demo', { viewerCountry: 'DE' });
    await answer('no-demo', [s1]);
    await finish((await experimentFor('no-demo')).get('id'));

    await assign('unknown-country', { viewerCountry: 'DE' });
    await answer('unknown-country', [s1]);
    await submitDemographics('unknown-country', 'Atlantis');
    await finish((await experimentFor('unknown-country')).get('id'));

    const confirmed = [...(await counts()).values()].reduce(
      (sum, cell) => sum + cell.confirmed,
      0,
    );
    expect(confirmed).toBe(0);
  });

  it('skips experiments that existed before this counting (already credited)', async () => {
    const [s1] = await seedStatements(1);
    const historical = await db.experiments.create({
      sessionId: 'historical',
      experimentId: 'x',
      experimentType: 'default',
      statementList: [{ id: s1, statement: 'a' }],
      finished: true,
      selfReportCredited: true, // what the migration sets on existing rows
    });
    await answer('historical', [s1]);

    await submitDemographics('historical', 'France');
    await finish(historical.get('id'));

    expect((await counts()).has(`${s1}:${FRANCE}`)).toBe(false);
  });
});
