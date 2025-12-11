// @ts-nocheck
/**
 * Enterprise Performance System
 * نظام الأداء المتقدم على مستوى الشركات العالمية
 */

// Lazy Loading
export {
    CardSkeleton, DefaultSkeleton, LazyImage, LazyWrapper, ListSkeleton, TableSkeleton, createLazyComponent,
    preloadModule,
    preloadOnHover, useIntersectionObserver
} from './lazy-loading';

export type { LazyLoadOptions } from './lazy-loading';

// Code Splitting
export {
    analyzeBundles, chunkManager, createDynamicImport, routeChunks
} from './code-splitting';

export type { BundleStats, RouteConfig } from './code-splitting';

// Image Optimization
export {
    customImageLoader, defaultImageConfig, detectAVIFSupport, detectWebPSupport, generateBlurPlaceholder, generateSizes, generateSrcSet, getCriticalImages, preloadImage,
    preloadImages
} from './image-optimizer';

export type { ImageLoaderProps, ImageOptimizationConfig, OptimizedImage } from './image-optimizer';

// Prefetching
export {
    createHoverPrefetch, getPredictedRoutes,
    prefetchPredicted, prefetchResource, prefetchRoute,
    prefetchRoutes, preloadResource, queuePrefetch,
    recordNavigation, setupViewportPrefetching
} from './prefetching';

export type { PrefetchConfig, PrefetchResult } from './prefetching';

// Core Web Vitals
export {
    calculateScore,
    getRating, getWebVitalsCollector, sendToAnalytics,
    thresholds,
    useWebVitals
} from './core-web-vitals';

export type { PerformanceReport, WebVitalsMetric } from './core-web-vitals';

