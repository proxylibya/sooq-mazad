// نظام الصلاحيات (واجهة قديمة) - تم توحيده داخلياً مع advanced-permissions
import {
  hasPermission as advHasPermission,
  type Permission as AdvPermission,
  type SystemRole,
} from '../lib/permissions/advanced-permissions';

// تعريف صلاحيات قابلة للاستخدام عبر المنصة (واجهة قديمة)
export type Permission =
  | 'admin.access'
  | 'users.read'
  | 'users.write'
  | 'users.delete'
  | 'auctions.read'
  | 'auctions.write'
  | 'auctions.delete'
  | 'cars.read'
  | 'cars.write'
  | 'cars.delete'
  | 'payments.read'
  | 'payments.write'
  | 'reports.read'
  | 'settings.read'
  | 'settings.write'
  | 'logs.read'
  | 'backup.create'
  | 'backup.download'
  | 'backup.delete'
  | 'monitoring.read'
  | 'security.test';

// الأدوار المتاحة (متوافقة مع Prisma)
export type Role = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

// نوع عنصر القائمة القديم للتوافق
export type LegacyMenuItem = { href?: string; permission?: Permission } & Record<string, unknown>;

// خريطة تحويل الصلاحيات القديمة إلى الصيغة الموحدة
const LEGACY_TO_ADV: Record<Permission, AdvPermission | AdvPermission[]> = {
  'admin.access': 'dashboard.access',
  'users.read': 'users.read',
  'users.write': 'users.write',
  'users.delete': 'users.delete',
  'auctions.read': 'auctions.read',
  'auctions.write': 'auctions.write',
  'auctions.delete': 'auctions.delete',
  // cars.* تُقابل marketplace.*
  'cars.read': 'marketplace.read',
  'cars.write': 'marketplace.write',
  'cars.delete': 'marketplace.delete',
  // payments.* تُقابل finance.*
  'payments.read': 'finance.read',
  'payments.write': 'finance.write',
  'reports.read': 'reports.read',
  'settings.read': 'settings.read',
  'settings.write': 'settings.write',
  // logs.read أقرب لـ security.read
  'logs.read': 'security.read',
  // backup.* تتطلب غالباً صلاحيات إدارية عليا على الإعدادات
  'backup.create': 'settings.manage',
  'backup.download': 'settings.manage',
  'backup.delete': 'settings.manage',
  // المراقبة = security.read غالباً
  'monitoring.read': 'security.read',
  // security.test -> صلاحية وصول أمنية
  'security.test': 'security.access',
};

function toAdvPermissions(p: Permission): AdvPermission[] {
  const mapped = LEGACY_TO_ADV[p];
  if (!mapped) return [];
  return Array.isArray(mapped) ? mapped : [mapped];
}

// تعريف الصلاحيات لكل دور (نحتفظ بها للتوافق)، لكن التحقق الفعلي يعتمد النظام الموحد
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  USER: [],
  MODERATOR: [
    'admin.access',
    'users.read',
    'auctions.read',
    'auctions.write',
    'cars.read',
    'cars.write',
    'payments.read',
    'reports.read',
    'logs.read',
  ],
  ADMIN: [
    'admin.access',
    'users.read',
    'users.write',
    'users.delete',
    'auctions.read',
    'auctions.write',
    'auctions.delete',
    'cars.read',
    'cars.write',
    'cars.delete',
    'payments.read',
    'payments.write',
    'reports.read',
    'settings.read',
    'settings.write',
    'logs.read',
    'backup.create',
    'backup.download',
    'backup.delete',
    'monitoring.read',
    'security.test',
  ],
  SUPER_ADMIN: [
    'admin.access',
    'users.read',
    'users.write',
    'users.delete',
    'auctions.read',
    'auctions.write',
    'auctions.delete',
    'cars.read',
    'cars.write',
    'cars.delete',
    'payments.read',
    'payments.write',
    'reports.read',
    'settings.read',
    'settings.write',
    'logs.read',
    'backup.create',
    'backup.download',
    'backup.delete',
    'monitoring.read',
    'security.test',
  ],
};

/**
 * التحقق من وجود صلاحية معينة للمستخدم
 */
export function hasPermission(userRole: Role, permission: Permission): boolean {
  // تحقق فعلي باستخدام النظام الموحد عبر التحويل
  const advRole = userRole as SystemRole;
  const advTargets = toAdvPermissions(permission);
  if (advTargets.length === 0) return false;
  return advTargets.some((p) => advHasPermission(advRole, p));
}

/**
 * التحقق من وجود أي من الصلاحيات المطلومنة
 */
export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * التحقق من وجود جميع الصلاحيات المطلوبة
 */
export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * الحصول على جميع صلاحيات الدور
 */
export function getRolePermissions(role: Role): Permission[] {
  // للتوافق: نعيد القائمة القديمة. التحقق الفعلي يتم بالنظام الموحد.
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * التحقق من كون المستخدم مدير
 */
export function isAdmin(role: Role): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * التحقق من كون المستخدم مشرف أو مدير
 */
export function isModerator(role: Role): boolean {
  if (role === 'MODERATOR') return true;
  return isAdmin(role);
}

// صلاحيات الصفحات (تركيز على مسارات الإدمن فقط لتقليل المخاطر)
const _PAGE_PERMISSIONS: Record<string, Permission[]> = {
  '/admin': ['admin.access'],
  '/admin/users': ['admin.access', 'users.read'],
  '/admin/auctions': ['admin.access', 'auctions.read'],
};

// Permission to menu item mapping (legacy Arabic labels)
export const PERMISSION_MENU_MAP: Record<string, string[]> = {
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

// Reverse map: route -> permission label
export const MENU_PERMISSION_MAP: Record<string, string> = Object.entries(PERMISSION_MENU_MAP).reduce(
  (acc, [permission, routes]) => {
    routes.forEach((route) => {
      acc[route] = permission;
    });
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * امنتحقق من صلاحية الوصول لصفحة معينة
 */
export const filterMenuItemsByPermissions = (
  menuItems: LegacyMenuItem[],
  userPermissions: string[],
) => {
  return menuItems.filter((item) => {
    const route = typeof item.href === 'string' ? item.href : '';
    const requiredPermission = route ? MENU_PERMISSION_MAP[route] : undefined;
    if (!requiredPermission) {
      // If no specific permission is required, show the item
      return true;
    }
    // هنا userPermissions عبارة عن قائمة صلاحيات نصية (قديمة)
    return userPermissions.includes(requiredPermission);
  });
};

export function filterMenuItems(userRole: Role, menuItems: LegacyMenuItem[]): LegacyMenuItem[] {
  return menuItems.filter((item: LegacyMenuItem) => {
    if (!item.permission) return true;
    return hasPermission(userRole, item.permission);
  });
}

/**
 * التحقق من صلاحية الوصول لصفحة معينة (توافق مع الواجهة القديمة)
 */
export function canAccessPage(userRole: Role, pagePath: string): boolean {
  const required = _PAGE_PERMISSIONS[pagePath];
  if (!required || required.length === 0) return true;
  return hasAnyPermission(userRole, required);
}

/**
 * رسائل الأخطاء للصلاحيات
 */
export const PERMISSION_ERRORS = {
  UNAUTHORIZED: 'غير مصرح لك بالوصول',
  INSUFFICIENT_PERMISSIONS: 'ليس لديك صلاحيات كافية',
  ADMIN_REQUIRED: 'يتطلب صلاحيات إدارية',
  MODERATOR_REQUIRED: 'يتطلب صلاحيات إشراف أو إدارة',
} as const;

/**
 * الحصول على رسالة خطأ مناسبة
 */
export function getPermissionError(userRole: Role | null, requiredPermission: Permission): string {
  if (!userRole) {
    return PERMISSION_ERRORS.UNAUTHORIZED;
  }

  if (!hasPermission(userRole, requiredPermission)) {
    return PERMISSION_ERRORS.INSUFFICIENT_PERMISSIONS;
  }

  return '';
}
