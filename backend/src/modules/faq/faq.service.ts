import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/error.util.js';

export interface CreateFaqCategoryInput {
  nameAr: string;
  nameEn?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateFaqInput {
  categoryId?: string | null;
  questionAr: string;
  questionEn?: string | null;
  answerAr: string;
  answerEn?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export class FaqService {
  /**
   * Fetches all active FAQs grouped by active categories (Public Home Page)
   */
  public static async getGroupedFaqs() {
    return await prisma.faqCategory.findMany({
      where: { isActive: true },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Creates a new FAQ Category (Admin Only)
   */
  public static async createFaqCategory(data: CreateFaqCategoryInput) {
    return await prisma.faqCategory.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Creates a new FAQ Q&A item (Admin Only)
   */
  public static async createFaq(data: CreateFaqInput) {
    // Verify category exists if provided
    if (data.categoryId) {
      const category = await prisma.faqCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new AppError('قسم الأسئلة الشائعة المحدد غير موجود', 404);
      }
    }

    return await prisma.faq.create({
      data: {
        categoryId: data.categoryId || null,
        questionAr: data.questionAr,
        questionEn: data.questionEn || null,
        answerAr: data.answerAr,
        answerEn: data.answerEn || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }
  public static async getAllForAdmin() {
    return await prisma.faqCategory.findMany({
      include: {
        faqs: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * تحديث قسم
   */
  public static async updateCategory(id: string, data: Partial<CreateFaqCategoryInput>) {
    const category = await prisma.faqCategory.findUnique({ where: { id } });
    if (!category) throw new AppError('قسم الأسئلة الشائعة غير موجود', 404);

    return await prisma.faqCategory.update({
      where: { id },
      data,
    });
  }

  /**
   * مسح قسم (بشرط ميكونش جواه أسئلة عشان متضربش فورين كي)
   */
  public static async deleteCategory(id: string) {
    const category = await prisma.faqCategory.findUnique({
      where: { id },
      include: { _count: { select: { faqs: true } } },
    });
    if (!category) throw new AppError('قسم الأسئلة الشائعة غير موجود', 404);
    if (category._count.faqs > 0) throw new AppError('لا يمكن حذف القسم لأنه يحتوي على أسئلة مرتبطة به', 400);

    await prisma.faqCategory.delete({ where: { id } });
    return { message: 'تم حذف القسم بنجاح' };
  }

  /**
   * تحديث سؤال وجواب
   */
  public static async updateFaq(id: string, data: Partial<CreateFaqInput>) {
    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new AppError('السؤال الشائع غير موجود', 404);

    if (data.categoryId) {
      const category = await prisma.faqCategory.findUnique({ where: { id: data.categoryId } });
      if (!category) throw new AppError('القسم الجديد المحدد غير موجود', 404);
    }

    return await prisma.faq.update({
      where: { id },
      data,
    });
  }

  /**
   * مسح سؤال وجواب
   */
  public static async deleteFaq(id: string) {
    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new AppError('السؤال الشائع غير موجود', 404);

    await prisma.faq.delete({ where: { id } });
    return { message: 'تم حذف السؤال الشائع بنجاح' };
  }
}
export default FaqService;
