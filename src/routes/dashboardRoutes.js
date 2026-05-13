import { Router } from 'express';
import DashboardController from '../controllers/DashboardController.js';
import authMiddleware from '../middlewares/auth.js';

const router = Router();

router.get('/stats', authMiddleware, DashboardController.getStats);
router.get('/recent-movements', authMiddleware, DashboardController.getRecentMovements);

export default router;
