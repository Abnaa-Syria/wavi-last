import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/error.util.js';

/**
 * Limit sensitive authentication endpoints (e.g. login/register)
 * Enforces maximum 5 requests per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new AppError('لقد تجاوزت الحد الأقصى لمحاولات تسجيل الدخول/التسجيل المسموح بها، يرجى المحاولة بعد 15 دقيقة.', 429));
  },
});

/**
 * General global API rate limiting
 * Enforces maximum 100 requests per 15 minutes.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new AppError('لقد قمت بإرسال عدد كبير من الطلبات، يرجى الهدوء والمحاولة لاحقاً.', 429));
  },
});

export default { authLimiter, generalLimiter };
