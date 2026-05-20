import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/error.util.js';
import { ReviewStatus } from '@prisma/client';

export interface CreateReviewInput {
  productId: string;
  rating: number;
  titleAr?: string | null;
  bodyAr?: string | null;
}

export class ReviewService {
  /**
   * Submits a new product review (Customer Only)
   */
  public static async createReview(userId: string, data: CreateReviewInput) {
    // 1. Verify target product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError('المنتج المحدد غير موجود', 404);
    }

    // 2. Check for duplicate reviews
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: data.productId,
        },
      },
    });

    if (existingReview) {
      throw new AppError('لقد قمت بتقييم هذا المنتج بالفعل. لا يمكنك إضافة أكثر من تقييم واحد لكل منتج', 400);
    }

    // 3. Create the pending review
    return await prisma.review.create({
      data: {
        userId,
        productId: data.productId,
        rating: data.rating,
        titleAr: data.titleAr || null,
        bodyAr: data.bodyAr || null,
        status: ReviewStatus.PENDING,
      },
    });
  }

  /**
   * Fetches all APPROVED reviews for a specific product (Public Storefront)
   */
  public static async getProductReviews(productId: string) {
    // Verify product exists
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!productExists) {
      throw new AppError('المنتج المحدد غير موجود', 404);
    }

    return await prisma.review.findMany({
      where: {
        productId,
        status: ReviewStatus.APPROVED,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Approves or rejects a customer review (Admin Only)
   */
  public static async updateReviewStatus(reviewId: string, status: ReviewStatus) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('التقييم المطلوب غير موجود', 404);
    }

    return await prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });
  }
}
export default ReviewService;
