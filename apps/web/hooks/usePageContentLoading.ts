/**
 * usePageContentLoading - Hook موحد لتحميل محتوى الصفحات
 * نظام التحميل العالمي الموحد - سوق مزاد
 *
 * @description Hook لإدارة حالة التحميل في الصفحات ذات البطاقات والمحتوى
 * @version 1.0.0
 */

import { useLoading } from '@/components/ui/loading';
import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================
// Types & Interfaces
// ============================================

export type ContentType =
    | 'auctions'
    | 'cars'
    | 'marketplace'
    | 'showrooms'
    | 'transport'
    | 'messages'
    | 'notifications'
    | 'users'
    | 'favorites'
    | 'yards'
    | 'companies'
    | 'custom';

export interface PageContentLoadingOptions<T> {
    /** نوع المحتوى */
    contentType: ContentType;
    /** معرف فريد للصفحة */
    pageId?: string;
    /** البيانات الأولية من SSR */
    initialData?: T[];
    /** دالة جلب البيانات */
    fetchFn?: () => Promise<T[]>;
    /** تحديث تلقائي؟ */
    autoRefresh?: boolean;
    /** فترة التحديث (مللي ثانية) */
    refreshInterval?: number;
    /** الحد الأدنى لوقت التحميل */
    minimumLoadingTime?: number;
    /** إظهار skeleton أثناء التحميل الأولي */
    showSkeletonOnInitial?: boolean;
    /** عدد العناصر في skeleton */
    skeletonCount?: number;
}

export interface PageContentLoadingResult<T> {
    /** البيانات الحالية */
    data: T[];
    /** هل التحميل الأولي جاري */
    isInitialLoading: boolean;
    /** هل التحديث جاري */
    isRefreshing: boolean;
    /** هل حدث خطأ */
    isError: boolean;
    /** رسالة الخطأ */
    error: string | null;
    /** هل البيانات فارغة */
    isEmpty: boolean;
    /** هل تم التحميل */
    isLoaded: boolean;
    /** دالة إعادة التحميل */
    refresh: () => Promise<void>;
    /** دالة تعيين البيانات يدوياً */
    setData: (data: T[]) => void;
    /** عدد عناصر skeleton */
    skeletonCount: number;
    /** نوع المحتوى */
    contentType: ContentType;
}

// ============================================
// Hook Implementation
// ============================================

export function usePageContentLoading<T = unknown>(
    options: PageContentLoadingOptions<T>
): PageContentLoadingResult<T> {
    const {
        contentType,
        pageId = contentType,
        initialData = [],
        fetchFn,
        autoRefresh = false,
        refreshInterval = 30000,
        minimumLoadingTime = 300,
        showSkeletonOnInitial = true,
        skeletonCount: defaultSkeletonCount = 6,
    } = options;

    // حالة البيانات
    const [data, setData] = useState<T[]>(initialData);
    const [isInitialLoading, setIsInitialLoading] = useState(
        showSkeletonOnInitial && initialData.length === 0
    );
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(initialData.length > 0);

    // مراجع للتحكم
    const isMounted = useRef(true);
    const refreshTimer = useRef<NodeJS.Timeout | null>(null);
    const abortController = useRef<AbortController | null>(null);

    // استخدام نظام التحميل العالمي
    let loadingContext: ReturnType<typeof useLoading> | null = null;
    try {
        loadingContext = useLoading();
    } catch {
        // نظام التحميل غير متاح - نستمر بدونه
    }

    // حساب عدد عناصر skeleton حسب نوع المحتوى
    const skeletonCount = (() => {
        const counts: Record<ContentType, number> = {
            auctions: 6,
            cars: 8,
            marketplace: 8,
            showrooms: 4,
            transport: 4,
            messages: 5,
            notifications: 4,
            users: 5,
            favorites: 6,
            yards: 4,
            companies: 4,
            custom: defaultSkeletonCount,
        };
        return counts[contentType] || defaultSkeletonCount;
    })();

    // دالة جلب البيانات
    const fetchData = useCallback(
        async (isRefresh = false) => {
            if (!fetchFn) return;

            // إلغاء الطلب السابق إن وجد
            if (abortController.current) {
                abortController.current.abort();
            }
            abortController.current = new AbortController();

            const startTime = Date.now();

            try {
                // تحديث حالة التحميل
                if (isRefresh) {
                    setIsRefreshing(true);
                } else {
                    setIsInitialLoading(true);
                }
                setIsError(false);
                setError(null);

                // بدء التحميل في النظام العالمي
                if (loadingContext) {
                    loadingContext.startLoading(pageId, 'data');
                }

                // جلب البيانات
                const result = await fetchFn();

                // ضمان الحد الأدنى لوقت التحميل
                const elapsed = Date.now() - startTime;
                if (elapsed < minimumLoadingTime) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, minimumLoadingTime - elapsed)
                    );
                }

                // تحديث البيانات
                if (isMounted.current) {
                    setData(result);
                    setIsLoaded(true);
                }
            } catch (err) {
                if (isMounted.current) {
                    const errorMessage =
                        err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات';
                    setIsError(true);
                    setError(errorMessage);
                }
            } finally {
                if (isMounted.current) {
                    setIsInitialLoading(false);
                    setIsRefreshing(false);

                    // إنهاء التحميل في النظام العالمي
                    if (loadingContext) {
                        loadingContext.stopLoading(pageId);
                    }
                }
            }
        },
        [fetchFn, pageId, minimumLoadingTime, loadingContext]
    );

    // دالة إعادة التحميل
    const refresh = useCallback(async () => {
        await fetchData(true);
    }, [fetchData]);

    // تحميل أولي
    useEffect(() => {
        isMounted.current = true;

        // إذا لم تكن هناك بيانات أولية، نجلب البيانات
        if (initialData.length === 0 && fetchFn) {
            fetchData(false);
        } else if (initialData.length > 0) {
            // البيانات موجودة من SSR
            setIsInitialLoading(false);
            setIsLoaded(true);
        }

        return () => {
            isMounted.current = false;
            if (abortController.current) {
                abortController.current.abort();
            }
        };
    }, []);

    // تحديث تلقائي
    useEffect(() => {
        if (!autoRefresh || !fetchFn) return;

        refreshTimer.current = setInterval(() => {
            if (isMounted.current && !isRefreshing) {
                refresh();
            }
        }, refreshInterval);

        return () => {
            if (refreshTimer.current) {
                clearInterval(refreshTimer.current);
            }
        };
    }, [autoRefresh, refreshInterval, refresh, isRefreshing, fetchFn]);

    // تحديث البيانات عند تغير initialData
    useEffect(() => {
        if (initialData.length > 0) {
            setData(initialData);
            setIsInitialLoading(false);
            setIsLoaded(true);
        }
    }, [initialData]);

    return {
        data,
        isInitialLoading,
        isRefreshing,
        isError,
        error,
        isEmpty: isLoaded && data.length === 0,
        isLoaded,
        refresh,
        setData,
        skeletonCount,
        contentType,
    };
}

// ============================================
// Utility Hooks
// ============================================

/**
 * Hook مبسط لحالة التحميل فقط
 */
export function useSimpleLoading(pageId: string) {
    const [isLoading, setIsLoading] = useState(true);

    let loadingContext: ReturnType<typeof useLoading> | null = null;
    try {
        loadingContext = useLoading();
    } catch {
        // نظام التحميل غير متاح
    }

    const start = useCallback(() => {
        setIsLoading(true);
        if (loadingContext) {
            loadingContext.startLoading(pageId, 'data');
        }
    }, [pageId, loadingContext]);

    const stop = useCallback(() => {
        setIsLoading(false);
        if (loadingContext) {
            loadingContext.stopLoading(pageId);
        }
    }, [pageId, loadingContext]);

    return { isLoading, start, stop, setIsLoading };
}

export default usePageContentLoading;
