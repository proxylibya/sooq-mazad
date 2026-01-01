/**
 * مساعدات معالجة الصور الموحدة
 * حل نهائي لمشكلة عدم ظهور الصور في البطاقات والإعلانات
 */
import { sanitizeImageUrl } from './fakeContentMonitor';

// Logger ـ Fallback - يعمل في المتصفح والسيرفر
const safeLogger = {
  debug: (msg: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(msg, data);
    }
  },
  error: (msg: string, error?: any) => {
    console.error(msg, error);
  }
};

// صورة افتراضية عامة يمكن استخدامها عبر الملف
const DEFAULT_CAR_IMAGE = '/images/cars/default-car.svg';

export interface ProcessedImageData {
  urls: string[];
  primaryUrl: string;
  thumbnailUrl?: string;
  totalCount: number;
  hasImages: boolean;
}

/**
 * معالجة موحدة لجميع أنواع بيانات الصور
 * يتعامل مع: string, string[], Object[], mixed data
 */
export function normalizeCarImages(imageData: any): ProcessedImageData {
  safeLogger.debug('معالجة بيانات الصور', {
    type: typeof imageData,
    isArray: Array.isArray(imageData),
    length: imageData?.length,
  });

  const defaultImage = '/images/cars/default-car.svg';
  const result: ProcessedImageData = {
    urls: [],
    primaryUrl: defaultImage,
    totalCount: 0,
    hasImages: false,
  };

  try {
    const processedUrls = extractImageUrls(imageData);
    
    if (processedUrls.length > 0) {
      // تعقيم الروابط لمنع صور وهمية (unsplash/placeholder) مع تحذير في التطوير
      const sanitizedUrls: string[] = processedUrls
        .map((u: string) => sanitizeImageUrl(u, 'car'))
        .filter(Boolean);

      result.urls = sanitizedUrls.length > 0 ? sanitizedUrls : [defaultImage];
      result.primaryUrl = result.urls[0];
      result.totalCount = result.urls.length;
      result.hasImages = result.urls[0] !== defaultImage;
      
      // إنشاء thumbnail URL إذا أمكن
      if (result.urls[0] && !result.urls[0].includes('default-car')) {
        result.thumbnailUrl = generateThumbnailUrl(result.urls[0]);
      }
      
      safeLogger.debug(`تم معالجة ${processedUrls.length} صورة بنجاح`);
    } else {
      safeLogger.debug('لا توجد صور صالحة، استخدام الصورة الافتراضية');
    }

    return result;

  } catch (error) {
    safeLogger.error('خطأ في معالجة الصور', error);
    return result; // إرجاع النتيجة الافتراضية
  }
}

/**
 * استخراج URLs من مختلف أنواع البيانات
 */
function extractImageUrls(data: any): string[] {
  const urls: string[] = [];

  // حالة null أو undefined
  if (!data) {
    return urls;
  }

  // حالة string فارغ
  if (typeof data === 'string' && !data.trim()) {
    return urls;
  }

  // حالة array فارغ
  if (Array.isArray(data) && data.length === 0) {
    return urls;
  }

  // معالجة الأنواع المختلفة
  if (typeof data === 'string') {
    urls.push(...processStringImages(data));
  } else if (Array.isArray(data)) {
    urls.push(...processArrayImages(data));
  } else if (typeof data === 'object') {
    urls.push(...processObjectImages(data));
  }

  // تنظيف وتصفية URLs
  return urls
    .map(url => cleanImageUrl(url))
    .filter(url => isValidImageUrl(url))
    .slice(0, 20); // حد أقصى 20 صورة
}

/**
 * معالجة الصور من نص
 */
function processStringImages(data: string): string[] {
  const urls: string[] = [];
  
  try {
    // محاولة تحليل JSON أولاً
    const jsonData = JSON.parse(data);
    
    if (Array.isArray(jsonData)) {
      urls.push(...processArrayImages(jsonData));
    } else if (typeof jsonData === 'object') {
      urls.push(...processObjectImages(jsonData));
    } else if (typeof jsonData === 'string') {
      urls.push(jsonData);
    }
  } catch {
    // ليس JSON، جرب فصل بالفاصلة
    if (data.includes(',')) {
      const csvUrls = data.split(',').map(url => url.trim());
      urls.push(...csvUrls);
    } else {
      // URL واحد
      urls.push(data);
    }
  }

  return urls;
}

/**
 * معالجة الصور من مصفوفة
 */
function processArrayImages(data: any[]): string[] {
  const urls: string[] = [];

  for (const item of data) {
    if (typeof item === 'string') {
      urls.push(item);
    } else if (item && typeof item === 'object') {
      // object مع خاصية url أو fileUrl
      if (item.url) {
        urls.push(item.url);
      } else if (item.fileUrl) {
        urls.push(item.fileUrl);
      } else if (item.src) {
        urls.push(item.src);
      } else if (item.path) {
        urls.push(item.path);
      }
    }
  }

  return urls;
}

/**
 * معالجة الصور من كائن
 */
function processObjectImages(data: any): string[] {
  const urls: string[] = [];

  // فحص الخصائص الشائعة
  const imageProperties = [
    'url', 'fileUrl', 'src', 'path', 'image', 
    'imageUrl', 'photoUrl', 'picture', 'photo'
  ];

  for (const prop of imageProperties) {
    if (data[prop]) {
      if (typeof data[prop] === 'string') {
        urls.push(data[prop]);
      } else if (Array.isArray(data[prop])) {
        urls.push(...processArrayImages(data[prop]));
      }
    }
  }

  // فحص إذا كان الكائن يحتوي على مصفوفة صور
  const arrayProperties = ['images', 'photos', 'pictures', 'files'];
  for (const prop of arrayProperties) {
    if (Array.isArray(data[prop])) {
      urls.push(...processArrayImages(data[prop]));
    }
  }

  return urls;
}

/**
 * تنظيف URL الصورة
 */
function cleanImageUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  let cleaned = url.trim();
  
  // إزالة علامات اقتباس وأقواس إضافية من البداية والنهاية (" ' [ ] ( ) { })
  // ملاحظة: استخدام نمط شامل مع g لإزالة أي محارف غلاف زائدة على الطرفين
  cleaned = cleaned.replace(/^[\s'"\[\](){}]+|[\s'"\[\](){}]+$/g, '');

  // إزالة أي أقواس مربعة متبقية كحالة احتياطية (عند عناصر أول/آخر مصفوفة JSON غير المُحللة)
  cleaned = cleaned.replace(/^\[+/, '').replace(/\]+$/, '');

  // إزالة مسافات داخلية زائدة إن وُوجدت
  cleaned = cleaned.replace(/\s+/g, '');

  // إزالة أي ترميز اقتباس متبقّي (%22) وأقواس مربعة
  cleaned = cleaned.replace(/%22/gi, '').replace(/[\[\]]/g, '');

  // إصلاح المسارات النسبية
  if (cleaned.startsWith('./')) {
    cleaned = cleaned.substring(2);
  }
  
  if (cleaned.startsWith('/') || cleaned.startsWith('http')) {
    return cleaned;
  }
  
  // إضافة slash إذا لم يكن موجود للمسارات المحلية
  if (!cleaned.startsWith('/') && !cleaned.startsWith('http')) {
    cleaned = '/' + cleaned;
  }

  return cleaned;
}

/**
 * التحقق من صحة URL الصورة
 */
function isValidImageUrl(url: string): boolean {
  if (!url || url.length < 3) {
    return false;
  }

  // فحص الامتدادات المدعومة
  const validExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
  const validPaths = /\/(images|uploads|assets|media|photos|pictures)\//i;
  
  // قبول URLs مع امتدادات صحيحة أو مسارات صور معروفة
  return validExtensions.test(url) || 
         validPaths.test(url) || 
         url.includes('default-car') ||
         url.startsWith('/api/') ||
         url.startsWith('http') ||
         url.includes('placeholder') ||
         url.includes('via.placeholder');
}

/**
 * إنشاء URL للصورة المصغرة
 */
function generateThumbnailUrl(originalUrl: string): string {
  try {
    // إذا كان URL يحتوي على معاملات الحجم، استخدمها
    if (originalUrl.includes('?')) {
      return originalUrl + '&w=300&h=200&fit=cover';
    } else {
      return originalUrl + '?w=300&h=200&fit=cover';
    }
  } catch {
    return originalUrl;
  }
}

/**
 * تحسين الصورة للعرض السريع
 */
export function optimizeImageUrl(
  url: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill';
  } = {}
): string {
  if (!url || url.includes('default-car')) {
    return url;
  }

  const {
    width = 400,
    height = 300,
    quality = 80,
    format = 'webp',
    fit = 'cover'
  } = options;

  try {
    const separator = url.includes('?') ? '&' : '?';
    const params = new URLSearchParams({
      w: width.toString(),
      h: height.toString(),
      q: quality.toString(),
      f: format,
      fit: fit,
    });

    return `${url}${separator}${params.toString()}`;
  } catch {
    return url;
  }
}

/**
 * إنشاء srcSet للصور المتجاوبة
 */
export function generateSrcSet(baseUrl: string): string {
  if (!baseUrl || baseUrl.includes('default-car')) {
    return baseUrl;
  }

  const sizes = [
    { width: 300, suffix: ' 300w' },
    { width: 600, suffix: ' 600w' },
    { width: 900, suffix: ' 900w' },
    { width: 1200, suffix: ' 1200w' },
  ];

  return sizes
    .map(size => `${optimizeImageUrl(baseUrl, { width: size.width })}${size.suffix}`)
    .join(', ');
}

/**
 * معالجة خاصة لصور السيارات من قاعدة البيانات
 */
export function processCarImagesFromDB(car: any): ProcessedImageData {
  // أولوية للصور المرفوعة الجديدة
  if (car.carImages && Array.isArray(car.carImages) && car.carImages.length > 0) {
    const sortedImages = car.carImages
      .sort((a: any, b: any) => {
        // الصور الأساسية أولاً
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        
        // ثم بتاريخ الإنشاء
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      })
      .map((img: any) => img.fileUrl)
      .filter(Boolean);

    if (sortedImages.length > 0) {
      const sanitized = sortedImages
        .map((u: string) => sanitizeImageUrl(u, 'car'))
        .filter(Boolean);
      const urls = sanitized.length > 0 ? sanitized : [DEFAULT_CAR_IMAGE];
      return {
        urls,
        primaryUrl: urls[0],
        thumbnailUrl: urls[0] && !urls[0].includes('default-car') ? generateThumbnailUrl(urls[0]) : undefined,
        totalCount: urls.length,
        hasImages: urls[0] !== DEFAULT_CAR_IMAGE,
      };
    }
  }

  // ثم الصور القديمة
  if (car.images) {
    return normalizeCarImages(car.images);
  }

  // أخيراً الصورة الافتراضية
  return normalizeCarImages(null);
}

/**
 * معالجة صور البطاقات مع تحسينات الأداء
 */
export function processCardImages(car: {
  images?: string | string[];
  carImages?: Array<{ fileUrl: string; isPrimary?: boolean }>;
  id: string;
}, context: 'auction' | 'marketplace' | 'favorite' = 'marketplace'
): ProcessedImageData {
  const processed = processCarImagesFromDB(car);
  
  // تحسين للبطاقات
  if (processed.hasImages) {
    const cardSizes = {
      auction: { width: 400, height: 300 },
      marketplace: { width: 350, height: 250 },
      favorite: { width: 250, height: 180 },
    };
    
    const size = cardSizes[context];
    processed.primaryUrl = optimizeImageUrl(processed.primaryUrl, size);
    
    // تحسين باقي الصور للمعاينة السريعة
    processed.urls = processed.urls.map(url => 
      optimizeImageUrl(url, { width: 150, height: 100 })
    );
  }

  return processed;
}

/**
 * دالة مساعدة للحصول على صورة واحدة سريعة
 */
export function getQuickImageUrl(data: any, fallback = '/images/cars/default-car.svg'): string {
  const processed = normalizeCarImages(data);
  return processed.hasImages ? processed.primaryUrl : fallback;
}

/**
 * فحص إذا كانت الصورة محملة ومتاحة
 */
export async function checkImageAvailability(url: string): Promise<boolean> {
  try {
    if (!url || url.includes('default-car') || url.includes('placeholder')) {
      return true; // الصور الافتراضية دائماً متاحة
    }

    // في بيئة المتصفح
    if (typeof window !== 'undefined') {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
        
        // timeout بعد 3 ثواني
        setTimeout(() => resolve(false), 3000);
      });
    }

    // في بيئة Node.js (للـ SSR)
    return true; // نفترض أن الصور متاحة
    
  } catch {
    return false;
  }
}

export default {
  normalizeCarImages,
  optimizeImageUrl,
  generateSrcSet,
  processCarImagesFromDB,
  processCardImages,
  getQuickImageUrl,
  checkImageAvailability,
};
