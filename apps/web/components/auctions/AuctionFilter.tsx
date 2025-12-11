import SelectField from '../ui/SelectField';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React, { useEffect, useState } from 'react';
import { cityNames } from '../../data/libyan-cities';
import {
  conditions as carConditions,
  getAllBrandNames,
  getModelsByBrand,
} from '../../data/simple-filters';

interface AuctionFilterProps {
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

const AuctionFilter: React.FC<AuctionFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  // حالة محلية للموديلات المتاحة
  const [availableModels, setAvailableModels] = useState<string[]>(['جميع الموديلات']);

  // البيانات الكاملة للفلاتر
  const cities = ['جميع المدن', ...cityNames];
  const brands = ['جميع الماركات', ...getAllBrandNames()];

  const currentYear = new Date().getFullYear();
  const years = ['جميع السنوات'];
  // نطاق سنوات كامل من 1980 إلى السنة الحالية
  for (let year = currentYear; year >= 1980; year--) {
    years.push(year.toString());
  }

  const conditions = ['جميع الحالات', ...carConditions];

  // خيارات حالة المزاد الخاصة بالمزادات
  const auctionStatuses = ['جميع المزادات', 'مباشر', 'قادم', 'منتهي'];

  // خيارات الوقت المتبقي
  const timeRemainingOptions = [
    'جميع الأوقات',
    'أقل من ساعة',
    'أقل من 3 ساعات',
    'أقل من 6 ساعات',
    'أقل من 12 ساعة',
    'أقل من 24 ساعة',
    'أكثر من يوم',
    'أكثر من أسبوع',
  ];

  // تحديث الموديلات عند تغيير الماركة
  useEffect(() => {
    if (filters.brand && filters.brand !== 'جميع الماركات') {
      const models = getModelsByBrand(filters.brand);
      setAvailableModels(['جميع الموديلات', ...models]);

      // إعادة تعيين الموديل إذا لم يعد متاحاً
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
            <h3 className="text-lg font-semibold text-gray-900">فلاتر المزادات</h3>
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
          <label className="mb-2 block text-sm font-medium text-gray-700">
            البحث في العنوان والوصف
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن مزاد..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange('searchQuery', e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* الشبكة الأساسية للفلاتر */}
        <div className="grid grid-cols-1 gap-4">
          {/* المدينة */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPinIcon className="h-4 w-4 flex-shrink-0 text-green-600" />
              <span>المدينة</span>
            </label>
            <SelectField
              options={['جميع المدن', ...cityNames]}
              value={filters.location}
              onChange={(value) => onFilterChange('location', value)}
              placeholder="اختر المدينة"
              searchable
              clearable
              className="focus-within:border-green-500 focus-within:ring-green-500"
            />
          </div>

          {/* الماركة */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <BuildingStorefrontIcon className="h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>الماركة</span>
            </label>
            <SelectField
              options={['جميع الماركات', ...getAllBrandNames()]}
              value={filters.brand}
              onChange={(value) => onFilterChange('brand', value)}
              placeholder="الماركة"
              searchable
              clearable
            />
          </div>

          {/* الموديل */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <CogIcon className="h-4 w-4 flex-shrink-0 text-indigo-600" />
              <span>الموديل</span>
            </label>
            <SelectField
              options={availableModels}
              value={filters.model}
              onChange={(value) => onFilterChange('model', value)}
              placeholder="الموديل"
              disabled={filters.brand === 'جميع الماركات'}
              searchable={true}
              size="md"
            />
            {filters.brand === 'جميع الماركات' && (
              <p className="mt-1 text-xs text-gray-500">اختر ماركة أولاً لعرض الموديلات</p>
            )}
          </div>

          {/* حالة المزاد */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <TrophyIcon className="h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>حالة المزاد</span>
            </label>
            <SelectField
              options={auctionStatuses}
              value={filters.auctionStatus}
              onChange={(value) => onFilterChange('auctionStatus', value)}
              placeholder="اختر حالة المزاد"
              searchable={false}
              size="md"
            />
          </div>

          {/* الوقت المتبقي */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <ClockIcon className="h-4 w-4 flex-shrink-0 text-red-600" />
              <span>الوقت المتبقي</span>
            </label>
            <SelectField
              options={timeRemainingOptions}
              value={filters.timeRemaining}
              onChange={(value) => onFilterChange('timeRemaining', value)}
              placeholder="اختر الوقت المتبقي"
              searchable={false}
              size="md"
            />
          </div>

          {/* سنة الصنع - من */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <CalendarIcon className="h-4 w-4 flex-shrink-0 text-yellow-600" />
              <span>من سنة</span>
            </label>
            <SelectField
              options={years}
              value={filters.yearFrom}
              onChange={(value) => onFilterChange('yearFrom', value)}
              placeholder="اختر السنة"
              searchable={true}
              size="md"
            />
          </div>

          {/* سنة الصنع - إلى */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <CalendarIcon className="h-4 w-4 flex-shrink-0 text-yellow-600" />
              <span>إلى سنة</span>
            </label>
            <SelectField
              options={years}
              value={filters.yearTo}
              onChange={(value) => onFilterChange('yearTo', value)}
              placeholder="اختر السنة"
              searchable={true}
              size="md"
            />
          </div>
        </div>

        {/* نطاق السعر */}
        <div className="py-2">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <CurrencyDollarIcon className="h-4 w-4 flex-shrink-0 text-orange-600" />
            <span>نطاق المزايدة (دينار ليبي)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="text"
                placeholder="الحد الأدنى"
                value={filters.priceMin ? formatNumber(filters.priceMin) : ''}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="الحد الأقصى"
                value={filters.priceMax ? formatNumber(filters.priceMax) : ''}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          {/* أزرار سريعة للأسعار */}
          <div className="mt-2 flex flex-wrap gap-1">
            {[
              { label: 'أقل من 50k', min: null, max: 50000 },
              { label: '50k-100k', min: 50000, max: 100000 },
              { label: '100k-200k', min: 100000, max: 200000 },
              { label: '200k-300k', min: 200000, max: 300000 },
              { label: '300k-500k', min: 300000, max: 500000 },
              { label: 'أكثر من 500k', min: 500000, max: null },
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  onFilterChange('priceMin', range.min);
                  onFilterChange('priceMax', range.max);
                }}
                className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700 transition-colors hover:bg-orange-100"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* الحالة */}
        <div className="py-2">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <StarIcon className="h-4 w-4 flex-shrink-0 text-blue-600" />
            <span>حالة السيارة</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {conditions.map((condition) => (
              <button
                key={condition}
                onClick={() => onFilterChange('condition', condition)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  filters.condition === condition
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>

        {/* زر إعادة تعيين الفلاتر */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={onResetFilters}
            className="w-full rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            مسح جميع الفلاتر
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionFilter;
