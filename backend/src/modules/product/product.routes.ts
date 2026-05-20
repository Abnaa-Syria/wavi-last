import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect, hasPermission } from '../../middlewares/auth.middleware.js';
import { Permission } from '@prisma/client';
import {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
} from './product.validation.js';

export const productRouter = Router();

// Routes mapping for "/"
productRouter
  .route('/')
  .get(ProductController.getAll) // Public view
  .post(
    protect, // Authenticates request and loads user + permissions
    hasPermission(Permission.PRODUCT_CREATE), // Verifies granular write permission
    validate(createProductSchema), // Validates schema requirements
    ProductController.create
  );

// Routes mapping for "/:id"
productRouter
  .route('/:id')
  .get(
    validate(getProductByIdSchema),
    ProductController.getById
  ) // Public view
  .patch(
    protect,
    hasPermission(Permission.PRODUCT_UPDATE),
    validate(updateProductSchema),
    ProductController.update
  )
  .delete(
    protect,
    hasPermission(Permission.PRODUCT_DELETE),
    validate(getProductByIdSchema),
    ProductController.delete
  );

export default productRouter;
