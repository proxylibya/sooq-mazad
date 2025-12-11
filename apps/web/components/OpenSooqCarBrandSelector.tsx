import React from 'react';
import UniversalBrandSelector from './UniversalBrandSelector';

interface OpenSooqCarBrandSelectorProps {
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  showSearch?: boolean;
  showPopularFirst?: boolean;
  opensooqStyle?: boolean;
}

const OpenSooqCarBrandSelector: React.FC<OpenSooqCarBrandSelectorProps> = ({
  selectedBrand,
  onBrandChange,
  placeholder = 'اختر نوع السيارة',
  className = '',
  required = false,
  disabled = false,
  showSearch = true,
  showPopularFirst = true,
  opensooqStyle = true,
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
      variant="opensooq"
      size="lg"
      showStats={true}
      gridColumns={1}
    />
  );
};

export default OpenSooqCarBrandSelector;
