import { z } from 'zod';

export const createFaqCategorySchema = z.object({
  body: z.object({
    nameAr: z.string({
      required_error: 'Arabic category name is required',
    }).trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
    nameEn: z.string().trim().max(100, 'English name must not exceed 100 characters').optional().nullable(),
    sortOrder: z.number().int().optional().default(0),
    isActive: z.boolean().optional().default(true),
  }),
});

export const createFaqSchema = z.object({
  body: z.object({
    categoryId: z.string().trim().cuid('Invalid category ID format').optional().nullable(),
    questionAr: z.string({
      required_error: 'Arabic question is required',
    }).trim().min(3, 'Question must be at least 3 characters').max(500, 'Question must not exceed 500 characters'),
    questionEn: z.string().trim().max(500, 'English question must not exceed 500 characters').optional().nullable(),
    answerAr: z.string({
      required_error: 'Arabic answer is required',
    }).trim().min(5, 'Answer must be at least 5 characters'),
    answerEn: z.string().trim().optional().nullable(),
    sortOrder: z.number().int().optional().default(0),
    isActive: z.boolean().optional().default(true),
  }),
});
export const updateFaqCategorySchema = z.object({
  params: z.object({
    id: z.string().trim().cuid('Invalid category ID format'),
  }),
  body: z.object({
    nameAr: z.string().trim().min(2).max(100).optional(),
    nameEn: z.string().trim().max(100).optional().nullable(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateFaqSchema = z.object({
  params: z.object({
    id: z.string().trim().cuid('Invalid FAQ ID format'),
  }),
  body: z.object({
    categoryId: z.string().trim().cuid().optional().nullable(),
    questionAr: z.string().trim().min(3).max(500).optional(),
    questionEn: z.string().trim().max(500).optional().nullable(),
    answerAr: z.string().trim().min(5).optional(),
    answerEn: z.string().trim().optional().nullable(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const faqParamsSchema = z.object({
  params: z.object({
    id: z.string().trim().cuid('Invalid ID format'),
  }),
});