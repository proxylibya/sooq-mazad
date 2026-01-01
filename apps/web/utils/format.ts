/**
 * دوال التنسيق الموحدة للأرقام والتواريخ والأوقات
 * تضمن استخدام ar-EG-u-nu-latn للحصول على أرقام إنجليزية (0-9) في واجهة عربية
 */

// الإعداد الأساسي للغة العربية مع أرقام إنجليزية
const ARABIC_LOCALE = 'ar-EG-u-nu-latn';

/**
 * تنسيق الأرقام العادية
 */
export const formatNumber = (
  value: number | string,
  options?: Intl.NumberFormatOptions,
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  return num.toLocaleString(ARABIC_LOCALE, options);
};

/**
 * تنسيق النسب المئوية
 */
export const formatPercent = (value: number | string, decimals: number = 0): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0%';

  return `${formatNumber(num, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
};

/**
 * تنسيق العملة
 */
export const formatCurrency = (
  value: number | string,
  currency: string = 'LYD',
  decimals: number = 2,
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `0 ${currency}`;

  return `${formatNumber(num, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${currency}`;
};

/**
 * تنسيق التاريخ فقط
 */
export const formatDate = (
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  };

  return dateObj.toLocaleDateString(ARABIC_LOCALE, defaultOptions);
};

/**
 * تنسيق الوقت فقط
 */
export const formatTime = (
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options,
  };

  return dateObj.toLocaleTimeString(ARABIC_LOCALE, defaultOptions);
};

/**
 * تنسيق التاريخ والوقت معاً
 */
export const formatDateTime = (
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options,
  };

  return dateObj.toLocaleString(ARABIC_LOCALE, defaultOptions);
};

/**
 * تنسيق الوقت النسبي (منذ كذا)
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `منذ ${formatNumber(diffMinutes)} دقيقة`;
  if (diffHours < 24) return `منذ ${formatNumber(diffHours)} ساعة`;
  if (diffDays < 30) return `منذ ${formatNumber(diffDays)} يوم`;

  return formatDate(dateObj);
};

/**
 * تنسيق حجم الملف
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 بايت';

  const k = 1024;
  const sizes = ['بايت', 'كيلو بايت', 'ميجا بايت', 'جيجا بايت', 'تيرا بايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${formatNumber(parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)))} ${sizes[i]}`;
};

/**
 * تنسيق المدة الزمنية (بالثواني)
 */
export const formatDuration = (seconds: number, showSeconds: boolean = true): string => {
  if (seconds < 0) return '0 ثانية';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) parts.push(`${formatNumber(hours)} ساعة`);
  if (minutes > 0) parts.push(`${formatNumber(minutes)} دقيقة`);
  if (showSeconds && (secs > 0 || parts.length === 0)) {
    parts.push(`${formatNumber(secs)} ثانية`);
  }

  return parts.join(' و ');
};

/**
 * تنسيق الأرقام الكبيرة (K, M, B)
 */
export const formatLargeNumber = (value: number, decimals: number = 1): string => {
  if (value < 1000) return formatNumber(value);

  const suffixes = ['', 'ألف', 'مليون', 'مليار', 'تريليون'];
  const magnitude = Math.floor(Math.log10(Math.abs(value)) / 3);
  const scaledValue = value / Math.pow(1000, magnitude);

  return `${formatNumber(scaledValue, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${suffixes[magnitude]}`;
};

/**
 * دالة مساعدة للتحقق من صحة الرقم
 */
export const isValidNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * دالة مساعدة لتحويل القيم المختلطة لأرقام
 */
export const toNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};
