import { useState, useEffect } from 'react';
import { LocalizationManager } from '../utils/localizationSystem';

/**
 * Hook آمن لإدارة التاريخ يتجنب مشاكل hydration
 */
export const useSafeDate = () => {
  const [isClient, setIsClient] = useState(false);
  const localizationSystem = LocalizationManager.getInstance();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    if (!isClient) {
      // إرجاع قيمة ثابتة أثناء SSR
      return 'جاري التحميل...';
    }

    try {
      return localizationSystem.formatDate(date, options);
    } catch (error) {
      console.error('خطأ في تنسيق التاريخ:', error);
      return date.toLocaleDateString('en-US');
    }
  };

  const formatDateTime = (date: Date): string => {
    if (!isClient) {
      return 'جاري التحميل...';
    }

    try {
      return localizationSystem.formatDateTime(date);
    } catch (error) {
      console.error('خطأ في تنسيق التاريخ والوقت:', error);
      return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US');
    }
  };

  const formatTime = (date: Date): string => {
    if (!isClient) {
      return 'جاري التحميل...';
    }

    try {
      return date.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('خطأ في تنسيق الوقت:', error);
      return date.toLocaleTimeString('en-US');
    }
  };

  return {
    isClient,
    formatDate,
    formatDateTime,
    formatTime,
  };
};

export default useSafeDate;
