import { Router } from 'express';
import { FaqController } from './faq.controller.js';
import { protect, hasPermission } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { 
  createFaqCategorySchema, 
  createFaqSchema, 
  updateFaqCategorySchema, 
  updateFaqSchema, 
  faqParamsSchema 
} from './faq.validation.js';
import { Permission } from '@prisma/client';

export const faqRouter = Router();

// =========================================================================
// PUBLIC ENDPOINTS (الواجهة الأمامية للموقع)
// =========================================================================
faqRouter.get('/', FaqController.getGroupedFaqs);

// =========================================================================
// ADMIN SECURED ENDPOINTS (لوحة التحكم للأدمن والسبورت)
// =========================================================================

// تطبيق حماية عامة على كل المسارات اللي تحت السطر ده
faqRouter.use(protect, hasPermission(Permission.SETTINGS_MANAGE));

// جلب كل الأقسام والأسئلة بدون استثناء للـ Dashboard
faqRouter.get('/admin', FaqController.getAllForAdmin);

// إدارة الأقسام
faqRouter.post('/categories', validate(createFaqCategorySchema), FaqController.createFaqCategory);
faqRouter.patch('/categories/:id', validate(updateFaqCategorySchema), FaqController.updateCategory);
faqRouter.delete('/categories/:id', validate(faqParamsSchema), FaqController.deleteCategory);

// إدارة الأسئلة الفردية
faqRouter.post('/', validate(createFaqSchema), FaqController.createFaq);
faqRouter.patch('/:id', validate(updateFaqSchema), FaqController.updateFaq);
faqRouter.delete('/:id', validate(faqParamsSchema), FaqController.deleteFaq);

export default faqRouter;