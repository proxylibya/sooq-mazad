import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { useSession } from 'next-auth/react'; // تم تعطيل نظام المصادقة مؤقتاً
import { GetServerSideProps } from 'next';
import { OpensooqNavbar, Pagination } from '../components/common';
import { usePagination } from '../hooks/usePagination';

import FeaturedAdsCarousel from '../components/FeaturedAdsCarousel';
import { MarketplaceCarCard, MarketplaceCarCardGrid } from '../components/features/marketplace';
// تم استبدال YearRangeSelector بـ YearSelect مباشرة

// import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon'; // غير مستخدم حالياً
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
// import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon'; // غير مستخدم حالياً
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import MarketplaceLocationSection from '../components/marketplace/MarketplaceLocationSection';
import SelectField from '../components/ui/SelectField';

import { cityNames } from '../data/libyan-cities';
import { bodyTypes, carYears, getModelsByBrand } from '../data/simple-filters';
import { SafeLocalStorage } from '../utils/unifiedLocalStorage';
// import { simpleCache } from '../utils/simpleCaching'; // غير مستخدم حالياً
import dynamic from 'next/dynamic';
import SafetyTips from '../components/SafetyTips';
import { CarsGridSkeleton } from '../components/ui/loading';
import { translateToArabic } from '../utils/formatters';

const AdPlacement = dynamic(() => import('../components/advertising/AdPlacement'), { ssr: false });

// إنشاء خيارات المدن
const locationOptions = ['جميع المدن', ...cityNames];

// أنواع البيانات
interface CarWithUser {
  id: string;
  title: string;
  price: number;
  condition: string;
  brand: string;
  model: string;
  year: number;
  bodyType?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  location: string;
  area?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  images: string[];
  carImages?: Array<{ fileUrl: string; isPrimary?: boolean }>; // إضافة دعم carImages
  featured?: boolean;
  promotionPackage?: string;
  promotionEndDate?: string | Date;
  negotiable?: boolean;
  urgent?: boolean;

  // البيانات الجديدة المضافة
  vehicleType?: string;
  manufacturingCountry?: string;
  regionalSpecs?: string;
  seatCount?: string;
  color?: string;
  interiorColor?: string;
  chassisNumber?: string;
  customsStatus?: string;
  licenseStatus?: string;
  insuranceStatus?: string;
  features?: string[];
  interiorFeatures?: string[];
  exteriorFeatures?: string[];
  technicalFeatures?: string[];
  paymentMethod?: string;

  user?: {
    id: string;
    name: string;
    phone: string;
    verified: boolean;
  };
}

interface MarketplacePageProps {
  cars: CarWithUser[];
  stats: {
    total: number;
    negotiable: number;
    urgent: number;
    newCars: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({
  cars: initialCars = [],
  stats = { total: 0, negotiable: 0, urgent: 0, newCars: 0 },
  pagination: initialPagination,
}) => {
  const router = useRouter();

  // إعداد خيارات السنوات من carYears
  const yearOptions = ['جميع السنوات', ...carYears.map((year) => year.toString())];

  const [cars, setCars] = useState<CarWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const [isAutoGrid, setIsAutoGrid] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isFilteringInProgress, setIsFilteringInProgress] = useState(false);

  // حالة الفلاتر
  const [filters, setFilters] = useState({
    searchQuery: '',
    location: 'جميع المدن',
    brand: 'الماركات',
    model: 'الموديلات',
    bodyType: 'جميع الأنواع',
    yearFrom: 'جميع السنوات',
    yearTo: 'جميع السنوات',
    priceMin: null as number | null,
    priceMax: null as number | null,
  });

  // مراقبة حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);

      // تحويل تلقائي إلى وضع الشبكة عند أقل من 1080px
      if (width < 1080) {
        if (viewMode === 'list') {
          setViewMode('grid');
          setIsAutoGrid(true);
        }
      } else {
        // العودة إلى الوضع المحفوظ عند الشاشات الأكبر
        if (isAutoGrid) {
          const savedViewMode = SafeLocalStorage.getItem('marketplace-view-mode', 'list');
          setViewMode(savedViewMode);
          setIsAutoGrid(false);
        }
      }
    };

    // تعيين الحجم الأولي
    handleResize();

    // إضافة مستمع للتغيير
    window.addEventListener('resize', handleResize);

    // تنظيف المستمع
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode, isAutoGrid]);

  // تحميل وضع العرض المحفوظ
  useEffect(() => {
    const savedViewMode = SafeLocalStorage.getItem('marketplace-view-mode', 'list');
    setViewMode(savedViewMode);
  }, []);

  // حفظ وضع العرض عند التغيير - تحسين بـ useCallback
  // تم تعطيل مؤقتاً - غير مستخدم حالياً
  const _handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
    setIsAutoGrid(false); // إلغاء الوضع التلقائي عند التغيير اليدوي
    SafeLocalStorage.setItem('marketplace-view-mode', mode);
  }, []);

  // حالة الإشعارات
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });

  // إعداد الترقيم
  const pagination = usePagination({
    initialPage: initialPagination?.page || 1,
    itemsPerPage: initialPagination?.limit || 20,
    totalItems: initialPagination?.total || stats.total,
    updateURL: true,
    pageParam: 'page',
  });

  // دالة تحديث البيانات محسنة للأداء - إصلاح جذري
  const refreshCars = async (showLoading = false) => {
    // منع التحديث المتعدد المتزامن
    if (refreshCars.isRunning) {
      // تم تجاهل التحديث - قيد التشغيل بالفعل
      return;
    }

    refreshCars.isRunning = true;

    try {
      // تعيين حالة التحميل فقط إذا طُلب ذلك
      if (showLoading) {
        // تعيين حالة التحميل
        setLoading(true);
      }

      // إضافة timestamp لتجنب cache
      const timestamp = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // زيادة timeout إلى 15 ثانية

      try {
        const apiUrl = `/api/cars?status=AVAILABLE&page=${pagination.currentPage}&limit=${pagination.itemsPerPage}&isAuction=false&_t=${timestamp}`;
        // استدعاء API للبيانات الجديدة

        const response = await fetch(apiUrl, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          // تم استلام البيانات بنجاح

          // إذا كانت الاستجابة لا تحتوي على data أو cars، نحافظ على القائمة الحالية
          if (!data || !data.data || !Array.isArray(data.data.cars)) {
            console.warn(
              '⚠️ [RefreshCars] استجابة غير صالحة أو بدون cars - الاحتفاظ بالقائمة الحالية',
            );
            // تحديث معلومات الترقيم إن وُجدت
            if (data?.data?.pagination?.total !== undefined) {
              pagination.setTotalItems(data.data.pagination.total);
            }
            setLoading(false);
            return;
          }

          // تحويل البيانات إلى التنسيق المطلوب مع دعم carImages الجديدة
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedCars: CarWithUser[] = (data.data?.cars || []).map((car: any) => ({
            id: car.id,
            title: car.title || 'سيارة بدون عنوان',
            price: car.price || 0,
            condition: translateToArabic(car.condition || '') || 'مستعمل',
            brand: car.brand || 'غير محدد',
            model: car.model || 'غير محدد',
            year: car.year || new Date().getFullYear(),
            bodyType: translateToArabic(car.bodyType || '') || 'سيدان',
            mileage: car.mileage || 0,
            fuelType: translateToArabic(car.fuelType || '') || 'بنزين',
            transmission: translateToArabic(car.transmission || '') || 'أوتوماتيك',
            location:
              typeof car.location === 'string' && car.location.trim() ? car.location : 'طرابلس',
            area: car.area,
            coordinates: undefined,
            images:
              Array.isArray(car.images) && car.images.length > 0
                ? car.images
                : ['/images/cars/default-car.svg'],
            carImages: car.carImages || [],
            featured: car.featured || false,
            promotionPackage: car.promotionPackage || 'free',
            promotionEndDate: car.promotionEndDate,
            negotiable: car.isNegotiable || false,
            urgent: car.urgent || false,
            user: car.user || {
              id: car.sellerId || 'unknown',
              name: 'مستخدم غير معروف',
              phone: car.phone || '',
              verified: false,
            },
          }));

          // تحديث البيانات بنجاح

          // تحديث معلومات الترقيم أولاً
          if (data.data?.pagination) {
            pagination.setTotalItems(data.data.pagination.total);
          }

          // إذا أعاد الـ API قائمة فارغة، لا نقوم بمسح القائمة الحالية لتجنب اختفاء البطاقات
          if (formattedCars.length === 0) {
            console.warn('⚠️ [RefreshCars] API أعاد 0 سيارات - الحفاظ على القائمة الحالية');
            // تحديث معلومات الترقيم أولاً إن وُجدت
            if (data.data?.pagination) {
              pagination.setTotalItems(data.data.pagination.total);
            }
            setLoading(false);
            return;
          }

          // تحديث البيانات - هذا هو الجزء المهم
          setCars(formattedCars);

          // إزالة حالة التحميل
          setLoading(false);
        } else {
          console.error('❌ [RefreshCars] فشل في جلب البيانات، كود الحالة:', response.status);
          setLoading(false);
        }
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            // تم إلغاء الطلب
          } else {
            console.error('❌ [RefreshCars] خطأ في الشبكة:', fetchError.message);
            throw fetchError;
          }
        } else {
          console.error('❌ [RefreshCars] خطأ غير متوقع:', fetchError);
        }
        setLoading(false);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      console.error('❌ [RefreshCars] خطأ عام:', errorMessage);
      setLoading(false);
    } finally {
      refreshCars.isRunning = false;
      // انتهاء التحديث
    }
  };

  // إضافة خاصية لمنع التحديث المتعدد
  refreshCars.isRunning = false;

  // تحديث البيانات تلقائياً - إصلاح للتكرار
  useEffect(() => {
    // تحميل البيانات الأولية مرة واحدة فقط
    if (initialCars && Array.isArray(initialCars) && initialCars.length > 0) {
      // تم تحميل البيانات الأولية بنجاح من SSR
      console.log(`✅ [Frontend] تحميل ${initialCars.length} سيارة من SSR`);
      setCars(initialCars);
      setLoading(false);
    } else {
      console.log('⚠️ [Frontend] لا توجد بيانات أولية من SSR');
      setCars([]);
      setLoading(false);
    }

    // تعيين الفلاتر الافتراضية مرة واحدة فقط
    setFilters({
      searchQuery: '',
      location: 'جميع المدن',
      brand: 'الماركات',
      model: 'الموديلات',
      bodyType: 'جميع الأنواع',
      yearFrom: 'جميع السنوات',
      yearTo: 'جميع السنوات',
      priceMin: null,
      priceMax: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // إزالة initialCars من dependencies لتجنب التحميل المتكرر

  // تحديث البيانات عند تغيير الصفحة
  useEffect(() => {
    if (pagination.currentPage > 1) {
      console.log('📄 [Frontend] تغيير الصفحة إلى:', pagination.currentPage);
      refreshCars(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage]); // refreshCars مُستبعد عمداً لتجنب التكرار

  // تحديث البيانات عند العودة للصفحة - محسن بتقليل الاستدعاءات
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout;
    let lastRefreshTime = 0;
    const MIN_REFRESH_INTERVAL = 30000; // 30 ثانية كحد أدنى بين التحديثات

    // دالة محسنة للتحديث مع منع التحديث المتكرر
    const throttledRefresh = () => {
      const now = Date.now();
      if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
        console.log('🚫 [ThrottledRefresh] تم تجاهل التحديث - قريب جداً من آخر تحديث');
        return;
      }

      console.log('🔄 [ThrottledRefresh] بدء التحديث المتحكم فيه');
      lastRefreshTime = now;
      refreshCars(false); // عدم إظهار loading للتحديثات التلقائية
    };

    // تقليل استدعاءات handleFocus بشدة
    const handleFocus = () => {
      console.log('👀 [Focus] المستخدم عاد للصفحة');
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(throttledRefresh, 3000); // تأخير أطول
    };

    // معالجة إضافة إعلان جديد فقط
    const handleNewCarAdded = (event: any) => {
      console.log('🆕 [NewCarAdded] تم إضافة إعلان جديد');
      throttledRefresh();

      // إظهار إشعار محسن
      if (!notification.show) {
        setNotification({
          show: true,
          type: 'success',
          message: `تم إضافة إعلان جديد! العدد الإجمالي: ${event.detail?.totalCars || 'غير محدد'}`,
        });
        setTimeout(() => {
          setNotification({ show: false, type: '', message: '' });
        }, 3000);
      }
    };

    // تقليل المستمعات إلى الضرورية فقط
    window.addEventListener('focus', handleFocus);
    window.addEventListener('newCarAdded', handleNewCarAdded);

    return () => {
      clearTimeout(refreshTimeout);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('newCarAdded', handleNewCarAdded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification.show]); // refreshCars مُستبعد عمداً

  // التحقق من إضافة إعلان جديد - تحسين لمنع التحديث المتكرر
  useEffect(() => {
    const { new: isNew, id } = router.query;
    if (isNew === 'true' && id) {
      console.log('🆕 [NewListing] تم اكتشاف إعلان جديد:', id);

      setNotification({
        show: true,
        type: 'success',
        message: `تم نشر إعلانك بنجاح في السوق الفوري! معرف الإعلان: ${id}`,
      });

      // تحديث البيانات لإظهار الإعلان الجديد - مرة واحدة فقط
      const updateTimeout = setTimeout(() => {
        refreshCars(true);
      }, 2000); // تأخير أطول للسماح بمعالجة البيانات

      // إخفاء الإشعار وتنظيف URL
      const hideTimeout = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
        router.replace('/marketplace', undefined, { shallow: true });
      }, 5000);

      return () => {
        clearTimeout(updateTimeout);
        clearTimeout(hideTimeout);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]); // refreshCars و router مُستبعدين عمداً

  // الحصول على موديلات الماركة المختارة
  const getModelOptions = () => {
    if (filters.brand === 'الماركات') {
      return ['الموديلات'];
    }
    const models = getModelsByBrand(filters.brand);
    return ['الموديلات', ...models];
  };

  // إضافة debouncing للفلاتر لتحسين الأداء
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    setIsFilteringInProgress(true);

    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setIsFilteringInProgress(false);
    }, 300); // تأخير 300ms قبل تطبيق الفلتر

    return () => {
      clearTimeout(timer);
      setIsFilteringInProgress(false);
    };
  }, [filters]);

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [filterType]: value,
      };

      // إعادة تعيين الموديل عند تغيير الماركة
      if (filterType === 'brand') {
        newFilters.model = 'الموديلات';
      }

      return newFilters;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      location: 'جميع المدن',
      brand: 'الماركات',
      model: 'الموديلات',
      bodyType: 'جميع الأنواع',
      yearFrom: 'جميع السنوات',
      yearTo: 'جميع السنوات',
      priceMin: null,
      priceMax: null,
    });

    // إظهار إشعار بإعادة تعيين الفلاتر
    setNotification({
      show: true,
      type: 'success',
      message: 'تم إعادة تعيين جميع الفلاتر',
    });

    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 2000);
  }, []);

  // تحسين الفلترة باستخدام useMemo و debouncedFilters
  const filteredCars = useMemo(() => {
    let filtered = cars;

    // فلتر البحث النصي مع debouncing
    if (debouncedFilters.searchQuery) {
      const query = debouncedFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (car) =>
          car.title.toLowerCase().includes(query) ||
          car.brand.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query),
      );
    }

    // فلتر المدينة
    if (debouncedFilters.location !== 'جميع المدن') {
      filtered = filtered.filter((car) => car.location.includes(debouncedFilters.location));
    }

    // فلتر الماركة
    if (debouncedFilters.brand !== 'الماركات') {
      filtered = filtered.filter((car) => car.brand === debouncedFilters.brand);
    }

    // فلتر الموديل - مع تحقق إضافي
    if (debouncedFilters.model && debouncedFilters.model !== 'الموديلات') {
      filtered = filtered.filter((car) => car.model === debouncedFilters.model);
    }

    // فلتر نوع السيارة
    if (debouncedFilters.bodyType !== 'جميع الأنواع') {
      filtered = filtered.filter((car) => car.bodyType === debouncedFilters.bodyType);
    }

    // فلتر سنة الصنع
    if (debouncedFilters.yearFrom !== 'جميع السنوات') {
      const yearFrom = parseInt(debouncedFilters.yearFrom);
      filtered = filtered.filter((car) => car.year >= yearFrom);
    }

    if (debouncedFilters.yearTo !== 'جميع السنوات') {
      const yearTo = parseInt(debouncedFilters.yearTo);
      filtered = filtered.filter((car) => car.year <= yearTo);
    }

    // Log only in development and only when there's a change
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [FilteredCars] Results:', {
        total: cars.length,
        filtered: filtered.length,
        sample:
          filtered
            .slice(0, 2)
            .map((c) => `${c.brand} ${c.model}`)
            .join(', ') || 'None',
      });
    }

    return filtered;
  }, [cars, debouncedFilters]);

  return (
    <>
      <Head>
        <title>سوق الفوري | موقع مزاد السيارات</title>
        <meta
          name="description"
          content="تصفح السيارات المعروضة للبيع في سوق الفوري بأسعار ثابتة وقابلة للتفاوض"
        />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Ad Placement - Top */}
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <AdPlacement location="MARKETPLACE_TOP" />
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            className={`fixed right-4 top-20 z-50 max-w-sm rounded-lg p-4 shadow-lg ${
              notification.type === 'success'
                ? 'border border-green-400 bg-green-100 text-green-700'
                : notification.type === 'error'
                  ? 'border border-red-400 bg-red-100 text-red-700'
                  : 'border border-yellow-400 bg-yellow-100 text-yellow-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' && (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {notification.type === 'warning' && (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="flex-1 text-sm font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification({ show: false, type: '', message: '' })}
                className="mr-2 rounded-lg p-1 text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 active:scale-95"
                aria-label="إغلاق الإشعار"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* فلتر محمول للشاشات الصغيرة */}
        {screenWidth <= 660 && (
          <div className="mx-auto max-w-7xl px-4 py-2">
            <div className="rounded-lg border bg-white shadow-sm">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex w-full items-center justify-between p-4 text-right transition-all duration-200 hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-800">الفلاتر</span>
                  {(filters.brand !== 'الماركات' ||
                    filters.model !== 'الموديلات' ||
                    filters.location !== 'جميع المدن' ||
                    filters.bodyType !== 'جميع الأنواع') && (
                    <span className="active-filters-indicator rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      نشط
                    </span>
                  )}
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${showMobileFilters ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showMobileFilters && (
                <div className="space-y-3 border-t bg-gray-50/50 p-4">
                  {/* البحث */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">البحث</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ابحث عن سيارة..."
                        value={filters.searchQuery}
                        onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <MagnifyingGlassIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* الماركة والموديل في صف واحد */}
                  <div className="mobile-filters-grid grid grid-cols-2 gap-2">
                    <SelectField
                      label="الماركة"
                      options={[
                        'الماركات',
                        'تويوتا (Toyota)',
                        'نيسان (Nissan)',
                        'هوندا (Honda)',
                        'هيونداي (Hyundai)',
                        'كيا (Kia)',
                        'مازدا (Mazda)',
                        'ميتسوبيشي (Mitsubishi)',
                        'سوزوكي (Suzuki)',
                        'فورد (Ford)',
                        'شيفروليه (Chevrolet)',
                        'بيجو (Peugeot)',
                        'رينو (Renault)',
                        'فولكس فاجن (Volkswagen)',
                        'بي إم دبليو (BMW)',
                        'مرسيدس (Mercedes)',
                        'أودي (Audi)',
                      ]}
                      value={filters.brand}
                      onChange={(val) => handleFilterChange('brand', val)}
                      placeholder="اختر الماركة"
                      size="sm"
                      clearable={true}
                      searchable={true}
                    />
                    <SelectField
                      label="الموديل"
                      options={getModelOptions()}
                      value={filters.model}
                      onChange={(val) => handleFilterChange('model', val)}
                      placeholder="اختر الموديل"
                      size="sm"
                      clearable={true}
                      searchable={true}
                    />
                  </div>

                  {/* المدينة ونوع السيارة في صف واحد */}
                  <div className="mobile-filters-grid grid grid-cols-2 gap-2">
                    <SelectField
                      label="المدينة"
                      options={locationOptions}
                      value={filters.location}
                      onChange={(val) => handleFilterChange('location', val)}
                      placeholder="اختر المدينة"
                      size="sm"
                      clearable={true}
                      searchable={true}
                    />
                    <SelectField
                      label="نوع السيارة"
                      options={['جميع الأنواع', ...bodyTypes]}
                      value={filters.bodyType}
                      onChange={(val) => handleFilterChange('bodyType', val)}
                      placeholder="اختر نوع السيارة"
                      size="sm"
                      clearable={true}
                      searchable={true}
                    />
                  </div>

                  {/* سنة الصنع */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      سنة الصنع
                    </label>
                    <div className="mobile-filters-grid grid grid-cols-2 gap-2">
                      <SelectField
                        options={yearOptions}
                        value={filters.yearFrom}
                        onChange={(year) => handleFilterChange('yearFrom', year)}
                        placeholder="من"
                        size="sm"
                        clearable={true}
                        searchable={true}
                      />
                      <SelectField
                        options={yearOptions}
                        value={filters.yearTo}
                        onChange={(year) => handleFilterChange('yearTo', year)}
                        placeholder="إلى"
                        size="sm"
                        clearable={true}
                        searchable={true}
                      />
                    </div>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="mobile-filter-actions flex gap-2 pt-3">
                    <button
                      onClick={resetFilters}
                      className="filter-reset-button flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm active:scale-95"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>إزالة الكل</span>
                    </button>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="filter-apply-button flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-95"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>تطبيق الفلاتر</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-4">
          {/* Debug Information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 rounded bg-gray-100 p-2 text-xs text-gray-600">
              <strong>معلومات التشخيص:</strong>
              <br />
              إجمالي السيارات: {cars.length} | مفلترة: {filteredCars.length} | حالة التحميل:{' '}
              {loading ? 'جاري' : 'مكتمل'} | فلترة: {isFilteringInProgress ? 'جارية' : 'مكتملة'}
            </div>
          )}

          <div className={`flex items-start gap-4 ${screenWidth <= 660 ? 'flex-col' : ''}`}>
            {/* فلتر محسن بالقوائم المنسدلة الجديدة - مخفي في الشاشات الصغيرة */}
            <aside className={`w-72 flex-shrink-0 ${screenWidth <= 660 ? 'hidden' : ''}`}>
              <div className="marketplace-filters-sidebar space-y-3 rounded-2xl border bg-white p-5 shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
                    الفلاتر
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="flex items-center justify-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:scale-95"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>إزالة الكل</span>
                  </button>
                </div>

                {/* البحث */}
                <div className="filter-section-spacing">
                  <label className="mb-2 block text-sm font-medium text-gray-700">البحث</label>
                  <div className="marketplace-search-input relative">
                    <input
                      type="text"
                      placeholder="ابحث عن سيارة..."
                      value={filters.searchQuery}
                      onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      dir="rtl"
                    />
                    <MagnifyingGlassIcon className="marketplace-search-icon pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* المدينة */}
                <div className="filter-section-spacing">
                  <SelectField
                    label="المدينة"
                    options={locationOptions}
                    value={filters.location}
                    onChange={(val) => handleFilterChange('location', val)}
                    placeholder="اختر المدينة"
                    size="md"
                    clearable={true}
                    searchable={true}
                  />
                </div>

                {/* الماركة */}
                <div className="filter-section-spacing">
                  <SelectField
                    label="الماركة"
                    options={[
                      'الماركات',
                      'تويوتا (Toyota)',
                      'نيسان (Nissan)',
                      'هوندا (Honda)',
                      'هيونداي (Hyundai)',
                      'كيا (Kia)',
                      'مازدا (Mazda)',
                      'ميتسوبيشي (Mitsubishi)',
                      'سوزوكي (Suzuki)',
                      'فورد (Ford)',
                      'شيفروليه (Chevrolet)',
                      'بيجو (Peugeot)',
                      'رينو (Renault)',
                      'فولكس فاجن (Volkswagen)',
                      'بي إم دبليو (BMW)',
                      'مرسيدس (Mercedes)',
                      'أودي (Audi)',
                    ]}
                    value={filters.brand}
                    onChange={(val) => handleFilterChange('brand', val)}
                    placeholder="اختر الماركة"
                    size="md"
                    clearable={true}
                    searchable={true}
                  />
                </div>

                {/* الموديل */}
                <div className="filter-section-spacing">
                  <SelectField
                    label="الموديل"
                    options={getModelOptions()}
                    value={filters.model}
                    onChange={(val) => handleFilterChange('model', val)}
                    placeholder="اختر الموديل"
                    size="md"
                    clearable={true}
                    searchable={true}
                  />
                </div>

                {/* نوع السيارة */}
                <div className="filter-section-spacing">
                  <SelectField
                    label="نوع السيارة"
                    options={['جميع الأنواع', ...bodyTypes]}
                    value={filters.bodyType}
                    onChange={(val) => handleFilterChange('bodyType', val)}
                    placeholder="اختر نوع السيارة"
                    size="md"
                    clearable={true}
                    searchable={true}
                  />
                </div>

                {/* سنة الصنع */}
                <div className="filter-section-spacing">
                  <label className="mb-2 block text-sm font-medium text-gray-700">سنة الصنع</label>
                  <div className="grid grid-cols-2 gap-2">
                    <SelectField
                      options={yearOptions}
                      value={filters.yearFrom}
                      onChange={(year) => handleFilterChange('yearFrom', year)}
                      placeholder="من"
                      size="md"
                      clearable={true}
                      searchable={true}
                    />
                    <SelectField
                      options={yearOptions}
                      value={filters.yearTo}
                      onChange={(year) => handleFilterChange('yearTo', year)}
                      placeholder="إلى"
                      size="md"
                      clearable={true}
                      searchable={true}
                    />
                  </div>
                </div>

                {/* إضافة سيارة للبيع */}
                <div className="mt-4 border-t pt-4">
                  <div className="text-center">
                    <h3 className="mb-1 text-base font-bold text-gray-800">هل تريد بيع سيارتك؟</h3>
                    <p className="mb-3 text-xs text-gray-600">احصل على أفضل سعر لسيارتك</p>
                    <button
                      onClick={() => router.push('/add-listing')}
                      className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-lg active:scale-95"
                    >
                      أضف إعلانك الآن
                    </button>
                  </div>
                </div>
              </div>

              {/* قسم موقع السيارة */}
              <div className="mt-4">
                <MarketplaceLocationSection
                  cars={filteredCars
                    .filter((car) => car.coordinates)
                    .slice(0, 10) // عرض أول 10 سيارات فقط
                    .map((car) => ({
                      id: car.id,
                      title: `${car.brand} ${car.model}`,
                      location: {
                        lat: car.coordinates!.lat,
                        lng: car.coordinates!.lng,
                        address: car.location,
                      },
                      price: car.price,
                      brand: car.brand,
                      model: car.model,
                    }))}
                  className="w-full"
                />
              </div>
            </aside>

            {/* Cars List */}
            <div className={`${screenWidth <= 660 ? 'w-full' : 'flex-1'} min-h-0`}>
              <div className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>سوق الفوري</span>
                    <span className="text-gray-500">
                      ({filteredCars.length} من {cars.length})
                    </span>
                    {/* زر إعادة تعيين الفلاتر */}
                    {(filters.searchQuery ||
                      filters.location !== 'جميع المدن' ||
                      filters.brand !== 'الماركات' ||
                      filters.model !== 'الموديلات' ||
                      filters.bodyType !== 'جميع الأنواع' ||
                      filters.yearFrom !== 'جميع السنوات' ||
                      filters.yearTo !== 'جميع السنوات') && (
                      <button
                        onClick={resetFilters}
                        className="ml-3 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-200 hover:text-red-700 active:scale-95"
                      >
                        إعادة تعيين الفلاتر
                      </button>
                    )}
                  </h2>
                </div>

                {/* عرض الفلاتر النشطة */}
                {(filters.searchQuery ||
                  filters.location !== 'جميع المدن' ||
                  filters.brand !== 'الماركات' ||
                  filters.model !== 'الموديلات' ||
                  filters.bodyType !== 'جميع الأنواع' ||
                  filters.yearFrom !== 'جميع السنوات' ||
                  filters.yearTo !== 'جميع السنوات') && (
                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">الفلاتر المطبقة:</span>
                      <button
                        onClick={resetFilters}
                        className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-semibold text-blue-600 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                      >
                        إزالة الكل
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filters.searchQuery && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                          البحث: {filters.searchQuery}
                        </span>
                      )}
                      {filters.location !== 'جميع المدن' && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                          المدينة: {filters.location}
                        </span>
                      )}
                      {filters.brand !== 'الماركات' && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                          الماركة: {filters.brand}
                        </span>
                      )}
                      {filters.model !== 'الموديلات' && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                          الموديل: {filters.model}
                        </span>
                      )}
                      {filters.bodyType !== 'جميع الأنواع' && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                          النوع: {filters.bodyType}
                        </span>
                      )}
                      {(filters.yearFrom !== 'جميع السنوات' ||
                        filters.yearTo !== 'جميع السنوات') && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                          السنة: {filters.yearFrom !== 'جميع السنوات' ? filters.yearFrom : 'أي'} -{' '}
                          {filters.yearTo !== 'جميع السنوات' ? filters.yearTo : 'أي'}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* عرض الخريطة أو القائمة */}
                {loading ? (
                  <CarsGridSkeleton
                    count={8}
                    columns={screenWidth <= 800 ? 1 : screenWidth < 1080 ? 2 : 3}
                  />
                ) : (
                  <div
                    className={
                      viewMode === 'grid'
                        ? `grid gap-4 ${
                            screenWidth <= 800
                              ? 'grid-cols-1'
                              : screenWidth < 1080
                                ? 'grid-cols-1 sm:grid-cols-2'
                                : 'grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                          }`
                        : 'space-y-4'
                    }
                  >
                    {/* مؤشر التحميل أثناء الفلترة - يظهر opacity على البطاقات */}
                    {isFilteringInProgress && (
                      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/50">
                        <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-2 shadow-lg">
                          <div
                            className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
                            role="status"
                            aria-label="جاري التحميل"
                          />
                          <span className="text-sm font-medium text-blue-600">
                            جاري تطبيق الفلاتر...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* عرض السيارات */}
                    {!isFilteringInProgress &&
                      filteredCars.length > 0 &&
                      filteredCars.map((car, index) => (
                        <React.Fragment key={`${viewMode}-${car.id}`}>
                          {viewMode === 'grid' ? (
                            <MarketplaceCarCardGrid car={car} />
                          ) : (
                            <MarketplaceCarCard car={car} viewMode={viewMode} />
                          )}
                          {index === 9 && (
                            <div className={viewMode === 'grid' ? 'col-span-full' : ''}>
                              <FeaturedAdsCarousel />
                            </div>
                          )}
                        </React.Fragment>
                      ))}

                    {/* رسالة عدم وجود نتائج */}
                    {!isFilteringInProgress && filteredCars.length === 0 && (
                      <div className="py-12 text-center">
                        <div className="mb-4 text-gray-400">
                          <svg
                            className="mx-auto h-16 w-16"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد سيارات</h3>
                        <p className="text-gray-500">جرب تغيير الفلاتر أو إضافة سيارة جديدة</p>
                      </div>
                    )}
                  </div>
                )}

                {/* مكون الترقيم */}
                {!loading &&
                  !isFilteringInProgress &&
                  filteredCars.length > 0 &&
                  pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.setPage}
                        showInfo={true}
                        totalItems={pagination.totalItems}
                        itemsPerPage={pagination.itemsPerPage}
                        disabled={loading || isFilteringInProgress}
                        size="medium"
                        className="rounded-lg bg-white p-4 shadow-sm"
                      />
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
      `}</style>

      {/* Ad Placement - Bottom */}
      <div className="mx-auto max-w-7xl px-4 py-4">
        <AdPlacement location="MARKETPLACE_BOTTOM" />
      </div>

      {/* نصائح الأمان */}
      <div className="container mx-auto px-4 py-8">
        <SafetyTips />
      </div>
    </>
  );
};

// إضافة getServerSideProps لجلب البيانات الحقيقية من قاعدة البيانات
export const getServerSideProps: GetServerSideProps = async (context) => {
  // const { advancedCache, CacheNamespaces } = await import('../utils/advancedCaching'); // غير مستخدم حالياً
  const { dbHelpers } = await import('../lib/prisma');
  try {
    // استخراج معاملات الترقيم من URL
    const page = parseInt((context.query.page as string) || '1', 10);
    const limit = 20; // عدد العناصر في كل صفحة

    // إعادة تفعيل الكاش مع مدة قصيرة للإعلانات الحديثة

    // تعطيل الكاش مؤقتاً للتشخيص
    console.log('🔍 [SSR] بدء جلب البيانات للسوق الفوري...');

    // جلب السيارات من قاعدة البيانات للسوق الفوري
    console.log('🔍 [SSR] جلب البيانات من قاعدة البيانات...');

    // جلب السيارات من قاعدة البيانات للسوق الفوري فقط
    console.log('🔍 [SSR] جلب سيارات السوق الفوري...');

    // حساب العدد الإجمالي أولاً
    const totalCount = await dbHelpers.prisma.cars.count({
      where: {
        status: 'AVAILABLE',
        isAuction: false,
      },
    });

    console.log(`📊 [SSR] إجمالي سيارات السوق الفوري: ${totalCount}`);

    // جلب البيانات للصفحة المطلوبة فقط
    const directResult = await dbHelpers.prisma.cars
      .findMany({
        where: {
          status: 'AVAILABLE',
          isAuction: false, // السوق الفوري فقط
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { featured: 'desc' }, // الإعلانات المروجة أولاً
          { createdAt: 'desc' }, // ثم الأحدث
        ],
        select: {
          id: true,
          title: true,
          brand: true,
          model: true,
          year: true,
          price: true,
          mileage: true,
          fuelType: true,
          transmission: true,
          bodyType: true,
          condition: true,
          location: true,
          color: true,
          images: true,
          sellerId: true,
          status: true,
          featured: true,
          createdAt: true,
          users: {
            select: {
              id: true,
              name: true,
              phone: true,
              verified: true,
              profileImage: true,
              accountType: true,
              rating: true,
            },
          },
          showrooms: {
            select: {
              id: true,
              name: true,
              verified: true,
              rating: true,
            },
          },
          car_images: {
            select: {
              fileUrl: true,
              isPrimary: true,
            },
            take: 3,
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          },
        },
      })
      .catch(async (err) => {
        console.log('❌ [SSR] خطأ في جلب البيانات:', err.message);
        // في حالة الخطأ، نرجع قائمة فارغة
        return [];
      });

    const result = { cars: directResult };

    const carsData = Array.isArray(result?.cars) ? result.cars : ([] as any[]);
    console.log('📊 [SSR] تم جلب البيانات:', {
      totalFound: directResult?.length || 0,
      afterProcessing: carsData.length,
      sampleTitles: carsData.slice(0, 3).map((car: any) => car.title),
    });

    // تحقق من البيانات المجلبة

    // إذا لم توجد بيانات، إرجاع صفحة فارغة
    if (carsData.length === 0) {
      return {
        props: {
          cars: [],
          stats: {
            total: 0,
            negotiable: 0,
            urgent: 0,
            newCars: 0,
          },
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        },
      };
    }

    // تحويل البيانات إلى التنسيق المطلوب مع فلاتر أمان
    const formattedCars: CarWithUser[] = carsData
      .filter((car) => {
        // فلتر أمان: التأكد من أن السيارة متاحة
        return car.status === 'AVAILABLE';
      })
      .map((car) => {
        // معالجة الصور: أولوية لـ car_images ثم images القديمة
        let processedImages: string[] = [];

        // أولاً: الصور من جدول car_images (الأولوية العليا)
        if (car.car_images && Array.isArray(car.car_images) && car.car_images.length > 0) {
          processedImages = car.car_images
            .filter((img: any) => img && img.fileUrl && typeof img.fileUrl === 'string')
            .map((img: any) => img.fileUrl);
        }

        // ثانياً: الصور من حقل images القديم
        if (processedImages.length === 0) {
          if (Array.isArray(car.images)) {
            processedImages = car.images.filter(
              (img: string) => img && typeof img === 'string' && img.trim(),
            );
          } else if (typeof car.images === 'string' && car.images && car.images.trim()) {
            // محاولة تحليل JSON أولاً
            try {
              const parsed = JSON.parse(car.images);
              if (Array.isArray(parsed)) {
                processedImages = parsed.filter(
                  (img: string) => img && typeof img === 'string' && img.trim(),
                );
              }
            } catch {
              // إذا فشل، قسّم بالفاصلة
              processedImages = car.images
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean);
            }
          }
        }

        // ثالثاً: الصورة الافتراضية
        if (processedImages.length === 0) {
          processedImages = ['/images/cars/default-car.svg'];
        }

        return {
          id: car.id,
          title: car.title,
          price: car.price,
          condition: translateToArabic(car.condition) || 'مستعمل',
          brand: car.brand,
          model: car.model,
          year: car.year,
          bodyType: translateToArabic(car.bodyType) || 'سيدان',
          mileage: car.mileage || 0,
          fuelType: translateToArabic(car.fuelType || '') || 'بنزين',
          transmission: translateToArabic(car.transmission || '') || 'أوتوماتيك',
          location: car.location,
          images: processedImages, // الصور المعالجة بشكل صحيح
          featured: car.featured || false,
          promotionPackage: car.promotionPackage || 'free',
          promotionEndDate: car.promotionEndDate,
          negotiable: car.isNegotiable || false,
          urgent: car.urgent || false,
          vehicleType: car.vehicleType || 'سيارة',
          manufacturingCountry: car.manufacturingCountry || 'غير محدد',
          seatCount: car.seatCount || '5 مقاعد',
          color: translateToArabic(car.color || '') || 'غير محدد',
          interiorColor: car.interiorColor || 'غير محدد',
          // إضافة دعم car_images الجديدة للتوافق
          carImages: car.car_images || [],
          customsStatus: car.customsStatus || 'غير محدد',
          licenseStatus: car.licenseStatus || 'غير محدد',
          insuranceStatus: car.insuranceStatus || 'غير محدد',
          features: Array.isArray(car.features)
            ? car.features
            : typeof car.features === 'string' && car.features
              ? car.features.split(',')
              : ['مكيف', 'نوافذ كهربائية'],
          interiorFeatures: Array.isArray(car.interiorFeatures)
            ? car.interiorFeatures
            : typeof car.interiorFeatures === 'string' && car.interiorFeatures
              ? car.interiorFeatures.split(',')
              : ['تكييف مركزي'],
          exteriorFeatures: Array.isArray(car.exteriorFeatures)
            ? car.exteriorFeatures
            : typeof car.exteriorFeatures === 'string' && car.exteriorFeatures
              ? car.exteriorFeatures.split(',')
              : ['مصابيح LED'],
          technicalFeatures: Array.isArray(car.technicalFeatures)
            ? car.technicalFeatures
            : typeof car.technicalFeatures === 'string' && car.technicalFeatures
              ? car.technicalFeatures.split(',')
              : ['ABS', 'وسائد هوائية'],
          paymentMethod: car.paymentMethod || 'نقداً',
          user: car.users
            ? {
                id: car.users.id,
                name: car.users.name,
                phone: car.users.phone,
                verified: car.users.verified,
              }
            : {
                id: car.sellerId || 'unknown',
                name: 'مستخدم غير معروف',
                phone: '',
                verified: false,
              },
        };
      });

    // معلومات الترقيم (باستخدام totalCount من قاعدة البيانات)
    const paginationInfo = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };

    // حساب الإحصائيات (للصفحة الحالية فقط)
    const stats = {
      total: totalCount, // العدد الإجمالي من قاعدة البيانات
      negotiable: formattedCars.filter((car) => car.negotiable).length,
      urgent: formattedCars.filter((car) => car.urgent).length,
      newCars: formattedCars.filter((car) => car.condition === 'جديد').length,
    };

    const propsPayload = {
      cars: formattedCars, // البيانات للصفحة الحالية فقط (20 سيارة)
      stats,
      pagination: paginationInfo,
    };

    // تعطيل حفظ الكاش مؤقتاً للتشخيص
    console.log('✅ [SSR] إرجاع البيانات النهائية:', {
      carsCount: propsPayload.cars.length,
      statsTotal: propsPayload.stats.total,
      paginationTotal: propsPayload.pagination.total,
    });

    // تم تعطيل الكاش مؤقتاً

    // تعقيم الكائن للتأكد من عدم وجود undefined نهائياً
    const sanitizedProps = JSON.parse(JSON.stringify(propsPayload));
    return { props: sanitizedProps };
  } catch (error) {
    // console.error('خطأ في جلب البيانات:', error);
    return {
      props: {
        cars: [],
        stats: {
          total: 0,
          negotiable: 0,
          urgent: 0,
          newCars: 0,
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      },
    };
  }
};

export default MarketplacePage;
