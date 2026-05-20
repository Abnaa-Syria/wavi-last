import { Response } from 'express';

/**
 * Standardized success response formatter
 */
export const sendSuccess = (
  res: Response,
  message: string,
  data?: any,
  statusCode = 200
): void => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};
