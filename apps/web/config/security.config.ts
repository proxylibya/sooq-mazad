/**
 * إعدادات النظام الأمني المتقدم
 * يحتوي على جميع الإعدادات والثوابت الأمنية
 */

// إعدادات التشفير
export const ENCRYPTION_CONFIG = {
  // خوارزمية التشفير الرئيسية
  algorithm: 'aes-256-gcm' as const,

  // أطوال المفاتيح والمتجهات
  keyLength: 32,
  ivLength: 16,
  tagLength: 16,

  // إعدادات bcrypt
  saltRounds: 12,

  // إعدادات JWT
  jwtExpiry: '24h',
  refreshTokenExpiry: '7d',
  jwtAlgorithm: 'HS256' as const,
  jwtAudience: 'car-auction-users',
  jwtIssuer: 'car-auction-system',

  // إعدادات PBKDF2
  pbkdf2Iterations: 100000,
  pbkdf2Algorithm: 'sha512' as const,
};

// إعدادات Rate Limiting
export const RATE_LIMIT_CONFIG = {
  // الإعدادات العامة
  default: {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    maxRequests: 100,
    message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.',
  },

  // تسجيل الدخول
  login: {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    maxRequests: 5,
    message: 'تم تجاوز عدد محاولات تسجيل الدخول المسموح. يرجى المحاولة بعد 15 دقيقة.',
  },

  // العمليات الحساسة
  sensitive: {
    windowMs: 60 * 60 * 1000, // ساعة واحدة
    maxRequests: 10,
    message: 'تم تجاوز الحد المسموح للعمليات الحساسة. يرجى المحاولة بعد ساعة.',
  },

  // APIs العامة
  api: {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    maxRequests: 100,
    message: 'تم تجاوز الحد المسموح من طلبات API. يرجى المحاولة لاحقاً.',
  },
};

// إعدادات المصادقة الثنائية
export const TWO_FACTOR_CONFIG = {
  // إعدادات المصادق
  authenticator: {
    issuer: 'Car Auction System',
    window: 1, // نافذة التحقق (30 ثانية قبل وبعد)
    digits: 6,
    period: 30,
    algorithm: 'sha1' as const,
  },

  // إعدادات OTP
  otp: {
    length: 6,
    expiryMinutes: 5,
    maxAttempts: 3,
  },

  // إعدادات رموز النسخ الاحتياطي
  backupCodes: {
    count: 10,
    length: 8,
  },

  // إعدادات البريد الإلكتروني
  email: {
    expiryMinutes: 10,
    maxAttempts: 3,
    resendCooldown: 60, // ثانية
  },
};

// إعدادات فحص الأمان
export const SECURITY_SCAN_CONFIG = {
  // أنماط SQL Injection
  sqlInjectionPatterns: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\'|\"|;|--|\*|\/\*|\*\/)/g,
    /(\b(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)\b)/gi,
    /(\b(WAITFOR|DELAY|SLEEP)\b)/gi,
  ],

  // أنماط XSS
  xssPatterns: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi,
  ],

  // User Agents مشبوهة
  suspiciousUserAgents: [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /^$/,
  ],

  // عناوين IP محظورة (أمثلة)
  blockedIPRanges: [
    '10.0.0.0/8', // شبكات خاصة
    '172.16.0.0/12', // شبكات خاصة
    '192.168.0.0/16', // شبكات خاصة (يمكن إزالتها في الإنتاج)
    '127.0.0.0/8', // localhost
  ],
};

// إعدادات مراقبة الأمان
export const MONITORING_CONFIG = {
  // عتبات التنبيهات
  alertThresholds: {
    BRUTE_FORCE: 5, // محاولات تسجيل دخول فاشلة
    SQL_INJECTION: 1, // محاولة واحدة كافية
    XSS: 1, // محاولة واحدة كافية
    CSRF: 3, // انتهاكات CSRF
    DDOS: 10, // طلبات مشبوهة
    SUSPICIOUS_ACTIVITY: 10, // أنشطة مشبوهة
  },

  // فترات المراقبة
  timeWindows: {
    shortTerm: 10 * 60 * 1000, // 10 دقائق
    mediumTerm: 60 * 60 * 1000, // ساعة واحدة
    longTerm: 24 * 60 * 60 * 1000, // 24 ساعة
  },

  // إعدادات التنظيف
  cleanup: {
    eventsRetention: 7 * 24 * 60 * 60 * 1000, // 7 أيام
    alertsRetention: 30 * 24 * 60 * 60 * 1000, // 30 يوم
    cleanupInterval: 60 * 60 * 1000, // كل ساعة
  },

  // إعدادات الإشعارات
  notifications: {
    sms: {
      enabled: true,
      recipients: ['+218912345678'],
      minLevel: 'HIGH',
    },

    webhook: {
      enabled: false,
      url: 'https://hooks.slack.com/services/...',
      minLevel: 'MEDIUM',
    },
  },
};

// إعدادات حظر IP
export const IP_BLOCKING_CONFIG = {
  // مدة الحظر حسب نوع المخالفة
  blockDurations: {
    BRUTE_FORCE: 15 * 60 * 1000, // 15 دقيقة
    SQL_INJECTION: 24 * 60 * 60 * 1000, // 24 ساعة
    XSS: 12 * 60 * 60 * 1000, // 12 ساعة
    DDOS: 60 * 60 * 1000, // ساعة واحدة
    MANUAL: 7 * 24 * 60 * 60 * 1000, // 7 أيام
  },

  // عتبات الحظر التلقائي
  autoBlockThresholds: {
    failedLogins: 5, // محاولات تسجيل دخول فاشلة
    securityViolations: 3, // انتهاكات أمنية
    suspiciousRequests: 10, // طلبات مشبوهة
  },

  // قائمة بيضاء (عناوين IP معفاة من الحظر)
  whitelist: [
    '127.0.0.1', // localhost
    '::1', // IPv6 localhost
  ],
};

// إعدادات CSRF Protection
export const CSRF_CONFIG = {
  tokenLength: 32, // طول الرمز بالبايت
  tokenExpiry: 60 * 60 * 1000, // ساعة واحدة
  cookieName: 'csrf-token',
  headerName: 'X-CSRF-Token',

  // الصفحات المعفاة من فحص CSRF
  exemptPaths: ['/api/auth/csrf-token', '/api/health', '/api/status'],
};

// إعدادات كلمات المرور
export const PASSWORD_CONFIG = {
  minLength: 8,
  maxLength: 128,

  // متطلبات كلمة المرور
  requirements: {
    lowercase: true, // أحرف صغيرة
    uppercase: true, // أحرف كبيرة
    numbers: true, // أرقام
    symbols: true, // رموز خاصة
    noCommonPasswords: true, // منع كلمات المرور الشائعة
    noPersonalInfo: true, // منع المعلومات الشخصية
  },

  // كلمات مرور محظورة
  bannedPasswords: [
    'password',
    '123456',
    'admin',
    'qwerty',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
  ],

  // إعدادات انتهاء صلاحية كلمة المرور
  expiry: {
    enabled: false,
    days: 90,
    warningDays: 7,
  },
};

// إعدادات الجلسات
export const SESSION_CONFIG = {
  // مدة الجلسة
  duration: {
    default: 24 * 60 * 60 * 1000, // 24 ساعة
    rememberMe: 30 * 24 * 60 * 60 * 1000, // 30 يوم
    admin: 8 * 60 * 60 * 1000, // 8 ساعات للمديرين
  },

  // إعدادات الكوكيز
  cookie: {
    httpOnly: true,
    secure: true, // HTTPS فقط في الإنتاج
    sameSite: 'strict' as const,
    domain: undefined, // يتم تعيينه تلقائياً
    path: '/',
  },

  // تجديد الجلسة
  renewal: {
    enabled: true,
    threshold: 30 * 60 * 1000, // تجديد قبل 30 دقيقة من الانتهاء
    maxRenewals: 5, // حد أقصى للتجديدات
  },
};

// إعدادات التدقيق والسجلات
export const AUDIT_CONFIG = {
  // الأحداث المسجلة
  loggedEvents: [
    'LOGIN_SUCCESS',
    'LOGIN_FAILURE',
    'LOGOUT',
    'PASSWORD_CHANGE',
    'ADMIN_ACTION',
    'SECURITY_VIOLATION',
    'DATA_ACCESS',
    'PERMISSION_CHANGE',
  ],

  // مستويات السجلات
  logLevels: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4,
  },

  // إعدادات التخزين
  storage: {
    retention: 365 * 24 * 60 * 60 * 1000, // سنة واحدة
    compression: true,
    encryption: true,
  },
};

// إعدادات النسخ الاحتياطي الأمني
export const BACKUP_CONFIG = {
  // تشفير النسخ الاحتياطية
  encryption: {
    enabled: true,
    algorithm: 'aes-256-cbc',
    keyRotation: 30 * 24 * 60 * 60 * 1000, // 30 يوم
  },

  // جدولة النسخ الاحتياطية
  schedule: {
    daily: '02:00', // 2:00 صباحاً
    weekly: 'Sunday', // الأحد
    monthly: 1, // أول يوم في الشهر
  },

  // الاحتفاظ بالنسخ
  retention: {
    daily: 7, // 7 نسخ يومية
    weekly: 4, // 4 نسخ أسبوعية
    monthly: 12, // 12 نسخة شهرية
  },
};

// تصدير جميع الإعدادات
export const SECURITY_CONFIG = {
  encryption: ENCRYPTION_CONFIG,
  rateLimit: RATE_LIMIT_CONFIG,
  twoFactor: TWO_FACTOR_CONFIG,
  securityScan: SECURITY_SCAN_CONFIG,
  monitoring: MONITORING_CONFIG,
  ipBlocking: IP_BLOCKING_CONFIG,
  csrf: CSRF_CONFIG,
  password: PASSWORD_CONFIG,
  session: SESSION_CONFIG,
  audit: AUDIT_CONFIG,
  backup: BACKUP_CONFIG,
};

export default SECURITY_CONFIG;
