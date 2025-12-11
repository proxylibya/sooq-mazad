import React, { useState, useRef, useEffect } from 'react';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';

interface SelectFieldProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  options,
  value,
  onChange,
  placeholder = 'اختر خياراً',
  searchable = false,
  clearable = false,
  disabled = false,
  className = '',
  label,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // فلترة الخيارات بناءً على البحث
  const filteredOptions =
    searchable && searchTerm
      ? options.filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase()))
      : options;

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // التركيز على حقل البحث عند فتح القائمة
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleOptionSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}

      {/* حقل الاختيار */}
      <div
        className={`relative w-full cursor-pointer rounded-lg border bg-white px-3 py-2 text-right shadow-sm transition-colors ${
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-50'
            : isOpen
              ? 'border-blue-500 ring-1 ring-blue-500'
              : error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500'
        } `}
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>

          <span className={`block truncate ${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {value || placeholder}
          </span>
        </div>
      </div>

      {/* قائمة الخيارات */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {searchable && (
            <div className="border-b border-gray-200 p-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="البحث..."
                  className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full px-3 py-2 text-right text-sm transition-colors hover:bg-gray-100 ${
                    value === option ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-900'
                  } `}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-center text-sm text-gray-500">لا توجد نتائج</div>
            )}
          </div>
        </div>
      )}

      {/* رسالة الخطأ */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SelectField;
