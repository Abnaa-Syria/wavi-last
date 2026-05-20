import { Router } from 'express';
import { MarketingController } from './marketing.controller.js';
import { protect, hasPermission, optionalProtect } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
  createSaleSchema,
  getBannersSchema,
  createBannerSchema,
} from './marketing.validation.js';
import { Permission } from '@prisma/client';

export const marketingRouter = Router();

// =========================================================================
// PUBLIC ENDPOINTS (Storefront)
// =========================================================================

// Public fetch for slider banners
marketingRouter.get('/banners', validate(getBannersSchema), MarketingController.getBanners);

// Public fetch for global settings config
marketingRouter.get('/settings', MarketingController.getSettings);

// Public validation of coupon codes during checkout (accepts guest and authenticated checkouts)
marketingRouter.post(
  '/coupons/validate',
  optionalProtect,
  validate(validateCouponSchema),
  MarketingController.validateCoupon
);

// =========================================================================
// SECURED ENDPOINTS (Admin & Support Only)
// =========================================================================
marketingRouter.use(protect);

// Coupon management (restricted to Coupon Create permissions)
marketingRouter.post('/coupons', hasPermission(Permission.COUPON_CREATE), validate(createCouponSchema), MarketingController.createCoupon);
marketingRouter.get('/coupons', hasPermission(Permission.COUPON_CREATE), MarketingController.getAllCoupons);
marketingRouter.patch('/coupons/:id', hasPermission(Permission.COUPON_CREATE), validate(updateCouponSchema), MarketingController.updateCoupon);
marketingRouter.delete('/coupons/:id', hasPermission(Permission.COUPON_CREATE), MarketingController.deleteCoupon);

// Sale/Offers campaigns (restricted to Coupon Create permissions)
marketingRouter.post('/sales', hasPermission(Permission.COUPON_CREATE), validate(createSaleSchema), MarketingController.createSale);

// Banner settings & Global configs (restricted to Settings Manage permission)
marketingRouter.post('/banners', hasPermission(Permission.SETTINGS_MANAGE), validate(createBannerSchema), MarketingController.createBanner);
marketingRouter.get('/banners/admin', hasPermission(Permission.SETTINGS_MANAGE), MarketingController.getAllBanners);
marketingRouter.delete('/banners/:id', hasPermission(Permission.SETTINGS_MANAGE), MarketingController.deleteBanner);

marketingRouter.post('/settings', hasPermission(Permission.SETTINGS_MANAGE), MarketingController.saveSettings);

export default marketingRouter;
