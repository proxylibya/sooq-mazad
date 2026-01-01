// نظام الصلاحيات المتقدم للمشروع الضخم - سوق مزاد السيارات
// يدعم الأقسام الجديدة مع تحسينات الأداء والأمان

export type AdminSection =
  | 'dashboard'
  | 'users'
  | 'roles'
  | 'admins'
  | 'auctions'
  | 'marketplace'
  | 'transport'
  | 'showrooms'
  | 'yards'
  | 'companies'
  | 'finance'
  | 'wallets'
  | 'messages'
  | 'content'
  | 'reports'
  | 'security'
  | 'pages'
  | 'page_visibility'
  | 'settings'
  | 'account';

export type PermissionAction =
  | 'read'
  | 'write'
  | 'delete'
  | 'create'
  | 'update'
  | 'manage'
  | 'moderate'
  | 'export'
  | 'import'
  | 'access';

export type Permission = `${AdminSection}.${PermissionAction}`;

export type SystemRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

// صلاحيات مفصلة لكل قسم - محسّنة للمشروع الضخم
export const SECTION_PERMISSIONS: Record<AdminSection, Permission[]> = {
  dashboard: ['dashboard.access', 'dashboard.read'],
  users: [
    'users.read',
    'users.write',
    'users.create',
    'users.update',
    'users.delete',
    'users.manage',
    'users.moderate',
    'users.export',
  ],
  roles: [
    'roles.read',
    'roles.write',
    'roles.create',
    'roles.update',
    'roles.delete',
    'roles.manage',
  ],
  admins: [
    'admins.read',
    'admins.write',
    'admins.create',
    'admins.update',
    'admins.delete',
    'admins.manage',
  ],
  auctions: [
    'auctions.read',
    'auctions.write',
    'auctions.create',
    'auctions.update',
    'auctions.delete',
    'auctions.manage',
    'auctions.moderate',
    'auctions.export',
  ],
  marketplace: [
    'marketplace.read',
    'marketplace.write',
    'marketplace.create',
    'marketplace.update',
    'marketplace.delete',
    'marketplace.manage',
    'marketplace.moderate',
  ],
  transport: [
    'transport.read',
    'transport.write',
    'transport.create',
    'transport.update',
    'transport.delete',
    'transport.manage',
  ],
  showrooms: [
    'showrooms.read',
    'showrooms.write',
    'showrooms.create',
    'showrooms.update',
    'showrooms.delete',
    'showrooms.manage',
  ],
  yards: [
    'yards.read',
    'yards.write',
    'yards.create',
    'yards.update',
    'yards.delete',
    'yards.manage',
  ],
  companies: [
    'companies.read',
    'companies.write',
    'companies.create',
    'companies.update',
    'companies.delete',
    'companies.manage',
  ],
  finance: [
    'finance.read',
    'finance.write',
    'finance.create',
    'finance.update',
    'finance.delete',
    'finance.manage',
    'finance.export',
  ],
  wallets: [
    'wallets.read',
    'wallets.write',
    'wallets.create',
    'wallets.update',
    'wallets.delete',
    'wallets.manage',
  ],
  messages: [
    'messages.read',
    'messages.write',
    'messages.create',
    'messages.update',
    'messages.delete',
    'messages.manage',
  ],
  content: [
    'content.read',
    'content.write',
    'content.create',
    'content.update',
    'content.delete',
    'content.manage',
    'content.moderate',
  ],
  reports: ['reports.read', 'reports.write', 'reports.create', 'reports.export'],
  security: ['security.read', 'security.write', 'security.manage', 'security.access'],
  pages: [
    'pages.read',
    'pages.write',
    'pages.create',
    'pages.update',
    'pages.delete',
    'pages.manage',
  ],
  page_visibility: ['page_visibility.read', 'page_visibility.write', 'page_visibility.manage'],
  settings: ['settings.read', 'settings.write', 'settings.manage'],
  account: ['account.read', 'account.write', 'account.update'],
};

// تعريف الصلاحيات بشكل تدريجي لتجنب Temporal Dead Zone
const USER_PERMISSIONS = new Set<Permission>(['account.read', 'account.write', 'account.update']);

const MODERATOR_PERMISSIONS = new Set<Permission>([
  'dashboard.access',
  'dashboard.read',
  'users.read',
  'users.moderate',
  'auctions.read',
  'auctions.moderate',
  'marketplace.read',
  'marketplace.moderate',
  'content.read',
  'content.moderate',
  'reports.read',
  'account.read',
  'account.write',
  'account.update',
]);

const ADMIN_PERMISSIONS = new Set<Permission>([
  ...Array.from(MODERATOR_PERMISSIONS),
  'users.write',
  'users.create',
  'users.update',
  'users.manage',
  'users.export',
  'auctions.write',
  'auctions.create',
  'auctions.update',
  'auctions.manage',
  'auctions.export',
  'marketplace.write',
  'marketplace.create',
  'marketplace.update',
  'marketplace.manage',
  'transport.read',
  'transport.write',
  'transport.manage',
  'showrooms.read',
  'showrooms.write',
  'showrooms.manage',
  'yards.read',
  'yards.write',
  'yards.manage',
  'companies.read',
  'companies.write',
  'companies.manage',
  'finance.read',
  'finance.write',
  'finance.manage',
  'wallets.read',
  'wallets.write',
  'wallets.manage',
  'messages.read',
  'messages.write',
  'messages.manage',
  'content.write',
  'content.create',
  'content.update',
  'content.manage',
  'reports.write',
  'reports.create',
  'reports.export',
  'pages.read',
  'pages.write',
  'pages.manage',
  'page_visibility.read',
  'page_visibility.write',
  'settings.read',
  // Give ADMIN access to Roles section without destructive actions
  'roles.read',
  'roles.write',
  'roles.create',
  'roles.update',
]);

const SUPER_ADMIN_PERMISSIONS = new Set<Permission>([
  ...Array.from(ADMIN_PERMISSIONS),
  'users.delete',
  'roles.read',
  'roles.write',
  'roles.create',
  'roles.update',
  'roles.delete',
  'roles.manage',
  'admins.read',
  'admins.write',
  'admins.create',
  'admins.update',
  'admins.delete',
  'admins.manage',
  'auctions.delete',
  'marketplace.delete',
  'transport.create',
  'transport.update',
  'transport.delete',
  'showrooms.create',
  'showrooms.update',
  'showrooms.delete',
  'yards.create',
  'yards.update',
  'yards.delete',
  'companies.create',
  'companies.update',
  'companies.delete',
  'finance.create',
  'finance.update',
  'finance.delete',
  'finance.export',
  'wallets.create',
  'wallets.update',
  'wallets.delete',
  'messages.create',
  'messages.update',
  'messages.delete',
  'content.delete',
  'pages.create',
  'pages.update',
  'pages.delete',
  'page_visibility.manage',
  'settings.write',
  'settings.manage',
  'security.read',
  'security.write',
  'security.manage',
  'security.access',
]);

// خريطة صلاحيات الأدوار - محسّنة للأداء العالي
export const ROLE_PERMISSIONS: Record<SystemRole, Set<Permission>> = {
  USER: USER_PERMISSIONS,
  MODERATOR: MODERATOR_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  SUPER_ADMIN: SUPER_ADMIN_PERMISSIONS,
};

// تحسين الأداء: تخزين مؤقت للصلاحيات
const permissionCache = new Map<string, boolean>();
const CACHE_SIZE_LIMIT = 1000;

/**
 * التحقق من الصلاحية مع تخزين مؤقت للأداء العالي
 */
export function hasPermission(role: SystemRole, permission: Permission): boolean {
  const cacheKey = `${role}:${permission}`;

  if (permissionCache.has(cacheKey)) {
    return permissionCache.get(cacheKey)!;
  }

  const result = ROLE_PERMISSIONS[role]?.has(permission) || false;

  // إدارة حجم التخزين المؤقت
  if (permissionCache.size >= CACHE_SIZE_LIMIT) {
    const firstKey = permissionCache.keys().next().value;
    permissionCache.delete(firstKey);
  }

  permissionCache.set(cacheKey, result);
  return result;
}

/**
 * التحقق من صلاحية الوصول لقسم كامل
 */
export function hasSectionAccess(role: SystemRole, section: AdminSection): boolean {
  const sectionPermissions = SECTION_PERMISSIONS[section];
  return sectionPermissions.some((permission) => hasPermission(role, permission));
}

/**
 * التحقق من صلاحيات متعددة - ANY
 */
export function hasAnyPermission(role: SystemRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * التحقق من صلاحيات متعددة - ALL
 */
export function hasAllPermissions(role: SystemRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * الحصول على جميع الأقسام المتاحة للمستخدم
 */
export function getAvailableSections(role: SystemRole): AdminSection[] {
  const sections: AdminSection[] = [];

  for (const section of Object.keys(SECTION_PERMISSIONS) as AdminSection[]) {
    if (hasSectionAccess(role, section)) {
      sections.push(section);
    }
  }

  return sections;
}

/**
 * الحصول على الصلاحيات المتاحة لقسم معين
 */
export function getSectionPermissions(role: SystemRole, section: AdminSection): Permission[] {
  const sectionPermissions = SECTION_PERMISSIONS[section];
  return sectionPermissions.filter((permission) => hasPermission(role, permission));
}

/**
 * التحقق من الأدوار الإدارية
 */
export function isAdmin(role: SystemRole): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isModerator(role: SystemRole): boolean {
  return role === 'MODERATOR' || isAdmin(role);
}

export function isSuperAdmin(role: SystemRole): boolean {
  return role === 'SUPER_ADMIN';
}

/**
 * فلترة العناصر حسب الصلاحيات
 */
export function filterByPermission<T extends { permission?: Permission }>(
  role: SystemRole,
  items: T[],
): T[] {
  return items.filter((item) => !item.permission || hasPermission(role, item.permission));
}

/**
 * رسائل الأخطاء
 */
export const PERMISSION_ERRORS = {
  UNAUTHORIZED: 'غير مصرح بالوصول',
  INSUFFICIENT_PERMISSIONS: 'ليس لديك صلاحيات كافية',
  ADMIN_REQUIRED: 'يتطلب صلاحيات إدارية',
  MODERATOR_REQUIRED: 'يتطلب صلاحيات إشراف',
  SUPER_ADMIN_REQUIRED: 'يتطلب صلاحيات مدير النظام الرئيسي',
  SECTION_ACCESS_DENIED: 'لا يمكنك الوصول لهذا القسم',
} as const;

/**
 * الحصول على رسالة خطأ مناسبة
 */
export function getPermissionError(
  role: SystemRole | null,
  requiredPermission: Permission,
): string {
  if (!role) {
    return PERMISSION_ERRORS.UNAUTHORIZED;
  }

  if (!hasPermission(role, requiredPermission)) {
    return PERMISSION_ERRORS.INSUFFICIENT_PERMISSIONS;
  }

  return '';
}

/**
 * تنظيف التخزين المؤقت
 */
export function clearPermissionCache(): void {
  permissionCache.clear();
}

/**
 * إحصائيات التخزين المؤقت
 */
export function getPermissionCacheStats() {
  return {
    size: permissionCache.size,
    limit: CACHE_SIZE_LIMIT,
  };
}
