import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  returnStatements,
  saveExperiment,
  saveIndividual,
} from '../controllers/experiment';

const router = Router();

router.get(
  '/',
  [query('sessionId').not().isEmpty().withMessage('sessionId is required')],
  returnStatements,
);

router.post(
  '/save',
  [
    body('experimentId')
      .not()
      .isEmpty()
      .withMessage('experimentId is required')
      .isInt({ min: 1 })
      .withMessage('experimentId should be a positive integer'),
  ],
  saveExperiment,
);

router.post('/individual', saveIndividual);

export default router;
