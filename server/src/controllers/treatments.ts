import { Request, Response } from 'express';
import { treatments, usertreatments } from '../db/models';
import { GetStatementsWeighted } from '../survey/treatments/weighted-random.treatment';

async function chooseTreatment(req: Request) {
  const treatment = await treatments.findOne({ order: [['id', 'ASC']] });

  const defaultStatements = await GetStatementsWeighted({
    sessionId: req.sessionID,
    validStatementList: [],
    numberOfStatements: 15,
    language: 'en',
  });

  return {
    id: (treatment?.get('id') as number) || 1,
    statements: defaultStatements.answer,
  };
}

export async function getTreatment(req: Request, res: Response): Promise<void> {
  const source = Object.keys(req.query)
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(req.query[key]))}`,
    )
    .join('&');

  const user = await usertreatments.findOne({
    where: { sessionId: req.sessionID, finished: false },
  });

  if (!user) {
    const treatment = await chooseTreatment(req);

    await usertreatments.create({
      sessionId: req.sessionID,
      treatmentId: treatment.id,
      statementList: JSON.stringify(treatment.statements),
      finished: false,
      urlParams: source === '' ? null : JSON.stringify(req.query),
    });

    res.send({ value: treatment.statements });
    return;
  }

  const existingList = user.get('statementList');
  res.send({ value: existingList ? JSON.parse(existingList as string) : [] });
}

export async function readTreatments(
  _req: Request,
  res: Response,
): Promise<void> {
  const all = await treatments.findAll({ order: [['id', 'ASC']] });
  res.send(all);
}

export async function updateTreatment(
  req: Request,
  res: Response,
): Promise<void> {
  const user = await usertreatments.findOne({
    where: { sessionId: req.sessionID, finished: false },
  });

  if (user) {
    await user.update({ finished: true });
  }

  res.send({ value: 'success' });
}

export async function readSpace(req: Request, res: Response): Promise<void> {
  const statements = await GetStatementsWeighted({
    sessionId: req.sessionID,
    validStatementList: [],
    numberOfStatements: 15,
    language: 'en',
  });

  res.send(statements.answer);
}
