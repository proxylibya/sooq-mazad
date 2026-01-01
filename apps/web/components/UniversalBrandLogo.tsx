import React, { useState, useCallback, useMemo } from 'react';
import { getBrandInfo, DEFAULT_LOGO } from '../data/car-brands-logos';

interface UniversalBrandLogoProps {
  /** اسم الماركة */
  brandName: string;
  /** حجم الشعار */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** شكل الشعار */
  variant?: 'square' | 'circle' | 'rounded' | 'soft';
  /** نمط العرض */
  style?: 'minimal' | 'bordered' | 'shadowed' | 'elevated' | 'opensooq';
  /** إظهار اسم الماركة */
  showName?: boolean;
  /** موضع النص */
  namePosition?: 'bottom' | 'right' | 'overlay';
  /** كلاس CSS إضافي */
  className?: string;
  /** دالة عند النقر */
  onClick?: () => void;
  /** تحميل كسول */
  lazy?: boolean;
  /** إظهار مؤشر الشعبية */
  showPopularBadge?: boolean;
  /** إظهار لون الماركة كخلفية */
  usesBrandColor?: boolean;
  /** نص بديل مخصص */
  alt?: string;
}

const UniversalBrandLogo: React.FC<UniversalBrandLogoProps> = ({
  brandName,
  size = 'md',
  variant = 'rounded',
  style = 'bordered',
  showName = false,
  namePosition = 'bottom',
  className = '',
  onClick,
  lazy = true,
  showPopularBadge = false,
  usesBrandColor = false,
  alt,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // الحصول على معلومات الماركة
  const brandInfo = useMemo(() => getBrandInfo(brandName), [brandName]);

  // أحجام الشعارات
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  // أشكال الشعارات
  const variantClasses = {
    square: 'rounded-none',
    circle: 'rounded-full',
    rounded: 'rounded-lg',
    soft: 'rounded-xl',
  };

  // أنماط العرض
  const styleClasses = {
    minimal: '',
    bordered: 'border border-gray-200 bg-white',
    shadowed: 'border border-gray-100 bg-white shadow-sm',
    elevated: 'border border-gray-100 bg-white shadow-md hover:shadow-lg',
    opensooq:
      'border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50 shadow-sm hover:shadow-md hover:border-orange-300',
  };

  // أحجام النصوص
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl',
  };

  // معالجة خطأ تحميل الصورة
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // معالجة تحميل الصورة بنجاح
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // تحديد مسار الشعار
  const logoSrc = useMemo(() => {
    if (imageError) return DEFAULT_LOGO;
    return brandInfo?.logo || DEFAULT_LOGO;
  }, [imageError, brandInfo]);

  // تحديد النص البديل
  const altText = useMemo(() => {
    return alt || `شعار ${brandName}` || 'شعار الماركة';
  }, [alt, brandName]);

  // تحديد لون الخلفية
  const backgroundStyle = useMemo(() => {
    if (!usesBrandColor || !brandInfo?.brandColor) return {};
    return {
      backgroundColor: `${brandInfo.brandColor}15`, // شفافية 15%
      borderColor: `${brandInfo.brandColor}40`, // شفافية 40%
    };
  }, [usesBrandColor, brandInfo]);

  // كلاسات CSS المجمعة للشعار
  const logoClasses = useMemo(
    () =>
      [
        sizeClasses[size],
        variantClasses[variant],
        styleClasses[style],
        'object-contain flex-shrink-0 transition-all duration-200 p-1',
        onClick ? 'cursor-pointer hover:scale-105' : '',
        !imageLoaded && !imageError ? 'animate-pulse bg-gray-100' : '',
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [size, variant, style, onClick, imageLoaded, imageError, className],
  );

  // كلاسات الحاوية
  const containerClasses = useMemo(() => {
    const baseClasses = 'relative inline-flex items-center';

    if (showName) {
      switch (namePosition) {
        case 'right':
          return `${baseClasses} flex-row gap-2`;
        case 'bottom':
          return `${baseClasses} flex-col gap-1`;
        case 'overlay':
          return `${baseClasses} flex-col`;
        default:
          return baseClasses;
      }
    }

    return baseClasses;
  }, [showName, namePosition]);

  return (
    <div className={containerClasses}>
      {/* الشعار */}
      <div className="relative inline-block">
        <img
          src={logoSrc}
          alt={altText}
          className={logoClasses}
          style={backgroundStyle}
          onError={handleImageError}
          onLoad={handleImageLoad}
          onClick={onClick}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />

        {/* مؤشر التحميل */}
        {!imageLoaded && !imageError && (
          <div
            className={`absolute inset-0 ${variantClasses[variant]} flex animate-pulse items-center justify-center bg-gray-100`}
          >
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
          </div>
        )}

        {/* مؤشر الخطأ */}
        {imageError && (
          <div
            className={`absolute -left-1 -top-1 h-3 w-3 bg-red-500 ${variantClasses[variant]} flex items-center justify-center`}
          >
            <span className="text-xs text-white">!</span>
          </div>
        )}

        {/* مؤشر الشعبية */}
        {showPopularBadge && brandInfo?.popular && (
          <div className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-400">
            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}
      </div>

      {/* اسم الماركة */}
      {showName && brandInfo && (
        <div
          className={`${namePosition === 'overlay' ? 'absolute -bottom-1 left-1/2 -translate-x-1/2 transform' : ''}`}
        >
          <span
            className={`${textSizeClasses[size]} font-medium text-gray-700 ${
              namePosition === 'overlay' ? 'rounded bg-white px-2 py-0.5 text-xs shadow-sm' : ''
            }`}
          >
            {brandInfo.name}
          </span>
        </div>
      )}
    </div>
  );
};

export default UniversalBrandLogo;
