import { Request, Response } from 'express';
import { OrderService } from './order.service.js';
import { sendSuccess } from '../../utils/response.util.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';
import { AppError } from '../../utils/error.util.js';
import { OrderStatus } from '@prisma/client';

export class OrderController {
  /**
   * Controller handler for performing cart checkout and order creation
   */
  public static checkout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('عذراً، يجب تسجيل الدخول لإنشاء الطلب', 401);
    }
    const order = await OrderService.checkout(req.user.id, req.body);
    sendSuccess(res, 'Order created successfully', { order }, 201);
  });

  /**
   * Controller handler for retrieving the logged-in customer's order history
   */
  public static getMyOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('عذراً، يجب تسجيل الدخول للوصول إلى طلباتك', 401);
    }
    const orders = await OrderService.getCustomerOrders(req.user.id);
    sendSuccess(res, 'Orders retrieved successfully', { orders });
  });

  /**
   * Controller handler for fetching all orders in the administrative queue (Admin Only)
   */
  public static getAdminOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const status = req.query.status as OrderStatus | undefined;
    const orders = await OrderService.getAdminOrders(status);
    sendSuccess(res, 'Admin orders retrieved successfully', { orders });
  });

  /**
   * Controller handler for updating an order's status and logging history audit entries (Admin Only)
   */
  public static updateStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('عذراً، يجب تسجيل الدخول لتنفيذ هذا الإجراء', 401);
    }
    const { id } = req.params;
    const order = await OrderService.updateOrderStatus(id!, req.user.id, req.body);
    sendSuccess(res, 'Order status updated successfully', { order });
  });
}
export default OrderController;
