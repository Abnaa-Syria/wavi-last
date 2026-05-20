import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.util.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';
import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/error.util.js';

export class AuthController {
  /**
   * Controller handler for registering a new customer account
   */
  public static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await AuthService.register(req.body);
    sendSuccess(res, 'User registered successfully', { user }, 201);
  });

  /**
   * Controller handler for user authentication logins (email or phone)
   */
  public static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await AuthService.login(req.body);
    sendSuccess(res, 'Logged in successfully', result);
  });

  /**
   * Controller handler for retrieving the current user's profile and active permissions
   */
  public static getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('المستخدم غير موجود', 404);
    }
    const customRoleSetting = await prisma.setting.findUnique({
      where: { key: `rbac_user_custom_role:${userId}` }
    });
    const actualRole = customRoleSetting ? customRoleSetting.value : user.role;

    const permissions = await AuthService.getUserPermissions(userId, actualRole);
    const { passwordHash: _, ...userWithoutPassword } = user;
    sendSuccess(res, 'User session retrieved successfully', {
      user: {
        ...userWithoutPassword,
        role: actualRole,
        permissions
      }
    });
  });

  /**
   * Controller handler for updating user profile information
   */
  public static updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const updatedUser = await AuthService.updateProfile((req as any).user.id, req.body);
    sendSuccess(res, 'Profile updated successfully', { user: updatedUser });
  });

  /**
   * Controller handler for listing users (Admin Only)
   */
  public static getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string | undefined;
    const users = await AuthService.getAllUsers(search);
    sendSuccess(res, 'Users retrieved successfully', { users });
  });

  /**
   * Controller handler for listing all roles and their permissions (SUPER_ADMIN Only)
   */
  public static getRoles = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const roles = await AuthService.getRoles();
    sendSuccess(res, 'Roles retrieved successfully', { roles });
  });

  /**
   * Controller handler for listing all granular system permissions (SUPER_ADMIN Only)
   */
  public static getPermissions = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const permissions = await AuthService.getPermissions();
    sendSuccess(res, 'Permissions retrieved successfully', { permissions });
  });

  /**
   * Controller handler for updating permissions associated with a role (SUPER_ADMIN Only)
   */
  public static updateRolePermissions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { roleName } = req.params;
    const { permissions } = req.body;
    const result = await AuthService.updateRolePermissions(roleName as any, permissions);
    sendSuccess(res, 'Role permissions updated successfully', result);
  });

  /**
   * Controller handler for dynamic custom role creation (SUPER_ADMIN Only)
   */
  public static createRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, description } = req.body;
    const role = await AuthService.createRole(name, description);
    sendSuccess(res, 'Role created successfully', { role }, 201);
  });

  /**
   * Controller handler for manual user/staff registration (SUPER_ADMIN Only)
   */
  public static createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await AuthService.createUser(req.body);
    sendSuccess(res, 'User created successfully', { user }, 201);
  });

  /**
   * Controller handler for updating a user's role assignment (SUPER_ADMIN Only)
   */
  public static updateUserRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { role } = req.body;
    const result = await AuthService.updateUserRole(id!, role);
    sendSuccess(res, 'User role updated successfully', result);
  });
}
export default AuthController;
