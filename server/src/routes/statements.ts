import { Router } from 'express';
import {
  baseStatements,
  next,
  saveSubmitedStatements,
  statementById,
} from '../controllers/statements';

const router = Router();

router.get('/', baseStatements);
router.get('/next', next);
router.get('/byid/:statementId', statementById);
router.post('/submit-statement', saveSubmitedStatements);

export default router;
