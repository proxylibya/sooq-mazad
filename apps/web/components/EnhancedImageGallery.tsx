import ChevronLeftIcon from '@heroicons/react/24/outline/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';

interface ImageData {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export type GalleryItemType = 'auction' | 'car' | 'marketplace' | 'showroom' | 'transport';

interface EnhancedImageGalleryProps {
  images: ImageData[];
  title?: string;
  className?: string;
  featured?: boolean;
  promotionPackage?: string;
  /** معرف العنصر للمفضلة */
  itemId?: string;
  /** نوع العنصر للمفضلة */
  itemType?: GalleryItemType;
  /** دالة تُستدعى عند طلب تسجيل الدخول */
  onRequireLogin?: () => void;
  /** دالة مشاركة مخصصة */
  onShare?: () => void;
  /** إظهار/إخفاء أزرار الإجراءات */
  showActions?: boolean;
}

// مكون الصور المصغرة مع أسهم التمرير
interface ThumbnailsWithNavigationProps {
  images: ImageData[];
  currentImageIndex: number;
  onSelect: (index: number) => void;
}

const ThumbnailsWithNavigation: React.FC<ThumbnailsWithNavigationProps> = memo(
  ({ images, currentImageIndex, onSelect }) => {
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

    // تمرير لليسار
    const scrollLeft = useCallback(() => {
      if (containerRef.current) {
        containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      }
    }, []);

    // تمرير لليمين
    const scrollRight = useCallback(() => {
      if (containerRef.current) {
        containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      }
    }, []);

    // فحص التمرير عند التحميل وعند تغيير الصور
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
        const thumbnailWidth = 88; // 5rem + gap
        const scrollPosition =
          currentImageIndex * thumbnailWidth -
          containerRef.current.clientWidth / 2 +
          thumbnailWidth / 2;
        containerRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }, [currentImageIndex]);

    return (
      <div className="gallery-thumbnails-wrapper mt-4">
        {/* زر التمرير لليسار */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="gallery-thumbnails-nav gallery-thumbnails-nav--left"
            aria-label="تمرير لليسار"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        )}

        {/* حاوية الصور المصغرة */}
        <div ref={containerRef} className="gallery-thumbnails">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => requestAnimationFrame(() => onSelect(index))}
              className={`gallery-thumbnail ${
                index === currentImageIndex
                  ? 'gallery-thumbnail--active'
                  : 'gallery-thumbnail--inactive'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 15vw"
                className="object-cover"
              />
              {image.isPrimary && (
                <div className="absolute left-1 top-1 rounded bg-blue-500 px-1 text-xs text-white">
                  رئيسية
                </div>
              )}
            </button>
          ))}
        </div>

        {/* زر التمرير لليمين */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="gallery-thumbnails-nav gallery-thumbnails-nav--right"
            aria-label="تمرير لليمين"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  },
);

ThumbnailsWithNavigation.displayName = 'ThumbnailsWithNavigation';

const EnhancedImageGallery: React.FC<EnhancedImageGalleryProps> = memo(
  ({
    images,
    title = 'معرض الصور',
    className = '',
    featured = false,
    promotionPackage,
    itemId,
    itemType,
    onRequireLogin,
    onShare,
    showActions = true,
  }) => {
    const { user } = useAuth();
    const {
      isFavorite: checkIsFavorite,
      toggleFavorite,
      isLoading: isFavoriteLoading,
    } = useFavorites();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessingFavorite, setIsProcessingFavorite] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const lightboxRef = useRef<HTMLDivElement>(null);

    // التحقق من حالة المفضلة بناءً على نوع العنصر
    const isFavorite = useMemo(() => {
      if (!itemId || !itemType) return false;
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
          return false;
      }
    }, [itemId, itemType, checkIsFavorite]);

    // معالج النقر على زر المفضلة
    const handleFavoriteClick = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!itemId || !itemType) {
          console.warn('[EnhancedImageGallery] لم يتم تحديد itemId أو itemType للمفضلة');
          return;
        }

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
              success = await toggleFavorite(itemId);
              break;
            case 'auction':
              success = await toggleFavorite(undefined, itemId);
              break;
            case 'showroom':
              success = await toggleFavorite(undefined, undefined, itemId);
              break;
            case 'transport':
              success = await toggleFavorite(undefined, undefined, undefined, itemId);
              break;
          }
          console.log('[EnhancedImageGallery] تبديل المفضلة:', { success, itemId, itemType });
        } catch (error) {
          console.error('[EnhancedImageGallery] خطأ في تبديل المفضلة:', error);
        } finally {
          setIsProcessingFavorite(false);
        }
      },
      [
        itemId,
        itemType,
        user,
        toggleFavorite,
        onRequireLogin,
        isProcessingFavorite,
        isFavoriteLoading,
      ],
    );

    // التأكد من وجود صور صالحة
    const validImages = images.filter((img) => img.url && img.url !== '');

    // التنقل بين الصور - محسن بـ requestAnimationFrame
    const isNavigating = useRef(false);

    const goToNext = useCallback(() => {
      if (validImages.length > 0 && !isNavigating.current) {
        isNavigating.current = true;
        requestAnimationFrame(() => {
          setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
          setTimeout(() => {
            isNavigating.current = false;
          }, 100);
        });
      }
    }, [validImages.length]);

    const goToPrevious = useCallback(() => {
      if (validImages.length > 0 && !isNavigating.current) {
        isNavigating.current = true;
        requestAnimationFrame(() => {
          setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
          setTimeout(() => {
            isNavigating.current = false;
          }, 100);
        });
      }
    }, [validImages.length]);

    // فتح/إغلاق اللايت بوكس
    const openLightbox = useCallback((index: number) => {
      setCurrentImageIndex(index);
      setIsLightboxOpen(true);
      document.body.style.overflow = 'hidden';
    }, []);

    const closeLightbox = useCallback(() => {
      setIsLightboxOpen(false);
      document.body.style.overflow = 'unset';
    }, []);

    // معالجة الضغط على المفاتيح - يجب أن يكون قبل أي early returns
    useEffect(() => {
      // لا تُضيف event listener إذا كان اللايت بوكس مُغلق
      if (!isLightboxOpen) {
        return undefined;
      }

      const handleKeyPress = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowLeft':
            goToPrevious();
            break;
          case 'ArrowRight':
            goToNext();
            break;
          case 'Escape':
            closeLightbox();
            break;
        }
      };

      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isLightboxOpen, goToNext, goToPrevious, closeLightbox]);

    if (validImages.length === 0) {
      return (
        <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100">
          <div className="text-center">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">لا توجد صور متاحة</p>
          </div>
        </div>
      );
    }

    const currentImage = validImages[currentImageIndex];

    // معالجة اللمس للهواتف المحمولة
    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;

      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe) {
        goToNext();
      } else if (isRightSwipe) {
        goToPrevious();
      }
    };

    // مشاركة الصورة
    const shareImage = useCallback(
      async (e?: React.MouseEvent) => {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }

        // استخدام دالة المشاركة المخصصة إن وجدت
        if (onShare) {
          onShare();
          return;
        }

        const url = typeof window !== 'undefined' ? window.location.href : '';

        if (typeof navigator !== 'undefined' && (navigator as any).share) {
          try {
            await (navigator as any).share({
              title: title,
              text: `شاهد هذا الإعلان على سوق مزاد: ${title}`,
              url: url,
            });
          } catch (error) {
            // المستخدم أغلق نافذة المشاركة - ليس خطأ
            if ((error as Error).name !== 'AbortError') {
              console.log('فشلت المشاركة:', error);
            }
          }
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(url);
            // يمكن إضافة toast notification هنا
            alert('تم نسخ رابط الصفحة!');
          } catch (error) {
            console.error('فشل نسخ الرابط:', error);
          }
        }
      },
      [title, onShare],
    );

    return (
      <div className={`w-full ${className}`}>
        {/* العرض الرئيسي */}
        <div className="relative">
          {/* الصورة الأساسية */}
          <div
            className="group relative h-96 cursor-zoom-in overflow-hidden rounded-xl bg-gray-100 md:h-[500px]"
            onClick={() => openLightbox(currentImageIndex)}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="gpu-accelerated object-cover"
              style={{ transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1)' }}
              priority={currentImageIndex === 0}
              onLoadStart={() => setIsLoading(true)}
              onLoad={() => setIsLoading(false)}
            />

            {/* طبقة التحكم */}
            <div
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10"
              style={{ transition: 'background-opacity 100ms ease' }}
            >
              {/* أزرار المفضلة والمشاركة - أعلى يسار */}
              {showActions && (
                <div className="absolute left-4 top-4 z-20 flex gap-2">
                  <button
                    onClick={handleFavoriteClick}
                    disabled={isProcessingFavorite}
                    className={`rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white ${
                      isProcessingFavorite ? 'cursor-wait opacity-70' : ''
                    }`}
                    aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                    title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                  >
                    {isProcessingFavorite ? (
                      <span className="block h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                    ) : isFavorite ? (
                      <HeartSolid className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-700 hover:text-red-500" />
                    )}
                  </button>

                  <button
                    onClick={shareImage}
                    className="rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
                    aria-label="مشاركة"
                    title="مشاركة"
                  >
                    <ShareIcon className="h-5 w-5 text-gray-700 hover:text-blue-500" />
                  </button>
                </div>
              )}

              {/* شارة إعلان مميز - تصميم ذهبي بارز - أعلى يمين */}
              {(featured || (promotionPackage && promotionPackage !== 'free')) && (
                <div className="absolute right-4 top-4 z-20">
                  <div className="flex items-center gap-2 rounded-lg border-2 border-yellow-300 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 px-3 py-2 shadow-lg">
                    <svg
                      className="h-5 w-5 text-white drop-shadow"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <span className="text-base font-bold text-white drop-shadow">إعلان مميز</span>
                  </div>
                </div>
              )}

              {/* عداد الصور - أسفل يسار */}
              <div className="absolute bottom-4 left-4 z-10">
                <div className="rounded-full bg-black/60 px-3 py-1 text-sm text-white backdrop-blur-sm">
                  {currentImageIndex + 1} / {validImages.length}
                </div>
              </div>

              {/* أزرار التنقل */}
              {validImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    className="gallery-nav-btn gallery-nav-btn--left"
                  >
                    <ChevronLeftIcon className="gallery-icon" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    className="gallery-nav-btn gallery-nav-btn--right"
                  >
                    <ChevronRightIcon className="gallery-icon" />
                  </button>
                </>
              )}

              {/* أيقونة التكبير */}
              <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-full bg-black/60 p-2">
                  <MagnifyingGlassIcon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {isLoading && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-gray-100"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <div
                  className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                  style={{ width: 24, height: 24 }}
                  role="status"
                  aria-label="جاري التحميل"
                />
                <span className="sr-only">جاري تحميل الصورة</span>
              </div>
            )}
          </div>

          {/* معرض الصور المصغرة مع أسهم التمرير */}
          {validImages.length > 1 && (
            <ThumbnailsWithNavigation
              images={validImages}
              currentImageIndex={currentImageIndex}
              onSelect={setCurrentImageIndex}
            />
          )}
        </div>

        {/* اللايت بوكس للعرض المكبر */}
        {isLightboxOpen && (
          <div
            ref={lightboxRef}
            className="fixed inset-0 z-[9999] bg-black bg-opacity-95 backdrop-blur-sm"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* أزرار التحكم العلوية */}
            <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={closeLightbox}
                  className="rounded-full bg-white bg-opacity-20 p-2 text-white transition-all hover:bg-opacity-30"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                <div className="text-white">
                  <span className="text-sm opacity-80">
                    {currentImageIndex + 1} من {validImages.length}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleFavoriteClick}
                  disabled={isProcessingFavorite}
                  className={`rounded-full bg-white/20 p-2 text-white transition-all hover:scale-110 hover:bg-white/30 ${
                    isProcessingFavorite ? 'cursor-wait opacity-70' : ''
                  }`}
                  aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                >
                  {isProcessingFavorite ? (
                    <span className="block h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : isFavorite ? (
                    <HeartSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6" />
                  )}
                </button>

                <button
                  onClick={shareImage}
                  className="rounded-full bg-white/20 p-2 text-white transition-all hover:scale-110 hover:bg-white/30"
                  aria-label="مشاركة"
                >
                  <ShareIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* الصورة المكبرة */}
            <div className="flex h-full items-center justify-center p-4 pt-20">
              <div className="relative max-h-full max-w-full">
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt}
                  width={1200}
                  height={800}
                  className="max-h-full max-w-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* أزرار التنقل في اللايت بوكس */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="gallery-nav-btn gallery-nav-btn--left"
                >
                  <ChevronLeftIcon className="gallery-icon--lg" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="gallery-nav-btn gallery-nav-btn--right"
                >
                  <ChevronRightIcon className="gallery-icon--lg" />
                </button>
              </>
            )}

            {/* معلومات الصورة */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="rounded-lg bg-black/50 p-4 text-white backdrop-blur-sm">
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1 text-sm opacity-80">{currentImage.alt}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

EnhancedImageGallery.displayName = 'EnhancedImageGallery';

export default EnhancedImageGallery;
