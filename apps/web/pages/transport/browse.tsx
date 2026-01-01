import AdjustmentsHorizontalIcon from '@heroicons/react/24/outline/AdjustmentsHorizontalIcon';
import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import ChevronLeftIcon from '@heroicons/react/24/outline/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import ChevronUpIcon from '@heroicons/react/24/outline/ChevronUpIcon';
import ClipboardDocumentListIcon from '@heroicons/react/24/outline/ClipboardDocumentListIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import CheckBadgeIcon from '@heroicons/react/24/solid/CheckBadgeIcon';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AccountTypeBadge from '../../components/AccountTypeBadge';
import UserAccountIcon from '../../components/UserAccountIcon';
import { OpensooqNavbar } from '../../components/common';
import { BackIcon } from '../../components/common/icons/RTLIcon';
import { SmartFeaturedBadge } from '../../components/ui/FeaturedBadge';
import { useUserContext } from '../../contexts/UserContext';
import {
  sortByPromotion,
  type SortablePromotionItem,
} from '../../lib/services/promotion-sorting-service';
import { VEHICLE_TYPES_LIST, translateVehicleType } from '../../utils/transportTranslations';

// ============================================
// === بيانات الفلتر الشاملة ===
// ============================================

// جميع المدن الليبية
const LIBYAN_CITIES = [
  'طرابلس',
  'بنغازي',
  'مصراتة',
  'الزاوية',
  'زليتن',
  'البيضاء',
  'أجدابيا',
  'غريان',
  'طبرق',
  'سبها',
  'صبراتة',
  'الخمس',
  'درنة',
  'سرت',
  'المرج',
  'بني وليد',
  'مسلاتة',
  'جنزور',
  'تاجوراء',
  'الجفارة',
  'جادو',
  'يفرن',
  'الزنتان',
  'نالوت',
  'غدامس',
  'الكفرة',
  'أوباري',
  'براك',
  'وادي الشاطئ',
  'مرزق',
  'ترهونة',
  'القرة بوللي',
  'العزيزية',
  'صرمان',
  'رقدالين',
  'الجميل',
  'زوارة',
  'الحرابة',
  'الرجبان',
  'ككلة',
  'مزدة',
  'الشويرف',
  'بنت بيه',
  'ودان',
  'هون',
  'سوكنة',
  'الجفرة',
  'اجخرة',
  'العقيلة',
  'امساعد',
  'البريقة',
  'راس لانوف',
  'الزويتينة',
  'توكرة',
  'القبة',
  'شحات',
  'سوسة',
  'البيضاء',
  'المرج',
  'قمينس',
  'ليبيا الأخرى',
];

// خيارات الترتيب
const SORT_OPTIONS = [
  { value: 'featured', label: '⭐ المميزة أولاً' },
  { value: 'newest', label: 'الأحدث' },
  { value: 'rating', label: 'الأعلى تقييماً' },
  { value: 'price_low', label: 'السعر: من الأقل' },
  { value: 'price_high', label: 'السعر: من الأعلى' },
  { value: 'trips', label: 'الأكثر رحلات' },
];

// خيارات التقييم
const RATING_OPTIONS = [
  { value: 0, label: 'الكل' },
  { value: 4, label: '4 نجوم فأكثر' },
  { value: 3, label: '3 نجوم فأكثر' },
  { value: 2, label: '2 نجوم فأكثر' },
  { value: 1, label: '1 نجمة فأكثر' },
];

// نطاقات الأسعار
const PRICE_RANGES = [
  { value: '', label: 'جميع الأسعار' },
  { value: '0-5', label: 'أقل من 5 د.ل/كم' },
  { value: '5-10', label: '5 - 10 د.ل/كم' },
  { value: '10-20', label: '10 - 20 د.ل/كم' },
  { value: '20-50', label: '20 - 50 د.ل/كم' },
  { value: '50+', label: 'أكثر من 50 د.ل/كم' },
];

// واجهة البيانات لمقدم خدمة النقل
interface TransportProvider {
  id: string | number;
  ownerName: string;
  accountType: string;
  verified: boolean;
  rating: number;
  reviews: number;
  title: string;
  description: string;
  images: string[]; // مصفوفة صور بدلاً من صورة واحدة
  location: string;
  serviceArea: string;
  truckType: string;
  pricePerKm?: number;
  responseTime: string;
  features: string[];
  isOnline: boolean;
  isAvailable: boolean; // حالة التوفر (متاح/مشغول)
  availabilityNote?: string; // ملاحظة التوفر
  lastSeen: string;
  completedTrips: number;
  commission: number;
  phone: string;
  featured?: boolean;
  promotionPackage?: string;
  promotionDays?: number;
  promotionStartDate?: string;
  promotionEndDate?: string;
  promotionPriority?: number;
  createdAt?: string;
}

// الصورة الافتراضية
const DEFAULT_IMAGE = '/images/transport/default-truck.jpg';

// مكون معرض الصور المبسط
interface ImageGalleryProps {
  images: string[];
  title: string;
  providerId: string | number;
}

const TransportImageGallery: React.FC<ImageGalleryProps> = ({ images, title, providerId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const validImages = images.length > 0 ? images : [DEFAULT_IMAGE];

  const nextImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    },
    [validImages.length],
  );

  const prevImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    },
    [validImages.length],
  );

  const handleImageError = useCallback(() => {
    setImageError((prev) => ({ ...prev, [currentIndex]: true }));
  }, [currentIndex]);

  const currentImage = imageError[currentIndex] ? DEFAULT_IMAGE : validImages[currentIndex];

  return (
    <Link
      href={`/transport/service/${providerId}`}
      className="relative block h-full w-full overflow-hidden"
    >
      <Image
        src={currentImage}
        alt={title}
        fill
        sizes="(max-width: 1024px) 100vw, 320px"
        className="object-cover transition-transform duration-300 hover:scale-105"
        onError={handleImageError}
        priority={false}
      />

      {/* أسهم التنقل */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
            aria-label="الصورة السابقة"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <button
            onClick={nextImage}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
            aria-label="الصورة التالية"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          {/* مؤشرات الصور */}
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {validImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* عدد الصور */}
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs text-white">
            <CameraIcon className="h-3 w-3" />
            {validImages.length}
          </div>
        </>
      )}
    </Link>
  );
};

// دالة تنسيق واختصار مناطق الخدمة
const formatServiceArea = (area: string | undefined): string => {
  if (!area) return 'غير محدد';
  const areas = area
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);
  if (areas.length === 0) return 'غير محدد';
  if (areas.length === 1) return areas[0];
  if (areas.length === 2) return `${areas[0]} - ${areas[1]}`;
  if (areas.length <= 4) return `${areas.slice(0, 2).join(' - ')} +${areas.length - 2}`;
  return `${areas.slice(0, 3).join(' - ')} +${areas.length - 3}`;
};

// واجهة الفلاتر الشاملة
interface FilterState {
  searchQuery: string;
  city: string;
  vehicleType: string;
  priceRange: string;
  minRating: number;
  verifiedOnly: boolean;
  sortBy: string;
}

const initialFilters: FilterState = {
  searchQuery: '',
  city: '',
  vehicleType: '',
  priceRange: '',
  minRating: 0,
  verifiedOnly: false,
  sortBy: 'featured', // الترتيب الافتراضي: المميزة أولاً
};

const BrowseTransportPage = () => {
  const router = useRouter();
  const { user } = useUserContext();

  // التحقق إذا كان المستخدم مقدم خدمة نقل
  const isTransportOwner = user?.accountType === 'TRANSPORT_OWNER';

  // حالة الفلاتر الشاملة
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    city: true,
    vehicleType: true,
    price: true,
    rating: true,
    options: true,
  });
  const [citySearch, setCitySearch] = useState('');

  // حالة البيانات والتحميل
  const [transportProviders, setTransportProviders] = useState<TransportProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تحديث فلتر واحد
  const updateFilter = (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // إعادة تعيين جميع الفلاتر
  const resetFilters = () => {
    setFilters(initialFilters);
    setCitySearch('');
  };

  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.city) count++;
    if (filters.vehicleType) count++;
    if (filters.priceRange) count++;
    if (filters.minRating > 0) count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  // فلترة المدن حسب البحث
  const filteredCities = useMemo(() => {
    if (!citySearch) return LIBYAN_CITIES;
    return LIBYAN_CITIES.filter((city) => city.toLowerCase().includes(citySearch.toLowerCase()));
  }, [citySearch]);

  // تبديل حالة القسم (مفتوح/مغلق)
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // جلب خدمات النقل من API
  useEffect(() => {
    let cancelled = false;
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/transport/services?limit=50&page=1&status=ACTIVE`, {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) {
          throw new Error('فشل في جلب البيانات');
        }
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        if (cancelled) return;

        const mapped: TransportProvider[] = list.map((s: any) => ({
          id: s.id,
          ownerName: s.user?.name || 'مزود خدمة',
          accountType: s.user?.accountType || 'TRANSPORT_OWNER',
          verified: !!s.user?.verified,
          rating: typeof s.user?.rating === 'number' ? s.user.rating : 0,
          reviews: typeof s.user?.totalReviews === 'number' ? s.user.totalReviews : 0,
          title: s.title || 'خدمة نقل',
          description: s.description || '',
          images: Array.isArray(s.images) && s.images.length > 0 ? s.images : [DEFAULT_IMAGE],
          location: s.serviceArea || 'غير محدد',
          serviceArea: s.serviceArea || 'غير محدد',
          truckType: s.truckType || 'غير محدد',
          pricePerKm: typeof s.pricePerKm === 'number' ? s.pricePerKm : undefined,
          responseTime: '---',
          features: Array.isArray(s.features)
            ? s.features.filter(Boolean)
            : typeof s.features === 'string' && s.features
              ? s.features
                  .split(',')
                  .map((f: string) => f.trim())
                  .filter(Boolean)
              : [],
          isOnline: false,
          isAvailable: s.isAvailable ?? true,
          availabilityNote: s.availabilityNote || undefined,
          lastSeen: 'غير متصل',
          completedTrips: 0,
          commission: s.commission ?? 0,
          phone: s.contactPhone || '',
          // حقول الترويج
          featured: s.featured ?? false,
          promotionPackage: s.promotionPackage || 'free',
          promotionDays: s.promotionDays || 0,
          promotionStartDate: s.promotionStartDate || undefined,
          promotionEndDate: s.promotionEndDate || undefined,
          promotionPriority: s.promotionPriority || 0,
          createdAt: s.createdAt || undefined,
        }));
        setTransportProviders(mapped);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'حدث خطأ أثناء جلب البيانات');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchServices();
    return () => {
      cancelled = true;
    };
  }, []);

  // فلترة وترتيب مقدمي الخدمة
  const filteredProviders = useMemo(() => {
    let results = transportProviders.filter((provider) => {
      // فلتر البحث النصي
      const matchesSearch =
        !filters.searchQuery ||
        provider.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        provider.ownerName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        provider.location.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        provider.description.toLowerCase().includes(filters.searchQuery.toLowerCase());

      // فلتر المدينة
      const matchesCity =
        !filters.city ||
        provider.location.includes(filters.city) ||
        provider.serviceArea.includes(filters.city);

      // فلتر نوع المركبة
      const matchesVehicle =
        !filters.vehicleType ||
        provider.truckType.toLowerCase() === filters.vehicleType.toLowerCase() ||
        provider.truckType.toLowerCase().includes(filters.vehicleType.toLowerCase());

      // فلتر السعر
      let matchesPrice = true;
      if (filters.priceRange && provider.pricePerKm !== undefined) {
        const price = provider.pricePerKm;
        switch (filters.priceRange) {
          case '0-5':
            matchesPrice = price < 5;
            break;
          case '5-10':
            matchesPrice = price >= 5 && price < 10;
            break;
          case '10-20':
            matchesPrice = price >= 10 && price < 20;
            break;
          case '20-50':
            matchesPrice = price >= 20 && price < 50;
            break;
          case '50+':
            matchesPrice = price >= 50;
            break;
        }
      }

      // فلتر التقييم
      const matchesRating = filters.minRating === 0 || provider.rating >= filters.minRating;

      // فلتر الموثقين فقط
      const matchesVerified = !filters.verifiedOnly || provider.verified;

      return (
        matchesSearch &&
        matchesCity &&
        matchesVehicle &&
        matchesPrice &&
        matchesRating &&
        matchesVerified
      );
    });

    // الترتيب - المميزة دائماً أولاً ثم الترتيب المحدد
    // أولاً: ترتيب حسب الترويج (المميزة أولاً)
    const promotionSorted = sortByPromotion(results as unknown as SortablePromotionItem[], {
      checkPromotionValidity: true,
      secondarySort: 'newest',
    }) as unknown as typeof results;

    // ثانياً: الترتيب الإضافي حسب اختيار المستخدم
    if (filters.sortBy !== 'featured' && filters.sortBy !== 'newest') {
      promotionSorted.sort((a, b) => {
        // المميزة تبقى في الأعلى دائماً
        const aFeatured = a.featured && a.promotionPackage !== 'free' ? 1 : 0;
        const bFeatured = b.featured && b.promotionPackage !== 'free' ? 1 : 0;
        if (aFeatured !== bFeatured) return bFeatured - aFeatured;

        // ثم الترتيب المحدد
        switch (filters.sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'price_low':
            return (a.pricePerKm || 999) - (b.pricePerKm || 999);
          case 'price_high':
            return (b.pricePerKm || 0) - (a.pricePerKm || 0);
          case 'trips':
            return b.completedTrips - a.completedTrips;
          default:
            return 0;
        }
      });
    }

    return promotionSorted;
  }, [transportProviders, filters]);

  return (
    <>
      <Head>
        <title>تصفح خدمات النقل | موقع مزاد السيارات</title>
        <meta name="description" content="تصفح جميع مقدمي خدمات نقل السيارات المعتمدين في ليبيا" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="transport-browse-page min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Header */}
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <Link href="/transport" className="text-blue-600 hover:text-blue-700">
                  <BackIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                    <TruckIcon className="h-8 w-8 text-blue-600" />
                    تصفح خدمات النقل
                  </h1>
                  <p className="mt-1 text-gray-600">اختر من بين أفضل مقدمي خدمات النقل</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="max-w-md flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن مقدم خدمة..."
                    value={filters.searchQuery}
                    onChange={(e) => updateFilter('searchQuery', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-12 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* أزرار الإجراءات السريعة */}
              <div className="flex items-center gap-2">
                {/* رابط طلباتي */}
                <Link
                  href="/transport/my-bookings"
                  className="flex items-center gap-2 rounded-lg border border-green-500 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                >
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">طلباتي</span>
                </Link>

                {/* رابط إضافة خدمة - يظهر فقط لأصحاب خدمات النقل */}
                {isTransportOwner && (
                  <Link
                    href="/transport/add-service"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">إضافة خدمة</span>
                  </Link>
                )}

                {/* زر الفلتر للموبايل */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 lg:hidden"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">الفلاتر</span>
                  {activeFiltersCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* ============================================ */}
            {/* === الفلتر الجانبي الشامل (Desktop) === */}
            {/* ============================================ */}
            <div className="hidden lg:block lg:w-80">
              <div className="sticky top-4 space-y-4">
                {/* رأس الفلتر */}
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      <FunnelIcon className="h-5 w-5 text-blue-600" />
                      فلتر النتائج
                    </h3>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        مسح الكل ({activeFiltersCount})
                      </button>
                    )}
                  </div>
                </div>

                {/* قسم المدينة */}
                <div className="rounded-xl border bg-white shadow-sm">
                  <button
                    onClick={() => toggleSection('city')}
                    className="flex w-full items-center justify-between p-4"
                  >
                    <span className="flex items-center gap-2 font-semibold text-gray-900">
                      <MapPinIcon className="h-5 w-5 text-blue-600" />
                      المدينة
                    </span>
                    {expandedSections.city ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections.city && (
                    <div className="border-t px-4 pb-4">
                      <div className="relative mb-3 mt-3">
                        <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="ابحث عن مدينة..."
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 py-2 pl-3 pr-9 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="max-h-80 space-y-1 overflow-y-auto">
                        <button
                          onClick={() => updateFilter('city', '')}
                          className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                            !filters.city
                              ? 'bg-blue-100 font-medium text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          جميع المدن
                        </button>
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            onClick={() => updateFilter('city', city)}
                            className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                              filters.city === city
                                ? 'bg-blue-100 font-medium text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* قسم نوع المركبة */}
                <div className="rounded-xl border bg-white shadow-sm">
                  <button
                    onClick={() => toggleSection('vehicleType')}
                    className="flex w-full items-center justify-between p-4"
                  >
                    <span className="flex items-center gap-2 font-semibold text-gray-900">
                      <TruckIcon className="h-5 w-5 text-green-600" />
                      نوع المركبة
                    </span>
                    {expandedSections.vehicleType ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections.vehicleType && (
                    <div className="border-t px-4 pb-4 pt-3">
                      <div className="max-h-56 space-y-1 overflow-y-auto">
                        <button
                          onClick={() => updateFilter('vehicleType', '')}
                          className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                            !filters.vehicleType
                              ? 'bg-green-100 font-medium text-green-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          جميع الأنواع
                        </button>
                        {VEHICLE_TYPES_LIST.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => updateFilter('vehicleType', type.value)}
                            className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                              filters.vehicleType === type.value
                                ? 'bg-green-100 font-medium text-green-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{type.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* قسم السعر */}
                <div className="rounded-xl border bg-white shadow-sm">
                  <button
                    onClick={() => toggleSection('price')}
                    className="flex w-full items-center justify-between p-4"
                  >
                    <span className="flex items-center gap-2 font-semibold text-gray-900">
                      <CurrencyDollarIcon className="h-5 w-5 text-amber-600" />
                      نطاق السعر
                    </span>
                    {expandedSections.price ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections.price && (
                    <div className="border-t px-4 pb-4 pt-3">
                      <div className="space-y-1">
                        {PRICE_RANGES.map((range) => (
                          <button
                            key={range.value}
                            onClick={() => updateFilter('priceRange', range.value)}
                            className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                              filters.priceRange === range.value
                                ? 'bg-amber-100 font-medium text-amber-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* قسم التقييم */}
                <div className="rounded-xl border bg-white shadow-sm">
                  <button
                    onClick={() => toggleSection('rating')}
                    className="flex w-full items-center justify-between p-4"
                  >
                    <span className="flex items-center gap-2 font-semibold text-gray-900">
                      <StarIcon className="h-5 w-5 text-yellow-500" />
                      التقييم
                    </span>
                    {expandedSections.rating ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections.rating && (
                    <div className="border-t px-4 pb-4 pt-3">
                      <div className="space-y-1">
                        {RATING_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => updateFilter('minRating', option.value)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                              filters.minRating === option.value
                                ? 'bg-yellow-100 font-medium text-yellow-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span>{option.label}</span>
                            {option.value > 0 && (
                              <div className="flex items-center gap-0.5">
                                {[...Array(option.value)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    className="h-3.5 w-3.5 fill-current text-yellow-400"
                                  />
                                ))}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* قسم الخيارات الإضافية */}
                <div className="rounded-xl border bg-white shadow-sm">
                  <button
                    onClick={() => toggleSection('options')}
                    className="flex w-full items-center justify-between p-4"
                  >
                    <span className="flex items-center gap-2 font-semibold text-gray-900">
                      <AdjustmentsHorizontalIcon className="h-5 w-5 text-purple-600" />
                      خيارات إضافية
                    </span>
                    {expandedSections.options ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections.options && (
                    <div className="border-t px-4 pb-4 pt-3">
                      {/* موثق فقط */}
                      <label className="flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                        <span className="flex items-center gap-2 text-sm text-gray-700">
                          <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                          موثقون فقط
                        </span>
                        <input
                          type="checkbox"
                          checked={filters.verifiedOnly}
                          onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>

                      {/* الترتيب */}
                      <div className="mt-3">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          ترتيب حسب
                        </label>
                        <select
                          value={filters.sortBy}
                          onChange={(e) => updateFilter('sortBy', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ============================================ */}
            {/* === الفلتر المنبثق للموبايل === */}
            {/* ============================================ */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                {/* الخلفية */}
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowMobileFilters(false)}
                />

                {/* محتوى الفلتر */}
                <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white">
                  {/* الرأس */}
                  <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
                    <h3 className="text-lg font-bold text-gray-900">فلتر النتائج</h3>
                    <div className="flex items-center gap-3">
                      {activeFiltersCount > 0 && (
                        <button onClick={resetFilters} className="text-sm text-red-600">
                          مسح الكل
                        </button>
                      )}
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="rounded-full p-2 hover:bg-gray-100"
                      >
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* محتوى الفلاتر */}
                  <div className="space-y-6 p-4">
                    {/* المدينة */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-900">المدينة</label>
                      <select
                        value={filters.city}
                        onChange={(e) => updateFilter('city', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">جميع المدن</option>
                        {LIBYAN_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* نوع المركبة */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-900">
                        نوع المركبة
                      </label>
                      <select
                        value={filters.vehicleType}
                        onChange={(e) => updateFilter('vehicleType', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">جميع الأنواع</option>
                        {VEHICLE_TYPES_LIST.map((type) => (
                          <option key={type.id} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* نطاق السعر */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-900">
                        نطاق السعر
                      </label>
                      <select
                        value={filters.priceRange}
                        onChange={(e) => updateFilter('priceRange', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-500"
                      >
                        {PRICE_RANGES.map((range) => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* التقييم */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-900">التقييم</label>
                      <select
                        value={filters.minRating}
                        onChange={(e) => updateFilter('minRating', Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-500"
                      >
                        {RATING_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* الترتيب */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-900">
                        ترتيب حسب
                      </label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => updateFilter('sortBy', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-500"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* موثقون فقط */}
                    <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4">
                      <span className="flex items-center gap-2 text-gray-700">
                        <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                        موثقون فقط
                      </span>
                      <input
                        type="checkbox"
                        checked={filters.verifiedOnly}
                        onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>

                  {/* زر التطبيق */}
                  <div className="sticky bottom-0 border-t bg-white p-4">
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      عرض {filteredProviders.length} نتيجة
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {/* Header with count - only show when not loading */}
              {!loading && !error && (
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600">
                    تم العثور على {filteredProviders.length} مقدم خدمة
                  </p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="text-gray-600">جاري تحميل خدمات النقل...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                  <TruckIcon className="mx-auto mb-4 h-12 w-12 text-red-400" />
                  <h3 className="mb-2 text-lg font-medium text-red-800">حدث خطأ</h3>
                  <p className="mb-4 text-red-600">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredProviders.length === 0 && (
                <div className="py-12 text-center">
                  <TruckIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد خدمات نقل</h3>
                  <p className="text-gray-600">جرب تغيير معايير البحث أو الفلاتر</p>
                </div>
              )}

              {/* Transport Providers Grid - only show when data exists */}
              {!loading && !error && filteredProviders.length > 0 && (
                <div className="grid gap-5">
                  {filteredProviders.map((provider) => (
                    <div
                      key={provider.id}
                      onClick={() => router.push(`/transport/service/${provider.id}`)}
                      className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* معرض الصور */}
                        <div className="relative h-48 lg:h-56 lg:w-72 xl:w-80">
                          <TransportImageGallery
                            images={provider.images}
                            title={provider.title}
                            providerId={provider.id}
                          />
                          {/* شارة مميزة */}
                          {/* شارة الإعلان المميز */}
                          {(provider.featured ||
                            (provider.promotionPackage &&
                              provider.promotionPackage !== 'free')) && (
                            <div className="absolute left-2 top-2 z-10">
                              <SmartFeaturedBadge
                                packageType={provider.promotionPackage}
                                featured={provider.featured}
                                size="sm"
                              />
                            </div>
                          )}
                          {/* شارة حالة التوفر */}
                          <div
                            className={`absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-md ${
                              provider.isAvailable
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${provider.isAvailable ? 'animate-pulse bg-white' : 'bg-white/70'}`}
                            />
                            {provider.isAvailable ? 'متاح' : 'مشغول'}
                          </div>
                        </div>

                        {/* المحتوى */}
                        <div className="flex flex-1 flex-col p-5">
                          {/* الرأس - العنوان والتقييم */}
                          <div className="mb-3 flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <Link href={`/transport/service/${provider.id}`}>
                                <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                                  {provider.title}
                                </h3>
                              </Link>

                              {/* معلومات المالك */}
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                  <UserAccountIcon
                                    accountType={provider.accountType}
                                    size="sm"
                                    showBadge={false}
                                  />
                                  <span className="text-sm font-medium text-gray-700">
                                    {provider.ownerName}
                                  </span>
                                  {provider.verified && (
                                    <CheckBadgeIcon
                                      className="h-4 w-4 text-blue-500"
                                      title="حساب موثق"
                                    />
                                  )}
                                </div>
                                <AccountTypeBadge
                                  accountType={provider.accountType}
                                  size="sm"
                                  showIcon={false}
                                />
                              </div>
                            </div>

                            {/* التقييم */}
                            <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5">
                              <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-bold text-gray-900">
                                {provider.rating}
                              </span>
                              <span className="text-xs text-gray-500">({provider.reviews})</span>
                            </div>
                          </div>

                          {/* الوصف */}
                          {provider.description && (
                            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                              {provider.description}
                            </p>
                          )}

                          {/* تفاصيل الخدمة */}
                          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
                            {/* نوع المركبة */}
                            <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                              <TruckIcon className="h-4 w-4" />
                              <span className="font-medium">
                                {translateVehicleType(provider.truckType)}
                              </span>
                            </div>

                            {/* منطقة الخدمة */}
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <MapPinIcon className="h-4 w-4 text-gray-400" />
                              <span>{formatServiceArea(provider.serviceArea)}</span>
                            </div>

                            {/* السعر */}
                            {provider.pricePerKm !== undefined && provider.pricePerKm > 0 && (
                              <div className="flex items-center gap-1 text-green-700">
                                <CurrencyDollarIcon className="h-4 w-4" />
                                <span className="font-medium">{provider.pricePerKm} د.ل/كم</span>
                              </div>
                            )}
                          </div>

                          {/* الميزات */}
                          {provider.features && provider.features.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-1.5">
                              {provider.features.slice(0, 3).map((feature, index) => (
                                <span
                                  key={index}
                                  className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
                                >
                                  {feature}
                                </span>
                              ))}
                              {provider.features.length > 3 && (
                                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                  +{provider.features.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* حالة الاتصال والرحلات */}
                          <div className="mb-4 flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`h-2 w-2 rounded-full ${provider.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                              />
                              <span
                                className={provider.isOnline ? 'text-green-600' : 'text-gray-500'}
                              >
                                {provider.isOnline ? 'متصل الآن' : 'غير متصل'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                              <span>{provider.completedTrips} رحلة مكتملة</span>
                            </div>
                          </div>

                          {/* أزرار الإجراءات */}
                          <div
                            className="mt-auto flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link href={`/transport/service/${provider.id}`} className="flex-1">
                              <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                                <EyeIcon className="h-4 w-4" />
                                التفاصيل
                              </button>
                            </Link>
                            <Link
                              href={`/messages?newChat=transport_${provider.id}`}
                              className="flex-1"
                            >
                              <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                دردشة
                              </button>
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Toggle favorite
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                              title="إضافة للمفضلة"
                            >
                              <HeartIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrowseTransportPage;
