import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React from 'react';
import SelectField from '../ui/SelectField';

// بيانات المدن
const cities = [
  'جميع المدن',
  'طرابلس',
  'بنغازي',
  'مصراتة',
  'الزاوية',
  'سبها',
  'غريان',
  'زليتن',
  'أجدابيا',
  'درنة',
  'توكرة',
];

// بيانات الماركات
const brands = [
  'جميع الماركات',
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
];

// بيانات الموديلات (تعتمد على الماركة المختارة)
const getModelsForBrand = (brand: string): string[] => {
  const modelsByBrand: { [key: string]: string[] } = {
    تويوتا: ['كامري', 'كورولا', 'يارس', 'راف 4', 'هايلكس', 'لاند كروزر'],
    نيسان: ['التيما', 'سنترا', 'مكسيما', 'باترول', 'اكس تريل', 'جوك'],
    هوندا: ['أكورد', 'سيفيك', 'سي آر في', 'بايلوت', 'فيت'],
    هيونداي: ['النترا', 'سوناتا', 'توسان', 'سانتا في', 'أكسنت'],
    كيا: ['أوبتيما', 'سيراتو', 'سورينتو', 'سبورتاج', 'ريو'],
    مازدا: ['مازدا 3', 'مازدا 6', 'سي اكس 5', 'سي اكس 9'],
    ميتسوبيشي: ['لانسر', 'أوتلاندر', 'باجيرو', 'اكليبس كروس'],
    سوزوكي: ['سويفت', 'فيتارا', 'جيمني', 'بالينو'],
    فورد: ['فوكس', 'فيوجن', 'اكسبلورر', 'ايدج', 'موستانج'],
    شيفروليه: ['كروز', 'ماليبو', 'تاهو', 'سوبربان', 'كامارو'],
  };
  return modelsByBrand[brand] || [];
};

interface MarketplaceFilters {
  searchQuery: string;
  city: string;
  brand: string;
  model: string;
  condition: string;
  yearFrom: string;
  yearTo: string;
}

interface MarketplaceSidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  filters?: MarketplaceFilters;
  onFilterChange?: (key: keyof MarketplaceFilters, value: string) => void;
  onResetFilters?: () => void;
  totalResults?: number;
}

const defaultFilters: MarketplaceFilters = {
  searchQuery: '',
  city: '',
  brand: '',
  model: '',
  condition: '',
  yearFrom: '',
  yearTo: '',
};

const MarketplaceSidebar: React.FC<MarketplaceSidebarProps> = ({
  isMobile = false,
  isOpen = false,
  onClose = () => {},
  filters = defaultFilters,
  onFilterChange = () => {},
  onResetFilters = () => {},
  totalResults = 0,
}) => {
  // بيانات أنواع السيارات
  const carTypes = [
    'جميع الأنواع',
    'سيدان',
    'هاتشباك',
    'SUV',
    'كوبيه',
    'كونفرتيبل',
    'بيك أب',
    'فان',
    'كروس أوفر',
  ];

  // بيانات السنوات
  const years = Array.from({ length: 35 }, (_, i) => (2024 - i).toString());

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />}

        {/* Mobile Sidebar */}
        <div
          className={`fixed right-0 top-0 z-50 h-full w-80 transform bg-white shadow-xl transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900">الفلاتر</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={onResetFilters}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                إعادة تعيين
              </button>
              <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="border-b border-gray-200 p-4">
            <div className="text-sm text-gray-600">{totalResults} نتيجة</div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-4">
            {/* حقل البحث */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">البحث</label>
              <input
                type="text"
                placeholder="ابحث عن سيارة..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                value={filters.searchQuery}
                onChange={(e) => onFilterChange('searchQuery', e.target.value)}
              />
            </div>

            {/* المدينة */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">المدينة</label>
              <SelectField
                options={cities}
                value={filters.city}
                onChange={(value) => onFilterChange('city', value)}
                placeholder="جميع المدن"
                size="sm"
                clearable={true}
                searchable={true}
              />
            </div>

            {/* الماركة */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">الماركة</label>
              <SelectField
                options={brands}
                value={filters.brand}
                onChange={(value) => {
                  onFilterChange('brand', value);
                  if (value !== filters.brand) {
                    onFilterChange('model', '');
                  }
                }}
                placeholder="الماركة"
                searchable={true}
                size="sm"
              />
            </div>

            {/* الموديل */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">الموديل</label>
              <SelectField
                options={['جميع الموديلات', ...getModelsForBrand(filters.brand)]}
                value={filters.model}
                onChange={(value) => onFilterChange('model', value)}
                placeholder="الموديل"
                disabled={!filters.brand || filters.brand === 'جميع الماركات'}
                searchable={true}
                size="sm"
              />
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              عرض النتائج ({totalResults})
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <aside className="w-72 flex-shrink-0">
      <div className="space-y-6 rounded-2xl border bg-white p-5 shadow-lg">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
            الفلاتر
          </h3>
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800"
          >
            <XMarkIcon className="h-4 w-4" />
            إزالة الكل
          </button>
        </div>

        {/* حقل البحث */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">البحث</label>
          <input
            type="text"
            placeholder="ابحث عن سيارة..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
          />
        </div>

        {/* المدينة */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">المدينة</label>
          <SelectField
            options={cities}
            value={filters.city}
            onChange={(value) => onFilterChange('city', value)}
            placeholder="جميع المدن"
            size="sm"
            clearable={true}
            searchable={true}
          />
        </div>

        {/* الماركة */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">الماركة</label>
          <SelectField
            options={brands}
            value={filters.brand}
            onChange={(value) => {
              onFilterChange('brand', value);
              // إعادة تعيين الموديل عند تغيير الماركة
              if (value !== filters.brand) {
                onFilterChange('model', '');
              }
            }}
            placeholder="الماركة"
            searchable={true}
            size="sm"
          />
        </div>

        {/* الموديل */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">الموديل</label>
          <SelectField
            options={['جميع الموديلات', ...getModelsForBrand(filters.brand)]}
            value={filters.model}
            onChange={(value) => onFilterChange('model', value)}
            placeholder="الموديل"
            disabled={!filters.brand || filters.brand === 'جميع الماركات'}
            searchable={true}
            size="sm"
          />
        </div>

        {/* نوع السيارة */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">نوع السيارة</label>
          <SelectField
            options={carTypes}
            value={filters.condition}
            onChange={(value) => onFilterChange('condition', value)}
            placeholder="جميع الأنواع"
            searchable={false}
            size="sm"
          />
        </div>

        {/* سنة الصنع */}
        <div className="mb-6">
          <label className="mb-1 block text-xs font-medium text-gray-600">سنة الصنع</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="من"
                  className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-right text-gray-900 transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  dir="rtl"
                  value={filters.yearFrom}
                  onChange={(e) => onFilterChange('yearFrom', e.target.value)}
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                >
                  <ChevronDownIcon className="h-5 w-5 transition-transform" />
                </button>
              </div>
            </div>
            <div className="relative flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="إلى"
                  className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-right text-gray-900 transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  dir="rtl"
                  value={filters.yearTo}
                  onChange={(e) => onFilterChange('yearTo', e.target.value)}
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                >
                  <ChevronDownIcon className="h-5 w-5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* قسم الإعلان */}
        <div className="mt-2 border-t pt-4">
          <div className="mb-4 text-center">
            <h3 className="mb-1 text-base font-bold text-gray-800">هل تريد بيع سيارتك؟</h3>
            <p className="mb-2 text-xs text-gray-600">احصل على أفضل سعر لسيارتك</p>
          </div>
          <div className="space-y-2">
            <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              أضف سيارتك للسوق المفتوح
            </button>
            <button
              className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: '#FF6600' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = '#E55A00')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = '#FF6600')}
            >
              أضف سيارتك للمزاد
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default MarketplaceSidebar;
