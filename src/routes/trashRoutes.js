import { Router } from 'express';
import TrashController from '../controllers/TrashController.js';
import authMiddleware from '../middlewares/auth.js';

const router = Router();

router.get('/products', authMiddleware, TrashController.getDeletedProducts);
router.post('/products/:id/restore', authMiddleware, TrashController.restoreProduct);
router.delete('/products/:id/permanent', authMiddleware, TrashController.permanentDeleteProduct);

export default router;
