import jwt from 'jsonwebtoken';
import { users } from '../db/models';

const jwtSecret = process.env.JWT_SECRET || '';

export async function getUserIdFromToken(token: string): Promise<number> {
  if (!token) {
    throw new Error('No token provided');
  }

  const decoded = await new Promise<Record<string, unknown>>(
    (resolve, reject) => {
      jwt.verify(token, jwtSecret, (err, payload) => {
        if (err || !payload || typeof payload === 'string') {
          reject(new Error('Invalid token'));
        } else {
          resolve(payload as Record<string, unknown>);
        }
      });
    },
  );

  const user = await users.findOne({ where: { email: decoded.email } });
  if (!user) {
    throw new Error('User not found');
  }

  return user.get('id') as number;
}

export async function getSessionIdFromToken(token: string): Promise<string> {
  if (!token) {
    throw new Error('No token provided');
  }

  const decoded = await new Promise<Record<string, unknown>>(
    (resolve, reject) => {
      jwt.verify(token, jwtSecret, (err, payload) => {
        if (err || !payload || typeof payload === 'string') {
          reject(new Error('Invalid token'));
        } else {
          resolve(payload as Record<string, unknown>);
        }
      });
    },
  );

  const user = await users.findOne({ where: { email: decoded.email } });
  if (!user) {
    throw new Error('User not found');
  }

  return user.get('sessionId') as string;
}
