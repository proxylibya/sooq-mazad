import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { formatCurrencyWholeNumbers, formatNumber } from '../utils/numberUtils';
import { countries, Country } from '../utils/localizationSystem';

// واجهة سياق التوطين المبسط
interface SimpleLocalizationContextType {
  formatPrice: (amount: number, showCurrency?: boolean) => string;
  formatDate: (date: Date) => string;
  formatNumber: (number: number) => string;
  isRTL: boolean;
  language: string;
  country: Country | null;
  setCountry: (country: Country) => Promise<void>;
  isLoading: boolean;
  availableCountries: Country[];
}

// إنشاء السياق
const SimpleLocalizationContext = createContext<SimpleLocalizationContextType | undefined>(
  undefined,
);

// خصائص المزود
interface SimpleLocalizationProviderProps {
  children: ReactNode;
}

// مزود السياق المبسط
export const SimpleLocalizationProvider: React.FC<SimpleLocalizationProviderProps> = ({
  children,
}) => {
  // تعيين البلد الافتراضي مباشرة لتجنب مشاكل SSR
  const defaultCountry = countries.find((c) => c.code === 'LY') || countries[0];
  const [currentCountry, setCurrentCountry] = useState<Country | null>(defaultCountry);
  const [isLoading, setIsLoading] = useState(false);

  // تحميل البلد المحفوظ عند بدء التطبيق (فقط في المتصفح)
  useEffect(() => {
    const loadSavedCountry = () => {
      try {
        // التحقق من وجود localStorage (متاح فقط في المتصفح)
        if (typeof window !== 'undefined' && window.localStorage) {
          const savedCountry = localStorage.getItem('selectedCountry');
          if (savedCountry) {
            const country = JSON.parse(savedCountry);
            setCurrentCountry(country);
          }
        }
      } catch (error) {
        console.error('خطأ في تحميل البلد المحفوظ:', error);
        // الاحتفاظ بالبلد الافتراضي في حالة الخطأ
      }
    };

    loadSavedCountry();
  }, []);

  // وظيفة تغيير البلد
  const handleSetCountry = async (country: Country): Promise<void> => {
    try {
      setIsLoading(true);
      setCurrentCountry(country);

      // حفظ البلد في التخزين المحلي (فقط في المتصفح)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('selectedCountry', JSON.stringify(country));
      }

      console.log(`تم تغيير البلد إلى: ${country.name}`);
    } catch (error) {
      console.error('خطأ في تغيير البلد:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // تنسيق السعر بالأرقام الغربية/اللاتينية فقط (بدون منازل عشرية)
  const formatPrice = (amount: number, showCurrency: boolean = true): string => {
    if (showCurrency) {
      const currencyCode = currentCountry?.currency || 'LYD';
      return formatCurrencyWholeNumbers(amount, currencyCode);
    } else {
      return formatNumber(amount);
    }
  };

  // تنسيق التاريخ
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // تنسيق الأرقام بالأرقام الغربية/اللاتينية فقط
  const formatNumberLocal = (number: number): string => {
    return formatNumber(number);
  };

  // قيم السياق
  const contextValue: SimpleLocalizationContextType = {
    formatPrice,
    formatDate,
    formatNumber: formatNumberLocal,
    isRTL: true,
    language: 'ar',
    country: currentCountry,
    setCountry: handleSetCountry,
    isLoading,
    availableCountries: countries,
  };

  return (
    <SimpleLocalizationContext.Provider value={contextValue}>
      {children}
    </SimpleLocalizationContext.Provider>
  );
};

// خطاف لاستخدام السياق
export const useSimpleLocalization = (): SimpleLocalizationContextType => {
  const context = useContext(SimpleLocalizationContext);

  if (context === undefined) {
    throw new Error('useSimpleLocalization must be used within a SimpleLocalizationProvider');
  }

  return context;
};

// خطافات مساعدة للتوافق مع النظام القديم
export const useContent = () => {
  const [content, setContent] = useState({
    siteName: 'سوق المزاد',
    siteTitle: 'موقع مزاد السيارات',
    siteDescription: 'أفضل موقع لبيع وشراء السيارات في ليبيا والدول العربية',
    welcomeMessage: 'مرحباً بكم في موقع مزاد السيارات',
    hero: {
      title: 'موقع مزاد السيارات',
      subtitle: 'اشتري وبع السيارات بأفضل الأسعار',
    },
    navigation: {
      home: 'الرئيسية',
      auctions: 'المزادات',
      cars: 'السيارات',
      about: 'من نحن',
      contact: 'اتصل بنا',
    },
    contactInfo: {
      phone: 'سيتم تحديثه',
      email: 'سيتم تحديثه',
      address: 'سيتم تحديثه',
      workingHours: 'سيتم تحديثه',
    },
    paymentMethods: ['الدفع النقدي', 'التحويل البنكي', 'بطاقات الائتمان', 'محافظ إلكترونية'],
    shippingInfo: {
      available: true,
      cost: '50',
      duration: '3-5 أيام عمل',
      restrictions: ['يتطلب فحص فني صالح', 'لا يشمل المناطق النائية'],
    },
    features: {
      auctions: {
        title: 'سوق المزاد',
        description: 'شارك في مزادات السيارات واحصل على أفضل الصفقات',
      },
      marketplace: {
        title: 'السوق الفوري',
        description: 'تصفح آلاف السيارات المعروضة للبيع',
      },
      yards: {
        title: 'ساحات السيارات',
        description: 'اكتشف أفضل ساحات السيارات في منطقتك',
      },
      transport: {
        title: 'خدمات النقل',
        description: 'خدمات نقل السيارات الآمنة والموثوقة',
      },
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/general');
        const data = await response.json();
        if (data) {
          setContent((prev) => ({
            ...prev,
            siteName: data.siteName || prev.siteName,
            siteTitle: data.siteTitle || prev.siteTitle,
            siteDescription: data.siteDescription || prev.siteDescription,
            welcomeMessage: data.welcomeMessage || prev.welcomeMessage,
            hero: {
              ...prev.hero,
              title: data.siteTitle || prev.hero.title,
            },
          }));
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    if (typeof window !== 'undefined') {
      fetchSettings();
    }
  }, []);

  return content;
};

// خطافات إضافية للتوافق
export const useCurrentCountry = () => {
  const { country } = useSimpleLocalization();
  return (
    country || {
      name: 'ليبيا',
      code: 'LY',
      currency: 'LYD',
      currencySymbol: 'د.ل',
      currencyName: 'دينار ليبي',
      flag: '🇱🇾',
    }
  );
};

export const usePriceFormatter = () => {
  const { formatPrice } = useSimpleLocalization();
  return {
    formatPrice,
    convertPrice: (amount: number) => amount, // تحويل بسيط
  };
};

// خطاف معلومات الأعمال
export const useBusiness = () => {
  return {
    popularBrands: [
      'تويوتا',
      'نيسان',
      'هيونداي',
      'كيا',
      'فولكس واجن',
      'بيجو',
      'رينو',
      'شيفروليه',
      'فورد',
      'مازda',
    ],
    localDealers: [
      'وكالة السيارات الليبية',
      'مركز السيارات المتحدة',
      'شركة النجمة للسيارات',
      'وكالة الهلال للسيارات',
    ],
    financingOptions: [
      'التقسيط على 12 شهر',
      'التقسيط على 24 شهر',
      'التقسيط على 36 شهر',
      'الدفع النقدي مع خصم',
    ],
    inspectionCenters: [
      'مركز الفحص الفني - طرابلس',
      'مركز الفحص الفني - بنغازي',
      'مركز الفحص الفني - مصراتة',
      'مركز الفحص الفني - سبها',
    ],
  };
};

export const useLocalization = () => {
  const context = useSimpleLocalization();
  return {
    ...context,
    country: context.country,
    setCountry: context.setCountry,
    isLoading: context.isLoading,
    availableCountries: context.availableCountries,
    formatPrice: context.formatPrice,
    convertPrice: (amount: number) => amount,
    localization: {
      currency: {
        symbol: context.country?.currencySymbol || 'د.ل',
        name: context.country?.currencyName || 'دينار ليبي',
      },
      content: useContent(),
    },
  };
};
