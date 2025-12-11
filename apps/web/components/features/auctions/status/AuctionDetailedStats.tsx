import React, { useState } from 'react';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import ArrowTrendingUpIcon from '@heroicons/react/24/outline/ArrowTrendingUpIcon';
import ArrowTrendingDownIcon from '@heroicons/react/24/outline/ArrowTrendingDownIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import DevicePhoneMobileIcon from '@heroicons/react/24/outline/DevicePhoneMobileIcon';
import ComputerDesktopIcon from '@heroicons/react/24/outline/ComputerDesktopIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import { ChartBarIcon as ChartBarSolid, EyeIcon as EyeSolid } from '@heroicons/react/24/solid';

interface DetailedStats {
  // إحصائيات المشاهدة
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  viewsThisWeek: number;
  averageViewDuration: string;

  // إحصائيات المزايدين
  totalBidders: number;
  verifiedBidders: number;
  newBiddersToday: number;
  returningBidders: number;

  // إحصائيات المزايدات
  totalBids: number;
  bidsToday: number;
  averageBidIncrease: number;
  highestBid: number;
  lowestBid: number;
  bidFrequency: number; // مزايدات في الساعة

  // إحصائيات التفاعل
  watchlistCount: number;
  sharesCount: number;
  inquiriesCount: number;
  phoneCallsCount: number;

  // إحصائيات الجهاز والموقع
  mobileViews: number;
  desktopViews: number;
  topCities: string[];

  // إحصائيات الوقت
  peakHours: string[];
  timeRemaining: string;
  auctionDuration: string;
}

interface AuctionDetailedStatsProps {
  stats: DetailedStats;
  formatNumber: (num: string | number) => string;
  isVisible: boolean;
  onToggle: () => void;
}

const AuctionDetailedStats: React.FC<AuctionDetailedStatsProps> = ({
  stats,
  formatNumber,
  isVisible,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'technical'>('overview');

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
    trend,
    color = 'blue',
  }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'blue' | 'green' | 'amber' | 'slate' | 'teal' | 'yellow' | 'purple' | 'red';
  }) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      amber: 'text-amber-600 bg-amber-50 border-amber-200',
      slate: 'text-slate-600 bg-slate-50 border-slate-200',
      teal: 'text-teal-600 bg-teal-50 border-teal-200',
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      red: 'text-red-600 bg-red-50 border-red-200',
    } as const;

    return (
      <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <div className="text-lg font-bold text-gray-900">{formatNumber(value)}</div>
              <div className="text-xs text-gray-600">{title}</div>
            </div>
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs ${
                trend === 'up'
                  ? 'text-green-600'
                  : trend === 'down'
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {trend === 'up' && <ArrowTrendingUpIcon className="h-3 w-3" />}
              {trend === 'down' && <ArrowTrendingDownIcon className="h-3 w-3" />}
              {subtitle}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isVisible) {
    return (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <button onClick={onToggle} className="flex w-full items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">الإحصائيات التفصيلية</span>
          </div>
          <div className="text-sm text-gray-500">انقر لعرض التفاصيل</div>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <ChartBarSolid className="h-6 w-6 text-blue-600" />
          الإحصائيات التفصيلية
        </h3>
        <button onClick={onToggle} className="text-sm text-gray-500 hover:text-gray-700">
          إخفاء
        </button>
      </div>

      {/* التبويبات */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          نظرة عامة
        </button>
        <button
          onClick={() => setActiveTab('engagement')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'engagement'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          التفاعل
        </button>
        <button
          onClick={() => setActiveTab('technical')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'technical'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          تقني
        </button>
      </div>

      {/* محتوى التبويبات */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* إحصائيات المشاهدة */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">إحصائيات المشاهدة</h4>
            <div className="grid grid-cols-1 gap-3">
              <StatCard
                icon={<EyeSolid className="h-5 w-5" />}
                title="إجمالي المشاهدات"
                value={stats.totalViews}
                color="blue"
              />
              <StatCard
                icon={<UserGroupIcon className="h-5 w-5" />}
                title="زوار فريدون"
                value={stats.uniqueVisitors}
                color="green"
              />
              <StatCard
                icon={<ClockIcon className="h-5 w-5" />}
                title="مشاهدات اليوم"
                value={stats.viewsToday}
                trend="up"
                subtitle="+12%"
                color="yellow"
              />
              <StatCard
                icon={<CalendarIcon className="h-5 w-5" />}
                title="مشاهدات الأسبوع"
                value={stats.viewsThisWeek}
                color="purple"
              />
            </div>
          </div>

          {/* إحصائيات المزايدات */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">إحصائيات المزايدات</h4>
            <div className="grid grid-cols-1 gap-3">
              <StatCard
                icon={<HandRaisedIcon className="h-5 w-5" />}
                title="إجمالي المزايدات"
                value={stats.totalBids}
                color="blue"
              />
              <StatCard
                icon={<UserGroupIcon className="h-5 w-5" />}
                title="المزايدين"
                value={stats.totalBidders}
                color="green"
              />
              <StatCard
                icon={<CurrencyDollarIcon className="h-5 w-5" />}
                title="أعلى مزايدة"
                value={`${formatNumber(stats.highestBid)} د.ل`}
                color="yellow"
              />
              <StatCard
                icon={<ArrowTrendingUpIcon className="h-5 w-5" />}
                title="متوسط الزيادة"
                value={`${formatNumber(stats.averageBidIncrease)} د.ل`}
                color="purple"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'engagement' && (
        <div className="space-y-6">
          {/* إحصائيات التفاعل */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">التفاعل والاهتمام</h4>
            <div className="grid grid-cols-1 gap-3">
              <StatCard
                icon={<HeartIcon className="h-5 w-5" />}
                title="قائمة المتابعة"
                value={stats.watchlistCount}
                color="red"
              />
              <StatCard
                icon={<ShareIcon className="h-5 w-5" />}
                title="المشاركات"
                value={stats.sharesCount}
                color="blue"
              />
              <StatCard
                icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
                title="الاستفسارات"
                value={stats.inquiriesCount}
                color="green"
              />
              <StatCard
                icon={<PhoneIcon className="h-5 w-5" />}
                title="المكالمات"
                value={stats.phoneCallsCount}
                color="yellow"
              />
            </div>
          </div>

          {/* أوقات الذروة */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">أوقات الذروة</h4>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex flex-wrap gap-2">
                {stats.peakHours.map((hour, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                  >
                    {hour}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'technical' && (
        <div className="space-y-6">
          {/* إحصائيات الأجهزة */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">نوع الجهاز</h4>
            <div className="grid grid-cols-1 gap-3">
              <StatCard
                icon={<DevicePhoneMobileIcon className="h-5 w-5" />}
                title="الهاتف المحمول"
                value={`${Math.round((stats.mobileViews / stats.totalViews) * 100)}%`}
                subtitle={`${formatNumber(stats.mobileViews)} مشاهدة`}
                color="blue"
              />
              <StatCard
                icon={<ComputerDesktopIcon className="h-5 w-5" />}
                title="سطح المكتب"
                value={`${Math.round((stats.desktopViews / stats.totalViews) * 100)}%`}
                subtitle={`${formatNumber(stats.desktopViews)} مشاهدة`}
                color="green"
              />
            </div>
          </div>

          {/* أهم المدن */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">أهم المدن</h4>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="space-y-2">
                {stats.topCities.map((city, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{city}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDetailedStats;
