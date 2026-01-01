import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';

import React, { useState } from 'react';
import { getAppropriatCarImage } from '../config/car-placeholder-images';
import { reportMissingImage, getFallbackImagePath } from '../utils/imageMonitoring';

interface SafeCarImageProps {
  src?: string;
  alt: string;
  className?: string;
  carBrand?: string;
  carType?: 'sedan' | 'suv' | 'hatchback';
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

/**
 * مكون صورة السيارة الآمن
 * يضمن عرض صور السيارات فقط بدون صور نساء أو محتوى غير مناسب
 */
const SafeCarImage: React.FC<SafeCarImageProps> = ({
  src,
  alt,
  className = '',
  carBrand,
  carType = 'sedan',
  fallbackSrc,
  onLoad,
  onError,
  loading = 'lazy',
  sizes,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // الحصول على صورة آمنة مع معالجة محسنة للأخطاء
  const getSafeImageSrc = () => {
    if (imageError) {
      // في حالة خطأ التحميل، استخدم الصورة البديلة المحددة أو صورة افتراضية
      const fallback =
        fallbackSrc ||
        getAppropriatCarImage(null, carBrand, carType) ||
        getFallbackImagePath(src || '');

      // تسجيل الصورة المفقودة في نظام المراقبة
      if (src) {
        reportMissingImage(src, fallback);
      }

      return fallback;
    }

    // استخدم الصورة الآمنة المناسبة
    return getAppropriatCarImage(src, carBrand, carType);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    // Only log in development and only once per component instance
    if (process.env.NODE_ENV === 'development' && !imageError) {
    }
    setIsLoading(false);
    setImageError(true);
    if (onError) onError();
  };

  return (
    <div className={`relative ${className}`}>
      {/* مؤشر التحميل */}
      {isLoading && (
        <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-200">
          <div className="text-sm text-gray-400">جاري التحميل...</div>
        </div>
      )}

      {/* الصورة */}
      <img
        src={getSafeImageSrc()}
        alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={loading}
        sizes={sizes}
      />

      {/* رسالة خطأ (اختيارية) */}
      {imageError && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 bg-opacity-75 p-1 text-xs text-white">
          تم استخدام صورة بديلة
        </div>
      )}
    </div>
  );
};

export default SafeCarImage;
