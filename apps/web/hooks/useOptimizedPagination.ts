/**
 * Hook محسّن للـ Pagination
 * يدعم Infinite Scroll و Traditional Pagination
 */

import { useState, useCallback, useEffect } from 'react';

interface UsePaginationOptions<T> {
  fetchFn: (
    page: number,
    limit: number,
  ) => Promise<{
    data: T[];
    total?: number;
    hasMore?: boolean;
  }>;
  limit?: number;
  initialPage?: number;
  autoLoad?: boolean;
}

interface UsePaginationReturn<T> {
  data: T[];
  page: number;
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  totalPages: number;
  loadMore: () => Promise<void>;
  loadPage: (page: number) => Promise<void>;
  reset: () => void;
  refresh: () => Promise<void>;
}

export function useOptimizedPagination<T>({
  fetchFn,
  limit = 20,
  initialPage = 1,
  autoLoad = true,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  /**
   * تحميل صفحة محددة
   */
  const loadPage = useCallback(
    async (pageNum: number) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchFn(pageNum, limit);

        setData(result.data);
        setPage(pageNum);

        // حساب hasMore
        if (result.hasMore !== undefined) {
          setHasMore(result.hasMore);
        } else if (result.total !== undefined) {
          const total = Math.ceil(result.total / limit);
          setTotalPages(total);
          setHasMore(pageNum < total);
        } else {
          setHasMore(result.data.length >= limit);
        }
      } catch (err) {
        setError(err as Error);
        console.error('Pagination error:', err);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, limit, loading],
  );

  /**
   * تحميل المزيد (Infinite Scroll)
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const result = await fetchFn(nextPage, limit);

      setData((prev) => [...prev, ...result.data]);
      setPage(nextPage);

      // حساب hasMore
      if (result.hasMore !== undefined) {
        setHasMore(result.hasMore);
      } else if (result.total !== undefined) {
        const total = Math.ceil(result.total / limit);
        setTotalPages(total);
        setHasMore(nextPage < total);
      } else {
        setHasMore(result.data.length >= limit);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Load more error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, limit, page, loading, hasMore]);

  /**
   * إعادة تعيين
   */
  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    setTotalPages(0);
  }, [initialPage]);

  /**
   * تحديث البيانات
   */
  const refresh = useCallback(async () => {
    await loadPage(page);
  }, [loadPage, page]);

  // تحميل تلقائي في البداية
  useEffect(() => {
    if (autoLoad) {
      loadPage(initialPage);
    }
  }, []);

  return {
    data,
    page,
    loading,
    error,
    hasMore,
    totalPages,
    loadMore,
    loadPage,
    reset,
    refresh,
  };
}
