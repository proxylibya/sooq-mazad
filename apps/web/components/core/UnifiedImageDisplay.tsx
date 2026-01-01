/**
 * مكون موحد لعرض الصور
 * يحل محل جميع مكونات عرض الصور المتناثرة في المشروع
 */

import { ChevronLeftIcon, ChevronRightIcon, PhotoIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useMemo, useState } from 'react';
import { logger } from '../../lib/core/logging/UnifiedLogger';

export interface ImageData {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  category?: string;
}

export interface UnifiedImageDisplayProps {
  // مصادر الصور المختلفة - يتعامل مع جميع التنسيقات
  images?: string | string[] | ImageData[] | any;
  image?: string;
  imageList?: string[];

  // إعدادات العرض
  className?: string;
  containerClassName?: string;
  imageClassName?: string;

  // إعدادات التنقل
  showNavigation?: boolean;
  showCounter?: boolean;
  enableSwipe?: boolean;

  // إعدادات التحسين
  lazy?: boolean;
  placeholder?: string;
  errorFallback?: string;

  // إعدادات الاستجابة
  sizes?: string;
  priority?: boolean;

  // أحداث
  onImageLoad?: (index: number, url: string) => void;
  onImageError?: (index: number, url: string, error: any) => void;
  onImageClick?: (index: number, url: string) => void;

  // إعدادات أخرى
  aspectRatio?: 'auto' | 'square' | '16:9' | '4:3' | '3:2';
  fit?: 'cover' | 'contain' | 'fill';
  quality?: number;
}

const UnifiedImageDisplay: React.FC<UnifiedImageDisplayProps> = ({
  images,
  image,
  imageList,
  className = '',
  containerClassName = '',
  imageClassName = '',
  showNavigation = true,
  showCounter = true,
  enableSwipe = true,
  lazy = true,
  placeholder,
  errorFallback = '/images/cars/default-car.svg',
  sizes,
  priority = false,
  onImageLoad,
  onImageError,
  onImageClick,
  aspectRatio = 'auto',
  fit = 'cover',
  quality = 80,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});

  // توحيد مصادر الصور المختلفة
  const normalizedImages = useMemo(() => {
    logger.debug('معالجة الصور في UnifiedImageDisplay', {
      images: typeof images,
      image: !!image,
      imageList: !!imageList,
    });

    const processImages = (): ImageData[] => {
      // أولوية 1: imageList
      if (imageList && Array.isArray(imageList) && imageList.length > 0) {
        return imageList
          .filter((img) => img && typeof img === 'string' && img.trim())
          .map((url) => ({ url: url.trim() }));
      }

      // أولوية 2: images array
      if (images && Array.isArray(images) && images.length > 0) {
        return images
          .map((img, index) => {
            // إذا كان ImageData object
            if (img && typeof img === 'object' && img.url) {
              return {
                url: img.url,
                alt: img.alt || `صورة ${index + 1}`,
                isPrimary: img.isPrimary || false,
                category: img.category,
              };
            }
            // إذا كان string
            if (typeof img === 'string' && img.trim()) {
              return { url: img.trim() };
            }
            return null;
          })
          .filter(Boolean) as ImageData[];
      }

      // أولوية 3: images string (JSON أو CSV)
      if (images && typeof images === 'string' && images.trim()) {
        try {
          // محاولة تحليل JSON
          const parsedImages = JSON.parse(images);
          if (Array.isArray(parsedImages)) {
            return parsedImages
              .filter((img) => img && typeof img === 'string' && img.trim())
              .map((url) => ({ url: url.trim() }));
          }
        } catch {
          // إذا فشل JSON، جرب CSV
          return images
            .split(',')
            .map((img) => img.trim())
            .filter((img) => img)
            .map((url) => ({ url }));
        }
      }

      // أولوية 4: image مفردة
      if (image && typeof image === 'string' && image.trim()) {
        return [{ url: image.trim() }];
      }

      // fallback: صورة افتراضية
      return [{ url: errorFallback }];
    };

    const processed = processImages();
    logger.debug(`تم معالجة ${processed.length} صورة`, { count: processed.length });
    return processed;
  }, [images, image, imageList, errorFallback]);

  // التنقل للصورة التالية
  const nextImage = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      setCurrentIndex((prev) => (prev === normalizedImages.length - 1 ? 0 : prev + 1));
    },
    [normalizedImages.length],
  );

  // التنقل للصورة السابقة
  const prevImage = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      setCurrentIndex((prev) => (prev === 0 ? normalizedImages.length - 1 : prev - 1));
    },
    [normalizedImages.length],
  );

  // معالجة تحميل الصورة
  const handleImageLoad = useCallback(
    (index: number, url: string) => {
      setLoadingStates((prev) => ({ ...prev, [index]: false }));
      onImageLoad?.(index, url);
      logger.debug(`تم تحميل الصورة ${index}: ${url}`);
    },
    [onImageLoad],
  );

  // معالجة خطأ الصورة
  const handleImageError = useCallback(
    (index: number, url: string, error: any) => {
      setErrorStates((prev) => ({ ...prev, [index]: true }));
      setLoadingStates((prev) => ({ ...prev, [index]: false }));
      onImageError?.(index, url, error);
      logger.warn(`فشل تحميل الصورة ${index}: ${url}`, error);
    },
    [onImageError],
  );

  // معالجة النقر على الصورة
  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      const currentImage = normalizedImages[currentIndex];
      if (currentImage && onImageClick) {
        onImageClick(currentIndex, currentImage.url);
      }
    },
    [currentIndex, normalizedImages, onImageClick],
  );

  // معالجة اللمس للجوال
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enableSwipe) return;
      const touch = e.targetTouches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    },
    [enableSwipe],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enableSwipe || !touchStart) return;
      const touch = e.targetTouches[0];
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
    },
    [enableSwipe, touchStart],
  );

  const handleTouchEnd = useCallback(() => {
    if (!enableSwipe || !touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = Math.abs(touchStart.y - touchEnd.y);
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isVerticalSwipe = distanceY > 50;

    // تجنب السحب العمودي
    if (isVerticalSwipe) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    if (isLeftSwipe && normalizedImages.length > 1) {
      nextImage();
    }
    if (isRightSwipe && normalizedImages.length > 1) {
      prevImage();
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [enableSwipe, touchStart, touchEnd, normalizedImages.length, nextImage, prevImage]);

  // حساب فئات CSS للحاوية
  const containerClasses = useMemo(() => {
    const baseClasses = 'relative overflow-hidden bg-gray-100';
    const aspectClasses = {
      auto: '',
      square: 'aspect-square',
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]',
      '3:2': 'aspect-[3/2]',
    };

    return `${baseClasses} ${aspectClasses[aspectRatio]} ${containerClassName}`.trim();
  }, [aspectRatio, containerClassName]);

  // حساب فئات CSS للصورة
  const getImageClasses = useMemo(() => {
    const baseClasses = 'w-full h-full transition-opacity duration-300';
    const fitClasses = {
      cover: 'object-cover',
      contain: 'object-contain',
      fill: 'object-fill',
    };

    return `${baseClasses} ${fitClasses[fit]} ${imageClassName}`.trim();
  }, [fit, imageClassName]);

  if (normalizedImages.length === 0) {
    return (
      <div className={`${containerClasses} ${className}`}>
        <div className="flex h-full items-center justify-center text-gray-400">
          <PhotoIcon className="h-12 w-12" />
          <span className="mr-2">لا توجد صورة</span>
        </div>
      </div>
    );
  }

  const currentImage = normalizedImages[currentIndex];
  const isLoading = loadingStates[currentIndex];
  const hasError = errorStates[currentIndex];

  return (
    <div
      className={`${containerClasses} ${className} group`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleImageClick}
    >
      {/* الصورة الرئيسية */}
      <img
        src={hasError ? errorFallback : currentImage.url}
        alt={currentImage.alt || `صورة ${currentIndex + 1}`}
        className={`${getImageClasses} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        loading={lazy ? 'lazy' : 'eager'}
        sizes={sizes}
        onLoad={() => handleImageLoad(currentIndex, currentImage.url)}
        onError={(e) => handleImageError(currentIndex, currentImage.url, e)}
      />

      {/* مؤشر التحميل */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* أزرار التنقل */}
      {showNavigation && normalizedImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity duration-200 hover:bg-black/70 group-hover:opacity-100"
            aria-label="الصورة السابقة"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity duration-200 hover:bg-black/70 group-hover:opacity-100"
            aria-label="الصورة التالية"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </>
      )}

      {/* عداد الصور */}
      {showCounter && normalizedImages.length > 1 && (
        <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-sm text-white backdrop-blur-sm">
          <PhotoIcon className="ml-1 inline-block h-3 w-3" />
          {currentIndex + 1}/{normalizedImages.length}
        </div>
      )}

      {/* نقاط التنقل */}
      {normalizedImages.length > 1 && normalizedImages.length <= 5 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {normalizedImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`انتقل إلى الصورة ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UnifiedImageDisplay;
