import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppError } from './utils/error.util.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { productRouter } from './modules/product/product.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { categoryRouter } from './modules/category/category.routes.js';
import { cartRouter } from './modules/cart/cart.routes.js';
import { orderRouter } from './modules/order/order.routes.js';
import { marketingRouter } from './modules/marketing/marketing.routes.js';
import { supportRouter } from './modules/support/support.routes.js';
import { reviewRouter } from './modules/review/review.routes.js';
import { faqRouter } from './modules/faq/faq.routes.js';
import { userRouter } from './modules/auth/user.routes.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'WAVI STORE Backend is operating normally',
    timestamp: new Date().toISOString(),
  });
});

// Consolidated API Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/marketing', marketingRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/support', supportRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/faqs', faqRouter);

// Fallback 404 Route Handler
app.all('*', (req, _res, next) => {
  next(new AppError(`Cannot find route ${req.originalUrl} on this server!`, 404));
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
