import { Router } from 'express';
import { body, header, validationResult } from 'express-validator';
import {
  changeAnswers,
  createAnswer,
  getAnswers,
  getBaseAnswerRoute,
} from '../controllers/answers';

const router = Router();
router.get('/', getBaseAnswerRoute);

router.post(
  '/',
  body('statementId').not().isEmpty().isInt({ min: 1 }),
  body('I_agree').not().isEmpty().isInt({ min: 0, max: 1 }),
  body('I_agree_reason').not().isEmpty(),
  body('others_agree').not().isEmpty().isInt({ min: 0, max: 1 }),
  body('others_agree_reason').not().isEmpty(),
  body('perceived_commonsense').not().isEmpty().isInt({ min: 0, max: 1 }),
  body('clarity').optional({ nullable: true, checkFalsy: true }),
  createAnswer,
);

router.post(
  '/getanswers',
  body('email')
    .exists()
    .withMessage('Email field is missing')
    .isEmail()
    .withMessage('Invalid email format'),
  header('Authorization')
    .exists()
    .withMessage('Authorization header is missing')
    .isString()
    .withMessage('Authorization header must be a string')
    .notEmpty()
    .withMessage('Authorization header cannot be empty'),
  getAnswers,
);

router.post(
  '/changeanswers',
  body('statementId').not().isEmpty().isInt({ min: 1 }),
  body('I_agree').not().isEmpty().isInt({ min: 0, max: 1 }),
  body('others_agree').not().isEmpty().isInt({ min: 0, max: 1 }),
  header('Authorization')
    .exists()
    .withMessage('Authorization header is missing')
    .isString()
    .withMessage('Authorization header must be a string')
    .notEmpty()
    .withMessage('Authorization header cannot be empty'),
  changeAnswers,
);

export default router;
