// @ts-nocheck
/**
 * ============================================
 * 📦 Unified Search/Filter/Pagination System Exports
 * ملف التصدير الموحد
 * ============================================
 */

// Main engine
export {
    FILTER_OPTIONS,
    // Constants
    FILTER_PRESETS, UnifiedSearchEngine,
    getSearchEngine, type FilterCondition,
    type FilterGroup, type FilterOperator, type FilterPreset, type PaginatedResponse, type PaginationConfig, type PaginationType, type SearchOptions,
    type SearchResult,
    // Types
    type SearchableEntity, type SortConfig, type SortOrder
} from './index';

// Pagination engine
export {
    UnifiedPaginationEngine,
    getPaginationEngine, paginateCursor, paginateOffset, type CursorPaginationParams,
    type KeysetPaginationParams, type OffsetPaginationParams, type PaginatedResult, type PaginationMeta, type PaginationParams,
    // Types
    type PaginationStrategy
} from './pagination-engine';

// Hooks
export {
    useInfiniteScroll, usePagination, useUnifiedSearch,
    // Types
    type UseUnifiedSearchOptions,
    type UseUnifiedSearchReturn
} from './hooks/useUnifiedSearch';

// Components
export {
    UnifiedPagination, UnifiedSearchFilter, type FilterFieldConfig,
    type UnifiedPaginationProps,
    // Types
    type UnifiedSearchFilterProps
} from './components/UnifiedSearchFilter';

