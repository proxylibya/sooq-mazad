import React, { useState, useRef, useEffect, useMemo } from 'react';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import {
  getSortedBrands,
  searchBrands,
  getBrandInfo,
  popularBrands,
  brandStats,
} from '../data/car-brands-logos';
import UniversalBrandLogo from './UniversalBrandLogo';

interface UniversalBrandSelectorProps {
  /** الماركة المختارة */
  selectedBrand: string;
  /** دالة تغيير الماركة */
  onBrandChange: (brand: string) => void;
  /** النص التوضيحي */
  placeholder?: string;
  /** كلاس CSS إضافي */
  className?: string;
  /** حقل مطلوب */
  required?: boolean;
  /** معطل */
  disabled?: boolean;
  /** إظهار البحث */
  showSearch?: boolean;
  /** إظهار الشائعة أولاً */
  showPopularFirst?: boolean;
  /** نمط العرض */
  variant?: 'default' | 'opensooq' | 'minimal' | 'compact';
  /** حجم المكون */
  size?: 'sm' | 'md' | 'lg';
  /** إظهار الإحصائيات */
  showStats?: boolean;
  /** إظهار الفئات */
  showCategories?: boolean;
  /** فلترة حسب الفئة */
  filterByCategory?: string[];
  /** عدد الأعمدة في الشبكة */
  gridColumns?: 1 | 2 | 3 | 4;
}

const UniversalBrandSelector: React.FC<UniversalBrandSelectorProps> = ({
  selectedBrand,
  onBrandChange,
  placeholder = 'اختر نوع السيارة',
  className = '',
  required = false,
  disabled = false,
  showSearch = true,
  showPopularFirst = true,
  variant = 'default',
  size = 'md',
  showStats = false,
  showCategories = false,
  filterByCategory = [],
  gridColumns = 1,
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

  // فلترة وترتيب الماركات
  const filteredBrands = useMemo(() => {
    let brands = searchTerm ? searchBrands(searchTerm) : getSortedBrands(showPopularFirst);

    // فلترة حسب الفئة إذا كانت محددة
    if (filterByCategory.length > 0) {
      brands = brands.filter(
        (brand) => brand.category && filterByCategory.includes(brand.category),
      );
    }

    return brands;
  }, [searchTerm, showPopularFirst, filterByCategory]);

  // الماركات الشائعة المفلترة
  const filteredPopularBrands = useMemo(
    () => filteredBrands.filter((brand) => brand.popular),
    [filteredBrands],
  );

  // الماركات العادية المفلترة
  const filteredRegularBrands = useMemo(
    () => filteredBrands.filter((brand) => !brand.popular),
    [filteredBrands],
  );

  // معلومات الماركة المختارة
  const selectedBrandInfo = useMemo(() => getBrandInfo(selectedBrand), [selectedBrand]);

  // أحجام المكون
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  // أنماط العرض
  const variantClasses = {
    default:
      'border-gray-300 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    opensooq:
      'border-2 border-orange-200 bg-gradient-to-r from-white to-orange-50 hover:border-orange-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20',
    minimal:
      'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 focus:bg-white focus:border-gray-400',
    compact: 'border-gray-300 bg-white hover:border-gray-400 focus:border-gray-500',
  };

  // كلاسات الشبكة
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const handleBrandSelect = (brandName: string) => {
    onBrandChange(brandName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBrandChange('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* زر الاختيار الرئيسي */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border transition-all duration-200 ${
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            : variantClasses[variant]
        } ${sizeClasses[size]} ${
          isOpen ? 'ring-2' : ''
        } ${selectedBrand ? 'text-gray-900' : 'text-gray-500'}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {selectedBrandInfo ? (
            <>
              <UniversalBrandLogo
                brandName={selectedBrandInfo.name}
                size={size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm'}
                variant="rounded"
                style={variant === 'opensooq' ? 'opensooq' : 'bordered'}
                showPopularBadge={variant === 'opensooq'}
              />
              <div className="min-w-0 flex-1 text-right">
                <span className="truncate font-medium">{selectedBrandInfo.name}</span>
                {variant === 'opensooq' && selectedBrandInfo.origin && (
                  <div className="text-xs text-gray-500">{selectedBrandInfo.origin}</div>
                )}
              </div>
              {!disabled && (
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
            <span className="truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDownIcon
          className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-hidden rounded-xl border-2 shadow-2xl ${
            variant === 'opensooq' ? 'border-orange-200 bg-white' : 'border-gray-200 bg-white'
          }`}
        >
          {/* حقل البحث */}
          {showSearch && (
            <div
              className={`border-b p-4 ${
                variant === 'opensooq'
                  ? 'border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="relative">
                <MagnifyingGlassIcon
                  className={`absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform ${
                    variant === 'opensooq' ? 'text-orange-400' : 'text-gray-400'
                  }`}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن نوع السيارة..."
                  className={`w-full rounded-lg border-2 bg-white py-3 pl-4 pr-12 text-sm ${
                    variant === 'opensooq'
                      ? 'border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
              </div>
            </div>
          )}

          {/* قائمة العلامات التجارية */}
          <div className="max-h-80 overflow-y-auto">
            {filteredBrands.length > 0 ? (
              <>
                {/* العلامات التجارية الشائعة */}
                {showPopularFirst && filteredPopularBrands.length > 0 && (
                  <div className="p-3">
                    <div
                      className={`mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${
                        variant === 'opensooq'
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <StarSolidIcon className="h-4 w-4" />
                      العلامات الشائعة
                    </div>
                    <div className={`grid gap-2 ${gridClasses[gridColumns]}`}>
                      {filteredPopularBrands.map((brand) => (
                        <BrandOption
                          key={brand.name}
                          brand={brand}
                          isSelected={selectedBrand === brand.name}
                          onClick={() => handleBrandSelect(brand.name)}
                          variant={variant}
                          size={size}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* باقي العلامات التجارية */}
                {filteredRegularBrands.length > 0 && (
                  <div className="p-3">
                    {showPopularFirst && filteredPopularBrands.length > 0 && (
                      <div className="mb-2 px-3 py-1 text-sm font-medium text-gray-500">
                        جميع العلامات
                      </div>
                    )}
                    <div className={`grid gap-2 ${gridClasses[gridColumns]}`}>
                      {filteredRegularBrands.map((brand) => (
                        <BrandOption
                          key={brand.name}
                          brand={brand}
                          isSelected={selectedBrand === brand.name}
                          onClick={() => handleBrandSelect(brand.name)}
                          variant={variant}
                          size={size}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                لا توجد نتائج للبحث "{searchTerm}"
              </div>
            )}
          </div>

          {/* إحصائيات */}
          {showStats && (
            <div
              className={`border-t p-3 ${
                variant === 'opensooq'
                  ? 'border-orange-100 bg-gradient-to-r from-gray-50 to-orange-50'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-center text-sm text-gray-600">
                <span>
                  {filteredBrands.length} من {brandStats.total} علامة تجارية
                </span>
                <span className={variant === 'opensooq' ? 'text-orange-500' : 'text-blue-500'}>
                  •
                </span>
                <span>{brandStats.withLogos} شعار متوفر</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* علامة الحقل المطلوب */}
      {required && <span className="absolute -right-2 -top-2 text-lg text-red-500">*</span>}
    </div>
  );
};

// مكون خيار الماركة
interface BrandOptionProps {
  brand: any;
  isSelected: boolean;
  onClick: () => void;
  variant: string;
  size: string;
}

const BrandOption: React.FC<BrandOptionProps> = ({ brand, isSelected, onClick, variant, size }) => {
  const selectedClasses =
    variant === 'opensooq'
      ? 'border-2 border-orange-300 bg-orange-100 text-orange-800 shadow-sm'
      : 'border-2 border-blue-300 bg-blue-50 text-blue-700 shadow-sm';

  const hoverClasses =
    variant === 'opensooq'
      ? 'hover:border-orange-200 hover:bg-orange-50'
      : 'hover:border-blue-200 hover:bg-blue-50';

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-lg px-4 py-3 text-right transition-all duration-200 ${
        isSelected ? selectedClasses : `border-2 border-transparent text-gray-700 ${hoverClasses}`
      }`}
    >
      <UniversalBrandLogo
        brandName={brand.name}
        size={size === 'sm' ? 'sm' : 'md'}
        variant="rounded"
        style={variant === 'opensooq' ? 'opensooq' : 'bordered'}
        showPopularBadge={variant === 'opensooq' && brand.popular}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{brand.name}</div>
        {variant === 'opensooq' && brand.origin && (
          <div className="text-xs text-gray-500">{brand.origin}</div>
        )}
      </div>
    </button>
  );
};

export default UniversalBrandSelector;
