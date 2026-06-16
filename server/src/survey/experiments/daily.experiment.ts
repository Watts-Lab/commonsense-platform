import { Op, QueryTypes } from 'sequelize';
import { dailyexperiment, experiments, sequelize } from '../../db/models';
import { GetStatementById } from '../treatments/statement-by-id.treatment';

async function getOrCreateDailyExperiment(): Promise<number[]> {
  const today = new Date().toISOString().slice(0, 10);

  const existing = await dailyexperiment.findByPk(today);
  if (existing) {
    const row = existing.toJSON() as { statementIds: number[] };
    return row.statementIds;
  }

  const results = (await sequelize.query(
    `
      SELECT
        s.id AS statementId,
        COUNT(a.id) AS answerCount
      FROM
        statements s
      LEFT JOIN answers a ON a.statement_number = s.id
      WHERE
        s.published = 1
      GROUP BY
        s.id
      ORDER BY
        answerCount ASC,
        s.id ASC
      LIMIT
        15;
    `,
    { type: QueryTypes.SELECT },
  )) as Array<{ statementId: number }>;

  const lowestRatedStatements = results.map((r) => r.statementId);

  const created = await dailyexperiment.create({
    date: today,
    statementIds: lowestRatedStatements,
  });

  const row = created.toJSON() as { statementIds: number[] };
  return row.statementIds;
}

const dailyExperiment = {
  experimentName: 'daily-experiment',
  treatments: [
    {
      params: {},
      function: GetStatementById,
      validity: () => true,
    },
  ],
  treatmentAssigner: async (
    treatments: Array<Record<string, unknown>>,
    req: { query: Record<string, unknown> },
  ) => {
    const sessionId = req.query.sessionId as string | undefined;
    if (!sessionId) {
      return null;
    }

    const today = new Date().toISOString().slice(0, 10);

    const alreadyDone = await experiments.findOne({
      where: {
        userSessionId: sessionId,
        experimentType: 'daily-experiment',
        finished: true,
        createdAt: {
          [Op.gte]: new Date(`${today}T00:00:00.000Z`),
          [Op.lte]: new Date(`${today}T23:59:59.999Z`),
        },
      },
    });

    if (alreadyDone) {
      return null;
    }

    const statementIds = await getOrCreateDailyExperiment();

    return {
      ...treatments[0],
      params: {
        ids: statementIds,
        sessionId,
      },
    };
  },
};

export default dailyExperiment;
