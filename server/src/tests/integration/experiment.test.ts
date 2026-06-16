import request from 'supertest';
import app from '../../server';
import db from '../../db/models';

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

describe('Experiment Route API Tests', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /api/experiments/save', () => {
    it('should fail validation if experimentId is missing or invalid', async () => {
      const response = await request(app)
        .post('/api/experiments/save')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should update an existing experiment and mark it finished in the database', async () => {
      const newExp = await db.experiments.create({
        userSessionId: 'test-session-123',
        experimentId: 'params-123',
        experimentType: 'default',
        experimentInfo: { data: 'test' },
        statementList: [{ id: 1, statement: 'Mock random statement' }],
        urlParams: null,
        finished: false,
      });

      expect(newExp.get('finished')).toBe(false);

      const response = await request(app)
        .post('/api/experiments/save')
        .send({ experimentId: newExp.get('id') });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);

      const updatedExp = await db.experiments.findOne({
        where: { id: newExp.get('id') },
      });

      expect(updatedExp).not.toBeNull();
      expect(updatedExp?.get('finished')).toBe(true);
    });
  });

  describe('GET /api/experiments', () => {
    it('should create a new experiment if there is no unfinished experiment', async () => {
      await db.experiments.destroy({ where: {} });

      const sessionId = 'session-that-has-not-been-seen-yet';

      const response = await request(app).get(
        `/api/experiments?sessionId=${sessionId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('experimentId');
      expect(response.body.isResumed).toBeUndefined();

      const createdExp = await db.experiments.findOne({
        where: { userSessionId: sessionId },
      });

      expect(createdExp).not.toBeNull();
      expect(createdExp?.get('finished')).toBe(false);
    });

    it('should retrieve an unfinished experiment from the database instead of creating a new one', async () => {
      const existingExp = await db.experiments.create({
        userSessionId: 'session-resume-123',
        experimentId: 'params-123',
        experimentType: 'default',
        experimentInfo: { data: 'test' },
        statementList: [
          { id: 55, statement: 'Previously generated test statement' },
        ],
        urlParams: null,
        finished: false,
      });

      const response = await request(app).get(
        '/api/experiments?sessionId=session-resume-123',
      );

      expect(response.status).toBe(200);
      expect(response.body.experimentId).toBe(existingExp.get('id'));
      expect(response.body.isResumed).toBe(true);
    });

    it("should assign default experiment when user already finished today's daily experiment", async () => {
      await db.experiments.create({
        userSessionId: 'session-daily-done',
        experimentType: 'daily-experiment',
        experimentId: 'some-params',
        experimentInfo: {},
        statementList: [],
        finished: true,
        createdAt: new Date(),
      });

      const response = await request(app).get(
        '/api/experiments?sessionId=session-daily-done',
      );

      expect(response.status).toBe(200);
      expect(response.body.experimentType).toBe('default');
      expect(response.body.statements).toEqual([
        { id: 1, statement: 'Mock random statement' },
      ]);

      const createdExp = await db.experiments.findOne({
        where: {
          userSessionId: 'session-daily-done',
          experimentType: 'default',
        },
      });
      expect(createdExp).not.toBeNull();
      expect(createdExp?.get('finished')).toBe(false);
    });
  });
});
