import React from 'react';

export interface RoundCheckboxProps {
  id?: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * مكون RoundCheckbox موحد - يحل مشكلة محاذاة علامة الصح داخل الدائرة
 *
 * الحل لمشكلة المحاذاة:
 * 1. استخدام shrink-0 لمنع تقلص العنصر
 * 2. استخدام SVG بنمط stroke بدلاً من fill للحصول على علامة صح متمركزة
 * 3. viewBox محسوب بدقة لضمان التمركز
 *
 * @example
 * ```tsx
 * <RoundCheckbox
 *   checked={rememberMe}
 *   onChange={setRememberMe}
 * />
 * ```
 */
const RoundCheckbox: React.FC<RoundCheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  const iconSizeClasses = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  const strokeWidths = {
    sm: 3.5,
    md: 3,
    lg: 2.5,
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={`flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
          sizeClasses[size]
        } ${
          checked
            ? 'border-blue-600 bg-blue-600 shadow-md'
            : 'border-gray-300 bg-white hover:border-blue-400'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        {checked && (
          <svg
            className={`${iconSizeClasses[size]} text-white`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidths[size]}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default RoundCheckbox;
