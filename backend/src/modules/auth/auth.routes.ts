import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from './auth.validation.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';

export const authRouter = Router();

// Public Authentication Endpoints
authRouter.post('/register', validate(registerSchema), AuthController.register);
authRouter.post('/login', validate(loginSchema), AuthController.login);

// Protected Profile Endpoints
authRouter.get('/me', protect, AuthController.getMe);
authRouter.patch('/profile', protect, validate(updateProfileSchema), AuthController.updateProfile);

// RBAC & Permissions Management Endpoints (restricted exclusively to SUPER_ADMIN)
authRouter.get('/roles', protect, restrictTo(Role.SUPER_ADMIN), AuthController.getRoles);
authRouter.post('/roles', protect, restrictTo(Role.SUPER_ADMIN), AuthController.createRole);
authRouter.get('/permissions', protect, restrictTo(Role.SUPER_ADMIN), AuthController.getPermissions);
authRouter.patch('/roles/:roleName/permissions', protect, restrictTo(Role.SUPER_ADMIN), AuthController.updateRolePermissions);

// User & Staff lifecycle routes
authRouter.post('/users/create', protect, restrictTo(Role.SUPER_ADMIN), AuthController.createUser);
authRouter.patch('/users/:id/role', protect, restrictTo(Role.SUPER_ADMIN), AuthController.updateUserRole);

export default authRouter;
