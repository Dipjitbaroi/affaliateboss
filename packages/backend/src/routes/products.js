import express from 'express';
import { ProductsController } from '../controllers/productsController.js';

const router = express.Router();

// Products routes
router.get('/', ProductsController.getProducts);
router.get('/categories', ProductsController.getCategories);
router.get('/:id', ProductsController.getProduct);
router.post('/', ProductsController.createProduct);
router.put('/:id', ProductsController.updateProduct);
router.delete('/:id', ProductsController.deleteProduct);

export default router;
