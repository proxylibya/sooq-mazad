import React, { useState } from 'react';
import SelectField from './ui/SelectField';
import { libyanCities } from '../data/libyan-cities';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';

interface CitySearchFormProps {
  onSearch?: (data: SearchFormData) => void;
  className?: string;
}

interface SearchFormData {
  city: string;
  searchTerm: string;
  category: string;
}

const CitySearchForm: React.FC<CitySearchFormProps> = ({ onSearch, className = '' }) => {
  const [formData, setFormData] = useState<SearchFormData>({
    city: '',
    searchTerm: '',
    category: 'all',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);

    // محاكاة عملية البحث
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (onSearch) {
      onSearch(formData);
    }

    setIsLoading(false);
  };

  const handleReset = () => {
    setFormData({
      city: '',
      searchTerm: '',
      category: 'all',
    });
  };

  const isFormValid = formData.city && formData.searchTerm.trim();

  return (
    <div className={`rounded-xl border bg-white p-6 shadow-lg ${className}`}>
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-2">
          <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">البحث في السيارات</h3>
          <p className="text-sm text-gray-600">ابحث عن السيارة المناسبة في المدينة التي تريدها</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* حقل البحث */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            ما الذي تبحث عنه؟
            <span className="mr-1 text-red-500">*</span>
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              value={formData.searchTerm}
              onChange={(e) => setFormData((prev) => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="مثال: تويوتا كامري 2020"
              className="w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            {formData.searchTerm && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, searchTerm: '' }))}
                className="absolute left-3 top-1/2 -translate-y-1/2 transform rounded-full p-1 transition-colors hover:bg-gray-100"
              >
                <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          {!formData.searchTerm.trim() && (
            <p className="mt-1 text-sm text-red-600">يرجى إدخال كلمة البحث</p>
          )}
        </div>

        {/* اختيار المدينة */}
        <SelectField
          value={formData.city}
          onChange={(city) => setFormData((prev) => ({ ...prev, city }))}
          label="المدينة"
          placeholder="اختر المدينة"
          required={true}
          options={[
            { value: 'all', label: 'جميع المدن' },
            ...libyanCities.map((city) => ({
              value: city.name,
              label: city.name,
            })),
          ]}
          error={!formData.city ? 'يرجى اختيار المدينة' : ''}
          clearable={true}
        />

        {/* اختيار الفئة */}
        <SelectField
          label="الفئة"
          options={[
            { value: 'cars', label: 'السيارات' },
            { value: 'motorcycles', label: 'الدراجات النارية' },
            { value: 'trucks', label: 'الشاحنات' },
            { value: 'parts', label: 'قطع الغيار' },
            { value: 'accessories', label: 'الإكسسوارات' },
          ]}
          value={formData.category}
          onChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
          placeholder="جميع الفئات"
          clearable={true}
        />

        {/* أزرار التحكم */}
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row">
          <button
            onClick={handleSearch}
            disabled={!isFormValid || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400 sm:flex-1"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            {isLoading ? 'جاري البحث...' : 'ابحث الآن'}
          </button>

          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50 disabled:bg-gray-100 sm:w-auto"
          >
            <XMarkIcon className="h-5 w-5" />
            إعادة تعيين
          </button>
        </div>

        {/* معلومات إضافية */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <MapPinIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <h4 className="mb-1 font-medium text-blue-900">نصائح للبحث الأفضل</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• استخدم أسماء العلامات التجارية والموديلات</li>
                <li>• أضف سنة الصنع للحصول على نتائج أدق</li>
                <li>• اختر المدينة المناسبة لتوفير وقت التنقل</li>
                <li>• جرب كلمات مختلفة إذا لم تجد ما تبحث عنه</li>
              </ul>
            </div>
          </div>
        </div>

        {/* عرض بيانات النموذج الحالية */}
        {(formData.city || formData.searchTerm || formData.category !== 'all') && (
          <div className="rounded-lg border bg-gray-50 p-4">
            <h4 className="mb-2 font-medium text-gray-900">معاينة البحث الحالي:</h4>
            <div className="space-y-1 text-sm text-gray-700">
              {formData.searchTerm && (
                <p>
                  <span className="font-medium">البحث:</span> {formData.searchTerm}
                </p>
              )}
              {formData.city && (
                <p>
                  <span className="font-medium">المدينة:</span> {formData.city}
                </p>
              )}
              {formData.category !== 'all' && (
                <p>
                  <span className="font-medium">الفئة:</span>{' '}
                  {formData.category === 'cars'
                    ? 'السيارات'
                    : formData.category === 'motorcycles'
                      ? 'الدراجات النارية'
                      : formData.category === 'trucks'
                        ? 'الشاحنات'
                        : formData.category === 'parts'
                          ? 'قطع الغيار'
                          : formData.category === 'accessories'
                            ? 'الإكسسوارات'
                            : formData.category}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitySearchForm;
