// @ts-nocheck
/**
 * Enterprise Lazy Loading System
 * نظام التحميل الكسول المتقدم
 */

import dynamic from 'next/dynamic';
import React, { ComponentType, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

// ============================================
// Types
// ============================================

export interface LazyLoadOptions {
  loading?: ReactNode;
  delay?: number;
  ssr?: boolean;
  retries?: number;
}

// ============================================
// Skeleton Components
// ============================================

export const DefaultSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-full min-h-[200px] w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4 rounded-lg border p-4">
    <div className="h-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
    <div className="space-y-2">
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="animate-pulse space-y-2">
    <div className="h-10 rounded bg-gray-200 dark:bg-gray-700" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 rounded bg-gray-100 dark:bg-gray-800" />
    ))}
  </div>
);

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================
// Intersection Observer Hook
// ============================================

export function useIntersectionObserver(
  options: IntersectionObserverInit = {},
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.1, ...options },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

// ============================================
// Lazy Wrapper Component
// ============================================

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <DefaultSkeleton />,
  rootMargin = '100px',
}) => {
  const [ref, isVisible] = useIntersectionObserver({ rootMargin });

  return <div ref={ref}>{isVisible ? children : fallback}</div>;
};

// ============================================
// Dynamic Import Factory
// ============================================

export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyLoadOptions = {},
): ComponentType<P> {
  const { loading, ssr = false, retries = 3 } = options;

  let retryCount = 0;

  const loadWithRetry = async (): Promise<{ default: ComponentType<P> }> => {
    try {
      return await importFn();
    } catch (error) {
      if (retryCount < retries) {
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        return loadWithRetry();
      }
      throw error;
    }
  };

  return dynamic(() => loadWithRetry(), {
    loading: () => <>{loading || <DefaultSkeleton />}</>,
    ssr,
  }) as ComponentType<P>;
}

// ============================================
// Lazy Image Component
// ============================================

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  onLoad,
  onError,
}) => {
  const [ref, isVisible] = useIntersectionObserver({ rootMargin: '200px' });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const shouldLoad = priority || isVisible;

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <span className="text-sm text-gray-400">Failed to load</span>
        </div>
      )}

      {shouldLoad && !hasError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
};

// ============================================
// Preload Functions
// ============================================

const preloadedModules = new Set<string>();

export function preloadModule(modulePath: string): void {
  if (preloadedModules.has(modulePath)) return;
  preloadedModules.add(modulePath);
}

export function preloadOnHover(modulePath: string) {
  return {
    onMouseEnter: () => preloadModule(modulePath),
    onFocus: () => preloadModule(modulePath),
  };
}
