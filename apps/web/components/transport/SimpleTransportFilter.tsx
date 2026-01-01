import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React, { useState } from 'react';
import { cityNames } from '../../data/libyan-cities';
import SelectField from '../ui/SelectField';

interface FilterOptions {
  search: string;
  truckType: string;
  serviceArea: string;
}

interface SimpleTransportFilterProps {
  filters: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
  onResetFilters: () => void;
}

const SimpleTransportFilter: React.FC<SimpleTransportFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  // بيانات أنواع الساحبات - متطابقة مع صفحة إضافة الخدمة
  const truckTypes = [
    'جميع الأنواع',
    'ساحبة مسطحة',
    'ناقلة سيارات',
    'ساحبة مغلقة',
    'ساحبة ثقيلة',
    'ونش نقل',
  ];

  // بيانات المناطق
  const serviceAreas = ['جميع المناطق', ...cityNames];

  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.truckType !== 'all') count++;
    if (filters.serviceArea !== 'all') count++;
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
          <label className="mb-2 block text-sm font-medium text-gray-700">
            البحث في خدمات النقل
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن خدمة نقل..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          </div>
        </div>

        {/* نوع الساحبة */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <TruckIcon className="h-4 w-4 text-blue-600" />
            نوع الساحبة
          </label>
          <SelectField
            options={truckTypes}
            value={filters.truckType === 'all' ? 'جميع الأنواع' : filters.truckType}
            onChange={(value) =>
              onFilterChange('truckType', value === 'جميع الأنواع' ? 'all' : value)
            }
            placeholder="اختر نوع الساحبة"
            size="md"
            clearable={true}
            searchable={true}
          />
        </div>

        {/* منطقة الخدمة */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPinIcon className="h-4 w-4 text-blue-600" />
            منطقة الخدمة
          </label>
          <SelectField
            options={serviceAreas}
            value={filters.serviceArea === 'all' ? 'جميع المناطق' : filters.serviceArea}
            onChange={(value) =>
              onFilterChange('serviceArea', value === 'جميع المناطق' ? 'all' : value)
            }
            placeholder="اختر منطقة الخدمة"
            size="md"
            clearable={true}
            searchable={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SimpleTransportFilter;
