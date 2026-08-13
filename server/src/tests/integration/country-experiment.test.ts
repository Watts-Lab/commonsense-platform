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

// Skip the date-based daily experiment so it doesn't interfere with selection.
jest.mock('../../survey/experiments/daily.experiment', () => ({
  __esModule: true,
  default: {
    experimentName: 'daily-experiment',
    treatments: [{ params: {}, function: jest.fn(), validity: () => true }],
    treatmentAssigner: jest.fn().mockResolvedValue(null),
  },
}));

// GetStatementById reads statements from the DB; return the requested ids as-is
// so we can assert exactly which block was served without seeding statement text.
jest.mock('../../survey/treatments/statement-by-id.treatment', () => ({
  GetStatementById: jest.fn(async ({ ids }: { ids: number[] }) => ({
    id: `ids:${ids}`,
    description: 'GetStatementById (mock)',
    answer: (ids || []).map((id) => ({ id, statement: `Statement ${id}` })),
  })),
}));

import app from '../../server';
import db from '../../db/models';

// Minimal fixture mirroring how the countryblock table is populated in
// production (CSV import via TablePlus): country, countryCode, block,
// statementIds. Egypt has 5 blocks, Brazil has one (using the padded "076").
const COUNTRY_BLOCK_FIXTURE = [
  { country: 'Egypt', countryCode: '818', block: 1, statementIds: [101, 102] },
  { country: 'Egypt', countryCode: '818', block: 2, statementIds: [201, 202] },
  { country: 'Egypt', countryCode: '818', block: 3, statementIds: [301, 302] },
  { country: 'Egypt', countryCode: '818', block: 4, statementIds: [401, 402] },
  { country: 'Egypt', countryCode: '818', block: 5, statementIds: [501, 502] },
  { country: 'Brazil', countryCode: '076', block: 1, statementIds: [601, 602] },
];

describe('Country-targeted bundle experiment', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    await db.countryblock.bulkCreate(COUNTRY_BLOCK_FIXTURE);
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  beforeEach(async () => {
    // Clean the assignment history so each test starts fresh.
    await db.experiments.destroy({ where: {} });
    // Reset block state: re-enable any disabled blocks and zero the counters
    // (counters persist across tests otherwise).
    await db.countryblock.update(
      { enabled: true, assignedCount: 0, completedCount: 0 },
      { where: {} },
    );
  });

  const getStatements = (query: Record<string, unknown>) =>
    request(app).get('/api/experiments').query(query);

  // The GET response only exposes experimentType; country/block live in the
  // saved experiment row, so read them back from the DB.
  const blockFor = async (sessionId: string) => {
    const row = await db.experiments.findOne({
      where: { userSessionId: sessionId },
    });
    const info = row?.get('experimentInfo') as { block?: number } | null;
    return info ? info.block : undefined;
  };

  it('advances to the next block once completed + in-flight reaches quota', async () => {
    // Simulate a nearly-full block via completedCount, leaving one slot. The
    // next participant takes the last slot (still block 1); the one after that
    // is now over quota (completed + in-flight) and advances to block 2.
    await db.countryblock.update(
      { completedCount: 9 },
      { where: { countryCode: '818', block: 1 } },
    );

    // 9 completed + 0 in-flight < 10 -> last slot goes to block 1.
    const a = await getStatements({ sessionId: 'egypt-last-slot', tc: '818' });
    expect(a.status).toBe(200);
    expect(await blockFor('egypt-last-slot')).toBe(1);

    // 9 completed + 1 in-flight (egypt-last-slot) = 10 -> block 1 full, advance.
    const b = await getStatements({ sessionId: 'egypt-overflow', tc: '818' });
    expect(b.status).toBe(200);
    expect(await blockFor('egypt-overflow')).toBe(2);
  });

  it('reserves slots for in-flight (started but unfinished) surveys', async () => {
    // No completions yet, but fill block 1 to quota with unfinished assignments.
    // The next participant must NOT get block 1 (all slots reserved).
    for (let i = 0; i < 10; i++) {
      const res = await getStatements({
        sessionId: `egypt-live-${i}`,
        tc: '818',
      });
      expect(res.status).toBe(200);
      expect(await blockFor(`egypt-live-${i}`)).toBe(1);
    }

    // 0 completed + 10 in-flight = 10 -> block 1 is fully reserved.
    const res = await getStatements({ sessionId: 'egypt-blocked', tc: '818' });
    expect(res.status).toBe(200);
    expect(await blockFor('egypt-blocked')).toBe(2);
  });

  it('reopens a slot when an in-flight survey is abandoned past the TTL', async () => {
    // Fill block 1 with 10 in-flight assignments, then age them past the TTL so
    // they no longer count as reservations. A fresh participant should get
    // block 1 again (slots reopened).
    for (let i = 0; i < 10; i++) {
      const res = await getStatements({
        sessionId: `egypt-stale-${i}`,
        tc: '818',
      });
      expect(res.status).toBe(200);
    }

    // Age every existing unfinished assignment well beyond the 30-min TTL.
    const longAgo = new Date(Date.now() - 60 * 60 * 1000);
    await db.experiments.update(
      { createdAt: longAgo },
      { where: { experimentType: 'country-bundle', finished: false } },
    );

    const res = await getStatements({ sessionId: 'egypt-fresh', tc: '818' });
    expect(res.status).toBe(200);
    // 0 completed + 0 in-flight (all expired) -> block 1 available again.
    expect(await blockFor('egypt-fresh')).toBe(1);
  });

  it("zero-pads the tc code so '76' and '076' both resolve (Brazil)", async () => {
    const res = await getStatements({ sessionId: 'brazil-a', tc: '76' });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe('country-bundle');

    const row = await db.experiments.findOne({
      where: { userSessionId: 'brazil-a' },
    });
    const info = row?.get('experimentInfo') as { country?: string };
    expect(info.country).toBe('Brazil');
  });

  it('persists the assignment (country/block/urlParams) in the experiments table', async () => {
    const res = await getStatements({
      sessionId: 'egypt-persist',
      tc: '818',
      bpid: 'TEST123',
      bnum: '629',
      battempt: 'test',
    });
    expect(res.status).toBe(200);

    const row = await db.experiments.findOne({
      where: { userSessionId: 'egypt-persist' },
    });
    expect(row).not.toBeNull();
    const info = row?.get('experimentInfo') as {
      country?: string;
      block?: number;
    };
    expect(row?.get('experimentType')).toBe('country-bundle');
    expect(info.country).toBe('Egypt');
    expect(info.block).toBe(1);
    expect(row?.get('finished')).toBe(false);
    // URL params (bpid/bnum/battempt/tc) are saved for later export.
    expect(row?.get('urlParams')).toContain('tc');
    expect(row?.get('urlParams')).toContain('TEST123');
  });

  it('maintains assignedCount and completedCount counters instead of aggregating experiments', async () => {
    // Assign block 1 (Egypt) to a participant.
    const res = await getStatements({ sessionId: 'egypt-counter', tc: '818' });
    expect(res.status).toBe(200);

    const row = await db.experiments.findOne({
      where: { userSessionId: 'egypt-counter' },
    });
    const info = row?.get('experimentInfo') as {
      block?: number;
      countryBlockId?: number;
    };
    const { block, countryBlockId } = info;
    expect(countryBlockId).toBeDefined();

    // assignedCount should have been bumped for the chosen block.
    let cb = await db.countryblock.findByPk(countryBlockId);
    expect(cb?.get('assignedCount')).toBe(1);
    expect(cb?.get('completedCount')).toBe(0);

    // Completing the survey should bump completedCount.
    const done = await request(app)
      .post('/api/experiments/save')
      .send({ experimentId: row?.get('id') });
    expect(done.status).toBe(200);

    cb = await db.countryblock.findByPk(countryBlockId);
    expect(cb?.get('completedCount')).toBe(1);
    expect(block).toBe(cb?.get('block'));
  });

  it('does not bump assignedCount when resuming an unfinished experiment (refresh)', async () => {
    const sessionId = 'egypt-refresh';

    // First request assigns a block and creates an unfinished experiment.
    const first = await getStatements({ sessionId, tc: '818' });
    expect(first.status).toBe(200);
    expect(first.body.experimentType).toBe('country-bundle');

    const row = await db.experiments.findOne({
      where: { userSessionId: sessionId },
    });
    const info = row?.get('experimentInfo') as { countryBlockId?: number };
    const { countryBlockId } = info;

    const cbAfterFirst = await db.countryblock.findByPk(countryBlockId);
    expect(cbAfterFirst?.get('assignedCount')).toBe(1);

    // Simulate refreshing mid-survey several times. Each should RESUME the same
    // experiment and must NOT increment assignedCount again.
    for (let i = 0; i < 3; i++) {
      const resumed = await getStatements({ sessionId, tc: '818' });
      expect(resumed.status).toBe(200);
      expect(resumed.body.isResumed).toBe(true);
      expect(resumed.body.experimentId).toBe(row?.get('id'));
    }

    // Counter stays at 1, and no extra experiment rows were created.
    const cbAfterRefresh = await db.countryblock.findByPk(countryBlockId);
    expect(cbAfterRefresh?.get('assignedCount')).toBe(1);

    const experimentCount = await db.experiments.count({
      where: { userSessionId: sessionId },
    });
    expect(experimentCount).toBe(1);
  });

  it('skips disabled blocks when selecting', async () => {
    // Disable blocks 1 and 2 for Egypt.
    await db.countryblock.update(
      { enabled: false },
      { where: { countryCode: '818', block: [1, 2] } },
    );

    const res = await getStatements({ sessionId: 'egypt-disabled', tc: '818' });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe('country-bundle');
    // Blocks 1 and 2 are disabled, so the lowest eligible block is 3.
    expect(await blockFor('egypt-disabled')).toBe(3);
  });

  it('falls back to the default experiment when every block is at quota', async () => {
    // Mark all Egyptian blocks as full (>= quota completions).
    await db.countryblock.update(
      { completedCount: 999 },
      { where: { countryCode: '818' } },
    );

    const res = await getStatements({ sessionId: 'egypt-full', tc: '818' });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe('default');
  });

  it('falls back to the default experiment when tc is missing', async () => {
    const res = await getStatements({ sessionId: 'no-country' });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).not.toBe('country-bundle');
    expect(res.body.experimentType).toBe('default');
  });

  it('falls back to the default experiment for an unsupported country code', async () => {
    const res = await getStatements({
      sessionId: 'unknown-country',
      tc: '999',
    });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).not.toBe('country-bundle');
    expect(res.body.experimentType).toBe('default');
  });

  it('falls back to the default experiment when a country has no enabled blocks', async () => {
    // Disable every Egyptian block.
    await db.countryblock.update(
      { enabled: false },
      { where: { countryCode: '818' } },
    );

    const res = await getStatements({ sessionId: 'egypt-empty', tc: '818' });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe('default');
  });

  it('wins over other eligible experiments via its higher priority', async () => {
    // country-bundle declares priority 100; the default/other experiments are 0.
    // A valid `tc` should therefore always be served the country bundle even
    // though other experiments may also be eligible for this request.
    const experiment = (
      await import('../../survey/experiments/country.experiment')
    ).default;
    expect(experiment.priority).toBeGreaterThan(0);

    const res = await getStatements({ sessionId: 'egypt-priority', tc: '818' });
    expect(res.status).toBe(200);
    expect(res.body.experimentType).toBe('country-bundle');
  });
});
