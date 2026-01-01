// @ts-nocheck
/**
 * Enterprise Prefetching System
 * نظام التحميل المسبق الذكي
 */

// ============================================
// Types
// ============================================

export interface PrefetchConfig {
    routes: string[];
    delay?: number;
    priority?: 'high' | 'low';
    onHover?: boolean;
    onVisible?: boolean;
}

export interface PrefetchResult {
    route: string;
    success: boolean;
    duration: number;
}

// ============================================
// Route Prefetching
// ============================================

const prefetchedRoutes = new Set<string>();
const prefetchQueue: string[] = [];
let isProcessing = false;

export async function prefetchRoute(route: string): Promise<PrefetchResult> {
    const startTime = performance.now();

    if (prefetchedRoutes.has(route)) {
        return { route, success: true, duration: 0 };
    }

    try {
        // Use Next.js router prefetch if available
        if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__) {
            const router = require('next/router').default;
            await router.prefetch(route);
        }

        prefetchedRoutes.add(route);
        const duration = performance.now() - startTime;

        return { route, success: true, duration };
    } catch (error) {
        console.error(`[Prefetch] Failed to prefetch ${route}:`, error);
        return { route, success: false, duration: performance.now() - startTime };
    }
}

export async function prefetchRoutes(routes: string[]): Promise<PrefetchResult[]> {
    return Promise.all(routes.map(prefetchRoute));
}

// ============================================
// Queue-based Prefetching
// ============================================

export function queuePrefetch(route: string): void {
    if (prefetchedRoutes.has(route) || prefetchQueue.includes(route)) return;

    prefetchQueue.push(route);
    processQueue();
}

async function processQueue(): Promise<void> {
    if (isProcessing || prefetchQueue.length === 0) return;

    isProcessing = true;

    while (prefetchQueue.length > 0) {
        const route = prefetchQueue.shift();
        if (route) {
            await prefetchRoute(route);
            // Small delay between prefetches
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    isProcessing = false;
}

// ============================================
// Predictive Prefetching
// ============================================

const navigationHistory: string[] = [];
const navigationPatterns: Map<string, string[]> = new Map();

export function recordNavigation(route: string): void {
    navigationHistory.push(route);

    // Keep only last 50 navigations
    if (navigationHistory.length > 50) {
        navigationHistory.shift();
    }

    // Update patterns
    if (navigationHistory.length >= 2) {
        const prevRoute = navigationHistory[navigationHistory.length - 2];
        const patterns = navigationPatterns.get(prevRoute) || [];
        patterns.push(route);
        navigationPatterns.set(prevRoute, patterns);
    }
}

export function getPredictedRoutes(currentRoute: string, limit: number = 3): string[] {
    const patterns = navigationPatterns.get(currentRoute) || [];

    // Count occurrences
    const counts = patterns.reduce((acc, route) => {
        acc[route] = (acc[route] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Sort by frequency and return top routes
    return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([route]) => route)
        .filter(route => !prefetchedRoutes.has(route));
}

export async function prefetchPredicted(currentRoute: string): Promise<void> {
    const predicted = getPredictedRoutes(currentRoute);
    if (predicted.length > 0) {
        await prefetchRoutes(predicted);
    }
}

// ============================================
// Hover-based Prefetching
// ============================================

export function createHoverPrefetch(route: string, delay: number = 100) {
    let timeoutId: NodeJS.Timeout | null = null;

    return {
        onMouseEnter: () => {
            timeoutId = setTimeout(() => {
                queuePrefetch(route);
            }, delay);
        },
        onMouseLeave: () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        },
        onFocus: () => {
            queuePrefetch(route);
        },
    };
}

// ============================================
// Viewport-based Prefetching
// ============================================

export function setupViewportPrefetching(): void {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const link = entry.target as HTMLAnchorElement;
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('/')) {
                        queuePrefetch(href);
                    }
                }
            });
        },
        { rootMargin: '200px' }
    );

    // Observe all internal links
    document.querySelectorAll('a[href^="/"]').forEach(link => {
        observer.observe(link);
    });
}

// ============================================
// Resource Prefetching
// ============================================

export function prefetchResource(url: string, as: 'script' | 'style' | 'image' | 'font'): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = as;

    if (as === 'font') {
        link.crossOrigin = 'anonymous';
    }

    document.head.appendChild(link);
}

export function preloadResource(url: string, as: 'script' | 'style' | 'image' | 'font'): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;

    if (as === 'font') {
        link.crossOrigin = 'anonymous';
    }

    document.head.appendChild(link);
}

// ============================================
// Export
// ============================================

export default {
    prefetchRoute,
    prefetchRoutes,
    queuePrefetch,
    recordNavigation,
    getPredictedRoutes,
    prefetchPredicted,
    createHoverPrefetch,
    setupViewportPrefetching,
    prefetchResource,
    preloadResource,
};
