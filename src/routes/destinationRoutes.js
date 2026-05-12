import { Router } from 'express';
import {
  listDestinations,
  createDestination,
} from '../controllers/DestinationController.js';

const router = Router();

router.get('/', listDestinations);
router.post('/', createDestination);

export default router;
