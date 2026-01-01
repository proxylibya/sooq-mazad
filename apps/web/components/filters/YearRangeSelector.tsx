import React, { useState } from 'react';
import SelectField from '../ui/SelectField';

interface YearRangeSelectorProps {
  fromYear?: string;
  toYear?: string;
  onFromYearChange: (year: string) => void;
  onToYearChange: (year: string) => void;
  className?: string;
}

const YearRangeSelector: React.FC<YearRangeSelectorProps> = ({
  fromYear,
  toYear,
  onFromYearChange,
  onToYearChange,
  className = '',
}) => {
  // إنشاء قائمة السنوات من السنة الحالية إلى 1990
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => {
    const year = currentYear - i;
    return year.toString();
  });

  // إضافة خيار "جميع السنوات"
  const yearOptions = ['جميع السنوات', ...years];

  // فلترة سنوات "إلى" بناءً على سنة "من"
  const getToYearOptions = () => {
    if (!fromYear) return yearOptions;

    const fromYearNum = parseInt(fromYear);
    const filteredYears = years.filter((year) => parseInt(year.value) <= fromYearNum);

    return [{ value: '', label: 'جميع السنوات' }, ...filteredYears];
  };

  // فلترة سنوات "من" بناءً على سنة "إلى"
  const getFromYearOptions = () => {
    if (!toYear) return yearOptions;

    const toYearNum = parseInt(toYear);
    const filteredYears = years.filter((year) => parseInt(year.value) >= toYearNum);

    return [{ value: '', label: 'جميع السنوات' }, ...filteredYears];
  };

  const handleFromYearChange = (year: string) => {
    onFromYearChange(year);

    // إذا كانت سنة "إلى" أكبر من سنة "من" الجديدة، قم بإعادة تعيينها
    if (toYear && year && parseInt(toYear) > parseInt(year)) {
      onToYearChange('');
    }
  };

  const handleToYearChange = (year: string) => {
    onToYearChange(year);

    // إذا كانت سنة "من" أصغر من سنة "إلى" الجديدة، قم بإعادة تعيينها
    if (fromYear && year && parseInt(fromYear) < parseInt(year)) {
      onFromYearChange('');
    }
  };

  return (
    <div className={`year-range-selector ${className}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* سنة من */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">من سنة</label>
          <SelectField
            options={getFromYearOptions()}
            value={fromYear || ''}
            onChange={handleFromYearChange}
            placeholder="اختر السنة"
            searchable
            clearable
          />
        </div>

        {/* سنة إلى */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">إلى سنة</label>
          <SelectField
            options={getToYearOptions()}
            value={toYear || ''}
            onChange={handleToYearChange}
            placeholder="اختر السنة"
            searchable
            clearable
          />
        </div>
      </div>

      {/* عرض النطاق المحدد */}
      {(fromYear || toYear) && (
        <div className="mt-3 rounded-lg bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            النطاق المحدد:
            {fromYear && toYear
              ? ` من ${fromYear} إلى ${toYear}`
              : fromYear
                ? ` من ${fromYear} وما بعد`
                : ` حتى ${toYear} وما قبل`}
          </p>
        </div>
      )}
    </div>
  );
};

export default YearRangeSelector;
