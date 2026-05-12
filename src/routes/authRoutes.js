import { Router } from 'express';
import {
  login,
  changePassword,
  resetPassword,
} from '../controllers/AuthController.js';

const router = Router();

router.post('/login', login);
router.put('/change-password', changePassword);
router.put('/reset-password', resetPassword);

export default router;
