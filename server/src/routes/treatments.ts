import { Router } from 'express';
import {
  getTreatment,
  readSpace,
  readTreatments,
  updateTreatment,
} from '../controllers/treatments';

const router = Router();

router.get('/', getTreatment);
router.get('/all', readTreatments);
router.get('/update', updateTreatment);
router.get('/readspace', readSpace);

export default router;
