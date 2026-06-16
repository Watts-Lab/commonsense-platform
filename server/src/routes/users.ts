import { Router } from 'express';
import { header } from 'express-validator';
import { delete_account, login, verify_token } from '../controllers/users';

const router = Router();

router.post('/enter', login);
router.post(
  '/verify',
  [
    header('Authorization')
      .exists()
      .withMessage('Authorization header is missing')
      .isString()
      .withMessage('Authorization header must be a string')
      .notEmpty()
      .withMessage('Authorization header cannot be empty'),
  ],
  verify_token,
);
router.post(
  '/deleteaccount',
  [
    header('Authorization')
      .exists()
      .withMessage('Authorization header is missing')
      .isString()
      .withMessage('Authorization header must be a string')
      .notEmpty()
      .withMessage('Authorization header cannot be empty'),
  ],
  delete_account,
);

export default router;
