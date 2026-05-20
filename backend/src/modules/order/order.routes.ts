import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { protect, hasPermission } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createOrderSchema, updateOrderStatusSchema } from './order.validation.js';
import { Permission } from '@prisma/client';

export const orderRouter = Router();

// All order endpoints are strictly protected by authentication
orderRouter.use(protect);

// Customer endpoints
orderRouter.post('/', validate(createOrderSchema), OrderController.checkout);
orderRouter.get('/my-orders', OrderController.getMyOrders);

// Administrative management endpoints (restricted using Permission-Based Access Control)
orderRouter.get('/', hasPermission(Permission.ORDER_VIEW), OrderController.getAdminOrders);
orderRouter.patch('/:id/status', hasPermission(Permission.ORDER_UPDATE), validate(updateOrderStatusSchema), OrderController.updateStatus);

export default orderRouter;
