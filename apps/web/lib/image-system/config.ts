/**
 * 🌍 إعدادات نظام الصور الموحد
 * 
 * جميع الإعدادات المتعلقة بالصور في مكان واحد
 */

// ============================================
// إعدادات الرفع
// ============================================

export const UPLOAD_CONFIG = {
    // الحجم الأقصى (10 ميجابايت)
    MAX_FILE_SIZE: 10 * 1024 * 1024,

    // الحجم الأدنى (1 كيلوبايت)
    MIN_FILE_SIZE: 1024,

    // الصيغ المسموحة
    ALLOWED_TYPES: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/avif',
    ],

    // امتدادات الملفات المسموحة
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],

    // رسائل الخطأ
    ERRORS: {
        FILE_TOO_LARGE: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت',
        FILE_TOO_SMALL: 'حجم الملف صغير جداً',
        INVALID_TYPE: 'صيغة الملف غير مدعومة',
        UPLOAD_FAILED: 'فشل في رفع الصورة',
        NO_FILE: 'يرجى اختيار ملف',
        AUTH_REQUIRED: 'مطلوب تسجيل الدخول لرفع الملفات',
        SESSION_EXPIRED: 'انتهت صلاحية الجلسة',
    },

    // المهلة الزمنية (30 ثانية)
    TIMEOUT: 30000,

    // عدد محاولات إعادة الرفع
    MAX_RETRIES: 3,
} as const;

// ============================================
// إعدادات التحسين
// ============================================

export const OPTIMIZATION_CONFIG = {
    // جودة الضغط الافتراضية
    DEFAULT_QUALITY: 82,

    // جودة الصور المصغرة
    THUMBNAIL_QUALITY: 75,

    // الحد الأقصى للعرض
    MAX_WIDTH: 1920,

    // الحد الأقصى للارتفاع
    MAX_HEIGHT: 1440,

    // الصيغة الافتراضية للإخراج
    DEFAULT_FORMAT: 'webp' as const,

    // الأحجام المعيارية
    SIZES: {
        thumbnail: { width: 150, height: 150, suffix: '_thumb' },
        small: { width: 320, height: 240, suffix: '_sm' },
        medium: { width: 640, height: 480, suffix: '_md' },
        large: { width: 1024, height: 768, suffix: '_lg' },
        xlarge: { width: 1920, height: 1440, suffix: '_xl' },
    },

    // إعدادات sharp
    SHARP: {
        jpeg: {
            quality: 82,
            progressive: true,
            mozjpeg: true,
        },
        webp: {
            quality: 82,
            effort: 4,
            smartSubsample: true,
        },
        avif: {
            quality: 75,
            effort: 4,
            chromaSubsampling: '4:2:0',
        },
        png: {
            quality: 82,
            progressive: true,
            compressionLevel: 9,
        },
    },
} as const;

// ============================================
// مسارات التخزين
// ============================================

export const STORAGE_PATHS = {
    // المجلد الرئيسي للرفع
    uploads: 'public/uploads',

    // مجلدات حسب الفئة
    cars: 'public/uploads/cars',
    profiles: 'public/uploads/profiles',
    transport: 'public/uploads/transport',
    messages: 'public/uploads/messages',
    showrooms: 'public/uploads/showrooms',
    auctions: 'public/uploads/auctions',

    // مجلدات الملفات المحسنة
    optimized: 'public/uploads/optimized',

    // الملفات المؤقتة
    temp: 'uploads/temp',
} as const;

// ============================================
// إعدادات CDN
// ============================================

export const CDN_CONFIG = {
    // تفعيل CDN
    enabled: !!process.env.CDN_URL,

    // رابط CDN
    url: process.env.CDN_URL || '',

    // Cloudflare Images
    cloudflare: {
        enabled: !!process.env.CLOUDFLARE_IMAGES_URL,
        url: process.env.CLOUDFLARE_IMAGES_URL || '',
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
        apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
    },

    // AWS S3
    s3: {
        enabled: !!process.env.AWS_S3_BUCKET,
        bucket: process.env.AWS_S3_BUCKET || '',
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
} as const;

// ============================================
// إعدادات العرض
// ============================================

export const DISPLAY_CONFIG = {
    // الصورة الافتراضية
    FALLBACK_IMAGE: '/placeholder.svg',

    // صورة المستخدم الافتراضية
    FALLBACK_AVATAR: '/images/avatars/default.svg',

    // صورة السيارة الافتراضية
    FALLBACK_CAR: '/images/placeholder-car.jpg',

    // Lazy loading margin
    LAZY_MARGIN: '200px',

    // أحجام الشاشة للـ responsive
    SIZES: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',

    // جودة العرض الافتراضية
    DISPLAY_QUALITY: 85,
} as const;

// ============================================
// التصدير الموحد
// ============================================

export const IMAGE_CONFIG = {
    upload: UPLOAD_CONFIG,
    optimization: OPTIMIZATION_CONFIG,
    storage: STORAGE_PATHS,
    cdn: CDN_CONFIG,
    display: DISPLAY_CONFIG,
} as const;

export default IMAGE_CONFIG;
