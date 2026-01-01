/**
 * Intersection Observer Hook
 * للكشف عن ظهور العناصر في viewport وتحميلها بشكل كسول
 */

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /**
   * تحميل مرة واحدة فقط عند الظهور الأول
   */
  triggerOnce?: boolean;
  /**
   * تأخير قبل تشغيل callback
   */
  delay?: number;
}

interface UseIntersectionObserverResult {
  isIntersecting: boolean;
  hasIntersected: boolean;
  ref: RefObject<HTMLDivElement>;
}

/**
 * Hook للكشف عن ظهور العنصر في viewport
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
): UseIntersectionObserverResult {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0.1,
    triggerOnce = false,
    delay = 0,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip if already intersected and triggerOnce is enabled
    if (triggerOnce && hasIntersected) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const handleIntersection = () => {
          const isCurrentlyIntersecting = entry.isIntersecting;
          setIsIntersecting(isCurrentlyIntersecting);

          if (isCurrentlyIntersecting && !hasIntersected) {
            setHasIntersected(true);

            if (triggerOnce) {
              observer.unobserve(element);
            }
          }
        };

        if (delay > 0 && entry.isIntersecting) {
          timeoutRef.current = setTimeout(handleIntersection, delay);
        } else {
          handleIntersection();
        }
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    observer.observe(element);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, triggerOnce, delay, hasIntersected]);

  return {
    isIntersecting,
    hasIntersected,
    ref,
  };
}

/**
 * Hook مُبسط لتحميل المكونات عند الظهور
 */
export function useLazyLoad(options?: UseIntersectionObserverOptions) {
  return useIntersectionObserver({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px', // تحميل قبل 50px من الظهور
    ...options,
  });
}

/**
 * Hook لتحميل الصور بشكل كسول
 */
export function useLazyImage(src: string, options?: UseIntersectionObserverOptions) {
  const { ref, hasIntersected } = useLazyLoad(options);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!hasIntersected || !src) return;

    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setError(new Error(`Failed to load image: ${src}`));
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [hasIntersected, src]);

  return {
    ref,
    src: imageSrc,
    isLoaded,
    error,
    isVisible: hasIntersected,
  };
}

/**
 * Hook لتحميل عدة عناصر بشكل كسول
 */
export function useLazyList<T>(items: T[], initialCount: number = 10, incrementCount: number = 10) {
  const [displayCount, setDisplayCount] = useState(initialCount);
  const { ref, hasIntersected } = useLazyLoad({
    rootMargin: '200px',
  });

  useEffect(() => {
    if (hasIntersected && displayCount < items.length) {
      const newCount = Math.min(displayCount + incrementCount, items.length);
      setDisplayCount(newCount);
    }
  }, [hasIntersected, displayCount, items.length, incrementCount]);

  const displayedItems = items.slice(0, displayCount);
  const hasMore = displayCount < items.length;

  return {
    displayedItems,
    hasMore,
    loadMoreRef: ref,
    displayCount,
  };
}

export default useIntersectionObserver;
