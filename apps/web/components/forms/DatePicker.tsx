/**
 * منتقي التاريخ
 */

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: string;
  className?: string;
  format?: string;
  locale?: string;
}

const DAYS_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'اختر تاريخ',
  minDate,
  maxDate,
  disabled = false,
  error,
  className = '',
  format = 'yyyy-MM-dd',
  locale = 'ar-LY',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (!isDateDisabled(newDate)) {
      onChange?.(newDate);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange?.(null);
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const days: React.ReactNode[] = [];

    // أيام فارغة قبل بداية الشهر
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // أيام الشهر
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const isSelected = value && isSameDay(date, value);
      const isToday = isSameDay(date, new Date());
      const isDisabled = isDateDisabled(date);

      days.push(
        <button
          key={day}
          type="button"
          disabled={isDisabled}
          onClick={() => handleSelectDate(day)}
          className={`rounded-lg p-2 text-sm transition-colors ${isSelected ? 'bg-blue-600 text-white' : ''} ${isToday && !isSelected ? 'bg-blue-100 text-blue-700' : ''} ${isDisabled ? 'cursor-not-allowed text-gray-300' : 'hover:bg-gray-100'} `}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-right ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'cursor-not-allowed bg-gray-100' : 'hover:border-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <CalendarIcon className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          {/* رأس التقويم */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded p-1 hover:bg-gray-100"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="font-medium">
              {MONTHS_AR[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded p-1 hover:bg-gray-100"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* أسماء الأيام */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAYS_AR.map((day) => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* شبكة الأيام */}
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

          {/* أزرار إضافية */}
          <div className="mt-4 flex justify-between border-t pt-4">
            <button
              type="button"
              onClick={() => {
                onChange?.(new Date());
                setIsOpen(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              اليوم
            </button>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                مسح
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default DatePicker;
