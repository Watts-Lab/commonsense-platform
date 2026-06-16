import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { answers, statements, users } from '../db/models';

const jwtSecret = process.env.JWT_SECRET || '';

const languageMap: Record<string, string> = {
  en: 'statement',
  zh: 'statement_zh',
  ru: 'statement_ru',
  pt: 'statement_pt',
  ja: 'statement_ja',
  hi: 'statement_hi',
  fr: 'statement_fr',
  es: 'statement_es',
  bn: 'statement_bn',
  ar: 'statement_ar',
};

async function getSessionId(email: string): Promise<string | null> {
  const user = await users.findOne({ where: { email } });
  return (user?.get('sessionId') as string) || null;
}

export function getBaseAnswerRoute(_req: Request, res: Response): void {
  res.status(200).json({ message: 'Answer route' });
}

export async function createAnswer(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const answerData: Record<string, unknown> = {
    statementId: req.body.statementId,
    statement_number: req.body.statementId,
    I_agree: req.body.I_agree,
    I_agree_reason: req.body.I_agree_reason,
    others_agree: req.body.others_agree,
    others_agree_reason: req.body.others_agree_reason,
    perceived_commonsense: req.body.perceived_commonsense,
    origLanguage: req.body.origLanguage,
    sessionId: req.body.sessionId,
    clientVersion: process.env.GITHUB_HASH,
  };

  if (req.body.clarity !== '') {
    answerData.clarity = req.body.clarity;
  }

  try {
    const answer = await answers.create(answerData);
    res.json(answer);
  } catch {
    res.status(500).json({ error: 'An error occurred' });
  }
}

export async function getAnswers(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const token = req.headers.authorization as string;
  jwt.verify(token, jwtSecret, async (err, succ) => {
    if (err || !succ || typeof succ === 'string') {
      res.json({ ok: false, message: 'something went wrong' });
      return;
    }

    try {
      const language = req.body.language as string;
      const statementColumn = languageMap[language] || 'statement';

      const sessionID = await getSessionId(succ.email as string);
      if (!sessionID) {
        res.json({ ok: false, message: 'No session ID found' });
        return;
      }

      const result = await answers.findAll({
        where: { sessionId: sessionID },
        include: [
          {
            model: statements,
            as: 'statement',
            attributes: [statementColumn],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      const uniqueResults = result.filter((item) => {
        let i = 0;
        while (i < result.length) {
          const current = result[i];
          if (item.get('statementId') === current.get('statementId')) {
            const itemTime = new Date(item.get('createdAt') as Date).getTime();
            const currentTime = new Date(
              current.get('createdAt') as Date,
            ).getTime();
            if (itemTime < currentTime) {
              return false;
            }
          }
          i += 1;
        }
        return true;
      });

      const statementIds = uniqueResults.map((answer) =>
        answer.get('statementId'),
      );
      if (statementIds.length === 0 || statementIds.some((id) => !id)) {
        res.status(400).json({ ok: false, message: 'Invalid statement IDs' });
        return;
      }

      res.json(uniqueResults);
    } catch (error) {
      res.status(500).json({ ok: false, message: (error as Error).message });
    }
  });
}

export async function changeAnswers(
  req: Request,
  res: Response,
): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const token = req.headers.authorization as string;
  jwt.verify(token, jwtSecret, async (err, succ) => {
    if (err || !succ || typeof succ === 'string') {
      res.json({ ok: false, message: 'something went wrong' });
      return;
    }

    try {
      const sessionID = await getSessionId(succ.email as string);
      if (!sessionID) {
        res.json({ ok: false, message: 'No session ID found' });
        return;
      }

      const answerData = {
        statementId: req.body.statementId,
        statement_number: req.body.statementId,
        I_agree: req.body.I_agree,
        I_agree_reason: req.body.I_agree_reason,
        others_agree: req.body.others_agree,
        others_agree_reason: req.body.others_agree_reason,
        perceived_commonsense: req.body.perceived_commonsense,
        origLanguage: req.body.origLanguage,
        sessionId: req.body.sessionId,
        clientVersion: process.env.GITHUB_HASH,
      };

      await answers.create(answerData);
      res.json({ ok: true, message: 'Answer added successfully' });
    } catch (error) {
      res.json({ ok: false, message: (error as Error).message });
    }
  });
}
