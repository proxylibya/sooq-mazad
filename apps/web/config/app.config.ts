// @ts-nocheck
/**
 * ⚙️ تكوين التطبيق الموحد
 * Enterprise Application Configuration
 */

export const AppConfig = {
  // معلومات التطبيق
  app: {
    name: 'سوق مزاد',
    description: 'منصة المزادات والسوق الإلكتروني الرائدة في ليبيا',
    version: '2.0.0',
    environment: (process as any).env.NODE_ENV || 'development',
    url: (process as any).env.NEXT_PUBLIC_APP_URL || 'http://localhost:3021',
    apiUrl: (process as any).env.NEXT_PUBLIC_API_URL || '/api'
  },

  // إعدادات المصادقة
  auth: {
    jwtSecret: (process as any).env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    sessionDuration: 24 * 60 * 60, // 24 ساعة بالثواني
    rememberMeDuration: 30 * 24 * 60 * 60, // 30 يوم
    refreshTokenDuration: 90 * 24 * 60 * 60, // 90 يوم
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60 // 30 دقيقة
  },

  // قاعدة البيانات
  database: {
    url: (process as any).env.DATABASE_URL,
    maxConnections: parseInt((process as any).env.DB_MAX_CONNECTIONS || '10'),
    connectionTimeout: parseInt((process as any).env.DB_TIMEOUT || '5000'),
    logging: (process as any).env.DB_LOGGING === 'true'
  },

  // Redis/KeyDB
  cache: {
    enabled: (process as any).env.CACHE_ENABLED !== 'false',
    url: (process as any).env.REDIS_URL || (process as any).env.KEYDB_URL,
    ttl: parseInt((process as any).env.CACHE_TTL || '3600'),
    maxKeys: parseInt((process as any).env.CACHE_MAX_KEYS || '1000')
  },

  // التخزين والملفات
  storage: {
    provider: (process as any).env.STORAGE_PROVIDER || 'local',
    localPath: './public/uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    imageQuality: 85,
    thumbnailSize: { width: 300, height: 300 }
  },

  // البريد الإلكتروني
  email: {
    enabled: (process as any).env.EMAIL_ENABLED === 'true',
    provider: (process as any).env.EMAIL_PROVIDER || 'smtp',
    from: (process as any).env.EMAIL_FROM || 'noreply@sooqmazad.ly',
    smtp: {
      host: (process as any).env.SMTP_HOST,
      port: parseInt((process as any).env.SMTP_PORT || '587'),
      secure: (process as any).env.SMTP_SECURE === 'true',
      user: (process as any).env.SMTP_USER,
      password: (process as any).env.SMTP_PASSWORD
    }
  },

  // SMS
  sms: {
    enabled: (process as any).env.SMS_ENABLED === 'true',
    provider: (process as any).env.SMS_PROVIDER,
    apiKey: (process as any).env.SMS_API_KEY,
    senderId: (process as any).env.SMS_SENDER_ID || 'SooqMazad'
  },

  // الدفع
  payment: {
    enabled: (process as any).env.PAYMENT_ENABLED === 'true',
    providers: {
      stripe: {
        enabled: (process as any).env.STRIPE_ENABLED === 'true',
        publicKey: (process as any).env.STRIPE_PUBLIC_KEY,
        secretKey: (process as any).env.STRIPE_SECRET_KEY,
        webhookSecret: (process as any).env.STRIPE_WEBHOOK_SECRET
      },
      paypal: {
        enabled: (process as any).env.PAYPAL_ENABLED === 'true',
        clientId: (process as any).env.PAYPAL_CLIENT_ID,
        clientSecret: (process as any).env.PAYPAL_CLIENT_SECRET,
        sandbox: (process as any).env.PAYPAL_SANDBOX === 'true'
      }
    },
    currency: 'LYD',
    taxRate: 0.05 // 5%
  },

  // الأمان
  security: {
    cors: {
      enabled: (process as any).env.CORS_ENABLED !== 'false',
      origins: (process as any).env.CORS_ORIGINS?.split(',') || ['http://localhost:3021'],
      credentials: true
    },
    rateLimit: {
      enabled: (process as any).env.RATE_LIMIT_ENABLED !== 'false',
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      maxRequests: 100
    },
    captcha: {
      enabled: (process as any).env.CAPTCHA_ENABLED === 'true',
      siteKey: (process as any).env.RECAPTCHA_SITE_KEY,
      secretKey: (process as any).env.RECAPTCHA_SECRET_KEY
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      key: (process as any).env.ENCRYPTION_KEY || 'default-encryption-key-change-this'
    }
  },

  // الميزات
  features: {
    registration: (process as any).env.FEATURE_REGISTRATION !== 'false',
    auctions: (process as any).env.FEATURE_AUCTIONS !== 'false',
    marketplace: (process as any).env.FEATURE_MARKETPLACE !== 'false',
    transport: (process as any).env.FEATURE_TRANSPORT !== 'false',
    showrooms: (process as any).env.FEATURE_SHOWROOMS !== 'false',
    messaging: (process as any).env.FEATURE_MESSAGING !== 'false',
    notifications: (process as any).env.FEATURE_NOTIFICATIONS !== 'false',
    wallet: (process as any).env.FEATURE_WALLET !== 'false',
    reviews: (process as any).env.FEATURE_REVIEWS !== 'false',
    maintenance: (process as any).env.MAINTENANCE_MODE === 'true'
  },

  // اللغة والإقليم
  localization: {
    defaultLanguage: 'ar',
    supportedLanguages: ['ar', 'en'],
    defaultCountry: 'LY',
    timezone: 'Africa/Tripoli',
    dateFormat: 'DD/MM/YYYY',
    currency: 'LYD',
    phonePrefix: '+218'
  },

  // التحليلات
  analytics: {
    googleAnalytics: {
      enabled: (process as any).env.GA_ENABLED === 'true',
      trackingId: (process as any).env.GA_TRACKING_ID
    },
    mixpanel: {
      enabled: (process as any).env.MIXPANEL_ENABLED === 'true',
      token: (process as any).env.MIXPANEL_TOKEN
    },
    sentry: {
      enabled: (process as any).env.SENTRY_ENABLED === 'true',
      dsn: (process as any).env.SENTRY_DSN,
      environment: (process as any).env.NODE_ENV
    }
  },

  // SEO
  seo: {
    defaultTitle: 'سوق مزاد - منصة المزادات والتسوق الإلكتروني في ليبيا',
    titleTemplate: '%s | سوق مزاد',
    defaultDescription: 'اكتشف أفضل الصفقات في المزادات والسوق الإلكتروني. سيارات، عقارات، إلكترونيات وأكثر.',
    defaultImage: '/images/og-image.jpg',
    siteUrl: (process as any).env.NEXT_PUBLIC_APP_URL || 'http://localhost:3021',
    twitterHandle: '@sooqmazad'
  },

  // التطوير
  development: {
    debug: (process as any).env.DEBUG === 'true',
    logLevel: (process as any).env.LOG_LEVEL || 'info',
    showErrors: (process as any).env.NODE_ENV === 'development',
    mockData: (process as any).env.USE_MOCK_DATA === 'true',
    apiDelay: parseInt((process as any).env.API_DELAY || '0')
  }
};

// دالة للحصول على قيمة متداخلة
export function getConfig(path: string, defaultValue?: any): any {
  const keys = path.split('.');
  let value: any = AppConfig;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      return defaultValue;
    }
  }

  return value;
}

// دالة للتحقق من تفعيل ميزة
export function isFeatureEnabled(feature: keyof typeof AppConfig.features): boolean {
  return AppConfig.features[feature] === true;
}

// دالة للحصول على URL كامل
export function getFullUrl(path: string): string {
  const baseUrl = AppConfig.app.url.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// تصدير افتراضي
export default AppConfig;
