import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware لإعادة توجيه الصور المفقودة إلى صور بديلة
 */

// قائمة الصور المفقودة المعروفة وبدائلها
const MISSING_IMAGES_MAP: Record<string, string> = {
  // صور السيارات المفقودة
  '/images/cars/honda-accord-1.jpg': '/images/cars/default-car.svg',
  '/images/cars/kia-cerato-1.jpg': '/images/cars/default-car.svg',
  '/uploads/cars/honda-accord-2023-front.jpg': '/images/cars/default-car.svg',

  // صور الملفات الشخصية المؤقتة
  '/images/profiles/profile_temp_user_1753472292646.jpg': '/images/default-avatar.svg',
};

// أنماط الصور المؤقتة
const TEMP_IMAGE_PATTERNS = [
  /^\/images\/profiles\/profile_temp_user_\d+\.jpg$/,
  /^\/uploads\/cars\/.*$/,
  /^\/images\/cars\/.*\.(jpg|jpeg|png|webp)$/,
];

/**
 * التحقق من وجود الصورة وإعادة توجيهها إذا لزم الأمر
 */
export function handleImageRedirect(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  // التحقق من الصور المفقودة المعروفة
  if (MISSING_IMAGES_MAP[pathname]) {
    console.log(`🔄 إعادة توجيه صورة مفقودة: ${pathname} → ${MISSING_IMAGES_MAP[pathname]}`);
    return NextResponse.redirect(new URL(MISSING_IMAGES_MAP[pathname], request.url));
  }

  // التحقق من أنماط الصور المؤقتة
  for (const pattern of TEMP_IMAGE_PATTERNS) {
    if (pattern.test(pathname)) {
      // تحديد الصورة البديلة حسب النوع
      let fallbackImage = '/images/default-avatar.svg';

      if (pathname.includes('/cars/') || pathname.includes('/uploads/cars/')) {
        fallbackImage = '/images/cars/default-car.svg';
      } else if (pathname.includes('/profiles/')) {
        fallbackImage = '/images/default-avatar.svg';
      } else if (pathname.includes('/transport/')) {
        fallbackImage = '/images/transport/default-transport.svg';
      }

      console.log(`🔄 إعادة توجيه صورة مؤقتة: ${pathname} → ${fallbackImage}`);
      return NextResponse.redirect(new URL(fallbackImage, request.url));
    }
  }

  return null;
}

/**
 * إضافة صورة مفقودة جديدة إلى القائمة
 */
export function addMissingImageMapping(originalPath: string, fallbackPath: string): void {
  MISSING_IMAGES_MAP[originalPath] = fallbackPath;
  console.log(`📝 تم إضافة تعيين صورة جديد: ${originalPath} → ${fallbackPath}`);
}

/**
 * الحصول على الصورة البديلة المناسبة
 */
export function getFallbackImage(imagePath: string): string {
  // التحقق من التعيين المباشر
  if (MISSING_IMAGES_MAP[imagePath]) {
    return MISSING_IMAGES_MAP[imagePath];
  }

  // تحديد الصورة البديلة حسب النوع
  if (imagePath.includes('/cars/') || imagePath.includes('/uploads/cars/')) {
    return '/images/cars/default-car.svg';
  } else if (imagePath.includes('/profiles/')) {
    return '/images/default-avatar.svg';
  } else if (imagePath.includes('/transport/')) {
    return '/images/transport/default-transport.svg';
  } else if (imagePath.includes('/auctions/')) {
    return '/images/cars/default-car.svg';
  }

  // الصورة الافتراضية العامة
  return '/images/placeholder-car.svg';
}

/**
 * تسجيل الصور المفقودة للمراقبة
 */
export function logMissingImage(imagePath: string, referrer?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`🖼️ صورة مفقودة: ${imagePath}`, {
      referrer,
      fallback: getFallbackImage(imagePath),
      timestamp: new Date().toISOString(),
    });
  }
}
