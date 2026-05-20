import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/error.util.js';
import { CouponType, OrderStatus } from '@prisma/client';

export interface CreateCouponInput {
  code: string;
  descriptionAr?: string | null;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  maxUsesPerUser?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  applicableToAll?: boolean;
  categoryIds?: string[] | null;
  productIds?: string[] | null;
  isActive?: boolean;
}

export interface CreateSaleInput {
  nameAr: string;
  nameEn?: string | null;
  discountPct: number;
  isActive?: boolean;
  startsAt: string;
  expiresAt: string;
  categoryIds?: string[] | null;
  productIds?: string[] | null;
}

export interface CreateBannerInput {
  titleAr?: string | null;
  titleEn?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  placement?: string;
  isActive?: boolean;
  sortOrder?: number;
  startsAt?: string | null;
  expiresAt?: string | null;
}

export class MarketingService {
  // =========================================================================
  // COUPONS SUB-MODULE
  // =========================================================================

  /**
   * Creates a new coupon with uniqueness constraints and date parsers (Admin Only)
   */
  public static async createCoupon(data: CreateCouponInput) {
    const codeUpper = data.code.toUpperCase().trim();

    // Verify uniqueness of code
    const existing = await prisma.coupon.findUnique({
      where: { code: codeUpper },
    });
    if (existing) {
      throw new AppError('كود الخصم هذا موجود بالفعل في النظام', 400);
    }

    return await prisma.coupon.create({
      data: {
        code: codeUpper,
        descriptionAr: data.descriptionAr || null,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount || null,
        maxUses: data.maxUses || null,
        maxUsesPerUser: data.maxUsesPerUser || 1,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        applicableToAll: data.applicableToAll !== undefined ? data.applicableToAll : true,
        categoryIds: (data.categoryIds || null) as any,
        productIds: (data.productIds || null) as any,
      },
    });
  }

  /**
   * Fetches all coupons for admin panel lists (Admin Only)
   */
  public static async getAllCoupons() {
    return await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Deletes a coupon code completely from the database (Admin Only)
   */
  public static async deleteCoupon(id: string) {
    return await prisma.coupon.delete({
      where: { id }
    });
  }

  /**
   * Validates a coupon's active status, date range, purchase thresholds, and usage caps
   */
  public static async validateCoupon(userId: string | null, code: string, subtotal: number) {
    const codeUpper = code.toUpperCase().trim();

    const coupon = await prisma.coupon.findUnique({
      where: { code: codeUpper },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError('كود الخصم المدخل غير صحيح أو غير مفعل حالياً', 400);
    }

    const now = new Date();

    // Check date bounds
    if (coupon.startsAt && now < new Date(coupon.startsAt)) {
      throw new AppError('كود الخصم لم يبدأ تفعيله بعد', 400);
    }
    if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
      throw new AppError('كود الخصم المدخل قد انتهت صلاحيته', 400);
    }

    // Check minimum purchase amount
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      throw new AppError(`هذا الكوبون يتطلب حد أدنى للطلب بقيمة ${coupon.minOrderAmount} ريال`, 400);
    }

    // Check max usage threshold
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new AppError('لقد استنفد هذا الكوبون الحد الأقصى للاستخدام المسموح به', 400);
    }

    // Check max usage per specific user if user context is available
    if (userId && coupon.maxUsesPerUser) {
      const userCouponUsesCount = await prisma.order.count({
        where: {
          userId,
          couponId: coupon.id,
          status: { not: OrderStatus.CANCELLED },
        },
      });

      if (userCouponUsesCount >= coupon.maxUsesPerUser) {
        throw new AppError('لقد استنفدت الحد الأقصى لاستخدام هذا الكوبون لحسابك', 400);
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = subtotal * (Number(coupon.value) / 100);
    } else if (coupon.type === CouponType.FIXED_AMOUNT) {
      discountAmount = Number(coupon.value);
    }

    // Ensure discount doesn't exceed order subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return {
      couponId: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discountAmount,
      finalTotal: subtotal - discountAmount,
    };
  }

  // =========================================================================
  // SALES SUB-MODULE
  // =========================================================================

  /**
   * Creates a promotional campaign sale targeted at specific JSON structures (Admin Only)
   */
  public static async createSale(data: CreateSaleInput) {
    const startsAtDate = new Date(data.startsAt);
    const expiresAtDate = new Date(data.expiresAt);

    if (startsAtDate >= expiresAtDate) {
      throw new AppError('تاريخ بداية العرض يجب أن يكون قبل تاريخ نهايته', 400);
    }

    return await prisma.sale.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn || null,
        discountPct: data.discountPct,
        isActive: data.isActive !== undefined ? data.isActive : true,
        startsAt: startsAtDate,
        expiresAt: expiresAtDate,
        categoryIds: (data.categoryIds || null) as any,
        productIds: (data.productIds || null) as any,
      },
    });
  }

  // =========================================================================
  // BANNERS SUB-MODULE
  // =========================================================================

  /**
   * Fetches active, unexpired banners for frontend layouts (Public)
   */
  public static async getActiveBanners(placement: string) {
    const now = new Date();

    return await prisma.banner.findMany({
      where: {
        placement,
        isActive: true,
        AND: [
          {
            OR: [
              { startsAt: null },
              { startsAt: { lte: now } },
            ],
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Creates a banner metadata record (Admin Only)
   */
  public static async createBanner(data: CreateBannerInput) {
    return await prisma.banner.create({
      data: {
        titleAr: data.titleAr || null,
        titleEn: data.titleEn || null,
        imageUrl: data.imageUrl,
        mobileImageUrl: data.mobileImageUrl || null,
        linkUrl: data.linkUrl || null,
        placement: data.placement || 'hero',
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: data.sortOrder || 0,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  /**
   * Updates an existing coupon by ID (Admin Only)
   */
  public static async updateCoupon(id: string, data: Partial<CreateCouponInput>) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });
    if (!coupon) {
      throw new AppError('كوبون الخصم المراد تعديله غير موجود', 404);
    }

    const updateData: any = {};
    if (data.code !== undefined) {
      const codeUpper = data.code.toUpperCase().trim();
      const existing = await prisma.coupon.findFirst({
        where: { code: codeUpper, id: { not: id } },
      });
      if (existing) {
        throw new AppError('كود الخصم هذا موجود بالفعل في النظام لكوبون آخر', 400);
      }
      updateData.code = codeUpper;
    }

    if (data.descriptionAr !== undefined) updateData.descriptionAr = data.descriptionAr;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.minOrderAmount !== undefined) updateData.minOrderAmount = data.minOrderAmount;
    if (data.maxUses !== undefined) updateData.maxUses = data.maxUses;
    if (data.maxUsesPerUser !== undefined) updateData.maxUsesPerUser = data.maxUsesPerUser;
    if (data.startsAt !== undefined) updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (data.applicableToAll !== undefined) updateData.applicableToAll = data.applicableToAll;
    if (data.categoryIds !== undefined) updateData.categoryIds = data.categoryIds;
    if (data.productIds !== undefined) updateData.productIds = data.productIds;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return await prisma.coupon.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Fetches all banners (active and inactive) for admin reviews (Admin Only)
   */
  public static async getAllBanners(placement?: string) {
    const filter: any = {};
    if (placement) {
      filter.placement = placement;
    }
    return await prisma.banner.findMany({
      where: filter,
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Deletes a banner completely from the database (Admin Only)
   */
  public static async deleteBanner(id: string) {
    const banner = await prisma.banner.findUnique({
      where: { id },
    });
    if (!banner) {
      throw new AppError('البانر المراد حذفه غير موجود', 404);
    }
    return await prisma.banner.delete({
      where: { id }
    });
  }

  /**
   * Fetches all settings, optionally filtered by group
   */
  public static async getSettings(group?: string) {
    const filter: any = {};
    if (group) {
      filter.group = group;
    }
    return await prisma.setting.findMany({
      where: filter,
    });
  }

  /**
   * Bulk upserts settings key-value pairs (Admin Only)
   */
  public static async saveSettings(settings: { key: string; value: string; group?: string }[]) {
    const upserts = settings.map(setting => {
      return prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          group: setting.group || 'general',
        },
      });
    });

    return await prisma.$transaction(upserts);
  }
}
export default MarketingService;
