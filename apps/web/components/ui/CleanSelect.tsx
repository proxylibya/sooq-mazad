/**
 * مكون Select نظيف ومحسن
 */

import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface CleanSelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  searchable?: boolean;
  clearable?: boolean;
  name?: string;
  id?: string;
}

export function CleanSelect({
  options,
  value,
  onChange,
  placeholder = 'اختر...',
  label,
  error,
  disabled = false,
  required = false,
  className = '',
  size = 'md',
  searchable = false,
  clearable = false,
  name,
  id,
}: CleanSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="mr-1 text-red-500">*</span>}
        </label>
      )}

      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white hover:border-gray-400'} ${sizeClasses[size]} transition-colors duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <div className="flex items-center gap-1">
          {clearable && value && (
            <button type="button" onClick={handleClear} className="rounded p-1 hover:bg-gray-100">
              ×
            </button>
          )}
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
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

          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">لا توجد نتائج</div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center justify-between px-4 py-2 text-right ${option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'} ${option.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'} transition-colors`}
              >
                <span className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>
                {option.value === value && <CheckIcon className="h-5 w-5 text-blue-600" />}
              </button>
            ))
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default CleanSelect;
