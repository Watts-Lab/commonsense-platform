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
