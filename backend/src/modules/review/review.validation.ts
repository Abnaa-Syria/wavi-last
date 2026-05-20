import { z } from 'zod';
import { ReviewStatus } from '@prisma/client';

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: 'Product ID is required',
    }).trim().cuid('Invalid product ID format'),
    rating: z.number({
      required_error: 'Rating is required',
    })
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must not exceed 5'),
    titleAr: z.string().trim().max(100, 'Title must not exceed 100 characters').optional().nullable(),
    bodyAr: z.string().trim().max(1000, 'Review body must not exceed 1000 characters').optional().nullable(),
  }),
});

export const updateReviewStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ReviewStatus, {
      errorMap: () => ({ message: 'Status must be APPROVED or REJECTED' }),
    }),
  }),
});

export const getAdminReviewsSchema = z.object({
  query: z.object({
    status: z.nativeEnum(ReviewStatus).optional(),
  }),
});

export const reviewParamsSchema = z.object({
  params: z.object({
    id: z.string().trim().cuid('Invalid review ID format'),
  }),
});
