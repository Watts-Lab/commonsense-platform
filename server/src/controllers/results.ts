import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { QueryTypes } from 'sequelize';
import { answers, statements, sequelize } from '../db/models';

type AgreementAnswer = {
  sessionId: string;
  createdAt: Date;
  statementId: number;
  I_agree: number;
  others_agree: number;
};

export function getBaseResultRoute(_req: Request, res: Response): void {
  res.status(200).json({ message: 'Result route' });
}

export async function getSessionResult(
  req: Request,
  res: Response,
): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const results = await answers.findAll({
      where: {
        sessionId: req.body.sessionId,
      },
      include: [
        {
          model: statements,
          as: 'statement',
          attributes: ['statementMedian'],
        },
      ],
      attributes: ['statementId', 'I_agree', 'perceived_commonsense'],
      raw: true,
      nest: true,
    });

    const processed = results
      .map((row: any) => ({
        awareness: Number(
          row.perceived_commonsense === row.statement.statementMedian,
        ),
        consensus: Number(row.I_agree === row.statement.statementMedian),
      }))
      .reduce(
        (avg, value, _index, array) => ({
          awareness: avg.awareness + value.awareness / array.length,
          consensus: avg.consensus + value.consensus / array.length,
        }),
        {
          awareness: 0,
          consensus: 0,
        },
      );

    const finalData = {
      ...processed,
      commonsensicality: Math.sqrt(processed.awareness * processed.consensus),
    };

    res.json(finalData);

    setImmediate(async () => {
      try {
        await sequelize.query('CALL update_statement_median;', {
          type: QueryTypes.RAW,
        });
      } catch {}
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllResults(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const rows = (await sequelize.query(
      `
      SELECT
        a.sessionId,
        COUNT(*) as answer_count,
        SUM(CASE WHEN a.perceived_commonsense = s.statementMedian THEN 1 ELSE 0 END) as awareness_sum,
        SUM(CASE WHEN a.I_agree = s.statementMedian THEN 1 ELSE 0 END) as consensus_sum
      FROM answers a
      INNER JOIN statements s ON a.statementId = s.id
      GROUP BY a.sessionId
      HAVING answer_count >= 5
      `,
      { type: QueryTypes.SELECT },
    )) as Array<Record<string, any>>;

    const output: Array<{ sessionId: string; commonsensicality: number }> = [];
    const requestSessionId = req.query.sessionId;
    let userIndex = 1;

    for (const row of rows) {
      const awareness = Number(row.awareness_sum) / Number(row.answer_count);
      const consensus = Number(row.consensus_sum) / Number(row.answer_count);
      const commonsensicality = Math.sqrt(awareness * consensus);

      if (row.sessionId === requestSessionId) {
        output.push({ sessionId: 'You', commonsensicality });
      } else {
        output.push({ sessionId: `user${userIndex}`, commonsensicality });
        userIndex += 1;
      }
    }

    res.json(output);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function calculateAgreementPercentage(statementIds: number[]) {
  const result: Record<number, { I_agree: number; others_agree: number }> = {};

  const answersForStatementAll = (await sequelize.query(
    `
    SELECT
      sessionId,
      createdAt,
      statementId,
      I_agree,
      others_agree
    FROM (
      SELECT
        a.sessionId,
        a.createdAt,
        a.statementId,
        a.I_agree,
        a.others_agree,
        ROW_NUMBER() OVER (
          PARTITION BY a.sessionId, a.statementId
          ORDER BY a.createdAt DESC
        ) as rn
      FROM answers a
      WHERE a.statementId IN (${statementIds.map(() => '?').join(',')})
    ) AS ranked
    WHERE rn = 1
    `,
    {
      replacements: statementIds,
      type: QueryTypes.SELECT,
    },
  )) as AgreementAnswer[];

  const groupedAnswers: Record<number, AgreementAnswer[]> = {};
  answersForStatementAll.forEach((answer) => {
    if (!groupedAnswers[answer.statementId]) {
      groupedAnswers[answer.statementId] = [];
    }
    groupedAnswers[answer.statementId].push(answer);
  });

  for (const statementId of statementIds) {
    const answersForStatement = groupedAnswers[statementId] || [];
    const totalAnswers = answersForStatement.length;

    if (totalAnswers === 0) {
      result[statementId] = { I_agree: 0, others_agree: 0 };
      continue;
    }

    if (totalAnswers === 1) {
      const answer = answersForStatement[0];
      if (answer.I_agree === 1 && answer.others_agree === 1) {
        result[statementId] = { I_agree: 100, others_agree: 100 };
      } else if (answer.I_agree === 0 && answer.others_agree === 1) {
        result[statementId] = { I_agree: 0, others_agree: 0 };
      } else if (answer.I_agree === 1 && answer.others_agree === 0) {
        result[statementId] = { I_agree: 100, others_agree: 100 };
      } else {
        result[statementId] = { I_agree: 0, others_agree: 0 };
      }
    } else {
      const actualIAgree = answersForStatement.reduce(
        (acc, answer) => acc + (answer.I_agree ? 1 : 0),
        0,
      );
      const actualIAgreePercentage = (actualIAgree / totalAnswers) * 100;

      result[statementId] = {
        I_agree: actualIAgreePercentage,
        others_agree: actualIAgreePercentage,
      };
    }
  }

  return result;
}

export async function getAgreementPercentage(
  req: Request,
  res: Response,
): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const agreementPercentages = await calculateAgreementPercentage(
      req.body.statementIds,
    );
    res.json(agreementPercentages);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
