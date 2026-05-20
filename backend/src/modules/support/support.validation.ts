import { z } from 'zod';
import { TicketPriority, TicketStatus } from '@prisma/client';

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string({
      required_error: 'Subject is required',
    })
      .trim()
      .min(3, 'Subject must be at least 3 characters')
      .max(255, 'Subject must not exceed 255 characters'),
    body: z.string({
      required_error: 'Ticket body description is required',
    })
      .trim()
      .min(5, 'Ticket description must be at least 5 characters'),
    orderId: z.string().trim().cuid('Invalid order ID format').optional().nullable(),
    priority: z.nativeEnum(TicketPriority).optional().default(TicketPriority.MEDIUM),
  }),
});

export const assignTicketSchema = z.object({
  body: z.object({
    agentId: z.string({
      required_error: 'Agent ID is required',
    }).trim().cuid('Invalid agent ID format'),
  }),
});

export const addMessageSchema = z.object({
  body: z.object({
    body: z.string({
      required_error: 'Reply message body is required',
    }).trim().min(1, 'Reply message cannot be empty'),
    isInternal: z.boolean().optional().default(false),
  }),
});

export const getTicketsFilterSchema = z.object({
  query: z.object({
    status: z.nativeEnum(TicketStatus).optional(),
  }),
});
