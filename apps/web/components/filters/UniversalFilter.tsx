import BookmarkIcon from '@heroicons/react/24/outline/BookmarkIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React, { useEffect, useRef, useState } from 'react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<any>;
}

interface FilterGroup {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  type: 'dropdown' | 'range' | 'checkbox' | 'radio' | 'search';
  options?: FilterOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
}

interface UniversalFilterProps {
  title: string;
  filters: { [key: string]: any };
  filterGroups: FilterGroup[];
  onFilterChange: (filterType: string, value: any) => void;
  onResetFilters: () => void;
  onSaveFilter?: (name: string, filters: any) => void;
  savedFilters?: { name: string; filters: any }[];
  totalResults: number;
  isLoading?: boolean;
  showStats?: boolean;
  stats?: { [key: string]: number };
}

const UniversalFilter: React.FC<UniversalFilterProps> = ({
  title,
  filters,
  filterGroups,
  onFilterChange,
  onResetFilters,
  onSaveFilter,
  savedFilters = [],
  totalResults,
  isLoading = false,
  showStats = true,
  stats = {},
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // إغلاق القوائم المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && dropdownRefs.current[openDropdown]) {
        if (!dropdownRefs.current[openDropdown]?.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // فلترة الخيارات حسب البحث
  const getFilteredOptions = (options: FilterOption[], searchTerm: string) => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  // عدد الفلاتر النشطة
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value !== '' && value !== 'الكل' && value !== 'جميع';
    if (typeof value === 'number') return value !== null && value !== undefined;
    return false;
  }).length;

  // حفظ الفلتر
  const handleSaveFilter = () => {
    if (filterName.trim() && onSaveFilter) {
      onSaveFilter(filterName.trim(), filters);
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  // تحميل فلتر محفوظ
  const loadSavedFilter = (savedFilter: any) => {
    Object.entries(savedFilter.filters).forEach(([key, value]) => {
      onFilterChange(key, value);
    });
  };

  // مكون القائمة المنسدلة
  const DropdownFilter = ({ group }: { group: FilterGroup }) => {
    const isOpen = openDropdown === group.id;
    const searchTerm = searchTerms[group.id] || '';
    const filteredOptions = getFilteredOptions(group.options || [], searchTerm);
    const value = filters[group.id];
    const selectedOption = group.options?.find((opt) => opt.value === value);

    return (
      <div
        className="relative"
        ref={(el) => {
          if (el) dropdownRefs.current[group.id] = el;
        }}
      >
        <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700">
          <group.icon className="h-4 w-4 text-blue-600" />
          {group.label}
        </label>

        <button
          onClick={() => setOpenDropdown(isOpen ? null : group.id)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-right transition-colors hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <span className={`truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
            {selectedOption ? selectedOption.label : group.placeholder || 'اختر...'}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg">
            {/* حقل البحث */}
            <div className="border-b p-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder={`ابحث في ${group.label}...`}
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerms((prev) => ({
                      ...prev,
                      [group.id]: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-gray-200 py-2 pl-3 pr-9 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* قائمة الخيارات */}
            <div className="max-h-80 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFilterChange(group.id, option.value);
                      setOpenDropdown(null);
                      setSearchTerms((prev) => ({ ...prev, [group.id]: '' }));
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-right transition-colors hover:bg-blue-50 ${
                      value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {option.icon && <option.icon className="h-4 w-4" />}
                      {option.label}
                    </span>
                    {option.count !== undefined && (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                        {option.count}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-center text-sm text-gray-500">لا توجد نتائج</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // مكون النطاق
  const RangeFilter = ({ group }: { group: FilterGroup }) => {
    const minValue = filters[`${group.id}Min`] || '';
    const maxValue = filters[`${group.id}Max`] || '';

    return (
      <div>
        <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700">
          <group.icon className="h-4 w-4 text-blue-600" />
          {group.label}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={`الحد الأدنى`}
            value={minValue}
            min={group.min}
            max={group.max}
            step={group.step}
            onChange={(e) =>
              onFilterChange(`${group.id}Min`, e.target.value ? parseInt(e.target.value) : null)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder={`الحد الأعلى`}
            value={maxValue}
            min={group.min}
            max={group.max}
            step={group.step}
            onChange={(e) =>
              onFilterChange(`${group.id}Max`, e.target.value ? parseInt(e.target.value) : null)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  };

  // مكون البحث
  const SearchFilter = ({ group }: { group: FilterGroup }) => {
    return (
      <div>
        <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700">
          <group.icon className="h-4 w-4 text-blue-600" />
          {group.label}
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder={group.placeholder || 'ابحث...'}
            value={filters[group.id] || ''}
            onChange={(e) => onFilterChange(group.id, e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-9 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  };

  // مكون الخانات
  const CheckboxFilter = ({ group }: { group: FilterGroup }) => {
    const selectedValues = filters[group.id] || [];

    return (
      <div>
        <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700">
          <group.icon className="h-4 w-4 text-blue-600" />
          {group.label}
        </label>
        <div className="max-h-40 space-y-2 overflow-y-auto">
          {group.options?.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={(e) => {
                  const newValues = e.target.checked
                    ? [...selectedValues, option.value]
                    : selectedValues.filter((v: string) => v !== option.value);
                  onFilterChange(group.id, newValues);
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-2 text-sm text-gray-700">
                {option.icon && <option.icon className="h-4 w-4" />}
                {option.label}
                {option.count !== undefined && (
                  <span className="text-xs text-gray-500">({option.count})</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // رندر مجموعة الفلتر
  const renderFilterGroup = (group: FilterGroup) => {
    switch (group.type) {
      case 'dropdown':
        return <DropdownFilter group={group} />;
      case 'range':
        return <RangeFilter group={group} />;
      case 'search':
        return <SearchFilter group={group} />;
      case 'checkbox':
        return <CheckboxFilter group={group} />;
      default:
        return null;
    }
  };

  return (
    <div className="sticky top-4 rounded-lg border bg-white p-4 shadow-sm">
      {/* رأس الفلتر */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <FunnelIcon className="h-5 w-5 text-blue-600" />
          {title}
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {activeFiltersCount}
            </span>
          )}
        </h3>

        <div className="flex items-center gap-2">
          {/* حفظ الفلتر */}
          {onSaveFilter && activeFiltersCount > 0 && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <BookmarkIcon className="h-4 w-4" />
              حفظ
            </button>
          )}

          {/* إعادة تعيين */}
          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <XMarkIcon className="h-4 w-4" />
              مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* الفلاتر المحفوظة */}
      {savedFilters.length > 0 && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">الفلاتر المحفوظة</label>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((savedFilter, index) => (
              <button
                key={index}
                onClick={() => loadSavedFilter(savedFilter)}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200"
              >
                {savedFilter.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* مجموعات الفلاتر */}
      <div className="space-y-4">
        {filterGroups.map((group) => (
          <div key={group.id}>{renderFilterGroup(group)}</div>
        ))}
      </div>

      {/* الإحصائيات */}
      {showStats && (
        <div className="mt-4 border-t pt-4">
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>إجمالي النتائج:</span>
              <span className="font-medium text-gray-900">{totalResults}</span>
            </div>
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span className="font-medium text-blue-600">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* حالة التحميل */}
      {isLoading && (
        <div className="mt-4 flex items-center justify-center py-2">
          <div
            className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
            style={{ width: 24, height: 24 }}
            role="status"
            aria-label="جاري التحميل"
          />
          <span className="mr-2 text-sm text-gray-600">جاري التحديث...</span>
        </div>
      )}

      {/* نافذة حفظ الفلتر */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
            <h4 className="mb-3 text-lg font-bold text-gray-900">حفظ الفلتر</h4>
            <input
              type="text"
              placeholder="اسم الفلتر"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveFilter}
                disabled={!filterName.trim()}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalFilter;
