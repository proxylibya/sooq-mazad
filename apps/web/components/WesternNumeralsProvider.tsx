import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';

import React, { useEffect } from 'react';
import { initWebsiteNumberConverter } from '../utils/numberUtils';

interface WesternNumeralsProviderProps {
  children: React.ReactNode;
}

/**
 * مزود نظام الأرقام الغربية/اللاتينية للموقع بالكامل
 * Western/Latin numerals system provider for the entire website
 *
 * <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" /> شرط إجباري: استخدام الأرقام الغربية/اللاتينية فقط (0123456789)
 * <XCircleIcon className="w-5 h-5 text-red-500" /> ممنوع: الأرقام العربية-الهندية (0123456789) والفارسية (۰۱۲۳۴۵۶۷۸۹)
 */
export default function WesternNumeralsProvider({ children }: WesternNumeralsProviderProps) {
  useEffect(() => {
    // تهيئة نظام تحويل الأرقام للموقع بالكامل
    initWebsiteNumberConverter();

    // إضافة class للتأكد من تطبيق الأنماط
    document.body.classList.add('western-numerals-only');

    // تنظيف عند إلغاء التحميل
    return () => {
      document.body.classList.remove('western-numerals-only');
    };
  }, []);

  return <>{children}</>;
}
