import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout, BackButton } from '../../../components/common';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import DevicePhoneMobileIcon from '@heroicons/react/24/outline/DevicePhoneMobileIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import DocumentArrowDownIcon from '@heroicons/react/24/outline/DocumentArrowDownIcon';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';

interface AuctionReportData {
  auctionId: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  totalViews: number;
  uniqueVisitors: number;
  totalBidders: number;
  verifiedBidders: number;
  totalBids: number;
  highestBid: number;
  startingBid: number;
  averageBidIncrease: number;
  viewsByDay: { date: string; views: number }[];
  bidsByDay: { date: string; bids: number }[];
  topCities: { city: string; views: number; percentage: number }[];
  deviceStats: { desktop: number; mobile: number; tablet: number };
  trafficSources: { source: string; visits: number; percentage: number }[];
  bidderAnalytics: {
    newBidders: number;
    returningBidders: number;
    averageTimeOnPage: string;
    bounceRate: number;
  };
}

const AuctionReportsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [reportData, setReportData] = useState<AuctionReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    if (id) {
      loadReportData();
    }
  }, [id, selectedPeriod]);

  const loadReportData = async () => {
    setLoading(true);

    try {
      // جلب البيانات من API الحقيقي
      const response = await fetch(`/api/auctions/${id}/reports?period=${selectedPeriod}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setReportData(result.data);
        } else {
          console.error('خطأ في جلب التقرير:', result.error);
          // استخدام بيانات افتراضية في حالة الخطأ
          setReportData(getDefaultReportData());
        }
      } else {
        console.error('خطأ في الاستجابة:', response.status);
        setReportData(getDefaultReportData());
      }
    } catch (error) {
      console.error('خطأ في تحميل التقرير:', error);
      setReportData(getDefaultReportData());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultReportData = (): AuctionReportData => {
    return {
      auctionId: id as string,
      title: 'تويوتا كامري 2020 - حالة ممتازة',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-01-22',
      totalViews: 2847,
      uniqueVisitors: 1923,
      totalBidders: 45,
      verifiedBidders: 38,
      totalBids: 127,
      highestBid: 85000,
      startingBid: 45000,
      averageBidIncrease: 1250,
      viewsByDay: [
        { date: '2024-01-15', views: 234 },
        { date: '2024-01-16', views: 456 },
        { date: '2024-01-17', views: 389 },
        { date: '2024-01-18', views: 512 },
        { date: '2024-01-19', views: 445 },
        { date: '2024-01-20', views: 398 },
        { date: '2024-01-21', views: 413 },
      ],
      bidsByDay: [
        { date: '2024-01-15', bids: 8 },
        { date: '2024-01-16', bids: 15 },
        { date: '2024-01-17', bids: 12 },
        { date: '2024-01-18', bids: 23 },
        { date: '2024-01-19', bids: 19 },
        { date: '2024-01-20', bids: 28 },
        { date: '2024-01-21', bids: 22 },
      ],
      topCities: [
        { city: 'طرابلس', views: 1142, percentage: 40.1 },
        { city: 'بنغازي', views: 569, percentage: 20.0 },
        { city: 'مصراتة', views: 341, percentage: 12.0 },
        { city: 'الزاوية', views: 227, percentage: 8.0 },
        { city: 'صبراتة', views: 171, percentage: 6.0 },
        { city: 'أخرى', views: 397, percentage: 13.9 },
      ],
      deviceStats: {
        desktop: 45.2,
        mobile: 48.7,
        tablet: 6.1,
      },
      trafficSources: [
        { source: 'البحث المباشر', visits: 1138, percentage: 40.0 },
        { source: 'وسائل التواصل', visits: 854, percentage: 30.0 },
        { source: 'الإحالات', visits: 569, percentage: 20.0 },
        { source: 'الإعلانات', visits: 286, percentage: 10.0 },
      ],
      bidderAnalytics: {
        newBidders: 28,
        returningBidders: 17,
        averageTimeOnPage: '4:32',
        bounceRate: 23.5,
      },
    };
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-LY').format(num);
  };

  const formatCurrency = (amount: number) => {
    return `${formatNumber(amount)} د.ل`;
  };

  const handleBack = () => {
    router.back();
  };

  const handleExportPDF = () => {
    // وظيفة تصدير PDF
    console.log('تصدير التقرير كـ PDF');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // وظيفة مشاركة التقرير
    console.log('مشاركة التقرير');
  };

  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  if (!reportData) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">لم يتم العثور على بيانات التقرير</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>تقرير المزاد - {reportData.title}</title>
        <meta name="description" content={`تقرير مفصل عن أداء المزاد: ${reportData.title}`} />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* رأس الصفحة */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BackButton onClick={handleBack} text="العودة" variant="gray" size="sm" />

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">تقرير المزاد</h1>
                  <p className="text-gray-600">{reportData.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  تصدير PDF
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                >
                  <PrinterIcon className="h-5 w-5" />
                  طباعة
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                >
                  <ShareIcon className="h-5 w-5" />
                  مشاركة
                </button>
              </div>
            </div>
          </div>

          {/* معلومات المزاد الأساسية */}
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">معلومات المزاد</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.highestBid)}
                </div>
                <div className="text-sm text-gray-600">أعلى مزايدة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(reportData.totalBidders)}
                </div>
                <div className="text-sm text-gray-600">إجمالي المزايدين</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(reportData.totalBids)}
                </div>
                <div className="text-sm text-gray-600">إجمالي المزايدات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(reportData.totalViews)}
                </div>
                <div className="text-sm text-gray-600">إجمالي المشاهدات</div>
              </div>
            </div>
          </div>

          {/* الإحصائيات التفصيلية */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* إحصائيات المشاهدات */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <EyeIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">إحصائيات المشاهدات</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">إجمالي المشاهدات</span>
                  <span className="font-semibold">{formatNumber(reportData.totalViews)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الزوار الفريدون</span>
                  <span className="font-semibold">{formatNumber(reportData.uniqueVisitors)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">معدل الارتداد</span>
                  <span className="font-semibold">{reportData.bidderAnalytics.bounceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">متوسط الوقت في الصفحة</span>
                  <span className="font-semibold">
                    {reportData.bidderAnalytics.averageTimeOnPage}
                  </span>
                </div>
              </div>
            </div>

            {/* إحصائيات المزايدات */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <UserGroupIcon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">إحصائيات المزايدات</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">إجمالي المزايدين</span>
                  <span className="font-semibold">{formatNumber(reportData.totalBidders)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المزايدون المتحققون</span>
                  <span className="font-semibold">{formatNumber(reportData.verifiedBidders)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">مزايدون جدد</span>
                  <span className="font-semibold">
                    {formatNumber(reportData.bidderAnalytics.newBidders)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">مزايدون عائدون</span>
                  <span className="font-semibold">
                    {formatNumber(reportData.bidderAnalytics.returningBidders)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* أهم المدن */}
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <MapPinIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">أهم المدن</h3>
            </div>

            <div className="space-y-3">
              {reportData.topCities.map((city, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{city.city}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-24 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-purple-600"
                        style={{ width: `${city.percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-16 text-left text-sm text-gray-600">
                      {formatNumber(city.views)} ({city.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* إحصائيات الأجهزة */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">إحصائيات الأجهزة</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">الهاتف المحمول</span>
                  <span className="font-semibold">{reportData.deviceStats.mobile}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">سطح المكتب</span>
                  <span className="font-semibold">{reportData.deviceStats.desktop}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الجهاز اللوحي</span>
                  <span className="font-semibold">{reportData.deviceStats.tablet}%</span>
                </div>
              </div>
            </div>

            {/* مصادر الزيارات */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-teal-100 p-2">
                  <GlobeAltIcon className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">مصادر الزيارات</h3>
              </div>

              <div className="space-y-3">
                {reportData.trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600">{source.source}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-teal-600"
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-left text-sm font-semibold">
                        {source.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ملخص الأداء */}
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">ملخص الأداء</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {(
                    ((reportData.highestBid - reportData.startingBid) / reportData.startingBid) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-sm text-gray-600">نمو السعر</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {((reportData.totalBidders / reportData.uniqueVisitors) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">معدل التحويل</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {formatCurrency(reportData.averageBidIncrease)}
                </div>
                <div className="text-sm text-gray-600">متوسط زيادة المزايدة</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">
                  {((reportData.verifiedBidders / reportData.totalBidders) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">المزايدون المتحققون</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuctionReportsPage;
