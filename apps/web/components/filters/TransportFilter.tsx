import React, { useState } from 'react';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import SelectField from '../ui/SelectField';

interface TransportFilterProps {
  filters: {
    searchQuery: string;
    location: string;
    serviceType: string;
    priceRange: string;
    rating: string;
    availability: string;
    verified: boolean;
    experience: string;
    capacity: string;
  };
  onFilterChange: (filterType: string, value: string | boolean) => void;
  onResetFilters: () => void;
  totalResults: number;
  onlineCount: number;
}

const TransportFilter: React.FC<TransportFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  onlineCount,
}) => {
  // عدد الفلاتر النشطة
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'verified') return value === true;
    return value !== '' && value !== false;
  }).length;

  return (
    <div className="sticky top-4 rounded-lg border bg-white p-4 shadow-sm">
      {/* رأس الفلتر */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <FunnelIcon className="h-5 w-5 text-blue-600" />
          فلاتر النقل
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
          البحث في خدمات النقل
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن ناقل أو نوع خدمة..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-9 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* فلتر الحسابات الموثقة */}
      <div className="mb-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(e) => onFilterChange('verified', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">الحسابات الموثقة فقط</span>
        </label>
      </div>

      {/* الفلاتر الأساسية */}
      <div className="space-y-4">
        {/* المدينة */}
        <div>
          <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPinIcon className="h-4 w-4 text-blue-600" />
            المدينة
          </label>
          <SelectField
            options={['جميع المدن', 'طرابلس', 'بنغازي', 'مصراتة', 'سبها', 'الزاوية']}
            value={filters.location || 'جميع المدن'}
            onChange={(value) => onFilterChange('location', value === 'جميع المدن' ? '' : value)}
            placeholder="اختر المدينة"
            size="sm"
            clearable={true}
            searchable={true}
          />
        </div>

        {/* نوع الساحبة */}
        <div>
          <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700">
            <TruckIcon className="h-4 w-4 text-blue-600" />
            نوع الساحبة
          </label>
          <select
            value={filters.serviceType}
            onChange={(e) => onFilterChange('serviceType', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الأنواع</option>
            <option value="ساحبة-فردية">ساحبة فردية</option>
            <option value="ساحبة-مزدوجة">ساحبة مزدوجة</option>
            <option value="ساحبة-متوسطة">ساحبة متوسطة</option>
            <option value="ساحبة-كبيرة">ساحبة كبيرة</option>
          </select>
        </div>

        {/* نطاق السعر */}
        <div>
          <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700">
            <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
            نطاق السعر (د.ل/كم)
          </label>
          <select
            value={filters.priceRange}
            onChange={(e) => onFilterChange('priceRange', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الأسعار</option>
            <option value="0-1">أقل من 1 د.ل/كم</option>
            <option value="1-2">1 - 2 د.ل/كم</option>
            <option value="2-3">2 - 3 د.ل/كم</option>
            <option value="3-5">3 - 5 د.ل/كم</option>
            <option value="5+">أكثر من 5 د.ل/كم</option>
          </select>
        </div>

        {/* التقييم */}
        <div>
          <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700">
            <StarIcon className="h-4 w-4 text-blue-600" />
            التقييم
          </label>
          <select
            value={filters.rating}
            onChange={(e) => onFilterChange('rating', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع التقييمات</option>
            <option value="5">★★★★★ ممتاز (5 نجوم)</option>
            <option value="4">★★★★ جيد جداً (4+ نجوم)</option>
            <option value="3">★★★ جيد (3+ نجوم)</option>
            <option value="2">★★ مقبول (2+ نجوم)</option>
          </select>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="mt-4 border-t pt-4">
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>إجمالي الناقلين:</span>
            <span className="font-medium text-gray-900">{totalResults}</span>
          </div>
          <div className="flex justify-between">
            <span>متصل الآن:</span>
            <span className="font-medium text-green-600">{onlineCount}</span>
          </div>
          <div className="flex justify-between">
            <span>حسابات موثقة:</span>
            <span className="font-medium text-blue-600">85</span>
          </div>
          <div className="flex justify-between">
            <span>تقييم 4+ نجوم:</span>
            <span className="font-medium text-yellow-600">70</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportFilter;
