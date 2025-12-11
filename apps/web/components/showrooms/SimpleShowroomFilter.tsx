import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React, { useState } from 'react';
import { cityNames } from '../../data/libyan-cities';
import SelectField from '../ui/SelectField';

interface FilterOptions {
  search: string;
  vehicleType: string;
  city: string;
  rating: string;
}

interface SimpleShowroomFilterProps {
  filters: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
  onResetFilters: () => void;
}

const SimpleShowroomFilter: React.FC<SimpleShowroomFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // أنواع المركبات - متطابقة مع صفحة إنشاء المعرض
  const vehicleTypes = [
    { value: 'all', label: 'جميع أنواع المركبات' },
    { value: 'cars', label: 'سيارات' },
    { value: 'trucks', label: 'شاحنات' },
    { value: 'motorcycles', label: 'دراجات نارية' },
    { value: 'bicycles', label: 'دراجات هوائية' },
    { value: 'boats', label: 'قوارب' },
  ];

  // بيانات المدن
  const cities = ['جميع المدن', ...cityNames];

  // بيانات التقييمات
  const ratings = [
    'جميع التقييمات',
    '4.5 نجوم فأكثر',
    '4.0 نجوم فأكثر',
    '3.5 نجوم فأكثر',
    '3.0 نجوم فأكثر',
  ];

  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.vehicleType !== 'all') count++;
    if (filters.city !== 'all') count++;
    if (filters.rating !== 'all') count++;
    return count;
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      {/* رأس الفلتر */}
      <div className="rounded-t-lg border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
            البحث والفلاتر
          </h3>
          {activeFiltersCount() > 0 && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                {activeFiltersCount()} فلتر نشط
              </span>
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800"
              >
                <XMarkIcon className="h-4 w-4" />
                إزالة الكل
              </button>
            </div>
          )}
        </div>
      </div>

      {/* محتوى الفلتر */}
      <div className="space-y-4 p-4">
        {/* البحث */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">البحث في المعارض</label>
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن معرض..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          </div>
        </div>

        {/* نوع المركبة */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <TruckIcon className="h-4 w-4 text-blue-600" />
            نوع المركبة
          </label>
          <SelectField
            options={vehicleTypes.map((type) => type.label)}
            value={
              vehicleTypes.find((type) => type.value === filters.vehicleType)?.label ||
              'جميع أنواع المركبات'
            }
            onChange={(value) => {
              const selectedType = vehicleTypes.find((type) => type.label === value);
              onFilterChange('vehicleType', selectedType?.value || 'all');
            }}
          />
        </div>

        {/* المدينة */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPinIcon className="h-4 w-4 text-blue-600" />
            المدينة
          </label>
          <SelectField
            options={cities}
            value={filters.city === 'all' ? 'جميع المدن' : filters.city}
            onChange={(value) => onFilterChange('city', value === 'جميع المدن' ? 'all' : value)}
          />
        </div>

        {/* التقييم */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">التقييم</label>
          <SelectField
            options={ratings}
            value={
              filters.rating === 'all'
                ? 'جميع التقييمات'
                : ratings.find((r) => r.includes(filters.rating)) || 'جميع التقييمات'
            }
            onChange={(value) => {
              if (value === 'جميع التقييمات') {
                onFilterChange('rating', 'all');
              } else if (value.includes('4.5')) {
                onFilterChange('rating', '4.5');
              } else if (value.includes('4.0')) {
                onFilterChange('rating', '4.0');
              } else if (value.includes('3.5')) {
                onFilterChange('rating', '3.5');
              } else if (value.includes('3.0')) {
                onFilterChange('rating', '3.0');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SimpleShowroomFilter;
