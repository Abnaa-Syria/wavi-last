import { Router } from 'express';
import { ReviewController } from './review.controller.js';
import { protect, hasPermission } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createReviewSchema, updateReviewStatusSchema } from './review.validation.js';
import { Permission } from '@prisma/client';

export const reviewRouter = Router();

// =========================================================================
// PUBLIC ENDPOINTS
// =========================================================================

// Public fetch for approved reviews on a product
reviewRouter.get('/product/:productId', ReviewController.getProductReviews);

// =========================================================================
// CUSTOMER SECURED ENDPOINTS
// =========================================================================

// Create a review on a product
reviewRouter.post('/', protect, validate(createReviewSchema), ReviewController.createReview);

// =========================================================================
// ADMIN SECURED ENDPOINTS
// =========================================================================

// Update status (APPROVE/REJECT) of a review
reviewRouter.patch('/:id/status', protect, hasPermission(Permission.PRODUCT_UPDATE), validate(updateReviewStatusSchema), ReviewController.updateReviewStatus);

export default reviewRouter;
