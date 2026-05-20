import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/error.util.js';
import { OrderStatus, PaymentStatus, CouponType } from '@prisma/client';

export interface CheckoutInput {
  couponCode?: string | null;
  customerPhone?: string | null;
  customerNotes?: string | null;
  addressId?: string | null;
}

export class OrderService {
  /**
   * Performs cart checkout inside a database transaction to create an Order record,
   * validate coupon restrictions, create snapshots of order items, and clear the cart.
   */
  public static async checkout(userId: string, data: CheckoutInput) {
    // 1. Fetch user's cart with all active items, products, and variants
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: true,
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('لا توجد عناصر في السلة لإتمام الطلب. يرجى إضافة منتجات أولاً.', 400);
    }

    // 2. Calculate subtotal and map order items
    let subtotal = 0;
    const itemsSnapshot = cart.items.map((item) => {
      let unitPrice = 0;
      let variantNameAr: string | null = null;

      if (item.variantId && item.variant) {
        unitPrice = Number(item.variant.price);
        variantNameAr = item.variant.nameAr;
      } else {
        unitPrice = Number(item.product.basePrice);
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        productNameAr: item.product.nameAr,
        productNameEn: item.product.nameEn,
        variantNameAr,
        productType: item.product.productType,
        deliveryMethod: item.product.deliveryMethod,
        customerData: item.customerData || undefined,
      };
    });

    // 3. Process and validate coupon if provided
    let discountAmount = 0;
    let couponId: string | null = null;
    let validCouponCode: string | null = null;

    if (data.couponCode) {
      const codeUpper = data.couponCode.toUpperCase().trim();
      const coupon = await prisma.coupon.findUnique({
        where: { code: codeUpper },
      });

      if (!coupon || !coupon.isActive) {
        throw new AppError('كود الخصم المدخل غير صحيح أو غير مفعل حالياً', 400);
      }

      // Check date bounds
      const now = new Date();
      if (coupon.startsAt && now < new Date(coupon.startsAt)) {
        throw new AppError('كود الخصم لم يبدأ تفعيله بعد', 400);
      }
      if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
        throw new AppError('كود الخصم المدخل قد انتهت صلاحيته', 400);
      }

      // Check min order threshold
      if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
        throw new AppError(`هذا الكوبون يتطلب حد أدنى للطلب بقيمة ${coupon.minOrderAmount} ريال`, 400);
      }

      // Check max uses limit
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        throw new AppError('لقد استنفد هذا الكوبون الحد الأقصى للاستخدام المسموح به', 400);
      }

      // Check max uses per specific user
      if (coupon.maxUsesPerUser) {
        const userCouponUses = await prisma.order.count({
          where: {
            userId,
            couponId: coupon.id,
            status: { not: OrderStatus.CANCELLED },
          },
        });

        if (userCouponUses >= coupon.maxUsesPerUser) {
          throw new AppError('لقد استنفدت الحد الأقصى لاستخدام هذا الكوبون لحسابك', 400);
        }
      }

      // Calculate discount amount
      if (coupon.type === CouponType.PERCENTAGE) {
        discountAmount = subtotal * (Number(coupon.value) / 100);
      } else if (coupon.type === CouponType.FIXED_AMOUNT) {
        discountAmount = Number(coupon.value);
      }

      // Ensure discount doesn't exceed order subtotal
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }

      couponId = coupon.id;
      validCouponCode = coupon.code;
    }

    const total = subtotal - discountAmount;

    // 4. Generate readable unique orderNumber (WAVI-2026-XXXXX)
    let orderNumber = '';
    let isUnique = false;
    while (!isUnique) {
      const randPart = Math.floor(100000 + Math.random() * 900000);
      orderNumber = `WAVI-2026-${randPart}`;
      const existing = await prisma.order.findUnique({
        where: { orderNumber },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    // 5. Execute Prisma database transaction to ensure data integrity
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: data.addressId || null,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          subtotal,
          discountAmount,
          total,
          couponId,
          couponCode: validCouponCode,
          customerPhone: data.customerPhone || null,
          customerNotes: data.customerNotes || null,
          items: {
            create: itemsSnapshot,
          },
        },
        include: {
          items: true,
        },
      });

      // Increment coupon used count if applicable
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usedCount: { increment: 1 },
          },
        });
      }

      // Automatically log the initial order status audit record
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: OrderStatus.PENDING,
          note: 'تم إنشاء الطلب بنجاح وهو في انتظار الدفع/المراجعة',
          createdBy: userId,
        },
      });

      // Clear the user's cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return order;
  }

  /**
   * Fetches the order history for the logged-in customer
   */
  public static async getCustomerOrders(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                media: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetches all system orders for admin/support queues with status filtration
   */
  public static async getAdminOrders(status?: OrderStatus) {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    return await prisma.order.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Updates the OrderStatus and logs an audit entry to the OrderStatusHistory table
   */
  public static async updateOrderStatus(
    orderId: string,
    adminUserId: string,
    data: { status: OrderStatus; note?: string | null }
  ) {
    // 1. Confirm the order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new AppError('الطلب المطلوب غير موجود', 404);
    }

    // 2. Perform the update and status audit inside a transaction
    return await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: data.status,
          fulfilledAt: data.status === OrderStatus.FULFILLED ? new Date() : undefined,
          cancelledAt: data.status === OrderStatus.CANCELLED ? new Date() : undefined,
        },
        include: {
          items: true,
        },
      });

      // Create OrderStatusHistory audit log record
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: data.status,
          note: data.note || `تم تغيير حالة الطلب بنجاح إلى: ${data.status}`,
          createdBy: adminUserId,
        },
      });

      return updatedOrder;
    });
  }
}
export default OrderService;
