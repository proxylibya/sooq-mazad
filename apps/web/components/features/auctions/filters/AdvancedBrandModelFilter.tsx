import React, { useEffect, useMemo, useRef, useState } from 'react';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import UniversalBrandSelector from '../../../UniversalBrandSelector';
import { findBrand } from '../../../../data/car-brands-logos';

interface AdvancedBrandModelFilterProps {
  brand: string;
  model: string;
  onChange: (update: { brand?: string; model?: string }) => void;
  className?: string;
}

/**
 * AdvancedBrandModelFilter
 * واجهة موحّدة نظيفة لاختيار "النوع والموديل" مع دعم البحث وتوافق كامل مع RTL
 * - تعتمد على UniversalBrandSelector لاختيار الماركة
 * - مكوّن داخلي مبسّط لاختيار الموديل بناءً على الماركة
 */
const AdvancedBrandModelFilter: React.FC<AdvancedBrandModelFilterProps> = ({
  brand,
  model,
  onChange,
  className = '',
}) => {
  // معرفة الماركة المختارة ومعلوماتها
  const brandInfo = useMemo(() => (brand ? findBrand(brand) : undefined), [brand]);
  const brandKey = useMemo(
    () => (brandInfo?.nameEn ? brandInfo.nameEn.toLowerCase() : ''),
    [brandInfo],
  );

  // خريطة موديلات محسّنة للماركات الشائعة، مع fallback لموديلات عامة
  const modelsMap: Record<string, string[]> = useMemo(
    () => ({
      toyota: ['كامري', 'كورولا', 'يارس', 'هايلكس', 'راف 4', 'لاند كروزر', 'برادو'],
      nissan: ['التيما', 'سنترا', 'مكسيما', 'باترول', 'اكس تريل', 'جوك', 'تيدا'],
      hyundai: ['النترا', 'سوناتا', 'توسان', 'سانتا في', 'اكسنت', 'كريتا'],
      kia: ['سيراتو', 'اوبتيما', 'سبورتاج', 'سورينتو', 'ريو', 'بيكانتو'],
      honda: ['اكورد', 'سيفيك', 'سي ار في', 'بايلوت', 'اوديسي', 'فيت'],
      mercedes: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class', 'CLA'],
      bmw: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X6'],
      audi: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'A8'],
    }),
    [],
  );

  const availableModels = useMemo<string[]>(() => {
    if (!brandKey) return [];
    return modelsMap[brandKey] || ['موديل عام'];
  }, [brandKey, modelsMap]);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // إغلاق النافذة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // تركيز تلقائي على البحث عند الفتح
  useEffect(() => {
    if (open && searchInputRef.current) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  const filteredModels = useMemo(() => {
    if (!search) return availableModels;
    const term = search.toLowerCase();
    return availableModels.filter((m) => m.toLowerCase().includes(term));
  }, [search, availableModels]);

  const handleBrandChange = (newBrand: string) => {
    // تعيين الماركة وتصغير الموديل
    onChange({ brand: newBrand, model: '' });
  };

  const handleModelSelect = (m: string) => {
    onChange({ model: m });
    setOpen(false);
    setSearch('');
  };

  const clearModel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ model: '' });
  };

  const modelDisabled = !brandKey || availableModels.length === 0;
  const modelPlaceholder = !brandKey
    ? 'اختر النوع أولاً'
    : availableModels.length === 0
      ? 'لا توجد موديلات متاحة'
      : 'اختر الموديل';

  return (
    <div className={`w-full ${className}`} dir="rtl">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* اختيار الماركة */}
        <div>
          <UniversalBrandSelector
            selectedBrand={brand}
            onBrandChange={handleBrandChange}
            placeholder="اختر نوع السيارة"
            variant="minimal"
            size="md"
            showSearch={true}
            showPopularFirst={true}
            gridColumns={1}
          />
        </div>

        {/* اختيار الموديل */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !modelDisabled && setOpen((v) => !v)}
            disabled={modelDisabled}
            className={`flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-right transition-all duration-200 ${
              modelDisabled
                ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                : 'border-gray-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            } ${model ? 'text-gray-900' : 'text-gray-500'}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <CogIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
              {model ? (
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{model}</span>
                  {!modelDisabled && (
                    <button
                      onClick={clearModel}
                      className="rounded-full p-1 transition-colors hover:bg-gray-100"
                      title="مسح الاختيار"
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
              ) : (
                <span className="truncate">{modelPlaceholder}</span>
              )}
            </div>

            <ChevronDownIcon
              className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
            />
          </button>

          {open && !modelDisabled && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
              {/* بحث */}
              {availableModels.length > 5 && (
                <div className="border-b border-gray-100 p-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="ابحث عن الموديل..."
                      className="w-full rounded-md border border-gray-200 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* قائمة الموديلات */}
              <div className="max-h-72 overflow-y-auto p-2">
                {filteredModels.length > 0 ? (
                  filteredModels.map((m) => (
                    <button
                      key={m}
                      onClick={() => handleModelSelect(m)}
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-right transition-colors duration-150 ${
                        model === m
                          ? 'border-l-2 border-blue-500 bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <CogIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{m}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">لا توجد نتائج</div>
                )}
              </div>

              {/* إحصائية عدد العناصر */}
              {availableModels.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50 p-2 text-center text-xs text-gray-500">
                  {filteredModels.length} من {availableModels.length} موديل متاح
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedBrandModelFilter;
