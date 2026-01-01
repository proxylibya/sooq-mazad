import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../../components/common';
import useAuth from '../../hooks/useAuth';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import DevicePhoneMobileIcon from '@heroicons/react/24/outline/DevicePhoneMobileIcon';
import ComputerDesktopIcon from '@heroicons/react/24/outline/ComputerDesktopIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

// أنواع البيانات
interface ViewsData {
  adId: string;
  adTitle: string;
  adType: 'marketplace' | 'auction';
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  viewsGrowth: number;
  location: string;
  createdAt: string;
  image: string;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  sourceBreakdown: {
    direct: number;
    search: number;
    social: number;
    referral: number;
  };
}

interface ViewsStats {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  averageViewsPerAd: number;
  topPerformingAd: string;
  growthRate: number;
}

const ViewsStatsPage = () => {
  const router = useRouter();
  const { user: _user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [viewsData, setViewsData] = useState<ViewsData[]>([]);
  const [viewsStats, setViewsStats] = useState<ViewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('الكل');
  const [typeFilter, setTypeFilter] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/?redirect=/my-account/views-stats');
    }
  }, [authLoading, isAuthenticated, router]);

  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    loadViewsData();
  }, []);

  // تحميل بيانات المشاهدات من API
  const loadViewsData = async () => {
    setLoading(true);
    try {
      // TODO: استبدال بـ API حقيقي
      // const response = await fetch('/api/analytics/views');
      // const data = await response.json();
      
      // بيانات مؤقتة ريثما يتم تطوير API الإحصائيات
      const tempViewsData: ViewsData[] = [
        {
          adId: '1',
          adTitle: 'إعلان تجريبي 1',
          adType: 'marketplace',
          totalViews: 0,
          todayViews: 0,
          weekViews: 0,
          monthViews: 0,
          viewsGrowth: 0,
          location: 'طرابلس',
          createdAt: new Date().toISOString(),
          image: '/images/cars/default-car.svg',
          deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
          sourceBreakdown: {
            direct: 0,
            search: 0,
            social: 0,
            referral: 0,
          },
        },
      ];

      const totalViews = tempViewsData.reduce((sum: number, ad: ViewsData) => sum + ad.totalViews, 0);
      const todayViews = tempViewsData.reduce((sum: number, ad: ViewsData) => sum + ad.todayViews, 0);
      const weekViews = tempViewsData.reduce((sum: number, ad: ViewsData) => sum + ad.weekViews, 0);
      const monthViews = tempViewsData.reduce((sum: number, ad: ViewsData) => sum + ad.monthViews, 0);

      const tempStats: ViewsStats = {
        totalViews,
        todayViews,
        weekViews,
        monthViews,
        averageViewsPerAd: tempViewsData.length > 0 ? Math.round(totalViews / tempViewsData.length) : 0,
        topPerformingAd:
          tempViewsData.sort((a: ViewsData, b: ViewsData) => b.totalViews - a.totalViews)[0]?.adTitle || 'لا يوجد',
        growthRate: 0,
      };

      setViewsData(tempViewsData);
      setViewsStats(tempStats);
    } catch (error) {
      console.error('خطأ في تحميل بيانات المشاهدات:', error);
    } finally {
      setLoading(false);
    }
  };

  // تصفية البيانات
  const filteredData = viewsData.filter((ad) => {
    const matchesType =
      typeFilter === 'الكل' ||
      (typeFilter === 'السوق الفوري' && ad.adType === 'marketplace') ||
      (typeFilter === 'المزادات' && ad.adType === 'auction');

    const matchesSearch = ad.adTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowTrendingUpIcon className="h-4 w-4" />;
    if (growth < 0) return <ArrowTrendingDownIcon className="h-4 w-4" />;
    return null;
  };

  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  return (
    <>
      <Head>
        <title>إحصائيات المشاهدات - حسابي</title>
        <meta
          name="description"
          content="عرض تفصيلي لإحصائيات مشاهدات جميع إعلاناتك مع التحليلات المتقدمة"
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
              <h1 className="text-3xl font-bold text-gray-900">إحصائيات المشاهدات</h1>
            </div>
            <p className="text-gray-600">تحليل مفصل لمشاهدات إعلاناتك وأداءها</p>
          </div>

          {/* Overall Stats */}
          {viewsStats && (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي المشاهدات</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(viewsStats.totalViews)}
                    </p>
                  </div>
                  <EyeIcon className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">مشاهدات اليوم</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(viewsStats.todayViews)}
                    </p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">متوسط المشاهدات</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(viewsStats.averageViewsPerAd)}
                    </p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">معدل النمو</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-2xl font-bold ${getGrowthColor(viewsStats.growthRate)}`}>
                        {viewsStats.growthRate > 0 ? '+' : ''}
                        {viewsStats.growthRate.toFixed(1)}%
                      </p>
                      {getGrowthIcon(viewsStats.growthRate)}
                    </div>
                  </div>
                  <ArrowTrendingUpIcon className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
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
                  className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-12 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="الكل">جميع الأنواع</option>
                  <option value="السوق الفوري">السوق الفوري</option>
                  <option value="المزادات">المزادات</option>
                </select>

                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="الكل">جميع الفترات</option>
                  <option value="اليوم">اليوم</option>
                  <option value="الأسبوع">هذا الأسبوع</option>
                  <option value="الشهر">هذا الشهر</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ads Performance */}
          <div className="space-y-6">
            {filteredData.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                <EyeIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد بيانات</h3>
                <p className="text-gray-500">لم يتم العثور على إعلانات تطابق معايير البحث</p>
              </div>
            ) : (
              filteredData.map((ad) => (
                <div
                  key={ad.adId}
                  className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
                >
                  <div className="p-6">
                    {/* Ad Header */}
                    <div className="mb-6 flex items-start gap-4">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                        <Image
                          src={ad.image}
                          alt={ad.adTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                              {ad.adTitle}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="h-4 w-4" />
                                <span>{ad.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{formatDate(ad.createdAt)}</span>
                              </div>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  ad.adType === 'auction'
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'bg-blue-100 text-blue-600'
                                }`}
                              >
                                {ad.adType === 'auction' ? 'مزاد' : 'سوق مفتوح'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="mb-1 text-2xl font-bold text-gray-900">
                              {formatNumber(ad.totalViews)}
                            </div>
                            <div className="text-sm text-gray-500">إجمالي المشاهدات</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Views Stats */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="rounded-lg bg-blue-50 p-4 text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {formatNumber(ad.todayViews)}
                        </div>
                        <div className="text-sm text-blue-700">اليوم</div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-4 text-center">
                        <div className="text-lg font-bold text-green-600">
                          {formatNumber(ad.weekViews)}
                        </div>
                        <div className="text-sm text-green-700">هذا الأسبوع</div>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-4 text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {formatNumber(ad.monthViews)}
                        </div>
                        <div className="text-sm text-purple-700">هذا الشهر</div>
                      </div>
                      <div className="rounded-lg bg-yellow-50 p-4 text-center">
                        <div
                          className={`flex items-center justify-center gap-1 text-lg font-bold ${getGrowthColor(ad.viewsGrowth)}`}
                        >
                          {getGrowthIcon(ad.viewsGrowth)}
                          {ad.viewsGrowth > 0 ? '+' : ''}
                          {ad.viewsGrowth.toFixed(1)}%
                        </div>
                        <div className="text-sm text-yellow-700">معدل النمو</div>
                      </div>
                    </div>

                    {/* Device & Source Breakdown */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Device Breakdown */}
                      <div>
                        <h4 className="mb-3 text-sm font-medium text-gray-900">توزيع الأجهزة</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DevicePhoneMobileIcon className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-gray-600">الهاتف المحمول</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatNumber(ad.deviceBreakdown.mobile)}
                              </span>
                              <div className="h-2 w-20 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-blue-600"
                                  style={{
                                    width: `${(ad.deviceBreakdown.mobile / ad.totalViews) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ComputerDesktopIcon className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-600">سطح المكتب</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatNumber(ad.deviceBreakdown.desktop)}
                              </span>
                              <div className="h-2 w-20 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-green-600"
                                  style={{
                                    width: `${(ad.deviceBreakdown.desktop / ad.totalViews) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-4 w-4 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-sm text-gray-600">الجهاز اللوحي</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatNumber(ad.deviceBreakdown.tablet)}
                              </span>
                              <div className="h-2 w-20 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-purple-600"
                                  style={{
                                    width: `${(ad.deviceBreakdown.tablet / ad.totalViews) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Source Breakdown */}
                      <div>
                        <h4 className="mb-3 text-sm font-medium text-gray-900">مصادر الزيارات</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GlobeAltIcon className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-gray-600">مباشر</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatNumber(ad.sourceBreakdown.direct)}
                              </span>
                              <div className="h-2 w-20 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-blue-600"
                                  style={{
                                    width: `${(ad.sourceBreakdown.direct / ad.totalViews) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MagnifyingGlassIcon className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-600">محركات البحث</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatNumber(ad.sourceBreakdown.search)}
                              </span>
                              <div className="h-2 w-20 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-green-600"
                                  style={{
                                    width: `${(ad.sourceBreakdown.search / ad.totalViews) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-4 w-4 text-purple-600"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                              </svg>
                              <span className="text-sm text-gray-600">وسائل التواصل</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatNumber(ad.sourceBreakdown.social)}
                              </span>
                              <div className="h-2 w-20 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-purple-600"
                                  style={{
                                    width: `${(ad.sourceBreakdown.social / ad.totalViews) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-4 w-4 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                />
                              </svg>
                              <span className="text-sm text-gray-600">مواقع أخرى</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatNumber(ad.sourceBreakdown.referral)}
                              </span>
                              <div className="h-2 w-20 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-yellow-600"
                                  style={{
                                    width: `${(ad.sourceBreakdown.referral / ad.totalViews) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <Link
                        href={`/ad-details/${ad.adId}`}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                      >
                        عرض تفاصيل الإعلان
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewsStatsPage;
