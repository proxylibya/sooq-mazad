/**
 * مكون إدخال رقم الهاتف للوحة التحكم - Wrapper للمكون الموحد
 * يستخدم UnifiedPhoneInput مع سمة داكنة
 *
 * @deprecated استخدم UnifiedPhoneInput مباشرة مع theme="dark"
 */

import React from 'react';
import UnifiedPhoneInput, { arabCountries, type Country } from './UnifiedPhoneInput';

// تصدير الأنواع للتوافق مع الكود القديم
export { arabCountries };
export type { Country };

// تصدير للتوافق مع الاستخدامات القديمة
export const allCountries = arabCountries;
export type WorldCountry = Country;
export const getCountryByCode = (code: string) => arabCountries.find((c) => c.countryCode === code);
export const searchCountries = (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return arabCountries;
  return arabCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.countryCode.toLowerCase().includes(q),
  );
};

interface AdminPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (country: Country) => void;
  onFullNumberChange?: (fullNumber: string) => void;
  defaultCountryCode?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  showExample?: boolean;
  className?: string;
}

/**
 * AdminPhoneInput - مكون إدخال رقم الهاتف للوحة التحكم
 * Wrapper للمكون الموحد UnifiedPhoneInput مع سمة داكنة
 */
const AdminPhoneInput: React.FC<AdminPhoneInputProps> = ({
  value,
  onChange,
  onCountryChange,
  onFullNumberChange,
  defaultCountryCode = 'LY',
  label,
  placeholder = 'أدخل رقم الموبايل',
  error,
  disabled = false,
  required = false,
  showExample: _showExample = true,
  className = '',
}) => {
  // تجنب تحذير المتغير غير المستخدم
  void _showExample;

  return (
    <UnifiedPhoneInput
      value={value}
      onChange={onChange}
      onCountryChange={onCountryChange}
      onFullNumberChange={onFullNumberChange}
      placeholder={placeholder}
      error={error}
      disabled={disabled}
      className={className}
      label={label}
      required={required}
      defaultCountry={defaultCountryCode}
      theme="dark"
    />
  );
};

export default AdminPhoneInput;
