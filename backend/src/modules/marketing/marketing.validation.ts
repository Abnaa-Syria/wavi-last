import { z } from 'zod';
import { CouponType } from '@prisma/client';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string({
      required_error: 'Coupon code is required',
    })
      .trim()
      .min(3, 'Coupon code must be at least 3 characters')
      .toUpperCase(),
    descriptionAr: z.string().trim().optional().nullable(),
    type: z.nativeEnum(CouponType, {
      errorMap: () => ({ message: 'Type must be either PERCENTAGE or FIXED_AMOUNT' }),
    }),
    value: z.number({
      required_error: 'Coupon value is required',
    }).positive('Coupon value must be a positive number'),
    minOrderAmount: z.number().positive('Minimum order amount must be a positive number').optional().nullable(),
    maxUses: z.number().int().positive('Max uses must be a positive integer').optional().nullable(),
    maxUsesPerUser: z.number().int().positive('Max uses per user must be a positive integer').optional().nullable(),
    startsAt: z.string().datetime({ message: 'Invalid start date format' }).optional().nullable(),
    expiresAt: z.string().datetime({ message: 'Invalid expiration date format' }).optional().nullable(),
    applicableToAll: z.boolean().optional().default(true),
    categoryIds: z.array(z.string().cuid('Invalid category ID')).optional().nullable(),
    productIds: z.array(z.string().cuid('Invalid product ID')).optional().nullable(),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string({
      required_error: 'Coupon code is required',
    }).trim().min(1, 'Coupon code cannot be empty').toUpperCase(),
    subtotal: z.number({
      required_error: 'Subtotal is required',
    }).positive('Subtotal must be a positive number'),
  }),
});

export const createSaleSchema = z.object({
  body: z.object({
    nameAr: z.string({
      required_error: 'Arabic sale name is required',
    }).trim().min(3, 'Sale name must be at least 3 characters'),
    nameEn: z.string().trim().optional().nullable(),
    discountPct: z.number({
      required_error: 'Discount percentage is required',
    })
      .min(0.01, 'Discount percentage must be greater than 0')
      .max(100, 'Discount percentage cannot exceed 100'),
    isActive: z.boolean().optional().default(true),
    startsAt: z.string({
      required_error: 'Start date is required',
    }).datetime({ message: 'Invalid start date format' }),
    expiresAt: z.string({
      required_error: 'Expiration date is required',
    }).datetime({ message: 'Invalid expiration date format' }),
    categoryIds: z.array(z.string().cuid('Invalid category ID')).optional().nullable(),
    productIds: z.array(z.string().cuid('Invalid product ID')).optional().nullable(),
  }),
});

export const getBannersSchema = z.object({
  query: z.object({
    placement: z.string().optional().default('hero'),
  }),
});

export const createBannerSchema = z.object({
  body: z.object({
    titleAr: z.string().trim().optional().nullable(),
    titleEn: z.string().trim().optional().nullable(),
    imageUrl: z.string({
      required_error: 'Image URL is required',
    }).trim().min(1, 'Image URL cannot be empty'),
    mobileImageUrl: z.string().trim().optional().nullable(),
    linkUrl: z.string().trim().optional().nullable(),
    placement: z.string().trim().optional().default('hero'),
    isActive: z.boolean().optional().default(true),
    sortOrder: z.number().int().optional().default(0),
    startsAt: z.string().datetime({ message: 'Invalid start date format' }).optional().nullable(),
    expiresAt: z.string().datetime({ message: 'Invalid expiration date format' }).optional().nullable(),
  }),
});

export const updateCouponSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid coupon ID format'),
  }),
  body: createCouponSchema.shape.body.partial(),
});

