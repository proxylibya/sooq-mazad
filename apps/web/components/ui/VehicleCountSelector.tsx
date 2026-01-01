import React from 'react';
import SelectField from './SelectField';

interface VehicleCountSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
}

const VehicleCountSelector: React.FC<VehicleCountSelectorProps> = ({
  value,
  onChange,
  label = 'كم عدد المركبات التي بالمعرض',
  placeholder = 'اختر عدد المركبات',
  required = false,
  disabled = false,
  className = '',
  size = 'md',
  error,
}) => {
  // خيارات عدد المركبات
  const vehicleCountOptions = [
    { value: 'unspecified', label: 'بدون تحديد' },
    { value: '1-10', label: '1 - 10 مركبات' },
    { value: '11-25', label: '11 - 25 مركبة' },
    { value: '26-50', label: '26 - 50 مركبة' },
    { value: '51-100', label: '51 - 100 مركبة' },
    { value: '100+', label: 'أكثر من 100 مركبة' },
  ];

  return (
    <SelectField
      label={label}
      options={vehicleCountOptions}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={className}
      size={size}
      error={error}
      clearable={false}
      searchable={false}
    />
  );
};

export default VehicleCountSelector;
export type { VehicleCountSelectorProps };
