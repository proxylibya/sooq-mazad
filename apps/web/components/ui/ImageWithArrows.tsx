/**
 * مكون محمي للصور مع أسهم التنقل
 * يضمن الاستخدام الصحيح للأسهم ويمنع الأخطاء الشائعة
 */

import React from 'react';
import { UnifiedNavigationArrows } from './NavigationArrows';
import { useNavigationArrows } from '../../hooks/useNavigationArrows';

export interface ImageWithArrowsProps {
  /** مصفوفة الصور */
  images: string[];
  /** النص البديل للصورة */
  alt: string;
  /** فئات CSS إضافية للحاوي */
  className?: string;
  /** فئات CSS للصورة */
  imageClassName?: string;
  /** إظهار الأسهم دائماً (افتراضي: false) */
  alwaysVisible?: boolean;
  /** إظهار مؤشرات الصور (النقاط) */
  showIndicators?: boolean;
  /** إظهار عداد الصور */
  showCounter?: boolean;
  /** callback عند تغيير الصورة */
  onImageChange?: (index: number) => void;
  /** callback عند النقر على الصورة */
  onImageClick?: (e: React.MouseEvent) => void;
  /** معالج خطأ تحميل الصورة */
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  /** الصورة الافتراضية عند الخطأ */
  fallbackImage?: string;
}

/**
 * مكون محمي للصور مع أسهم التنقل
 * يتعامل تلقائياً مع جميع الحالات ويمنع الأخطاء الشائعة
 */
export const ImageWithArrows: React.FC<ImageWithArrowsProps> = ({
  images,
  alt,
  className = '',
  imageClassName = '',
  alwaysVisible = false,
  showIndicators = false,
  showCounter = false,
  onImageChange,
  onImageClick,
  onImageError,
  fallbackImage = '/images/cars/default-car.svg',
}) => {
  // استخدام hook الأسهم
  const { currentIndex, nextImage, prevImage, shouldShowArrows, info } = useNavigationArrows({
    images,
    onImageChange,
  });

  // معالج خطأ الصورة
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== fallbackImage) {
      target.src = fallbackImage;
    }

    if (onImageError) {
      onImageError(e);
    }
  };

  // الصورة الحالية
  const currentImage = images[currentIndex] || fallbackImage;

  return (
    <div className={`group relative ${className}`}>
      {/* الصورة */}
      <img
        src={currentImage}
        alt={alt}
        className={`h-full w-full object-cover ${imageClassName}`}
        onError={handleImageError}
        onClick={onImageClick}
      />

      {/* أسهم التنقل */}
      <UnifiedNavigationArrows
        onPrevious={prevImage}
        onNext={nextImage}
        show={images && images.length > 1}
        alwaysVisible={alwaysVisible}
      />

      {/* مؤشرات الصور */}
      {showIndicators && info.hasMultipleImages && (
        <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* عداد الصور */}
      {showCounter && info.hasMultipleImages && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {info.totalImages}
        </div>
      )}
    </div>
  );
};

/**
 * مكون مبسط للاستخدام السريع
 */
export interface SimpleImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export const SimpleImageGallery: React.FC<SimpleImageGalleryProps> = ({
  images,
  alt,
  className = 'h-56 w-full',
}) => {
  return (
    <ImageWithArrows
      images={images}
      alt={alt}
      className={className}
      showIndicators={true}
      showCounter={true}
    />
  );
};

export default ImageWithArrows;
