import React, { useState } from 'react';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import PlayIcon from '@heroicons/react/24/outline/PlayIcon';
import PauseIcon from '@heroicons/react/24/outline/PauseIcon';
import StopIcon from '@heroicons/react/24/outline/StopIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import ChevronUpIcon from '@heroicons/react/24/outline/ChevronUpIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';

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

interface CompactAuctionOwnerPanelProps {
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
  onRelistAuction?: () => void;
}

const CompactAuctionOwnerPanel: React.FC<CompactAuctionOwnerPanelProps> = ({
  isOwner,
  auctionId: _auctionId,
  auctionStatus,
  stats,
  formatNumber,
  onStatusChange,
  onAcceptHighestBid,
  onEndAuction,
  onEditListing,
  onShareListing,
  onViewReports: _onViewReports,
  onRelistAuction,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);

  if (!isOwner) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'ended': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'paused': return 'متوقف مؤقتاً';
      case 'ended': return 'منتهي';
      case 'cancelled': return 'ملغي';
      case 'upcoming': return 'قادم';
      default: return 'غير محدد';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setShowConfirmDialog(newStatus);
  };

  const confirmStatusChange = () => {
    if (showConfirmDialog && onStatusChange) {
      onStatusChange(showConfirmDialog);
      setShowConfirmDialog(null);
    }
  };

  const canPause = auctionStatus === 'active';
  const canResume = auctionStatus === 'paused';
  const canEnd = auctionStatus === 'active' || auctionStatus === 'paused';
  const canCancel = auctionStatus === 'upcoming' || auctionStatus === 'active' || auctionStatus === 'paused';
  const canRelist = auctionStatus === 'ended' && stats && typeof stats.reservePrice === 'number' && typeof stats.highestBid === 'number' && stats.reservePrice > 0 && stats.highestBid < stats.reservePrice;

  return (
    <>
      {/* لوحة تحكم مصغرة */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* الرأس المصغر */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <CogIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">لوحة تحكم المالك</h3>
              <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(auctionStatus)}`}>
                <div className="h-1.5 w-1.5 rounded-full bg-current"></div>
                {getStatusText(auctionStatus)}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800"
          >
            {isExpanded ? (
              <>
                <span>إخفاء</span>
                <ChevronUpIcon className="h-3 w-3" />
              </>
            ) : (
              <>
                <span>عرض</span>
                <ChevronDownIcon className="h-3 w-3" />
              </>
            )}
          </button>
        </div>

        {/* الإحصائيات المصغرة - تظهر دائماً */}
        <div className="p-3 border-b border-slate-100">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-xs text-slate-600 mb-1">مشاهدات</div>
              <div className="text-sm font-bold text-blue-600">{formatNumber(stats.totalViews)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-600 mb-1">مزايدين</div>
              <div className="text-sm font-bold text-green-600">{formatNumber(stats.totalBidders)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-600 mb-1">مزايدات</div>
              <div className="text-sm font-bold text-purple-600">{formatNumber(stats.totalBids)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-600 mb-1">أعلى مزايدة</div>
              <div className="text-xs font-bold text-amber-600">{formatNumber(stats.highestBid)} د.ل</div>
            </div>
          </div>
        </div>

        {/* التفاصيل القابلة للطي */}
        {isExpanded && (
          <div className="p-3 space-y-3">
            {/* أدوات التحكم الأساسية */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">أدوات التحكم</h4>
              <div className="flex flex-wrap gap-1">
                {canPause && (
                  <button
                    onClick={() => handleStatusChange('paused')}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200"
                  >
                    <PauseIcon className="h-3 w-3" />
                    إيقاف
                  </button>
                )}

                {canResume && (
                  <button
                    onClick={() => handleStatusChange('active')}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200"
                  >
                    <PlayIcon className="h-3 w-3" />
                    استئناف
                  </button>
                )}

                {canEnd && onEndAuction && (
                  <button
                    onClick={onEndAuction}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    <StopIcon className="h-3 w-3" />
                    إنهاء
                  </button>
                )}

                {canCancel && (
                  <button
                    onClick={() => handleStatusChange('cancelled')}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    <XMarkIcon className="h-3 w-3" />
                    إلغاء
                  </button>
                )}

                {(auctionStatus === 'active' || auctionStatus === 'ended') && onAcceptHighestBid && (
                  <button
                    onClick={onAcceptHighestBid}
                    title="تأكيد البيع للمزايد الأعلى"
                    className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:from-emerald-700 hover:to-green-700"
                  >
                    {/* أيقونة صغيرة موحّدة */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden={true} className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1-3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                    </svg>
                    تأكيد البيع
                  </button>
                )}

                {canRelist && onRelistAuction && (
                  <button
                    onClick={onRelistAuction}
                    title="إعادة طرح المزاد"
                    className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:from-indigo-700 hover:to-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden={true} className="h-3.5 w-3.5">
                      <path d="M12 5c3.866 0 7 3.134 7 7h2.5l-3.5 3.5L14.5 12H17a5 5 0 1 0-5 5 4.98 4.98 0 0 0 3.536-1.464l1.414 1.414A7 7 0 1 1 12 5z" />
                    </svg>
                    إعادة طرح المزاد
                  </button>
                )}
              </div>
            </div>

            {/* خيارات إضافية */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">خيارات إضافية</h4>
              <div className="flex gap-1">
                {onEditListing && (
                  <button
                    onClick={onEditListing}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    <PencilIcon className="h-3 w-3" />
                    تعديل
                  </button>
                )}

                {onShareListing && (
                  <button
                    onClick={onShareListing}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    <ShareIcon className="h-3 w-3" />
                    مشاركة
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* نافذة التأكيد */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">تأكيد العملية</h3>
            <p className="text-xs text-gray-600 mb-4">
              هل أنت متأكد من تغيير حالة المزاد إلى "{getStatusText(showConfirmDialog)}"؟
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmStatusChange}
                className="flex-1 rounded px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                تأكيد
              </button>
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="flex-1 rounded px-3 py-2 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
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

export default CompactAuctionOwnerPanel;
