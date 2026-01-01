import { useMemo, useCallback } from 'react';
import {
  hasPermission,
  hasSectionAccess,
  hasAnyPermission,
  hasAllPermissions,
  getAvailableSections,
  getSectionPermissions,
  isAdmin,
  isModerator,
  isSuperAdmin,
  filterByPermission,
  type SystemRole,
  type Permission,
  type AdminSection,
} from '../lib/permissions/advanced-permissions';

// Re-export types for components
export type { SystemRole, Permission, AdminSection };

interface User {
  role: SystemRole;
  id: string;
  name: string;
  email: string;
}

interface UsePermissionsProps {
  user?: User | null | undefined;
}

/**
 * Hook للتحقق من الصلاحيات مع تحسينات الأداء للمشروع الضخم
 */
export function usePermissions({ user }: UsePermissionsProps = {}) {
  const userRole = user?.role || 'USER';

  // تخزين مؤقت للدوال المحسوبة
  const permissions = useMemo(
    () => ({
      // التحقق من صلاحية واحدة
      hasPermission: (permission: Permission) => hasPermission(userRole, permission),

      // التحقق من صلاحية الوصول لقسم
      hasSectionAccess: (section: AdminSection) => hasSectionAccess(userRole, section),

      // التحقق من صلاحيات متعددة
      hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
      hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),

      // الحصول على الأقسام والصلاحيات المتاحة
      getAvailableSections: () => getAvailableSections(userRole),
      getSectionPermissions: (section: AdminSection) => getSectionPermissions(userRole, section),

      // التحقق من نوع المستخدم
      isAdmin: () => isAdmin(userRole),
      isModerator: () => isModerator(userRole),
      isSuperAdmin: () => isSuperAdmin(userRole),

      // فلترة العناصر
      filterByPermission: <T extends { permission?: Permission }>(items: T[]) =>
        filterByPermission(userRole, items),
    }),
    [userRole],
  );

  // دوال للتحقق السريع من الصلاحيات الشائعة
  const commonPermissions = useMemo(
    () => ({
      // أقسام المشروع
      canAccessDashboard: permissions.hasSectionAccess('dashboard'),
      canManageUsers: permissions.hasSectionAccess('users'),
      canManageRoles: permissions.hasSectionAccess('roles'),
      canManageAuctions: permissions.hasSectionAccess('auctions'),
      canManageMarketplace: permissions.hasSectionAccess('marketplace'),
      canManageTransport: permissions.hasSectionAccess('transport'),
      canManageShowrooms: permissions.hasSectionAccess('showrooms'),
      canManageFinance: permissions.hasSectionAccess('finance'),
      canManageReports: permissions.hasSectionAccess('reports'),
      canManageSecurity: permissions.hasSectionAccess('security'),
      canManageSettings: permissions.hasSectionAccess('settings'),

      // إجراءات محددة
      canCreateUsers: permissions.hasPermission('users.create'),
      canDeleteUsers: permissions.hasPermission('users.delete'),
      canExportReports: permissions.hasPermission('reports.export'),
      canManageFinancialData: permissions.hasPermission('finance.manage'),
      canAccessSecurityLogs: permissions.hasPermission('security.access'),

      // أدوار
      isRegularUser: userRole === 'USER',
      isModeratorOrAbove: permissions.isModerator(),
      isAdminOrAbove: permissions.isAdmin(),
      isSuperAdmin: permissions.isSuperAdmin(),
    }),
    [permissions, userRole],
  );

  // دالة للتحقق من صلاحية مع رسالة خطأ
  const checkPermissionWithError = useCallback(
    (permission: Permission) => {
      const hasAccess = permissions.hasPermission(permission);
      return {
        hasAccess,
        error: hasAccess ? null : `ليس لديك صلاحية ${permission}`,
      };
    },
    [permissions],
  );

  // دالة للتحقق من صلاحية القسم مع رسالة خطأ
  const checkSectionAccessWithError = useCallback(
    (section: AdminSection) => {
      const hasAccess = permissions.hasSectionAccess(section);
      return {
        hasAccess,
        error: hasAccess ? null : `لا يمكنك الوصول لقسم ${section}`,
      };
    },
    [permissions],
  );

  // معلومات المستخدم والصلاحيات
  const userInfo = useMemo(
    () => ({
      user,
      role: userRole,
      availableSections: permissions.getAvailableSections(),
      isAuthenticated: !!user,
      hasAdminAccess: permissions.hasSectionAccess('dashboard'),
      isSuperAdmin: permissions.isSuperAdmin(),
    }),
    [user, userRole, permissions],
  );

  return {
    ...permissions,
    ...commonPermissions,
    checkPermissionWithError,
    checkSectionAccessWithError,
    userInfo,
  };
}

/**
 * Hook مخصص للتحقق من صلاحية واحدة
 */
export function useHasPermission(permission: Permission, user?: User | null) {
  const { hasPermission } = usePermissions({ user });
  return useMemo(() => hasPermission(permission), [hasPermission, permission]);
}

/**
 * Hook مخصص للتحقق من صلاحية الوصول لقسم
 */
export function useHasSectionAccess(section: AdminSection, user?: User | null) {
  const { hasSectionAccess } = usePermissions({ user });
  return useMemo(() => hasSectionAccess(section), [hasSectionAccess, section]);
}

/**
 * Hook للحصول على الأقسام المتاحة للمستخدم
 */
export function useAvailableSections(user?: User | null) {
  const { getAvailableSections } = usePermissions({ user });
  return useMemo(() => getAvailableSections(), [getAvailableSections]);
}

export type { User };
