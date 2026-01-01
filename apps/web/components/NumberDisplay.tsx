import React from 'react';
import { convertToEnglishNumbers, formatLargeNumber } from '../utils/arabicNumbers';

interface NumberDisplayProps {
  value: string | number;
  type?: 'phone' | 'price' | 'count' | 'year' | 'mileage' | 'general';
  className?: string;
  prefix?: string;
  suffix?: string;
  showCommas?: boolean;
  clickable?: boolean;
  href?: string;
}

const NumberDisplay: React.FC<NumberDisplayProps> = ({
  value,
  type = 'general',
  className = '',
  prefix = '',
  suffix = '',
  showCommas = false,
  clickable = false,
  href,
}) => {
  // تحويل القيمة إلى نص وتنظيفها
  const stringValue = value.toString();
  const cleanValue = convertToEnglishNumbers(stringValue);

  // تنسيق القيمة حسب النوع
  const formatValue = (val: string, valueType: string): string => {
    switch (valueType) {
      case 'phone':
        // تنسيق رقم الهاتف
        const phoneDigits = val.replace(/\D/g, '');
        if (phoneDigits.length === 9) {
          return `${phoneDigits.slice(0, 2)}-${phoneDigits.slice(2, 5)}-${phoneDigits.slice(5)}`;
        } else if (phoneDigits.length === 10) {
          return `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}`;
        }
        return phoneDigits;

      case 'price':
      case 'count':
      case 'mileage':
        // تنسيق الأرقام مع فواصل
        const numValue = parseFloat(val.replace(/[^\d.]/g, ''));
        return isNaN(numValue) ? val : formatLargeNumber(numValue);

      case 'year':
        // تنسيق السنة (4 أرقام)
        const yearValue = val.replace(/\D/g, '');
        return yearValue;

      default:
        // تنسيق عام
        return showCommas && !isNaN(parseFloat(val)) ? formatLargeNumber(parseFloat(val)) : val;
    }
  };

  const formattedValue = formatValue(cleanValue, type);
  const displayValue = `${prefix}${formattedValue}${suffix}`;

  // تحديد الكلاسات حسب النوع
  const getTypeClasses = (valueType: string): string => {
    const baseClasses = 'font-variant-numeric-lining font-feature-lnum';

    switch (valueType) {
      case 'phone':
        return `${baseClasses} font-mono text-left`;
      case 'price':
        return `${baseClasses} font-semibold text-left`;
      case 'count':
        return `${baseClasses} font-medium text-center`;
      case 'year':
        return `${baseClasses} font-medium text-center`;
      case 'mileage':
        return `${baseClasses} font-medium text-left`;
      default:
        return `${baseClasses} text-left`;
    }
  };

  const typeClasses = getTypeClasses(type);
  const combinedClasses = `${typeClasses} ${className}`;

  // إنشاء العنصر
  const numberElement = (
    <span
      className={combinedClasses}
      dir="ltr"
      style={{
        fontVariantNumeric: 'lining-nums',
        fontFeatureSettings: '"lnum"',
        unicodeBidi: 'embed',
      }}
    >
      {displayValue}
    </span>
  );

  // إذا كان قابل للنقر
  if (clickable && href) {
    return (
      <a
        href={href}
        className={`inline-flex items-center transition-colors hover:text-blue-600 ${className}`}
        dir="ltr"
      >
        {numberElement}
      </a>
    );
  }

  return numberElement;
};

// مكونات مخصصة لكل نوع
export const PhoneNumber: React.FC<Omit<NumberDisplayProps, 'type'>> = (props) => (
  <NumberDisplay {...props} type="phone" />
);

export const Price: React.FC<Omit<NumberDisplayProps, 'type'>> = (props) => (
  <NumberDisplay {...props} type="price" showCommas={true} />
);

export const Count: React.FC<Omit<NumberDisplayProps, 'type'>> = (props) => (
  <NumberDisplay {...props} type="count" showCommas={true} />
);

export const Year: React.FC<Omit<NumberDisplayProps, 'type'>> = (props) => (
  <NumberDisplay {...props} type="year" />
);

export const Mileage: React.FC<Omit<NumberDisplayProps, 'type'>> = (props) => (
  <NumberDisplay {...props} type="mileage" showCommas={true} />
);

export default NumberDisplay;
