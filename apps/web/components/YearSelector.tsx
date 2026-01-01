import SelectField from './ui/SelectField';
import React, { useMemo } from 'react';
import { carYears } from '../data/simple-filters';

interface YearSelectorProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  startYear?: number;
  endYear?: number;
}

const YearSelector: React.FC<YearSelectorProps> = ({
  selectedYear,
  onYearChange,
  placeholder = 'اختر السنة',
  className = '',
  disabled = false,
  required = false,
  startYear,
  endYear,
}) => {
  // تحويل السنوات إلى تنسيق المكون البسيط
  const options = useMemo(() => {
    // تحديد نطاق السنوات
    const actualStartYear = startYear || Math.min(...carYears);
    const actualEndYear = endYear || Math.max(...carYears);

    // فلترة السنوات حسب النطاق المطلوب
    const filteredYears = carYears.filter(
      (year) => year >= actualStartYear && year <= actualEndYear,
    );

    return filteredYears.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    }));
  }, [startYear, endYear]);

  return (
    <SelectField
      options={options.map((opt) => opt.label)}
      value={selectedYear}
      onChange={onYearChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      searchable
      clearable
    />
  );
};

export default YearSelector;
