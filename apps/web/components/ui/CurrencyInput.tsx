import React, { useState, useEffect } from 'react';
import { formatNumber, convertToWesternNumerals } from '../../utils/numberUtils';

interface CurrencyInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  currency?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
  name?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  currency = 'د.ل',
  placeholder,
  min,
  max,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  id,
  name,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // تحديث القيمة المعروضة عند تغيير القيمة الخارجية
  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      const numericValue =
        typeof value === 'string'
          ? convertToWesternNumerals(value.replace(/[^\d.]/g, ''))
          : value.toString();
      setDisplayValue(numericValue);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // إزالة جميع الأحرف غير الرقمية باستثناء النقطة العشرية
    inputValue = inputValue.replace(/[^\d.]/g, '');

    // التأكد من وجود نقطة عشرية واحدة فقط
    const parts = inputValue.split('.');
    if (parts.length > 2) {
      inputValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // تحويل إلى أرقام غربية
    inputValue = convertToWesternNumerals(inputValue);

    // التحقق من الحد الأقصى فقط أثناء الكتابة
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue)) {
      if (max !== undefined && numericValue > max) {
        return;
      }
    }

    setDisplayValue(inputValue);
    onChange(inputValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);

    // تنسيق القيمة عند فقدان التركيز
    if (displayValue && !isNaN(parseFloat(displayValue))) {
      const formattedValue = parseFloat(displayValue).toString();
      setDisplayValue(formattedValue);
      onChange(formattedValue);
    }
  };

  const inputId = id || `currency-input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`currency-input-wrapper ${className}`}>
      {/* حاوي الحقل */}
      <div className="relative">
        <input
          type="text"
          id={inputId}
          name={name}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`h-10 w-full rounded-lg border px-4 pr-16 text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'} ${disabled ? 'cursor-not-allowed bg-gray-50' : 'bg-white'} ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-20' : ''} `}
          style={{
            direction: 'ltr',
            textAlign: 'left',
            unicodeBidi: 'embed',
            fontVariantNumeric: 'lining-nums',
            WebkitFontFeatureSettings: '"lnum"',
            fontFeatureSettings: '"lnum"',
          }}
          inputMode="decimal"
          autoComplete="off"
        />

        {/* رمز العملة */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-sm font-medium text-gray-500">{currency}</span>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* النص المساعد */}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}

      {/* عرض الحد الأقصى فقط */}
      {max !== undefined && !error && !helperText && (
        <div className="mt-1 text-left text-xs text-gray-500">
          <span>
            الحد الأقصى: {formatNumber(max)} {currency}
          </span>
        </div>
      )}
    </div>
  );
};

export default CurrencyInput;
