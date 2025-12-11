// @ts-nocheck
/**
 * Legacy Compatibility Wrapper
 * طبقة التوافق مع الكود القديم
 * 
 * هذا الملف يوفر توافقية مع الـ imports القديمة
 */

// Re-export from unified system
export { 
  useUnifiedSearch as useSearch,
  usePagination,
  useInfiniteScroll
} from '@/lib/search-filter-system/hooks/useUnifiedSearch';

export {
  UnifiedSearchFilter as SearchFilters,
  UnifiedPagination as Pagination
} from '@/lib/search-filter-system/components/UnifiedSearchFilter';

export {
  UnifiedSearchEngine,
  getSearchEngine,
  FILTER_OPTIONS,
  FILTER_PRESETS
} from '@/lib/search-filter-system';

export {
  UnifiedPaginationEngine,
  getPaginationEngine,
  paginateOffset,
  paginateCursor
} from '@/lib/search-filter-system/pagination-engine';

// Legacy type aliases
export type { 
  FilterCondition,
  SortConfig,
  SearchOptions,
  SearchResult,
  PaginatedResponse
} from '@/lib/search-filter-system';
