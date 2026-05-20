import { Router } from 'express';
import { SupportController } from './support.controller.js';
import { protect, hasPermission } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createTicketSchema,
  assignTicketSchema,
  addMessageSchema,
  getTicketsFilterSchema,
} from './support.validation.js';
import { Permission } from '@prisma/client';

export const supportRouter = Router();

// All support ticket endpoints are strictly protected by authentication
supportRouter.use(protect);

// =========================================================================
// CUSTOMER & UNIVERSAL SUPPORT ROUTES
// =========================================================================

// Customer creates a support ticket
supportRouter.post('/', validate(createTicketSchema), SupportController.createTicket);

// Customer fetches their own ticket history
supportRouter.get('/my-tickets', SupportController.getMyTickets);

// Universal reply route to append a message to ticket chat conversation (isInternal forced to false for customer submissions)
supportRouter.post('/:id/messages', validate(addMessageSchema), SupportController.addMessage);

// Universal details retrieval (ownership checks and isInternal leak filters are performed in service layer)
supportRouter.get('/:id', SupportController.getTicketById);

// =========================================================================
// STAFF & ADMIN DASHBOARD ROUTES
// =========================================================================

// Staff lists all tickets with status filters
supportRouter.get('/', hasPermission(Permission.SUPPORT_MANAGE), validate(getTicketsFilterSchema), SupportController.getStaffTickets);

// Staff assigns a ticket to an agent
supportRouter.patch('/:id/assign', hasPermission(Permission.SUPPORT_MANAGE), validate(assignTicketSchema), SupportController.assignTicket);

// Staff resolves or closes a support ticket
supportRouter.patch('/:id/close', hasPermission(Permission.SUPPORT_MANAGE), SupportController.closeTicket);

export default supportRouter;
