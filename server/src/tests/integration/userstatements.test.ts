import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../server';
import db from '../../db/models';

describe('User Statements Route Integration', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it('GET /api/userstatements should return route message', async () => {
    const response = await request(app).get('/api/userstatements');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('user statements route');
  });

  it('POST /api/userstatements/create should reject invalid payload', async () => {
    const response = await request(app)
      .post('/api/userstatements/create')
      .send({ statementText: '', statementProperties: null });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('POST /api/userstatements/create should create statement with valid token', async () => {
    const user = await (db as any).users.create({
      email: 'us-statement@example.com',
      sessionId: 'us-statement-session',
    });

    const token = jwt.sign(
      { email: 'us-statement@example.com', sessionId: 'us-statement-session' },
      process.env.JWT_SECRET as string,
    );

    const response = await request(app)
      .post('/api/userstatements/create')
      .set('Authorization', token)
      .send({
        statementText: '  People often drink water when thirsty  ',
        statementProperties: {
          behavior: true,
          everyday: true,
          figureOfSpeech: false,
          judgment: false,
          opinion: false,
          reasoning: true,
          knowledgeCategory: 'general',
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.statementText).toBe(
      'People often drink water when thirsty',
    );

    const saved = await (db as any).userstatements.findByPk(response.body.id);
    expect(saved).not.toBeNull();
    expect(saved.get('userId')).toBe(user.get('id'));
    expect(saved.get('statementProperties').knowledgeCategory).toBe('general');
  });

  it('POST /api/userstatements/create should return 500 when authorization token is missing', async () => {
    const response = await request(app)
      .post('/api/userstatements/create')
      .send({
        statementText: 'Need auth',
        statementProperties: { behavior: true },
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('No token provided');
  });

  it('POST /api/userstatements/create should reject forged token signed with wrong secret', async () => {
    const forged = jwt.sign(
      { email: 'us-statement@example.com', sessionId: 'us-statement-session' },
      'wrong-secret',
    );

    const response = await request(app)
      .post('/api/userstatements/create')
      .set('Authorization', forged)
      .send({
        statementText: 'forged token attempt',
        statementProperties: { behavior: true },
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Invalid token');
  });

  it('POST /api/userstatements/create should reject token for non-existent user', async () => {
    const token = jwt.sign(
      { email: 'no-such-user@example.com', sessionId: 'ghost-session' },
      process.env.JWT_SECRET as string,
    );

    const response = await request(app)
      .post('/api/userstatements/create')
      .set('Authorization', token)
      .send({
        statementText: 'ghost user attempt',
        statementProperties: { behavior: true },
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('User not found');
  });
});
