// @ts-nocheck
/**
 * 🔐 تعريفات TypeScript للمصادقة الموحدة
 * Unified Authentication Type Definitions
 */

export interface User {
  id: string;
  publicId?: number;
  name: string;
  phone: string;
  email?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MODERATOR' | 'MANAGER';
  accountType: 'INDIVIDUAL' | 'COMPANY' | 'SHOWROOM' | 'ADMIN';
  verified: boolean;
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  profileImage?: string | null;
  wallet?: WalletData;
  favorites?: string[];
  reminders?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface WalletData {
  id?: string;
  balance: number;
  currency: string;
  pendingBalance?: number;
  totalEarnings?: number;
  totalWithdrawals?: number;
}

export interface AuthSession {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: number;
  rememberMe: boolean;
}

export interface LoginCredentials {
  identifier: string; // phone, email, or username
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  phone: string;
  email?: string;
  password: string;
  accountType?: string;
  companyName?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface PasswordResetRequest {
  identifier: string; // phone or email
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
  location?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// تصدير الأنواع للاستخدام العام
export type UserRole = User['role'];
export type UserStatus = User['status'];
export type AccountType = User['accountType'];

// دوال التحقق من النوع
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
};

export const isSuperAdmin = (user: User | null): boolean => {
  return user?.role === 'SUPER_ADMIN';
};

export const isModerator = (user: User | null): boolean => {
  return user?.role === 'MODERATOR';
};

export const isManager = (user: User | null): boolean => {
  return user?.role === 'MANAGER';
};

export const hasAdminAccess = (user: User | null): boolean => {
  return ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'MANAGER'].includes(user?.role || '');
};

export const isVerified = (user: User | null): boolean => {
  return user?.verified === true;
};

export const isActive = (user: User | null): boolean => {
  return user?.status === 'ACTIVE';
};

export const isBlocked = (user: User | null): boolean => {
  return user?.status === 'BLOCKED' || user?.status === 'SUSPENDED';
};
