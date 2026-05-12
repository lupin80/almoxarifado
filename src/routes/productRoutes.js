import { Router } from 'express';
import {
  listProducts,
  listDeletedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../controllers/ProductController.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/', listProducts);
router.get('/deleted', listDeletedProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/upload-image', upload.single('image'), uploadProductImage);

export default router;
