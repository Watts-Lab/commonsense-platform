import request from 'supertest';

jest.mock('../../controllers/emails', () => ({
  send_magic_link: jest.fn().mockResolvedValue({ ok: true }),
  send_report: jest.fn().mockResolvedValue({ ok: true }),
}));

import app from '../../server';
import db from '../../db/models';

describe('Feedbacks Route Integration', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it('POST /api/feedbacks should reject invalid payload', async () => {
    const response = await request(app).post('/api/feedbacks').send({
      type: '',
      comment: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('POST /api/feedbacks should accept valid payload', async () => {
    const response = await request(app).post('/api/feedbacks').send({
      type: 'bug',
      comment: 'This screen is confusing',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(typeof response.body.id).toBe('number');

    const created = await (db as any).feedbacks.findByPk(response.body.id);
    expect(created).not.toBeNull();
    expect(created.get('type')).toBe('bug');
    expect(created.get('comment')).toBe('This screen is confusing');
  });

  it('POST /api/feedbacks should reject type outside whitelist', async () => {
    const response = await request(app).post('/api/feedbacks').send({
      type: 'praise',
      comment: 'great',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid feedback type');
  });

  it('POST /api/feedbacks should block suspicious spam content', async () => {
    const response = await request(app).post('/api/feedbacks').send({
      type: 'idea',
      comment: 'DROP TABLE users;',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid content detected');
  });

  it('POST /api/feedbacks should apply rate limit spam filter', async () => {
    const statuses: number[] = [];

    for (let i = 0; i < 8; i += 1) {
      const res = await request(app)
        .post('/api/feedbacks')
        .send({
          type: 'idea',
          comment: `rate limit check ${i}`,
        });
      statuses.push(res.status);
    }

    expect(statuses.some((status) => status === 429)).toBe(true);
  });
});
