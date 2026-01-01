import SelectField from '../ui/SelectField';
import React, { useState, useEffect } from 'react';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import { cityNames } from '../../data/libyan-cities';
import {
  carBrands,
  getAllBrandNames,
  getModelsByBrand,
  conditions as carConditions,
} from '../../data/simple-filters';
import SimpleYearRange from '../SimpleYearRange';

interface SimpleAuctionFilterProps {
  filters: {
    searchQuery: string;
    location: string;
    brand: string;
    model: string;
    yearFrom: string;
    yearTo: string;
    priceMin: number | null;
    priceMax: number | null;
    condition: string;
    auctionStatus: string;
    timeRemaining: string;
  };
  onFilterChange: (filterType: string, value: any) => void;
  onResetFilters: () => void;
}

const SimpleAuctionFilter: React.FC<SimpleAuctionFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const [availableModels, setAvailableModels] = useState<string[]>(['جميع الموديلات']);

  // البيانات
  const cities = ['جميع المدن', ...cityNames];
  const brands = ['جميع الماركات', ...getAllBrandNames()];

  const currentYear = new Date().getFullYear();
  const years = ['جميع السنوات'];
  for (let year = currentYear; year >= 1980; year--) {
    years.push(year.toString());
  }

  const conditions = ['جميع الحالات', ...carConditions];
  const auctionStatuses = ['جميع المزادات', 'مباشر', 'قادم', 'منتهي'];
  const timeRemainingOptions = [
    'جميع الأوقات',
    'أقل من ساعة',
    'أقل من 3 ساعات',
    'أقل من 6 ساعات',
    'أقل من 12 ساعة',
    'أقل من 24 ساعة',
    'أكثر من يوم',
  ];

  // تحديث الموديلات عند تغيير الماركة
  useEffect(() => {
    if (filters.brand && filters.brand !== 'جميع الماركات') {
      const models = getModelsByBrand(filters.brand);
      setAvailableModels(['جميع الموديلات', ...models]);

      if (filters.model && filters.model !== 'جميع الموديلات' && !models.includes(filters.model)) {
        onFilterChange('model', 'جميع الموديلات');
      }
    } else {
      setAvailableModels(['جميع الموديلات']);
      if (filters.model !== 'جميع الموديلات') {
        onFilterChange('model', 'جميع الموديلات');
      }
    }
  }, [filters.brand, filters.model, onFilterChange]);

  // دالة تنسيق الأرقام
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  // دالة معالجة تغيير السعر
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : parseInt(value.replace(/,/g, ''));
    onFilterChange(type === 'min' ? 'priceMin' : 'priceMax', numValue);
  };

  // عدد الفلاتر النشطة
  const activeFiltersCount = [
    filters.searchQuery !== '',
    filters.location !== 'جميع المدن',
    filters.brand !== 'جميع الماركات',
    filters.model !== 'جميع الموديلات',
    filters.yearFrom !== 'جميع السنوات',
    filters.yearTo !== 'جميع السنوات',
    filters.priceMin !== null,
    filters.priceMax !== null,
    filters.condition !== 'جميع الحالات',
    filters.auctionStatus !== 'جميع المزادات',
    filters.timeRemaining !== 'جميع الأوقات',
  ].filter(Boolean).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* رأس الفلتر */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">فلاتر البحث</h3>
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="text-gray-500 transition-colors hover:text-red-600"
              title="مسح جميع الفلاتر"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* البحث النصي */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">البحث في المزادات</label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن مزاد..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange('searchQuery', e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* المدينة */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">المدينة</label>
          <SelectField
            options={cities}
            value={filters.location}
            onChange={(value) => onFilterChange('location', value)}
            placeholder="جميع المدن"
            searchable
            searchPlaceholder="ابحث عن مدينة..."
          />
        </div>

        {/* الماركة */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">الماركة</label>
          <SelectField
            options={brands}
            value={filters.brand}
            onChange={(value) => onFilterChange('brand', value)}
            placeholder="الماركة"
            searchable
            searchPlaceholder="ابحث عن ماركة..."
          />
        </div>

        {/* الموديل */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">الموديل</label>
          <SelectField
            options={availableModels}
            value={filters.model}
            onChange={(value) => onFilterChange('model', value)}
            placeholder="الموديل"
            searchable
            clearable
            disabled={!filters.brand || filters.brand === 'جميع الماركات'}
          />
          {filters.brand === 'جميع الماركات' && (
            <p className="mt-1 text-xs text-gray-500">اختر ماركة أولاً لعرض الموديلات</p>
          )}
        </div>

        {/* حالة المزاد */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">حالة المزاد</label>
          <SelectField
            options={auctionStatuses}
            value={filters.auctionStatus}
            onChange={(value) => onFilterChange('auctionStatus', value)}
            placeholder="جميع المزادات"
            searchable
            searchPlaceholder="ابحث عن حالة..."
          />
        </div>

        {/* الوقت المتبقي */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">الوقت المتبقي</label>
          <SelectField
            options={timeRemainingOptions}
            value={filters.timeRemaining}
            onChange={(value) => onFilterChange('timeRemaining', value)}
            placeholder="جميع الأوقات"
            searchable
            searchPlaceholder="ابحث عن وقت..."
          />
        </div>

        {/* سنة الصنع */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">سنة الصنع</label>
          <SimpleYearRange
            yearFrom={filters.yearFrom}
            yearTo={filters.yearTo}
            onYearFromChange={(year) => onFilterChange('yearFrom', year)}
            onYearToChange={(year) => onFilterChange('yearTo', year)}
          />
        </div>

        {/* نطاق السعر */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            نطاق المزايدة (دينار ليبي)
          </label>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="الحد الأدنى"
              value={filters.priceMin ? formatNumber(filters.priceMin) : ''}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              placeholder="الحد الأقصى"
              value={filters.priceMax ? formatNumber(filters.priceMax) : ''}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* أزرار سريعة للأسعار */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'أقل من 50k', min: null, max: 50000 },
              { label: '50k-100k', min: 50000, max: 100000 },
              { label: '100k-200k', min: 100000, max: 200000 },
              { label: '200k-300k', min: 200000, max: 300000 },
              { label: '300k+', min: 300000, max: null },
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  onFilterChange('priceMin', range.min);
                  onFilterChange('priceMax', range.max);
                }}
                className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs text-orange-700 transition-colors hover:bg-orange-100"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* حالة السيارة */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">حالة السيارة</label>
          <SelectField
            options={conditions}
            value={filters.condition}
            onChange={(value) => onFilterChange('condition', value)}
            placeholder="جميع الحالات"
            searchable
            searchPlaceholder="ابحث عن حالة..."
          />
        </div>

        {/* زر إعادة تعيين الفلاتر */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={onResetFilters}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <XMarkIcon className="h-4 w-4" />
            مسح جميع الفلاتر
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuctionFilter;
