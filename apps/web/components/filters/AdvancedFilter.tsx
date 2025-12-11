import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React, { useEffect, useRef, useState } from 'react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface AdvancedFilterProps {
  filters: {
    searchQuery: string;
    location: string;
    serviceType: string;
    priceRange: string;
    rating: string;
    availability: string;
    sortBy: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
  onResetFilters: () => void;
  totalResults: number;
  isLoading?: boolean;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  isLoading = false,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // بيانات الفلاتر
  const filterData = {
    locations: [
      { value: '', label: 'جميع المدن', count: totalResults },
      { value: 'طرابلس', label: 'طرابلس', count: 45 },
      { value: 'بنغازي', label: 'بنغازي', count: 32 },
      { value: 'مصراتة', label: 'مصراتة', count: 28 },
      { value: 'سبها', label: 'سبها', count: 15 },
      { value: 'الزاوية', label: 'الزاوية', count: 12 },
      { value: 'غريان', label: 'غريان', count: 8 },
      { value: 'زليتن', label: 'زليتن', count: 6 },
    ],
    serviceTypes: [
      { value: '', label: 'جميع الأنواع', count: totalResults },
      { value: 'ساحبة-صغيرة', label: 'ساحبة صغيرة (1-2 سيارات)', count: 25 },
      { value: 'ساحبة-متوسطة', label: 'ساحبة متوسطة (3-4 سيارات)', count: 35 },
      { value: 'ساحبة-كبيرة', label: 'ساحبة كبيرة (5-8 سيارات)', count: 20 },
      { value: 'نقل-فاخر', label: 'نقل فاخر ومغلق', count: 15 },
      { value: 'نقل-سريع', label: 'نقل سريع (24 ساعة)', count: 10 },
    ],
    priceRanges: [
      { value: '', label: 'جميع الأسعار', count: totalResults },
      { value: '0-50', label: 'أقل من 50 د.ل', count: 20 },
      { value: '50-100', label: '50 - 100 د.ل', count: 35 },
      { value: '100-200', label: '100 - 200 د.ل', count: 40 },
      { value: '200-500', label: '200 - 500 د.ل', count: 25 },
      { value: '500+', label: 'أكثر من 500 د.ل', count: 15 },
    ],
    ratings: [
      { value: '', label: 'جميع التقييمات', count: totalResults },
      {
        value: '5',
        label:
          '<StarIcon className="w-5 h-5 text-yellow-500" /><StarIcon className="w-5 h-5 text-yellow-500" /><StarIcon className="w-5 h-5 text-yellow-500" /><StarIcon className="w-5 h-5 text-yellow-500" /><StarIcon className="w-5 h-5 text-yellow-500" /> (5 نجوم)',
        count: 25,
      },
      {
        value: '4',
        label:
          '<StarIcon className="w-5 h-5 text-yellow-500" /><StarIcon className="w-5 h-5 text-yellow-500" /><StarIcon className="w-5 h-5 text-yellow-500" /><StarIcon className="w-5 h-5 text-yellow-500" /> (4+ نجوم)',
        count: 45,
      },
      {
        value: '3',
        label:
          '<StarIcon className="w-5 h-5 text-yellow-500" /><StarIcon className="w-5 h-5 text-yellow-500" /><StarIcon className="w-5 h-5 text-yellow-500" /> (3+ نجوم)',
        count: 65,
      },
      {
        value: '2',
        label:
          '<StarIcon className="w-5 h-5 text-yellow-500" /><StarIcon className="w-5 h-5 text-yellow-500" /> (2+ نجوم)',
        count: 80,
      },
    ],
    availability: [
      { value: '', label: 'جميع الحالات', count: totalResults },
      { value: 'متاح-الآن', label: 'متاح الآن', count: 45 },
      { value: 'متاح-اليوم', label: 'متاح اليوم', count: 65 },
      { value: 'متاح-غداً', label: 'متاح غداً', count: 80 },
      { value: 'حسب-الطلب', label: 'حسب الطلب', count: totalResults },
    ],
  };

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
  const activeFiltersCount = Object.values(filters).filter((value) => value !== '').length - 1; // -1 لاستبعاد sortBy

  // مكون القائمة المنسدلة
  const DropdownFilter = ({
    id,
    label,
    icon: Icon,
    options,
    value,
    placeholder = 'اختر...',
  }: {
    id: string;
    label: string;
    icon: any;
    options: FilterOption[];
    value: string;
    placeholder?: string;
  }) => {
    const isOpen = openDropdown === id;
    const searchTerm = searchTerms[id] || '';
    const filteredOptions = getFilteredOptions(options, searchTerm);
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div
        className="relative"
        ref={(el) => {
          if (el) dropdownRefs.current[id] = el;
        }}
      >
        <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700">
          <Icon className="h-4 w-4 text-blue-600" />
          {label}
        </label>

        <button
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-right transition-colors hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <span className={`truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
            {selectedOption ? selectedOption.label : placeholder}
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
                  placeholder={`ابحث في ${label}...`}
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerms((prev) => ({
                      ...prev,
                      [id]: e.target.value,
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
                      onFilterChange(id, option.value);
                      setOpenDropdown(null);
                      setSearchTerms((prev) => ({ ...prev, [id]: '' }));
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-right transition-colors hover:bg-blue-50 ${
                      value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
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

  return (
    <div className="sticky top-4 rounded-lg border bg-white p-4 shadow-sm">
      {/* رأس الفلتر */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <FunnelIcon className="h-5 w-5 text-blue-600" />
          الفلاتر المتقدمة
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {activeFiltersCount}
            </span>
          )}
        </h3>

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

      {/* البحث النصي */}
      <div className="mb-4">
        <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700">
          <MagnifyingGlassIcon className="h-4 w-4 text-blue-600" />
          البحث النصي
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="ابحث في الخدمات..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-9 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* الفلاتر */}
      <div className="space-y-4">
        <DropdownFilter
          id="location"
          label="المدينة"
          icon={MapPinIcon}
          options={filterData.locations}
          value={filters.location}
          placeholder="اختر المدينة"
        />

        <DropdownFilter
          id="serviceType"
          label="نوع الخدمة"
          icon={TruckIcon}
          options={filterData.serviceTypes}
          value={filters.serviceType}
          placeholder="اختر نوع الخدمة"
        />

        <DropdownFilter
          id="priceRange"
          label="نطاق السعر"
          icon={CurrencyDollarIcon}
          options={filterData.priceRanges}
          value={filters.priceRange}
          placeholder="اختر نطاق السعر"
        />

        <DropdownFilter
          id="rating"
          label="التقييم"
          icon={StarIcon}
          options={filterData.ratings}
          value={filters.rating}
          placeholder="اختر التقييم"
        />

        <DropdownFilter
          id="availability"
          label="التوفر"
          icon={ClockIcon}
          options={filterData.availability}
          value={filters.availability}
          placeholder="اختر حالة التوفر"
        />
      </div>

      {/* إحصائيات سريعة */}
      <div className="mt-4 border-t pt-4">
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>إجمالي النتائج:</span>
            <span className="font-medium text-gray-900">{totalResults}</span>
          </div>
          <div className="flex justify-between">
            <span>متاح الآن:</span>
            <span className="font-medium text-green-600">45</span>
          </div>
          <div className="flex justify-between">
            <span>أعلى تقييم:</span>
            <span className="font-medium text-yellow-600">25</span>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default AdvancedFilter;
