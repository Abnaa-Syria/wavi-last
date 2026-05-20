import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: 'Product ID is required',
    }).cuid('Invalid product ID format'),
    variantId: z.string().cuid('Invalid variant ID format').nullable().optional(),
    quantity: z.number({
      required_error: 'Quantity is required',
    }).int('Quantity must be an integer').positive('Quantity must be at least 1'),
    customerData: z.record(z.any()).optional().nullable(),
  }),
});

export const removeFromCartSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid cart item ID format'),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid cart item ID format'),
  }),
  body: z.object({
    quantity: z.number().int('Quantity must be an integer').positive('Quantity must be at least 1').optional(),
    customerData: z.record(z.any()).optional().nullable(),
  }),
});

