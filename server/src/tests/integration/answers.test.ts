import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../server';
import db from '../../db/models';

describe('Answers Route Integration', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    await db.statements.create({
      id: 501,
      statement: 'Seeded statement',
      statementSource: 'test',
      origLanguage: 'en',
      statement_zh: 'zh',
      statement_ru: 'ru',
      statement_pt: 'pt',
      statement_ja: 'ja',
      statement_hi: 'hi',
      statement_fr: 'fr',
      statement_es: 'es',
      statement_bn: 'bn',
      statement_ar: 'ar',
      published: true,
    });

    await db.statements.create({
      id: 502,
      statement: 'Second seeded statement',
      statementSource: 'test',
      origLanguage: 'en',
      statement_zh: '第二条',
      statement_ru: 'ru2',
      statement_pt: 'pt2',
      statement_ja: 'ja2',
      statement_hi: 'hi2',
      statement_fr: 'fr2',
      statement_es: 'es2',
      statement_bn: 'bn2',
      statement_ar: 'ar2',
      published: true,
    });

    await db.users.create({
      email: 'answers-user@example.com',
      sessionId: 'answers-session-1',
    });

    await db.answers.create({
      statementId: 501,
      statement_number: 501,
      I_agree: 0,
      I_agree_reason: 'older',
      others_agree: 0,
      others_agree_reason: 'older',
      perceived_commonsense: 0,
      sessionId: 'answers-session-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await db.answers.create({
      statementId: 501,
      statement_number: 501,
      I_agree: 1,
      I_agree_reason: 'newer',
      others_agree: 1,
      others_agree_reason: 'newer',
      perceived_commonsense: 1,
      sessionId: 'answers-session-1',
      createdAt: new Date('2026-01-01T00:00:01.000Z'),
      updatedAt: new Date('2026-01-01T00:00:01.000Z'),
    });

    await db.answers.create({
      statementId: 502,
      statement_number: 502,
      I_agree: 1,
      I_agree_reason: 'zh',
      others_agree: 1,
      others_agree_reason: 'zh',
      perceived_commonsense: 1,
      sessionId: 'answers-session-1',
      createdAt: new Date('2026-01-01T00:00:02.000Z'),
      updatedAt: new Date('2026-01-01T00:00:02.000Z'),
    });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it('GET /api/answers should return route message', async () => {
    const response = await request(app).get('/api/answers');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Answer route');
  });

  it('POST /api/answers should reject invalid payload', async () => {
    const response = await request(app).post('/api/answers').send({});
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('POST /api/answers should create answer with valid payload', async () => {
    const response = await request(app).post('/api/answers').send({
      statementId: 501,
      I_agree: 1,
      I_agree_reason: 'because',
      others_agree: 1,
      others_agree_reason: 'likely',
      perceived_commonsense: 1,
      clarity: 'clear',
      origLanguage: 'en',
      sessionId: 'answers-session-1',
    });

    expect(response.status).toBe(200);
    expect(response.body.statementId).toBe(501);
    expect(response.body.statement_number).toBe(501);
    expect(response.body.clarity).toBe('clear');
    expect(response.body).toHaveProperty('statementId', 501);
  });

  it('POST /api/answers/getanswers should reject missing authorization header', async () => {
    const response = await request(app)
      .post('/api/answers/getanswers')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('POST /api/answers/getanswers should return latest unique answers for valid token', async () => {
    const token = jwt.sign(
      { email: 'answers-user@example.com', sessionId: 'answers-session-1' },
      process.env.JWT_SECRET as string,
    );

    const response = await request(app)
      .post('/api/answers/getanswers')
      .set('Authorization', token)
      .send({ email: 'answers-user@example.com', language: 'en' });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);

    const statement501 = response.body.find(
      (row: any) => row.statementId === 501,
    );
    expect(statement501).toBeDefined();
    expect(statement501.I_agree_reason).toBe('because');
  });

  it('POST /api/answers/getanswers should select requested language column', async () => {
    const token = jwt.sign(
      { email: 'answers-user@example.com', sessionId: 'answers-session-1' },
      process.env.JWT_SECRET as string,
    );

    const response = await request(app)
      .post('/api/answers/getanswers')
      .set('Authorization', token)
      .send({ email: 'answers-user@example.com', language: 'zh' });

    expect(response.status).toBe(200);
    expect(response.body[0].statement.statement_zh).toBeDefined();
    expect(response.body[0].statement.statement).toBeUndefined();
  });

  it('POST /api/answers/getanswers should return no-session message when user not found', async () => {
    const token = jwt.sign(
      { email: 'missing-user@example.com', sessionId: 'missing-session' },
      process.env.JWT_SECRET as string,
    );

    const response = await request(app)
      .post('/api/answers/getanswers')
      .set('Authorization', token)
      .send({ email: 'missing-user@example.com', language: 'en' });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(false);
    expect(response.body.message).toBe('No session ID found');
  });

  it('POST /api/answers/changeanswers should add new answer for valid token', async () => {
    const token = jwt.sign(
      { email: 'answers-user@example.com', sessionId: 'answers-session-1' },
      process.env.JWT_SECRET as string,
    );

    const beforeCount = await db.answers.count({
      where: { sessionId: 'answers-session-1', statementId: 502 },
    });

    const response = await request(app)
      .post('/api/answers/changeanswers')
      .set('Authorization', token)
      .send({
        statementId: 502,
        I_agree: 0,
        I_agree_reason: 'changed',
        others_agree: 0,
        others_agree_reason: 'changed',
        perceived_commonsense: 0,
        origLanguage: 'en',
        sessionId: 'answers-session-1',
      });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.message).toBe('Answer added successfully');

    const afterCount = await db.answers.count({
      where: { sessionId: 'answers-session-1', statementId: 502 },
    });
    expect(afterCount).toBe(beforeCount + 1);
  });
});
