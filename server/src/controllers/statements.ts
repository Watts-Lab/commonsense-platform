import { Request, Response } from 'express';
import { Sequelize } from 'sequelize';
import { statements } from '../db/models';

async function getStatementsWeighted(
  sessionId: string | null,
  validStatementList: number[],
  numberOfStatements = 1,
) {
  let query = `
    WITH weighted_questions AS (
      SELECT
        statements.id,
        statements.statement,
        1.0 / (COUNT(answers.statementId)+1) AS weight
      FROM
        statements
      LEFT JOIN
        answers ON statements.id = answers.statementId AND answers.sessionId NOT IN (:sessionId)
      WHERE
        statements.published = true
      GROUP BY statements.id
    )
    SELECT
      id,
      statement,
      -LOG(RAND()) / weight AS priority
    FROM
      weighted_questions
    ORDER BY
      priority ASC
    LIMIT :numberOfStatements;
  `;

  if (validStatementList && validStatementList.length > 0) {
    query = query.replace(
      'GROUP BY statements.id',
      'GROUP BY statements.id HAVING statements.id IN (:validStatementList)',
    );
  }

  return statements.sequelize?.query(query, {
    replacements: { sessionId, validStatementList, numberOfStatements },
    type: 'SELECT',
  });
}

export const next = async (req: Request, res: Response) => {
  try {
    const sessionId = (req.query.sessionId as string) || null;
    const results = await getStatementsWeighted(sessionId, []);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
};

export const baseStatements = async (_req: Request, res: Response) => {
  const data = await statements.findAll({
    where: {
      id: [6, 149, 2009, 2904, 3621],
    },
  });
  res.json(data);
};

export const statementById = async (req: Request, res: Response) => {
  const data = await statements.findAll({
    where: {
      id: req.params.statementId,
    },
  });

  res.json(data);
};

export const saveSubmitedStatements = async (req: Request, res: Response) => {
  const data = await statements.findAll({
    where: {
      id: req.params.statementId,
    },
  });

  res.json(data);
};

export const getStatementFromList = async (statementList: number[]) => {
  return statements.findAll({
    where: {
      id: statementList,
    },
    attributes: ['id', 'statement'],
    order: Sequelize.literal('rand()'),
  });
};

export { getStatementsWeighted };
