/**
 * نظام إدارة العملات الموحد للمشروع
 * Currency Management System for Libyan Dinar (LYD)
 */

export const LIBYAN_CURRENCY = {
  code: 'LYD',
  symbol: 'د.ل',
  nameAr: 'دينار ليبي',
  nameEn: 'Libyan Dinar',
  locale: 'ar-LY',
  fallbackLocale: 'ar-EG-u-nu-latn',
} as const;

/**
 * تنسيق المبلغ بالدينار الليبي باستخدام Intl API
 * Format amount in Libyan Dinar using Intl API
 */
export function formatLibyanCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat('ar-LY', {
      style: 'currency',
      currency: 'LYD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if ar-LY locale is not supported
    return `${amount.toLocaleString('ar-EG-u-nu-latn')} ${LIBYAN_CURRENCY.symbol}`;
  }
}

/**
 * تنسيق بسيط للمبلغ بالدينار الليبي
 * Simple formatting with symbol
 */
export function formatLibyanCurrencySimple(amount: number): string {
  const formatted = amount.toLocaleString('ar-EG-u-nu-latn');
  return `${formatted} ${LIBYAN_CURRENCY.symbol}`;
}

/**
 * تنسيق المبلغ بدون رمز العملة
 * Format amount without currency symbol
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('ar-EG-u-nu-latn');
}

/**
 * تنسيق المبلغ مع فواصل عشرية
 * Format amount with decimals
 */
export function formatAmountWithDecimals(amount: number, decimals: number = 2): string {
  return amount.toLocaleString('ar-EG-u-nu-latn', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * رمز العملة فقط
 * Currency symbol only
 */
export function getCurrencySymbol(): string {
  return LIBYAN_CURRENCY.symbol;
}

/**
 * اسم العملة بالعربية
 * Currency name in Arabic
 */
export function getCurrencyNameAr(): string {
  return LIBYAN_CURRENCY.nameAr;
}

/**
 * كود العملة (LYD)
 * Currency code
 */
export function getCurrencyCode(): string {
  return LIBYAN_CURRENCY.code;
}

/**
 * تنسيق نطاق أسعار
 * Format price range
 */
export function formatPriceRange(min: number, max: number): string {
  return `${formatLibyanCurrencySimple(min)} - ${formatLibyanCurrencySimple(max)}`;
}

/**
 * تحويل قيمة نصية إلى رقم
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * التحقق من صحة المبلغ
 * Validate currency amount
 */
export function isValidAmount(amount: number, min: number = 0, max?: number): boolean {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return false;
  }
  if (amount < min) {
    return false;
  }
  if (max !== undefined && amount > max) {
    return false;
  }
  return true;
}

/**
 * تقريب المبلغ
 * Round amount to nearest value
 */
export function roundAmount(amount: number, nearest: number = 1): number {
  return Math.round(amount / nearest) * nearest;
}

// Default export
export default {
  LIBYAN_CURRENCY,
  formatLibyanCurrency,
  formatLibyanCurrencySimple,
  formatAmount,
  formatAmountWithDecimals,
  getCurrencySymbol,
  getCurrencyNameAr,
  getCurrencyCode,
  formatPriceRange,
  parseCurrency,
  isValidAmount,
  roundAmount,
};
