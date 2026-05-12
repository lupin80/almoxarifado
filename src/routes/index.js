import { Router } from 'express';
import productRoutes from './productRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import movementRoutes from './movementRoutes.js';
import destinationRoutes from './destinationRoutes.js';

const router = Router();

router.use('/products', productRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/movements', movementRoutes);
router.use('/destinations', destinationRoutes);

// Legacy/Compatibility login route
import { login } from '../controllers/AuthController.js';
router.post('/login', login);

export default router;
