import request from 'supertest';

// ------------------------------------------------------------------------------------
// External / environment mocks
// ------------------------------------------------------------------------------------
// Meta CAPI must never hit the network in tests.
jest.mock('../../controllers/meta', () => ({
  sendMetaEvent: jest.fn().mockResolvedValue({ success: true }),
}));

// GetStatementsWeighted uses MySQL-only `RAND()`; stub it for the SQLite test DB.
jest.mock('../../survey/treatments/weighted-random.treatment', () => ({
  GetStatementsWeighted: jest.fn().mockResolvedValue({
    answer: [{ id: 1, statement: 'Mock random statement' }],
  }),
}));

// Skip the date-based daily experiment so it doesn't interfere with these
// besample-focused assertions (its own behavior is covered separately).
jest.mock('../../survey/experiments/daily.experiment', () => ({
  __esModule: true,
  default: {
    experimentName: 'daily-experiment',
    treatments: [{ params: {}, function: jest.fn(), validity: () => true }],
    treatmentAssigner: jest.fn().mockResolvedValue(null),
  },
}));

// GetStatementById reads statements from the DB; return the requested ids as-is
// so we can assert exactly which active set was served without seeding text.
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

const STATEMENT_FIXTURE = {
  statementSource: 'test',
  origLanguage: 'en',
  published: true,
};

describe('Besample dynamic-frontier country experiment', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  beforeEach(async () => {
    await db.experiments.destroy({ where: {} });
    await db.statementcountryratings.destroy({ where: {} });
    await db.statements.destroy({ where: {} });
    // The global row-priority order is cached in-process (see
    // besample-matrix.ts); force a recompute against each test's own fixtures.
    _resetGlobalOrderCacheForTests();
  });

  const getStatements = (query: Record<string, unknown>) =>
    request(app).get('/api/experiments').query(query);

  const experimentInfoFor = async (sessionId: string) => {
    const row = await db.experiments.findOne({ where: { sessionId } });
    return row?.get('experimentInfo') as
      { countryCode?: string; params?: { ids?: number[] } } | undefined;
  };

  const seedStatements = async (n: number) =>
    db.statements.bulkCreate(
      Array.from({ length: n }, (_, i) => ({
        ...STATEMENT_FIXTURE,
        statement: `Statement ${i + 1}`,
      })),
    );

  it('assigns the highest row-priority, not-yet-filled statements for the resolved country', async () => {
    const created = await seedStatements(5);
    const ids = created.map((row) => row.get('id') as number);
    const [s1, s2] = ids;

    // Egypt: s1 near threshold (remaining 1), s2 already filled (remaining 0).
    // The rest are untouched (remaining 10). Every other tracked country has
    // no row at all -> remaining 10 there too.
    await db.statementcountryratings.bulkCreate([
      { statementId: s1, countryCode: '818', confirmedCount: 9 },
      { statementId: s2, countryCode: '818', confirmedCount: 10 },
    ]);

    const res = await getStatements({ sessionId: 'egypt-a', tc: '818' });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe('besample-sampling');

    const info = await experimentInfoFor('egypt-a');
    expect(info?.countryCode).toBe('818');
    // s2 is filled for Egypt -> excluded. s1 (lowest remaining global rank
    // among Egypt-eligible statements) comes first.
    expect(info?.params?.ids?.[0]).toBe(s1);
    expect(info?.params?.ids).not.toContain(s2);
  });

  it("zero-pads the tc code so '76' resolves to Brazil", async () => {
    await seedStatements(1);

    const res = await getStatements({ sessionId: 'brazil-a', tc: '76' });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe('besample-sampling');

    const info = await experimentInfoFor('brazil-a');
    expect(info?.countryCode).toBe('076');
  });

  it('falls back to the default experiment when tc is missing', async () => {
    await seedStatements(1);

    const res = await getStatements({ sessionId: 'no-country' });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe('default');
  });

  it('falls back to the default experiment for an untracked country code', async () => {
    await seedStatements(1);

    const res = await getStatements({ sessionId: 'untracked', tc: '250' }); // France
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe('default');
  });

  it("falls back to the default experiment once a country's queue is fully drained", async () => {
    const created = await seedStatements(2);
    await db.statementcountryratings.bulkCreate(
      created.map((row) => ({
        statementId: row.get('id') as number,
        countryCode: '818',
        confirmedCount: 10,
      })),
    );

    const res = await getStatements({ sessionId: 'egypt-full', tc: '818' });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe('default');
  });

  it('reserves an in-flight statement so a concurrent session does not also get it', async () => {
    const [row] = await seedStatements(1);
    const statementId = row.get('id') as number;
    await db.statementcountryratings.create({
      statementId,
      countryCode: '818',
      confirmedCount: 9, // remaining 1
    });

    const first = await getStatements({ sessionId: 'egypt-first', tc: '818' });
    expect(first.status).toBe(200);
    expect(first.body.experimentType).toBe('besample-sampling');
    expect((await experimentInfoFor('egypt-first'))?.params?.ids).toEqual([
      statementId,
    ]);

    // The only Egypt-eligible statement is now reserved (pending) by the
    // first, still-unfinished session -> a second session gets nothing for
    // Egypt and falls back to default.
    const second = await getStatements({
      sessionId: 'egypt-second',
      tc: '818',
    });
    expect(second.status).toBe(200);
    expect(second.body.experimentType).toBe('default');
  });

  it('reopens a reservation once the in-flight session times out (45 min)', async () => {
    const [row] = await seedStatements(1);
    const statementId = row.get('id') as number;
    await db.statementcountryratings.create({
      statementId,
      countryCode: '818',
      confirmedCount: 9,
    });

    const first = await getStatements({ sessionId: 'egypt-stale', tc: '818' });
    expect(first.status).toBe(200);
    expect(first.body.experimentType).toBe('besample-sampling');

    // Age the unfinished assignment well past the 45-minute session TTL.
    const longAgo = new Date(Date.now() - 60 * 60 * 1000);
    await db.experiments.update(
      { createdAt: longAgo },
      { where: { experimentType: 'besample-sampling', finished: false } },
    );

    const second = await getStatements({ sessionId: 'egypt-fresh', tc: '818' });
    expect(second.status).toBe(200);
    expect(second.body.experimentType).toBe('besample-sampling');
    expect((await experimentInfoFor('egypt-fresh'))?.params?.ids).toEqual([
      statementId,
    ]);
  });

  it('bumps confirmedCount for the assigned statements once the survey finishes', async () => {
    const [row] = await seedStatements(1);
    const statementId = row.get('id') as number;
    await db.statementcountryratings.create({
      statementId,
      countryCode: '818',
      confirmedCount: 9,
    });

    const assigned = await getStatements({
      sessionId: 'egypt-complete',
      tc: '818',
    });
    expect(assigned.status).toBe(200);

    const experimentRow = await db.experiments.findOne({
      where: { sessionId: 'egypt-complete' },
    });

    const done = await request(app)
      .post('/api/experiments/save')
      .send({ experimentId: experimentRow?.get('id') });
    expect(done.status).toBe(200);

    const rating = await db.statementcountryratings.findOne({
      where: { statementId, countryCode: '818' },
    });
    expect(rating?.get('confirmedCount')).toBe(10);
  });

  it('does not bump assignedCount/reservation twice when resuming an unfinished experiment', async () => {
    const [row] = await seedStatements(1);
    const statementId = row.get('id') as number;
    await db.statementcountryratings.create({
      statementId,
      countryCode: '818',
      confirmedCount: 9,
    });

    const sessionId = 'egypt-refresh';
    const first = await getStatements({ sessionId, tc: '818' });
    expect(first.body.experimentType).toBe('besample-sampling');

    const resumed = await getStatements({ sessionId, tc: '818' });
    expect(resumed.body.isResumed).toBe(true);

    const experimentCount = await db.experiments.count({
      where: { sessionId },
    });
    expect(experimentCount).toBe(1);
  });
});
