import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CursorArrowRaysIcon,
} from '@heroicons/react/24/outline';

export default function AdAnalyticsChart({ placementAdId, dateRange = 7 }) {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('impressions');

  useEffect(() => {
    if (placementAdId) {
      fetchAnalytics();
    }
  }, [placementAdId, dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/ad-analytics?placementAdId=${placementAdId}&days=${dateRange}`
      );
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
        <ChartBarIcon className="mx-auto h-12 w-12 text-slate-600" />
        <p className="mt-2 text-slate-400">لا توجد بيانات تحليلية</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'إجمالي المشاهدات',
      value: analytics.totalImpressions?.toLocaleString() || 0,
      icon: EyeIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
    },
    {
      label: 'المشاهدات الفريدة',
      value: analytics.totalUniqueViews?.toLocaleString() || 0,
      icon: ArrowTrendingUpIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
    },
    {
      label: 'إجمالي النقرات',
      value: analytics.totalClicks?.toLocaleString() || 0,
      icon: CursorArrowRaysIcon,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/20',
    },
    {
      label: 'معدل النقر (CTR)',
      value: `${analytics.avgCTR?.toFixed(2) || 0}%`,
      icon: ChartBarIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
    },
  ];

  const getMaxValue = () => {
    if (!analytics.daily) return 0;
    const values = analytics.daily.map((d) => d[selectedMetric] || 0);
    return Math.max(...values, 1);
  };

  const maxValue = getMaxValue();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg ${stat.bgColor} p-2`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">المخطط البياني</h3>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-700 p-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="impressions">المشاهدات</option>
            <option value="clicks">النقرات</option>
            <option value="uniqueViews">المشاهدات الفريدة</option>
            <option value="ctr">معدل النقر</option>
          </select>
        </div>

        <div className="flex h-64 items-end justify-between gap-2">
          {analytics.daily?.map((day, index) => {
            const value = day[selectedMetric] || 0;
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

            return (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end justify-center">
                  <div
                    className="relative w-full rounded-t bg-gradient-to-t from-amber-500 to-amber-400 transition-all hover:from-amber-600 hover:to-amber-500"
                    style={{ height: `${height}%`, minHeight: value > 0 ? '4px' : '0' }}
                    title={`${value} ${
                      selectedMetric === 'impressions'
                        ? 'مشاهدة'
                        : selectedMetric === 'clicks'
                          ? 'نقرة'
                          : selectedMetric === 'ctr'
                            ? '%'
                            : 'مشاهدة فريدة'
                    }`}
                  >
                    {value > 0 && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white">
                        {selectedMetric === 'ctr' ? value.toFixed(1) : value}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(day.date).toLocaleDateString('ar', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {analytics.deviceStats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <h4 className="mb-3 text-sm font-bold text-white">حسب الجهاز</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">ديسكتوب</span>
                <span className="font-bold text-white">
                  {analytics.deviceStats.desktop || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">موبايل</span>
                <span className="font-bold text-white">
                  {analytics.deviceStats.mobile || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">تابلت</span>
                <span className="font-bold text-white">
                  {analytics.deviceStats.tablet || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <h4 className="mb-3 text-sm font-bold text-white">أفضل المتصفحات</h4>
            <div className="space-y-2">
              {analytics.topBrowsers?.slice(0, 3).map((browser, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{browser.name}</span>
                  <span className="font-bold text-white">{browser.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <h4 className="mb-3 text-sm font-bold text-white">أفضل المدن</h4>
            <div className="space-y-2">
              {analytics.topLocations?.slice(0, 3).map((location, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{location.city}</span>
                  <span className="font-bold text-white">{location.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
