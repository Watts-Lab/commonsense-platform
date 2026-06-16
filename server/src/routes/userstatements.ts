import { Router } from 'express';
import { body } from 'express-validator';
import { createUserStatement } from '../controllers/userstatements';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({ message: 'user statements route' });
});

router.post(
  '/create',
  [
    body('statementText')
      .trim()
      .notEmpty()
      .withMessage('Statement text is required'),
    body('statementProperties')
      .notEmpty()
      .withMessage('Statement properties are required'),
  ],
  createUserStatement,
);

export default router;
