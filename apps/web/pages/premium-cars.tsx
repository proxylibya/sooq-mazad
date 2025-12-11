import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { OpensooqNavbar, Pagination } from '../components/common';
import { usePagination } from '../hooks/usePagination';
import { MarketplaceCarCard } from '../components/features/marketplace';
import { useFavorites } from '../hooks/useFavorites';
import PremiumCarsStats from '../components/PremiumCarsStats';
import { XLargePrice } from '../components/PriceDisplay';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import MapIcon from '@heroicons/react/24/outline/MapIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import AdjustmentsHorizontalIcon from '@heroicons/react/24/outline/AdjustmentsHorizontalIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
// تم إزالة استيراد البيانات التجريبية - نعتمد على قاعدة البيانات

interface PremiumCarsPageProps {}

const PremiumCarsPage: React.FC<PremiumCarsPageProps> = () => {
  const router = useRouter();
  // محاكاة حالة تسجيل الدخول - يمكن ربطها بنظام المصادقة لاحقاً
  const session = null; // مؤقت للاختبار

  // حالة البيانات
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCars, setFilteredCars] = useState<any[]>([]);
  const [totalCars, setTotalCars] = useState(0);

  // إعداد الترقيم
  const pagination = usePagination({
    initialPage: 1,
    itemsPerPage: 20,
    totalItems: totalCars,
    updateURL: true,
    pageParam: 'page',
  });

  // حالة الفلاتر
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('الماركات');
  const [selectedPriceRange, setSelectedPriceRange] = useState('جميع الأسعار');
  const [selectedLocation, setSelectedLocation] = useState('جميع المدن');

  // حالة العرض
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // حالة التفاعل
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });

  // استخدام hook المفضلة الموحد
  const { isFavorite, toggleFavorite } = useFavorites();

  // تحميل البيانات
  useEffect(() => {
    loadPremiumCars();
  }, []);

  // تحديث البيانات عند تغيير الصفحة
  useEffect(() => {
    if (pagination.currentPage > 1) {
      loadPremiumCars();
    }
  }, [pagination.currentPage]);

  const loadPremiumCars = async () => {
    setLoading(true);
    try {
      // جلب السيارات المميزة من قاعدة البيانات
      const response = await fetch(
        `/api/cars?featured=true&page=${pagination.currentPage}&limit=${pagination.itemsPerPage}`,
      );
      const data = await response.json();

      if (data.success && data.data?.cars) {
        const premiumCarsData = data.data.cars.map((car: any) => ({
          id: car.id,
          title: car.title,
          price: car.price.toLocaleString(),
          brand: car.brand,
          model: car.model,
          year: car.year,
          location: car.location,
          image:
            car.images?.[0] ||
            'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&auto=format&q=80',
          images: car.images?.length ? `${car.images.length} صور` : '1 صورة',
          mileage: `${car.mileage || 0} كم`,
          condition:
            car.condition === 'new' ? 'جديد' : car.condition === 'used' ? 'مستعمل' : 'تحتاج إصلاح',
          fuelType: car.fuelType || 'بنزين',
          transmission: car.transmission || 'أوتوماتيك',
          bodyType: car.bodyType || 'سيدان',
          description: car.description,
          features: car.features || [],
          seller: {
            name: car.user?.name || 'بائع السيارة',
            phone: car.phone || 'غير متوفر',
          },
          views: car.views || 0,
          favorites: car.favorites || 0,
          postedDate: new Date(car.createdAt).toLocaleDateString('ar-LY'),
          status: car.status === 'ACTIVE' ? 'active' : 'inactive',
          urgent: car.urgent || false,
          featured: true,
          negotiable: car.isNegotiable || false,
          isAuction: false,
          time: new Date(car.createdAt).toLocaleDateString('ar-LY'),
          phone: car.phone || '',
        }));

        setCars(premiumCarsData);
        setFilteredCars(premiumCarsData);

        // تحديث معلومات الترقيم
        if (data.data?.pagination) {
          setTotalCars(data.data.pagination.total);
          pagination.setTotalItems(data.data.pagination.total);
        }
      } else {
        // لا توجد سيارات مميزة
        setCars([]);
        setFilteredCars([]);
        showNotification('info', 'لا توجد سيارات مميزة حالياً');
      }
    } catch (error) {
      console.error('خطأ في تحميل السيارات المميزة:', error);
      showNotification('error', 'حدث خطأ في تحميل البيانات');
      setCars([]);
      setFilteredCars([]);
    } finally {
      setLoading(false);
    }
  };

  // فلترة السيارات
  useEffect(() => {
    let filtered = [...cars];

    // فلترة بالبحث
    if (searchQuery) {
      filtered = filtered.filter(
        (car) =>
          car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          car.model.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // فلترة بالماركة
    if (selectedBrand !== 'الماركات') {
      filtered = filtered.filter((car) => car.brand === selectedBrand);
    }

    // فلترة بالموقع
    if (selectedLocation !== 'جميع المدن') {
      filtered = filtered.filter((car) => car.location.includes(selectedLocation));
    }

    // فلترة بالسعر
    if (selectedPriceRange !== 'جميع الأسعار') {
      const [min, max] = getPriceRange(selectedPriceRange);
      filtered = filtered.filter((car) => car.price >= min && car.price <= max);
    }

    setFilteredCars(filtered);
  }, [cars, searchQuery, selectedBrand, selectedPriceRange, selectedLocation]);

  // دوال مساعدة
  const getPriceRange = (range: string): [number, number] => {
    switch (range) {
      case 'أقل من 100,000':
        return [0, 100000];
      case '100,000 - 200,000':
        return [100000, 200000];
      case '200,000 - 300,000':
        return [200000, 300000];
      case 'أكثر من 300,000':
        return [300000, 999999999];
      default:
        return [0, 999999999];
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  // معالجات الأحداث
  const handleContactClick = (car: any) => {
    if (!session) {
      showNotification('info', 'يرجى تسجيل الدخول للتواصل مع البائع');
      return;
    }
    window.open(`tel:${car.phone}`, '_self');
  };

  const handleChatClick = (car: any) => {
    if (!session) {
      showNotification('info', 'يرجى تسجيل الدخول للمحادثة');
      return;
    }
    showNotification('info', 'سيتم فتح المحادثة قريباً');
  };

  const handleFavoriteClick = async (car: any) => {
    if (!session) {
      setNotification({
        show: true,
        type: 'warning',
        message: 'يجب تسجيل الدخول أولاً لإضافة السيارة للمفضلة',
      });
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
      return;
    }

    const carId = car.id.toString();
    const success = await toggleFavorite(carId);

    if (success) {
      const isNowFavorite = isFavorite(carId);
      setNotification({
        show: true,
        type: isNowFavorite ? 'success' : 'info',
        message: isNowFavorite ? 'تم إضافة السيارة للمفضلة' : 'تم إزالة السيارة من المفضلة',
      });
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 2000);
    } else {
      setNotification({
        show: true,
        type: 'error',
        message: 'حدث خطأ في تحديث المفضلة',
      });
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 2000);
    }
  };

  // الحصول على قوائم الفلاتر
  const brands = ['الماركات', ...Array.from(new Set(cars.map((car) => car.brand)))];
  const locations = [
    'جميع المدن',
    ...Array.from(new Set(cars.map((car) => car.location.split('،')[0]))),
  ];
  const priceRanges = [
    'جميع الأسعار',
    'أقل من 100,000',
    '100,000 - 200,000',
    '200,000 - 300,000',
    'أكثر من 300,000',
  ];

  return (
    <>
      <Head>
        <title>السيارات المميزة - مزاد السيارات</title>
        <meta name="description" content="تصفح أفضل السيارات المميزة والمختارة بعناية في ليبيا" />
        <meta name="keywords" content="سيارات مميزة, سيارات فاخرة, سيارات للبيع, ليبيا" />
      </Head>

      <OpensooqNavbar />

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="premium-cars-header py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <StarIcon className="h-10 w-10" />
                <h1 className="text-4xl font-bold">السيارات المميزة</h1>
                <StarIcon className="h-10 w-10" />
              </div>
              <p className="mb-6 text-xl text-yellow-100">
                أفضل السيارات المختارة بعناية - إعلانات مدفوعة وموثوقة
              </p>
              <div className="flex items-center justify-center gap-6 text-yellow-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{cars.length}</span>
                  <span>سيارة مميزة</span>
                </div>
                <div className="h-6 w-px bg-yellow-300"></div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">100%</span>
                  <span>موثوقة</span>
                </div>
                <div className="h-6 w-px bg-yellow-300"></div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">24/7</span>
                  <span>دعم</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن السيارة المميزة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="min-h-9 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                >
                  {priceRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="min-h-9 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 hover:bg-gray-50"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span>فلاتر</span>
                </button>

                <div className="flex overflow-hidden rounded-lg border border-gray-300">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 ${viewMode === 'list' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    title="عرض قائمة"
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    title="عرض شبكي"
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5"></div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Stats Section */}
          {!loading && (
            <PremiumCarsStats
              totalCars={filteredCars.length}
              totalViews={filteredCars.reduce((sum, car) => sum + car.views, 0)}
              totalFavorites={filteredCars.reduce((sum, car) => sum + car.favorites, 0)}
              totalContacts={Math.floor(
                filteredCars.reduce((sum, car) => sum + car.views, 0) * 0.15,
              )}
              className="mb-8"
            />
          )}

          {/* Results Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">النتائج ({filteredCars.length})</h2>
              {searchQuery && (
                <span className="text-gray-600">نتائج البحث عن: &quot;{searchQuery}&quot;</span>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
            </div>
          )}

          {/* Premium Features Banner */}
          {!loading && filteredCars.length > 0 && (
            <div className="premium-features-banner mb-8 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-yellow-500 p-3">
                    <StarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">مميزات السيارات المميزة</h3>
                    <p className="text-gray-600">جميع السيارات المعروضة هنا مدفوعة ومتحقق منها</p>
                  </div>
                </div>
                <div className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span>متحقق من البائع</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span>صور حقيقية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span>أولوية في العرض</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cars List */}
          {!loading && (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-6'
              }
            >
              {filteredCars.map((car) => (
                <div key={car.id} className="premium-car-card">
                  {/* Premium Badge */}
                  <div className="premium-car-badge">
                    <StarIcon className="h-4 w-4" />
                    <span>مميز</span>
                  </div>

                  <MarketplaceCarCard car={car} />
                </div>
              ))}
            </div>
          )}

          {/* مكون الترقيم */}
          {!loading && filteredCars.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.setPage}
                showInfo={true}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                disabled={loading}
                size="medium"
                className="rounded-lg bg-white p-4 shadow-sm"
              />
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredCars.length === 0 && (
            <div className="py-12 text-center">
              <StarIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">لا توجد سيارات مميزة</h3>
              <p className="mb-4 text-gray-600">لم نجد سيارات مميزة تطابق معايير البحث الخاصة بك</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand('الماركات');
                  setSelectedPriceRange('جميع الأسعار');
                  setSelectedLocation('جميع المدن');
                }}
                className="rounded-lg bg-yellow-500 px-6 py-3 text-white transition-colors hover:bg-yellow-600"
              >
                مسح الفلاتر
              </button>
            </div>
          )}
        </div>

        {/* Premium Advertising Section */}
        <div className="mt-16 border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                هل تريد أن تكون سيارتك مميزة؟
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-gray-600">
                احصل على المزيد من المشاهدات والاستفسارات من خلال ترقية إعلانك إلى إعلان مميز
              </p>
            </div>

            <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500">
                  <StarIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">أولوية في العرض</h3>
                <p className="text-gray-600">سيارتك ستظهر في المقدمة وفي قسم السيارات المميزة</p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">مشاهدات أكثر</h3>
                <p className="text-gray-600">
                  احصل على 5 أضعاف المشاهدات مقارنة بالإعلانات العادية
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">ثقة أكبر</h3>
                <p className="text-gray-600">شارة &quot;مميز&quot; تزيد من ثقة المشترين في إعلانك</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-600 p-8 text-center text-white">
              <h3 className="mb-4 text-2xl font-bold">أسعار الإعلانات المميزة</h3>
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="premium-pricing-card">
                  <h4 className="mb-2 text-lg font-bold">أسبوع واحد</h4>
                  <div className="mb-2">
                    <XLargePrice amount={50} color="default" />
                  </div>
                  <p className="text-yellow-100">مثالي للبيع السريع</p>
                </div>
                <div className="premium-pricing-popular">
                  <div className="mb-3 inline-block rounded-full bg-white px-3 py-1 text-sm font-bold text-yellow-600">
                    الأكثر شعبية
                  </div>
                  <h4 className="mb-2 text-lg font-bold">شهر كامل</h4>
                  <div className="mb-2">
                    <XLargePrice amount={150} color="default" />
                  </div>
                  <p className="text-yellow-100">أفضل قيمة مقابل السعر</p>
                </div>
                <div className="premium-pricing-card">
                  <h4 className="mb-2 text-lg font-bold">3 أشهر</h4>
                  <div className="mb-2">
                    <XLargePrice amount={350} color="default" />
                  </div>
                  <p className="text-yellow-100">للمعارض والتجار</p>
                </div>
              </div>
              <button className="rounded-lg bg-white px-8 py-3 font-bold text-yellow-600 transition-colors hover:bg-yellow-50">
                اجعل إعلاني مميزاً الآن
              </button>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            className={`fixed right-4 top-4 z-50 rounded-lg p-4 shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-500'
                : notification.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
            } text-white`}
          >
            {notification.message}
          </div>
        )}
      </div>
    </>
  );
};

export default PremiumCarsPage;
