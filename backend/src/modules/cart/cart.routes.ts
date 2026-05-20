import { Router } from 'express';
import { CartController } from './cart.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { addToCartSchema, removeFromCartSchema, updateCartItemSchema } from './cart.validation.js';

export const cartRouter = Router();

// All cart endpoints are strictly protected
cartRouter.use(protect);

cartRouter.get('/', CartController.getCart);
cartRouter.post('/items', validate(addToCartSchema), CartController.addItem);
cartRouter.patch('/items/:id', validate(updateCartItemSchema), CartController.updateItem);
cartRouter.delete('/items/:id', validate(removeFromCartSchema), CartController.removeItem);

export default cartRouter;
