/**
 * 🚀 مكون معرض الصور المُحسَّن للأداء
 * نظام موحد وسريع للتنقل بين الصور
 */

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { useFavorites } from '../../hooks/useFavorites';

// ============================================
// 📌 Types & Interfaces
// ============================================

export interface GalleryImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  thumbnail?: string;
}

export type GalleryItemType = 'auction' | 'car' | 'marketplace' | 'showroom' | 'transport';

export interface OptimizedImageGalleryProps {
  /** مصفوفة الصور */
  images: GalleryImage[] | string[];
  /** عنوان المعرض */
  title?: string;
  /** فئات CSS إضافية */
  className?: string;
  /** إظهار أزرار التنقل دائماً */
  alwaysShowArrows?: boolean;
  /** إظهار الصور المصغرة */
  showThumbnails?: boolean;
  /** إظهار العداد */
  showCounter?: boolean;
  /** إظهار أزرار الإجراءات (مفضلة، مشاركة) */
  showActions?: boolean;
  /** تفعيل Lightbox */
  enableLightbox?: boolean;
  /** الفهرس الابتدائي */
  initialIndex?: number;
  /** callback عند تغيير الصورة */
  onImageChange?: (index: number) => void;
  /** callback للمفضلة (deprecated - استخدم itemId و itemType) */
  onFavoriteToggle?: (isFavorite: boolean) => void;
  /** ارتفاع الصورة الرئيسية */
  height?: string;
  /** معرف العنصر للمفضلة */
  itemId?: string;
  /** نوع العنصر للمفضلة */
  itemType?: GalleryItemType;
  /** دالة تُستدعى عند طلب تسجيل الدخول */
  onRequireLogin?: () => void;
  /** دالة مشاركة مخصصة */
  onShare?: () => void;
}

// ============================================
// 🎯 مكون زر التنقل المُحسَّن
// ============================================

interface NavButtonProps {
  direction: 'left' | 'right';
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

const NavButton = memo<NavButtonProps>(({ direction, onClick, disabled }) => {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        onClick(e);
      }
    },
    [onClick, disabled],
  );

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`gallery-nav-btn gallery-nav-btn--${direction}`}
      aria-label={direction === 'left' ? 'الصورة السابقة' : 'الصورة التالية'}
      type="button"
    >
      {direction === 'left' ? (
        <ChevronLeftIcon className="gallery-icon" />
      ) : (
        <ChevronRightIcon className="gallery-icon" />
      )}
    </button>
  );
});

NavButton.displayName = 'NavButton';

// ============================================
// 🖼️ مكون الصورة المصغرة المُحسَّن
// ============================================

interface ThumbnailProps {
  src: string;
  alt: string;
  index: number;
  isActive: boolean;
  isPrimary?: boolean;
  onClick: (index: number) => void;
}

const Thumbnail = memo<ThumbnailProps>(({ src, alt, index, isActive, isPrimary, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(index);
  }, [onClick, index]);

  return (
    <button
      onClick={handleClick}
      className={`gallery-thumbnail ${isActive ? 'gallery-thumbnail--active' : 'gallery-thumbnail--inactive'}`}
      aria-label={`الانتقال للصورة ${index + 1}`}
      type="button"
    >
      <Image src={src} alt={alt} fill sizes="80px" className="object-cover" loading="lazy" />
      {isPrimary && (
        <span className="absolute left-1 top-1 rounded bg-blue-500 px-1 text-xs text-white">
          رئيسية
        </span>
      )}
    </button>
  );
});

Thumbnail.displayName = 'Thumbnail';

// ============================================
// 🎯 مكون الصور المصغرة مع أسهم التمرير
// ============================================

interface ThumbnailsContainerProps {
  images: GalleryImage[];
  currentIndex: number;
  onImageSelect: (index: number) => void;
}

const ThumbnailsContainer = memo<ThumbnailsContainerProps>(
  ({ images, currentIndex, onImageSelect }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // فحص إمكانية التمرير
    const checkScroll = useCallback(() => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
      }
    }, []);

    // تمرير لليسار (RTL: لليمين بصرياً)
    const scrollPrev = useCallback(() => {
      if (containerRef.current) {
        containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      }
    }, []);

    // تمرير لليمين (RTL: لليسار بصرياً)
    const scrollNext = useCallback(() => {
      if (containerRef.current) {
        containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      }
    }, []);

    // فحص التمرير عند التحميل
    useEffect(() => {
      checkScroll();
      const container = containerRef.current;
      if (container) {
        container.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);
        return () => {
          container.removeEventListener('scroll', checkScroll);
          window.removeEventListener('resize', checkScroll);
        };
      }
    }, [checkScroll, images.length]);

    // التمرير للصورة المحددة
    useEffect(() => {
      if (containerRef.current) {
        const thumbnailWidth = 88;
        const scrollPosition =
          currentIndex * thumbnailWidth - containerRef.current.clientWidth / 2 + thumbnailWidth / 2;
        containerRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }, [currentIndex]);

    return (
      <div className="gallery-thumbnails-wrapper mt-4">
        {/* زر التمرير السابق */}
        {canScrollLeft && (
          <button
            onClick={scrollPrev}
            className="gallery-thumbnails-nav gallery-thumbnails-nav--left"
            aria-label="الصور السابقة"
            type="button"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        )}

        {/* حاوية الصور المصغرة */}
        <div ref={containerRef} className="gallery-thumbnails">
          {images.map((image, index) => (
            <Thumbnail
              key={index}
              src={image.thumbnail || image.url}
              alt={image.alt || `صورة ${index + 1}`}
              index={index}
              isActive={index === currentIndex}
              isPrimary={image.isPrimary}
              onClick={onImageSelect}
            />
          ))}
        </div>

        {/* زر التمرير التالي */}
        {canScrollRight && (
          <button
            onClick={scrollNext}
            className="gallery-thumbnails-nav gallery-thumbnails-nav--right"
            aria-label="الصور التالية"
            type="button"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  },
);

ThumbnailsContainer.displayName = 'ThumbnailsContainer';

// ============================================
// 🚀 المكون الرئيسي
// ============================================

const OptimizedImageGallery: React.FC<OptimizedImageGalleryProps> = ({
  images,
  title = 'معرض الصور',
  className = '',
  alwaysShowArrows = false,
  showThumbnails = true,
  showCounter = true,
  showActions = true,
  enableLightbox = true,
  initialIndex = 0,
  onImageChange,
  onFavoriteToggle,
  height = '500px',
  itemId,
  itemType,
  onRequireLogin,
  onShare,
}) => {
  // ============================================
  // 📊 State & Hooks
  // ============================================
  const { user } = useAuth();
  const {
    isFavorite: checkIsFavorite,
    toggleFavorite: apiToggleFavorite,
    isLoading: isFavoriteLoading,
  } = useFavorites();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [localFavorite, setLocalFavorite] = useState(false);
  const [isProcessingFavorite, setIsProcessingFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // التحقق من حالة المفضلة بناءً على نوع العنصر
  const isFavorite = useMemo(() => {
    if (!itemId || !itemType) return localFavorite;
    switch (itemType) {
      case 'car':
      case 'marketplace':
        return checkIsFavorite(itemId);
      case 'auction':
        return checkIsFavorite(undefined, itemId);
      case 'showroom':
        return checkIsFavorite(undefined, undefined, itemId);
      case 'transport':
        return checkIsFavorite(undefined, undefined, undefined, itemId);
      default:
        return localFavorite;
    }
  }, [itemId, itemType, checkIsFavorite, localFavorite]);

  // Refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isNavigating = useRef(false);

  // ============================================
  // 🔄 تحويل الصور لصيغة موحدة
  // ============================================
  const normalizedImages = useMemo<GalleryImage[]>(() => {
    return images
      .map((img, index) => {
        if (typeof img === 'string') {
          return {
            url: img,
            alt: `${title} - صورة ${index + 1}`,
            isPrimary: index === 0,
          };
        }
        return {
          ...img,
          alt: img.alt || `${title} - صورة ${index + 1}`,
        };
      })
      .filter((img) => img.url && img.url.trim() !== '');
  }, [images, title]);

  // ============================================
  // 🎯 دوال التنقل المُحسَّنة
  // ============================================

  const navigateToIndex = useCallback(
    (newIndex: number) => {
      if (isNavigating.current) return;
      isNavigating.current = true;

      // استخدام requestAnimationFrame للأداء الأمثل
      requestAnimationFrame(() => {
        setCurrentIndex(newIndex);
        onImageChange?.(newIndex);

        // إعادة تفعيل التنقل بعد وقت قصير
        setTimeout(() => {
          isNavigating.current = false;
        }, 100);
      });
    },
    [onImageChange],
  );

  const goToNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % normalizedImages.length;
    navigateToIndex(newIndex);
  }, [currentIndex, normalizedImages.length, navigateToIndex]);

  const goToPrevious = useCallback(() => {
    const newIndex = (currentIndex - 1 + normalizedImages.length) % normalizedImages.length;
    navigateToIndex(newIndex);
  }, [currentIndex, normalizedImages.length, navigateToIndex]);

  const goToImage = useCallback(
    (index: number) => {
      if (index >= 0 && index < normalizedImages.length) {
        navigateToIndex(index);
      }
    },
    [normalizedImages.length, navigateToIndex],
  );

  // ============================================
  // 📱 معالجة اللمس للهواتف
  // ============================================

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  }, [goToNext, goToPrevious]);

  // ============================================
  // ⌨️ معالجة لوحة المفاتيح
  // ============================================

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          setIsLightboxOpen(false);
          document.body.style.overflow = 'unset';
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, goToNext, goToPrevious]);

  // ============================================
  // 🎭 Lightbox
  // ============================================

  const openLightbox = useCallback(() => {
    if (enableLightbox) {
      setIsLightboxOpen(true);
      document.body.style.overflow = 'hidden';
    }
  }, [enableLightbox]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  }, []);

  // ============================================
  // ❤️ المفضلة
  // ============================================

  const toggleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      // إذا لم يتم تحديد itemId أو itemType، استخدم السلوك القديم
      if (!itemId || !itemType) {
        setLocalFavorite((prev) => {
          const newValue = !prev;
          onFavoriteToggle?.(newValue);
          return newValue;
        });
        return;
      }

      // التحقق من تسجيل الدخول
      if (!user) {
        if (onRequireLogin) {
          onRequireLogin();
        }
        return;
      }

      if (isProcessingFavorite || isFavoriteLoading) return;

      setIsProcessingFavorite(true);
      try {
        let success = false;
        switch (itemType) {
          case 'car':
          case 'marketplace':
            success = await apiToggleFavorite(itemId);
            break;
          case 'auction':
            success = await apiToggleFavorite(undefined, itemId);
            break;
          case 'showroom':
            success = await apiToggleFavorite(undefined, undefined, itemId);
            break;
          case 'transport':
            success = await apiToggleFavorite(undefined, undefined, undefined, itemId);
            break;
        }
        if (success) {
          onFavoriteToggle?.(!isFavorite);
        }
      } catch (error) {
        console.error('[OptimizedImageGallery] خطأ في تبديل المفضلة:', error);
      } finally {
        setIsProcessingFavorite(false);
      }
    },
    [
      itemId,
      itemType,
      user,
      apiToggleFavorite,
      onRequireLogin,
      isProcessingFavorite,
      isFavoriteLoading,
      isFavorite,
      onFavoriteToggle,
    ],
  );

  // ============================================
  // 📤 المشاركة
  // ============================================

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      // استخدام دالة المشاركة المخصصة إن وجدت
      if (onShare) {
        onShare();
        return;
      }

      const url = typeof window !== 'undefined' ? window.location.href : '';

      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        try {
          await (navigator as any).share({
            title,
            text: `شاهد هذا الإعلان على سوق مزاد: ${title}`,
            url,
          });
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.log('فشلت المشاركة');
          }
        }
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(url);
          alert('تم نسخ الرابط!');
        } catch (error) {
          console.error('فشل نسخ الرابط:', error);
        }
      }
    },
    [title, onShare],
  );

  // ============================================
  // 🎨 Render
  // ============================================

  if (normalizedImages.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl bg-gray-100">
        <div className="text-center text-gray-500">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12" />
          <p className="mt-2">لا توجد صور متاحة</p>
        </div>
      </div>
    );
  }

  const currentImage = normalizedImages[currentIndex];
  const hasMultipleImages = normalizedImages.length > 1;

  return (
    <div className={`w-full ${className}`}>
      {/* الصورة الرئيسية */}
      <div className="relative">
        <div
          className="gallery-main-image group cursor-zoom-in"
          style={{ height }}
          onClick={openLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={currentImage.url}
            alt={currentImage.alt || title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={currentIndex === 0}
            onLoad={() => setIsLoading(false)}
          />

          {/* طبقة التحكم */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-100 group-hover:bg-black/10">
            {/* أزرار الإجراءات */}
            {showActions && (
              <div className="absolute left-4 top-4 z-20 flex gap-2">
                <button
                  onClick={toggleFavorite}
                  disabled={isProcessingFavorite}
                  className={`gallery-action-btn ${isProcessingFavorite ? 'cursor-wait opacity-70' : ''}`}
                  aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                  title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                  type="button"
                >
                  {isProcessingFavorite ? (
                    <span className="block h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  ) : isFavorite ? (
                    <HeartSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 hover:text-red-500" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="gallery-action-btn"
                  aria-label="مشاركة"
                  title="مشاركة"
                  type="button"
                >
                  <ShareIcon className="h-5 w-5 hover:text-blue-500" />
                </button>
              </div>
            )}

            {/* العداد */}
            {showCounter && hasMultipleImages && (
              <div className="gallery-counter">
                {currentIndex + 1} / {normalizedImages.length}
              </div>
            )}

            {/* أزرار التنقل */}
            {hasMultipleImages && (
              <div
                className={`${alwaysShowArrows ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-100`}
              >
                <NavButton direction="left" onClick={goToPrevious} />
                <NavButton direction="right" onClick={goToNext} />
              </div>
            )}

            {/* أيقونة التكبير */}
            {enableLightbox && (
              <div className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-100 group-hover:opacity-100">
                <div className="rounded-full bg-black/60 p-2">
                  <MagnifyingGlassIcon className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
          )}
        </div>

        {/* الصور المصغرة مع أسهم التمرير */}
        {showThumbnails && hasMultipleImages && (
          <ThumbnailsContainer
            images={normalizedImages}
            currentIndex={currentIndex}
            onImageSelect={goToImage}
          />
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="gallery-lightbox"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={closeLightbox}
                className="rounded-full bg-white/20 p-2 text-white transition-colors duration-100 hover:bg-white/30"
                aria-label="إغلاق"
                type="button"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              {hasMultipleImages && (
                <span className="text-sm text-white/80">
                  {currentIndex + 1} من {normalizedImages.length}
                </span>
              )}
            </div>

            {showActions && (
              <div className="flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className="rounded-full bg-white/20 p-2 text-white transition-colors duration-100 hover:bg-white/30"
                  type="button"
                >
                  {isFavorite ? (
                    <HeartSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="rounded-full bg-white/20 p-2 text-white transition-colors duration-100 hover:bg-white/30"
                  type="button"
                >
                  <ShareIcon className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>

          {/* الصورة */}
          <div className="flex h-full items-center justify-center p-4 pt-20">
            <Image
              src={currentImage.url}
              alt={currentImage.alt || title}
              width={1200}
              height={800}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* أزرار التنقل */}
          {hasMultipleImages && (
            <>
              <NavButton direction="left" onClick={goToPrevious} />
              <NavButton direction="right" onClick={goToNext} />
            </>
          )}

          {/* معلومات */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="rounded-lg bg-black/50 p-4 backdrop-blur-sm">
              <h3 className="font-medium text-white">{title}</h3>
              {currentImage.alt && <p className="mt-1 text-sm text-white/80">{currentImage.alt}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(OptimizedImageGallery);

// ============================================
// 🔧 Hook للاستخدام المباشر
// ============================================

export function useGalleryNavigation(totalImages: number, initialIndex = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const isNavigating = useRef(false);

  const goToNext = useCallback(() => {
    if (isNavigating.current || totalImages <= 1) return;
    isNavigating.current = true;

    requestAnimationFrame(() => {
      setCurrentIndex((prev) => (prev + 1) % totalImages);
      setTimeout(() => {
        isNavigating.current = false;
      }, 100);
    });
  }, [totalImages]);

  const goToPrevious = useCallback(() => {
    if (isNavigating.current || totalImages <= 1) return;
    isNavigating.current = true;

    requestAnimationFrame(() => {
      setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
      setTimeout(() => {
        isNavigating.current = false;
      }, 100);
    });
  }, [totalImages]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalImages) {
        requestAnimationFrame(() => {
          setCurrentIndex(index);
        });
      }
    },
    [totalImages],
  );

  return {
    currentIndex,
    goToNext,
    goToPrevious,
    goToIndex,
    hasMultiple: totalImages > 1,
  };
}
