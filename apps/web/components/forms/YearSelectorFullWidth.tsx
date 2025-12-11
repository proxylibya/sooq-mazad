import React, { useState, useEffect } from 'react';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';

interface YearSelectorFullWidthProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  error?: string;
  required?: boolean;
  startYear?: number;
  endYear?: number;
}

const YearSelectorFullWidth: React.FC<YearSelectorFullWidthProps> = ({
  selectedYear,
  onYearChange,
  error,
  required = false,
  startYear = 2000,
  endYear = new Date().getFullYear(),
}) => {
  const [showAllYears, setShowAllYears] = useState(false);
  const [customYear, setCustomYear] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // إنشاء قائمة السنوات من 2000 إلى آخر سنة
  const generateYears = () => {
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
    return years;
  };

  const years = generateYears();
  const currentYear = new Date().getFullYear();

  // تصنيف السنوات
  const getYearCategory = (year: number) => {
    if (year >= currentYear - 3) return 'modern';
    if (year >= currentYear - 10) return 'recent';
    if (year >= 2000) return 'classic';
    return 'vintage';
  };

  const getYearCategoryColor = (category: string) => {
    switch (category) {
      case 'modern':
        return 'border-green-300 bg-green-25 hover:border-green-400';
      case 'recent':
        return 'border-blue-300 bg-blue-25 hover:border-blue-400';
      case 'classic':
        return 'border-amber-300 bg-amber-25 hover:border-amber-400';
      case 'vintage':
        return 'border-purple-300 bg-purple-25 hover:border-purple-400';
      default:
        return 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25';
    }
  };

  const getYearCategoryTextColor = (category: string) => {
    switch (category) {
      case 'modern':
        return 'text-green-700';
      case 'recent':
        return 'text-blue-700';
      case 'classic':
        return 'text-amber-700';
      case 'vintage':
        return 'text-purple-700';
      default:
        return 'text-gray-700';
    }
  };

  // معالجة التغيير في التاريخ المخصص
  const handleCustomYearChange = (value: string) => {
    setCustomYear(value);
    if (value && !isNaN(Number(value))) {
      onYearChange(value);
    }
  };

  // معالجة اختيار سنة من القائمة
  const handleYearSelect = (year: string) => {
    onYearChange(year);
    setCustomYear('');
    setShowCustomInput(false);
  };

  // معالجة تفعيل حقل التاريخ المخصص
  const handleCustomYearToggle = () => {
    setShowCustomInput(!showCustomInput);
    if (!showCustomInput) {
      setCustomYear('');
      onYearChange('');
    }
  };

  return (
    <div className="arabic-text w-full">
      <label className="mb-6 block text-base font-bold text-gray-700">
        سنة الصنع {required && <span className="text-red-500">*</span>}
      </label>

      <div className="space-y-6">
        {/* حقل التاريخ المخصص */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleCustomYearToggle}
            className={`arabic-text flex w-full cursor-pointer items-center justify-center rounded-xl border-2 p-4 text-base font-semibold transition-all duration-300 ease-in-out ${
              showCustomInput
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg ring-2 ring-indigo-200'
                : 'hover:bg-indigo-25 border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:shadow-md'
            } `}
          >
            <CalendarIcon className="ml-2 h-5 w-5" />
            {showCustomInput ? 'إلغاء التاريخ المخصص' : 'تاريخ مخصص'}
          </button>

          {showCustomInput && (
            <div className="bg-indigo-25 mt-4 rounded-xl border-2 border-indigo-200 p-4">
              <label className="arabic-text mb-2 block text-sm font-semibold text-indigo-700">
                أدخل السنة المخصصة
              </label>
              <input
                type="number"
                value={customYear}
                onChange={(e) => handleCustomYearChange(e.target.value)}
                placeholder="مثال: 1995"
                min="1900"
                max={currentYear}
                className="arabic-text w-full rounded-lg border-2 border-indigo-300 bg-white px-4 py-3 font-semibold text-indigo-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
              {customYear && (
                <p className="arabic-text mt-2 text-sm text-indigo-600">
                  تم اختيار: {customYear} سنة
                </p>
              )}
            </div>
          )}
        </div>

        {/* السنوات الشائعة (آخر 15 سنة) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {years.slice(0, 15).map((year) => {
            const category = getYearCategory(year);
            const isSelected = selectedYear === year.toString() && !showCustomInput;

            return (
              <label
                key={year}
                className={`arabic-text flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all duration-300 ease-in-out ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                    : getYearCategoryColor(category)
                } `}
              >
                <input
                  type="radio"
                  name="year"
                  value={year.toString()}
                  checked={isSelected}
                  onChange={() => handleYearSelect(year.toString())}
                  className="h-5 w-5 border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span
                  className={`year-text mr-3 text-base font-bold transition-colors duration-300 ${isSelected ? 'text-blue-900' : getYearCategoryTextColor(category)} `}
                >
                  {year} سنة
                </span>
              </label>
            );
          })}
        </div>

        {/* زر عرض جميع السنوات */}
        {years.length > 15 && (
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setShowAllYears(!showAllYears)}
              className="arabic-text rounded-xl px-6 py-3 text-base font-semibold text-blue-600 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {showAllYears ? 'إخفاء السنوات الأخرى' : `عرض جميع السنوات (${years.length - 15})`}
            </button>
          </div>
        )}

        {/* السنوات المتبقية */}
        {showAllYears && years.length > 15 && (
          <div className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {years.slice(15).map((year) => {
              const category = getYearCategory(year);
              const isSelected = selectedYear === year.toString() && !showCustomInput;

              return (
                <label
                  key={year}
                  className={`arabic-text flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all duration-300 ease-in-out ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                      : getYearCategoryColor(category)
                  } `}
                >
                  <input
                    type="radio"
                    name="year"
                    value={year.toString()}
                    checked={isSelected}
                    onChange={() => handleYearSelect(year.toString())}
                    className="h-5 w-5 border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span
                    className={`year-text mr-3 text-base font-bold transition-colors duration-300 ${isSelected ? 'text-blue-900' : getYearCategoryTextColor(category)} `}
                  >
                    {year} سنة
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {/* رسالة الخطأ */}
        {error && <p className="arabic-text mt-4 text-sm font-semibold text-red-500">{error}</p>}

        {/* معلومات إضافية */}
        <div className="mt-6 rounded-xl bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            <div className="rounded-lg bg-green-100 p-3">
              <div className="text-lg font-bold text-green-600">
                {years.filter((y) => y >= currentYear - 3).length}
              </div>
              <div className="arabic-text text-xs text-green-700">حديثة (آخر 3 سنوات)</div>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <div className="text-lg font-bold text-blue-600">
                {years.filter((y) => y >= currentYear - 10 && y < currentYear - 3).length}
              </div>
              <div className="arabic-text text-xs text-blue-700">حديثة نسبياً</div>
            </div>
            <div className="rounded-lg bg-amber-100 p-3">
              <div className="text-lg font-bold text-amber-600">
                {years.filter((y) => y >= 2000 && y < currentYear - 10).length}
              </div>
              <div className="arabic-text text-xs text-amber-700">كلاسيكية</div>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <div className="text-lg font-bold text-purple-600">
                {years.filter((y) => y < 2000).length}
              </div>
              <div className="arabic-text text-xs text-purple-700">تراثية</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearSelectorFullWidth;
