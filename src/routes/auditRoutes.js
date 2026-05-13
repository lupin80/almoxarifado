import { Router } from 'express';
import AuditController from '../controllers/AuditController.js';
import authMiddleware from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, AuditController.getLogs);

export default router;
