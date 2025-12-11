import React, { memo, useState, useCallback } from 'react';
import {
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export interface FilterOptions {
  searchTerm: string;
  status: string[];
  priceRange: {
    min: string;
    max: string;
  };
  location: string;
  brand: string;
  model: string;
  yearRange: {
    min: string;
    max: string;
  };
  condition: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AuctionFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  auctionCount: number;
  isLoading?: boolean;
}

const FilterSection = memo<{
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}>(({ title, isOpen, onToggle, children }) => (
  <div className="border-b border-gray-200 pb-4">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-900 hover:text-blue-600"
    >
      {title}
      {isOpen ? (
        <ChevronUpIcon className="h-4 w-4" />
      ) : (
        <ChevronDownIcon className="h-4 w-4" />
      )}
    </button>
    {isOpen && <div className="mt-3">{children}</div>}
  </div>
));

FilterSection.displayName = 'FilterSection';

const AuctionFilters: React.FC<AuctionFiltersProps> = memo(({
  filters,
  onFilterChange,
  onClearFilters,
  auctionCount,
  isLoading = false,
}) => {
  const [openSections, setOpenSections] = useState({
    search: true,
    status: true,
    price: false,
    location: false,
    vehicle: false,
    condition: false,
  });

  const toggleSection = useCallback((section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const updateFilter = useCallback((key: keyof FilterOptions, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  }, [filters, onFilterChange]);

  const updateNestedFilter = useCallback((
    parent: 'priceRange' | 'yearRange',
    key: 'min' | 'max',
    value: string
  ) => {
    onFilterChange({
      ...filters,
      [parent]: { ...filters[parent], [key]: value }
    });
  }, [filters, onFilterChange]);

  const statusOptions = [
    { value: 'ACTIVE', label: 'نشط', color: 'bg-green-100 text-green-800' },
    { value: 'UPCOMING', label: 'قادم', color: 'bg-blue-100 text-blue-800' },
    { value: 'ENDED', label: 'انتهى', color: 'bg-gray-100 text-gray-800' },
  ];

  const conditionOptions = [
    { value: 'NEW', label: 'جديد' },
    { value: 'USED', label: 'مستعمل' },
    { value: 'EXCELLENT', label: 'ممتاز' },
    { value: 'GOOD', label: 'جيد' },
    { value: 'FAIR', label: 'مقبول' },
  ];

  const sortOptions = [
    { value: 'endTime', label: 'وقت الانتهاء' },
    { value: 'currentPrice', label: 'السعر الحالي' },
    { value: 'createdAt', label: 'تاريخ الإنشاء' },
    { value: 'bidsCount', label: 'عدد المزايدات' },
  ];

  const hasActiveFilters = () => {
    return (
      filters.searchTerm ||
      filters.status.length > 0 ||
      filters.priceRange.min ||
      filters.priceRange.max ||
      filters.location ||
      filters.brand ||
      filters.model ||
      filters.yearRange.min ||
      filters.yearRange.max ||
      filters.condition
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FunnelIcon className="h-5 w-5 text-gray-600 ml-2" />
          <h3 className="text-lg font-semibold text-gray-900">فلتر المزادات</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {isLoading ? '...' : `${auctionCount.toLocaleString()} نتيجة`}
          </span>
          {hasActiveFilters() && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <XMarkIcon className="h-4 w-4" />
              مسح الكل
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* البحث */}
        <FilterSection
          title="البحث"
          isOpen={openSections.search}
          onToggle={() => toggleSection('search')}
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث في المزادات..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </FilterSection>

        {/* حالة المزاد */}
        <FilterSection
          title="حالة المزاد"
          isOpen={openSections.status}
          onToggle={() => toggleSection('status')}
        >
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <label key={status.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status.value)}
                  onChange={(e) => {
                    const newStatus = e.target.checked
                      ? [...filters.status, status.value]
                      : filters.status.filter(s => s !== status.value);
                    updateFilter('status', newStatus);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`mr-2 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* النطاق السعري */}
        <FilterSection
          title="النطاق السعري"
          isOpen={openSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                أقل سعر (د.ل)
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  placeholder="0"
                  value={filters.priceRange.min}
                  onChange={(e) => updateNestedFilter('priceRange', 'min', e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                أعلى سعر (د.ل)
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  placeholder="∞"
                  value={filters.priceRange.max}
                  onChange={(e) => updateNestedFilter('priceRange', 'max', e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* الموقع */}
        <FilterSection
          title="الموقع"
          isOpen={openSections.location}
          onToggle={() => toggleSection('location')}
        >
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="اختر المدينة..."
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </FilterSection>

        {/* حالة السيارة */}
        <FilterSection
          title="حالة السيارة"
          isOpen={openSections.condition}
          onToggle={() => toggleSection('condition')}
        >
          <select
            value={filters.condition}
            onChange={(e) => updateFilter('condition', e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">جميع الحالات</option>
            {conditionOptions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </FilterSection>

        {/* الترتيب */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ترتيب حسب
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                الترتيب
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilter('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="desc">تنازلي</option>
                <option value="asc">تصاعدي</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AuctionFilters.displayName = 'AuctionFilters';

export default AuctionFilters;
