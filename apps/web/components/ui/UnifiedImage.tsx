/**
 * 🌍 مكون الصورة الموحد العالمي
 *
 * مكون واحد لجميع حالات عرض الصور
 * يدعم: Lazy loading, WebP/AVIF, Placeholder, Responsive
 *
 * @component UnifiedImage
 */

import Image from 'next/image';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

// ============================================
// الأنواع
// ============================================

export interface UnifiedImageProps {
  /** رابط الصورة */
  src: string;
  /** النص البديل */
  alt: string;
  /** العرض */
  width?: number;
  /** الارتفاع */
  height?: number;
  /** classes CSS */
  className?: string;
  /** تحميل فوري */
  priority?: boolean;
  /** جودة الضغط (1-100) */
  quality?: number;
  /** أحجام الشاشة للـ responsive */
  sizes?: string;
  /** placeholder */
  placeholder?: 'blur' | 'empty' | 'shimmer';
  /** بيانات blur */
  blurDataURL?: string;
  /** طريقة الملاءمة */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** موضع الصورة */
  objectPosition?: string;
  /** صورة بديلة عند الخطأ */
  fallbackSrc?: string;
  /** تحميل كسول متقدم */
  lazyLoad?: boolean;
  /** مسافة التحميل المسبق */
  lazyMargin?: string;
  /** عند اكتمال التحميل */
  onLoad?: () => void;
  /** عند حدوث خطأ */
  onError?: () => void;
  /** إظهار زر التكبير */
  showZoom?: boolean;
  /** عند الضغط */
  onClick?: () => void;
  /** نمط مخصص */
  style?: React.CSSProperties;
  /** تأثير الحركة */
  animate?: boolean;
}

// ============================================
// الثوابت
// ============================================

const DEFAULT_FALLBACK = '/placeholder.svg';
const CAR_PLACEHOLDER = '/images/placeholder-car.jpg';
const TRANSPORT_PLACEHOLDER = '/images/transport/placeholder.svg';

// مسارات الصور التي قد تكون مفقودة (رفعها المستخدمون)
const USER_UPLOAD_PATHS = [
  '/images/cars/listings/',
  '/images/cars/auction-listings/',
  '/uploads/',
  '/images/transport/',
  '/images/profiles/',
  '/images/showrooms/',
  '/images/companies/',
];

const BLUR_PLACEHOLDER = `data:image/svg+xml;base64,${Buffer.from(
  `
  <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f3f4f6"/>
        <stop offset="100%" style="stop-color:#e5e7eb"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>
`,
).toString('base64')}`;

// ============================================
// المكون الرئيسي
// ============================================

export const UnifiedImage = memo(function UnifiedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'shimmer',
  blurDataURL,
  objectFit = 'cover',
  objectPosition = 'center',
  fallbackSrc = DEFAULT_FALLBACK,
  lazyLoad = true,
  lazyMargin = '200px',
  onLoad,
  onError,
  showZoom = false,
  onClick,
  style,
  animate = true,
}: UnifiedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazyLoad || priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // تحديث src عند التغيير
  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  // Intersection Observer للتحميل الكسول
  useEffect(() => {
    if (!lazyLoad || priority || isInView) return;

    const element = imgRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.01,
        rootMargin: lazyMargin,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [lazyLoad, priority, isInView, lazyMargin]);

  // تنظيف src
  const cleanSrc = useCallback(
    (url: string): string => {
      if (!url) return fallbackSrc;

      // إزالة query parameters للصور المحلية
      if (url.startsWith('/')) {
        return url.split('?')[0];
      }

      return url;
    },
    [fallbackSrc],
  );

  // تحديد الـ fallback المناسب حسب نوع الصورة
  const getSmartFallback = useCallback(
    (url: string): string => {
      if (!url) return fallbackSrc;

      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('/transport/') || lowerUrl.includes('transport_')) {
        return TRANSPORT_PLACEHOLDER;
      }
      if (
        lowerUrl.includes('/cars/') ||
        lowerUrl.includes('/listings/') ||
        lowerUrl.includes('listing_')
      ) {
        return CAR_PLACEHOLDER;
      }
      return fallbackSrc;
    },
    [fallbackSrc],
  );

  // التحقق مما إذا كان المسار يبدو غير صالح
  const isLikelyMissingImage = useCallback((url: string): boolean => {
    if (!url) return true;
    // الصور المؤقتة أو التي تحتوي على temp غالباً ما تكون مفقودة
    if (url.includes('temp_listing_') || url.includes('_temp_')) return true;
    return false;
  }, []);

  // معالجة اكتمال التحميل
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  // معالجة الخطأ
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);

    const smartFallback = getSmartFallback(imageSrc);
    if (imageSrc !== smartFallback && imageSrc !== fallbackSrc) {
      setImageSrc(smartFallback);
    }

    onError?.();
  }, [imageSrc, fallbackSrc, getSmartFallback, onError]);

  // الحصول على blur data URL
  const getBlurUrl = useCallback((): string => {
    if (blurDataURL) return blurDataURL;
    return BLUR_PLACEHOLDER;
  }, [blurDataURL]);

  // التحقق إذا كانت الصورة من مسار قد يكون مفقوداً
  const isUserUploadedImage = useCallback((url: string): boolean => {
    if (!url) return false;
    return USER_UPLOAD_PATHS.some((path) => url.startsWith(path));
  }, []);

  // تحديد إذا كانت الصورة خارجية
  const isExternal = imageSrc.startsWith('http') || imageSrc.startsWith('//');

  // تحديد إذا كانت الصورة من رفع المستخدمين (قد تكون مفقودة)
  const isUserUploaded = isUserUploadedImage(imageSrc);

  // Placeholder أثناء التحميل
  const renderPlaceholder = () => {
    if (!isLoading) return null;

    if (placeholder === 'shimmer') {
      return (
        <div
          className="animate-shimmer absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
          style={{ backgroundSize: '200% 100%' }}
        />
      );
    }

    if (placeholder === 'blur' && blurDataURL) {
      return (
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center blur-xl"
          style={{ backgroundImage: `url(${blurDataURL})` }}
        />
      );
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </div>
    );
  };

  // عرض حالة الخطأ
  const renderError = () => {
    if (!hasError || imageSrc === fallbackSrc) return null;

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
        <svg className="mb-2 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm">فشل تحميل الصورة</span>
      </div>
    );
  };

  // Placeholder قبل الوصول للـ viewport
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`relative overflow-hidden bg-gray-200 ${className}`}
        style={{ width, height, ...style }}
      >
        {placeholder === 'shimmer' && (
          <div
            className="animate-shimmer absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
            style={{ backgroundSize: '200% 100%' }}
          />
        )}
      </div>
    );
  }

  // الصور الخارجية أو الصور التي قد تكون مفقودة (تستخدم img عادي بدلاً من Next.js Image)
  if (isExternal || isUserUploaded) {
    return (
      <div
        ref={imgRef}
        className={`relative overflow-hidden ${className}`}
        style={{ width, height, ...style }}
        onClick={onClick}
      >
        {renderPlaceholder()}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`h-full w-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${animate ? 'transition-transform hover:scale-105' : ''} `}
          style={{ objectFit, objectPosition }}
          onLoad={handleLoad}
          onError={(e) => {
            // استخدام fallback مناسب عند فشل التحميل
            const target = e.target as HTMLImageElement;
            const appropriateFallback = getSmartFallback(imageSrc);
            if (target.src !== appropriateFallback && !target.src.includes('placeholder')) {
              target.src = appropriateFallback;
            }
            handleError();
          }}
        />

        {renderError()}

        {showZoom && !isLoading && !hasError && (
          <div className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </div>
        )}
      </div>
    );
  }

  // الصور المحلية
  // استخدام img عادية للصور التي قد تكون مفقودة لتجنب أخطاء 400 من Next.js Image Optimizer
  const shouldUseNativeImg = isLikelyMissingImage(imageSrc) || hasError;

  return (
    <div
      ref={imgRef}
      className={`group relative overflow-hidden ${className}`}
      style={{ width, height, ...style }}
      onClick={onClick}
    >
      {renderPlaceholder()}

      {shouldUseNativeImg ? (
        <img
          src={cleanSrc(imageSrc)}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`h-full w-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${animate ? 'transition-transform group-hover:scale-105' : ''}`}
          style={{ objectFit, objectPosition }}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <Image
          src={cleanSrc(imageSrc)}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          priority={priority}
          sizes={sizes}
          placeholder={placeholder === 'blur' ? 'blur' : 'empty'}
          blurDataURL={placeholder === 'blur' ? getBlurUrl() : undefined}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${animate ? 'transition-transform group-hover:scale-105' : ''} `}
          style={{ objectFit, objectPosition }}
          onLoad={handleLoad}
          onError={handleError}
          unoptimized={imageSrc.includes('/uploads/')}
        />
      )}

      {renderError()}

      {showZoom && !isLoading && !hasError && (
        <div className="absolute right-2 top-2 cursor-pointer rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </div>
      )}
    </div>
  );
});

// ============================================
// مكونات مساعدة
// ============================================

/**
 * معرض صور موحد
 */
export interface UnifiedGalleryProps {
  images: Array<{ src: string; alt?: string }>;
  columns?: 2 | 3 | 4;
  gap?: 2 | 4 | 6;
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto';
  onImageClick?: (index: number) => void;
  className?: string;
}

export const UnifiedGallery = memo(function UnifiedGallery({
  images,
  columns = 3,
  gap = 4,
  aspectRatio = '4/3',
  onImageClick,
  className = '',
}: UnifiedGalleryProps) {
  const aspectClasses = {
    square: 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    auto: '',
  };

  return (
    <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-${gap} ${className}`}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-lg ${aspectClasses[aspectRatio]}`}
          onClick={() => onImageClick?.(index)}
        >
          <UnifiedImage
            src={image.src}
            alt={image.alt || `صورة ${index + 1}`}
            className="h-full w-full cursor-pointer"
            showZoom={!!onImageClick}
          />
        </div>
      ))}
    </div>
  );
});

/**
 * صورة خلفية موحدة
 */
export interface UnifiedBackgroundProps {
  src: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  priority?: boolean;
}

export const UnifiedBackground = memo(function UnifiedBackground({
  src,
  alt = '',
  children,
  className = '',
  overlay = false,
  overlayOpacity = 0.5,
  priority = false,
}: UnifiedBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <UnifiedImage
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full"
        objectFit="cover"
        priority={priority}
      />

      {overlay && <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />}

      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
});

/**
 * صورة دائرية (للملفات الشخصية)
 */
export interface UnifiedAvatarProps {
  src: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const UnifiedAvatar = memo(function UnifiedAvatar({
  src,
  alt = 'صورة المستخدم',
  size = 'md',
  className = '',
  onClick,
}: UnifiedAvatarProps) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`overflow-hidden rounded-full ${sizes[size]} ${className}`} onClick={onClick}>
      <UnifiedImage
        src={src}
        alt={alt}
        className="h-full w-full"
        objectFit="cover"
        fallbackSrc="/images/avatars/default.svg"
        animate={false}
      />
    </div>
  );
});

// ============================================
// أنماط CSS المضمنة
// ============================================

const styles = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite linear;
}
`;

// إضافة الأنماط للصفحة
if (typeof document !== 'undefined') {
  const styleId = 'unified-image-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}

// ============================================
// التصدير
// ============================================

export default UnifiedImage;
