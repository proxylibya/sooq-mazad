/**
 * مكون معالجة الأخطاء العامة للتطبيق
 * يتعامل مع أخطاء JSON.parse وأخطاء localStorage
 *
 * @description يوفر معالجة شاملة للأخطاء في التطبيق
 * @param props خصائص المكون
 * @returns عنصر React يحتوي على المكونات الفرعية
 *
 * @example
 * <ErrorHandler>
 *   <App />
 * </ErrorHandler>
 */

import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';

import React, { useEffect } from 'react';
import { LocalizationManager } from '../../../utils/localizationSystem';

interface ErrorHandlerProps {
  children: React.ReactNode;
}

interface ReactErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({ children }) => {
  useEffect(() => {
    // تهيئة معالج الأخطاء العام
    LocalizationManager.setupGlobalErrorHandler();

    // معالج إضافي لأخطاء React
    const handleReactError = (error: Error, errorInfo: ReactErrorInfo) => {
      if (error.message && error.message.includes('JSON.parse')) {
        // console.warn('تم اكتشاف خطأ JSON.parse في React، محاولة الإصلاح...');
        LocalizationManager.handleJSONParseError(error);
      }
    };

    // تسجيل معالج الأخطاء
    // return () => {
    // };
  }, []);

  return <>{children}</>;
};

export default ErrorHandler;
