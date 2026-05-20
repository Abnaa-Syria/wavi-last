import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util.js';
import { prisma } from '../config/db.js';
import { AppError } from '../utils/error.util.js';
import { Role, Permission, User, UserRolePermission } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.util.js';

// Extend Express Request interface globally
declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'passwordHash' | 'role'> & {
        role: string;
        rolePermissions: UserRolePermission[];
      };
    }
  }
}

/**
 * Global authentication guard. Decodes Bearer JWT, validates user activity/ban state,
 * and loads role permissions from MySQL.
 */
export const protect = asyncHandler(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // 1. Extract Bearer token from authorization headers
  if (req.headers.authorization && /^bearer/i.test(req.headers.authorization)) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('You are not logged in! Please log in to get access.', 401);
  }

  // 2. Decode and verify the JWT signature
  const decoded = verifyToken(token);

  // 3. Query MySQL database via Prisma, including user rolePermissions relation
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      rolePermissions: true,
    },
  });

  if (!user) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  // 4. Validate user activity state
  if (!user.isActive) {
    throw new AppError('This user account has been deactivated.', 403);
  }

  // 5. Validate user ban state
  if (user.isBanned) {
    throw new AppError(`عذراً، هذا الحساب محظور بسبب: ${user.banReason || 'بدون سبب محدد'}`, 403);
  }

  // Check for custom role override
  const customRoleSetting = await prisma.setting.findUnique({
    where: { key: `rbac_user_custom_role:${user.id}` }
  });
  const actualRole = customRoleSetting ? customRoleSetting.value : user.role;

  // 6. Attach clean user payload onto the request object context
  const { passwordHash: _, ...userWithoutHash } = user;
  req.user = {
    ...userWithoutHash,
    role: actualRole,
  };
  next();
});

/**
 * Optional authentication guard. Decodes Bearer JWT optionally if provided,
 * validates user activity/ban state, loads role permissions, and attaches user to req.user.
 * If no token is provided or if the token is invalid/expired, it silently lets the user proceed as a guest.
 */
export const optionalProtect = asyncHandler(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // 1. Extract Bearer token from authorization headers
  if (req.headers.authorization && /^bearer/i.test(req.headers.authorization)) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    // 2. Decode and verify the JWT signature
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return next();
    }

    // 3. Query MySQL database via Prisma, including user rolePermissions relation
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        rolePermissions: true,
      },
    });

    if (!user || !user.isActive || user.isBanned) {
      return next();
    }

    // Check for custom role override
    const customRoleSetting = await prisma.setting.findUnique({
      where: { key: `rbac_user_custom_role:${user.id}` }
    });
    const actualRole = customRoleSetting ? customRoleSetting.value : user.role;

    // Attach clean user payload onto the request object context
    const { passwordHash: _, ...userWithoutHash } = user;
    req.user = {
      ...userWithoutHash,
      role: actualRole,
    };
  } catch (error) {
    // Silently capture any invalid token/expiry errors and proceed as guest
  }

  next();
});

/**
 * Role-Based Access Control (RBAC) middleware for blocking or allowing entire routes based on high-level roles
 * @param roles - The roles allowed to perform this action
 */
export const restrictTo = (...roles: (Role | string)[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required to perform this action', 401));
    }
    if (!roles.includes(req.user.role as any)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

/**
 * Permission-Based Access Control (PBAC) middleware
 * SUPER_ADMIN is granted automatic pass-through access.
 * @param requiredPermission - The granular permission required for access
 */
export const hasPermission = (requiredPermission: Permission) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required to perform this action', 401));
    }

    // 1. SUPER_ADMIN and ADMIN bypass PBAC checks automatically
    if (req.user.role === Role.SUPER_ADMIN || req.user.role === Role.ADMIN) {
      return next();
    }

    // 2. Check if the requiredPermission exists in the user's rolePermissions array
    const permissions = req.user.rolePermissions || [];
    const hasPerm = permissions.some((rp) => rp.permission === requiredPermission);

    if (!hasPerm) {
      return next(new AppError('عذراً، ليس لديك الصلاحية الكافية لتنفيذ هذا الإجراء', 403));
    }

    next();
  };
};
export default { protect, restrictTo, hasPermission, optionalProtect };
