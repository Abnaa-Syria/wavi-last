import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/error.util.js';

/**
 * Generic request schema validator middleware using Zod parsing
 * @param schema - Zod validation schema definition
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Strip parent field names from paths and format beautifully
        const errorMessages = error.errors.map(
          (err) => `${err.path.slice(1).join('.')} - ${err.message}`
        );
        next(new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400));
      } else {
        next(error);
      }
    }
  };
};
export default validate;
