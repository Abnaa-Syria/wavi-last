import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const createOrderSchema = z.object({
  body: z.object({
    couponCode: z.string().trim().toUpperCase().optional().nullable(),
    customerPhone: z.string().trim().min(5, 'Invalid phone number format').optional().nullable(),
    customerNotes: z.string().trim().optional().nullable(),
    addressId: z.string().cuid('Invalid address ID format').optional().nullable(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid order ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus, {
      errorMap: () => ({ message: 'Invalid order status value' }),
    }),
    note: z.string().trim().max(500, 'Note cannot exceed 500 characters').optional().nullable(),
  }),
});
