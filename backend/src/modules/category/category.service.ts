import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/error.util.js';

export interface CreateCategoryInput {
  nameAr: string;
  nameEn?: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  imageUrl?: string;
  iconUrl?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

export class CategoryService {
  /**
   * Create a new category with slug uniqueness and parent category checks
   */
  public static async createCategory(data: CreateCategoryInput) {
    const slugLower = data.slug.toLowerCase().trim();

    // 1. Verify slug is unique
    const existingSlug = await prisma.category.findUnique({
      where: { slug: slugLower },
    });
    if (existingSlug) {
      throw new AppError('هذا الرابط (Slug) مستخدم بالفعل', 400);
    }

    const parentId = (data.parentId === '' || data.parentId === 'null' || data.parentId === null) ? null : data.parentId;

    // 2. Verify parent category exists if parentId is provided
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new AppError('القسم الأب المحدد غير موجود', 400);
      }
    }

    return await prisma.category.create({
      data: {
        nameAr: data.nameAr.trim(),
        nameEn: data.nameEn ? data.nameEn.trim() : null,
        slug: slugLower,
        descriptionAr: data.descriptionAr ? data.descriptionAr.trim() : null,
        descriptionEn: data.descriptionEn ? data.descriptionEn.trim() : null,
        imageUrl: data.imageUrl || null,
        iconUrl: data.iconUrl || null,
        parentId: parentId,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
      },
    });
  }

  /**
   * Fetch all categories (optionally nested by parent-child tree format)
   * @param mainOnly - If true, fetches only root level parent categories (parentId: null) and eagerly includes children
   */
  public static async getAllCategories(mainOnly = false) {
    const filter: any = {};
    if (mainOnly) {
      filter.parentId = null;
    }

    return await prisma.category.findMany({
      where: filter,
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Fetch a single category by its unique URL slug
   */
  public static async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug: slug.toLowerCase().trim() },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      throw new AppError('القسم المطلوب غير موجود', 404);
    }

    return category;
  }

  /**
   * Update category attributes with safe validation checks
   */
  public static async updateCategory(id: string, data: UpdateCategoryInput) {
    // 1. Confirm category exists
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new AppError('القسم المراد تعديله غير موجود', 404);
    }

    const parentId = data.parentId !== undefined ? ((data.parentId === '' || data.parentId === 'null' || data.parentId === null) ? null : data.parentId) : undefined;

    // 2. Prevent a category from parenting itself
    if (parentId && parentId === id) {
      throw new AppError('لا يمكن للقسم أن يكون أباً لنفسه', 400);
    }

    // 3. Confirm parent exists if parentId is supplied
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new AppError('القسم الأب المحدد غير موجود', 400);
      }
    }

    // 4. Confirm new slug is not taken
    if (data.slug) {
      const slugLower = data.slug.toLowerCase().trim();
      const existingSlug = await prisma.category.findFirst({
        where: { slug: slugLower, id: { not: id } },
      });
      if (existingSlug) {
        throw new AppError('هذا الرابط (Slug) مستخدم بالفعل', 400);
      }
    }

    return await prisma.category.update({
      where: { id },
      data: {
        nameAr: data.nameAr !== undefined ? data.nameAr.trim() : undefined,
        nameEn: data.nameEn !== undefined ? (data.nameEn ? data.nameEn.trim() : null) : undefined,
        slug: data.slug !== undefined ? data.slug.toLowerCase().trim() : undefined,
        descriptionAr: data.descriptionAr !== undefined ? (data.descriptionAr ? data.descriptionAr.trim() : null) : undefined,
        descriptionEn: data.descriptionEn !== undefined ? (data.descriptionEn ? data.descriptionEn.trim() : null) : undefined,
        imageUrl: data.imageUrl !== undefined ? (data.imageUrl || null) : undefined,
        iconUrl: data.iconUrl !== undefined ? (data.iconUrl || null) : undefined,
        parentId: parentId,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        isFeatured: data.isFeatured !== undefined ? data.isFeatured : undefined,
      },
    });
  }

  /**
   * Delete a category with dependency safety guards
   */
  public static async deleteCategory(id: string) {
    // 1. Confirm category exists
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new AppError('القسم المراد حذفه غير موجود', 404);
    }

    // 2. Safety block: prevent deletion if it contains child subcategories
    const childrenCount = await prisma.category.count({
      where: { parentId: id },
    });
    if (childrenCount > 0) {
      throw new AppError('لا يمكن حذف هذا القسم لأنه يحتوي على أقسام فرعية', 400);
    }

    // 3. Safety block: prevent deletion if products are attached to it
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });
    if (productsCount > 0) {
      throw new AppError('لا يمكن حذف هذا القسم لأنه يحتوي على منتجات مرتبطة به', 400);
    }

    await prisma.category.delete({
      where: { id },
    });

    return { message: 'تم حذف القسم بنجاح' };
  }
}
