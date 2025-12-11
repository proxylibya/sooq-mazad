import React, { useState, useEffect } from 'react';
import { LocalizationManager } from '../utils/localizationSystem';

interface DateDisplayProps {
  date: Date;
  format?: 'full' | 'short' | 'time' | 'datetime';
  className?: string;
}

/**
 * مكون عرض التاريخ الآمن من مشاكل hydration
 * يضمن تطابق التاريخ بين الخادم والعميل
 */
const DateDisplay: React.FC<DateDisplayProps> = ({ date, format = 'full', className = '' }) => {
  const [isClient, setIsClient] = useState(false);
  const localizationSystem = LocalizationManager.getInstance();

  // التأكد من أن المكون يعمل في العميل فقط
  useEffect(() => {
    setIsClient(true);
  }, []);

  // إذا لم يتم تحميل العميل بعد، عرض placeholder
  if (!isClient) {
    return ;
  }

  const getFormattedDate = (): string => {
    try {
      switch (format) {
        case 'full':
          return localizationSystem.formatDate(date, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

        case 'short':
          return localizationSystem.formatDate(date, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

        case 'time':
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });

        case 'datetime':
          return localizationSystem.formatDateTime(date);

        default:
          return localizationSystem.formatDate(date);
      }
    } catch (error) {
      console.error('خطأ في تنسيق التاريخ:', error);
      // fallback آمن
      return date.toLocaleDateString('en-US');
    }
  };

  return (
    <span className={className} suppressHydrationWarning>
      {getFormattedDate()}
    </span>
  );
};

export default DateDisplay;
