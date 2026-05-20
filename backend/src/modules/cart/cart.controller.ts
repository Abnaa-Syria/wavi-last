import { Request, Response } from 'express';
import { CartService } from './cart.service.js';
import { sendSuccess } from '../../utils/response.util.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';
import { AppError } from '../../utils/error.util.js';

export class CartController {
  /**
   * Controller handler for retrieving the authenticated user's active cart
   */
  public static getCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('عذراً، يجب تسجيل الدخول للوصول إلى السلة', 401);
    }
    const cart = await CartService.getOrCreateCart(req.user.id);
    sendSuccess(res, 'Cart retrieved successfully', { cart });
  });

  /**
   * Controller handler for adding a product variant to the user's cart
   */
  public static addItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('عذراً، يجب تسجيل الدخول لإضافة عناصر للسلة', 401);
    }
    const item = await CartService.addItemToCart(req.user.id, req.body);
    sendSuccess(res, 'Item added to cart successfully', { item }, 201);
  });

  /**
   * Controller handler for removing a product variant item from the user's cart
   */
  public static removeItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('عذراً، يجب تسجيل الدخول لتعديل السلة', 401);
    }
    const { id } = req.params;
    const result = await CartService.removeItemFromCart(req.user.id, id!);
    sendSuccess(res, result.message, null);
  });

  /**
   * Controller handler for updating a product variant item's quantity or data in the user's cart
   */
  public static updateItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('عذراً، يجب تسجيل الدخول لتعديل السلة', 401);
    }
    const { id } = req.params;
    const item = await CartService.updateCartItem(req.user.id, id!, req.body);
    sendSuccess(res, 'Cart item updated successfully', { item });
  });
}
export default CartController;
