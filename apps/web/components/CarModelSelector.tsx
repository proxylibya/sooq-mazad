import React, { useState, useRef, useEffect } from 'react';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import { findBrand } from '../data/car-brands-logos';

interface CarModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  selectedBrand: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  showSearch?: boolean;
}

const CarModelSelector: React.FC<CarModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  selectedBrand,
  placeholder = 'اختر الموديل',
  className = '',
  required = false,
  disabled = false,
  showSearch = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // التركيز على حقل البحث عند فتح القائمة
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, showSearch]);

  // الحصول على موديلات العلامة التجارية المختارة
  const brandData = findBrand(selectedBrand);
  // قائمة موديلات افتراضية للعلامات التجارية الشائعة
  const getModelsForBrand = (brandValue: string): string[] => {
    const modelsMap: { [key: string]: string[] } = {
      toyota: ['كامري', 'كورولا', 'يارس', 'هايلكس', 'لاند كروزر', 'برادو', 'راف 4'],
      nissan: ['التيما', 'سنترا', 'مكسيما', 'باترول', 'اكس تريل', 'جوك', 'تيدا'],
      hyundai: ['النترا', 'سوناتا', 'توسان', 'سانتا في', 'اكسنت', 'كريتا', 'فيرنا'],
      kia: ['سيراتو', 'اوبتيما', 'سورينتو', 'سبورتاج', 'ريو', 'بيكانتو', 'كادينزا'],
      honda: ['اكورد', 'سيفيك', 'سي ار في', 'بايلوت', 'اوديسي', 'فيت', 'ريدج لاين'],
      mercedes: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class', 'CLA'],
      bmw: ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X1', 'X6'],
      audi: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'A8'],
    };
    return modelsMap[brandValue] || ['موديل عام'];
  };

  const availableModels = selectedBrand ? getModelsForBrand(selectedBrand) : [];

  // فلترة الموديلات بناءً على البحث
  const filteredModels = availableModels.filter(
    (model) => model.includes(searchTerm) || model.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleModelSelect = (modelName: string) => {
    onModelChange(modelName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onModelChange('');
  };

  const isDisabled = disabled || !selectedBrand || availableModels.length === 0;
  const currentPlaceholder = !selectedBrand
    ? 'اختر النوع أولاً'
    : availableModels.length === 0
      ? 'لا توجد موديلات متاحة'
      : placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* زر الاختيار الرئيسي */}
      <button
        type="button"
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-right transition-all duration-200 ${
          isDisabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            : 'hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        } ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'} ${selectedModel ? 'text-gray-900' : 'text-gray-500'} `}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {selectedModel ? (
            <>
              <CogIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <span className="truncate font-medium">{selectedModel}</span>
              {!isDisabled && (
                <button
                  onClick={handleClear}
                  className="rounded-full p-1 transition-colors hover:bg-gray-100"
                  title="مسح الاختيار"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </>
          ) : (
            <>
              <CogIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <span className="truncate">{currentPlaceholder}</span>
            </>
          )}
        </div>

        <ChevronDownIcon
          className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && !isDisabled && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-hidden rounded-lg border border-gray-200 bg-gray-200 shadow-lg">
          {/* حقل البحث */}
          {showSearch && availableModels.length > 5 && (
            <div className="border-b border-gray-100 p-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن الموديل..."
                  className="w-full rounded-md border border-gray-200 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* قائمة الموديلات */}
          <div className="max-h-60 overflow-y-auto">
            {filteredModels.length > 0 ? (
              <div className="p-2">
                {filteredModels.map((model) => (
                  <button
                    key={model}
                    onClick={() => handleModelSelect(model)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-right transition-colors duration-150 ${
                      selectedModel === model
                        ? 'border-l-2 border-blue-500 bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    } `}
                  >
                    <CogIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{model}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                {searchTerm ? `لا توجد نتائج للبحث "${searchTerm}"` : 'لا توجد موديلات متاحة'}
              </div>
            )}
          </div>

          {/* إحصائيات */}
          {availableModels.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 p-2">
              <div className="text-center text-xs text-gray-500">
                {filteredModels.length} من {availableModels.length} موديل متاح
              </div>
            </div>
          )}
        </div>
      )}

      {/* علامة الحقل المطلوب */}
      {required && <span className="absolute -right-1 -top-1 text-sm text-red-500">*</span>}
    </div>
  );
};

export default CarModelSelector;
