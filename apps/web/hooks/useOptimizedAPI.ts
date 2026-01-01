import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: HeadersInit;
  body?: any;
  cache?: boolean;
  cacheTTL?: number; // Time to live in milliseconds
}

interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T | null) => void;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Global cache to share between hook instances
const globalCache = new Map<string, CacheEntry<any>>();
const ongoingRequests = new Map<string, Promise<any>>();

// Cleanup expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of globalCache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      globalCache.delete(key);
    }
  }
}, 60000); // Check every minute

export function useOptimizedAPI<T = any>(
  url: string | null,
  config: RequestConfig = {},
  dependencies: any[] = [],
): APIState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Memoize request configuration
  const requestConfig = useMemo(
    () => ({
      method: config.method || 'GET',
      cache: config.cache !== false,
      cacheTTL: config.cacheTTL || 300000, // 5 minutes default
      ...config,
    }),
    [config.method, config.cache, config.cacheTTL, config.headers, config.body],
  );

  // Generate cache key based on URL and relevant config
  const cacheKey = useMemo(() => {
    if (!url || !requestConfig.cache) return null;
    const keyData = {
      url,
      method: requestConfig.method,
      body: requestConfig.body,
      headers: requestConfig.headers,
    };
    return JSON.stringify(keyData);
  }, [url, requestConfig.method, requestConfig.body, requestConfig.headers, requestConfig.cache]);

  // Check if we have valid cached data
  const getCachedData = useCallback((): T | null => {
    if (!cacheKey) return null;

    const cached = globalCache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      globalCache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }, [cacheKey]);

  // Set cache data
  const setCachedData = useCallback(
    (newData: T) => {
      if (!cacheKey) return;

      globalCache.set(cacheKey, {
        data: newData,
        timestamp: Date.now(),
        ttl: requestConfig.cacheTTL,
      });
    },
    [cacheKey, requestConfig.cacheTTL],
  );

  // Perform the actual fetch
  const performFetch = useCallback(
    async (signal: AbortSignal): Promise<T> => {
      if (!url) throw new Error('URL is required');

      // ✅ استخدام النظام الموحد - الاعتماد على cookies فقط
      // تم إزالة adminToken القديم من localStorage
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...requestConfig.headers,
      };

      const fetchOptions: RequestInit = {
        method: requestConfig.method,
        headers,
        signal,
        credentials: 'include', // ✅ إرسال cookies (admin_session) تلقائياً
      };

      if (requestConfig.body && requestConfig.method !== 'GET') {
        fetchOptions.body =
          typeof requestConfig.body === 'string'
            ? requestConfig.body
            : JSON.stringify(requestConfig.body);
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Network Error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result;
    },
    [url, requestConfig],
  );

  // Main fetch function with caching and deduplication
  const fetchData = useCallback(
    async (force = false): Promise<void> => {
      if (!url) {
        setData(null);
        setLoading(false);
        setError(null);
        return;
      }

      // Check cache first (unless forced)
      if (!force && requestConfig.cache) {
        const cached = getCachedData();
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          setError(null);
          return;
        }
      }

      // Check if there's an ongoing request for the same cache key
      if (cacheKey && ongoingRequests.has(cacheKey)) {
        try {
          const result = await ongoingRequests.get(cacheKey);
          if (mountedRef.current) {
            setData(result);
            setError(null);
          }
          return;
        } catch (err) {
          if (mountedRef.current) {
            setError(err instanceof Error ? err.message : 'Unknown error');
          }
          return;
        }
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setLoading(true);
      setError(null);

      try {
        // Create and store the request promise for deduplication
        const requestPromise = performFetch(signal);
        if (cacheKey) {
          ongoingRequests.set(cacheKey, requestPromise);
        }

        const result = await requestPromise;

        // Clean up the ongoing request
        if (cacheKey) {
          ongoingRequests.delete(cacheKey);
        }

        if (mountedRef.current) {
          setData(result);
          setLoading(false);

          // Cache the result
          if (requestConfig.cache) {
            setCachedData(result);
          }
        }
      } catch (err) {
        // Clean up the ongoing request
        if (cacheKey) {
          ongoingRequests.delete(cacheKey);
        }

        if (mountedRef.current && !signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    },
    [url, requestConfig.cache, getCachedData, cacheKey, performFetch, setCachedData],
  );

  // Manual data mutation (for optimistic updates)
  const mutate = useCallback(
    (newData: T | null) => {
      setData(newData);
      if (newData && cacheKey && requestConfig.cache) {
        setCachedData(newData);
      }
    },
    [cacheKey, requestConfig.cache, setCachedData],
  );

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Effect to trigger fetch when dependencies change
  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [url, ...dependencies, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
  };
}

// Helper hook for admin API calls with automatic token handling
export function useAdminAPI<T = any>(endpoint: string | null, config: RequestConfig = {}) {
  const fullUrl = endpoint
    ? `/api/admin${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    : null;

  return useOptimizedAPI<T>(fullUrl, {
    cache: true,
    cacheTTL: 300000, // 5 minutes
    ...config,
  });
}

// Hook for mutations with optimistic updates
export function useOptimizedMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[];
  } = {},
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);

        // Invalidate specified cache entries
        if (options.invalidateQueries) {
          options.invalidateQueries.forEach((queryKey) => {
            // Remove cached entries that match the query pattern
            for (const [key] of globalCache.entries()) {
              if (key.includes(queryKey)) {
                globalCache.delete(key);
              }
            }
          });
        }

        options.onSuccess?.(result, variables);
        setLoading(false);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error.message);
        options.onError?.(error, variables);
        setLoading(false);
        return null;
      }
    },
    [mutationFn, options],
  );

  return {
    mutate,
    loading,
    error,
  };
}

export default useOptimizedAPI;
