// @ts-nocheck
/**
 * ============================================
 * 🎣 useUnifiedSearch Hook
 * Hook موحد للبحث والفلترة والـ Pagination
 * ============================================
 */

import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    FILTER_OPTIONS,
    FilterCondition,
    PaginatedResponse,
    SearchResult,
    SearchableEntity,
    SortConfig
} from '../index';

// ============================================
// TYPES
// ============================================

export interface UseUnifiedSearchOptions {
    /** Initial search query */
    initialQuery?: string;
    /** Entity types to search */
    entities?: SearchableEntity[];
    /** Initial filters */
    initialFilters?: FilterCondition[];
    /** Initial sort config */
    initialSort?: SortConfig[];
    /** Items per page */
    pageSize?: number;
    /** Debounce delay in ms */
    debounceMs?: number;
    /** Auto-search on mount */
    autoSearch?: boolean;
    /** Sync state with URL */
    syncUrl?: boolean;
    /** URL parameter prefix */
    urlPrefix?: string;
    /** Cache results */
    cacheResults?: boolean;
    /** Cache TTL in ms */
    cacheTtl?: number;
    /** Minimum query length */
    minQueryLength?: number;
    /** API endpoint */
    apiEndpoint?: string;
}

export interface UseUnifiedSearchReturn<T = any> {
    // State
    query: string;
    results: SearchResult<T>[];
    filters: FilterCondition[];
    sort: SortConfig[];
    pagination: PaginatedResponse<T>['pagination'] | null;
    aggregations: PaginatedResponse<T>['aggregations'] | null;

    // Loading & Error
    isLoading: boolean;
    isSearching: boolean;
    error: Error | null;

    // Actions
    setQuery: (query: string) => void;
    search: (query?: string) => Promise<void>;
    setFilters: (filters: FilterCondition[]) => void;
    addFilter: (filter: FilterCondition) => void;
    removeFilter: (field: string) => void;
    clearFilters: () => void;
    setSort: (sort: SortConfig[]) => void;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    reset: () => void;
    refresh: () => void;

    // Helpers
    hasActiveFilters: boolean;
    hasResults: boolean;
    isEmpty: boolean;
    filterOptions: typeof FILTER_OPTIONS;
}

// ============================================
// CACHE
// ============================================

const searchCache = new Map<string, { data: any; timestamp: number; }>();

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useUnifiedSearch<T = any>(
    options: UseUnifiedSearchOptions = {}
): UseUnifiedSearchReturn<T> {
    const {
        initialQuery = '',
        entities = ['car', 'auction', 'showroom', 'transport'],
        initialFilters = [],
        initialSort = [{ field: 'relevance', order: 'desc' }],
        pageSize = 20,
        debounceMs = 300,
        autoSearch = false,
        syncUrl = true,
        urlPrefix = '',
        cacheResults = true,
        cacheTtl = 5 * 60 * 1000,
        minQueryLength = 2,
        apiEndpoint = '/api/search'
    } = options;

    const router = useRouter();
    const abortControllerRef = useRef<AbortController | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    // State
    const [query, setQueryState] = useState(initialQuery);
    const [results, setResults] = useState<SearchResult<T>[]>([]);
    const [filters, setFiltersState] = useState<FilterCondition[]>(initialFilters);
    const [sort, setSortState] = useState<SortConfig[]>(initialSort);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<PaginatedResponse<T>['pagination'] | null>(null);
    const [aggregations, setAggregations] = useState<PaginatedResponse<T>['aggregations'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Initialize from URL
    useEffect(() => {
        if (syncUrl && router.isReady) {
            const urlQuery = router.query[`${urlPrefix}q`] as string;
            const urlPage = parseInt(router.query[`${urlPrefix}page`] as string) || 1;

            if (urlQuery) {
                setQueryState(urlQuery);
                setPage(urlPage);
            }

            // Parse filters from URL
            const urlFilters: FilterCondition[] = [];
            Object.entries(router.query).forEach(([key, value]) => {
                if (key.startsWith(`${urlPrefix}filter_`) && value) {
                    const field = key.replace(`${urlPrefix}filter_`, '');
                    urlFilters.push({
                        field,
                        operator: 'equals',
                        value: value as string
                    });
                }
            });
            if (urlFilters.length > 0) {
                setFiltersState(urlFilters);
            }
        }
    }, [router.isReady, syncUrl, urlPrefix]);

    // Sync to URL
    const updateUrl = useCallback((newQuery: string, newPage: number, newFilters: FilterCondition[]) => {
        if (!syncUrl) return;

        const urlParams: Record<string, string> = {};

        if (newQuery) {
            urlParams[`${urlPrefix}q`] = newQuery;
        }
        if (newPage > 1) {
            urlParams[`${urlPrefix}page`] = newPage.toString();
        }
        newFilters.forEach(f => {
            urlParams[`${urlPrefix}filter_${f.field}`] = String(f.value);
        });

        const newUrl = {
            pathname: router.pathname,
            query: { ...router.query, ...urlParams }
        };

        // Clean up undefined params
        Object.keys(newUrl.query).forEach(key => {
            if (key.startsWith(urlPrefix) && !urlParams[key]) {
                delete newUrl.query[key];
            }
        });

        router.push(newUrl, undefined, { shallow: true });
    }, [syncUrl, urlPrefix, router]);

    // Search function
    const performSearch = useCallback(async (searchQuery: string, currentPage: number) => {
        if (searchQuery.length > 0 && searchQuery.length < minQueryLength) {
            return;
        }

        // Check cache
        const cacheKey = JSON.stringify({ searchQuery, filters, sort, page: currentPage, entities });
        if (cacheResults) {
            const cached = searchCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < cacheTtl) {
                setResults(cached.data.results);
                setPagination(cached.data.pagination);
                setAggregations(cached.data.aggregations);
                return;
            }
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsSearching(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                q: searchQuery,
                type: entities.join(','),
                page: currentPage.toString(),
                limit: pageSize.toString()
            });

            // Add filters to params
            filters.forEach(f => {
                params.append(`filter_${f.field}`, String(f.value));
            });

            // Add sort to params
            if (sort.length > 0) {
                params.append('sortBy', sort[0].field);
                params.append('sortOrder', sort[0].order);
            }

            const response = await fetch(`${apiEndpoint}?${params}`, {
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }

            const data = await response.json();

            if (!isMountedRef.current) return;

            if (data.success) {
                setResults(data.data?.results || data.results || []);
                setPagination(data.data?.pagination || data.pagination || null);
                setAggregations(data.data?.aggregations || data.aggregations || null);

                // Cache result
                if (cacheResults) {
                    searchCache.set(cacheKey, {
                        data: {
                            results: data.data?.results || data.results || [],
                            pagination: data.data?.pagination || data.pagination,
                            aggregations: data.data?.aggregations || data.aggregations
                        },
                        timestamp: Date.now()
                    });
                }
            } else {
                throw new Error(data.error || 'Search failed');
            }
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            if (!isMountedRef.current) return;

            setError(err);
            console.error('[useUnifiedSearch] Error:', err);
        } finally {
            if (isMountedRef.current) {
                setIsSearching(false);
                setIsLoading(false);
            }
        }
    }, [filters, sort, entities, pageSize, minQueryLength, cacheResults, cacheTtl, apiEndpoint]);

    // Debounced search
    const debouncedSearch = useCallback((searchQuery: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        setIsLoading(true);

        debounceTimerRef.current = setTimeout(() => {
            performSearch(searchQuery, 1);
            setPage(1);
            updateUrl(searchQuery, 1, filters);
        }, debounceMs);
    }, [performSearch, debounceMs, filters, updateUrl]);

    // Set query with debounce
    const setQuery = useCallback((newQuery: string) => {
        setQueryState(newQuery);
        debouncedSearch(newQuery);
    }, [debouncedSearch]);

    // Immediate search
    const search = useCallback(async (searchQuery?: string) => {
        const q = searchQuery ?? query;
        setIsLoading(true);
        await performSearch(q, 1);
        setPage(1);
        updateUrl(q, 1, filters);
    }, [query, performSearch, filters, updateUrl]);

    // Filter management
    const setFilters = useCallback((newFilters: FilterCondition[]) => {
        setFiltersState(newFilters);
        setPage(1);
        performSearch(query, 1);
        updateUrl(query, 1, newFilters);
    }, [query, performSearch, updateUrl]);

    const addFilter = useCallback((filter: FilterCondition) => {
        const newFilters = [...filters.filter(f => f.field !== filter.field), filter];
        setFilters(newFilters);
    }, [filters, setFilters]);

    const removeFilter = useCallback((field: string) => {
        const newFilters = filters.filter(f => f.field !== field);
        setFilters(newFilters);
    }, [filters, setFilters]);

    const clearFilters = useCallback(() => {
        setFilters([]);
    }, [setFilters]);

    // Sort management
    const setSort = useCallback((newSort: SortConfig[]) => {
        setSortState(newSort);
        setPage(1);
        performSearch(query, 1);
    }, [query, performSearch]);

    // Pagination
    const goToPage = useCallback((newPage: number) => {
        if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
            setPage(newPage);
            performSearch(query, newPage);
            updateUrl(query, newPage, filters);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [pagination, query, performSearch, filters, updateUrl]);

    const nextPage = useCallback(() => {
        if (pagination?.hasNext) {
            goToPage(page + 1);
        }
    }, [pagination, page, goToPage]);

    const prevPage = useCallback(() => {
        if (pagination?.hasPrev) {
            goToPage(page - 1);
        }
    }, [pagination, page, goToPage]);

    // Reset
    const reset = useCallback(() => {
        setQueryState('');
        setFiltersState(initialFilters);
        setSortState(initialSort);
        setPage(1);
        setResults([]);
        setPagination(null);
        setAggregations(null);
        setError(null);

        if (syncUrl) {
            // Clean URL
            const newQuery = { ...router.query };
            Object.keys(newQuery).forEach(key => {
                if (key.startsWith(urlPrefix)) {
                    delete newQuery[key];
                }
            });
            router.push({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
        }
    }, [initialFilters, initialSort, syncUrl, router, urlPrefix]);

    // Refresh
    const refresh = useCallback(() => {
        // Clear cache for current query
        searchCache.clear();
        performSearch(query, page);
    }, [query, page, performSearch]);

    // Auto search on mount
    useEffect(() => {
        if (autoSearch || (router.isReady && router.query[`${urlPrefix}q`])) {
            const urlQuery = router.query[`${urlPrefix}q`] as string || query;
            if (urlQuery) {
                performSearch(urlQuery, 1);
            }
        }
    }, [autoSearch, router.isReady]);

    // Cleanup
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Computed values
    const hasActiveFilters = useMemo(() => filters.length > 0, [filters]);
    const hasResults = useMemo(() => results.length > 0, [results]);
    const isEmpty = useMemo(() => !isLoading && !isSearching && query.length >= minQueryLength && results.length === 0, [isLoading, isSearching, query, results, minQueryLength]);

    return {
        // State
        query,
        results,
        filters,
        sort,
        pagination,
        aggregations,

        // Loading & Error
        isLoading,
        isSearching,
        error,

        // Actions
        setQuery,
        search,
        setFilters,
        addFilter,
        removeFilter,
        clearFilters,
        setSort,
        goToPage,
        nextPage,
        prevPage,
        reset,
        refresh,

        // Helpers
        hasActiveFilters,
        hasResults,
        isEmpty,
        filterOptions: FILTER_OPTIONS
    };
}

// ============================================
// ADDITIONAL HOOKS
// ============================================

/**
 * Hook for paginated data fetching
 */
export function usePagination<T = any>(
    fetchFn: (page: number, limit: number) => Promise<{ data: T[]; total: number; }>,
    options: {
        initialPage?: number;
        pageSize?: number;
        autoFetch?: boolean;
    } = {}
) {
    const { initialPage = 1, pageSize = 20, autoFetch = true } = options;

    const [data, setData] = useState<T[]>([]);
    const [page, setPage] = useState(initialPage);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const fetch = useCallback(async (pageNum: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchFn(pageNum, pageSize);
            setData(result.data);
            setTotal(result.total);
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [fetchFn, pageSize]);

    const goToPage = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetch(newPage);
        }
    }, [totalPages, fetch]);

    const nextPage = useCallback(() => {
        if (hasNext) goToPage(page + 1);
    }, [hasNext, page, goToPage]);

    const prevPage = useCallback(() => {
        if (hasPrev) goToPage(page - 1);
    }, [hasPrev, page, goToPage]);

    const refresh = useCallback(() => {
        fetch(page);
    }, [fetch, page]);

    useEffect(() => {
        if (autoFetch) {
            fetch(initialPage);
        }
    }, []);

    return {
        data,
        page,
        total,
        totalPages,
        hasNext,
        hasPrev,
        isLoading,
        error,
        goToPage,
        nextPage,
        prevPage,
        refresh
    };
}

/**
 * Hook for infinite scroll
 */
export function useInfiniteScroll<T = any>(
    fetchFn: (cursor?: string) => Promise<{ data: T[]; nextCursor?: string; hasMore: boolean; }>,
    options: {
        autoFetch?: boolean;
        threshold?: number;
    } = {}
) {
    const { autoFetch = true, threshold = 200 } = options;

    const [data, setData] = useState<T[]>([]);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchFn(cursor);
            setData(prev => [...prev, ...result.data]);
            setCursor(result.nextCursor);
            setHasMore(result.hasMore);
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [fetchFn, cursor, isLoading, hasMore]);

    const reset = useCallback(() => {
        setData([]);
        setCursor(undefined);
        setHasMore(true);
        setError(null);
    }, []);

    // Intersection observer for infinite scroll
    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            { rootMargin: `${threshold}px` }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [loadMore, hasMore, isLoading, threshold]);

    useEffect(() => {
        if (autoFetch) {
            loadMore();
        }
    }, []);

    return {
        data,
        hasMore,
        isLoading,
        error,
        loadMore,
        reset,
        loadMoreRef
    };
}

// ============================================
// EXPORTS
// ============================================

export default useUnifiedSearch;
