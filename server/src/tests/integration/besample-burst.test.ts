import request from 'supertest';

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

const VISITORS = 15;
const MIN_RATINGS = 10;

describe('Besample burst of simultaneous visitors from one country', () => {
  const agent = request.agent(app);

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
    _resetGlobalOrderCacheForTests();
  });

  const assignedIds = async (sessionId: string) => {
    const row = await db.experiments.findOne({ where: { sessionId } });
    const info = row?.get('experimentInfo') as
      { params?: { ids?: number[] } } | undefined;
    return info?.params?.ids ?? [];
  };

  it('never assigns a statement to more visitors than it still needs', async () => {
    const created = await db.statements.bulkCreate(
      Array.from({ length: 45 }, (_, i) => ({
        statementSource: 'test',
        origLanguage: 'en',
        published: true,
        statement: `Statement ${i + 1}`,
      })),
    );
    const ids = created.map((row) => row.get('id') as number);

    // Egypt needs 1 more rating on the first statement, 10 on the rest.
    await db.statementcountryratings.create({
      statementId: ids[0],
      countryCode: '818',
      confirmedCount: MIN_RATINGS - 1,
    });

    const sessionIds = Array.from({ length: VISITORS }, (_, i) => `burst-${i}`);
    const responses = await Promise.all(
      sessionIds.map((sessionId) =>
        agent.get('/api/experiments').query({ sessionId, tc: '818' }),
      ),
    );
    for (const res of responses) {
      expect(res.status).toBe(200);
      expect(res.body.experimentType).toBe('besample-sampling');
    }

    const perStatement: Record<number, number> = {};
    for (const sessionId of sessionIds) {
      const assigned = await assignedIds(sessionId);
      expect(assigned).toHaveLength(15);
      for (const id of assigned) perStatement[id] = (perStatement[id] ?? 0) + 1;
    }

    const lines = Object.entries(perStatement)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([id, n]) => `statement ${id}: assigned to ${n}/${VISITORS}`);
    // eslint-disable-next-line no-console
    console.log(lines.join('\n'));

    expect(perStatement[ids[0]]).toBe(1);
    for (const id of ids.slice(1)) {
      expect(perStatement[id] ?? 0).toBeLessThanOrEqual(MIN_RATINGS);
    }
  });
});
