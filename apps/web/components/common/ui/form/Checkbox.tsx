import React from 'react';

export interface CheckboxProps {
  id: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

/**
 * مكون Checkbox موحد يحل مشاكل المحاذاة بين الأيقونات والنصوص
 * 
 * @example
 * ```tsx
 * <Checkbox
 *   id="verified"
 *   checked={isVerified}
 *   onChange={setIsVerified}
 *   label="حساب محقق"
 *   icon={<ShieldCheckIcon className="h-4 w-4" />}
 * />
 * ```
 */
const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
  icon,
  disabled = false,
  className = '',
  labelClassName = '',
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        name={name || id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <label
        htmlFor={id}
        className={`mr-2 inline-flex items-center text-sm text-gray-700 ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${labelClassName}`}
      >
        {icon && <span className="ml-1 flex items-center">{icon}</span>}
        <span>{label}</span>
      </label>
    </div>
  );
};

export default Checkbox;
