/**
 * سياق التوطين للتطبيق
 * يوفر بيانات التوطين لجميع المكونات
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  LocalizationData,
  Country,
  localizationManager,
  countries,
} from '../utils/localizationSystem';

// واجهة سياق التوطين
interface LocalizationContextType {
  // البيانات الحالية
  localization: LocalizationData | null;
  country: Country | null;
  isLoading: boolean;
  error: string | null;

  // الوظائف
  formatPrice: (amount: number, showCurrency?: boolean) => string;
  convertPrice: (amount: number, fromCurrency: string, toCurrency?: string) => number;

  // وظائف التنسيق
  formatDate: (date: Date) => string;
  formatNumber: (number: number) => string;

  // معلومات الاتجاه واللغة
  isRTL: boolean;
  language: string;
}

// إنشاء السياق
const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// خصائص المزود
interface LocalizationProviderProps {
  children: ReactNode;
}

// مزود السياق
export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const [localization, setLocalization] = useState<LocalizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تهيئة التوطين عند تحميل المكون
  useEffect(() => {
    const initializeLocalization = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // الحصول على البيانات الحالية
        const currentLocalization = localizationManager.getCurrentLocalization();

        if (currentLocalization) {
          setLocalization(currentLocalization);
        } else {
          // انتظار قليل للسماح للنظام بالتهيئة التلقائية
          setTimeout(() => {
            const retryLocalization = localizationManager.getCurrentLocalization();
            if (retryLocalization) {
              setLocalization(retryLocalization);
            }
          }, 100);
        }
      } catch (err) {
        console.error('خطأ في تهيئة التوطين:', err);
        setError('فشل في تحميل بيانات التوطين');

        // محاولة أخيرة مع بيانات افتراضية
        try {
          // انتظار إضافي للسماح للنظام بالتهيئة التلقائية
          setTimeout(() => {
            const retryLocalization = localizationManager.getCurrentLocalization();
            if (retryLocalization) {
              setLocalization(retryLocalization);
              setError(null);
            }
          }, 500);
        } catch (fallbackError) {
          console.error('فشل في تحميل البيانات الافتراضية:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocalization();

    // إضافة مستمع للتغييرات
    const handleLocalizationChange = (data: LocalizationData) => {
      setLocalization(data);
      setError(null);
    };

    localizationManager.addListener(handleLocalizationChange);

    // تنظيف المستمع عند إلغاء تحميل المكون
    return () => {
      localizationManager.removeListener(handleLocalizationChange);
    };
  }, []);

  // تنسيق السعر
  const formatPrice = (amount: number, showCurrency: boolean = true): string => {
    return localizationManager.formatPrice(amount, showCurrency);
  };

  // تحويل السعر
  const convertPrice = (amount: number, fromCurrency: string, toCurrency?: string): number => {
    return localizationManager.convertPrice(amount, fromCurrency, toCurrency);
  };

  // تنسيق التاريخ
  const formatDate = (date: Date): string => {
    if (!localization) return date.toLocaleDateString('en-US');

    try {
      // استخدام en-US لضمان الأرقام الإنجليزية
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        calendar: 'gregory',
      });
    } catch (error) {
      console.error('خطأ في تنسيق التاريخ:', error);
      return date.toLocaleDateString('en-US');
    }
  };

  // تنسيق الأرقام
  const formatNumber = (number: number): string => {
    if (!localization) return number.toString();

    try {
      return new Intl.NumberFormat(localization.ui.numberFormat).format(number);
    } catch (error) {
      console.error('خطأ في تنسيق الرقم:', error);
      return number.toString();
    }
  };

  // قيم السياق
  const contextValue: LocalizationContextType = {
    // البيانات
    localization,
    country: localization?.country || null,
    isLoading,
    error,

    // الوظائف
    formatPrice,
    convertPrice,

    // وظائف التنسيق
    formatDate,
    formatNumber,

    // معلومات الاتجاه واللغة
    isRTL: localization?.ui.direction === 'rtl',
    language: localization?.ui.language || 'ar',
  };

  return (
    <LocalizationContext.Provider value={contextValue}>{children}</LocalizationContext.Provider>
  );
};

// خطاف لاستخدام السياق
export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);

  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }

  return context;
};

// خطافات مساعدة للاستخدام السريع

// خطاف للحصول على البلد الحالي
export const useCurrentCountry = (): Country | null => {
  const { country } = useLocalization();
  return country;
};

// خطاف لتنسيق الأسعار
export const usePriceFormatter = () => {
  const { formatPrice, convertPrice } = useLocalization();
  return { formatPrice, convertPrice };
};

// خطاف للحصول على معلومات العملة
export const useCurrency = () => {
  const { localization } = useLocalization();
  return localization?.currency || null;
};

// خطاف للحصول على معلومات المحتوى
export const useContent = () => {
  const { localization } = useLocalization();
  return localization?.content || null;
};

// خطاف للحصول على معلومات واجهة المستخدم
export const useUI = () => {
  const { localization, isRTL, language } = useLocalization();
  return {
    ui: localization?.ui || null,
    isRTL,
    language,
    direction: isRTL ? 'rtl' : 'ltr',
  };
};

// خطاف للحصول على معلومات الأعمال
export const useBusiness = () => {
  const { localization } = useLocalization();
  return localization?.business || null;
};

// خطاف لتنسيق التواريخ والأرقام
export const useFormatters = () => {
  const { formatDate, formatNumber, formatPrice } = useLocalization();
  return { formatDate, formatNumber, formatPrice };
};

// مكون عرض حالة التحميل
export const LocalizationLoader: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoading, error } = useLocalization();

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95 backdrop-blur-sm">
        <div className="text-center">
          {/* شعار مصغر */}
          <div className="mb-6">
            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-xl bg-gradient-to-br from-opensooq-blue to-blue-700 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
          </div>

          {/* مؤشر التحميل */}
          <div className="relative mb-4">
            <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
          </div>

          {/* رسالة التحميل */}
          <div className="loading-text">
            <p className="mb-1 text-lg font-medium text-gray-700">جاري تحميل بيانات البلد...</p>
            <p className="text-sm text-gray-500">يرجى الانتظار قليلاً</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-600">
          <p className="mb-2 text-lg font-semibold">خطأ في التحميل</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// مكون لعرض معلومات البلد الحالي (للتطوير)
export const CountryDebugInfo: React.FC = () => {
  const { country, localization } = useLocalization();

  if (!country || !localization) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs rounded bg-black bg-opacity-75 p-3 text-xs text-white">
      <div className="mb-1 font-bold">معلومات البلد الحالي:</div>
      <div>
        🏳️ {country.flag} {country.name}
      </div>
      <div>
        💰 {localization.currency.symbol} {localization.currency.name}
      </div>
      <div>📱 {country.phoneCode}</div>
      <div>🌐 {country.domain}</div>
    </div>
  );
};

export default LocalizationContext;
