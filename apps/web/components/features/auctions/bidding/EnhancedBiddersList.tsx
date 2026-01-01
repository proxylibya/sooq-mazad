import ArrowDownIcon from '@heroicons/react/24/outline/ArrowDownIcon';
import ArrowUpIcon from '@heroicons/react/24/outline/ArrowUpIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import EyeSlashIcon from '@heroicons/react/24/outline/EyeSlashIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import React, { useMemo, useState } from 'react';

interface Bidder {
  id: number;
  name: string;
  amount: string | null;
  increaseAmount?: string;
  timestamp: Date;
  isWinning: boolean;
  isVerified: boolean;
  avatar?: string;
  bidRank: number;
  timeAgo: string;
  rating?: number;
  totalBids?: number;
  joinDate?: string;
  phone?: string;
}

interface EnhancedBiddersListProps {
  bidders: Bidder[];
  currentBid: string | number | null;
  formatNumber: (num: string) => string;
  isOwner?: boolean;
  onAcceptBid?: (bidderId: number, amount: string) => void;
  compact?: boolean;
}

const EnhancedBiddersList: React.FC<EnhancedBiddersListProps> = ({
  bidders,
  currentBid,
  formatNumber,
  isOwner = false,
  onAcceptBid,
  compact = false,
}) => {
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAllBidders, setShowAllBidders] = useState(false);

  // فلترة وترتيب المزايدين
  const sortedBidders = useMemo(() => {
    const filtered = showVerifiedOnly ? bidders.filter((b) => b.isVerified) : bidders;

    return filtered.sort((a, b) => {
      const amountA = parseFloat(a.amount || '0');
      const amountB = parseFloat(b.amount || '0');
      return sortOrder === 'desc' ? amountB - amountA : amountA - amountB;
    });
  }, [bidders, showVerifiedOnly, sortOrder]);

  // عرض عدد محدود من المزايدين في الوضع المدمج
  const displayedBidders = compact && !showAllBidders ? sortedBidders.slice(0, 5) : sortedBidders;

  // تحديد نمط البطاقة حسب الترتيب
  const getBidderCardStyle = (bidder: Bidder, index: number) => {
    if (bidder.isWinning) {
      return 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-md';
    }
    if (index === 0 && !bidder.isWinning) {
      return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm';
    }
    if (index === 1) {
      return 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200';
    }
    return 'bg-white border border-gray-100 hover:border-gray-200';
  };

  // أيقونة الترتيب
  const getRankIcon = (index: number, isWinning: boolean) => {
    if (isWinning) {
      return <TrophyIcon className="h-5 w-5 text-green-600" />;
    }
    if (index === 0) {
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold leading-none text-white">
          1
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-500 text-xs font-bold leading-none text-white">
          2
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-xs font-bold leading-none text-white">
          3
        </div>
      );
    }
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs font-bold leading-none text-gray-600">
        {index + 1}
      </div>
    );
  };

  if (sortedBidders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="py-8 text-center">
          <HandRaisedIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">لا توجد مزايدات حتى الآن</h3>
          <p className="mb-4 text-gray-500">كن أول من يزايد على هذه السيارة!</p>
          <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <TrophyIcon className="h-4 w-4" />
            <span>فرصة للفوز بأفضل سعر</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* رأس القائمة */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <HandRaisedIcon className="h-6 w-6 text-blue-600" />
            قائمة المزايدين
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-500">
              {displayedBidders.length} من {bidders.length} مزايد
            </div>
            <div className="flex items-center gap-2">
              {/* فلتر المزايدين الموثقين */}
              <button
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className={`rounded-lg p-2 transition-colors ${
                  showVerifiedOnly
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="عرض المزايدين الموثقين فقط"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>

              {/* ترتيب المزايدات */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="rounded-lg bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
                title={sortOrder === 'desc' ? 'ترتيب من الأقل للأعلى' : 'ترتيب من الأعلى للأقل'}
              >
                {sortOrder === 'desc' ? (
                  <ArrowDownIcon className="h-4 w-4" />
                ) : (
                  <ArrowUpIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة المزايدين */}
      <div className="p-4">
        <div className="custom-scrollbar max-h-96 space-y-3 overflow-y-auto">
          {displayedBidders.map((bidder, index) => (
            <div
              key={bidder.id}
              className={`rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getBidderCardStyle(bidder, index)}`}
            >
              <div className="flex items-center justify-between">
                {/* معلومات المزايد */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">{getRankIcon(index, bidder.isWinning)}</div>

                  <div className="flex items-center gap-3">
                    {/* صورة المزايد */}
                    <div className="relative">
                      {bidder.avatar ? (
                        <img
                          src={bidder.avatar}
                          alt={bidder.name}
                          className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white shadow-sm">
                          {bidder.name.charAt(0)}
                        </div>
                      )}

                      {/* شارة التوثيق */}
                      {bidder.isVerified && (
                        <div className="absolute -bottom-1 -right-1">
                          <CheckCircleSolid className="h-4 w-4 rounded-full bg-white text-green-500" />
                        </div>
                      )}
                    </div>

                    {/* اسم المزايد ومعلوماته */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{bidder.name}</span>
                        {bidder.isWinning && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            <TrophyIcon className="h-3 w-3" />
                            الفائز حالياً
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3" />
                        <span>{bidder.timeAgo}</span>
                        {bidder.totalBids && (
                          <>
                            <span>•</span>
                            <span>{bidder.totalBids} مزايدة سابقة</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* مبلغ المزايدة */}
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {bidder.amount ? formatNumber(bidder.amount) : '---'} د.ل
                  </div>
                  {bidder.increaseAmount && (
                    <div className="text-xs font-medium text-green-600">
                      +{formatNumber(bidder.increaseAmount)} زيادة
                    </div>
                  )}
                </div>
              </div>

              {/* أزرار المالك */}
              {isOwner && onAcceptBid && bidder.amount && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <button
                    onClick={() => onAcceptBid(bidder.id, bidder.amount!)}
                    className="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-md"
                  >
                    قبول المزايدة وإنهاء المزاد
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* زر عرض المزيد */}
        {compact && sortedBidders.length > 5 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAllBidders(!showAllBidders)}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              {showAllBidders ? (
                <>
                  <EyeSlashIcon className="h-4 w-4" />
                  عرض أقل
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4" />
                  عرض جميع المزايدين ({sortedBidders.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* إحصائيات المزايدين */}
      {bidders.length > 0 && (
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4">
          <div className="grid grid-cols-4 gap-2 text-center sm:gap-4">
            <div>
              <div className="text-base font-bold text-gray-900 sm:text-lg">{bidders.length}</div>
              <div className="text-xs text-gray-500">إجمالي المزايدين</div>
            </div>
            <div>
              <div className="text-base font-bold text-green-600 sm:text-lg">
                {bidders.filter((b) => b.isVerified).length}
              </div>
              <div className="text-xs text-gray-500">مزايدين موثقين</div>
            </div>
            <div>
              <div className="text-base font-bold text-red-600 sm:text-lg">
                {bidders.filter((b) => !b.isVerified).length}
              </div>
              <div className="text-xs text-gray-500">غير موثقين</div>
            </div>
            <div>
              <div className="text-base font-bold text-blue-600 sm:text-lg">
                {(() => {
                  const amounts = bidders.filter((b) => b.amount).map((b) => parseFloat(b.amount!));
                  if (amounts.length === 0) return '0';
                  const min = Math.min(...amounts);
                  const max = Math.max(...amounts);
                  return min === max
                    ? formatNumber(min.toString())
                    : `${formatNumber(min.toString())}-${formatNumber(max.toString())}`;
                })()}
                <span className="text-sm"> د.ل</span>
              </div>
              <div className="text-xs text-gray-500">نطاق المزايدة</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedBiddersList;
