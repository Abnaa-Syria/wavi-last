import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/error.util.js';

export interface AddItemInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
  customerData?: any;
}

export class CartService {
  /**
   * Retrieves the active cart for a user, or creates one if it does not exist
   */
  public static async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                slug: true,
                basePrice: true,
                compareAtPrice: true,
                productType: true,
                deliveryMethod: true,
                isActive: true,
              },
            },
            variant: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                price: true,
                compareAtPrice: true,
                isActive: true,
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  nameAr: true,
                  nameEn: true,
                  slug: true,
                  basePrice: true,
                  compareAtPrice: true,
                  productType: true,
                  deliveryMethod: true,
                  isActive: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  nameAr: true,
                  nameEn: true,
                  price: true,
                  compareAtPrice: true,
                  isActive: true,
                },
              },
            },
            orderBy: { addedAt: 'desc' },
          },
        },
      });
    }

    return cart;
  }

  /**
   * Adds an item to the user's cart. Handles active verification and quantity increments.
   */
  public static async addItemToCart(userId: string, data: AddItemInput) {
    // 1. Verify that the product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });
    if (!product || !product.isActive) {
      throw new AppError('المنتج المطلوب غير موجود أو غير نشط حالياً', 400);
    }

    // 2. Verify that the variant exists, belongs to the product, and is active
    if (data.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: data.variantId },
      });
      if (!variant || variant.productId !== data.productId || !variant.isActive) {
        throw new AppError('خيار المنتج (Variant) المحدد غير صحيح أو غير متوفر', 400);
      }
    }

    // 3. Retrieve or create the user's cart
    const cart = await this.getOrCreateCart(userId);

    // 4. Check if the exact product + variant combination is already in the cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId || null,
      },
    });

    if (existingItem) {
      // Increment quantity and update customer data if supplied
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + data.quantity,
          customerData: data.customerData !== undefined ? data.customerData : existingItem.customerData,
        },
      });
    }

    // Create a new cart item
    return await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId || null,
        quantity: data.quantity,
        customerData: data.customerData || null,
      },
    });
  }

  /**
   * Removes a specific item from the user's cart with safety check
   */
  public static async removeItemFromCart(userId: string, cartItemId: string) {
    // 1. Confirm the cart item exists and belongs to the active user's cart
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new AppError('عنصر السلة المطلوب غير موجود أو لا ينتمي لسلتك', 404);
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return { message: 'تم حذف العنصر من السلة بنجاح' };
  }

  /**
   * Updates an existing cart item's quantity and/or customerData
   */
  public static async updateCartItem(userId: string, cartItemId: string, data: { quantity?: number; customerData?: any }) {
    // 1. Confirm the cart item exists and belongs to the active user's cart
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new AppError('عنصر السلة المطلوب غير موجود أو لا ينتمي لسلتك', 404);
    }

    const updateData: any = {};
    if (data.quantity !== undefined) {
      if (data.quantity < 1) {
        throw new AppError('الكمية يجب أن تكون ١ على الأقل', 400);
      }
      updateData.quantity = data.quantity;
    }
    if (data.customerData !== undefined) {
      updateData.customerData = data.customerData;
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: updateData,
    });

    return updated;
  }
}
export default CartService;
