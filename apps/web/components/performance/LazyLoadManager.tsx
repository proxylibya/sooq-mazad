import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '../../utils/logger';

// خيارات Lazy Loading
interface LazyLoadOptions {
  threshold?: number; // نسبة الظهور لبدء التحميل (0-1)
  rootMargin?: string; // هامش إضافي للتحميل المسبق
  triggerOnce?: boolean; // تحميل مرة واحدة فقط
  placeholder?: React.ReactNode; // عنصر بديل أثناء التحميل
  errorFallback?: React.ReactNode; // عنصر في حالة الخطأ
  loadingDelay?: number; // تأخير قبل بدء التحميل (ms)
  priority?: 'low' | 'normal' | 'high'; // أولوية التحميل
  preloadDistance?: number; // مسافة التحميل المسبق (px)
}

// حالة التحميل
type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// Hook للـ Lazy Loading
export function useLazyLoad(options: LazyLoadOptions = {}) {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    loadingDelay = 0,
    priority = 'normal',
    preloadDistance = 200,
  } = options;

  // إعداد Intersection Observer
  useEffect(() => {
    if (!elementRef.current) return;

    const observerOptions: IntersectionObserverInit = {
      threshold,
      rootMargin: `${preloadDistance}px ${rootMargin} ${preloadDistance}px ${rootMargin}`,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (loadingDelay > 0) {
            setTimeout(() => {
              setIsVisible(true);
              setLoadingState('loading');
            }, loadingDelay);
          } else {
            setIsVisible(true);
            setLoadingState('loading');
          }

          // إيقاف المراقبة إذا كان triggerOnce مفعل
          if (triggerOnce && observerRef.current) {
            observerRef.current.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
          setLoadingState('idle');
        }
      });
    }, observerOptions);

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce, loadingDelay, preloadDistance]);

  // دالة لتحديد حالة التحميل
  const setLoaded = useCallback(() => {
    setLoadingState('loaded');
  }, []);

  const setError = useCallback(() => {
    setLoadingState('error');
  }, []);

  return {
    elementRef,
    isVisible,
    loadingState,
    setLoaded,
    setError,
  };
}

// مكون Lazy Loading للصور
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  errorImage?: string;
  options?: LazyLoadOptions;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  srcSet?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  errorImage,
  options = {},
  onLoad,
  onError,
  sizes,
  srcSet,
}) => {
  const { elementRef, isVisible, loadingState, setLoaded, setError } = useLazyLoad(options);
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');

  // تحميل الصورة عند الحاجة
  useEffect(() => {
    if (isVisible && loadingState === 'loading') {
      const img = new Image();

      img.onload = () => {
        setImageSrc(src);
        setLoaded();
        onLoad?.();

        // تسجيل نجاح التحميل
        logger.info('<CheckCircleIcon className="w-5 h-5 text-green-500" /> تم تحميل صورة بنجاح:', {
          src,
          alt,
        });
      };

      img.onerror = () => {
        if (errorImage) {
          setImageSrc(errorImage);
        }
        setError();
        onError?.();

        // تسجيل فشل التحميل
        logger.warn('<XCircleIcon className="w-5 h-5 text-red-500" /> فشل في تحميل صورة:', {
          src,
          alt,
        });
      };

      // بدء تحميل الصورة
      img.src = src;
      if (srcSet) img.srcset = srcSet;
      if (sizes) img.sizes = sizes;
    }
  }, [
    isVisible,
    loadingState,
    src,
    srcSet,
    sizes,
    setLoaded,
    setError,
    onLoad,
    onError,
    errorImage,
  ]);

  return (
    <div ref={elementRef} className={`lazy-image-container ${className}`}>
      {loadingState === 'loading' && !imageSrc && (
        <div className="lazy-image-placeholder">
          <div className="h-full w-full animate-pulse rounded bg-gray-200"></div>
        </div>
      )}

      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`lazy-image ${loadingState === 'loaded' ? 'loaded' : ''}`}
          loading="lazy"
          sizes={sizes}
          srcSet={srcSet}
        />
      )}

      {loadingState === 'error' && !errorImage && (
        <div className="lazy-image-error">
          <div className="p-4 text-center text-gray-400">فشل في تحميل الصورة</div>
        </div>
      )}
    </div>
  );
};

// مكون Lazy Loading للمحتوى
interface LazyContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  options?: LazyLoadOptions;
  className?: string;
}

export const LazyContent: React.FC<LazyContentProps> = ({
  children,
  fallback,
  options = {},
  className = '',
}) => {
  const { elementRef, isVisible, loadingState } = useLazyLoad(options);

  return (
    <div ref={elementRef} className={`lazy-content ${className}`}>
      {isVisible ? (
        <div className={`lazy-content-loaded ${loadingState === 'loaded' ? 'fade-in' : ''}`}>
          {children}
        </div>
      ) : (
        fallback || (
          <div className="lazy-content-placeholder">
            <div className="animate-pulse">
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

// مكون Lazy Loading للقوائم
interface LazyListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number; // عدد العناصر الإضافية للتحميل
  className?: string;
}

export const LazyList: React.FC<LazyListProps> = ({
  items,
  renderItem,
  itemHeight = 100,
  containerHeight = 400,
  overscan = 5,
  className = '',
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // حساب العناصر المرئية
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  // معالج التمرير
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`lazy-list ${className}`}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      {/* مساحة فارغة قبل العناصر المرئية */}
      <div style={{ height: startIndex * itemHeight }} />

      {/* العناصر المرئية */}
      {visibleItems.map((item, index) => (
        <div key={startIndex + index} style={{ height: itemHeight }}>
          {renderItem(item, startIndex + index)}
        </div>
      ))}

      {/* مساحة فارغة بعد العناصر المرئية */}
      <div style={{ height: (items.length - endIndex - 1) * itemHeight }} />
    </div>
  );
};

// Hook لتحميل البيانات تدريجياً
interface UseInfiniteScrollOptions {
  threshold?: number;
  hasMore?: boolean;
  loading?: boolean;
}

export function useInfiniteScroll(loadMore: () => void, options: UseInfiniteScrollOptions = {}) {
  const { threshold = 0.8, hasMore = true, loading = false } = options;
  const [isFetching, setIsFetching] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching) {
          setIsFetching(true);
          loadMore();
        }
      },
      { threshold },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [loadMore, threshold, hasMore, loading, isFetching]);

  // إعادة تعيين حالة التحميل
  useEffect(() => {
    if (!loading) {
      setIsFetching(false);
    }
  }, [loading]);

  return { sentinelRef, isFetching };
}

// مكون Infinite Scroll
interface InfiniteScrollProps {
  children: React.ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  className?: string;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  loadMore,
  hasMore,
  loading,
  loader,
  endMessage,
  className = '',
}) => {
  const { sentinelRef } = useInfiniteScroll(loadMore, { hasMore, loading });

  return (
    <div className={`infinite-scroll ${className}`}>
      {children}

      {hasMore && (
        <div ref={sentinelRef} className="infinite-scroll-sentinel">
          {loading &&
            (loader || (
              <div className="py-4 text-center">
                <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                
              </div>
            ))}
        </div>
      )}

      {!hasMore &&
        (endMessage || <div className="py-4 text-center text-gray-500">تم تحميل جميع العناصر</div>)}
    </div>
  );
};
