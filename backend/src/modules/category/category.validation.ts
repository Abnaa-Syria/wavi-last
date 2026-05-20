import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    nameAr: z.string({
      required_error: 'Arabic name is required',
    }).trim().min(2, 'Arabic name must be at least 2 characters'),
    nameEn: z.string().trim().min(2).optional(),
    slug: z.string({
      required_error: 'Slug is required',
    }).trim()
      .min(2, 'Slug must be at least 2 characters')
      .toLowerCase()
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase and contain only letters, numbers, or hyphens (-)'),
    descriptionAr: z.string().trim().optional(),
    descriptionEn: z.string().trim().optional(),
    imageUrl: z.string().url('Invalid image URL format').optional().or(z.literal('')),
    iconUrl: z.string().trim().optional(),
    parentId: z.string().cuid('Invalid parent category ID format').nullable().optional().or(z.literal('')).or(z.literal('null')),
    sortOrder: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid category ID format'),
  }),
  body: createCategorySchema.shape.body.partial(),
});

export const getCategoryBySlugSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1, 'Slug is required'),
  }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid category ID format'),
  }),
});
