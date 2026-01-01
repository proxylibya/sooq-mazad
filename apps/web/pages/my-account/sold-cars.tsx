import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../../components/common';
import { formatCityRegion } from '../../utils/formatters';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';

// أنواع البيانات
interface SoldCar {
  id: string;
  title: string;
  type: 'marketplace' | 'auction';
  originalPrice: number;
  soldPrice: number;
  profit: number;
  views: number;
  favorites: number;
  soldAt: string;
  createdAt: string;
  location: string;
  images: string[];
  category: string;
  brand: string;
  model: string;
  year: number;
  buyerRating?: number;
  sellerRating?: number;
  transactionId: string;
}

const SoldCarsPage = () => {
  const router = useRouter();
  // محاكاة حالة تسجيل الدخول - يمكن ربطها بنظام المصادقة لاحقاً
  const session = { user: { name: 'المستخدم التجريبي' } };
  const status = 'authenticated';
  const [soldCars, setSoldCars] = useState<SoldCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterType, setFilterType] = useState('الكل');

  const [searchQuery, setSearchQuery] = useState('');

  // التحقق من تسجيل الدخول
  useEffect(() => {
    // تحقق من وجود مستخدم مسجل في localStorage
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/?redirect=/my-account/sold-cars');
      return;
    }
    loadSoldCars();
  }, [router]);

  // تحميل السيارات المباعة
  const loadSoldCars = async () => {
    setLoading(true);
    try {
      // محاكاة البيانات - في التطبيق الحقيقي ستأتي من API
      const mockSoldCars: SoldCar[] = [
        {
          id: '2',
          title: 'هوندا أكورد 2019 - مزاد مكتمل',
          type: 'auction',
          originalPrice: 65000,
          soldPrice: 72000,
          profit: 7000,
          views: 1890,
          favorites: 45,
          soldAt: '2024-01-15',
          createdAt: '2024-01-05',
          location: 'بنغازي',
          images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'],
          category: 'سيارات',
          brand: 'هوندا',
          model: 'أكورد',
          year: 2019,
          buyerRating: 4,
          sellerRating: 5,
          transactionId: 'TXN-002',
        },
        {
          id: '3',
          title: 'نيسان التيما 2021 - بيع سريع',
          type: 'marketplace',
          originalPrice: 68000,
          soldPrice: 67000,
          profit: -1000,
          views: 1234,
          favorites: 32,
          soldAt: '2024-01-12',
          createdAt: '2024-01-08',
          location: 'مصراتة',
          images: ['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400'],
          category: 'سيارات',
          brand: 'نيسان',
          model: 'التيما',
          year: 2021,
          buyerRating: 5,
          sellerRating: 4,
          transactionId: 'TXN-003',
        },
      ];

      setSoldCars(mockSoldCars);
    } catch (error) {
      console.error('خطأ في تحميل السيارات المباعة:', error);
    } finally {
      setLoading(false);
    }
  };

  // تصفية السيارات
  const filteredCars = soldCars.filter((car) => {
    const matchesType =
      filterType === 'الكل' ||
      (filterType === 'السوق الفوري' && car.type === 'marketplace') ||
      (filterType === 'المزادات' && car.type === 'auction');

    const matchesSearch =
      car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  const sortedCars = filteredCars;

  // حساب الإحصائيات
  const totalSales = soldCars.reduce((sum, car) => sum + car.soldPrice, 0);
  const totalProfit = soldCars.reduce((sum, car) => sum + car.profit, 0);
  const averageRating =
    soldCars.reduce((sum, car) => sum + (car.sellerRating || 0), 0) / soldCars.length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-LY', {
      style: 'currency',
      currency: 'LYD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-LY');
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600';
    if (profit < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (status !== 'authenticated' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
          
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>السيارات المباعة - حسابي</title>
        <meta
          name="description"
          content="عرض جميع السيارات التي تم بيعها بنجاح مع تفاصيل الأرباح والتقييمات"
        />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <Link href="/my-account" className="text-gray-500 hover:text-gray-700">
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">السيارات المباعة</h1>
            </div>
            <p className="text-gray-600">عرض جميع السيارات التي تم بيعها بنجاح</p>
          </div>

          {/* Stats Summary */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-gray-900">{soldCars.length}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي قيمة المبيعات</p>
                  <p className="text-2xl font-bold text-blue-600">{formatPrice(totalSales)}</p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الأرباح</p>
                  <p className={`text-2xl font-bold ${getProfitColor(totalProfit)}`}>
                    {formatPrice(totalProfit)}
                  </p>
                </div>
                <TrophyIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">متوسط التقييم</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                    <div className="flex">{renderStars(Math.round(averageRating))}</div>
                  </div>
                </div>
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative max-w-md flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في السيارات المباعة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-12 focus:border-transparent focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="الكل">جميع الأنواع</option>
                  <option value="السوق الفوري">السوق الفوري</option>
                  <option value="المزادات">المزادات</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex overflow-hidden rounded-lg border border-gray-300">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    title="عرض قائمة"
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    title="عرض شبكي"
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cars List */}
          {sortedCars.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center shadow-sm">
              <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد سيارات مباعة</h3>
              <p className="mb-6 text-gray-500">
                لم يتم العثور على سيارات مباعة تطابق معايير البحث
              </p>
              <Link
                href="/my-account/active-ads"
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                عرض الإعلانات النشطة
              </Link>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-4'
              }
            >
              {sortedCars.map((car) => (
                <div
                  key={car.id}
                  className={`overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md ${viewMode === 'list' ? 'flex' : ''}`}
                >
                  {/* Image */}
                  <div
                    className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'} relative`}
                  >
                    <img
                      src={car.images[0]}
                      alt={car.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                        مباع
                      </span>
                    </div>
                    <div className="absolute left-3 top-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          car.type === 'auction'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {car.type === 'auction' ? 'مزاد' : 'سوق مفتوح'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">{car.title}</h3>

                    <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{formatCityRegion(car.location)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(car.soldAt)}</span>
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">السعر الأصلي:</span>
                        <span className="font-medium">{formatPrice(car.originalPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">سعر البيع:</span>
                        <span className="font-bold text-blue-600">
                          {formatPrice(car.soldPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">الربح/الخسارة:</span>
                        <span className={`font-bold ${getProfitColor(car.profit)}`}>
                          {car.profit > 0 ? '+' : ''}
                          {formatPrice(car.profit)}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{car.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span>{car.favorites}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4" />
                        <span>{car.sellerRating}/5</span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-4">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-500">تقييم البائع:</span>
                        <div className="flex items-center gap-1">
                          {renderStars(car.sellerRating || 0)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">تقييم المشتري:</span>
                        <div className="flex items-center gap-1">
                          {renderStars(car.buyerRating || 0)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/transaction/${car.transactionId}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-100"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                        تفاصيل المعاملة
                      </Link>
                      <Link
                        href={`/sales-report/${car.id}`}
                        className="flex items-center justify-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600 transition-colors hover:bg-green-100"
                      >
                        <ChartBarIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SoldCarsPage;
