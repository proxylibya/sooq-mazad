import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../../components/common';
import useAuth from '../../hooks/useAuth';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';

// أنواع البيانات
interface ActiveAd {
  id: string;
  title: string;
  type: 'marketplace' | 'auction';
  price: number;
  views?: number;
  favorites?: number;
  status: 'active' | 'expired';
  createdAt: string;
  expiresAt?: string;
  location: string;
  images: string[];
  category?: string;
  brand?: string;
  model?: string;
  year?: number;
}

interface ListingFromAPI {
  id: string;
  title: string;
  type: string;
  price?: number;
  startingBid?: number;
  views?: number;
  favorites?: number;
  status: string;
  createdAt: string;
  endDate?: string;
  expiresAt?: string;
  location?: string;
  city?: string;
  images?: string[];
  category?: string;
  brand?: string;
  model?: string;
  year?: number;
}

const ActiveAdsPage = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [activeAds, setActiveAds] = useState<ActiveAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterType, setFilterType] = useState('الكل');
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/?redirect=/my-account/active-ads');
    }
  }, [authLoading, isAuthenticated, router]);

  // تحميل البيانات عند توفر المستخدم
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      loadActiveAds(user.id);
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setError('يرجى تسجيل الدخول أولاً');
    }
  }, [user?.id, isAuthenticated, authLoading]);

  // تحميل الإعلانات النشطة من API
  const loadActiveAds = async (userId: string) => {
    if (!userId) {
      setActiveAds([]);
      setError('يرجى تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/user?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        console.log(`[تم بنجاح] تم جلب ${data.listings.length} إعلان من قاعدة البيانات`);

        // تحويل البيانات إلى تنسيق ActiveAd
        const formattedAds: ActiveAd[] = data.listings.map((listing: ListingFromAPI) => ({
          id: listing.id,
          title: listing.title,
          type: listing.type === 'auction' ? 'auction' : 'marketplace',
          price: listing.price || listing.startingBid || 0,
          views: listing.views || 0,
          favorites: listing.favorites || 0,
          status:
            listing.status === 'ACTIVE' || listing.status === 'PENDING' ? 'active' : 'expired',
          createdAt: listing.createdAt,
          expiresAt: listing.endDate || listing.expiresAt,
          location: listing.location || listing.city || 'غير محدد',
          images: listing.images || [],
          category: listing.category,
          brand: listing.brand,
          model: listing.model,
          year: listing.year,
        }));

        setActiveAds(formattedAds);
        setError(null);
      } else {
        console.error('[فشل] فشل في جلب الإعلانات:', data.error);
        setActiveAds([]);
        setError(data.error || 'فشل في جلب الإعلانات');
      }
    } catch (error) {
      console.error('[فشل] خطأ في جلب الإعلانات:', error);
      setActiveAds([]);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // تصفية الإعلانات
  const filteredAds = activeAds.filter((ad) => {
    const matchesType =
      filterType === 'الكل' ||
      (filterType === 'السوق الفوري' && ad.type === 'marketplace') ||
      (filterType === 'المزادات' && ad.type === 'auction');

    const matchesStatus =
      filterStatus === 'الكل' ||
      (filterStatus === 'نشط' && ad.status === 'active') ||
      (filterStatus === 'منتهي الصلاحية' && ad.status === 'expired');

    const matchesSearch =
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ad.brand && ad.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ad.model && ad.model.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesStatus && matchesSearch;
  });

  const sortedAds = filteredAds;

  // دوال الإجراءات
  const handleEdit = (adId: string, type: string) => {
    if (type === 'marketplace') {
      router.push(`/sell-car/edit/${adId}`);
    } else {
      router.push(`/auction/edit/${adId}`);
    }
  };

  const handleDelete = async (adId: string, title: string) => {
    if (confirm(`هل أنت متأكد من حذف إعلان "${title}"؟`)) {
      try {
        const response = await fetch(`/api/listings/${adId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          // إعادة تحميل الإعلانات بعد الحذف
          if (user?.id) {
            await loadActiveAds(user.id);
          }

          // إظهار رسالة نجاح
          alert('تم حذف الإعلان بنجاح');
        } else {
          console.error('[فشل] فشل في حذف الإعلان:', data.error);
          alert(data.error || 'فشل في حذف الإعلان');
        }
      } catch (error) {
        console.error('[فشل] خطأ في حذف الإعلان:', error);
        alert('حدث خطأ في حذف الإعلان');
      }
    }
  };

  const handleViewStats = (adId: string, type: string) => {
    if (type === 'marketplace') {
      router.push(`/ad-stats/${adId}`);
    } else {
      router.push(`/auction-stats/${adId}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LYD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'expired':
        return 'منتهي الصلاحية';
      default:
        return status;
    }
  };

  // عرض حالة التحميل
  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  // عرض حالة الخطأ
  if (error && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">خطأ في تحميل البيانات</h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>الإعلانات النشطة - حسابي</title>
        <meta
          name="description"
          content="عرض وإدارة جميع إعلاناتك النشطة في السوق الفوري والمزادات"
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
              <h1 className="text-3xl font-bold text-gray-900">الإعلانات النشطة</h1>
            </div>
            <p className="text-gray-600">إدارة ومتابعة جميع إعلاناتك النشطة</p>
          </div>

          {/* Stats Summary */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الإعلانات</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAds.length}</p>
                </div>
                <TrophyIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المشاهدات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeAds.reduce((sum, ad) => sum + (ad.views || 0), 0).toLocaleString()}
                  </p>
                </div>
                <EyeIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المفضلة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeAds.reduce((sum, ad) => sum + (ad.favorites || 0), 0)}
                  </p>
                </div>
                <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">النشطة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activeAds.filter((ad) => ad.status === 'active').length}
                  </p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
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
                  placeholder="البحث في الإعلانات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-12 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="الكل">جميع الحالات</option>
                  <option value="نشط">نشط</option>
                  <option value="منتهي الصلاحية">منتهي الصلاحية</option>
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

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="ml-2 h-5 w-5 text-red-400" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Ads List */}
          {sortedAds.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center shadow-sm">
              <TrophyIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {activeAds.length === 0 ? 'لا توجد إعلانات' : 'لا توجد نتائج'}
              </h3>
              <p className="mb-6 text-gray-500">
                {activeAds.length === 0
                  ? 'لم تقم بإنشاء أي إعلانات بعد'
                  : 'لم يتم العثور على إعلانات تطابق معايير البحث'}
              </p>
              <Link
                href="/sell-car"
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                إضافة إعلان جديد
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
              {sortedAds.map((ad) => (
                <div
                  key={ad.id}
                  className={`overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md ${viewMode === 'list' ? 'flex' : ''}`}
                >
                  {/* Image */}
                  <div
                    className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'} relative`}
                  >
                    <Image 
                      src={ad.images[0] || '/images/cars/default-car.svg'} 
                      alt={ad.title} 
                      fill
                      className="object-cover"
                    />
                    <div className="absolute right-3 top-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(ad.status)}`}
                      >
                        {getStatusText(ad.status)}
                      </span>
                    </div>
                    <div className="absolute left-3 top-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          ad.type === 'auction'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {ad.type === 'auction' ? 'مزاد' : 'سوق مفتوح'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">{ad.title}</h3>

                    <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{ad.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(ad.createdAt)}</span>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-lg font-bold text-blue-600">{formatPrice(ad.price)}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="h-4 w-4" />
                          <span>{(ad.views || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <span>{ad.favorites || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(ad.id, ad.type)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-100"
                      >
                        <PencilIcon className="h-4 w-4" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleViewStats(ad.id, ad.type)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-sm text-purple-600 transition-colors hover:bg-purple-100"
                      >
                        <ChartBarIcon className="h-4 w-4" />
                        إحصائيات
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id, ad.title)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-100"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
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

export default ActiveAdsPage;
