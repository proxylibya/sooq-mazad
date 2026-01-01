/**
 * أنواع البيانات الموحدة لنظام المصادقة
 * النظام الجديد الموحد لجميع أنواع الحسابات الأربعة
 */

// أنواع الحسابات الأربعة المعتمدة
export type AccountType = 
  | 'REGULAR_USER'      // مستخدم عادي
  | 'TRANSPORT_OWNER'   // مالك خدمات نقل
  | 'SHOWROOM'          // معرض سيارات
  | 'COMPANY';          // شركة

// الأدوار في النظام
export type UserRole = 
  | 'USER'              // مستخدم عادي
  | 'ADMIN'             // مدير
  | 'SUPER_ADMIN'       // مدير عام
  | 'MODERATOR'         // مشرف
  | 'MANAGER';          // مدير قسم

// حالات المستخدم
export type UserStatus = 
  | 'ACTIVE'            // نشط
  | 'INACTIVE'          // غير نشط
  | 'SUSPENDED'         // موقوف
  | 'PENDING';          // في انتظار التفعيل

// بيانات المستخدم الموحدة
export interface User {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  accountType: AccountType;
  verified: boolean;
  profileImage?: string | null;
  status: UserStatus;
  rating?: number | null;
  totalReviews?: number;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // بيانات إضافية حسب نوع الحساب
  transportProfile?: TransportProfile | null;
  showroomProfile?: ShowroomProfile | null;
  companyProfile?: CompanyProfile | null;
  wallet?: WalletData | null;
}

// ملف النقل (للنقليات)
export interface TransportProfile {
  id: string;
  userId: string;
  truckNumber: string;
  licenseCode: string;
  truckType: string;
  capacity: number;
  serviceArea: string;
  pricePerKm?: number | null;
  priceType: string;
  isAvailable: boolean;
  verified: boolean;
  images: {
    frontImage?: string | null;
    backImage?: string | null;
    sideImage?: string | null;
    interiorImage?: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ملف المعرض (للمعارض)
export interface ShowroomProfile {
  id: string;
  name: string;
  description: string;
  vehicleTypes: string;
  vehicleCount: string;
  city: string;
  area: string;
  address: string;
  coordinates?: string | null;
  images: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  openingHours?: string | null;
  specialties?: string | null;
  establishedYear?: number | null;
  verified: boolean;
  featured: boolean;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  rating?: number | null;
  reviewsCount: number;
  totalCars: number;
  activeCars: number;
  soldCars: number;
  createdAt: Date;
  updatedAt: Date;
}

// ملف الشركة (للشركات)
export interface CompanyProfile {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  city: string;
  area?: string | null;
  address?: string | null;
  verified: boolean;
  featured: boolean;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  rating?: number | null;
  reviewsCount: number;
  totalEmployees: number;
  activeProjects: number;
  businessType: string[];
  specialties: string[];
  openingHours?: string | null;
  establishedYear?: number | null;
  licenseNumber?: string | null;
  taxNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// بيانات المحفظة
export interface WalletData {
  id: string;
  userId: string;
  isActive: boolean;
  localWallet?: {
    balance: number;
    currency: string; // LYD
  };
  globalWallet?: {
    balance: number;
    currency: string; // USD
  };
  cryptoWallet?: {
    balance: number;
    currency: string; // USDT-TRC20
    address?: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

// جلسة المصادقة
export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
  rememberMe: boolean;
}

// استجابة المصادقة الموحدة
export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
    expiresAt: number;
    message?: string;
  };
  error?: string;
  message?: string;
}

// بيانات التسجيل
export interface RegisterData {
  name: string;
  phone: string;
  password: string;
  accountType: AccountType;
  email?: string | null;
  
  // بيانات إضافية للنقل
  transportData?: {
    truckNumber: string;
    licenseCode: string;
    truckType: string;
    capacity: number;
    serviceArea: string;
    pricePerKm?: number;
  };
  
  // بيانات إضافية للمعرض
  showroomData?: {
    name: string;
    description: string;
    city: string;
    area: string;
    address: string;
    vehicleTypes: string;
    phone?: string;
    email?: string;
  };
  
  // بيانات إضافية للشركة
  companyData?: {
    name: string;
    description?: string;
    city: string;
    businessType: string[];
    phone?: string;
    email?: string;
  };
}

// بيانات تسجيل الدخول
export interface LoginData {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

// نتيجة التحقق من رقم الهاتف
export interface PhoneValidationResult {
  isValid: boolean;
  normalizedPhone: string;
  displayPhone: string;
  countryCode: string;
  error?: string;
}

// تسميات أنواع الحسابات بالعربية
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  REGULAR_USER: 'مستخدم عادي',
  TRANSPORT_OWNER: 'مالك خدمات نقل',
  SHOWROOM: 'معرض سيارات',
  COMPANY: 'شركة'
};

// تسميات الأدوار بالعربية
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  USER: 'مستخدم',
  ADMIN: 'مدير',
  SUPER_ADMIN: 'مدير عام',
  MODERATOR: 'مشرف',
  MANAGER: 'مدير قسم'
};

// تسميات حالات المستخدم بالعربية
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'نشط',
  INACTIVE: 'غير نشط',
  SUSPENDED: 'موقوف',
  PENDING: 'في انتظار التفعيل'
};

// التحقق من نوع الحساب
export function isValidAccountType(value: any): value is AccountType {
  return typeof value === 'string' && 
    ['REGULAR_USER', 'TRANSPORT_OWNER', 'SHOWROOM', 'COMPANY'].includes(value);
}

// التحقق من الدور
export function isValidUserRole(value: any): value is UserRole {
  return typeof value === 'string' && 
    ['USER', 'ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'MANAGER'].includes(value);
}

// التحقق من حالة المستخدم
export function isValidUserStatus(value: any): value is UserStatus {
  return typeof value === 'string' && 
    ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'].includes(value);
}

// الحصول على تسمية نوع الحساب بالعربية
export function getAccountTypeLabel(accountType: AccountType): string {
  return ACCOUNT_TYPE_LABELS[accountType] || 'غير محدد';
}

// الحصول على تسمية الدور بالعربية
export function getUserRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role] || 'غير محدد';
}

// الحصول على تسمية حالة المستخدم بالعربية
export function getUserStatusLabel(status: UserStatus): string {
  return USER_STATUS_LABELS[status] || 'غير محدد';
}

// التحقق من صلاحيات الإدارة
export function hasAdminAccess(role: UserRole): boolean {
  return ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'MANAGER'].includes(role);
}

// التحقق من صلاحيات المدير العام
export function isSuperAdmin(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

// التحقق من إمكانية الوصول لوحة الإدارة
export function canAccessAdminPanel(user: User): boolean {
  return hasAdminAccess(user.role) && user.status === 'ACTIVE' && user.verified;
}
