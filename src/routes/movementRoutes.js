import { Router } from 'express';
import {
  listMovements,
  createMovement,
  deleteMovement,
} from '../controllers/MovementController.js';

const router = Router();

router.get('/', listMovements);
router.post('/', createMovement);
router.delete('/:id', deleteMovement);

export default router;
