import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchData: (
    page: number,
    pageSize: number,
  ) => Promise<{ data: T[]; hasMore: boolean; total?: number }>;
  pageSize?: number;
  threshold?: number;
  enabled?: boolean;
  initialData?: T[];
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  refresh: () => void;
  total: number;
  page: number;
}

export function useInfiniteScroll<T = any>({
  fetchData,
  pageSize = 20,
  threshold = 0.8,
  enabled = true,
  initialData = [],
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const isFetchingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // تحميل البيانات
  const loadData = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (isFetchingRef.current || !enabled) return;

      try {
        isFetchingRef.current = true;

        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const result = await fetchData(pageNum, pageSize);

        if (append) {
          setData((prev) => [...prev, ...result.data]);
        } else {
          setData(result.data);
        }

        setHasMore(result.hasMore);

        if (result.total !== undefined) {
          setTotal(result.total);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [fetchData, pageSize, enabled],
  );

  // تحميل المزيد
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isFetchingRef.current) return;

    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, true);
  }, [page, hasMore, isLoadingMore, loadData]);

  // إعادة التعيين
  const reset = useCallback(() => {
    setData(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
    setTotal(0);
  }, [initialData]);

  // تحديث البيانات
  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadData(1, false);
  }, [loadData]);

  // Intersection Observer للـ infinite scroll
  useEffect(() => {
    if (!enabled || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !isLoadingMore && hasMore) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin: '100px',
      },
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, isLoadingMore, threshold, loadMore]);

  // تحميل البيانات الأولية
  useEffect(() => {
    if (enabled && data.length === 0 && !isLoading) {
      loadData(1, false);
    }
  }, [enabled]);

  return {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    reset,
    refresh,
    total,
    page,
  };
}

// Hook للـ scroll detection
export function useScrollPosition(threshold: number = 0.8) {
  const [shouldLoadMore, setShouldLoadMore] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage > threshold) {
        setShouldLoadMore(true);
      } else {
        setShouldLoadMore(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return shouldLoadMore;
}
