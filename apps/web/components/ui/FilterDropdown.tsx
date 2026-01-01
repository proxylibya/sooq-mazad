import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import React, { useEffect, useRef, useState } from 'react';

interface FilterDropdownProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'اختر...',
  icon,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // حساب موضع القائمة وإغلاقها عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // حساب موضع القائمة عند فتحها
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 320; // max-h-80 = 320px تقريباً

      // إذا لم يكن هناك مساحة كافية في الأسفل، اعرضها في الأعلى
      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`appearance-none rounded-lg border border-gray-300 bg-white py-2 text-sm transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${icon ? 'pl-8 pr-10' : 'pl-3 pr-10'} w-full text-right`}
      >
        {selectedOption ? selectedOption.label : placeholder}
      </button>

      {/* أيقونة اليمين (إن وجدت) */}
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <div className="h-4 w-4 text-gray-400">{icon}</div>
        </div>
      )}

      {/* سهم القائمة المنسدلة - اليسار */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <ChevronDownIcon
          className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 max-h-80 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg ${
            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-right text-sm transition-colors hover:bg-gray-50 ${value === option.value ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-900'} `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
