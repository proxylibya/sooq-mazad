// إعدادات رفع الملفات المحسنة
export const UPLOAD_CONFIG = {
  // حدود الملفات
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MIN_FILE_SIZE: 1024, // 1KB

  // أنواع الملفات المدعومة
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/svg+xml',
    'image/ico',
    'image/heic',
    'image/heif',
  ],

  // إعدادات الوقت
  TIMEOUTS: {
    UPLOAD: 120000, // 2 دقيقة للرفع
    PARSE: 60000, // 1 دقيقة لتحليل النموذج
    RETRY_DELAY: 2000, // 2 ثانية بين المحاولات
  },

  // إعدادات إعادة المحاولة
  RETRY: {
    MAX_ATTEMPTS: 3,
    BACKOFF_MULTIPLIER: 2,
  },

  // رسائل الأخطاء
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت',
    FILE_TOO_SMALL: 'حجم الصورة صغير جداً. الحد الأدنى 1 كيلوبايت',
    INVALID_TYPE: 'نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WebP',
    NETWORK_ERROR: 'مشكلة في الاتصال بالخادم. تحقق من اتصال الإنترنت',
    TIMEOUT_ERROR: 'انتهت مهلة الرفع. يرجى المحاولة مرة أخرى أو استخدام صورة أصغر',
    SERVER_ERROR: 'خطأ في الخادم. يرجى المحاولة مرة أخرى',
    PARSE_ERROR: 'خطأ في تحليل البيانات المرسلة',
    UNKNOWN_ERROR: 'خطأ غير معروف في رفع الصورة',
  },

  // إعدادات الضغط (للاستخدام المستقبلي)
  COMPRESSION: {
    QUALITY: 0.8,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
  },

  // مسارات الحفظ
  PATHS: {
    TEMP: 'uploads/temp',
    CARS: 'public/images/cars',
    PROFILES: 'public/images/profiles',
    MESSAGES: 'public/uploads/messages',
  },
};

// دالة للتحقق من صحة نوع الملف
export function isValidFileType(mimeType: string): boolean {
  return UPLOAD_CONFIG.ALLOWED_TYPES.includes(mimeType);
}

// دالة للتحقق من حجم الملف
export function isValidFileSize(size: number): boolean {
  return size >= UPLOAD_CONFIG.MIN_FILE_SIZE && size <= UPLOAD_CONFIG.MAX_FILE_SIZE;
}

// دالة لتنسيق حجم الملف
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت';

  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// دالة للحصول على رسالة خطأ مناسبة
export function getErrorMessage(error: any): string {
  const errorStr = error?.message || error?.toString() || '';

  if (error?.name === 'AbortError') {
    return UPLOAD_CONFIG.ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  if (errorStr.includes('Failed to fetch') || errorStr.includes('NetworkError')) {
    return UPLOAD_CONFIG.ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (
    errorStr.includes('413') ||
    errorStr.includes('Payload Too Large') ||
    errorStr.includes('حجم الملف كبير')
  ) {
    return UPLOAD_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE;
  }

  if (errorStr.includes('500') || errorStr.includes('Internal Server Error')) {
    return UPLOAD_CONFIG.ERROR_MESSAGES.SERVER_ERROR;
  }

  if (errorStr.includes('timeout')) {
    return UPLOAD_CONFIG.ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  if (errorStr.includes('نوع الصورة غير مدعوم')) {
    return UPLOAD_CONFIG.ERROR_MESSAGES.INVALID_TYPE;
  }

  return errorStr || UPLOAD_CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR;
}

// دالة لحساب تأخير إعادة المحاولة
export function getRetryDelay(attempt: number): number {
  return (
    UPLOAD_CONFIG.TIMEOUTS.RETRY_DELAY * Math.pow(UPLOAD_CONFIG.RETRY.BACKOFF_MULTIPLIER, attempt)
  );
}
