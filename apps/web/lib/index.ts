// @ts-nocheck
/**
 * ============================================================
 * UNIFIED LIBRARY EXPORTS - التصديرات الموحدة للمكتبة
 * ============================================================
 */

// Error & Logging System
export * from './error-system';
export { default as ErrorSystem } from './error-system';

// Accessibility System
export * from './accessibility';
export { default as Accessibility } from './accessibility';

// CMS System
export * from './cms';
export { default as CMS } from './cms';

// Re-export common utilities
export { logger, errorHandler, logError, logInfo, logWarn } from './error-system';
export { aria, announce, announceAr, t, getLocalized } from './accessibility';
export { t as translate, formatDate, formatCurrency, formatNumber } from './cms';
