import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { OpensooqNavbar } from '../../components/common';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import DocumentArrowDownIcon from '@heroicons/react/24/outline/DocumentArrowDownIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

// أنواع البيانات
interface SalesReport {
  carId: string;
  carTitle: string;
  carImage: string;
  type: 'marketplace' | 'auction';

  // معلومات البيع
  listingDate: string;
  soldDate: string;
  daysOnMarket: number;

  // الأسعار
  originalPrice: number;
  finalPrice: number;
  profit: number;
  profitPercentage: number;

  // الإحصائيات
  totalViews: number;
  favorites: number;
  inquiries: number;
  showings: number;

  // تفاصيل الأداء
  viewsPerDay: number;
  conversionRate: number;
  priceReductions: Array<{
    date: string;
    oldPrice: number;
    newPrice: number;
    reason: string;
  }>;

  // المقارنات
  marketAverage: {
    daysOnMarket: number;
    finalPrice: number;
    viewsToSale: number;
  };

  // التحليلات
  performanceScore: number;
  strengths: string[];
  improvements: string[];

  // البيانات الزمنية
  dailyViews: Array<{
    date: string;
    views: number;
    inquiries: number;
  }>;

  location: string;
}

const SalesReportPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);

  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    if (id) {
      loadSalesReport(id as string);
    }
  }, [id]);

  // تحميل تقرير المبيعات
  const loadSalesReport = async (carId: string) => {
    setLoading(true);
    try {
      // محاكاة البيانات - في التطبيق الحقيقي ستأتي من API
      const mockReport: SalesReport = {
        carId,
        carTitle: 'تويوتا كامري 2020 - مباعة',
        carImage: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400',
        type: 'marketplace',

        listingDate: '2024-01-10',
        soldDate: '2024-01-20',
        daysOnMarket: 10,

        originalPrice: 75000,
        finalPrice: 78000,
        profit: 3000,
        profitPercentage: 4.0,

        totalViews: 2150,
        favorites: 67,
        inquiries: 23,
        showings: 8,

        viewsPerDay: 215,
        conversionRate: 1.07, // inquiries/views * 100

        priceReductions: [
          {
            date: '2024-01-15',
            oldPrice: 80000,
            newPrice: 78000,
            reason: 'تحسين القدرة التنافسية',
          },
        ],

        marketAverage: {
          daysOnMarket: 18,
          finalPrice: 74000,
          viewsToSale: 1800,
        },

        performanceScore: 85,
        strengths: [
          'بيع أسرع من المتوسط بـ 8 أيام',
          'سعر أعلى من المتوسط بـ 4000 دينار',
          'معدل مشاهدات عالي',
          'تفاعل جيد من المشترين',
        ],
        improvements: [
          'يمكن تحسين جودة الصور',
          'إضافة المزيد من التفاصيل في الوصف',
          'الرد السريع على الاستفسارات',
        ],

        dailyViews: [
          { date: '2024-01-10', views: 145, inquiries: 2 },
          { date: '2024-01-11', views: 189, inquiries: 3 },
          { date: '2024-01-12', views: 234, inquiries: 4 },
          { date: '2024-01-13', views: 198, inquiries: 2 },
          { date: '2024-01-14', views: 267, inquiries: 5 },
          { date: '2024-01-15', views: 298, inquiries: 3 },
          { date: '2024-01-16', views: 223, inquiries: 2 },
          { date: '2024-01-17', views: 189, inquiries: 1 },
          { date: '2024-01-18', views: 156, inquiries: 1 },
          { date: '2024-01-19', views: 134, inquiries: 0 },
          { date: '2024-01-20', views: 117, inquiries: 0 },
        ],

        location: 'طرابلس',
      };

      setSalesReport(mockReport);
    } catch (error) {
      console.error('خطأ في تحميل تقرير المبيعات:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-LY', {
      style: 'currency',
      currency: 'LYD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-LY').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-LY');
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceText = (score: number) => {
    if (score >= 80) return 'ممتاز';
    if (score >= 60) return 'جيد';
    return 'يحتاج تحسين';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // في التطبيق الحقيقي، سيتم إنشاء ملف PDF وتحميله
    alert('سيتم تحميل التقرير قريباً');
  };

  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  if (!salesReport) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <ChartBarIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">لم يتم العثور على التقرير</h3>
          <p className="mb-6 text-gray-500">تقرير المبيعات المطلوب غير موجود</p>
          <Link
            href="/my-account/sold-cars"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            العودة للسيارات المباعة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>تقرير المبيعات - {salesReport.carTitle}</title>
        <meta name="description" content={`تقرير مبيعات مفصل لـ ${salesReport.carTitle}`} />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <Link href="/my-account/sold-cars" className="text-gray-500 hover:text-gray-700">
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">تقرير المبيعات</h1>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">تحليل مفصل لأداء البيع</p>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <PrinterIcon className="h-4 w-4" />
                  طباعة
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  تحميل PDF
                </button>
              </div>
            </div>
          </div>

          {/* Car Info */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <img
                src={salesReport.carImage}
                alt={salesReport.carTitle}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">{salesReport.carTitle}</h2>
                <div className="mb-2 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{salesReport.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {formatDate(salesReport.listingDate)} - {formatDate(salesReport.soldDate)}
                    </span>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                    مباع
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-sm text-gray-500">السعر النهائي:</span>
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(salesReport.finalPrice)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">الربح:</span>
                    <div className="text-lg font-bold text-blue-600">
                      {formatPrice(salesReport.profit)} ({salesReport.profitPercentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">أيام في السوق</p>
                  <p className="text-2xl font-bold text-gray-900">{salesReport.daysOnMarket}</p>
                  <p className="text-sm text-green-600">
                    أسرع بـ {salesReport.marketAverage.daysOnMarket - salesReport.daysOnMarket} أيام
                  </p>
                </div>
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المشاهدات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(salesReport.totalViews)}
                  </p>
                  <p className="text-sm text-purple-600">{salesReport.viewsPerDay} مشاهدة/يوم</p>
                </div>
                <EyeIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">معدل التحويل</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {salesReport.conversionRate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-500">{salesReport.inquiries} استفسار</p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">نقاط الأداء</p>
                  <p
                    className={`text-2xl font-bold ${getPerformanceColor(salesReport.performanceScore)}`}
                  >
                    {salesReport.performanceScore}/100
                  </p>
                  <p className={`text-sm ${getPerformanceColor(salesReport.performanceScore)}`}>
                    {getPerformanceText(salesReport.performanceScore)}
                  </p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Daily Performance Chart */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">الأداء اليومي</h3>
            <div className="grid grid-cols-11 gap-2">
              {salesReport.dailyViews.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2 text-xs text-gray-500">
                    {new Date(day.date).toLocaleDateString('ar-LY', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  <div className="rounded-lg bg-gradient-to-t from-blue-100 to-blue-50 p-2 transition-colors hover:from-blue-200 hover:to-blue-100">
                    <div className="text-sm font-bold text-blue-600">{day.views}</div>
                    <div className="text-xs text-blue-700">مشاهدة</div>
                    {day.inquiries > 0 && (
                      <div className="mt-1 text-xs text-green-600">{day.inquiries} استفسار</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison with Market */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">مقارنة مع السوق</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-sm text-gray-600">أيام في السوق</div>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {salesReport.daysOnMarket}
                    </div>
                    <div className="text-xs text-gray-500">أنت</div>
                  </div>
                  <div className="text-gray-400">مقابل</div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-600">
                      {salesReport.marketAverage.daysOnMarket}
                    </div>
                    <div className="text-xs text-gray-500">المتوسط</div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-green-600">
                  أسرع بـ{' '}
                  {(
                    ((salesReport.marketAverage.daysOnMarket - salesReport.daysOnMarket) /
                      salesReport.marketAverage.daysOnMarket) *
                    100
                  ).toFixed(0)}
                  %
                </div>
              </div>

              <div className="text-center">
                <div className="mb-2 text-sm text-gray-600">السعر النهائي</div>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(salesReport.finalPrice)}
                    </div>
                    <div className="text-xs text-gray-500">أنت</div>
                  </div>
                  <div className="text-gray-400">مقابل</div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-600">
                      {formatPrice(salesReport.marketAverage.finalPrice)}
                    </div>
                    <div className="text-xs text-gray-500">المتوسط</div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-green-600">
                  أعلى بـ{' '}
                  {formatPrice(salesReport.finalPrice - salesReport.marketAverage.finalPrice)}
                </div>
              </div>

              <div className="text-center">
                <div className="mb-2 text-sm text-gray-600">المشاهدات للبيع</div>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {formatNumber(salesReport.totalViews)}
                    </div>
                    <div className="text-xs text-gray-500">أنت</div>
                  </div>
                  <div className="text-gray-400">مقابل</div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-600">
                      {formatNumber(salesReport.marketAverage.viewsToSale)}
                    </div>
                    <div className="text-xs text-gray-500">المتوسط</div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-green-600">
                  أكثر بـ{' '}
                  {formatNumber(salesReport.totalViews - salesReport.marketAverage.viewsToSale)}{' '}
                  مشاهدة
                </div>
              </div>
            </div>
          </div>

          {/* Price History */}
          {salesReport.priceReductions.length > 0 && (
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">تاريخ تغيير الأسعار</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                  <div>
                    <div className="font-medium text-blue-900">السعر الابتدائي</div>
                    <div className="text-sm text-blue-700">
                      {formatDate(salesReport.listingDate)}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatPrice(salesReport.originalPrice)}
                  </div>
                </div>

                {salesReport.priceReductions.map((reduction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-yellow-50 p-4"
                  >
                    <div>
                      <div className="font-medium text-yellow-900">تخفيض السعر</div>
                      <div className="text-sm text-yellow-700">{formatDate(reduction.date)}</div>
                      <div className="text-xs text-yellow-600">{reduction.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(reduction.oldPrice)}
                      </div>
                      <div className="text-lg font-bold text-yellow-600">
                        {formatPrice(reduction.newPrice)}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
                  <div>
                    <div className="font-medium text-green-900">السعر النهائي</div>
                    <div className="text-sm text-green-700">{formatDate(salesReport.soldDate)}</div>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {formatPrice(salesReport.finalPrice)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strengths and Improvements */}
          <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Strengths */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-green-900">نقاط القوة</h3>
              <div className="space-y-3">
                {salesReport.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-green-800">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-orange-900">فرص التحسين</h3>
              <div className="space-y-3">
                {salesReport.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <ArrowTrendingUpIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                    <span className="text-orange-800">{improvement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">إحصائيات مفصلة</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <EyeIcon className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(salesReport.totalViews)}
                </div>
                <div className="text-sm text-gray-600">إجمالي المشاهدات</div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <HeartIcon className="mx-auto mb-2 h-8 w-8 text-red-600" />
                <div className="text-2xl font-bold text-gray-900">{salesReport.favorites}</div>
                <div className="text-sm text-gray-600">إضافة للمفضلة</div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <ShareIcon className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                <div className="text-2xl font-bold text-gray-900">{salesReport.inquiries}</div>
                <div className="text-sm text-gray-600">استفسارات</div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <CalendarIcon className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <div className="text-2xl font-bold text-gray-900">{salesReport.showings}</div>
                <div className="text-sm text-gray-600">معاينات</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesReportPage;
