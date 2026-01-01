import React, { useMemo } from 'react';
import SelectField from './ui/SelectField';

export interface YearRangeSelectorProps {
  yearFrom: string;
  yearTo: string;
  onYearFromChange: (year: string) => void;
  onYearToChange: (year: string) => void;
  labelFrom?: string;
  labelTo?: string;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

/**
 * YearRangeSelector
 *
 * مكون بسيط لاختيار نطاق السنوات، متوافق مع الاستخدامات الحالية في الفلاتر.
 * يعتمد على SelectField الموجود، ولا يغير من تصميم الواجهة.
 */
const YearRangeSelector: React.FC<YearRangeSelectorProps> = ({
  yearFrom,
  yearTo,
  onYearFromChange,
  onYearToChange,
  labelFrom = 'من سنة',
  labelTo = 'إلى سنة',
  minYear = 1980,
  maxYear,
  className = '',
}) => {
  // تحديد أقصى سنة: السنة الحالية افتراضياً
  const computedMaxYear = useMemo(() => {
    if (maxYear && Number.isFinite(maxYear)) return maxYear as number;
    try {
      return new Date().getFullYear();
    } catch {
      return 2025;
    }
  }, [maxYear]);

  // توليد قائمة السنوات كسلسلة نصية بما يتوافق مع SelectField (string[] | Option[])
  const years: string[] = useMemo(() => {
    const start = Math.min(minYear, computedMaxYear);
    const end = Math.max(minYear, computedMaxYear);
    const arr: string[] = [];
    for (let y = end; y >= start; y--) arr.push(String(y));
    return arr;
  }, [minYear, computedMaxYear]);

  return (
    <div className={`grid grid-cols-1 gap-3 md:grid-cols-2 ${className}`}>
      <div>
        <SelectField
          options={years}
          value={yearFrom || ''}
          onChange={(val: string) => onYearFromChange(val)}
          placeholder={labelFrom}
          searchable={true}
          label={labelFrom}
        />
      </div>
      <div>
        <SelectField
          options={years}
          value={yearTo || ''}
          onChange={(val: string) => onYearToChange(val)}
          placeholder={labelTo}
          searchable={true}
          label={labelTo}
        />
      </div>
    </div>
  );
};

export default YearRangeSelector;
