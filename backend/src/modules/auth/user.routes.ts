import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { updateProfileSchema } from './auth.validation.js';
import { protect, hasPermission } from '../../middlewares/auth.middleware.js';
import { Permission } from '@prisma/client';

export const userRouter = Router();

// Protected User Profile Endpoints
userRouter.patch('/profile', protect, validate(updateProfileSchema), AuthController.updateProfile);

// Admin-Only Users Management Endpoint
userRouter.get('/', protect, hasPermission(Permission.USER_VIEW), AuthController.getAllUsers);

// User & Staff lifecycle routes
userRouter.post('/create', protect, hasPermission(Permission.USER_UPDATE), AuthController.createUser);
userRouter.patch('/:id/role', protect, hasPermission(Permission.SETTINGS_MANAGE), AuthController.updateUserRole);

export default userRouter;
