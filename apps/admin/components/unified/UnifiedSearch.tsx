/**
 * 🔍 مكون البحث والفلترة الموحد
 * Unified Search & Filter Component
 */

import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { type FilterOption } from '../../lib/unified-admin-system';

// ================== Search Input ==================

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'بحث...',
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2.5 pl-4 pr-10 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ================== Filter Select ==================

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  label?: string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  label,
  className = '',
}: FilterSelectProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-sm text-slate-400">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ================== Unified Search Bar ==================

interface UnifiedSearchProps {
  /** قيمة البحث */
  searchValue: string;
  /** تغيير قيمة البحث */
  onSearchChange: (value: string) => void;
  /** نص placeholder للبحث */
  searchPlaceholder?: string;
  /** الفلاتر */
  filters?: {
    id: string;
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
  }[];
  /** زر التحديث */
  onRefresh?: () => void;
  /** Class إضافية */
  className?: string;
  /** محتوى إضافي على اليسار */
  leftContent?: React.ReactNode;
}

export default function UnifiedSearch({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'بحث...',
  filters = [],
  onRefresh,
  className = '',
  leftContent,
}: UnifiedSearchProps) {
  return (
    <div className={`rounded-xl border border-slate-700 bg-slate-800 p-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="min-w-[200px] flex-1"
        />

        {/* Filters */}
        {filters.length > 0 && (
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-slate-400" />
            {filters.map((filter) => (
              <FilterSelect
                key={filter.id}
                value={filter.value}
                onChange={filter.onChange}
                options={filter.options}
                label={filter.label}
              />
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded-lg bg-slate-700 p-2.5 text-slate-300 transition-colors hover:bg-slate-600"
            title="تحديث"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        )}

        {/* Left Content */}
        {leftContent}
      </div>
    </div>
  );
}

// ================== Hook: useSearchFilter ==================

interface UseSearchFilterOptions<T extends object> {
  data: T[];
  searchFields: (keyof T)[];
  initialFilters?: Record<string, string>;
}

interface UseSearchFilterReturn<T> {
  searchValue: string;
  setSearchValue: (value: string) => void;
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  filteredData: T[];
  resetFilters: () => void;
}

export function useSearchFilter<T extends object>({
  data,
  searchFields,
  initialFilters = {},
}: UseSearchFilterOptions<T>): UseSearchFilterReturn<T> {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchValue('');
    setFilters(initialFilters);
  }, [initialFilters]);

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // فلترة البحث
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const matchesSearch = searchFields.some((field) => {
          const value = item[field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
        if (!matchesSearch) return false;
      }

      // فلترة الفلاتر
      for (const [key, filterValue] of Object.entries(filters)) {
        if (filterValue && filterValue !== 'all') {
          if (item[key] !== filterValue) return false;
        }
      }

      return true;
    });
  }, [data, searchValue, searchFields, filters]);

  return {
    searchValue,
    setSearchValue,
    filters,
    setFilter,
    filteredData,
    resetFilters,
  };
}

// ================== Common Filter Options ==================

export const CommonFilters = {
  status: [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'ACTIVE', label: 'نشط' },
    { value: 'INACTIVE', label: 'غير نشط' },
    { value: 'PENDING', label: 'قيد المراجعة' },
    { value: 'BLOCKED', label: 'محظور' },
    { value: 'SUSPENDED', label: 'موقوف' },
  ],

  userStatus: [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'ACTIVE', label: 'نشط' },
    { value: 'BLOCKED', label: 'محظور' },
    { value: 'SUSPENDED', label: 'موقوف' },
  ],

  auctionStatus: [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'ACTIVE', label: 'نشط' },
    { value: 'LIVE', label: 'مباشر' },
    { value: 'UPCOMING', label: 'قادم' },
    { value: 'ENDED', label: 'منتهي' },
    { value: 'CANCELLED', label: 'ملغي' },
  ],

  listingStatus: [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'ACTIVE', label: 'نشط' },
    { value: 'PENDING', label: 'قيد المراجعة' },
    { value: 'SOLD', label: 'مباع' },
    { value: 'EXPIRED', label: 'منتهي' },
  ],

  boolean: [
    { value: 'all', label: 'الكل' },
    { value: 'true', label: 'نعم' },
    { value: 'false', label: 'لا' },
  ],
};
