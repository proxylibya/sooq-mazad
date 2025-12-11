/**
 * مكون إدخال رقم الهاتف - Wrapper للمكون الموحد
 * يستخدم UnifiedPhoneInput للتوافق مع الاستخدامات السابقة
 *
 * @deprecated استخدم UnifiedPhoneInput مباشرة
 */

import React from 'react';
import UnifiedPhoneInput, { arabCountries, type Country } from './UnifiedPhoneInput';

// تصدير الأنواع وقائمة الدول للتوافق مع الكود القديم
export { arabCountries };
export type { Country };

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (country: Country) => void;
  onEnterPress?: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  autoFocus?: boolean;
  defaultCountry?: string;
  allowCountrySelection?: boolean; // للتوافق مع الاستخدامات السابقة
}

/**
 * PhoneInputField - مكون إدخال رقم الهاتف
 * Wrapper للمكون الموحد UnifiedPhoneInput
 */
const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  value,
  onChange,
  onCountryChange,
  onEnterPress,
  placeholder = 'أدخل رقم الموبايل',
  error,
  disabled = false,
  className = '',
  label,
  required = false,
  autoFocus = false,
  defaultCountry = 'LY',
  allowCountrySelection: _allowCountrySelection = true, // للتوافق
}) => {
  // تجنب تحذير المتغير غير المستخدم
  void _allowCountrySelection;

  return (
    <UnifiedPhoneInput
      value={value}
      onChange={onChange}
      onCountryChange={onCountryChange}
      onEnterPress={onEnterPress}
      placeholder={placeholder}
      error={error}
      disabled={disabled}
      className={className}
      label={label}
      required={required}
      autoFocus={autoFocus}
      defaultCountry={defaultCountry}
      theme="light"
    />
  );
};

export default PhoneInputField;
