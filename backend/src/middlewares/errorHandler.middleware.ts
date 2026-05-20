import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.util.js';

/**
 * Consolidated global centralized Express error catcher middleware
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 1. Handle unique constraint violations from Prisma (MySQL)
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? ` (${(err.meta.target as string[]).join(', ')})` : '';
    err = new AppError(`Duplicate entry detected. This record already exists.${fields}`, 409);
  }

  // 2. Handle missing resource records from Prisma
  if (err.code === 'P2025') {
    err = new AppError(err.meta?.cause || 'Record to update or delete not found.', 404);
  }

  // 3. Handle invalid signature token issues
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token. Please log in again.', 401);
  }

  // 4. Handle expired token sessions
  if (err.name === 'TokenExpiredError') {
    err = new AppError('Your login token has expired. Please log in again.', 401);
  }

  // 5. Environmental payload delivery
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // Production Mode: Mask technical/system traces
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('CRITICAL SERVER ERROR 💥:', err);
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error. Please contact support.',
      });
    }
  }
};

export default errorHandler;
