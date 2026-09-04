import request from 'supertest';
import app from '../../server';
import db from '../../db/models';

describe('Express Server API Integration Tests', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    await db.statements.create({
      id: 999,
      statement: 'This is a test statement',
      statementSource: 'Test Source',
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
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('GET /api', () => {
    it('should return stable session id for same client and different id for different clients', async () => {
      const agentA = request.agent(app);
      const agentB = request.agent(app);

      const a1 = await agentA.get('/api');
      const a2 = await agentA.get('/api');
      const b1 = await agentB.get('/api');

      expect(a1.status).toBe(200);
      expect(a2.status).toBe(200);
      expect(b1.status).toBe(200);

      expect(typeof a1.text).toBe('string');
      expect(a2.text).toBe(a1.text);
      expect(b1.text).not.toBe(a1.text);
    });

    it('regenerates the session when a different battempt shows up on the same client', async () => {
      const agent = request.agent(app);

      const first = await agent.get('/api').query({ battempt: 'attempt-1' });
      const sameAttemptAgain = await agent
        .get('/api')
        .query({ battempt: 'attempt-1' });
      const secondAttempt = await agent
        .get('/api')
        .query({ battempt: 'attempt-2' });

      expect(first.status).toBe(200);
      expect(sameAttemptAgain.status).toBe(200);
      expect(secondAttempt.status).toBe(200);

      // Same battempt on the same client -> same session (this is the
      // ordinary "resume" path, e.g. a page refresh).
      expect(sameAttemptAgain.text).toBe(first.text);
      // A different battempt on the same client (same cookie jar) must get a
      // brand-new session, not silently inherit the first attempt's.
      expect(secondAttempt.text).not.toBe(first.text);
    });

    it('does not regenerate the session for a client with no prior battempt on record', async () => {
      const agent = request.agent(app);

      const noAttempt = await agent.get('/api');
      const firstAttemptSeen = await agent
        .get('/api')
        .query({ battempt: 'attempt-1' });

      expect(noAttempt.status).toBe(200);
      expect(firstAttemptSeen.status).toBe(200);
      // No prior battempt was recorded, so seeing one for the first time
      // just starts tracking it -- it must not regenerate an ordinary
      // organic (non-Besample) visitor's session.
      expect(firstAttemptSeen.text).toBe(noAttempt.text);
    });

    it('should include baseline security headers', async () => {
      const response = await request(app).get('/api');

      expect(response.status).toBe(200);
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['content-security-policy']).toContain(
        "default-src 'self'",
      );
    });
  });

  describe('GET /api/statements/byid/:id', () => {
    it('should return the requested statement', async () => {
      const response = await request(app).get('/api/statements/byid/999');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty(
        'statement',
        'This is a test statement',
      );
    });

    it('should return empty array for unknown statement id', async () => {
      const response = await request(app).get('/api/statements/byid/123456');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/images/*', () => {
    it('should return 404 for missing static file', async () => {
      const response = await request(app).get(
        '/api/images/not-a-real-file.png',
      );

      expect(response.status).toBe(404);
    });
  });
});
