import React from 'react';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import { formatCityRegion } from '../utils/formatters';

interface DateLocationInfoProps {
  date?: Date | string;
  location?: string;
  className?: string;
  showDate?: boolean;
  showLocation?: boolean;
  dateFormat?: 'short' | 'long' | 'numeric';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * مكون موحد لعرض معلومات التاريخ والموقع
 * يمنع التكرار ويوفر تنسيقاً موحداً
 */
const DateLocationInfo: React.FC<DateLocationInfoProps> = ({
  date,
  location,
  className = '',
  showDate = true,
  showLocation = true,
  dateFormat = 'numeric',
  size = 'md',
}) => {
  // تحديد أحجام الأيقونات والنصوص
  const sizeConfig = {
    sm: {
      iconSize: 'h-3 w-3',
      textSize: 'text-xs',
      gap: 'gap-2',
    },
    md: {
      iconSize: 'h-4 w-4',
      textSize: 'text-sm',
      gap: 'gap-4',
    },
    lg: {
      iconSize: 'h-5 w-5',
      textSize: 'text-base',
      gap: 'gap-6',
    },
  };

  const config = sizeConfig[size];

  // تنسيق التاريخ بالأرقام الغربية فقط
  const formatDate = (inputDate: Date | string): string => {
    // معالجة آمنة للتاريخ
    if (!inputDate) {
      return new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
    }

    let dateObj: Date;
    
    try {
      if (typeof inputDate === 'string') {
        dateObj = new Date(inputDate);
      } else if (inputDate instanceof Date) {
        dateObj = inputDate;
      } else {
        // إذا كان النوع غير متوقع، استخدم التاريخ الحالي
        dateObj = new Date();
      }

      // فحص صحة التاريخ
      if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return new Date().toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        });
      }
    } catch (error) {
      // في حالة حدوث خطأ، استخدم التاريخ الحالي
      return new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
    }

    switch (dateFormat) {
      case 'short':
        return dateObj.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
        });
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      case 'numeric':
      default:
        return dateObj.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        });
    }
  };

  // إذا لم يكن هناك محتوى للعرض
  if (!showDate && !showLocation) {
    return null;
  }

  return (
    <div
      className={`flex items-center ${config.gap} ${config.textSize} text-gray-500 ${className}`}
    >
      {/* معلومات التاريخ */}
      {showDate && (
        <div className="flex items-center gap-1">
          <ClockIcon className={config.iconSize} />
          <span>{date ? formatDate(date) : formatDate(new Date())}</span>
        </div>
      )}

      {/* معلومات الموقع */}
      {showLocation && location && (
        <div className="flex items-center gap-1">
          <MapPinIcon className={config.iconSize} />
          <span>{formatCityRegion(location)}</span>
        </div>
      )}
    </div>
  );
};

export default DateLocationInfo;
