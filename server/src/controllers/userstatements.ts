import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { userstatements } from '../db/models';
import { getUserIdFromToken } from './authhelper';

export async function createUserStatement(
  req: Request,
  res: Response,
): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { statementText, statementProperties } = req.body;
    const token = req.headers.authorization as string;
    const userId = await getUserIdFromToken(token);

    const newUserStatement = await userstatements.create({
      userId,
      statementText,
      statementProperties,
    });

    res.status(201).json(newUserStatement);
  } catch (error) {
    res
      .status(500)
      .json({ error: (error as Error).message || 'Internal Server Error' });
  }
}
