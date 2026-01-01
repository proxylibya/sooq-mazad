import React from 'react';
import CleanSelect from './ui/CleanSelect';

interface SimpleYearRangeProps {
  yearFrom: string;
  yearTo: string;
  onYearFromChange: (year: string) => void;
  onYearToChange: (year: string) => void;
  className?: string;
}

const SimpleYearRange: React.FC<SimpleYearRangeProps> = ({
  yearFrom,
  yearTo,
  onYearFromChange,
  onYearToChange,
  className = '',
}) => {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear; year >= 1990; year--) {
    years.push(year.toString());
  }

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <div>
        <CleanSelect
          label="من سنة"
          options={years.map((year) => year.toString())}
          value={yearFrom}
          onChange={onYearFromChange}
          placeholder="أي سنة"
        />
      </div>

      <div>
        <CleanSelect
          label="إلى سنة"
          options={years.map((year) => year.toString())}
          value={yearTo}
          onChange={onYearToChange}
          placeholder="أي سنة"
        />
      </div>
    </div>
  );
};

export default SimpleYearRange;
