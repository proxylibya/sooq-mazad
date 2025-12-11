// @ts-nocheck
/**
 * ============================================
 * 🎨 UnifiedSearchFilter Component
 * مكون البحث والفلترة الموحد
 * ============================================
 */

'use client';

import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useMemo, useState } from 'react';
import { useUnifiedSearch } from '../hooks/useUnifiedSearch';
import { FILTER_OPTIONS, FilterCondition, SearchableEntity } from '../index';

// ============================================
// TYPES
// ============================================

export interface UnifiedSearchFilterProps {
  /** Entity types to search */
  entities?: SearchableEntity[];
  /** Placeholder text */
  placeholder?: string;
  /** Show filters panel */
  showFilters?: boolean;
  /** Show sort options */
  showSort?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Custom class names */
  className?: string;
  /** Filter panel position */
  filterPosition?: 'sidebar' | 'dropdown' | 'inline';
  /** On search callback */
  onSearch?: (query: string, filters: FilterCondition[]) => void;
  /** On results callback */
  onResults?: (results: any[]) => void;
  /** Custom filter fields */
  filterFields?: FilterFieldConfig[];
  /** API endpoint */
  apiEndpoint?: string;
  /** Initial query */
  initialQuery?: string;
  /** Auto focus */
  autoFocus?: boolean;
}

export interface FilterFieldConfig {
  field: string;
  label: string;
  type: 'select' | 'range' | 'checkbox' | 'radio' | 'text';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
}

// ============================================
// DEFAULT FILTER FIELDS
// ============================================

const DEFAULT_CAR_FILTERS: FilterFieldConfig[] = [
  {
    field: 'brand',
    label: 'الماركة',
    type: 'select',
    options: FILTER_OPTIONS.brands,
  },
  {
    field: 'location',
    label: 'المدينة',
    type: 'select',
    options: FILTER_OPTIONS.cities,
  },
  {
    field: 'bodyType',
    label: 'نوع الهيكل',
    type: 'select',
    options: FILTER_OPTIONS.bodyTypes,
  },
  {
    field: 'fuelType',
    label: 'نوع الوقود',
    type: 'select',
    options: FILTER_OPTIONS.fuelTypes,
  },
  {
    field: 'transmission',
    label: 'ناقل الحركة',
    type: 'select',
    options: FILTER_OPTIONS.transmissions,
  },
  {
    field: 'condition',
    label: 'الحالة',
    type: 'select',
    options: FILTER_OPTIONS.conditions,
  },
  {
    field: 'price',
    label: 'السعر',
    type: 'range',
    min: 0,
    max: 1000000,
    step: 10000,
  },
  {
    field: 'year',
    label: 'سنة الصنع',
    type: 'select',
    options: FILTER_OPTIONS.yearRanges,
  },
];

const SORT_OPTIONS = [
  { value: 'relevance-desc', label: 'الأكثر صلة', field: 'relevance', order: 'desc' as const },
  { value: 'createdAt-desc', label: 'الأحدث', field: 'createdAt', order: 'desc' as const },
  { value: 'createdAt-asc', label: 'الأقدم', field: 'createdAt', order: 'asc' as const },
  { value: 'price-asc', label: 'السعر: من الأقل', field: 'price', order: 'asc' as const },
  { value: 'price-desc', label: 'السعر: من الأعلى', field: 'price', order: 'desc' as const },
  { value: 'views-desc', label: 'الأكثر مشاهدة', field: 'views', order: 'desc' as const },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function UnifiedSearchFilter({
  entities = ['car', 'auction'],
  placeholder = 'ابحث عن سيارات، مزادات، معارض...',
  showFilters = true,
  showSort = true,
  compact = false,
  className = '',
  filterPosition = 'dropdown',
  onSearch,
  onResults,
  filterFields = DEFAULT_CAR_FILTERS,
  apiEndpoint = '/api/search',
  initialQuery = '',
  autoFocus = false,
}: UnifiedSearchFilterProps) {
  // Local state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [selectedSort, setSelectedSort] = useState('relevance-desc');

  // Use unified search hook
  const {
    query,
    setQuery,
    results,
    filters,
    setFilters,
    clearFilters,
    setSort,
    pagination,
    aggregations,
    isLoading,
    isSearching,
    hasActiveFilters,
    hasResults,
    isEmpty,
    goToPage,
  } = useUnifiedSearch({
    entities,
    apiEndpoint,
    initialQuery,
    syncUrl: true,
  });

  // Handle search input
  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onSearch?.(value, filters);
    },
    [setQuery, filters, onSearch],
  );

  // Handle filter change
  const handleFilterChange = useCallback((field: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    const newFilters: FilterCondition[] = [];

    Object.entries(localFilters).forEach(([field, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value) && value.length === 2 && field.includes('price')) {
          // Range filter
          newFilters.push({ field, operator: 'between', value });
        } else if (Array.isArray(value)) {
          // Multiple select
          newFilters.push({ field, operator: 'in', value });
        } else {
          // Single value
          newFilters.push({ field, operator: 'equals', value });
        }
      }
    });

    setFilters(newFilters);
    setIsFiltersOpen(false);
    onSearch?.(query, newFilters);
  }, [localFilters, setFilters, query, onSearch]);

  // Handle sort change
  const handleSortChange = useCallback(
    (value: string) => {
      setSelectedSort(value);
      const sortOption = SORT_OPTIONS.find((o) => o.value === value);
      if (sortOption) {
        setSort([{ field: sortOption.field, order: sortOption.order }]);
      }
    },
    [setSort],
  );

  // Clear all
  const handleClearAll = useCallback(() => {
    setLocalFilters({});
    clearFilters();
    setQuery('');
  }, [clearFilters, setQuery]);

  // Notify results
  React.useEffect(() => {
    if (results.length > 0) {
      onResults?.(results);
    }
  }, [results, onResults]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(localFilters).filter((v) => v !== undefined && v !== '' && v !== null)
      .length;
  }, [localFilters]);

  return (
    <div className={`unified-search-filter ${className}`} dir="rtl">
      {/* Search Bar */}
      <div className={`relative ${compact ? 'mb-2' : 'mb-4'}`}>
        <div className="relative flex items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={handleSearchInput}
              placeholder={placeholder}
              autoFocus={autoFocus}
              className={`w-full rounded-lg border border-gray-300 bg-white pr-12 text-right transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                compact ? 'px-4 py-2 text-sm' : 'px-4 py-3'
              }`}
            />

            {/* Search Icon */}
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {isSearching ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5" />
              )}
            </button>

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          {showFilters && (
            <button
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`mr-2 flex items-center gap-2 rounded-lg border transition-colors ${
                isFiltersOpen || hasActiveFilters
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              } ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
            >
              <FunnelIcon className="h-5 w-5" />
              {!compact && <span>الفلاتر</span>}
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
              {isFiltersOpen ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Filters Panel - Dropdown */}
        {showFilters && isFiltersOpen && filterPosition === 'dropdown' && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <FiltersPanel
              fields={filterFields}
              values={localFilters}
              onChange={handleFilterChange}
              onApply={applyFilters}
              onClear={() => setLocalFilters({})}
              compact={compact}
            />
          </div>
        )}
      </div>

      {/* Sort & Results Info Bar */}
      {(showSort || hasResults) && (
        <div className="mb-4 flex items-center justify-between">
          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {isLoading
              ? 'جاري البحث...'
              : pagination?.total
                ? `${pagination.total} نتيجة`
                : isEmpty
                  ? 'لا توجد نتائج'
                  : null}
          </div>

          {/* Sort Dropdown */}
          {showSort && (
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-500" />
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">الفلاتر النشطة:</span>
          {filters.map((filter, index) => (
            <span
              key={index}
              className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
            >
              {filter.field}: {String(filter.value)}
              <button
                onClick={() => {
                  const newFilters = filters.filter((_, i) => i !== index);
                  setFilters(newFilters);
                  const newLocal = { ...localFilters };
                  delete newLocal[filter.field];
                  setLocalFilters(newLocal);
                }}
                className="mr-1 rounded-full p-0.5 hover:bg-blue-200"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button onClick={handleClearAll} className="text-sm text-blue-600 hover:text-blue-800">
            مسح الكل
          </button>
        </div>
      )}

      {/* Aggregations */}
      {aggregations?.byType && Object.keys(aggregations.byType).length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(aggregations.byType).map(([type, count]) => (
            <span key={type} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
              {type === 'car'
                ? 'سيارات'
                : type === 'auction'
                  ? 'مزادات'
                  : type === 'showroom'
                    ? 'معارض'
                    : type === 'transport'
                      ? 'نقل'
                      : type}
              : {count}
            </span>
          ))}
        </div>
      )}

      {/* Inline Filters */}
      {showFilters && filterPosition === 'inline' && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <FiltersPanel
            fields={filterFields}
            values={localFilters}
            onChange={handleFilterChange}
            onApply={applyFilters}
            onClear={() => setLocalFilters({})}
            compact={compact}
            inline
          />
        </div>
      )}
    </div>
  );
}

// ============================================
// FILTERS PANEL COMPONENT
// ============================================

interface FiltersPanelProps {
  fields: FilterFieldConfig[];
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onApply: () => void;
  onClear: () => void;
  compact?: boolean;
  inline?: boolean;
}

function FiltersPanel({
  fields,
  values,
  onChange,
  onApply,
  onClear,
  compact = false,
  inline = false,
}: FiltersPanelProps) {
  return (
    <div className={inline ? '' : 'space-y-4'}>
      <div
        className={`grid gap-4 ${inline ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}
      >
        {fields.map((field) => (
          <FilterField
            key={field.field}
            config={field}
            value={values[field.field]}
            onChange={(value) => onChange(field.field, value)}
            compact={compact}
          />
        ))}
      </div>

      {/* Actions */}
      <div
        className={`flex items-center gap-3 ${inline ? 'mt-4' : 'border-t border-gray-200 pt-4'}`}
      >
        <button
          type="button"
          onClick={onApply}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 md:flex-none"
        >
          تطبيق الفلاتر
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          مسح
        </button>
      </div>
    </div>
  );
}

// ============================================
// SINGLE FILTER FIELD COMPONENT
// ============================================

interface FilterFieldProps {
  config: FilterFieldConfig;
  value: any;
  onChange: (value: any) => void;
  compact?: boolean;
}

function FilterField({ config, value, onChange, compact = false }: FilterFieldProps) {
  const { field, label, type, options, min, max, step } = config;

  switch (type) {
    case 'select':
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className={`w-full rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:outline-none ${
              compact ? 'px-2 py-1.5 text-sm' : 'px-3 py-2'
            }`}
          >
            <option value="">الكل</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'range':
      const rangeValue = value || [min || 0, max || 100];
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={rangeValue[0]}
              onChange={(e) => onChange([parseInt(e.target.value) || min, rangeValue[1]])}
              placeholder="من"
              min={min}
              max={max}
              step={step}
              className={`w-full rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:outline-none ${
                compact ? 'px-2 py-1.5 text-sm' : 'px-3 py-2'
              }`}
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={rangeValue[1]}
              onChange={(e) => onChange([rangeValue[0], parseInt(e.target.value) || max])}
              placeholder="إلى"
              min={min}
              max={max}
              step={step}
              className={`w-full rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:outline-none ${
                compact ? 'px-2 py-1.5 text-sm' : 'px-3 py-2'
              }`}
            />
          </div>
        </div>
      );

    case 'checkbox':
      return (
        <div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </label>
        </div>
      );

    case 'text':
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className={`w-full rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:outline-none ${
              compact ? 'px-2 py-1.5 text-sm' : 'px-3 py-2'
            }`}
          />
        </div>
      );

    default:
      return null;
  }
}

// ============================================
// PAGINATION COMPONENT
// ============================================

export interface UnifiedPaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UnifiedPagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 7,
  size = 'md',
  className = '',
}: UnifiedPaginationProps) {
  // Calculate visible page numbers
  const pages = useMemo(() => {
    const result: (number | 'ellipsis')[] = [];

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else {
      result.push(1);

      const half = Math.floor((maxVisiblePages - 4) / 2);
      let start = Math.max(2, currentPage - half);
      let end = Math.min(totalPages - 1, currentPage + half);

      if (currentPage <= half + 2) {
        end = maxVisiblePages - 2;
      } else if (currentPage >= totalPages - half - 1) {
        start = totalPages - maxVisiblePages + 3;
      }

      if (start > 2) result.push('ellipsis');
      for (let i = start; i <= end; i++) result.push(i);
      if (end < totalPages - 1) result.push('ellipsis');

      result.push(totalPages);
    }

    return result;
  }, [currentPage, totalPages, maxVisiblePages]);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  const buttonClass = sizeClasses[size];

  if (totalPages <= 1) return null;

  return (
    <nav className={`flex items-center justify-center gap-1 ${className}`} dir="rtl">
      {/* Previous Button */}
      <button
        onClick={() => hasPrev && onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className={`rounded-lg border transition-colors ${buttonClass} ${
          hasPrev
            ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
        }`}
      >
        التالي
      </button>

      {/* Page Numbers */}
      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {pages.map((page, index) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`rounded-lg border transition-colors ${buttonClass} ${
                  page === currentPage
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={() => hasNext && onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className={`rounded-lg border transition-colors ${buttonClass} ${
          hasNext
            ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
        }`}
      >
        السابق
      </button>
    </nav>
  );
}

// ============================================
// EXPORTS
// ============================================

export default UnifiedSearchFilter;
