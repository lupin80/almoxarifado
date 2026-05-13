import { Router } from 'express';
import TrashController from '../controllers/TrashController.js';
import authMiddleware from '../middlewares/auth.js';

const router = Router();

router.get('/products', authMiddleware, TrashController.getDeletedProducts);
router.post('/products/:id/restore', authMiddleware, TrashController.restoreProduct);
router.delete('/products/:id/permanent', authMiddleware, TrashController.permanentDeleteProduct);

router.get('/suppliers', authMiddleware, TrashController.getDeletedSuppliers);
router.post('/suppliers/:id/restore', authMiddleware, TrashController.restoreSupplier);
router.delete('/suppliers/:id/permanent', authMiddleware, TrashController.permanentDeleteSupplier);

router.get('/movements', authMiddleware, TrashController.getDeletedMovements);
router.post('/movements/:id/restore', authMiddleware, TrashController.restoreMovement);
router.delete('/movements/:id/permanent', authMiddleware, TrashController.permanentDeleteMovement);

export default router;
