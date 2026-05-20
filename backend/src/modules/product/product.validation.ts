import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().trim().min(3, 'SKU must be at least 3 characters').optional(),
    nameAr: z.string({
      required_error: 'Arabic name is required',
    }).trim().min(2, 'Arabic name must be at least 2 characters'),
    nameEn: z.string().trim().min(2).optional(),
    slug: z.string().trim().min(2, 'Slug must be at least 2 characters').optional(),
    shortDescAr: z.string().trim().optional(),
    shortDescEn: z.string().trim().optional(),
    descriptionAr: z.string().trim().optional(),
    descriptionEn: z.string().trim().optional(),
    productType: z.enum(['SUBSCRIPTION', 'DIGITAL_FILE', 'GAME_CURRENCY', 'SOCIAL_SERVICE', 'PHYSICAL'], {
      required_error: 'Product type is required',
    }),
    deliveryMethod: z.enum(['AUTO_FILE', 'WHATSAPP', 'ACTIVATION_CODE', 'MANUAL', 'SHIPPING']).optional(),
    categoryId: z.string({
      required_error: 'Category ID is required',
    }).cuid('Invalid Category ID format'),
    basePrice: z.number().positive().optional(),
    price: z.number().positive().optional(),
    compareAtPrice: z.number().positive().optional(),
    currency: z.string().default('SAR'),
    trackInventory: z.boolean().default(false),
    stockQty: z.number().int().nonnegative().optional(),
    lowStockThreshold: z.number().int().nonnegative().optional(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isDigital: z.boolean().default(true),
    requiresInfo: z.boolean().default(false),
    geoRestricted: z.boolean().default(false),
    restrictedCountries: z.array(z.string()).optional(),
    variants: z.array(
      z.object({
        id: z.string().optional(),
        nameAr: z.string({ required_error: 'Variant name is required' }).trim(),
        price: z.number({ required_error: 'Variant price is required' }).nonnegative(),
        isActive: z.boolean().default(true).optional(),
      })
    ).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid product ID format'),
  }),
  body: createProductSchema.shape.body.partial(),
});

export const getProductByIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid product ID format'),
  }),
});
