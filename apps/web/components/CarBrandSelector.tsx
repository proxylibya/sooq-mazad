import React from 'react';
import UniversalBrandSelector from './UniversalBrandSelector';

interface CarBrandSelectorProps {
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  showSearch?: boolean;
  showPopularFirst?: boolean;
}

const CarBrandSelector: React.FC<CarBrandSelectorProps> = ({
  selectedBrand,
  onBrandChange,
  placeholder = 'اختر نوع السيارة',
  className = '',
  required = false,
  disabled = false,
  showSearch = true,
  showPopularFirst = true,
}) => {
  // استخدام المكون الجديد الموحد
  return (
    <UniversalBrandSelector
      selectedBrand={selectedBrand}
      onBrandChange={onBrandChange}
      placeholder={placeholder}
      className={className}
      required={required}
      disabled={disabled}
      showSearch={showSearch}
      showPopularFirst={showPopularFirst}
      variant="default"
      size="md"
      gridColumns={1}
    />
  );
};

export default CarBrandSelector;
