/**
 * صفحة تفاصيل الساحة مع المزادات - تصميم احترافي عالمي
 * Yard Details Page with Professional World-Class Design
 * تصميم محسن مع استغلال أفضل للمساحة
 */

import { OpensooqNavbar } from '@/components/common';
import AdvancedFooter from '@/components/common/Footer/AdvancedFooter';
import { AuctionCardGrid, NewAuctionCard } from '@/components/features/auctions';
import { AUCTION_LABELS } from '@/config/auction-labels';
import { AUCTION_COLORS } from '@/config/auction-theme';
import {
  dayLabels,
  formatService,
  vehicleTypeLabels,
  type Yard,
  type YardAuction,
} from '@/data/yards-data';
import useAuthProtection from '@/hooks/useAuthProtection';
import { useFavorites } from '@/hooks/useFavorites';
import type { AuctionStatus } from '@/types/auction-unified';
import {
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FolderIcon,
  FunnelIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  ShareIcon,
  Squares2X2Icon,
  TruckIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { SignalIcon, StarIcon, TrophyIcon } from '@heroicons/react/24/solid';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import YearRangeSelector from '@/components/YearRangeSelector';
import BasicBrandModelFilter from '@/components/features/auctions/filters/BasicBrandModelFilter';
import { YardPlaceholderSimple } from '@/components/ui/YardPlaceholder';

// استخدام أنواع من الملف المشترك
type Auction = YardAuction;

interface Stats {
  total: number;
  live: number;
  upcoming: number;
  sold: number;
  ended: number;
}

export default function YardDetailsPage() {
  const router = useRouter();
  const { slug } = router.query;

  // نظام الحماية - الصفحة عامة
  const { isAuthenticated, showAuthModal, setShowAuthModal } = useAuthProtection({
    requireAuth: false,
    showModal: false,
  });

  const { isFavorite, toggleFavorite } = useFavorites();

  // حالة البيانات
  const [yard, setYard] = useState<Yard | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, live: 0, upcoming: 0, sold: 0, ended: 0 });
  const [loading, setLoading] = useState(true);
  const [auctionsLoading, setAuctionsLoading] = useState(false);
  const [error, setError] = useState('');

  // حالة التبويبات والعرض
  const [activeTab, setActiveTab] = useState<AuctionStatus>('live');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // العرض الافتراضي قائمة
  const [searchQuery, setSearchQuery] = useState('');
  const [showTabsDropdown, setShowTabsDropdown] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  // ترقيم الصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // معرض الصور
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);

  // حالة الفلاتر - منسوخة من /auctions
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    searchQuery: '',
    location: 'جميع المدن',
    brand: 'الماركات',
    model: 'الموديلات',
    yearFrom: 'جميع السنوات',
    yearTo: 'جميع السنوات',
    priceMin: null as number | null,
    priceMax: null as number | null,
    condition: 'جميع الحالات',
    auctionStatus: 'جميع المزادات',
    timeRemaining: 'جميع الأوقات',
    featuredOnly: false,
  });

  // دالة التعامل مع تغيير الفلاتر
  const handleFilterChange = (filterType: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1); // إعادة للصفحة الأولى عند تغيير الفلتر
  };

  // دالة إعادة تعيين الفلاتر
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      location: 'جميع المدن',
      brand: 'الماركات',
      model: 'الموديلات',
      yearFrom: 'جميع السنوات',
      yearTo: 'جميع السنوات',
      priceMin: null,
      priceMax: null,
      condition: 'جميع الحالات',
      auctionStatus: 'جميع المزادات',
      timeRemaining: 'جميع الأوقات',
      featuredOnly: false,
    });
    setCurrentPage(1);
  };

  // تطبيق الفلاتر على المزادات
  const filteredAuctions = useMemo(() => {
    let filtered = [...auctions];

    // فلتر البحث النصي
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((auction) => {
        const title = auction.title?.toLowerCase() || '';
        const brand = auction.car?.brand?.toLowerCase() || '';
        const model = auction.car?.model?.toLowerCase() || '';
        const description = auction.description?.toLowerCase() || '';
        return (
          title.includes(query) ||
          brand.includes(query) ||
          model.includes(query) ||
          description.includes(query)
        );
      });
    }

    // فلتر الماركة
    if (filters.brand !== 'الماركات') {
      filtered = filtered.filter((auction) => auction.car?.brand === filters.brand);
    }

    // فلتر الموديل
    if (filters.model !== 'الموديلات') {
      filtered = filtered.filter((auction) => auction.car?.model === filters.model);
    }

    // فلتر السنة
    if (filters.yearFrom !== 'جميع السنوات') {
      filtered = filtered.filter((auction) => {
        const year = auction.car?.year || 0;
        return year >= parseInt(filters.yearFrom);
      });
    }
    if (filters.yearTo !== 'جميع السنوات') {
      filtered = filtered.filter((auction) => {
        const year = auction.car?.year || 9999;
        return year <= parseInt(filters.yearTo);
      });
    }

    // فلتر السعر
    if (filters.priceMin !== null) {
      filtered = filtered.filter((auction) => {
        const price = auction.currentPrice || auction.startPrice || 0;
        return price >= filters.priceMin!;
      });
    }
    if (filters.priceMax !== null) {
      filtered = filtered.filter((auction) => {
        const price = auction.currentPrice || auction.startPrice || 0;
        return price <= filters.priceMax!;
      });
    }

    // فلتر المميزة فقط
    if (filters.featuredOnly) {
      filtered = filtered.filter((auction) => auction.featured);
    }

    return filtered;
  }, [auctions, filters]);

  // حساب صفحات الفلترة المحلية
  const filteredTotalPages = useMemo(() => {
    return Math.ceil(filteredAuctions.length / itemsPerPage) || 1;
  }, [filteredAuctions.length, itemsPerPage]);

  // تقسيم المزادات المفلترة للصفحة الحالية
  const paginatedAuctions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAuctions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAuctions, currentPage, itemsPerPage]);

  // مراقبة حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      // تبديل تلقائي لوضع الشبكة في الشاشات الصغيرة
      if (width < 920 && viewMode === 'list') {
        setViewMode('grid');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // جلب تفاصيل الساحة
  useEffect(() => {
    if (slug) {
      fetchYardDetails();
    }
  }, [slug]);

  // جلب المزادات عند تغيير التبويب أو الصفحة أو البحث
  useEffect(() => {
    if (yard?.id) {
      fetchAuctions();
    }
  }, [yard?.id, activeTab, currentPage, searchQuery]);

  const fetchYardDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/yards/${slug}`);
      const data = await res.json();

      if (data.success) {
        setYard(data.yard);
      } else {
        setError(data.error || 'الساحة غير موجودة');
      }
    } catch (err) {
      setError('حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctions = async () => {
    if (!yard?.slug) return;

    setAuctionsLoading(true);
    try {
      const params = new URLSearchParams({
        tab: activeTab,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
      });

      const res = await fetch(`/api/yards/${yard.slug}/auctions?${params}`);
      const data = await res.json();

      if (data.success) {
        setAuctions(data.data.auctions || []);
        setStats(data.data.stats || { total: 0, live: 0, upcoming: 0, sold: 0, ended: 0 });
        setTotalPages(data.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching auctions:', err);
    } finally {
      setAuctionsLoading(false);
    }
  };

  // تحويل بيانات المزاد للبطاقة
  const transformAuctionForCard = useCallback(
    (auction: Auction) => {
      return {
        id: auction.id as any, // تحويل لتوافق مع النوع المطلوب
        title: auction.title,
        price: auction.startPrice?.toString() || '0',
        location: auction.car?.location || yard?.city || '',
        area: yard?.area || '',
        coordinates: { lat: 32.8872, lng: 13.1913 },
        time: '',
        images: auction.images || ['/placeholder.svg'],
        condition: auction.car?.condition || 'مستعمل',
        brand: auction.car?.brand || '',
        model: auction.car?.model || '',
        year: auction.car?.year?.toString() || '',
        mileage: auction.car?.mileage ? `${auction.car.mileage.toLocaleString()} كم` : 'غير محدد',
        fuelType: auction.car?.fuelType || 'بنزين',
        transmission: auction.car?.transmission || 'أوتوماتيك',
        type: 'سيارة',
        phone: yard?.phone || '',
        isAuction: true,
        isSold: auction.displayStatus === 'sold',
        auctionType: auction.displayStatus,
        auctionEndTime: auction.endDate,
        auctionStartTime: auction.startDate,
        currentBid: auction.currentPrice?.toString() || '0',
        startingBid: auction.startPrice?.toString() || '0',
        finalBid: auction.displayStatus === 'sold' ? auction.currentPrice?.toString() : undefined,
        bidCount: auction.totalBids || 0,
        image: auction.images?.[0] || '/placeholder.svg',
        imageList: auction.images || ['/placeholder.svg'],
        description: auction.description || '',
        featured: auction.featured,
      };
    },
    [yard],
  );

  // معالجة أحداث البطاقات - التوجيه لصفحة مزاد الساحة
  const handleCardClick = (car: any) => {
    router.push(`/yards/${yard?.slug}/auction/${car.id}`);
  };

  const handleBidClick = (car: any) => {
    router.push(`/yards/${yard?.slug}/auction/${car.id}`);
  };

  const handleContactClick = (car: any) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    router.push(`/yards/${yard?.slug}/auction/${car.id}`);
  };

  const handleChatClick = (car: any) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    router.push(`/messages?contact=${car.title}&car=${car.id}`);
  };

  const handleFavoriteClick = async (auctionId: string | number) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    await toggleFavorite(undefined, String(auctionId));
  };

  // التبويبات مع الأيقونات والألوان
  const tabs = useMemo(
    () => [
      {
        key: 'live' as AuctionStatus,
        label: AUCTION_LABELS.live.badge,
        shortLabel: AUCTION_LABELS.live.short,
        count: stats.live,
        color: AUCTION_COLORS.live,
        icon: SignalIcon,
      },
      {
        key: 'upcoming' as AuctionStatus,
        label: AUCTION_LABELS.upcoming.badge,
        shortLabel: AUCTION_LABELS.upcoming.short,
        count: stats.upcoming,
        color: AUCTION_COLORS.upcoming,
        icon: ClockIcon,
      },
      {
        key: 'sold' as AuctionStatus,
        label: AUCTION_LABELS.sold.badge,
        shortLabel: AUCTION_LABELS.sold.short,
        count: stats.sold,
        color: AUCTION_COLORS.sold,
        icon: TrophyIcon,
      },
      {
        key: 'ended' as AuctionStatus,
        label: AUCTION_LABELS.ended.badge,
        shortLabel: AUCTION_LABELS.ended.short,
        count: stats.ended,
        color: AUCTION_COLORS.ended,
        icon: FolderIcon,
      },
    ],
    [stats],
  );

  const activeTabData = tabs.find((t) => t.key === activeTab) || tabs[0];

  // صور الساحة
  const yardImages = useMemo(() => {
    if (!yard) return [];
    const images = [];
    if (yard.image && yard.image !== '/placeholder.svg') {
      images.push(yard.image);
    }
    if (yard.images?.length) {
      yard.images.forEach((img) => {
        if (img && img !== '/placeholder.svg' && !images.includes(img)) {
          images.push(img);
        }
      });
    }
    return images.length > 0 ? images : ['/placeholder.svg'];
  }, [yard]);

  // التنقل في معرض الصور
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % yardImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + yardImages.length) % yardImages.length);
  };

  // مشاركة الساحة
  const handleShare = async () => {
    const shareData = {
      title: yard?.name || 'ساحة مزادات',
      text: `${yard?.name} - ${yard?.city} | ساحات المزادات`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط!');
    }
  };

  // عرض التحميل
  if (loading) {
    return (
      <>
        <OpensooqNavbar />
        <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent" />
            <p className="mt-4 text-gray-500">جاري تحميل الساحة...</p>
          </div>
        </div>
      </>
    );
  }

  // عرض الخطأ
  if (error || !yard) {
    return (
      <>
        <OpensooqNavbar />
        <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
          <div className="text-center">
            <BuildingOfficeIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <p className="text-lg text-gray-500">{error || 'الساحة غير موجودة'}</p>
            <Link href="/yards" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
              العودة لقائمة الساحات
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{yard.name} | ساحات المزادات - سوق مزاد</title>
        <meta
          name="description"
          content={
            yard.description || `ساحة ${yard.name} - ${yard.city} - تصفح المزادات المباشرة والقادمة`
          }
        />
      </Head>

      <OpensooqNavbar />

      <main className="min-h-screen bg-gray-50" dir="rtl">
        {/* ===== القسم الرئيسي - Hero Section (80px) ===== */}
        <div className="relative bg-gradient-to-l from-slate-900 via-blue-900/95 to-slate-900">
          <div className="container relative z-10 mx-auto px-4">
            {/* الصف الرئيسي - ارتفاع 80px */}
            <div className="flex h-20 items-center gap-4">
              {/* الصورة المصغرة */}
              <div className="relative hidden h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg sm:block">
                {yardImages[currentImageIndex] !== '/placeholder.svg' ? (
                  <>
                    <Image
                      src={yardImages[currentImageIndex]}
                      alt={yard.name}
                      fill
                      className="object-cover"
                      priority
                    />
                    {stats.live > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-white">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500"></span>
                          </span>
                          LIVE
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <YardPlaceholderSimple showLive={stats.live > 0} />
                )}
              </div>

              {/* معلومات الساحة */}
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                {/* Breadcrumb مدمج مع العنوان */}
                <div className="mb-0.5 flex items-center gap-1.5 text-[10px] text-white/50">
                  <Link href="/" className="transition-colors hover:text-white/80">
                    الرئيسية
                  </Link>
                  <ChevronLeftIcon className="h-2.5 w-2.5" />
                  <Link href="/yards" className="transition-colors hover:text-white/80">
                    الساحات
                  </Link>
                  <ChevronLeftIcon className="h-2.5 w-2.5" />
                  <span className="text-white/70">{yard.city}</span>
                </div>

                {/* اسم الساحة والموقع */}
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base font-bold text-white sm:text-lg md:text-xl">
                    {yard.name}
                  </h1>
                  {yard.verified && (
                    <CheckBadgeIcon className="h-4 w-4 flex-shrink-0 text-blue-400" />
                  )}
                  {yard.rating && (
                    <div className="hidden items-center gap-0.5 text-amber-400 sm:flex">
                      <StarIcon className="h-3 w-3" />
                      <span className="text-xs font-bold">{yard.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* الموقع والوصف */}
                <div className="flex items-center gap-3 text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    {yard.city}
                    {yard.area ? ` - ${yard.area}` : ''}
                  </span>
                  {yard.description && (
                    <span className="hidden max-w-[200px] truncate md:inline">
                      {yard.description}
                    </span>
                  )}
                </div>
              </div>

              {/* الإحصائيات المدمجة */}
              <div className="hidden items-center gap-1 lg:flex">
                <div className="flex flex-col items-center rounded-md bg-white/10 px-2.5 py-1.5">
                  <span className="text-sm font-bold text-white">{stats.total}</span>
                  <span className="text-[9px] text-white/50">الكل</span>
                </div>
                <div className="flex flex-col items-center rounded-md bg-red-500/20 px-2.5 py-1.5">
                  <span className="flex items-center gap-1 text-sm font-bold text-red-400">
                    {stats.live}
                    {stats.live > 0 && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400"></span>
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] text-red-400/60">مباشر</span>
                </div>
                <div className="flex flex-col items-center rounded-md bg-amber-500/20 px-2.5 py-1.5">
                  <span className="text-sm font-bold text-amber-400">{stats.upcoming}</span>
                  <span className="text-[9px] text-amber-400/60">قادم</span>
                </div>
                <div className="flex flex-col items-center rounded-md bg-green-500/20 px-2.5 py-1.5">
                  <span className="text-sm font-bold text-green-400">{stats.sold}</span>
                  <span className="text-[9px] text-green-400/60">مباع</span>
                </div>
              </div>

              {/* أزرار التواصل */}
              <div className="flex items-center gap-1.5">
                {yard.phone && (
                  <a
                    href={`tel:${yard.phone}`}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-green-700"
                  >
                    <PhoneIcon className="h-3.5 w-3.5" />
                    <span className="dir-ltr hidden sm:inline">{yard.phone}</span>
                  </a>
                )}
                <button
                  onClick={handleShare}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-all hover:bg-white/20"
                >
                  <ShareIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* شريط المعلومات السفلي - عرض كامل */}
          <div className="border-t border-white/10 bg-black/20">
            <div className="container mx-auto px-4">
              <div className="flex min-h-[36px] flex-wrap items-center gap-x-4 gap-y-2 py-2 text-[11px] text-white/70">
                {/* أيام المزاد - عرض كامل */}
                {yard.auctionDays.length > 0 && (
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <CalendarDaysIcon className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-[10px] text-white/50">أيام المزاد:</span>
                    <div className="flex flex-wrap gap-1">
                      {yard.auctionDays.map((day) => (
                        <span
                          key={day}
                          className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-300"
                        >
                          {dayLabels[day] || day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="hidden h-3 w-px bg-white/20 sm:block"></div>

                {/* وقت المزاد */}
                {yard.auctionTimeFrom && yard.auctionTimeTo && (
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <ClockIcon className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[10px] text-white/50">الوقت:</span>
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">
                      {yard.auctionTimeFrom} - {yard.auctionTimeTo}
                    </span>
                  </div>
                )}

                <div className="hidden h-3 w-px bg-white/20 sm:block"></div>

                {/* أنواع المركبات - عرض كامل */}
                {yard.vehicleTypes.length > 0 && (
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <TruckIcon className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-[10px] text-white/50">أنواع المركبات:</span>
                    <div className="flex flex-wrap gap-1">
                      {yard.vehicleTypes.map((vt) => (
                        <span
                          key={vt}
                          className="rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] text-green-300"
                        >
                          {vehicleTypeLabels[vt] || vt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* السعة */}
                {yard.capacity && (
                  <>
                    <div className="hidden h-3 w-px bg-white/20 sm:block"></div>
                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      <UserGroupIcon className="h-3.5 w-3.5 text-purple-400" />
                      <span className="text-[10px] text-white/50">السعة:</span>
                      <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] text-purple-300">
                        {yard.capacity} سيارة
                      </span>
                    </div>
                  </>
                )}

                {/* الخدمات المتاحة - إذا وجدت */}
                {yard.services && yard.services.length > 0 && (
                  <>
                    <div className="hidden h-3 w-px bg-white/20 sm:block"></div>
                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      <CurrencyDollarIcon className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-[10px] text-white/50">الخدمات:</span>
                      <div className="flex flex-wrap gap-1">
                        {yard.services.map((service, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300"
                          >
                            {formatService(service)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* إحصائيات الموبايل */}
                <div className="mr-auto flex items-center gap-3 lg:hidden">
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                    {stats.total} مزاد
                  </span>
                  {stats.live > 0 && (
                    <span className="flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-[10px] text-red-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400"></span>
                      </span>
                      {stats.live} مباشر
                    </span>
                  )}
                  {stats.upcoming > 0 && (
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">
                      {stats.upcoming} قادم
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* شريط التبويبات */}
        <div className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2">
              {/* التبويبات */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const colors = tab.color;
                  const isActive = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 ${
                        screenWidth <= 640 ? 'px-2 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                      } ${
                        isActive
                          ? `${colors.bg} ${colors.text} ${colors.border} border-2 shadow-md`
                          : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <TabIcon
                        className={`${screenWidth <= 640 ? 'h-3 w-3' : 'h-4 w-4'} ${isActive ? '' : 'text-gray-500'}`}
                      />
                      <span>
                        {screenWidth <= 480
                          ? `${tab.shortLabel} (${tab.count})`
                          : `${tab.label} (${tab.count})`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* أزرار التحكم */}
              <div className="hidden items-center gap-2 md:flex">
                {/* البحث */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-40 rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* وضع العرض */}
                <div className="relative flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    disabled={screenWidth < 920}
                    className={`rounded-md p-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    } ${screenWidth < 920 ? 'cursor-not-allowed opacity-50' : ''}`}
                    title={screenWidth < 920 ? 'غير متاح في الشاشات الصغيرة' : 'عرض قائمة'}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`rounded-md p-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="عرض شبكي"
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* بحث الموبايل */}
        <div className="border-b border-gray-200 bg-white md:hidden">
          <div className="container mx-auto px-4 py-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="بحث في مزادات الساحة..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-10 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Mobile Filters - يظهر فقط في الشاشات الصغيرة */}
        <div className="mobile-filters-container block border-b border-gray-200 bg-white lg:hidden">
          <div className="container mx-auto px-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="mobile-filters-button flex w-full items-center justify-between py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">فلاتر البحث</span>
                {(filters.brand !== 'الماركات' ||
                  filters.yearFrom !== 'جميع السنوات' ||
                  filters.priceMin !== null ||
                  filters.featuredOnly) && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    نشط
                  </span>
                )}
              </div>
              {showMobileFilters ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {/* محتوى الفلاتر المطوي */}
            {showMobileFilters && (
              <div className="mobile-filters-content mt-2 border-t border-gray-100 pb-4 pt-4">
                <div className="space-y-4">
                  {/* البحث النصي */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <MagnifyingGlassIcon className="h-4 w-4 flex-shrink-0 text-gray-600" />
                      <span>البحث في العنوان والوصف</span>
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <input
                        type="text"
                        placeholder="ابحث عن مزاد..."
                        value={filters.searchQuery}
                        onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* نطاق السعر */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <CurrencyDollarIcon className="h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>نطاق السعر (دينار)</span>
                    </label>
                    <div className="mobile-filter-inputs grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="من"
                        value={filters.priceMin || ''}
                        onChange={(e) =>
                          handleFilterChange(
                            'priceMin',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="إلى"
                        value={filters.priceMax || ''}
                        onChange={(e) =>
                          handleFilterChange(
                            'priceMax',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* أزرار سريعة للأسعار */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { label: 'أقل من 50k', min: null, max: 50000 },
                      { label: '50k-100k', min: 50000, max: 100000 },
                      { label: '100k-200k', min: 100000, max: 200000 },
                      { label: '200k+', min: 200000, max: null },
                    ].map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {
                          handleFilterChange('priceMin', range.min);
                          handleFilterChange('priceMax', range.max);
                        }}
                        className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-100"
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>

                  {/* النوع والموديل والسنة */}
                  <div className="space-y-4">
                    {/* النوع والموديل */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        النوع والموديل
                      </label>
                      <BasicBrandModelFilter
                        brand={filters.brand === 'الماركات' ? '' : filters.brand}
                        model={filters.model === 'الموديلات' ? '' : filters.model}
                        onChange={({ brand, model }) => {
                          if (brand !== undefined) {
                            handleFilterChange('brand', brand || 'الماركات');
                            handleFilterChange('model', 'الموديلات');
                          }
                          if (model !== undefined) {
                            handleFilterChange('model', model || 'الموديلات');
                          }
                        }}
                      />
                    </div>

                    {/* السنة */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">السنة</label>
                      <YearRangeSelector
                        yearFrom={filters.yearFrom === 'جميع السنوات' ? '' : filters.yearFrom}
                        yearTo={filters.yearTo === 'جميع السنوات' ? '' : filters.yearTo}
                        onYearFromChange={(y: string) =>
                          handleFilterChange('yearFrom', y || 'جميع السنوات')
                        }
                        onYearToChange={(y: string) =>
                          handleFilterChange('yearTo', y || 'جميع السنوات')
                        }
                        labelFrom="من سنة"
                        labelTo="إلى سنة"
                      />
                    </div>
                  </div>

                  {/* فلتر المميزة فقط */}
                  <div className="mb-4">
                    <button
                      onClick={() => handleFilterChange('featuredOnly', !filters.featuredOnly)}
                      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
                        filters.featuredOnly
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm'
                          : 'border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      <StarIcon className="h-5 w-5" />
                      <span>المميزة فقط</span>
                    </button>
                  </div>

                  {/* زر مسح الفلاتر */}
                  <button
                    onClick={resetFilters}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>مسح جميع الفلاتر</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* محتوى المزادات */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start justify-start gap-6">
            {/* Sidebar - Fixed height to match content - مخفي في الشاشات الصغيرة */}
            <div
              className={`${sidebarOpen ? 'w-72' : 'w-0'} hidden flex-shrink-0 overflow-hidden transition-all duration-300 lg:block lg:w-72`}
            >
              <div className="h-fit rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-4 border-b border-gray-200 pb-2 text-base font-semibold text-gray-800">
                  فلاتر البحث
                </h3>

                {/* فلاتر المزادات */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrophyIcon className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">فلاتر المزادات</h3>
                      </div>
                      <button
                        onClick={resetFilters}
                        className="text-gray-500 transition-colors hover:text-red-600"
                        title="مسح جميع الفلاتر"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* البحث النصي */}
                    <div className="mb-4">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MagnifyingGlassIcon className="h-4 w-4 flex-shrink-0 text-gray-600" />
                        <span>البحث في العنوان والوصف</span>
                      </label>
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <input
                          type="text"
                          placeholder="ابحث عن مزاد..."
                          value={filters.searchQuery}
                          onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* اختيار النوع والموديل والسنة */}
                    <div className="space-y-3">
                      {/* النوع والموديل */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          النوع والموديل
                        </label>
                        <BasicBrandModelFilter
                          brand={filters.brand === 'الماركات' ? '' : filters.brand}
                          model={filters.model === 'الموديلات' ? '' : filters.model}
                          onChange={({ brand, model }) => {
                            if (brand !== undefined) {
                              handleFilterChange('brand', brand || 'الماركات');
                              handleFilterChange('model', 'الموديلات');
                            }
                            if (model !== undefined) {
                              handleFilterChange('model', model || 'الموديلات');
                            }
                          }}
                        />
                      </div>

                      {/* السنة */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          السنة
                        </label>
                        <YearRangeSelector
                          yearFrom={filters.yearFrom === 'جميع السنوات' ? '' : filters.yearFrom}
                          yearTo={filters.yearTo === 'جميع السنوات' ? '' : filters.yearTo}
                          onYearFromChange={(y: string) =>
                            handleFilterChange('yearFrom', y || 'جميع السنوات')
                          }
                          onYearToChange={(y: string) =>
                            handleFilterChange('yearTo', y || 'جميع السنوات')
                          }
                          labelFrom="من سنة"
                          labelTo="إلى سنة"
                        />
                      </div>
                    </div>

                    {/* نطاق السعر */}
                    <div className="py-2">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <CurrencyDollarIcon className="h-4 w-4 flex-shrink-0 text-blue-600" />
                        <span>نطاق المزايدة (دينار ليبي)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="الحد الأدنى"
                          value={filters.priceMin ? filters.priceMin.toLocaleString('en-US') : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, '');
                            handleFilterChange('priceMin', value === '' ? null : parseInt(value));
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="الحد الأقصى"
                          value={filters.priceMax ? filters.priceMax.toLocaleString('en-US') : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, '');
                            handleFilterChange('priceMax', value === '' ? null : parseInt(value));
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {/* أزرار سريعة للأسعار */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {[
                          { label: 'أقل من 50k', min: null, max: 50000 },
                          { label: '50k-100k', min: 50000, max: 100000 },
                          { label: '100k-200k', min: 100000, max: 200000 },
                          { label: '200k-300k', min: 200000, max: 300000 },
                          { label: 'أكثر من 300k', min: 300000, max: null },
                        ].map((range) => (
                          <button
                            key={range.label}
                            onClick={() => {
                              handleFilterChange('priceMin', range.min);
                              handleFilterChange('priceMax', range.max);
                            }}
                            className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-100"
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* الوقت المتبقي */}
                    <div className="py-2">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <ClockIcon className="h-4 w-4 flex-shrink-0 text-red-600" />
                        <span>الوقت المتبقي</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'جميع الأوقات',
                          'أقل من ساعة',
                          'أقل من 6 ساعات',
                          'أقل من 24 ساعة',
                          'أكثر من يوم',
                        ].map((time) => (
                          <button
                            key={time}
                            onClick={() => handleFilterChange('timeRemaining', time)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              filters.timeRemaining === time
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* فلتر المميزة فقط */}
                    <div className="mt-4">
                      <button
                        onClick={() => handleFilterChange('featuredOnly', !filters.featuredOnly)}
                        className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
                          filters.featuredOnly
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm'
                            : 'border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        <StarIcon className="h-5 w-5" />
                        <span>المميزة فقط</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="min-h-0 flex-1">
              {/* مؤشر التحميل */}
              {auctionsLoading && (
                <div className="mb-4 flex justify-center">
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-600">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span className="text-sm">جاري التحميل...</span>
                  </div>
                </div>
              )}

              {/* شبكة المزادات */}
              {filteredAuctions.length > 0 ? (
                <>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'auction-grid-view grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'
                        : 'auction-list-view space-y-6'
                    }
                  >
                    {paginatedAuctions.map((auction) => {
                      const transformedCar = transformAuctionForCard(auction);
                      return viewMode === 'grid' ? (
                        <AuctionCardGrid
                          key={auction.id}
                          car={transformedCar}
                          onContactClick={handleContactClick}
                          onChatClick={handleChatClick}
                          onBidClick={handleBidClick}
                          onCardClick={handleCardClick}
                          onFavoriteClick={() => handleFavoriteClick(auction.id)}
                          isFavorite={isFavorite(undefined, auction.id)}
                          isYardAuction={true}
                        />
                      ) : (
                        <NewAuctionCard
                          key={auction.id}
                          car={transformedCar}
                          onContactClick={handleContactClick}
                          onChatClick={handleChatClick}
                          onBidClick={handleBidClick}
                          onCardClick={handleCardClick}
                          onFavoriteClick={() => handleFavoriteClick(auction.id)}
                          isFavorite={isFavorite(undefined, auction.id)}
                          isYardAuction={true}
                        />
                      );
                    })}
                  </div>

                  {/* الترقيم */}
                  {filteredTotalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          السابق
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, filteredTotalPages) }, (_, i) => {
                            let pageNum;
                            if (filteredTotalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= filteredTotalPages - 2) {
                              pageNum = filteredTotalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`h-9 w-9 rounded-lg text-sm font-medium ${
                                  currentPage === pageNum
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage((p) => Math.min(filteredTotalPages, p + 1))}
                          disabled={currentPage === filteredTotalPages}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          التالي
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // لا توجد مزادات
                <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${activeTabData.color.bg}`}
                  >
                    <activeTabData.icon className={`h-8 w-8 ${activeTabData.color.textLight}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    لا توجد مزادات {activeTabData.shortLabel}
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === 'live' && 'لا توجد مزادات مباشرة حالياً في هذه الساحة'}
                    {activeTab === 'upcoming' && 'لا توجد مزادات قادمة مجدولة'}
                    {activeTab === 'sold' && 'لم يتم بيع أي مزادات بعد'}
                    {activeTab === 'ended' && 'لا توجد مزادات منتهية'}
                  </p>
                  <button
                    onClick={() => setActiveTab('live')}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    عرض المزادات المباشرة
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AdvancedFooter />
    </>
  );
}
