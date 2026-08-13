import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import xss from 'xss';
import { feedbacks } from '../db/models';
import { send_report } from './emails';

const ALLOWED_TYPES = ['bug', 'idea'];

export async function saveFeedBack(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const type = (req.body.type as string).trim();
    let comment = (req.body.comment as string).trim();

    if (!ALLOWED_TYPES.includes(type.toLowerCase())) {
      res.status(400).json({ error: 'Invalid feedback type' });
      return;
    }

    comment = xss(comment, {
      whiteList: {},
      stripIgnoreTag: true,
    });

    const suspiciousPatterns = [
      /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b)/gi,
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(comment))) {
      res.status(400).json({ error: 'Invalid content detected' });
      return;
    }

    const feedback = await feedbacks.create({
      type,
      comment,
      sessionId: req.sessionID,
      ipAddress: req.session?.ip || 'unknown',
      userAgent: req.headers['user-agent'] || '',
      createdAt: new Date(),
    });

    Promise.all([
      send_report('markew@seas.upenn.edu', comment, type),
      send_report('amirhossein.nakhaei@rwth-aachen.de', comment, type),
    ]).catch(() => {});

    res.json({ success: true, id: feedback.get('id') });
  } catch {
    res.status(500).json({ error: 'An error occurred' });
  }
}
