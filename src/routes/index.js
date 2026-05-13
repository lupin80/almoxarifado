import { Router } from 'express';
import productRoutes from './productRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import movementRoutes from './movementRoutes.js';
import destinationRoutes from './destinationRoutes.js';
import auditRoutes from './auditRoutes.js';
import trashRoutes from './trashRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/categories', categoryRoutes);
router.use('/movements', movementRoutes);
router.use('/destinations', destinationRoutes);
router.use('/audit', auditRoutes);
router.use('/trash', trashRoutes);
router.use('/dashboard', dashboardRoutes);

// Legacy/Compatibility login route
import { login } from '../controllers/AuthController.js';
router.post('/login', login);

export default router;
