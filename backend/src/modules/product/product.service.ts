import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/error.util.js';
import { ProductType, DeliveryMethod, Prisma } from '@prisma/client';

export interface CreateProductInput {
  sku?: string;
  nameAr: string;
  nameEn?: string;
  slug?: string;
  shortDescAr?: string;
  shortDescEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  productType: ProductType;
  deliveryMethod?: DeliveryMethod;
  categoryId: string;
  basePrice?: number;
  price?: number;
  compareAtPrice?: number;
  currency?: string;
  trackInventory?: boolean;
  stockQty?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isDigital?: boolean;
  requiresInfo?: boolean;
  geoRestricted?: boolean;
  restrictedCountries?: any;
  variants?: {
    id?: string;
    nameAr: string;
    price: number;
    isActive?: boolean;
  }[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\u0621-\u064A-]+/g, '') // Remove all non-word chars (allow Arabic letters)
    .replace(/--+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function getDefaultDeliveryMethod(type: ProductType): DeliveryMethod {
  switch (type) {
    case ProductType.SUBSCRIPTION:
      return DeliveryMethod.WHATSAPP;
    case ProductType.DIGITAL_FILE:
      return DeliveryMethod.AUTO_FILE;
    case ProductType.GAME_CURRENCY:
    case ProductType.SOCIAL_SERVICE:
      return DeliveryMethod.MANUAL;
    case ProductType.PHYSICAL:
      return DeliveryMethod.SHIPPING;
    default:
      return DeliveryMethod.MANUAL;
  }
}

export class ProductService {
  /**
   * Create a new product under category constraints
   */
  public static async createProduct(data: CreateProductInput) {
    // 1. Verify Category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new AppError(`Category with ID ${data.categoryId} not found`, 400);
    }

    const priceVal = data.basePrice !== undefined ? data.basePrice : (data.price !== undefined ? data.price : 0);
    const deliveryMethod = data.deliveryMethod || getDefaultDeliveryMethod(data.productType);
    const slug = data.slug || `${slugify(data.nameAr)}-${Date.now()}`;
    const sku = data.sku || `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now()}`;

    // 2. Check if SKU is unique
    const existingSku = await prisma.product.findUnique({
      where: { sku: sku },
    });
    if (existingSku) {
      throw new AppError(`Product SKU '${sku}' is already taken`, 409);
    }

    // 3. Check if slug is unique
    const existingSlug = await prisma.product.findUnique({
      where: { slug: slug },
    });
    if (existingSlug) {
      throw new AppError(`Product slug '${slug}' is already taken`, 409);
    }

    const product = await prisma.product.create({
      data: {
        sku: sku,
        nameAr: data.nameAr,
        nameEn: data.nameEn || null,
        slug: slug,
        shortDescAr: data.shortDescAr || null,
        shortDescEn: data.shortDescEn || null,
        descriptionAr: data.descriptionAr || null,
        descriptionEn: data.descriptionEn || null,
        productType: data.productType,
        deliveryMethod: deliveryMethod,
        category: { connect: { id: data.categoryId } },
        basePrice: new Prisma.Decimal(priceVal),
        compareAtPrice: data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null,
        currency: data.currency || 'SAR',
        trackInventory: data.trackInventory ?? false,
        stockQty: data.stockQty ?? null,
        lowStockThreshold: data.lowStockThreshold ?? null,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        isDigital: data.isDigital ?? (data.productType !== ProductType.PHYSICAL),
        requiresInfo: data.requiresInfo ?? false,
        geoRestricted: data.geoRestricted ?? false,
        restrictedCountries: data.restrictedCountries ?? null,
      },
      include: {
        category: true,
      },
    });

    if (data.variants && data.variants.length > 0) {
      await prisma.productVariant.createMany({
        data: data.variants.map((v, i) => ({
          productId: product.id,
          sku: `${sku}-VAR-${i + 1}-${Date.now()}`,
          nameAr: v.nameAr,
          price: new Prisma.Decimal(v.price),
          isActive: v.isActive ?? true,
          sortOrder: i,
        })),
      });
    }

    return await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  /**
   * Get all products (with category relational loading and deep dynamic filters)
   */
  public static async getAllProducts(filters: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  } = {}) {
    const filterConditions: Prisma.ProductWhereInput = {};

    // 1. Category Filter: supports category ID or Category Slug
    if (filters.category) {
      const categoryObj = await prisma.category.findFirst({
        where: {
          OR: [
            { id: filters.category },
            { slug: filters.category }
          ]
        }
      });
      if (categoryObj) {
        filterConditions.categoryId = categoryObj.id;
      } else {
        filterConditions.categoryId = filters.category;
      }
    }

    // 2. Search query filter (case-insensitive contains on name/desc)
    if (filters.search) {
      filterConditions.OR = [
        { nameAr: { contains: filters.search } },
        { nameEn: { contains: filters.search } },
        { shortDescAr: { contains: filters.search } },
      ];
    }

    // 3. Price boundaries filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filterConditions.basePrice = {};
      if (filters.minPrice !== undefined) {
        filterConditions.basePrice.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        filterConditions.basePrice.lte = filters.maxPrice;
      }
    }

    // 4. Sort selection mapping
    let orderByCondition: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (filters.sortBy === 'priceAsc') {
      orderByCondition = { basePrice: 'asc' };
    } else if (filters.sortBy === 'priceDesc') {
      orderByCondition = { basePrice: 'desc' };
    } else if (filters.sortBy === 'newest') {
      orderByCondition = { createdAt: 'desc' };
    }

    return await prisma.product.findMany({
      where: filterConditions,
      include: {
        category: true,
        variants: true,
      },
      orderBy: orderByCondition,
    });
  }

  /**
   * Get a single product by UUID/CUID or Slug
   */
  public static async getProductById(id: string) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        activationSteps: {
          orderBy: { stepNo: 'asc' }
        }
      },
    });

    if (!product) {
      throw new AppError(`Product with ID or Slug ${id} not found`, 404);
    }

    return product;
  }

  /**
   * Update a product record
   */
  public static async updateProduct(id: string, data: UpdateProductInput) {
    // 1. Verify existence
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true }
    });
    if (!existingProduct) {
      throw new AppError(`Product with ID ${id} not found`, 404);
    }

    // 2. Verify Category if changing
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new AppError(`Category with ID ${data.categoryId} not found`, 400);
      }
    }

    // 3. Verify SKU uniqueness
    const finalSku = data.sku || existingProduct.sku;
    if (data.sku && data.sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findFirst({
        where: { sku: data.sku, id: { not: id } },
      });
      if (existingSku) {
        throw new AppError(`Product SKU '${data.sku}' is already taken`, 409);
      }
    }

    // 4. Verify Slug uniqueness
    if (data.slug && data.slug !== existingProduct.slug) {
      const existingSlug = await prisma.product.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });
      if (existingSlug) {
        throw new AppError(`Product slug '${data.slug}' is already taken`, 409);
      }
    }

    const priceVal = data.basePrice !== undefined ? data.basePrice : (data.price !== undefined ? data.price : undefined);

    const updateData: Prisma.ProductUpdateInput = {
      sku: data.sku,
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      slug: data.slug,
      shortDescAr: data.shortDescAr,
      shortDescEn: data.shortDescEn,
      descriptionAr: data.descriptionAr,
      descriptionEn: data.descriptionEn,
      productType: data.productType,
      deliveryMethod: data.deliveryMethod,
      currency: data.currency,
      trackInventory: data.trackInventory,
      stockQty: data.stockQty,
      lowStockThreshold: data.lowStockThreshold,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      isDigital: data.isDigital,
      requiresInfo: data.requiresInfo,
      geoRestricted: data.geoRestricted,
      restrictedCountries: data.restrictedCountries,
    };

    if (data.categoryId) {
      updateData.category = { connect: { id: data.categoryId } };
    }

    if (priceVal !== undefined) {
      updateData.basePrice = new Prisma.Decimal(priceVal);
    }
    if (data.compareAtPrice !== undefined) {
      updateData.compareAtPrice = data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null;
    }

    await prisma.product.update({
      where: { id },
      data: updateData,
    });

    if (data.variants !== undefined) {
      const existingVariants = existingProduct.variants || [];
      const existingIds = existingVariants.map(v => v.id);
      
      const incomingVariants = data.variants;
      const incomingIds = incomingVariants.filter(v => v.id).map(v => v.id);
      
      const idsToDelete = existingIds.filter(vId => !incomingIds.includes(vId));
      if (idsToDelete.length > 0) {
        for (const idToDelete of idsToDelete) {
          try {
            await prisma.productVariant.delete({ where: { id: idToDelete } });
          } catch (err) {
            await prisma.productVariant.update({
              where: { id: idToDelete },
              data: { isActive: false }
            });
          }
        }
      }

      for (let i = 0; i < incomingVariants.length; i++) {
        const v = incomingVariants[i];
        if (!v) continue;
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              nameAr: v.nameAr,
              price: new Prisma.Decimal(v.price),
              isActive: v.isActive ?? true,
              sortOrder: i,
            }
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: id,
              sku: `${finalSku}-VAR-${i + 1}-${Date.now()}`,
              nameAr: v.nameAr,
              price: new Prisma.Decimal(v.price),
              isActive: v.isActive ?? true,
              sortOrder: i,
            }
          });
        }
      }
    }

    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  /**
   * Delete a product record
   */
  public static async deleteProduct(id: string) {
    await this.getProductById(id);

    await prisma.product.delete({
      where: { id },
    });

    return { message: 'Product successfully deleted' };
  }
}
