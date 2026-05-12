import { Router } from 'express';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
} from '../controllers/UserController.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/upload-image', upload.single('image'), uploadUserImage);

export default router;
