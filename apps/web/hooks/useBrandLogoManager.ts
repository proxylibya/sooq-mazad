import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  carBrands,
  getBrandInfo,
  getBrandLogo,
  searchBrands,
  getSortedBrands,
  popularBrands,
  brandStats,
  DEFAULT_LOGO,
  type CarBrand,
} from '../data/car-brands-logos';

interface LogoLoadState {
  [brandName: string]: {
    loaded: boolean;
    error: boolean;
    loading: boolean;
    lastAttempt?: number;
  };
}

interface UseBrandLogoManagerOptions {
  /** تحميل الشعارات الشائعة أولاً */
  prioritizePopular?: boolean;
  /** تحميل كسول للشعارات */
  lazyLoading?: boolean;
  /** تخزين مؤقت للشعارات */
  enableCaching?: boolean;
  /** مدة انتهاء صلاحية التخزين المؤقت (بالدقائق) */
  cacheExpiry?: number;
  /** إعادة المحاولة عند الفشل */
  retryOnError?: boolean;
  /** عدد محاولات الإعادة */
  maxRetries?: number;
  /** فلترة حسب الفئة */
  filterByCategory?: string[];
  /** البحث الأولي */
  initialSearch?: string;
}

interface BrandLogoManagerReturn {
  /** جميع الماركات */
  brands: CarBrand[];
  /** الماركات الشائعة */
  popularBrands: CarBrand[];
  /** الماركات المفلترة */
  filteredBrands: CarBrand[];
  /** حالة تحميل الشعارات */
  logoStates: LogoLoadState;
  /** إحصائيات الماركات */
  stats: typeof brandStats;
  /** البحث في الماركات */
  searchBrands: (term: string) => void;
  /** مصطلح البحث الحالي */
  searchTerm: string;
  /** تحميل شعار ماركة معينة */
  preloadLogo: (brandName: string) => Promise<boolean>;
  /** تحميل شعارات متعددة */
  preloadLogos: (brandNames: string[]) => Promise<boolean[]>;
  /** مسح التخزين المؤقت */
  clearCache: () => void;
  /** إعادة تحميل شعار */
  reloadLogo: (brandName: string) => Promise<boolean>;
  /** الحصول على معلومات الماركة */
  getBrandInfo: (brandName: string) => ReturnType<typeof getBrandInfo>;
  /** التحقق من توفر الشعار */
  hasLogo: (brandName: string) => boolean;
  /** الحصول على حالة التحميل */
  getLoadingState: (brandName: string) => LogoLoadState[string];
}

const CACHE_KEY = 'brand-logos-cache';
const CACHE_VERSION = '1.0';

export const useBrandLogoManager = (
  options: UseBrandLogoManagerOptions = {},
): BrandLogoManagerReturn => {
  const {
    prioritizePopular = true,
    lazyLoading = true,
    enableCaching = true,
    cacheExpiry = 60, // 60 دقيقة
    retryOnError = true,
    maxRetries = 3,
    filterByCategory = [],
    initialSearch = '',
  } = options;

  const [logoStates, setLogoStates] = useState<LogoLoadState>({});
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // تحميل التخزين المؤقت من localStorage
  const loadCache = useCallback(() => {
    if (!enableCaching) return {};

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { version, data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const expiry = cacheExpiry * 60 * 1000; // تحويل إلى ميلي ثانية

        if (version === CACHE_VERSION && now - timestamp < expiry) {
          return data;
        }
      }
    } catch (error) {
      console.warn('فشل في تحميل التخزين المؤقت للشعارات:', error);
    }

    return {};
  }, [enableCaching, cacheExpiry]);

  // حفظ التخزين المؤقت في localStorage
  const saveCache = useCallback(
    (data: LogoLoadState) => {
      if (!enableCaching) return;

      try {
        const cacheData = {
          version: CACHE_VERSION,
          data,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('فشل في حفظ التخزين المؤقت للشعارات:', error);
      }
    },
    [enableCaching],
  );

  // تهيئة التخزين المؤقت
  useEffect(() => {
    const cachedStates = loadCache();
    if (Object.keys(cachedStates).length > 0) {
      setLogoStates(cachedStates);
    }
  }, [loadCache]);

  // حفظ التخزين المؤقت عند التغيير
  useEffect(() => {
    if (Object.keys(logoStates).length > 0) {
      saveCache(logoStates);
    }
  }, [logoStates, saveCache]);

  // الماركات المفلترة
  const filteredBrands = useMemo(() => {
    let brands = searchTerm ? searchBrands(searchTerm) : getSortedBrands(prioritizePopular);

    if (filterByCategory.length > 0) {
      brands = brands.filter(
        (brand) => brand.category && filterByCategory.includes(brand.category),
      );
    }

    return brands;
  }, [searchTerm, prioritizePopular, filterByCategory]);

  // تحميل شعار واحد
  const preloadLogo = useCallback(
    async (brandName: string): Promise<boolean> => {
      const brandInfo = getBrandInfo(brandName);
      if (!brandInfo?.logo) return false;

      // التحقق من حالة التحميل الحالية
      const currentState = logoStates[brandName];
      if (currentState?.loaded || currentState?.loading) {
        return currentState.loaded;
      }

      // التحقق من عدد المحاولات
      if (retryOnError && currentState?.error) {
        const now = Date.now();
        const lastAttempt = currentState.lastAttempt || 0;
        const timeSinceLastAttempt = now - lastAttempt;

        // انتظار دقيقة واحدة بين المحاولات
        if (timeSinceLastAttempt < 60000) {
          return false;
        }
      }

      // تحديث حالة التحميل
      setLogoStates((prev) => ({
        ...prev,
        [brandName]: {
          ...prev[brandName],
          loading: true,
          error: false,
        },
      }));

      try {
        // إنشاء عنصر صورة لتحميل الشعار
        const img = new Image();

        return new Promise((resolve) => {
          img.onload = () => {
            setLogoStates((prev) => ({
              ...prev,
              [brandName]: {
                loaded: true,
                error: false,
                loading: false,
                lastAttempt: Date.now(),
              },
            }));
            resolve(true);
          };

          img.onerror = () => {
            setLogoStates((prev) => ({
              ...prev,
              [brandName]: {
                loaded: false,
                error: true,
                loading: false,
                lastAttempt: Date.now(),
              },
            }));
            resolve(false);
          };

          img.src = brandInfo.logo;
        });
      } catch (error) {
        setLogoStates((prev) => ({
          ...prev,
          [brandName]: {
            loaded: false,
            error: true,
            loading: false,
            lastAttempt: Date.now(),
          },
        }));
        return false;
      }
    },
    [logoStates, retryOnError],
  );

  // تحميل شعارات متعددة
  const preloadLogos = useCallback(
    async (brandNames: string[]): Promise<boolean[]> => {
      const promises = brandNames.map((brandName) => preloadLogo(brandName));
      return Promise.all(promises);
    },
    [preloadLogo],
  );

  // تحميل الشعارات الشائعة تلقائياً
  useEffect(() => {
    if (prioritizePopular && !lazyLoading) {
      const popularBrandNames = popularBrands.map((brand) => brand.name);
      preloadLogos(popularBrandNames);
    }
  }, [prioritizePopular, lazyLoading, preloadLogos]);

  // مسح التخزين المؤقت
  const clearCache = useCallback(() => {
    setLogoStates({});
    if (enableCaching) {
      localStorage.removeItem(CACHE_KEY);
    }
  }, [enableCaching]);

  // إعادة تحميل شعار
  const reloadLogo = useCallback(
    async (brandName: string): Promise<boolean> => {
      // مسح الحالة الحالية
      setLogoStates((prev) => {
        const newState = { ...prev };
        delete newState[brandName];
        return newState;
      });

      // إعادة التحميل
      return preloadLogo(brandName);
    },
    [preloadLogo],
  );

  // البحث في الماركات
  const handleSearchBrands = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // التحقق من توفر الشعار
  const hasLogo = useCallback((brandName: string): boolean => {
    const brandInfo = getBrandInfo(brandName);
    return !!brandInfo?.logo;
  }, []);

  // الحصول على حالة التحميل
  const getLoadingState = useCallback(
    (brandName: string) => {
      return (
        logoStates[brandName] || {
          loaded: false,
          error: false,
          loading: false,
        }
      );
    },
    [logoStates],
  );

  return {
    brands: carBrands,
    popularBrands,
    filteredBrands,
    logoStates,
    stats: brandStats,
    searchBrands: handleSearchBrands,
    searchTerm,
    preloadLogo,
    preloadLogos,
    clearCache,
    reloadLogo,
    getBrandInfo,
    hasLogo,
    getLoadingState,
  };
};

export default useBrandLogoManager;
