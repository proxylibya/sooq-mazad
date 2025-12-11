import React from 'react';
import UniversalBrandLogo from './UniversalBrandLogo';

interface CarBrandLogoProps {
  /** اسم العلامة التجارية */
  brandName: string;
  /** مسار الشعار */
  logoPath?: string;
  /** النص البديل */
  alt?: string;
  /** حجم الشعار */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** شكل الشعار */
  shape?: 'square' | 'circle' | 'rounded';
  /** إظهار حدود */
  showBorder?: boolean;
  /** إظهار ظل */
  showShadow?: boolean;
  /** كلاس CSS إضافي */
  className?: string;
  /** دالة عند النقر */
  onClick?: () => void;
  /** تحميل كسول */
  lazy?: boolean;
}

const CarBrandLogo: React.FC<CarBrandLogoProps> = ({
  brandName,
  logoPath,
  alt,
  size = 'md',
  shape = 'rounded',
  showBorder = true,
  showShadow = false,
  className = '',
  onClick,
  lazy = true,
}) => {
  // تحويل الخصائص القديمة إلى النظام الجديد
  const newVariant = shape === 'circle' ? 'circle' : shape === 'square' ? 'square' : 'rounded';
  const newStyle = showShadow ? 'shadowed' : showBorder ? 'bordered' : 'minimal';

  return (
    <UniversalBrandLogo
      brandName={brandName}
      size={size}
      variant={newVariant}
      style={newStyle}
      className={className}
      onClick={onClick}
      lazy={lazy}
      alt={alt}
    />
  );
};

export default CarBrandLogo;
