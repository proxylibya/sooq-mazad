import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  handleCitySelect: (city: string) => void;
  isLoading: boolean;
  cityChangeListeners: ((city: string) => void)[];
  addCityListener: (callback: (city: string) => void) => void;
  removeCityListener: (callback: (city: string) => void) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

interface CityProviderProps {
  children: ReactNode;
}

export const CityProvider: React.FC<CityProviderProps> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState('جميع المدن');
  const [isLoading, setIsLoading] = useState(false);
  const [cityChangeListeners, setCityChangeListeners] = useState<((city: string) => void)[]>([]);
  const router = useRouter();

  // تحديث المدينة من URL عند تحميل الصفحة
  useEffect(() => {
    const cityFromUrl = router.query.city as string;
    if (cityFromUrl) {
      setSelectedCity(cityFromUrl);
    }
  }, [router.query.city]);

  // إضافة مستمع لتغيير المدينة
  const addCityListener = (callback: (city: string) => void) => {
    setCityChangeListeners((prev) => [...prev, callback]);
  };

  // إزالة مستمع تغيير المدينة
  const removeCityListener = (callback: (city: string) => void) => {
    setCityChangeListeners((prev) => prev.filter((listener) => listener !== callback));
  };

  // دالة معالجة اختيار المدينة
  const handleCitySelect = (city: string) => {
    console.log('تم اختيار المدينة:', city);
    setIsLoading(true);

    // تحديث الحالة المحلية
    setSelectedCity(city);

    // إعلام جميع المستمعين
    cityChangeListeners.forEach((listener) => {
      try {
        listener(city);
      } catch (error) {
        console.error('خطأ في مستمع تغيير المدينة:', error);
      }
    });

    // تحديث URL بدون إعادة تحميل الصفحة
    const currentPath = router.pathname;
    const currentQuery = { ...router.query };

    if (city === 'جميع المدن' || city === 'all') {
      delete currentQuery.city;
    } else {
      currentQuery.city = city;
    }

    // تحديث URL
    router
      .push(
        {
          pathname: currentPath,
          query: currentQuery,
        },
        undefined,
        { shallow: true },
      )
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const value: CityContextType = {
    selectedCity,
    setSelectedCity,
    handleCitySelect,
    isLoading,
    cityChangeListeners,
    addCityListener,
    removeCityListener,
  };

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

// Hook لاستخدام Context
export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};

// Hook لمراقبة تغيير المدينة
export const useCityListener = (callback: (city: string) => void) => {
  const { addCityListener, removeCityListener } = useCity();

  useEffect(() => {
    addCityListener(callback);

    return () => {
      removeCityListener(callback);
    };
  }, [callback, addCityListener, removeCityListener]);
};
