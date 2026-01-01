// أنواع البيانات الخاصة بالأدوار والصلاحيات

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  userCount?: number;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  category: PermissionCategory;
}

export type PermissionCategory =
  | 'users'
  | 'auctions'
  | 'content'
  | 'reports'
  | 'settings'
  | 'finance'
  | 'system';

export interface RoleFormData {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
}

export interface RoleStats {
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  totalUsers: number;
}
