import { useState, useEffect, useCallback, useMemo } from 'react';
import carBrands, { findBrand, popularBrands, CarBrand } from '../data/car-brands-logos';

interface UseCarBrandLogosOptions {
  /** تحميل الشعارات الشائعة أولاً */
  prioritizePopular?: boolean;
  /** تحميل كسول للشعارات */
  lazyLoading?: boolean;
  /** تخزين مؤقت للشعارات */
  caching?: boolean;
  /** فلترة حسب البلد */
  filterByCountry?: string;
  /** البحث في الأسماء */
  searchTerm?: string;
}

interface LogoLoadState {
  [brandName: string]: {
    loaded: boolean;
    error: boolean;
    loading: boolean;
  };
}

export const useCarBrandLogos = (options: UseCarBrandLogosOptions = {}) => {
  const {
    prioritizePopular = true,
    lazyLoading = true,
    caching = true,
    filterByCountry,
    searchTerm = '',
  } = options;

  // حالة تحميل الشعارات
  const [logoStates, setLogoStates] = useState<LogoLoadState>({});

  // تخزين مؤقت للشعارات المحملة
  const [logoCache, setLogoCache] = useState<Map<string, string>>(new Map());

  // فلترة العلامات التجارية
  const filteredBrands = useMemo(() => {
    let brands = [...carBrands];

    // فلترة حسب البحث
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      brands = brands.filter((brand) => brand.name.toLowerCase().includes(term));
    }

    // ترتيب الشعارات الشائعة أولاً
    if (prioritizePopular) {
      brands.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return 0;
      });
    }

    return brands;
  }, [filterByCountry, searchTerm, prioritizePopular]);

  // الحصول على مسار الشعار المحسن
  const getOptimizedLogoPath = useCallback((brand: CarBrand): string => {
    // استخدام الشعار من البيانات مباشرة إذا كان يحتوي على real-logos
    if (brand.logo && brand.logo.includes('real-logos')) {
      return brand.logo;
    }

    // خريطة الشعارات المحسنة
    const optimizedLogos: { [key: string]: string } = {
      تويوتا: '/images/car-brands/real-logos/toyota.svg',
      هوندا: '/images/car-brands/real-logos/honda.svg',
      نيسان: '/images/car-brands/real-logos/nissan.svg',
      مرسيدس: '/images/car-brands/real-logos/mercedes.svg',
      BMW: '/images/car-brands/real-logos/bmw.svg',
      أودي: '/images/car-brands/real-logos/audi.svg',
      'فولكس واجن': '/images/car-brands/real-logos/volkswagen.svg',
      فورد: '/images/car-brands/real-logos/ford.svg',
      شيفروليه: '/images/car-brands/real-logos/chevrolet.svg',
      لكزس: '/images/car-brands/real-logos/lexus.svg',
      مازدا: '/images/car-brands/real-logos/mazda.svg',
      سوبارو: '/images/car-brands/real-logos/subaru.svg',
      ميتسوبيشي: '/images/car-brands/real-logos/mitsubishi.svg',
      إنفينيتي: '/images/car-brands/real-logos/infiniti.svg',
    };

    return optimizedLogos[brand.name] || brand.logo || '/images/car-brands/default.svg';
  }, []);

  // تحميل شعار مسبقاً
  const preloadLogo = useCallback(
    async (brandName: string, logoPath: string) => {
      if (!lazyLoading || logoCache.has(brandName)) {
        return;
      }

      setLogoStates((prev) => ({
        ...prev,
        [brandName]: { loaded: false, error: false, loading: true },
      }));

      try {
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = logoPath;
        });

        if (caching) {
          setLogoCache((prev) => new Map(prev).set(brandName, logoPath));
        }

        setLogoStates((prev) => ({
          ...prev,
          [brandName]: { loaded: true, error: false, loading: false },
        }));
      } catch (error) {
        setLogoStates((prev) => ({
          ...prev,
          [brandName]: { loaded: false, error: true, loading: false },
        }));
      }
    },
    [lazyLoading, caching, logoCache],
  );

  // تحميل الشعارات الشائعة مسبقاً
  useEffect(() => {
    if (prioritizePopular && !lazyLoading) {
      const popularBrandsData = popularBrands;

      popularBrandsData.forEach((brand) => {
        const logoPath = getOptimizedLogoPath(brand);
        preloadLogo(brand.name, logoPath);
      });
    }
  }, [prioritizePopular, lazyLoading, preloadLogo, getOptimizedLogoPath]);

  // الحصول على حالة تحميل شعار
  const getLogoState = useCallback(
    (brandName: string) => {
      return logoStates[brandName] || { loaded: false, error: false, loading: false };
    },
    [logoStates],
  );

  // الحصول على شعار من التخزين المؤقت
  const getCachedLogo = useCallback(
    (brandName: string) => {
      return logoCache.get(brandName);
    },
    [logoCache],
  );

  // مسح التخزين المؤقت
  const clearCache = useCallback(() => {
    setLogoCache(new Map());
    setLogoStates({});
  }, []);

  // إحصائيات التحميل
  const loadingStats = useMemo(() => {
    const states = Object.values(logoStates);
    return {
      total: states.length,
      loaded: states.filter((s) => s.loaded).length,
      loading: states.filter((s) => s.loading).length,
      errors: states.filter((s) => s.error).length,
      progress:
        states.length > 0 ? (states.filter((s) => s.loaded).length / states.length) * 100 : 0,
    };
  }, [logoStates]);

  return {
    // البيانات
    brands: filteredBrands,
    popularBrands: popularBrands,

    // الدوال
    getBrandByName: findBrand,
    getOptimizedLogoPath,
    preloadLogo,
    getLogoState,
    getCachedLogo,
    clearCache,

    // الحالة
    logoStates,
    loadingStats,

    // التخزين المؤقت
    cacheSize: logoCache.size,
    isCacheEnabled: caching,
  };
};
