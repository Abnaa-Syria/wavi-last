import { Router } from 'express';
import { CategoryController } from './category.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoryBySlugSchema,
  deleteCategorySchema,
} from './category.validation.js';
import { hasPermission, protect } from '../../middlewares/auth.middleware.js';
import { Permission } from '@prisma/client';

export const categoryRouter = Router();

// Public Reading Endpoints
categoryRouter.get('/', CategoryController.getAll);
categoryRouter.get('/:slug', validate(getCategoryBySlugSchema), CategoryController.getBySlug);

// Secured Writing & Management Endpoints (restricted to ADMIN and SUPER_ADMIN)
categoryRouter.post(
  '/',
  protect,
  hasPermission(Permission.CATEGORY_CREATE),
  validate(createCategorySchema),
  CategoryController.create
);

categoryRouter.patch(
  '/:id',
  protect,
  hasPermission(Permission.CATEGORY_UPDATE),
  validate(updateCategorySchema),
  CategoryController.update
);

categoryRouter.delete(
  '/:id',
  protect,
  hasPermission(Permission.CATEGORY_DELETE),
  validate(deleteCategorySchema),
  CategoryController.delete
);

export default categoryRouter;
