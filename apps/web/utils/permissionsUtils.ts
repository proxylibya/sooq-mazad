// NOTE:
// Do not import Node.js modules (fs/path) at the top-level to keep this file safe for client bundles.
// We use dynamic imports inside server-only code paths instead.

// Permission to menu item mapping
export const PERMISSION_MENU_MAP = {
  الوصول_للوحة_التحكم: ['/admin/dashboard'],
  إدارة_المستخدمين: ['/admin/users'],
  إدارة_المسؤولين: ['/admin/admins'],
  إدارة_الأدوار: ['/admin/roles'],
  إدارة_سوق_المزاد: ['/admin/auctions'],
  إدارة_السوق_الفوري: ['/admin/marketplace'],
  خدمات_النقل: ['/admin/transport'],
  إدارة_المعارض: ['/admin/showrooms'],
  إدارة_الساحات: ['/admin/courts'],
  إدارة_الشركات: ['/admin/companies'],
  إدارة_المالية: ['/admin/finance'],
  إدارة_واجهات_البرمجة: ['/admin/api'],
  الرسائل_والإشعارات: ['/admin/messages'],
  إدارة_المحتوى: ['/admin/content'],
  التقارير_والتحليلات: ['/admin/reports'],
  الأمان_والمراقبة: ['/admin/security'],
  إدارة_الصفحات: ['/admin/pages'],
  إدارة_رؤية_الصفحات: ['/admin/page-visibility'],
  الإعدادات_العامة: ['/admin/settings'],
};

// Menu item to permission mapping (reverse lookup)
export const MENU_PERMISSION_MAP: { [key: string]: string } = {};
Object.entries(PERMISSION_MENU_MAP).forEach(([permission, routes]) => {
  routes.forEach((route) => {
    MENU_PERMISSION_MAP[route] = permission;
  });
});

// Default permissions for system roles
export const DEFAULT_ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'الوصول_للوحة_التحكم',
    'إدارة_المستخدمين',
    'إدارة_المسؤولين',
    'إدارة_الأدوار',
    'إدارة_سوق_المزاد',
    'إدارة_السوق_الفوري',
    'خدمات_النقل',
    'إدارة_المعارض',
    'إدارة_الساحات',
    'إدارة_الشركات',
    'إدارة_المالية',
    'إدارة_واجهات_البرمجة',
    'الرسائل_والإشعارات',
    'إدارة_المحتوى',
    'التقارير_والتحليلات',
    'الأمان_والمراقبة',
    'إدارة_الصفحات',
    'إدارة_رؤية_الصفحات',
    'الإعدادات_العامة',
  ],
  ADMIN: [
    'الوصول_للوحة_التحكم',
    'إدارة_المستخدمين',
    'إدارة_المسؤولين',
    'إدارة_الأدوار',
    'إدارة_سوق_المزاد',
    'إدارة_السوق_الفوري',
    'خدمات_النقل',
    'إدارة_المعارض',
    'إدارة_الساحات',
    'إدارة_الشركات',
    'إدارة_المالية',
    'إدارة_واجهات_البرمجة',
    'الرسائل_والإشعارات',
    'إدارة_المحتوى',
    'التقارير_والتحليلات',
  ],
  MODERATOR: [
    'الوصول_للوحة_التحكم',
    'إدارة_المستخدمين',
    'الرسائل_والإشعارات',
    'إدارة_المحتوى',
    'التقارير_والتحليلات',
  ],
};

// Client-side permission checking utilities
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (
  userPermissions: string[],
  requiredPermissions: string[],
): boolean => {
  return requiredPermissions.some((permission) => userPermissions.includes(permission));
};

export const canAccessRoute = (userPermissions: string[], route: string): boolean => {
  const requiredPermission = MENU_PERMISSION_MAP[route];
  if (!requiredPermission) {
    // If no specific permission is required, allow access
    return true;
  }
  return hasPermission(userPermissions, requiredPermission);
};

// Get user permissions from role (server-side)
export const getUserPermissionsFromRole = async (roleName: string): Promise<string[]> => {
  try {
    console.log('🔍 Getting permissions for role:', roleName);

    // First check if it's a system role - prioritize this over roles.json
    if (DEFAULT_ROLE_PERMISSIONS[roleName as keyof typeof DEFAULT_ROLE_PERMISSIONS]) {
      const permissions =
        DEFAULT_ROLE_PERMISSIONS[roleName as keyof typeof DEFAULT_ROLE_PERMISSIONS];
      console.log('✅ Found system role permissions:', permissions.length, 'permissions');
      return permissions;
    }

    // Try to read from roles file for custom roles (server-only)
    if (typeof window === 'undefined') {
      const [{ default: fs }, { default: path }] = await Promise.all([
        import('fs'),
        import('path'),
      ]);
      const ROLES_FILE = path.join(process.cwd(), 'data', 'roles.json');
      if (fs.existsSync(ROLES_FILE)) {
        const roles = JSON.parse(fs.readFileSync(ROLES_FILE, 'utf8'));
        const role = roles.find((r: any) => r.name === roleName);
        if (role && role.permissions) {
          console.log('✅ Found custom role permissions:', role.permissions.length, 'permissions');
          return role.permissions;
        }
      }
    }

    // Explicit fallback for system roles (in case the above check fails)
    if (roleName === 'SUPER_ADMIN') {
      console.log('🔧 Applying SUPER_ADMIN fallback permissions');
      return DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN;
    }
    if (roleName === 'ADMIN') {
      console.log('🔧 Applying ADMIN fallback permissions');
      return DEFAULT_ROLE_PERMISSIONS.ADMIN;
    }
    if (roleName === 'MODERATOR') {
      console.log('🔧 Applying MODERATOR fallback permissions');
      return DEFAULT_ROLE_PERMISSIONS.MODERATOR;
    }

    // Default minimal permissions
    console.log('⚠️ No specific permissions found, using minimal permissions');
    return ['الوصول_للوحة_التحكم'];
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return ['الوصول_للوحة_التحكم'];
  }
};

// Get user permissions from custom role name (server-side)
export const getUserPermissionsFromCustomRole = async (
  customRoleName: string,
): Promise<string[]> => {
  try {
    // Server-only file access for roles
    if (typeof window === 'undefined') {
      const [{ default: fs }, { default: path }] = await Promise.all([
        import('fs'),
        import('path'),
      ]);
      const ROLES_FILE = path.join(process.cwd(), 'data', 'roles.json');
      if (fs.existsSync(ROLES_FILE)) {
        const roles = JSON.parse(fs.readFileSync(ROLES_FILE, 'utf8'));
        const role = roles.find(
          (r: any) => r.name === customRoleName || r.displayName === customRoleName,
        );
        if (role && role.permissions) {
          return role.permissions;
        }
      }
    }

    // Fallback to minimal permissions
    return ['الوصول_للوحة_التحكم'];
  } catch (error) {
    console.error('Error getting custom role permissions:', error);
    return ['الوصول_للوحة_التحكم'];
  }
};

// Filter menu items based on permissions
export const filterMenuItemsByPermissions = (menuItems: any[], userPermissions: string[]) => {
  return menuItems.filter((item) => {
    const requiredPermission = MENU_PERMISSION_MAP[item.href];
    if (!requiredPermission) {
      // If no specific permission is required, show the item
      return true;
    }
    return hasPermission(userPermissions, requiredPermission);
  });
};
