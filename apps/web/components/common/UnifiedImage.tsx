/**
 * مكون صورة موحد لحل مشاكل معالجة الصور في المشروع
 */

import React, { useEffect, useState } from 'react';
import OptimizedImage from '../OptimizedImage';

interface UnifiedImageProps {
  src: string | string[] | any[];
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
  priority?: boolean;
}

/**
 * معالج موحد لجميع أنواع مصادر الصور
 */
function normalizeImageSource(src: string | string[] | any[]): string {
  // إذا كان نص
  if (typeof src === 'string') {
    if (src.trim() === '') return '/images/cars/default-car.svg';

    // محاولة تحليل JSON إذا كان يبدو كـ JSON
    if (src.startsWith('[') || src.startsWith('{')) {
      try {
        const parsed = JSON.parse(src);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return extractImageUrl(parsed[0]);
        }
      } catch {
        // إذا فشل التحليل، تعامل كنص عادي
      }
    }

    // إذا كان يحتوي على فواصل، خذ الأول
    if (src.includes(',')) {
      const firstImage = src.split(',')[0].trim();
      return firstImage || '/images/cars/default-car.svg';
    }

    return src;
  }

  // إذا كان مصفوفة
  if (Array.isArray(src) && src.length > 0) {
    const firstImage = src.find((img) => {
      const url = extractImageUrl(img);
      return url && url.trim() !== '';
    });

    if (firstImage) {
      return extractImageUrl(firstImage);
    }
  }

  // الصورة الافتراضية
  return '/images/cars/default-car.svg';
}

/**
 * استخراج URL الصورة من كائن أو نص
 */
function extractImageUrl(item: any): string {
  if (typeof item === 'string') {
    return item.trim();
  }

  if (item && typeof item === 'object') {
    // المحاولة الأولى: البحث عن خاصية url
    if (item.url && typeof item.url === 'string') {
      return item.url.trim();
    }

    // المحاولة الثانية: البحث عن خاصية fileUrl
    if (item.fileUrl && typeof item.fileUrl === 'string') {
      return item.fileUrl.trim();
    }

    // المحاولة الثالثة: البحث عن خاصية src
    if (item.src && typeof item.src === 'string') {
      return item.src.trim();
    }
  }

  return '';
}

export const UnifiedImage: React.FC<UnifiedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  fallbackSrc = '/images/cars/default-car.svg',
  onError,
  onLoad,
  priority = false,
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const normalizedSrc = normalizeImageSource(src);
    setImageSrc(normalizedSrc);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
    onError?.();
  };

  const handleLoad = () => {
    setHasError(false);
    onLoad?.();
  };

  if (!imageSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ width, height }}
      >
        <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  return (
    <OptimizedImage
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

export default UnifiedImage;
