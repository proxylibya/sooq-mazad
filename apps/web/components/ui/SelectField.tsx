import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import ChevronUpIcon from '@heroicons/react/24/outline/ChevronUpIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  options: Option[] | string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean; // يقلل من ارتفاع القائمة المنسدلة
}

const SelectField: React.FC<SelectFieldProps> = ({
  options,
  value,
  onChange,
  placeholder = 'اختر من القائمة',
  label,
  error,
  disabled = false,
  className = '',
  required = false,
  clearable = true,
  searchable = true,
  searchPlaceholder = 'ابحث...',
  size = 'md',
  compact = false,
}) => {
  // تحويل الخيارات إلى تنسيق موحد مع useMemo لتجنب إعادة الإنشاء
  const normalizedOptions: Option[] = useMemo(
    () =>
      options.map((option) =>
        typeof option === 'string' ? { value: option, label: option } : option,
      ),
    [options],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(normalizedOptions);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [isPositioned, setIsPositioned] = useState(false); // للتحكم في الظهور
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // أحجام المكون
  const sizeClasses = {
    sm: 'h-10 px-3 py-2 text-sm',
    md: 'h-12 px-4 py-3 text-base',
    lg: 'h-14 px-4 py-3 text-lg',
  };

  // ضبط ارتفاع القائمة بحسب الوضع
  const dropdownMaxClass = compact ? 'max-h-64' : 'max-h-80';
  const listMaxClass = compact ? 'max-h-80' : 'max-h-60';

  // تصفية الخيارات بناءً على البحث
  useEffect(() => {
    if (searchTerm && searchable) {
      const filtered = normalizedOptions.filter(
        (option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.value.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(normalizedOptions);
    }
  }, [searchTerm, normalizedOptions, searchable]);

  // تحديد موضع القائمة المنسدلة بشكل فوري
  const calculatePosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // حساب الموضع المناسب
      const newPosition = spaceBelow < 300 && spaceAbove > spaceBelow ? 'top' : 'bottom';
      setDropdownPosition(newPosition);

      // السماح بالظهور بعد حساب الموضع
      requestAnimationFrame(() => {
        setIsPositioned(true);
      });
    }
  };

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsPositioned(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // التركيز على حقل البحث عند فتح القائمة (بدون تأخير)
  useEffect(() => {
    if (isOpen && isPositioned && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, isPositioned, searchable]);

  const handleToggleOpen = () => {
    if (!disabled) {
      if (!isOpen) {
        // قبل فتح القائمة، احسب الموضع أولاً
        setIsPositioned(false);
        setIsOpen(true);
        calculatePosition();
      } else {
        // عند الإغلاق
        setIsOpen(false);
        setIsPositioned(false);
      }
    }
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setIsPositioned(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  const selectedOption = normalizedOptions.find((option) => option.value === value);

  return (
    <div
      className={`searchable-select-container relative ${className} ${isOpen ? 'is-open' : ''}`}
      ref={dropdownRef}
      style={{
        zIndex: isOpen ? 99998 : 'auto',
        position: 'relative',
      }}
    >
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="mr-1 text-red-500">*</span>}
        </label>
      )}

      {/* الحاوية الرئيسية للزر */}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggleOpen}
          disabled={disabled}
          className={`flex w-full items-center justify-between rounded-lg text-right transition-all duration-200 ${sizeClasses[size]} ${
            error
              ? 'border border-red-300 bg-red-50'
              : 'border border-gray-300 bg-white shadow-sm hover:border-gray-400'
          } ${disabled ? 'cursor-not-allowed border border-gray-200 bg-gray-100' : 'cursor-pointer'} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <span
            className={`flex-1 text-right ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronUpIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </button>

        {/* زر المسح منفصل خارج الزر الرئيسي */}
        {value && !disabled && clearable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* رسالة الخطأ */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div
          className={`searchable-select-dropdown absolute ${dropdownMaxClass} w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-all duration-150 ${
            dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${isPositioned ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          style={{
            zIndex: 99999,
            position: 'absolute',
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* حقل البحث */}
          {searchable && (
            <div className="border-b border-gray-200 p-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder || 'ابحث...'}
                  className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* قائمة الخيارات */}
          <div className={`${listMaxClass} overflow-y-auto px-2 py-2`}>
            {filteredOptions.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full rounded-lg px-4 py-2.5 text-right transition-all duration-150 hover:bg-blue-50 ${
                      value === option.value
                        ? 'bg-blue-100 font-medium text-blue-700'
                        : 'text-gray-800 hover:text-blue-600'
                    } `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500">لا توجد نتائج</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectField;
export type { Option, SelectFieldProps };
