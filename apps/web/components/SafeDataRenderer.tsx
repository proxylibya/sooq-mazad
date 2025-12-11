/**
 * مكون آمن لعرض البيانات
 * يتحقق من صحة البيانات قبل عرضها لمنع الأخطاء
 */

import React from 'react';
import { ensureArray, ensureString, ensureNumber } from '../utils/dataValidation';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';

// مكون آمن لعرض المصفوفات
interface SafeArrayRendererProps {
  data: any;
  renderItem: (item: any, index: number) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export const SafeArrayRenderer: React.FC<SafeArrayRendererProps> = ({
  data,
  renderItem,
  emptyMessage = 'لا توجد عناصر',
  className = '',
}) => {
  const safeArray = ensureArray(data);

  if (safeArray.length === 0) {
    return <div className={`text-sm text-gray-500 ${className}`}>{emptyMessage}</div>;
  }

  return <div className={className}>{safeArray.map((item, index) => renderItem(item, index))}</div>;
};

// مكون آمن لعرض النصوص
interface SafeTextProps {
  text: any;
  fallback?: string;
  className?: string;
}

export const SafeText: React.FC<SafeTextProps> = ({
  text,
  fallback = 'غير متوفر',
  className = '',
}) => {
  const safeText = ensureString(text, fallback);

  return <span className={className}>{safeText}</span>;
};

// مكون آمن لعرض الأرقام
interface SafeNumberProps {
  number: any;
  fallback?: number;
  format?: 'currency' | 'number' | 'percentage';
  className?: string;
}

export const SafeNumber: React.FC<SafeNumberProps> = ({
  number,
  fallback = 0,
  format = 'number',
  className = '',
}) => {
  const safeNumber = ensureNumber(number, fallback);

  let formattedNumber = safeNumber.toString();

  switch (format) {
    case 'currency':
      formattedNumber = `${safeNumber.toLocaleString()} د.ل`;
      break;
    case 'percentage':
      formattedNumber = `${safeNumber}%`;
      break;
    case 'number':
    default:
      formattedNumber = safeNumber.toLocaleString();
      break;
  }

  return <span className={className}>{formattedNumber}</span>;
};

// مكون آمن لعرض المميزات
interface SafeFeaturesProps {
  features: any;
  title: string;
  iconColor?: string;
  className?: string;
}

export const SafeFeatures: React.FC<SafeFeaturesProps> = ({
  features,
  title,
  iconColor = 'text-green-500',
  className = '',
}) => {
  // دالة لتحليل وتنظيف البيانات
  const parseFeatures = (data: any): string[] => {
    if (!data) return [];

    // إذا كانت البيانات مصفوفة بالفعل
    if (Array.isArray(data)) {
      return data.filter((item) => item && typeof item === 'string' && item.trim() !== '');
    }

    // إذا كانت البيانات نص JSON
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);

        // إذا كان JSON object يحتوي على خصائص السيارة
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          const featuresList: string[] = [];

          // تحويل خصائص السيارة إلى قائمة مميزات
          const featureMap: { [key: string]: string } = {
            bodyType: 'نوع الهيكل',
            fuelType: 'نوع الوقود',
            transmission: 'ناقل الحركة',
            regionalSpec: 'المواصفات الإقليمية',
            exteriorColor: 'اللون الخارجي',
            interiorColor: 'اللون الداخلي',
            seatCount: 'عدد المقاعد',
          };

          Object.entries(parsed).forEach(([key, value]) => {
            if (value && value !== '' && value !== 'غير محدد') {
              const label = featureMap[key] || key;
              featuresList.push(`${label}: ${value}`);
            }
          });

          return featuresList;
        }

        // إذا كان JSON array
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => item && typeof item === 'string' && item.trim() !== '');
        }
      } catch (error) {
        // إذا فشل تحليل JSON، حاول تقسيم النص بالفواصل
        return data
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item !== '');
      }
    }

    // إذا كان object مباشرة
    if (typeof data === 'object' && data !== null) {
      const featuresList: string[] = [];

      const featureMap: { [key: string]: string } = {
        bodyType: 'نوع الهيكل',
        fuelType: 'نوع الوقود',
        transmission: 'ناقل الحركة',
        regionalSpec: 'المواصفات الإقليمية',
        exteriorColor: 'اللون الخارجي',
        interiorColor: 'اللون الداخلي',
        seatCount: 'عدد المقاعد',
      };

      Object.entries(data).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'غير محدد') {
          const label = featureMap[key] || key;
          featuresList.push(`${label}: ${value}`);
        }
      });

      return featuresList;
    }

    return [];
  };

  const safeFeatures = parseFeatures(features);

  if (safeFeatures.length === 0) {
    return null;
  }

  return (
    <div className={`mb-6 ${className}`}>
      <h5 className="mb-3 text-sm font-medium text-gray-600">{title}</h5>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {safeFeatures.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircleIcon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
            <SafeText text={feature} />
          </div>
        ))}
      </div>
    </div>
  );
};

// مكون آمن لعرض الصور
interface SafeImageProps {
  src: any;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onError?: () => void;
  onClick?: () => void;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackSrc = '/images/cars/default-car.svg',
  className = '',
  onError,
  onClick,
}) => {
  const safeSrc = ensureString(src, fallbackSrc);
  const safeAlt = ensureString(alt, 'صورة');

  const handleError = () => {
    if (onError) {
      onError();
    }
  };

  return (
    <img
      src={safeSrc}
      alt={safeAlt}
      className={className}
      onError={handleError}
      onClick={onClick}
    />
  );
};

// مكون آمن لعرض قائمة الصور
interface SafeImageGalleryProps {
  images: any;
  className?: string;
  imageClassName?: string;
  onImageClick?: (index: number) => void;
}

export const SafeImageGallery: React.FC<SafeImageGalleryProps> = ({
  images,
  className = '',
  imageClassName = '',
  onImageClick,
}) => {
  const safeImages = ensureArray<string>(images);

  // إذا لم تكن هناك صور، استخدم صورة افتراضية
  const imagesToShow = safeImages.length > 0 ? safeImages : ['/images/cars/default-car.svg'];

  return (
    <div className={className}>
      {imagesToShow.map((image, index) => (
        <SafeImage
          key={index}
          src={image}
          alt={`صورة ${index + 1}`}
          className={`cursor-pointer ${imageClassName}`}
          onClick={() => onImageClick && onImageClick(index)}
        />
      ))}
    </div>
  );
};

// مكون آمن لعرض معلومات البائع
interface SafeSellerInfoProps {
  seller: any;
  className?: string;
}

export const SafeSellerInfo: React.FC<SafeSellerInfoProps> = ({ seller, className = '' }) => {
  const safeName = ensureString(seller?.name, 'بائع السيارة');
  const safeRating = ensureNumber(seller?.rating, 0);
  const safeReviews = ensureNumber(seller?.reviews, 0);
  const safeVerified = seller?.verified === true;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center gap-2">
        <SafeText text={safeName} className="font-medium" />
        {safeVerified && <CheckCircleIcon className="h-4 w-4 text-blue-500" />}
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span>التقييم:</span>
          <SafeNumber number={safeRating} />
        </div>
        <div className="flex items-center gap-1">
          <span>المراجعات:</span>
          <SafeNumber number={safeReviews} />
        </div>
      </div>
    </div>
  );
};

// مكون آمن لعرض المواصفات
interface SafeSpecificationsProps {
  specifications: any;
  className?: string;
}

export const SafeSpecifications: React.FC<SafeSpecificationsProps> = ({
  specifications,
  className = '',
}) => {
  const specs = [
    { label: 'الماركة', value: specifications?.brand },
    { label: 'الموديل', value: specifications?.model },
    { label: 'السنة', value: specifications?.year },
    { label: 'المسافة المقطوعة', value: specifications?.mileage },
    { label: 'الحالة', value: specifications?.condition },
    { label: 'نوع الوقود', value: specifications?.fuelType },
    { label: 'ناقل الحركة', value: specifications?.transmission },
    { label: 'نوع الهيكل', value: specifications?.bodyType },
    { label: 'اللون', value: specifications?.color },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4">
        {specs.map((spec, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-600">{spec.label}:</span>
            <SafeText text={spec.value} className="font-medium" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  SafeArrayRenderer,
  SafeText,
  SafeNumber,
  SafeFeatures,
  SafeImage,
  SafeImageGallery,
  SafeSellerInfo,
  SafeSpecifications,
};
