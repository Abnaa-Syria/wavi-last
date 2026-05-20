import { Request, Response } from 'express';
import { CategoryService } from './category.service.js';
import { sendSuccess } from '../../utils/response.util.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';

export class CategoryController {
  /**
   * Controller handler for creating a new product category
   */
  public static create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const category = await CategoryService.createCategory(req.body);
    sendSuccess(res, 'Category created successfully', { category }, 201);
  });

  /**
   * Controller handler for fetching all categories (supports root-only query mainOnly=true)
   */
  public static getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const mainOnly = req.query.mainOnly === 'true';
    const categories = await CategoryService.getAllCategories(mainOnly);
    sendSuccess(res, 'Categories retrieved successfully', { categories });
  });

  /**
   * Controller handler for fetching a single category by slug
   */
  public static getBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const category = await CategoryService.getCategoryBySlug(slug!);
    sendSuccess(res, 'Category retrieved successfully', { category });
  });

  /**
   * Controller handler for modifying category attributes
   */
  public static update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const category = await CategoryService.updateCategory(id!, req.body);
    sendSuccess(res, 'Category updated successfully', { category });
  });

  /**
   * Controller handler for deleting a category with dependency checks
   */
  public static delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await CategoryService.deleteCategory(id!);
    sendSuccess(res, result.message, null);
  });
}
export default CategoryController;
