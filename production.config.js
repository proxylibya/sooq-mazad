/**
 * 🚀 Production Configuration
 * إعدادات الإنتاج للموقع
 */

module.exports = {
    // إعدادات الخادم
    server: {
        port: process.env.PORT || 3021,
        host: process.env.HOST || '0.0.0.0',
        workers: process.env.WORKERS || 4,
    },
    
    // إعدادات قاعدة البيانات
    database: {
        connectionPoolSize: 20,
        connectionTimeout: 30000,
        queryTimeout: 10000,
        enableLogging: false,
    },
    
    // إعدادات Cache
    cache: {
        enabled: true,
        ttl: {
            default: 300,      // 5 دقائق
            auctions: 60,      // دقيقة واحدة
            users: 600,        // 10 دقائق
            static: 86400,     // يوم واحد
        },
        maxKeys: 50000,
    },
    
    // إعدادات الأمان
    security: {
        rateLimiting: {
            windowMs: 60000,   // دقيقة واحدة
            maxRequests: 100,  // طلب
            bidMaxRequests: 10,
        },
        cors: {
            enabled: true,
            origins: ['https://sooq-mazad.ly'],
        },
    },
    
    // إعدادات المزايدات
    auction: {
        minBidIncrement: 500,
        maxBidsPerMinute: 10,
        autoCancelAfterDays: 30,
        extensionOnLastMinuteBid: 60, // ثانية
    },
    
    // إعدادات الملفات
    uploads: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        compressionQuality: 80,
    },
    
    // إعدادات الإشعارات
    notifications: {
        sms: {
            enabled: true,
            provider: 'twilio',
        },
        push: {
            enabled: false,
        },
    },
    
    // مقاييس الأداء المستهدفة
    performance: {
        targetTTFB: 200,       // ms
        targetLCP: 2500,       // ms
        targetFID: 100,        // ms
        maxBundleSize: 250,    // KB
    },
};
