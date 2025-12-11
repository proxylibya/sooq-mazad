import React, { useState } from 'react';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import DevicePhoneMobileIcon from '@heroicons/react/24/outline/DevicePhoneMobileIcon';
import ComputerDesktopIcon from '@heroicons/react/24/outline/ComputerDesktopIcon';

interface DetailedStats {
  // الأساسيات
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  viewsThisWeek: number;
  averageViewDuration: string;

  // المزايدين والمزايدات
  totalBidders: number;
  verifiedBidders: number;
  newBiddersToday: number;
  returningBidders: number;
  totalBids: number;
  bidsToday: number;
  averageBidIncrease: number;
  highestBid: number;
  lowestBid: number;
  bidFrequency: number;

  // التفاعل
  watchlistCount: number;
  sharesCount: number;
  inquiriesCount: number;
  phoneCallsCount: number;

  // الأجهزة والمواقع
  mobileViews: number;
  desktopViews: number;
  topCities: string[];

  // الوقت
  peakHours: string[];
  timeRemaining: string;
  auctionDuration: string;
}

interface CompactDetailedStatsProps {
  stats: DetailedStats;
  formatNumber: (num: string | number) => string;
  isVisible: boolean;
  onToggle: () => void;
}

const CompactDetailedStats: React.FC<CompactDetailedStatsProps> = ({
  stats,
  formatNumber,
  isVisible,
  onToggle,
}) => {
  const [activeView, setActiveView] = useState<'summary' | 'details'>('summary');

  // إحصائيات مبسطة للعرض السريع
  const quickStats = [
    { label: 'مشاهدات', value: formatNumber(stats.totalViews), color: 'text-blue-600' },
    { label: 'زوار فريدون', value: formatNumber(stats.uniqueVisitors), color: 'text-green-600' },
    { label: 'مزايدين', value: formatNumber(stats.totalBidders), color: 'text-purple-600' },
    { label: 'مزايدات', value: formatNumber(stats.totalBids), color: 'text-amber-600' },
    { label: 'قائمة المتابعة', value: formatNumber(stats.watchlistCount), color: 'text-red-600' },
    { label: 'مشاركات', value: formatNumber(stats.sharesCount), color: 'text-teal-600' },
  ];

  if (!isVisible) {
    return (
      <div className="rounded-lg border bg-white p-3 shadow-sm">
        <button onClick={onToggle} className="flex w-full items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">الإحصائيات التفصيلية</span>
          </div>
          <div className="text-xs text-gray-500">انقر للعرض</div>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      {/* رأس مصغر */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-3">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">الإحصائيات التفصيلية</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded bg-white p-0.5 shadow-sm">
            <button
              onClick={() => setActiveView('summary')}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                activeView === 'summary'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ملخص
            </button>
            <button
              onClick={() => setActiveView('details')}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                activeView === 'details'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              تفاصيل
            </button>
          </div>
          <button
            onClick={onToggle}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            إخفاء
          </button>
        </div>
      </div>

      <div className="p-3">
        {activeView === 'summary' ? (
          // الملخص السريع
          <div className="grid grid-cols-2 gap-2">
            {quickStats.map((stat, index) => (
              <div key={index} className="rounded bg-gray-50 p-2">
                <div className="text-xs text-gray-600">{stat.label}</div>
                <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        ) : (
          // التفاصيل المنظمة
          <div className="space-y-3">
            {/* مشاهدات وزوار */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-1">المشاهدات والزوار</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-blue-50 p-2">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-800">اليوم</span>
                  </div>
                  <div className="text-sm font-bold text-blue-900">{formatNumber(stats.viewsToday)}</div>
                </div>
                <div className="rounded bg-green-50 p-2">
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-800">الأسبوع</span>
                  </div>
                  <div className="text-sm font-bold text-green-900">{formatNumber(stats.viewsThisWeek)}</div>
                </div>
              </div>
            </div>

            {/* المزايدات */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-1">نشاط المزايدات</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded bg-purple-50 p-2">
                  <div className="text-xs text-purple-800">اليوم</div>
                  <div className="text-sm font-bold text-purple-900">{formatNumber(stats.bidsToday)}</div>
                </div>
                <div className="rounded bg-amber-50 p-2">
                  <div className="text-xs text-amber-800">متوسط الزيادة</div>
                  <div className="text-xs font-bold text-amber-900">{formatNumber(stats.averageBidIncrease)} د.ل</div>
                </div>
                <div className="rounded bg-emerald-50 p-2">
                  <div className="text-xs text-emerald-800">معدل المزايدة</div>
                  <div className="text-sm font-bold text-emerald-900">{stats.bidFrequency}/ساعة</div>
                </div>
              </div>
            </div>

            {/* الأجهزة */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-1">نوع الجهاز</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-blue-50 p-2">
                  <div className="flex items-center gap-1">
                    <DevicePhoneMobileIcon className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-800">محمول</span>
                  </div>
                  <div className="text-sm font-bold text-blue-900">
                    {Math.round((stats.mobileViews / stats.totalViews) * 100)}%
                  </div>
                </div>
                <div className="rounded bg-slate-50 p-2">
                  <div className="flex items-center gap-1">
                    <ComputerDesktopIcon className="h-3 w-3 text-slate-600" />
                    <span className="text-xs text-slate-800">مكتب</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {Math.round((stats.desktopViews / stats.totalViews) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* المدن الرئيسية */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-1">أهم المدن</h4>
              <div className="flex flex-wrap gap-1">
                {stats.topCities.slice(0, 3).map((city, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>

            {/* أوقات الذروة */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-1">أوقات الذروة</h4>
              <div className="flex flex-wrap gap-1">
                {stats.peakHours.slice(0, 2).map((hour, index) => (
                  <span
                    key={index}
                    className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800"
                  >
                    {hour}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactDetailedStats;
