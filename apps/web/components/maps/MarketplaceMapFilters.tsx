import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React, { useState } from 'react';
import { libyanCities } from '../../data/libyan-cities';
import { bodyTypes, carBrands, getModelsByBrand } from '../../data/simple-filters';

interface MapFilters {
  searchQuery: string;
  brand: string;
  model: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  condition: string;
  city: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
}

interface MarketplaceMapFiltersProps {
  filters: MapFilters;
  onFilterChange: (filters: Partial<MapFilters>) => void;
  totalResults: number;
}

const MarketplaceMapFilters: React.FC<MarketplaceMapFiltersProps> = ({
  filters,
  onFilterChange,
  totalResults,
}) => {
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const currentYear = new Date().getFullYear();

  const handleBrandChange = (brand: string) => {
    onFilterChange({ brand, model: '' });
    if (brand) {
      setAvailableModels(getModelsByBrand(brand));
    } else {
      setAvailableModels([]);
    }
  };

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      brand: '',
      model: '',
      minPrice: 0,
      maxPrice: 1000000,
      minYear: 1990,
      maxYear: currentYear,
      condition: '',
      city: '',
      bodyType: '',
      fuelType: '',
      transmission: '',
    });
    setAvailableModels([]);
  };

  return (
    <div className="p-4">
      {/* شريط البحث */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="ابحث عن سيارة..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
        </div>
      </div>

      {/* عدد النتائج */}
      <div className="mb-4 rounded-lg bg-blue-50 p-3 text-center">
        <p className="text-sm font-medium text-blue-900">
          <span className="text-xl font-bold">{totalResults}</span> سيارة متاحة
        </p>
      </div>

      {/* زر إعادة تعيين */}
      <button
        onClick={handleReset}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
      >
        <XMarkIcon className="h-4 w-4" />
        إعادة تعيين الفلاتر
      </button>

      <div className="space-y-4">
        {/* الماركة */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">الماركة</label>
          <select
            value={filters.brand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الماركات</option>
            {carBrands.map((brand) => (
              <option key={brand.name} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* الموديل */}
        {filters.brand && (
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">الموديل</label>
            <select
              value={filters.model}
              onChange={(e) => onFilterChange({ model: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الموديلات</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* المدينة */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">المدينة</label>
          <select
            value={filters.city}
            onChange={(e) => onFilterChange({ city: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع المدن</option>
            {libyanCities
              .filter((city) => city.isMainCity)
              .map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
          </select>
        </div>

        {/* نطاق السعر */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">نطاق السعر (دينار)</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => onFilterChange({ minPrice: parseInt(e.target.value) || 0 })}
                placeholder="من"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  onFilterChange({
                    maxPrice: parseInt(e.target.value) || 1000000,
                  })
                }
                placeholder="إلى"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* نطاق السنة */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">سنة الصنع</label>
          <div className="flex items-center gap-2">
            <select
              value={filters.minYear}
              onChange={(e) => onFilterChange({ minYear: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1990}>من</option>
              {Array.from({ length: currentYear - 1989 }, (_, i) => 1990 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <span className="text-gray-500">-</span>
            <select
              value={filters.maxYear}
              onChange={(e) => onFilterChange({ maxYear: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={currentYear}>إلى</option>
              {Array.from({ length: currentYear - 1989 }, (_, i) => 1990 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* الحالة */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">الحالة</label>
          <select
            value={filters.condition}
            onChange={(e) => onFilterChange({ condition: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الحالات</option>
            <option value="NEW">جديد</option>
            <option value="USED">مستعمل</option>
            <option value="CERTIFIED">معتمد</option>
          </select>
        </div>

        {/* نوع الهيكل */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">نوع الهيكل</label>
          <select
            value={filters.bodyType}
            onChange={(e) => onFilterChange({ bodyType: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الأنواع</option>
            {bodyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* نوع الوقود */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">نوع الوقود</label>
          <select
            value={filters.fuelType}
            onChange={(e) => onFilterChange({ fuelType: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الأنواع</option>
            <option value="PETROL">بنزين</option>
            <option value="DIESEL">ديزل</option>
            <option value="HYBRID">هجين</option>
            <option value="ELECTRIC">كهربائي</option>
          </select>
        </div>

        {/* ناقل الحركة */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">ناقل الحركة</label>
          <select
            value={filters.transmission}
            onChange={(e) => onFilterChange({ transmission: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الأنواع</option>
            <option value="AUTOMATIC">أوتوماتيك</option>
            <option value="MANUAL">يدوي</option>
            <option value="CVT">CVT</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceMapFilters;
