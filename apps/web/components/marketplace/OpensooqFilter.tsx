import { Filter, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import CleanSelect, { SelectOption } from '../ui/CleanSelect';

// دالة مساعدة لتحويل النصوص إلى SelectOption
const toSelectOptions = (items: string[]): SelectOption[] =>
  items.map((item) => ({ value: item, label: item }));

interface FilterOptions {
  brand: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  priceFrom: string;
  priceTo: string;
  mileageFrom: string;
  mileageTo: string;
  fuelType: string;
  transmission: string;
  condition: string;
  location: string;
}

interface OpensooqFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  onSearch: (query: string) => void;
}

const OpensooqFilter: React.FC<OpensooqFilterProps> = ({ onFilterChange, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    brand: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    priceFrom: '',
    priceTo: '',
    mileageFrom: '',
    mileageTo: '',
    fuelType: '',
    transmission: '',
    condition: '',
    location: '',
  });

  const carBrands = [
    'تويوتا',
    'نيسان',
    'هوندا',
    'هيونداي',
    'كيا',
    'مازدا',
    'ميتسوبيشي',
    'سوزوكي',
    'فورد',
    'شيفروليه',
    'بي إم دبليو',
    'مرسيدس',
    'أودي',
  ];

  const fuelTypes = ['بنزين', 'ديزل', 'هجين', 'كهربائي'];
  const transmissionTypes = ['أوتوماتيك', 'يدوي'];
  const conditionTypes = ['جديد', 'مستعمل', 'معرض'];

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      brand: '',
      model: '',
      yearFrom: '',
      yearTo: '',
      priceFrom: '',
      priceTo: '',
      mileageFrom: '',
      mileageTo: '',
      fuelType: '',
      transmission: '',
      condition: '',
      location: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
      {/* شريط البحث */}
      <div className="mb-4 flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث عن السيارة التي تريدها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-right focus:border-transparent focus:ring-2 focus:ring-blue-500"
            dir="rtl"
          />
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          بحث
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-200"
        >
          <Filter className="h-5 w-5" />
          فلترة
        </button>
      </div>

      {/* الفلاتر المتقدمة */}
      {showFilters && (
        <div className="border-t pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">فلترة متقدمة</h3>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              مسح الفلاتر
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* الماركة */}
            <div>
              <CleanSelect
                label="الماركة"
                options={toSelectOptions(carBrands)}
                value={filters.brand}
                onChange={(value) => handleFilterChange('brand', value)}
                placeholder="الماركة"
              />
            </div>

            {/* الموديل */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">الموديل</label>
              <input
                type="text"
                placeholder="أدخل الموديل"
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-transparent focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>

            {/* سنة الصنع من */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">سنة الصنع من</label>
              <input
                type="number"
                placeholder="2000"
                value={filters.yearFrom}
                onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-transparent focus:ring-2 focus:ring-blue-500"
                min="1990"
                max="2024"
              />
            </div>

            {/* سنة الصنع إلى */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">سنة الصنع إلى</label>
              <input
                type="number"
                placeholder="2024"
                value={filters.yearTo}
                onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-transparent focus:ring-2 focus:ring-blue-500"
                min="1990"
                max="2024"
              />
            </div>

            {/* السعر من */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                السعر من (دينار)
              </label>
              <input
                type="number"
                placeholder="1000"
                value={filters.priceFrom}
                onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-transparent focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            {/* السعر إلى */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                السعر إلى (دينار)
              </label>
              <input
                type="number"
                placeholder="50000"
                value={filters.priceTo}
                onChange={(e) => handleFilterChange('priceTo', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-transparent focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            {/* المسافة المقطوعة من */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                المسافة من (كم)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.mileageFrom}
                onChange={(e) => handleFilterChange('mileageFrom', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-transparent focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            {/* المسافة المقطوعة إلى */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                المسافة إلى (كم)
              </label>
              <input
                type="number"
                placeholder="200000"
                value={filters.mileageTo}
                onChange={(e) => handleFilterChange('mileageTo', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-transparent focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            {/* نوع الوقود */}
            <div>
              <CleanSelect
                label="نوع الوقود"
                options={toSelectOptions(fuelTypes)}
                value={filters.fuelType}
                onChange={(value) => handleFilterChange('fuelType', value)}
                placeholder="جميع الأنواع"
              />
            </div>

            {/* ناقل الحركة */}
            <div>
              <CleanSelect
                label="ناقل الحركة"
                options={toSelectOptions(transmissionTypes)}
                value={filters.transmission}
                onChange={(value) => handleFilterChange('transmission', value)}
                placeholder="جميع الأنواع"
              />
            </div>

            {/* حالة السيارة */}
            <div>
              <CleanSelect
                label="حالة السيارة"
                options={toSelectOptions(conditionTypes)}
                value={filters.condition}
                onChange={(value) => handleFilterChange('condition', value)}
                placeholder="جميع الحالات"
              />
            </div>

            {/* الموقع */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">الموقع</label>
              <input
                type="text"
                placeholder="أدخل المدينة أو المنطقة"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-transparent focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpensooqFilter;
