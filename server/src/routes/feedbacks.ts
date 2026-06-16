import { Router } from 'express';
import { body } from 'express-validator';
import { saveFeedBack } from '../controllers/feedbacks';

const router = Router();

router.post(
  '/',
  [
    body('type')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Type must be between 1-50 characters')
      .matches(/^[a-zA-Z0-9\s\-_]+$/)
      .withMessage('Type contains invalid characters'),
    body('comment')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Comment must be between 1-2000 characters')
      .escape(),
  ],
  saveFeedBack,
);

export default router;
