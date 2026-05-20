import { Request, Response } from 'express';
import { ReviewService } from './review.service.js';
import { sendSuccess } from '../../utils/response.util.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';
import { ReviewStatus } from '@prisma/client';

export class ReviewController {
  /**
   * Controller handler for creating a new product review (Customer Only)
   */
  public static createReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const review = await ReviewService.createReview(userId, req.body);
    sendSuccess(res, 'تم إرسال التقييم بنجاح وهو في انتظار مراجعة الإدارة', { review }, 201);
  });

  /**
   * Controller handler for listing approved product reviews (Public Storefront)
   */
  public static getProductReviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;
    const reviews = await ReviewService.getProductReviews(productId!);
    sendSuccess(res, 'تم استرجاع تقييمات المنتج بنجاح', { reviews });
  });

  /**
   * Controller handler for approving/rejecting a review (Admin Only)
   */
  public static updateReviewStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body as { status: ReviewStatus };

    const review = await ReviewService.updateReviewStatus(id!, status);
    sendSuccess(res, 'تم تحديث حالة التقييم بنجاح', { review });
  });
}
export default ReviewController;
