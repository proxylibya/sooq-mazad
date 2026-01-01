/**
 * خدمة الصور الموحدة - الحل النهائي العالمي
 * =============================================
 * تستخدم هذه الخدمة في جميع أنحاء التطبيق لمعالجة الصور
 * 
 * الاستخدام:
 * import { resolveImages, getImageUrl, DEFAULT_IMAGES } from '@/lib/services/UnifiedImageService';
 * 
 * const images = resolveImages(data);
 * const primaryImage = getImageUrl(data);
 */

// الصور الافتراضية حسب النوع
export const DEFAULT_IMAGES = {
    car: '/images/cars/default-car.svg',
    auction: '/images/cars/default-car.svg',
    showroom: '/images/showrooms/default-showroom.svg',
    user: '/images/avatars/default-avatar.svg',
    transport: '/images/transport/default-truck.svg',
    general: '/placeholder.svg',
} as const;

export type ImageType = keyof typeof DEFAULT_IMAGES;

// واجهة بيانات الصور المعالجة
export interface ResolvedImageData {
    urls: string[];
    primaryUrl: string;
    thumbnailUrl: string;
    count: number;
    hasImages: boolean;
    source: 'carImages' | 'images' | 'imageList' | 'image' | 'default';
}

// واجهة الصور من قاعدة البيانات
export interface CarImageRecord {
    id?: string;
    fileUrl?: string;
    url?: string;
    imageUrl?: string;
    src?: string;
    path?: string;
    isPrimary?: boolean;
    createdAt?: string | Date;
}

// أنواع البيانات المدعومة
export type ImageInput =
    | string
    | string[]
    | CarImageRecord[]
    | { images?: any; carImages?: any; image?: any; imageList?: any; car?: any; }
    | null
    | undefined;

/**
 * تنظيف وتصحيح URL الصورة
 */
export function cleanImageUrl(url: string | null | undefined): string {
    if (!url || typeof url !== 'string') return '';

    let cleaned = url.trim();

    // توحيد مسارات Windows
    cleaned = cleaned.replace(/\\/g, '/');

    // إزالة الترميزات والأحرف الزائدة
    cleaned = cleaned
        .replace(/^[\s'"\[\](){}]+|[\s'"\[\](){}]+$/g, '')
        .replace(/%22/gi, '')
        .replace(/[\[\]]/g, '')
        .replace(/\s+/g, '');

    // إصلاح المسارات
    if (cleaned.startsWith('./')) {
        cleaned = cleaned.substring(2);
    }

    // إزالة بادئة public/ لأن الملفات تُخدم من جذر الموقع
    if (cleaned.startsWith('public/')) {
        cleaned = cleaned.substring('public'.length);
        if (cleaned.startsWith('/')) {
            // ok
        } else {
            cleaned = '/' + cleaned;
        }
    }

    // تحويل المسارات القديمة من admin-auctions إلى auctions
    if (cleaned.includes('/admin-auctions/')) {
        cleaned = cleaned.replace('/admin-auctions/', '/auctions/');
    }

    // التأكد من وجود / في البداية للمسارات المحلية
    if (cleaned && !cleaned.startsWith('/') && !cleaned.startsWith('http')) {
        cleaned = '/' + cleaned;
    }

    return cleaned;
}

/**
 * التحقق من صحة URL الصورة
 */
export function isValidImageUrl(url: string): boolean {
    if (!url || url.length < 3) return false;

    // استبعاد الصور الوهمية والمؤقتة
    const fakePatterns = [
        'unsplash.com',
        'placeholder.com',
        'via.placeholder',
        'picsum.photos',
        'lorempixel',
        'placehold.it',
        'dummyimage.com',
        '/uploads/temp/',  // مجلد الصور المؤقتة الحقيقي
    ];

    if (fakePatterns.some(pattern => url.toLowerCase().includes(pattern))) {
        return false;
    }

    // التحقق من الامتدادات أو المسارات المعروفة
    const validPatterns = [
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i,
        /\/(images|uploads|assets|media|photos|pictures)\//i,
        /^\/api\//,
        /^https?:\/\//,
    ];

    return validPatterns.some(pattern => pattern.test(url)) || url.includes('default-car');
}

/**
 * استخراج URL من كائن صورة
 */
function extractUrlFromObject(obj: CarImageRecord | any): string | null {
    if (!obj || typeof obj !== 'object') return null;

    // ترتيب الأولوية للحقول
    const urlFields = ['fileUrl', 'url', 'imageUrl', 'src', 'path', 'image'];

    for (const field of urlFields) {
        if (obj[field] && typeof obj[field] === 'string' && obj[field].trim()) {
            return obj[field].trim();
        }
    }

    return null;
}

/**
 * معالجة مصفوفة carImages من قاعدة البيانات
 */
function processCarImages(carImages: CarImageRecord[]): string[] {
    if (!Array.isArray(carImages) || carImages.length === 0) return [];

    // ترتيب حسب isPrimary أولاً
    const sorted = [...carImages].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
    });

    return sorted
        .map(img => extractUrlFromObject(img))
        .filter((url): url is string => url !== null)
        .map(url => cleanImageUrl(url))
        .filter(url => isValidImageUrl(url));
}

/**
 * معالجة حقل images (string أو array)
 */
function processImagesField(images: any): string[] {
    if (!images) return [];

    // إذا كانت مصفوفة
    if (Array.isArray(images)) {
        return images
            .map(img => {
                if (typeof img === 'string') return img;
                return extractUrlFromObject(img);
            })
            .filter((url): url is string => url !== null)
            .map(url => cleanImageUrl(url))
            .filter(url => isValidImageUrl(url));
    }

    // إذا كانت نص
    if (typeof images === 'string') {
        const trimmed = images.trim();
        if (!trimmed) return [];

        // محاولة تحليل JSON
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return processImagesField(parsed);
            }
            if (typeof parsed === 'string') {
                const cleaned = cleanImageUrl(parsed);
                return isValidImageUrl(cleaned) ? [cleaned] : [];
            }
        } catch {
            // ليس JSON، تحقق من الفواصل
            if (trimmed.includes(',')) {
                return trimmed.split(',')
                    .map(s => cleanImageUrl(s))
                    .filter(url => isValidImageUrl(url));
            }

            // صورة واحدة
            const cleaned = cleanImageUrl(trimmed);
            return isValidImageUrl(cleaned) ? [cleaned] : [];
        }
    }

    return [];
}

/**
 * الدالة الرئيسية لحل الصور من أي نوع بيانات
 */
export function resolveImages(
    data: ImageInput,
    type: ImageType = 'car'
): ResolvedImageData {
    const defaultImage = DEFAULT_IMAGES[type] || DEFAULT_IMAGES.general;

    const result: ResolvedImageData = {
        urls: [],
        primaryUrl: defaultImage,
        thumbnailUrl: defaultImage,
        count: 0,
        hasImages: false,
        source: 'default',
    };

    if (!data) return result;

    try {
        let urls: string[] = [];
        let source: ResolvedImageData['source'] = 'default';

        // 1. إذا كانت string مباشرة
        if (typeof data === 'string') {
            urls = processImagesField(data);
            source = 'image';
        }
        // 2. إذا كانت مصفوفة
        else if (Array.isArray(data)) {
            // تحقق إذا كانت مصفوفة carImages objects
            if (data.length > 0 && typeof data[0] === 'object' && ('fileUrl' in data[0] || 'url' in data[0])) {
                urls = processCarImages(data as CarImageRecord[]);
                source = 'carImages';
            } else {
                urls = processImagesField(data);
                source = 'images';
            }
        }
        // 3. إذا كانت كائن
        else if (typeof data === 'object') {
            const obj = data as any;

            // أولوية 1: carImages (الصور الجديدة من قاعدة البيانات)
            if (obj.carImages && Array.isArray(obj.carImages) && obj.carImages.length > 0) {
                urls = processCarImages(obj.carImages);
                source = 'carImages';
            }
            // أولوية 1.5: car.carImages
            else if (obj.car?.carImages && Array.isArray(obj.car.carImages) && obj.car.carImages.length > 0) {
                urls = processCarImages(obj.car.carImages);
                source = 'carImages';
            }
            // أولوية 2: imageList
            else if (obj.imageList && (Array.isArray(obj.imageList) || typeof obj.imageList === 'string')) {
                urls = processImagesField(obj.imageList);
                source = 'imageList';
            }
            // أولوية 3: images
            else if (obj.images) {
                urls = processImagesField(obj.images);
                source = 'images';
            }
            // أولوية 3.5: car.images
            else if (obj.car?.images) {
                urls = processImagesField(obj.car.images);
                source = 'images';
            }
            // أولوية 4: image (صورة واحدة)
            else if (obj.image && typeof obj.image === 'string') {
                const cleaned = cleanImageUrl(obj.image);
                if (isValidImageUrl(cleaned)) {
                    urls = [cleaned];
                    source = 'image';
                }
            }
        }

        // تطبيق النتائج
        if (urls.length > 0) {
            result.urls = urls;
            result.primaryUrl = urls[0];
            result.thumbnailUrl = urls[0];
            result.count = urls.length;
            result.hasImages = true;
            result.source = source;
        }

    } catch (error) {
        console.error('[UnifiedImageService] خطأ في معالجة الصور:', error);
    }

    return result;
}

/**
 * الحصول على URL الصورة الأساسية بسرعة
 */
export function getImageUrl(data: ImageInput, type: ImageType = 'car'): string {
    return resolveImages(data, type).primaryUrl;
}

/**
 * الحصول على قائمة الصور
 */
export function getImageList(data: ImageInput, type: ImageType = 'car'): string[] {
    return resolveImages(data, type).urls;
}

/**
 * التحقق من وجود صور حقيقية
 */
export function hasRealImages(data: ImageInput): boolean {
    return resolveImages(data).hasImages;
}

/**
 * إنشاء URL محسن للحجم المطلوب
 */
export function optimizeImageUrl(
    url: string,
    options: { width?: number; height?: number; quality?: number; } = {}
): string {
    if (!url || url.includes('default-') || url.includes('.svg')) {
        return url;
    }

    const { width = 400, height = 300, quality = 80 } = options;
    const separator = url.includes('?') ? '&' : '?';

    return `${url}${separator}w=${width}&h=${height}&q=${quality}`;
}

/**
 * معالجة صور البطاقات مع التحسينات
 */
export function processCardImages(
    data: ImageInput,
    context: 'auction' | 'marketplace' | 'showroom' | 'favorite' = 'marketplace'
): ResolvedImageData {
    const type: ImageType = context === 'showroom' ? 'showroom' : 'car';
    const resolved = resolveImages(data, type);

    // تحسين الصور للبطاقات
    if (resolved.hasImages) {
        const sizes = {
            auction: { width: 400, height: 300 },
            marketplace: { width: 350, height: 250 },
            showroom: { width: 400, height: 250 },
            favorite: { width: 250, height: 180 },
        };

        const size = sizes[context];
        resolved.primaryUrl = optimizeImageUrl(resolved.primaryUrl, size);
        resolved.thumbnailUrl = optimizeImageUrl(resolved.primaryUrl, { width: 150, height: 100 });
    }

    return resolved;
}

// تصدير افتراضي
export default {
    resolveImages,
    getImageUrl,
    getImageList,
    hasRealImages,
    optimizeImageUrl,
    processCardImages,
    cleanImageUrl,
    isValidImageUrl,
    DEFAULT_IMAGES,
};
