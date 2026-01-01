/**
 * إعدادات Scaling المتقدمة - Advanced Scaling Configuration
 *
 * للتعامل مع حملات إعلانية ضخمة وملايين المستخدمين
 * Handling massive advertising campaigns and millions of users
 */

module.exports = {
  // إعدادات Load Balancing
  loadBalancer: {
    strategy: 'round-robin', // 'round-robin' | 'least-connections' | 'ip-hash'
    healthCheck: {
      enabled: true,
      interval: 30000, // 30 ثانية
      timeout: 5000,
      retries: 3,
    },
    sticky: {
      enabled: true, // جلسات ثابتة للمستخدمين
      cookieName: 'SOOQ_MAZAD_LB',
      ttl: 3600, // 1 ساعة
    },
  },

  // إعدادات Horizontal Scaling
  scaling: {
    minInstances: 2, // الحد الأدنى من الخوادم
    maxInstances: 20, // الحد الأقصى
    targetCPU: 70, // نسبة CPU المستهدفة (%)
    targetMemory: 80, // نسبة الذاكرة المستهدفة (%)
    scaleUpThreshold: 75, // متى نزيد الخوادم
    scaleDownThreshold: 30, // متى نقلل الخوادم
    cooldownPeriod: 300, // فترة الانتظار بين التوسعات (ثواني)
  },

  // إعدادات Connection Pooling المتقدمة
  database: {
    pool: {
      min: 10, // الحد الأدنى من الاتصالات
      max: 100, // الحد الأقصى (كان 20)
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      maxUses: 7500, // إعادة تدوير الاتصال بعد 7500 استخدام
      allowExitOnIdle: false,
    },
    // Read Replicas للقراءة
    readReplicas: [
      { host: process.env.DB_READ_REPLICA_1 || 'localhost', weight: 1 },
      { host: process.env.DB_READ_REPLICA_2 || 'localhost', weight: 1 },
    ],
    // Write Master للكتابة
    writeMaster: {
      host: process.env.DB_WRITE_MASTER || 'localhost',
    },
  },

  // إعدادات Rate Limiting الذكية
  rateLimiting: {
    global: {
      windowMs: 60 * 1000, // 1 دقيقة
      max: 1000, // 1000 طلب في الدقيقة (كان 100)
      message: 'عدد كبير من الطلبات، يرجى المحاولة لاحقاً',
    },
    api: {
      windowMs: 60 * 1000,
      max: 500, // 500 طلب API في الدقيقة
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      max: 10, // 10 محاولات تسجيل دخول
      skipSuccessfulRequests: true,
    },
    search: {
      windowMs: 60 * 1000,
      max: 200, // 200 بحث في الدقيقة
    },
    upload: {
      windowMs: 60 * 1000,
      max: 20, // 20 رفع ملف في الدقيقة
    },
  },

  // إعدادات CDN
  cdn: {
    enabled: true,
    provider: 'cloudflare', // 'cloudflare' | 'cloudfront' | 'fastly'
    zones: {
      static: process.env.CDN_STATIC_ZONE || 'static.sooq-mazad.com',
      media: process.env.CDN_MEDIA_ZONE || 'media.sooq-mazad.com',
      api: process.env.CDN_API_ZONE || 'api.sooq-mazad.com',
    },
    caching: {
      static: 86400, // 24 ساعة
      images: 604800, // 7 أيام
      api: 60, // 1 دقيقة
    },
  },

  // إعدادات Queue System
  queue: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_QUEUE_DB || '1'),
    },
    concurrency: {
      high: 50, // معالجة 50 مهمة متزامنة عالية الأولوية
      normal: 30, // 30 مهمة عادية
      low: 10, // 10 مهمة منخفضة الأولوية
    },
    retries: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  },

  // إعدادات Edge Caching
  edgeCache: {
    enabled: true,
    ttl: {
      homepage: 60, // 1 دقيقة
      listings: 300, // 5 دقائق
      static: 86400, // 24 ساعة
      api: 30, // 30 ثانية
    },
    regions: ['eu', 'us', 'asia'], // مناطق التوزيع
  },

  // إعدادات Monitoring
  monitoring: {
    enabled: true,
    metrics: {
      interval: 10000, // كل 10 ثواني
      retention: 86400, // الاحتفاظ بالبيانات لـ 24 ساعة
    },
    alerts: {
      cpu: 85, // تنبيه عند CPU > 85%
      memory: 90, // تنبيه عند Memory > 90%
      responseTime: 1000, // تنبيه عند Response > 1s
      errorRate: 5, // تنبيه عند Error Rate > 5%
    },
  },

  // إعدادات الأداء
  performance: {
    compression: {
      enabled: true,
      level: 6, // مستوى الضغط (1-9)
      threshold: 1024, // ضغط الملفات > 1KB
    },
    keepAlive: {
      enabled: true,
      timeout: 65000,
      maxHeadersCount: 100,
    },
    http2: {
      enabled: true,
      pushAssets: true, // HTTP/2 Server Push
    },
  },

  // إعدادات Security
  security: {
    ddosProtection: {
      enabled: true,
      maxRequestsPerIP: 100, // 100 طلب في الثانية للـ IP الواحد
      banDuration: 3600, // حظر لمدة ساعة
    },
    cors: {
      enabled: true,
      origins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    },
    helmet: {
      enabled: true,
      contentSecurityPolicy: true,
      xssFilter: true,
    },
  },
};
