import React, { useState } from 'react';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PauseIcon from '@heroicons/react/24/outline/PauseIcon';
import PlayIcon from '@heroicons/react/24/outline/PlayIcon';
import StopIcon from '@heroicons/react/24/outline/StopIcon';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import ChartPieIcon from '@heroicons/react/24/outline/ChartPieIcon';
import { ProfessionalIcons, ProfessionalBadges } from './ui/ProfessionalIcons';
import {
  CheckCircleIcon as CheckCircleSolid,
  BellIcon as BellSolid,
} from '@heroicons/react/24/solid';
import AuctionNotifications from './AuctionNotifications';
import { AuctionReportsCard } from './ReportsCard';

interface AuctionStats {
  totalViews: number;
  uniqueVisitors: number;
  totalBidders: number;
  verifiedBidders: number;
  totalBids: number;
  averageBidIncrease: number;
  highestBid: number;
  reservePrice: number;
  timeRemaining: string;
  watchlistCount: number;
}

interface AuctionOwnerPanelProps {
  isOwner: boolean;
  auctionId: string | number;
  auctionStatus: 'upcoming' | 'active' | 'ended' | 'cancelled' | 'paused';
  stats: AuctionStats;
  formatNumber: (num: string | number) => string;
  onStatusChange?: (newStatus: string) => void;
  onAcceptHighestBid?: () => void;
  onEndAuction?: () => void;
  onEditListing?: () => void;
  onShareListing?: () => void;
  onViewReports?: () => void;
}

const AuctionOwnerPanel: React.FC<AuctionOwnerPanelProps> = ({
  isOwner,
  auctionId,
  auctionStatus,
  stats,
  formatNumber,
  onStatusChange,
  onAcceptHighestBid,
  onEndAuction,
  onEditListing,
  onShareListing,
  onViewReports,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // إذا لم يكن المستخدم هو المالك، لا نعرض اللوحة
  if (!isOwner) return null;

  const handleStatusChange = (newStatus: string) => {
    setShowConfirmDialog(newStatus);
  };

  const confirmStatusChange = () => {
    if (showConfirmDialog && onStatusChange) {
      onStatusChange(showConfirmDialog);
      setShowConfirmDialog(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'ended':
        return 'text-gray-600 bg-gray-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'upcoming':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'paused':
        return 'متوقف مؤقتاً';
      case 'ended':
        return 'منتهي';
      case 'cancelled':
        return 'ملغي';
      case 'upcoming':
        return 'قادم';
      default:
        return 'غير محدد';
    }
  };

  const canPause = auctionStatus === 'active';
  const canResume = auctionStatus === 'paused';
  const canEnd = auctionStatus === 'active' || auctionStatus === 'paused';
  const canCancel =
    auctionStatus === 'upcoming' || auctionStatus === 'active' || auctionStatus === 'paused';

  return (
    <>
      {/* لوحة تحكم المالك - تصميم جديد ومحسن */}
      <div className="w-full max-w-none overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        {/* رأس اللوحة */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                <CogIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">لوحة تحكم المالك</h3>
                <p className="text-sm text-slate-600">إدارة وتتبع مزادك</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusColor(auctionStatus)}`}
              >
                <div className="h-2 w-2 rounded-full bg-current"></div>
                {getStatusText(auctionStatus)}
              </div>

              <AuctionNotifications
                auctionId={auctionId.toString()}
                isOwner={isOwner}
                isEnabled={notificationsEnabled}
                onToggle={setNotificationsEnabled}
              />
            </div>
          </div>
        </div>

        {/* قسم الإحصائيات */}
        <div className="p-6">
          <div className="mb-6">
            <h4 className="mb-4 text-base font-semibold text-slate-900">الإحصائيات الحية</h4>
            <div className="grid grid-cols-1 gap-4">
              {/* مشاهدات */}
              <div className="group relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 p-4 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-blue-900 sm:text-xl lg:text-2xl">
                      {formatNumber(stats.totalViews)}
                    </p>
                    <p className="whitespace-nowrap text-xs font-medium text-blue-700 sm:text-sm lg:text-base">
                      مشاهدة
                    </p>
                  </div>
                  <div className="flex-shrink-0 rounded-lg bg-blue-600 p-3">
                    <ProfessionalIcons.Views className="h-4 w-4 text-white sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
              </div>

              {/* مزايدين */}
              <div className="group relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-emerald-900 sm:text-xl lg:text-2xl">
                      {formatNumber(stats.totalBidders)}
                    </p>
                    <p className="whitespace-nowrap text-xs font-medium text-emerald-700 sm:text-sm lg:text-base">
                      مزايد
                    </p>
                  </div>
                  <div className="flex-shrink-0 rounded-lg bg-emerald-600 p-3">
                    <ProfessionalIcons.Bidders className="h-4 w-4 text-white sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
              </div>

              {/* مزايدات */}
              <div className="group relative overflow-hidden rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100 p-4 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-purple-900 sm:text-xl lg:text-2xl">
                      {formatNumber(stats.totalBids)}
                    </p>
                    <p className="whitespace-nowrap text-xs font-medium text-purple-700 sm:text-sm lg:text-base">
                      مزايدة
                    </p>
                  </div>
                  <div className="flex-shrink-0 rounded-lg bg-purple-600 p-3">
                    <ProfessionalIcons.Bidding className="h-4 w-4 text-white sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
              </div>

              {/* أعلى مزايدة */}
              <div className="group relative overflow-hidden rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100 p-4 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-amber-900 sm:text-xl lg:text-2xl">
                      {formatNumber(stats.highestBid)} د.ل
                    </p>
                    <p className="whitespace-nowrap text-xs font-medium text-amber-700 sm:text-sm lg:text-base">
                      أعلى مزايدة
                    </p>
                  </div>
                  <div className="flex-shrink-0 rounded-lg bg-amber-600 p-3">
                    <ProfessionalIcons.Price className="h-4 w-4 text-white sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
              </div>
            </div>
          </div>

          {/* أدوات التحكم الرئيسية */}
          <div className="mb-6">
            <h4 className="mb-4 text-base font-semibold text-slate-900">أدوات التحكم</h4>
            <div className="flex flex-wrap gap-3">
              {canPause && (
                <button
                  onClick={() => handleStatusChange('paused')}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow-md"
                >
                  <PauseIcon className="h-4 w-4" />
                  إيقاف مؤقت
                </button>
              )}

              {canResume && (
                <button
                  onClick={() => handleStatusChange('active')}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                >
                  <PlayIcon className="h-4 w-4" />
                  استئناف المزاد
                </button>
              )}

              {canEnd && onEndAuction && (
                <button
                  onClick={onEndAuction}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
                >
                  <StopIcon className="h-4 w-4" />
                  إنهاء المزاد
                </button>
              )}

              {canCancel && (
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
                >
                  <XMarkIcon className="h-4 w-4" />
                  إلغاء المزاد
                </button>
              )}

              {auctionStatus === 'active' && onAcceptHighestBid && (
                <button
                  onClick={onAcceptHighestBid}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-green-700 hover:to-emerald-700 hover:shadow-md"
                >
                  <TrophyIcon className="h-4 w-4" />
                  قبول أعلى مزايدة
                </button>
              )}
            </div>
          </div>

          {/* الخيارات الإضافية */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">خيارات إضافية</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {onEditListing && (
                <button
                  onClick={onEditListing}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
                >
                  <PencilIcon className="h-4 w-4" />
                  تعديل
                </button>
              )}

              {onShareListing && (
                <button
                  onClick={onShareListing}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
                >
                  <ShareIcon className="h-4 w-4" />
                  مشاركة
                </button>
              )}

              {onViewReports && (
                <button
                  onClick={onViewReports}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
                >
                  <ChartPieIcon className="h-4 w-4" />
                  تقارير
                </button>
              )}

              <button
                onClick={() => window.open(`/auction/${auctionId}/analytics`, '_blank')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
              >
                <DocumentTextIcon className="h-4 w-4" />
                تحليلات
              </button>
            </div>
          </div>

          {/* تقرير سريع */}
          <div className="mt-6">
            <AuctionReportsCard
              totalViews={stats.totalViews}
              totalBidders={stats.totalBidders}
              totalBids={stats.totalBids}
              highestBid={stats.highestBid}
              onViewDetails={onViewReports}
              className="border-0 bg-gradient-to-r from-slate-50 to-gray-50"
            />
          </div>
        </div>
      </div>

      {/* نافذة التأكيد */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">تأكيد العملية</h3>
            </div>

            <p className="mb-6 text-gray-600">
              هل أنت متأكد من تغيير حالة المزاد إلى "{getStatusText(showConfirmDialog)}"؟
              {showConfirmDialog === 'cancelled' && (
                <span className="mt-2 block text-sm text-red-600">
                  تحذير: لا يمكن التراجع عن إلغاء المزاد.
                </span>
              )}
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmStatusChange}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                تأكيد
              </button>
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="flex-1 rounded-lg bg-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuctionOwnerPanel;
