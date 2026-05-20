import { Request, Response } from 'express';
import { MarketingService } from './marketing.service.js';
import { sendSuccess } from '../../utils/response.util.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';

export class MarketingController {
  // =========================================================================
  // COUPONS SUB-MODULE
  // =========================================================================

  /**
   * Controller handler for creating a coupon (Admin Only)
   */
  public static createCoupon = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const coupon = await MarketingService.createCoupon(req.body);
    sendSuccess(res, 'Coupon created successfully', { coupon }, 201);
  });

  /**
   * Controller handler for retrieving all coupons (Admin Only)
   */
  public static getAllCoupons = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const coupons = await MarketingService.getAllCoupons();
    sendSuccess(res, 'Coupons retrieved successfully', { coupons });
  });

  /**
   * Controller handler for deleting a coupon code (Admin Only)
   */
  public static deleteCoupon = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await MarketingService.deleteCoupon(id!);
    sendSuccess(res, 'Coupon deleted successfully');
  });

  /**
   * Controller handler for validating a coupon code (Public)
   */
  public static validateCoupon = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { code, subtotal } = req.body;
    // Extract userId optionally from req.user if the request is authenticated
    const userId = req.user?.id || null;

    const result = await MarketingService.validateCoupon(userId, code, subtotal);
    sendSuccess(res, 'Coupon validated successfully', result);
  });

  // =========================================================================
  // SALES SUB-MODULE
  // =========================================================================

  /**
   * Controller handler for creating a direct campaign sale (Admin Only)
   */
  public static createSale = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const sale = await MarketingService.createSale(req.body);
    sendSuccess(res, 'Sale campaign created successfully', { sale }, 201);
  });

  // =========================================================================
  // BANNERS SUB-MODULE
  // =========================================================================

  /**
   * Controller handler for retrieving active slider banners (Public)
   */
  public static getBanners = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const placement = (req.query.placement as string) || 'hero';
    const banners = await MarketingService.getActiveBanners(placement);
    sendSuccess(res, 'Banners retrieved successfully', { banners });
  });

  /**
   * Controller handler for creating a new slider banner (Admin Only)
   */
  public static createBanner = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const banner = await MarketingService.createBanner(req.body);
    sendSuccess(res, 'Banner created successfully', { banner }, 201);
  });

  /**
   * Controller handler for updating an existing coupon (Admin Only)
   */
  public static updateCoupon = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const coupon = await MarketingService.updateCoupon(id!, req.body);
    sendSuccess(res, 'Coupon updated successfully', { coupon });
  });

  /**
   * Controller handler for listing all banners (Admin Only)
   */
  public static getAllBanners = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const placement = req.query.placement as string | undefined;
    const banners = await MarketingService.getAllBanners(placement);
    sendSuccess(res, 'All banners retrieved successfully', { banners });
  });

  /**
   * Controller handler for deleting a banner (Admin Only)
   */
  public static deleteBanner = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await MarketingService.deleteBanner(id!);
    sendSuccess(res, 'Banner deleted successfully');
  });

  /**
   * Controller handler for fetching settings key-value configuration
   */
  public static getSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const group = req.query.group as string | undefined;
    const settings = await MarketingService.getSettings(group);
    sendSuccess(res, 'Settings retrieved successfully', { settings });
  });

  /**
   * Controller handler for updating settings configuration in bulk (Admin Only)
   */
  public static saveSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await MarketingService.saveSettings(req.body);
    sendSuccess(res, 'Settings saved successfully', { settings: result });
  });
}
export default MarketingController;
