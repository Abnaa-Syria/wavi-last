import { Request, Response } from 'express';
import { FaqService } from './faq.service.js';
import { sendSuccess } from '../../utils/response.util.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';

export class FaqController {
  /**
   * Controller handler for listing grouped FAQs (Public)
   */
  public static getGroupedFaqs = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const categories = await FaqService.getGroupedFaqs();
    sendSuccess(res, 'تم استرجاع الأسئلة الشائعة بنجاح', { categories });
  });

  /**
   * Controller handler for creating an FAQ Category (Admin Only)
   */
  public static createFaqCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const category = await FaqService.createFaqCategory(req.body);
    sendSuccess(res, 'تم إنشاء قسم الأسئلة الشائعة بنجاح', { category }, 201);
  });

  /**
   * Controller handler for creating an FAQ Q&A item (Admin Only)
   */
  public static createFaq = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const faq = await FaqService.createFaq(req.body);
    sendSuccess(res, 'تم إنشاء السؤال الشائع بنجاح', { faq }, 201);
  });
  // أضف هذه الميثودز جوه كلاس FaqController الحالي

  /**
   * جلب كل البيانات للوحة التحكم (Admin Only)
   */
  public static getAllForAdmin = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const categories = await FaqService.getAllForAdmin();
    sendSuccess(res, 'تم استرجاع كل البيانات للوحة التحكم بنجاح', { categories });
  });

  /**
   * تحديث قسم
   */
  public static updateCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const category = await FaqService.updateCategory(id!, req.body);
    sendSuccess(res, 'تم تحديث القسم بنجاح', { category });
  });

  /**
   * حذف قسم
   */
  public static deleteCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await FaqService.deleteCategory(id!);
    sendSuccess(res, result.message);
  });

  /**
   * تحديث سؤال
   */
  public static updateFaq = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const faq = await FaqService.updateFaq(id!, req.body);
    sendSuccess(res, 'تم تحديث السؤال الشائع بنجاح', { faq });
  });

  /**
   * حذف سؤال
   */
  public static deleteFaq = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await FaqService.deleteFaq(id!);
    sendSuccess(res, result.message);
  });
}
export default FaqController;
