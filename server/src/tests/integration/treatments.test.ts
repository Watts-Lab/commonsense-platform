import request from 'supertest';

jest.mock('../../survey/treatments/weighted-random.treatment', () => ({
  GetStatementsWeighted: jest.fn().mockResolvedValue({
    answer: [{ id: 1, statement: 'mock statement' }],
  }),
}));

import app from '../../server';
import db from '../../db/models';

describe('Treatments Route Integration', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    await db.treatments.create({
      id: 1,
      code: 1,
      description: 'seed treatment',
      params: '{}',
    });
    await db.treatments.create({
      id: 2,
      code: 2,
      description: 'seed treatment 2',
      params: '{}',
    });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it('GET /api/treatments should create unfinished user treatment for new session', async () => {
    const agent = request.agent(app);
    const response = await agent.get(
      '/api/treatments?source=ad&campaign=summer',
    );

    expect(response.status).toBe(200);
    expect(response.body.value).toBeDefined();
    expect(Array.isArray(response.body.value)).toBe(true);

    const rows = await (db as any).usertreatments.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].get('finished')).toBe(false);
    expect(rows[0].get('urlParams')).toBe(
      JSON.stringify({ source: 'ad', campaign: 'summer' }),
    );
  });

  it('GET /api/treatments should reuse unfinished treatment for same session', async () => {
    const agent = request.agent(app);

    const first = await agent.get('/api/treatments');
    const second = await agent.get('/api/treatments');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body.value).toEqual(first.body.value);

    const rows = await (db as any).usertreatments.findAll();
    expect(rows).toHaveLength(2);
  });

  it('GET /api/treatments/update should mark unfinished treatment as finished', async () => {
    const agent = request.agent(app);
    await agent.get('/api/treatments');

    const beforeUnfinished = await (db as any).usertreatments.count({
      where: { finished: false },
    });
    expect(beforeUnfinished).toBeGreaterThan(0);

    const updateResponse = await agent.get('/api/treatments/update');
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.value).toBe('success');

    const afterUnfinished = await (db as any).usertreatments.count({
      where: { finished: false },
    });
    expect(afterUnfinished).toBeLessThan(beforeUnfinished);
  });

  it('GET /api/treatments/update should still return success when no active treatment exists', async () => {
    const response = await request(app).get('/api/treatments/update');
    expect(response.status).toBe(200);
    expect(response.body.value).toBe('success');
  });

  it('GET /api/treatments/all should return all treatments', async () => {
    const response = await request(app).get('/api/treatments/all');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    expect(response.body[0].id).toBe(1);
  });

  it('GET /api/treatments/readspace should return weighted-random output', async () => {
    const response = await request(app).get('/api/treatments/readspace');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 1, statement: 'mock statement' }]);
  });
});
