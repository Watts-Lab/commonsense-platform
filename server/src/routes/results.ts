import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAgreementPercentage,
  getAllResults,
  getBaseResultRoute,
  getSessionResult,
} from '../controllers/results';

const router = Router();

router.get('/', getBaseResultRoute);

router.post(
  '/',
  [body('sessionId').notEmpty().withMessage('sessionId is required')],
  getSessionResult,
);

router.get('/all', getAllResults);

router.post(
  '/agreementPercentage',
  [body('statementIds').isArray().withMessage('statementIds must be an array')],
  getAgreementPercentage,
);

export default router;
