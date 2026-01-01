import {
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

import type { AccountType } from '../types/account';
import { ACCOUNT_TYPES, normalizeAccountType } from '../types/account';

export interface AccountTypeInfo {
  icon: any;
  text: string;
  shortText?: string;
  color: string;
  iconColor: string;
  bgColor?: string;
  badgeColor?: string;
  borderColor?: string;
  borderGradient?: string;
}

/**
 * دالة مركزية موحدة للحصول على معلومات نوع الحساب
 * تضمن الاتساق في عرض أنواع الحسابات عبر التطبيق
 */
export const getAccountTypeInfo = (accountType: string): AccountTypeInfo => {
  const at: AccountType = normalizeAccountType(accountType);
  switch (at) {
    case 'REGULAR_USER':
      return {
        icon: UserIcon,
        text: 'مستخدم عادي',
        shortText: 'مستخدم',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        iconColor: 'text-gray-600',
        bgColor: 'bg-gray-100',
        badgeColor: 'bg-gray-500',
        borderColor: 'border-gray-400',
        borderGradient: 'bg-gradient-to-br from-gray-400 to-gray-600',
      };

    case 'TRANSPORT_OWNER':
      return {
        icon: TruckIcon,
        text: 'صاحب ساحبة - نقل',
        shortText: 'ساحبة نقل',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-100',
        badgeColor: 'bg-blue-500',
        borderColor: 'border-blue-500',
        borderGradient: 'bg-gradient-to-br from-blue-400 to-blue-600',
      };

    case 'COMPANY':
      return {
        icon: BuildingOfficeIcon,
        text: 'شركة',
        shortText: 'شركة',
        color: 'bg-green-100 text-green-800 border-green-200',
        iconColor: 'text-green-600',
        bgColor: 'bg-green-100',
        badgeColor: 'bg-green-500',
        borderColor: 'border-green-500',
        borderGradient: 'bg-gradient-to-br from-green-400 to-green-600',
      };

    case 'SHOWROOM':
      return {
        icon: BuildingStorefrontIcon,
        text: 'معرض سيارات',
        shortText: 'معرض',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-100',
        badgeColor: 'bg-purple-500',
        borderColor: 'border-purple-500',
        borderGradient: 'bg-gradient-to-br from-purple-400 to-purple-600',
      };

    default:
      return {
        icon: UserIcon,
        text: 'مستخدم',
        shortText: 'مستخدم',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        iconColor: 'text-gray-600',
        bgColor: 'bg-gray-100',
        badgeColor: 'bg-gray-500',
        borderColor: 'border-gray-400',
        borderGradient: 'bg-gradient-to-br from-gray-400 to-gray-600',
      };
  }
};

/**
 * دالة للحصول على النص المختصر لنوع الحساب (للاستخدام في شريط التنقل)
 */
export const getAccountTypeShortText = (accountType: string): string => {
  const info = getAccountTypeInfo(accountType);
  return info.shortText || info.text;
};

/**
 * دالة للحصول على النص الكامل لنوع الحساب
 */
export const getAccountTypeFullText = (accountType: string): string => {
  const info = getAccountTypeInfo(accountType);
  return info.text;
};

/**
 * دالة للتحقق من نوع الحساب
 */
export const isTransportOwner = (accountType: string): boolean => {
  return accountType === 'TRANSPORT_OWNER';
};

export const isRegularUser = (accountType: string): boolean => {
  return accountType === 'REGULAR_USER';
};

export const isCompany = (accountType: string): boolean => {
  return accountType === 'COMPANY';
};

export const isShowroom = (accountType: string): boolean => {
  return accountType === 'SHOWROOM';
};

export const isShowroomOwner = (accountType: string): boolean => {
  return accountType === 'SHOWROOM';
};

/**
 * مسار افتراضي للوحة التحكم حسب نوع الحساب
 */
export const getDefaultDashboardPath = (accountType: string): string => {
  const at: AccountType = normalizeAccountType(accountType);
  switch (at) {
    case 'SHOWROOM':
      return '/showroom/dashboard';
    case 'TRANSPORT_OWNER':
      return '/transport/dashboard';
    case 'COMPANY':
      // المسار الافتراضي للوحة تحكم الشركات
      return '/company/dashboard';
    case 'REGULAR_USER':
    default:
      return '/my-account';
  }
};

/**
 * دالة للحصول على لون الحدود حسب نوع الحساب
 */
export const getAccountTypeBorderGradient = (accountType: string): string => {
  const accountInfo = getAccountTypeInfo(accountType);
  return accountInfo.borderGradient || 'bg-gradient-to-br from-gray-400 to-gray-600';
};

/**
 * دالة للحصول على جميع أنواع الحسابات المتاحة
 */
export const getAllAccountTypes = () => {
  return ACCOUNT_TYPES.map((value) => {
    switch (value) {
      case 'REGULAR_USER':
        return { value, label: 'مستخدم عادي' };
      case 'TRANSPORT_OWNER':
        return { value, label: 'صاحب ساحبة - نقل' };
      case 'SHOWROOM':
        return { value, label: 'معرض سيارات' };
      case 'COMPANY':
        return { value, label: 'شركة' };
      default:
        return { value, label: value };
    }
  });
};
