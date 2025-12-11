/**
 * ملف الألوان والتصميم الموحد لنظام المزادات
 * يحتوي على جميع الألوان المستخدمة في المشروع
 */

import type { AuctionStatus } from '@/types/auction-unified';

// ============================================
// نظام الألوان الموحد - 4 حالات
// ============================================

export const AUCTION_COLORS = {
  /**
   * مزاد مباشر - LIVE 🔴
   * اللون: أحمر (Red)
   * الوضع: مزاد حي الآن، يحدث التداول المباشر
   */
  live: {
    // الألوان الأساسية
    primary: '#dc2626', // red-600
    secondary: '#b91c1c', // red-700
    light: '#fca5a5', // red-300
    lighter: '#fee2e2', // red-100
    dark: '#991b1b', // red-800
    
    // التدرجات
    gradient: 'from-red-600 to-red-500',
    gradientHover: 'from-red-700 to-red-600',
    
    // الخلفيات
    bg: 'bg-red-50',
    bgGradient: 'bg-gradient-to-r from-red-50 via-rose-50 to-pink-50',
    
    // النصوص
    text: 'text-red-700',
    textLight: 'text-red-600',
    textDark: 'text-red-800',
    
    // الحدود
    border: 'border-red-300',
    borderLight: 'border-red-200',
    borderDark: 'border-red-400',
    
    // الظلال
    shadow: 'shadow-red-100',
    shadowGlow: 'shadow-red-200/50',
    shadowStrong: 'shadow-lg shadow-red-200/50',
    
    // الحلقات (Rings)
    ring: 'ring-red-300',
    ringFocus: 'focus:ring-red-500',
    
    // Hex Colors للـ SVG والعداد
    hex: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      stroke: '#dc2626',
      fill: '#fef2f2',
      text: '#991b1b',
    },
  },

  /**
   * مزاد قادم - UPCOMING 🟡
   * اللون: كهرماني (Amber)
   * الوضع: مزاد سيبدأ قريباً
   */
  upcoming: {
    // الألوان الأساسية
    primary: '#d97706', // amber-600
    secondary: '#b45309', // amber-700
    light: '#fbbf24', // amber-400
    lighter: '#fef3c7', // amber-100
    dark: '#92400e', // amber-800
    
    // التدرجات
    gradient: 'from-amber-600 to-amber-500',
    gradientHover: 'from-amber-700 to-amber-600',
    
    // الخلفيات
    bg: 'bg-amber-50',
    bgGradient: 'bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50',
    
    // النصوص
    text: 'text-amber-700',
    textLight: 'text-amber-600',
    textDark: 'text-amber-800',
    
    // الحدود
    border: 'border-amber-300',
    borderLight: 'border-amber-200',
    borderDark: 'border-amber-400',
    
    // الظلال
    shadow: 'shadow-amber-100',
    shadowGlow: 'shadow-amber-200/50',
    shadowStrong: 'shadow-lg shadow-amber-200/50',
    
    // الحلقات
    ring: 'ring-amber-300',
    ringFocus: 'focus:ring-amber-500',
    
    // Hex Colors
    hex: {
      primary: '#d97706',
      secondary: '#b45309',
      stroke: '#d97706',
      fill: '#fffbeb',
      text: '#92400e',
    },
  },

  /**
   * تم البيع - SOLD ✅
   * اللون: أخضر (Green)
   * الوضع: تم البيع بنجاح
   */
  sold: {
    // الألوان الأساسية
    primary: '#16a34a', // green-600
    secondary: '#15803d', // green-700
    light: '#4ade80', // green-400
    lighter: '#dcfce7', // green-100
    dark: '#166534', // green-800
    
    // التدرجات
    gradient: 'from-green-600 to-green-500',
    gradientHover: 'from-green-700 to-green-600',
    
    // الخلفيات
    bg: 'bg-green-50',
    bgGradient: 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50',
    
    // النصوص
    text: 'text-green-700',
    textLight: 'text-green-600',
    textDark: 'text-green-800',
    
    // الحدود
    border: 'border-green-300',
    borderLight: 'border-green-200',
    borderDark: 'border-green-400',
    
    // الظلال
    shadow: 'shadow-green-100',
    shadowGlow: 'shadow-green-200/50',
    shadowStrong: 'shadow-lg shadow-green-200/50',
    
    // الحلقات
    ring: 'ring-green-300',
    ringFocus: 'focus:ring-green-500',
    
    // Hex Colors
    hex: {
      primary: '#16a34a',
      secondary: '#15803d',
      stroke: '#16a34a',
      fill: '#f0fdf4',
      text: '#166534',
    },
  },

  /**
   * مزاد منتهي - ENDED ⚫
   * اللون: رمادي (Gray)
   * الوضع: انتهى بدون بيع (لم يصل للسعر المطلوب)
   */
  ended: {
    // الألوان الأساسية
    primary: '#6b7280', // gray-500
    secondary: '#4b5563', // gray-600
    light: '#9ca3af', // gray-400
    lighter: '#f3f4f6', // gray-100
    dark: '#374151', // gray-700
    
    // التدرجات
    gradient: 'from-gray-500 to-gray-400',
    gradientHover: 'from-gray-600 to-gray-500',
    
    // الخلفيات
    bg: 'bg-gray-50',
    bgGradient: 'bg-gradient-to-r from-gray-50 to-slate-50',
    
    // النصوص
    text: 'text-gray-700',
    textLight: 'text-gray-600',
    textDark: 'text-gray-800',
    
    // الحدود
    border: 'border-gray-300',
    borderLight: 'border-gray-200',
    borderDark: 'border-gray-400',
    
    // الظلال
    shadow: 'shadow-gray-100',
    shadowGlow: 'shadow-gray-200/50',
    shadowStrong: 'shadow-lg shadow-gray-200/50',
    
    // الحلقات
    ring: 'ring-gray-300',
    ringFocus: 'focus:ring-gray-500',
    
    // Hex Colors
    hex: {
      primary: '#6b7280',
      secondary: '#4b5563',
      stroke: '#6b7280',
      fill: '#f9fafb',
      text: '#374151',
    },
  },
} as const;

// ============================================
// دالة مساعدة للحصول على الألوان حسب الحالة
// ============================================

export const getAuctionColors = (status: AuctionStatus) => {
  return AUCTION_COLORS[status];
};

// ============================================
// تكوينات التصميم الإضافية
// ============================================

export const AUCTION_DESIGN = {
  /** مدة التأثيرات الحركية */
  animation: {
    duration: '300ms',
    timing: 'ease-in-out',
  },
  
  /** أحجام الشارات */
  badge: {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base',
  },
  
  /** أحجام العدادات */
  timer: {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-40 h-40',
  },
  
  /** نصف أقطار الحواف */
  radius: {
    small: 'rounded-md',
    medium: 'rounded-lg',
    large: 'rounded-xl',
    full: 'rounded-full',
  },
  
  /** الظلال */
  shadow: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
} as const;

// ============================================
// تأثيرات خاصة لكل حالة
// ============================================

export const AUCTION_EFFECTS = {
  live: {
    pulse: 'animate-pulse',
    glow: 'shadow-lg shadow-red-200/50 ring-2 ring-red-300',
    overlay: 'bg-gradient-to-t from-red-600/30 via-transparent to-transparent',
  },
  upcoming: {
    pulse: 'animate-pulse',
    glow: 'shadow-lg shadow-amber-200/50 ring-2 ring-amber-300',
    overlay: 'bg-gradient-to-t from-amber-600/20 via-transparent to-transparent',
  },
  sold: {
    pulse: '',
    glow: 'shadow-lg shadow-green-200/50 ring-1 ring-green-300',
    overlay: 'bg-gradient-to-t from-green-600/20 via-transparent to-transparent',
  },
  ended: {
    pulse: '',
    glow: '',
    overlay: 'bg-gradient-to-t from-gray-600/40 via-transparent to-transparent',
  },
} as const;

export default AUCTION_COLORS;
