import { Request, Response } from 'express';
import { ProductService } from './product.service.js';
import { sendSuccess } from '../../utils/response.util.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';

export class ProductController {
  /**
   * Create a new product
   */
  public static create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const product = await ProductService.createProduct(req.body);
    sendSuccess(res, 'Product created successfully', { product }, 201);
  });

  /**
   * Get all products (optionally filtered by category, search, min/max prices, and sorting)
   */
  public static getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const sortBy = req.query.sortBy as string | undefined;

    const products = await ProductService.getAllProducts({
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
    });
    sendSuccess(res, 'Products retrieved successfully', { products });
  });

  /**
   * Get a single product by UUID
   */
  public static getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const product = await ProductService.getProductById(id!);
    sendSuccess(res, 'Product retrieved successfully', { product });
  });

  /**
   * Update product attributes
   */
  public static update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const product = await ProductService.updateProduct(id!, req.body);
    sendSuccess(res, 'Product updated successfully', { product });
  });

  /**
   * Delete a product by UUID
   */
  public static delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await ProductService.deleteProduct(id!);
    sendSuccess(res, result.message, null);
  });
}
export default ProductController;
