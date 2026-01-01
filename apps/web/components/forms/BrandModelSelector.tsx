import React, { useState, useEffect } from 'react';
import { carBrands, getModelsByBrand } from '../../data/simple-filters';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';

interface BrandModelSelectorProps {
  selectedBrand: string;
  selectedModel: string;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  errors?: Record<string, string>;
  onUserInteraction?: () => void;
}

const BrandModelSelector: React.FC<BrandModelSelectorProps> = ({
  selectedBrand,
  selectedModel,
  onBrandChange,
  onModelChange,
  errors = {},
  onUserInteraction,
}) => {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllModels, setShowAllModels] = useState(false);

  // تحديث الموديلات عند تغيير الماركة
  useEffect(() => {
    if (selectedBrand) {
      const models = getModelsByBrand(selectedBrand);
      setAvailableModels(models);

      // إعادة تعيين الموديل إذا لم يعد متاحاً
      if (selectedModel && !models.includes(selectedModel)) {
        onModelChange('');
      }
    } else {
      setAvailableModels([]);
      onModelChange('');
    }
  }, [selectedBrand, selectedModel, onModelChange]);

  // معالجة تغيير الماركة
  const handleBrandChange = (brand: string) => {
    onBrandChange(brand);
    onUserInteraction?.();
  };

  // معالجة تغيير الموديل
  const handleModelChange = (model: string) => {
    onModelChange(model);
    onUserInteraction?.();
  };

  // عرض الماركات الشائعة أولاً
  const commonBrands = carBrands.slice(0, 12);
  const remainingBrands = carBrands.slice(12);

  // عرض الموديلات الشائعة أولاً
  const commonModels = availableModels.slice(0, 12);
  const remainingModels = availableModels.slice(12);

  return (
    <div className="space-y-8">
      {/* اختيار الماركة */}
      <div>
        <label className="mb-6 block text-lg font-black text-gray-900">
          الماركة <span className="text-red-500">*</span>
        </label>

        <div className="space-y-4">
          {/* الماركات الشائعة */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {commonBrands.map((brand) => (
              <button
                key={brand.name}
                type="button"
                onClick={() => handleBrandChange(brand.name)}
                className={`relative flex min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                  selectedBrand === brand.name
                    ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                    : 'hover:bg-blue-25 border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                } `}
              >
                {selectedBrand === brand.name && (
                  <CheckCircleIcon className="absolute right-2 top-2 h-5 w-5 text-blue-500" />
                )}
                <span
                  className={`text-sm font-medium transition-colors duration-200 ${selectedBrand === brand.name ? 'text-blue-900' : 'text-gray-700'} `}
                >
                  {brand.name}
                </span>
              </button>
            ))}
          </div>

          {/* زر عرض جميع الماركات */}
          {remainingBrands.length > 0 && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowAllBrands(!showAllBrands)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {showAllBrands
                  ? 'إخفاء الماركات الأخرى'
                  : `عرض جميع الماركات (${remainingBrands.length})`}
              </button>
            </div>
          )}

          {/* الماركات المتبقية */}
          {showAllBrands && remainingBrands.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {remainingBrands.map((brand) => (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => handleBrandChange(brand.name)}
                  className={`relative flex min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                    selectedBrand === brand.name
                      ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                      : 'hover:bg-blue-25 border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  } `}
                >
                  {selectedBrand === brand.name && (
                    <CheckCircleIcon className="absolute right-2 top-2 h-5 w-5 text-blue-500" />
                  )}
                  <span
                    className={`text-sm font-medium transition-colors duration-200 ${selectedBrand === brand.name ? 'text-blue-900' : 'text-gray-700'} `}
                  >
                    {brand.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {errors.brand && <p className="mt-2 text-sm font-medium text-red-500">{errors.brand}</p>}
      </div>

      {/* اختيار الموديل */}
      {selectedBrand && (
        <div>
          <label className="mb-6 block text-lg font-black text-gray-900">
            الموديل <span className="text-red-500">*</span>
          </label>

          {availableModels.length > 0 ? (
            <div className="space-y-4">
              {/* الموديلات الشائعة */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {commonModels.map((model) => (
                  <button
                    key={model}
                    type="button"
                    onClick={() => handleModelChange(model)}
                    className={`relative flex min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                      selectedModel === model
                        ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200'
                        : 'hover:bg-green-25 border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                    } `}
                  >
                    {selectedModel === model && (
                      <CheckCircleIcon className="absolute right-2 top-2 h-5 w-5 text-green-500" />
                    )}
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${selectedModel === model ? 'text-green-900' : 'text-gray-700'} `}
                    >
                      {model}
                    </span>
                  </button>
                ))}
              </div>

              {/* زر عرض جميع الموديلات */}
              {remainingModels.length > 0 && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllModels(!showAllModels)}
                    className="text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    {showAllModels
                      ? 'إخفاء الموديلات الأخرى'
                      : `عرض جميع الموديلات (${remainingModels.length})`}
                  </button>
                </div>
              )}

              {/* الموديلات المتبقية */}
              {showAllModels && remainingModels.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {remainingModels.map((model) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => handleModelChange(model)}
                      className={`relative flex min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                        selectedModel === model
                          ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200'
                          : 'hover:bg-green-25 border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                      } `}
                    >
                      {selectedModel === model && (
                        <CheckCircleIcon className="absolute right-2 top-2 h-5 w-5 text-green-500" />
                      )}
                      <span
                        className={`text-sm font-medium transition-colors duration-200 ${selectedModel === model ? 'text-green-900' : 'text-gray-700'} `}
                      >
                        {model}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">لا توجد موديلات متاحة لهذه الماركة</p>
            </div>
          )}

          {errors.model && <p className="mt-2 text-sm font-medium text-red-500">{errors.model}</p>}
        </div>
      )}
    </div>
  );
};

export default BrandModelSelector;
