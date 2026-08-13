import request from 'supertest';
import app from '../../server';
import db from '../../db/models';

jest.mock('../../controllers/meta', () => ({
  sendMetaEvent: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Experiment Route Validation Smoke', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it('GET /api/experiments should reject missing sessionId', async () => {
    const response = await request(app).get('/api/experiments');
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('POST /api/experiments/save should reject missing experimentId', async () => {
    const response = await request(app).post('/api/experiments/save').send({});
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});
