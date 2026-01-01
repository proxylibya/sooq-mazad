/**
 * مراقب المحتوى الوهمي - تنقية روابط الصور
 */

/**
 * تنقية رابط الصورة من أي محتوى ضار
 * @param url - رابط الصورة
 * @param context - سياق الاستخدام (اختياري): 'car' | 'auction' | 'user' | 'general'
 */
export function sanitizeImageUrl(url: string | null | undefined, context?: string): string {
    // تحديد الصورة الافتراضية حسب السياق
    const defaultImages: Record<string, string> = {
        car: '/images/cars/default-car.svg',
        auction: '/images/cars/default-car.svg',
        user: '/images/default-avatar.svg',
        general: '/images/placeholder-car.svg',
    };

    const defaultImage = context ? (defaultImages[context] || defaultImages.general) : defaultImages.general;

    if (!url) return defaultImage;

    // تنظيف الرابط
    const cleanUrl = url.trim();

    // إذا كان الرابط فارغاً بعد التنظيف
    if (!cleanUrl) return defaultImage;

    // إذا كان الرابط صحيحاً، أعده كما هو
    if (cleanUrl.startsWith('/') || cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        // استبعاد الصور الوهمية من placeholder.com و via.placeholder
        if (cleanUrl.includes('placeholder.com') || cleanUrl.includes('via.placeholder') || cleanUrl.includes('unsplash.com/random')) {
            return defaultImage;
        }
        return cleanUrl;
    }

    // إذا كان الرابط نسبي، أضف / في البداية
    if (cleanUrl.match(/^[\w\-\/]+\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        return '/' + cleanUrl;
    }

    return defaultImage;
}

/**
 * التحقق من صحة رابط الصورة
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
}

export default { sanitizeImageUrl, isValidImageUrl };
