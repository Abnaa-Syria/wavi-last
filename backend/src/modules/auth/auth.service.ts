import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/error.util.js';
import { hashPassword, comparePasswords } from '../../utils/hash.util.js';
import { generateToken } from '../../utils/jwt.util.js';
import { Role, Permission } from '@prisma/client';

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user in the system with CUSTOMER role
   */
  public static async register(data: RegisterInput) {
    const emailLower = data.email.toLowerCase().trim();
    const phoneTrimmed = data.phone.trim();

    // 1. Check if email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailLower },
          { phone: phoneTrimmed },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === emailLower) {
        throw new AppError('Email address is already registered', 400);
      }
      throw new AppError('Phone number is already registered', 400);
    }

    // 2. Hash password
    const hashedPassword = await hashPassword(data.password);

    // 3. Create User
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: emailLower,
        phone: phoneTrimmed,
        passwordHash: hashedPassword,
        role: Role.CUSTOMER,
      },
    });

    // 4. Return user info without the password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      permissions: []
    };
  }

  /**
   * Helper to retrieve all active permissions for a user
   */
  public static async getUserPermissions(userId: string, role: string): Promise<string[]> {
    if (role === 'SUPER_ADMIN') {
      return Object.values(Permission);
    }
    const userPermissions = await prisma.userRolePermission.findMany({
      where: { userId },
      select: { permission: true }
    });
    return userPermissions.map(p => p.permission);
  }

  /**
   * Login user by matching email or phone with secure password check
   */
  public static async login(data: LoginInput) {
    const identifierTrimmed = data.identifier.trim();

    // 1. Locate user via email OR phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifierTrimmed.toLowerCase() },
          { phone: identifierTrimmed },
        ],
      },
    });

    // 2. Return standard credential mismatch error (anti-enumeration security practice)
    if (!user) {
      throw new AppError('إيميل/رقم هاتف أو كلمة مرور غير صحيحة', 401);
    }

    // 3. Check ban status
    if (user.isBanned) {
      throw new AppError(`This account has been banned: ${user.banReason || 'No reason provided'}`, 403);
    }

    // 4. Compare passwords
    const isPasswordValid = await comparePasswords(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('إيميل/رقم هاتف أو كلمة مرور غير صحيحة', 401);
    }

    // Fetch custom role override
    const customRoleSetting = await prisma.setting.findUnique({
      where: { key: `rbac_user_custom_role:${user.id}` }
    });
    const actualRole = customRoleSetting ? customRoleSetting.value : user.role;

    // 5. Generate secure JWT token
    const token = generateToken({ id: user.id, role: actualRole });

    // Fetch user permissions
    const permissions = await this.getUserPermissions(user.id, actualRole);

    // 6. Return payload
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      token,
      user: {
        ...userWithoutPassword,
        role: actualRole,
        permissions
      },
    };
  }

  /**
   * Update user profile information
   */
  public static async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string }) {
    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
    if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
    
    if (data.phone !== undefined) {
      const phoneTrimmed = data.phone.trim();
      // Ensure phone is unique
      const existing = await prisma.user.findFirst({
        where: { phone: phoneTrimmed, NOT: { id: userId } }
      });
      if (existing) {
        throw new AppError('رقم الجوال مسجل لحساب آخر بالفعل', 400);
      }
      updateData.phone = phoneTrimmed;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    const customRoleSetting = await prisma.setting.findUnique({
      where: { key: `rbac_user_custom_role:${userId}` }
    });
    const actualRole = customRoleSetting ? customRoleSetting.value : updatedUser.role;

    const permissions = await this.getUserPermissions(userId, actualRole);
    return {
      ...userWithoutPassword,
      role: actualRole,
      permissions
    };
  }

  /**
   * Fetches all registered users, supporting filters for admin registry (Admin Only)
   */
  public static async getAllUsers(search?: string) {
    const where: any = {};
    if (search) {
      const searchLower = search.toLowerCase().trim();
      where.OR = [
        { firstName: { contains: searchLower } },
        { lastName: { contains: searchLower } },
        { email: { contains: searchLower } },
        { phone: { contains: searchLower } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isBanned: true,
        createdAt: true,
      },
    });

    // Fetch custom role mappings from settings
    const customRoleSettings = await prisma.setting.findMany({
      where: { key: { startsWith: 'rbac_user_custom_role:' } }
    });

    const customRoleMap = new Map<string, string>();
    for (const setting of customRoleSettings) {
      const userId = setting.key.replace('rbac_user_custom_role:', '');
      customRoleMap.set(userId, setting.value);
    }

    return users.map(user => {
      const customRole = customRoleMap.get(user.id);
      return {
        ...user,
        role: customRole || user.role
      };
    });
  }

  /**
   * Helper to retrieve permissions for a specific role
   */
  private static async getRolePermissions(roleName: Role): Promise<Permission[]> {
    // 1. Try to read from settings table
    const setting = await prisma.setting.findUnique({
      where: { key: `rbac_role_permissions_${roleName}` }
    });
    if (setting) {
      try {
        return JSON.parse(setting.value) as Permission[];
      } catch (e) {
        // Fallback if parsing fails
      }
    }

    const systemRoles = Object.values(Role) as string[];
    const isSystemRole = systemRoles.includes(roleName.toString());
    if (!isSystemRole) {
      return [];
    }

    // 2. Query distinct permissions currently assigned to users of this role
    const distinctPerms = await prisma.userRolePermission.findMany({
      where: {
        user: { role: roleName }
      },
      select: { permission: true },
      distinct: ['permission']
    });
    return distinctPerms.map(dp => dp.permission);
  }

  /**
   * Fetches all system roles and their assigned permission trees
   */
  public static async getRoles() {
    const rolesList = Object.values(Role);

    // Fetch custom roles list
    const customRolesSetting = await prisma.setting.findUnique({
      where: { key: 'rbac_custom_roles' }
    });
    let customRoles: { id: string; name: string; description: string }[] = [];
    if (customRolesSetting) {
      try {
        customRoles = JSON.parse(customRolesSetting.value);
      } catch (e) {}
    }

    const results = [];

    // System roles
    for (const r of rolesList) {
      const permissions = await this.getRolePermissions(r);
      let nameAr = r.toString();
      if (r === Role.SUPER_ADMIN) nameAr = 'مدير خارق (SUPER_ADMIN)';
      else if (r === Role.ADMIN) nameAr = 'مدير (ADMIN)';
      else if (r === Role.SUPPORT) nameAr = 'دعم فني (SUPPORT)';
      else if (r === Role.CUSTOMER) nameAr = 'عميل (CUSTOMER)';

      results.push({
        id: r,
        name: nameAr,
        permissions
      });
    }

    // Custom roles
    for (const cr of customRoles) {
      const permissions = await this.getRolePermissions(cr.id as any);
      results.push({
        id: cr.id,
        name: `${cr.name} (${cr.id})`,
        permissions
      });
    }

    return results;
  }

  /**
   * Fetches all granular system permissions categorized and localized
   */
  public static async getPermissions() {
    const permissionsList = Object.values(Permission).map(perm => {
      let label = perm.toString();
      let category = 'أخرى';
      
      if (perm.startsWith('PRODUCT_')) {
        category = 'إدارة المنتجات';
        label = perm === 'PRODUCT_CREATE' ? 'إنشاء المنتجات' : perm === 'PRODUCT_UPDATE' ? 'تعديل المنتجات' : perm === 'PRODUCT_DELETE' ? 'حذف المنتجات' : 'عرض المنتجات';
      } else if (perm.startsWith('ORDER_')) {
        category = 'إدارة الطلبات';
        label = perm === 'ORDER_VIEW' ? 'عرض الطلبات' : perm === 'ORDER_UPDATE' ? 'تحديث حالة الطلب' : perm === 'ORDER_CANCEL' ? 'إلغاء الطلب' : 'إكمال وتسليم الطلب';
      } else if (perm.startsWith('USER_')) {
        category = 'إدارة المستخدمين';
        label = perm === 'USER_VIEW' ? 'عرض سجل المستخدمين' : perm === 'USER_UPDATE' ? 'تعديل المستخدمين' : 'حظر وإلغاء حظر المستخدمين';
      } else if (perm.startsWith('COUPON_')) {
        category = 'الكوبونات والتسويق';
        label = perm === 'COUPON_CREATE' ? 'إنشاء الكوبونات' : perm === 'COUPON_UPDATE' ? 'تعديل الكوبونات' : 'حذف الكوبونات';
      } else if (perm.startsWith('CATEGORY_')) {
        category = 'إدارة التصنيفات';
        label = perm === 'CATEGORY_CREATE' ? 'إنشاء التصنيفات' : perm === 'CATEGORY_UPDATE' ? 'تعديل التصنيفات' : 'حذف التصنيفات';
      } else if (perm === 'SETTINGS_MANAGE') {
        category = 'إعدادات النظام';
        label = 'إدارة إعدادات النظام والببانات';
      } else if (perm === 'SUPPORT_MANAGE') {
        category = 'الدعم الفني والبطاقات';
        label = 'إدارة ومعالجة بطاقات الدعم';
      } else if (perm === 'REPORTS_VIEW') {
        category = 'التقارير والإحصائيات';
        label = 'عرض التقارير واللوحات التحليلية';
      } else if (perm === 'DELIVERY_MANAGE') {
        category = 'إدارة طرق التوصيل';
        label = 'إدارة خيارات التوصيل التلقائي';
      }

      return { key: perm, label, category };
    });

    return permissionsList;
  }

  /**
   * Syncs and updates a role's permissions inside the database
   */
  public static async updateRolePermissions(roleName: Role, permissions: Permission[]) {
    // 1. Save mapping to Setting table for persistence / new users
    await prisma.setting.upsert({
      where: { key: `rbac_role_permissions_${roleName}` },
      update: { value: JSON.stringify(permissions) },
      create: {
        key: `rbac_role_permissions_${roleName}`,
        value: JSON.stringify(permissions),
        group: 'general'
      }
    });

    // 2. Fetch all users belonging to this role (or users with custom override pointing to this role)
    const customRoleSettings = await prisma.setting.findMany({
      where: {
        key: { startsWith: 'rbac_user_custom_role:' },
        value: roleName.toString()
      }
    });
    const customRoleUserIds = customRoleSettings.map(s => s.key.replace('rbac_user_custom_role:', ''));

    const systemRoles = Object.values(Role) as string[];
    const isSystemRole = systemRoles.includes(roleName.toString());

    let dbRoleUserIds: string[] = [];
    if (isSystemRole) {
      const dbRoleUsers = await prisma.user.findMany({
        where: { role: roleName },
        select: { id: true }
      });
      dbRoleUserIds = dbRoleUsers.map(u => u.id);
    }

    const allUserIds = Array.from(new Set([...customRoleUserIds, ...dbRoleUserIds]));

    // 3. Update database UserRolePermission records in a transaction
    if (allUserIds.length > 0) {
      await prisma.$transaction([
        prisma.userRolePermission.deleteMany({
          where: { userId: { in: allUserIds } }
        }),
        prisma.userRolePermission.createMany({
          data: allUserIds.flatMap(userId => 
            permissions.map(perm => ({
              userId,
              permission: perm
            }))
          ),
          skipDuplicates: true
        })
      ]);
    }

    return { role: roleName, permissions };
  }

  /**
   * Dynamically persist a new custom role identifier
   */
  public static async createRole(name: string, description: string) {
    const roleIdUpper = name.trim().toUpperCase().replace(/\s+/g, '_');
    if (!roleIdUpper) {
      throw new AppError('Role name is required', 400);
    }

    const systemRoles = Object.values(Role) as string[];
    if (systemRoles.includes(roleIdUpper)) {
      throw new AppError('Role name conflicts with a system role', 400);
    }

    const setting = await prisma.setting.findUnique({
      where: { key: 'rbac_custom_roles' }
    });

    let customRoles: { id: string; name: string; description: string }[] = [];
    if (setting) {
      try {
        customRoles = JSON.parse(setting.value);
      } catch (e) {}
    }

    if (customRoles.some(r => r.id === roleIdUpper)) {
      throw new AppError('Role already exists', 400);
    }

    customRoles.push({
      id: roleIdUpper,
      name: name.trim(),
      description: description.trim()
    });

    await prisma.setting.upsert({
      where: { key: 'rbac_custom_roles' },
      update: { value: JSON.stringify(customRoles) },
      create: {
        key: 'rbac_custom_roles',
        value: JSON.stringify(customRoles),
        group: 'general'
      }
    });

    await prisma.setting.upsert({
      where: { key: `rbac_role_permissions_${roleIdUpper}` },
      update: { value: JSON.stringify([]) },
      create: {
        key: `rbac_role_permissions_${roleIdUpper}`,
        value: JSON.stringify([]),
        group: 'general'
      }
    });

    return { id: roleIdUpper, name: name.trim(), description: description.trim(), permissions: [] };
  }

  /**
   * Manually create a staff user or manager from the admin dashboard (SUPER_ADMIN Only)
   */
  public static async createUser(data: any) {
    const emailLower = data.email.toLowerCase().trim();
    const phoneTrimmed = data.phone?.trim() || null;
    const roleInput = data.role.toUpperCase().trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailLower },
          phoneTrimmed ? { phone: phoneTrimmed } : {}
        ].filter(Boolean) as any
      }
    });

    if (existingUser) {
      throw new AppError('Email or Phone is already registered', 400);
    }

    const systemRoles = Object.values(Role) as string[];
    const customRolesSetting = await prisma.setting.findUnique({
      where: { key: 'rbac_custom_roles' }
    });
    let customRoles: { id: string }[] = [];
    if (customRolesSetting) {
      try {
        customRoles = JSON.parse(customRolesSetting.value);
      } catch (e) {}
    }
    const allValidRoles = [...systemRoles, ...customRoles.map(r => r.id)];
    if (!allValidRoles.includes(roleInput)) {
      throw new AppError('Invalid role selection', 400);
    }

    const hashedPassword = await hashPassword(data.password);
    const isCustomRole = !systemRoles.includes(roleInput);
    const dbRole = isCustomRole ? Role.SUPPORT : (roleInput as Role);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: emailLower,
        phone: phoneTrimmed,
        passwordHash: hashedPassword,
        role: dbRole
      }
    });

    if (isCustomRole) {
      await prisma.setting.upsert({
        where: { key: `rbac_user_custom_role:${user.id}` },
        update: { value: roleInput },
        create: {
          key: `rbac_user_custom_role:${user.id}`,
          value: roleInput,
          group: 'general'
        }
      });
    }

    const rolePermissions = await this.getRolePermissions(roleInput as any);
    if (rolePermissions.length > 0) {
      await prisma.userRolePermission.createMany({
        data: rolePermissions.map(perm => ({
          userId: user.id,
          permission: perm
        })),
        skipDuplicates: true
      });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      role: roleInput
    };
  }

  /**
   * Updates user role assignment in database and maps custom settings (SUPER_ADMIN Only)
   */
  public static async updateUserRole(userId: string, roleInput: string) {
    const roleUpper = roleInput.toUpperCase().trim();

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const systemRoles = Object.values(Role) as string[];
    const customRolesSetting = await prisma.setting.findUnique({
      where: { key: 'rbac_custom_roles' }
    });
    let customRoles: { id: string }[] = [];
    if (customRolesSetting) {
      try {
        customRoles = JSON.parse(customRolesSetting.value);
      } catch (e) {}
    }
    const allValidRoles = [...systemRoles, ...customRoles.map(r => r.id)];
    if (!allValidRoles.includes(roleUpper)) {
      throw new AppError('Invalid role selection', 400);
    }

    const isCustomRole = !systemRoles.includes(roleUpper);
    const dbRole = isCustomRole ? Role.SUPPORT : (roleUpper as Role);

    await prisma.user.update({
      where: { id: userId },
      data: { role: dbRole }
    });

    if (isCustomRole) {
      await prisma.setting.upsert({
        where: { key: `rbac_user_custom_role:${userId}` },
        update: { value: roleUpper },
        create: {
          key: `rbac_user_custom_role:${userId}`,
          value: roleUpper,
          group: 'general'
        }
      });
    } else {
      await prisma.setting.deleteMany({
        where: { key: `rbac_user_custom_role:${userId}` }
      });
    }

    const rolePermissions = await this.getRolePermissions(roleUpper as any);
    await prisma.$transaction([
      prisma.userRolePermission.deleteMany({
        where: { userId }
      }),
      prisma.userRolePermission.createMany({
        data: rolePermissions.map(perm => ({
          userId,
          permission: perm
        })),
        skipDuplicates: true
      })
    ]);

    return { userId, role: roleUpper };
  }
}

