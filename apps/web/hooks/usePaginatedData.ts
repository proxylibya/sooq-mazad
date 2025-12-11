import { useState, useCallback, useEffect, useRef } from 'react';

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UsePaginatedDataOptions<T> {
  fetchFunction: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
  initialPage?: number;
  initialPageSize?: number;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
  initialFilters?: Record<string, any>;
  cacheKey?: string;
  cacheTime?: number;
  autoFetch?: boolean;
}

interface UsePaginatedDataReturn<T> {
  data: T[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  sortBy: string | undefined;
  sortOrder: 'asc' | 'desc' | undefined;
  filters: Record<string, any>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  setFilters: (filters: Record<string, any>) => void;
  refresh: () => void;
  reset: () => void;
}

// Cache بسيط في الذاكرة
const cache = new Map<string, { data: any; timestamp: number }>();

export function usePaginatedData<T = any>({
  fetchFunction,
  initialPage = 1,
  initialPageSize = 20,
  initialSortBy,
  initialSortOrder = 'desc',
  initialFilters = {},
  cacheKey,
  cacheTime = 5 * 60 * 1000, // 5 دقائق
  autoFetch = true,
}: UsePaginatedDataOptions<T>): UsePaginatedDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(initialSortOrder);
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // دالة جلب البيانات
  const fetchData = useCallback(async () => {
    // إلغاء الطلب السابق إذا كان موجوداً
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const params: PaginationParams = {
      page,
      pageSize,
      sortBy,
      sortOrder,
      filters,
    };

    // التحقق من الـ cache
    const key = cacheKey || JSON.stringify(params);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < cacheTime) {
      const cachedResponse = cached.data as PaginatedResponse<T>;
      setData(cachedResponse.data);
      setTotal(cachedResponse.total);
      setTotalPages(cachedResponse.totalPages);
      setHasNextPage(cachedResponse.hasNextPage);
      setHasPrevPage(cachedResponse.hasPrevPage);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const response = await fetchFunction(params);

      if (!isMountedRef.current) return;

      setData(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setHasNextPage(response.hasNextPage);
      setHasPrevPage(response.hasPrevPage);

      // حفظ في الـ cache
      cache.set(key, {
        data: response,
        timestamp: Date.now(),
      });

      // تنظيف الـ cache القديم
      for (const [k, v] of cache.entries()) {
        if (Date.now() - v.timestamp > cacheTime) {
          cache.delete(k);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      if (!isMountedRef.current) return;

      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      console.error('Error fetching paginated data:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, pageSize, sortBy, sortOrder, filters, fetchFunction, cacheKey, cacheTime]);

  // الانتقال إلى صفحة معينة
  const goToPage = useCallback((newPage: number) => {
    if (newPage < 1) return;
    setPage(newPage);
  }, []);

  // الصفحة التالية
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  // الصفحة السابقة
  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  }, [hasPrevPage]);

  // تغيير حجم الصفحة
  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1); // العودة إلى الصفحة الأولى
  }, []);

  // تغيير الترتيب
  const setSortingOptions = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1); // العودة إلى الصفحة الأولى
  }, []);

  // تغيير الفلاتر
  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(1); // العودة إلى الصفحة الأولى
  }, []);

  // تحديث البيانات
  const refresh = useCallback(() => {
    // مسح الـ cache للمفتاح الحالي
    const params: PaginationParams = {
      page,
      pageSize,
      sortBy,
      sortOrder,
      filters,
    };
    const key = cacheKey || JSON.stringify(params);
    cache.delete(key);

    fetchData();
  }, [page, pageSize, sortBy, sortOrder, filters, cacheKey, fetchData]);

  // إعادة التعيين
  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
    setFilters(initialFilters);
    cache.clear();
  }, [initialPage, initialPageSize, initialSortBy, initialSortOrder, initialFilters]);

  // جلب البيانات عند التغيير
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  // تنظيف
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    sortBy,
    sortOrder,
    filters,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: changePageSize,
    setSorting: setSortingOptions,
    setFilters: updateFilters,
    refresh,
    reset,
  };
}
