/**
 * قائمة منسدلة عالمية
 */

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ReactNode, useEffect, useRef, useState } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  description?: string;
}

export interface UniversalDropdownProps {
  options: DropdownOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  position?: 'bottom' | 'top' | 'auto';
  maxHeight?: number;
  renderOption?: (option: DropdownOption) => ReactNode;
  renderValue?: (selected: DropdownOption | DropdownOption[]) => ReactNode;
}

export function UniversalDropdown({
  options,
  value,
  onChange,
  placeholder = 'اختر...',
  label,
  multiple = false,
  searchable = false,
  disabled = false,
  error,
  className = '',
  position = 'bottom',
  maxHeight = 300,
  renderOption,
  renderValue,
}: UniversalDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  const displayValue = () => {
    if (selectedOptions.length === 0) return placeholder;
    if (renderValue) {
      return renderValue(multiple ? selectedOptions : selectedOptions[0]);
    }
    if (multiple) {
      return `${selectedOptions.length} عنصر محدد`;
    }
    return selectedOptions[0]?.label;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-right ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'cursor-not-allowed bg-gray-100' : 'hover:border-gray-400'} transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <span className={selectedOptions.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
          {displayValue()}
        </span>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ${position === 'top' ? 'bottom-full mb-1' : ''} `}
          style={{ maxHeight }}
        >
          {searchable && (
            <div className="border-b p-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          )}

          <div className="overflow-y-auto" style={{ maxHeight: maxHeight - (searchable ? 60 : 0) }}>
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">لا توجد نتائج</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-right ${selectedValues.includes(option.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'} ${option.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'} transition-colors`}
                >
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      readOnly
                      className="h-4 w-4 rounded text-blue-600"
                    />
                  )}
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                      {option.description && (
                        <p className="mt-0.5 text-sm text-gray-500">{option.description}</p>
                      )}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default UniversalDropdown;
