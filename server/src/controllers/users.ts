import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { users } from '../db/models';
import { send_magic_link } from './emails';

const jwtSecret = process.env.JWT_SECRET || '';

const isEmail = (value: string): boolean => /.+@.+\..+/.test(value);

async function register(email: string, sessionId?: string) {
  const newUser = {
    email,
    magicLink: crypto.randomBytes(64).toString('hex'),
    sessionId,
  };

  const user = await users.create(newUser);
  await send_magic_link(email, user.get('magicLink') as string, 'signup');
  return { ok: true, message: 'User created', user };
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, magicLink, sessionId } = req.body as {
    email?: string;
    magicLink?: string;
    sessionId?: string;
  };

  if (!email) {
    res.json({ ok: false, message: 'All fields are required' });
    return;
  }

  if (!isEmail(email)) {
    res.json({ ok: false, message: 'Invalid email provided' });
    return;
  }

  try {
    let user = await users.findOne({ where: { email } });

    if (!user) {
      await register(email, sessionId);
      res.send({ ok: true, message: 'Click the link in the email to sign in' });
      return;
    }

    if (!magicLink) {
      user = await user.update({
        magicLink: crypto.randomBytes(64).toString('hex'),
        magicLinkExpired: false,
      });

      await send_magic_link(email, user.get('magicLink') as string);

      res.send({ ok: true, message: 'Click the link in the email to sign in' });
      return;
    }

    if (user.get('magicLink') === magicLink && !user.get('magicLinkExpired')) {
      const newSessionId = (user.get('sessionId') as string) || sessionId;

      if (!user.get('sessionId')) {
        user = await user.update({
          magicLinkExpired: true,
          sessionId: newSessionId,
        });
      } else {
        user = await user.update({ magicLinkExpired: true });
      }

      const token = jwt.sign(user.toJSON(), jwtSecret, { expiresIn: '12h' });

      res.json({
        ok: true,
        message: 'Welcome back',
        token,
        email,
        sessionId: newSessionId,
      });
      return;
    }

    res.json({ ok: false, message: 'Magic link expired or incorrect' });
  } catch (error) {
    res.json({ ok: false, error: (error as Error).message });
  }
}

export function verify_token(req: Request, res: Response): void {
  const token = req.headers.authorization;

  if (!token) {
    res.json({ ok: false, message: 'Something went wrong' });
    return;
  }

  jwt.verify(token, jwtSecret, (err, succ) => {
    if (err || !succ || typeof succ === 'string') {
      res.json({ ok: false, message: 'Something went wrong' });
      return;
    }

    res.json({
      ok: true,
      email: succ.email,
      sessionId: succ.sessionId,
    });
  });
}

export async function delete_account(
  req: Request,
  res: Response,
): Promise<void> {
  const token = req.headers.authorization;

  if (!token) {
    res.json({ ok: false, message: 'Something went wrong' });
    return;
  }

  jwt.verify(token, jwtSecret, async (err, succ) => {
    if (err || !succ || typeof succ === 'string') {
      res.json({ ok: false, message: 'Something went wrong' });
      return;
    }

    try {
      await users.destroy({
        where: {
          email: succ.email,
          sessionId: succ.sessionId,
        },
      });

      res.json({ ok: true, message: 'User deleted' });
    } catch {
      res.json({ ok: false, message: 'Something went wrong' });
    }
  });
}
