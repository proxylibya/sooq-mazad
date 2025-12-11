/**
 * مكون الفلاتر المتقدمة الموحد
 * نظام فلترة متكامل لجميع الجداول
 */
import {
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';
import {
  ActiveFilter,
  FilterDefinition,
  FilterOperator,
  createFilterInstance,
  defaultFilterDefinitions,
} from '../../lib/filters/unified-filter-system';

interface AdvancedFiltersProps {
  section: string;
  customFilters?: FilterDefinition[];
  onFiltersChange: (filters: ActiveFilter[], search: string) => void;
  showSearch?: boolean;
  showPresets?: boolean;
  compact?: boolean;
  className?: string;
}

export default function AdvancedFilters({
  section,
  customFilters,
  onFiltersChange,
  showSearch = true,
  showPresets = true,
  compact = false,
  className = '',
}: AdvancedFiltersProps) {
  const [filterInstance] = useState(() => createFilterInstance());
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

  // الحصول على تعريفات الفلاتر
  const filterDefinitions = customFilters || defaultFilterDefinitions[section] || [];

  // الاشتراك في التحديثات
  useEffect(() => {
    return filterInstance.subscribe((state) => {
      setFilters(state.filters);
      setSearch(state.search);
      onFiltersChange(state.filters, state.search);
    });
  }, [filterInstance, onFiltersChange]);

  // إضافة فلتر
  const addFilter = useCallback(
    (definition: FilterDefinition, value: any, operator: FilterOperator = 'equals') => {
      filterInstance.addFilter({
        id: definition.id,
        field: definition.field,
        operator,
        value,
      });
      setActiveFilterId(null);
    },
    [filterInstance],
  );

  // إزالة فلتر
  const removeFilter = useCallback(
    (filterId: string) => {
      filterInstance.removeFilter(filterId);
    },
    [filterInstance],
  );

  // مسح الكل
  const clearAll = useCallback(() => {
    filterInstance.clearFilters();
    setSearch('');
  }, [filterInstance]);

  // تحديث البحث
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      filterInstance.setSearch(value);
    },
    [filterInstance],
  );

  // عرض قيمة الفلتر
  const getFilterDisplayValue = (filter: ActiveFilter, definition: FilterDefinition) => {
    if (definition.options) {
      const option = definition.options.find((o) => o.value === filter.value);
      return option?.label || filter.value;
    }
    return filter.value;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* شريط البحث والفلاتر */}
      <div className="flex flex-wrap items-center gap-3">
        {/* البحث */}
        {showSearch && (
          <div className="relative min-w-[200px] flex-1">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="بحث..."
              className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-4 pr-10 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* أزرار الفلاتر السريعة */}
        <div className="flex flex-wrap gap-2">
          {filterDefinitions.slice(0, compact ? 2 : 4).map((definition) => (
            <div key={definition.id} className="relative">
              <button
                onClick={() =>
                  setActiveFilterId(activeFilterId === definition.id ? null : definition.id)
                }
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  filters.some((f) => f.id === definition.id)
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <FunnelIcon className="h-4 w-4" />
                <span>{definition.label}</span>
              </button>

              {/* قائمة الخيارات */}
              {activeFilterId === definition.id && definition.options && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-xl">
                  {definition.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => addFilter(definition, option.value)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-right text-sm text-slate-300 hover:bg-slate-700"
                    >
                      {option.color && (
                        <span className={`h-2 w-2 rounded-full bg-${option.color}-500`} />
                      )}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* زر الفلاتر المتقدمة */}
          {filterDefinitions.length > (compact ? 2 : 4) && (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-600"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              <span>المزيد</span>
            </button>
          )}
        </div>

        {/* زر مسح الكل */}
        {(filters.length > 0 || search) && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
          >
            <XMarkIcon className="h-4 w-4" />
            <span>مسح الكل</span>
          </button>
        )}
      </div>

      {/* الفلاتر المتقدمة */}
      {showAdvanced && (
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4 md:grid-cols-3 lg:grid-cols-4">
          {filterDefinitions.map((definition) => (
            <div key={definition.id}>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {definition.label}
              </label>
              {definition.type === 'select' && definition.options && (
                <select
                  value={filters.find((f) => f.id === definition.id)?.value || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      addFilter(definition, e.target.value);
                    } else {
                      removeFilter(definition.id);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">الكل</option>
                  {definition.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              {definition.type === 'number' && (
                <input
                  type="number"
                  value={filters.find((f) => f.id === definition.id)?.value || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      addFilter(definition, Number(e.target.value), 'greater_or_equal');
                    } else {
                      removeFilter(definition.id);
                    }
                  }}
                  min={definition.min}
                  max={definition.max}
                  placeholder={definition.placeholder || `أدخل ${definition.label}`}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              )}
              {definition.type === 'boolean' && (
                <select
                  value={
                    filters.find((f) => f.id === definition.id)?.value === true
                      ? 'true'
                      : filters.find((f) => f.id === definition.id)?.value === false
                        ? 'false'
                        : ''
                  }
                  onChange={(e) => {
                    if (e.target.value === 'true') {
                      addFilter(definition, true);
                    } else if (e.target.value === 'false') {
                      addFilter(definition, false);
                    } else {
                      removeFilter(definition.id);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">الكل</option>
                  <option value="true">نعم</option>
                  <option value="false">لا</option>
                </select>
              )}
              {definition.type === 'daterange' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    onChange={(e) => {
                      if (e.target.value) {
                        addFilter(definition, e.target.value, 'greater_or_equal');
                      }
                    }}
                  />
                  <CalendarIcon className="h-5 w-5 text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* الفلاتر النشطة */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const definition = filterDefinitions.find((d) => d.id === filter.id);
            if (!definition) return null;

            return (
              <span
                key={filter.id}
                className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400"
              >
                <span className="font-medium">{definition.label}:</span>
                <span>{getFilterDisplayValue(filter, definition)}</span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="rounded-full p-0.5 hover:bg-blue-500/20"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
