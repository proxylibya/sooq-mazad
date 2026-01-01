import React, { useMemo, useState } from 'react';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import { BidderForList } from '../../../../hooks/useBidders';
import { quickDecodeName } from '../../../../utils/universalNameDecoder';

interface SimpleBiddersListProps {
  bidders: BidderForList[];
  currentBid: string | number | null;
  formatNumber: (num: string) => string;
  isOwner?: boolean;
  onAcceptBid?: (bidderId: string, amount: string) => void; // معرف المستخدم الحقيقي (string)
  onContactBidder?: (phone: string) => void; // اختياري - غير مستخدم هنا
  onMessageBidder?: (userId: string, name: string) => void;
  auctionStatus?: 'upcoming' | 'live' | 'ended' | 'sold' | string;
  onRefresh?: () => void; // دالة لإعادة جلب المزايدين
}

const SimpleBiddersList: React.FC<SimpleBiddersListProps> = ({
  bidders,
  currentBid,
  formatNumber,
  isOwner = false,
  onAcceptBid,
  onContactBidder,
  onMessageBidder,
  auctionStatus = 'live',
  onRefresh,
}) => {
  // 🔍 Log تشخيصي لمشكلة المزايدين (معطل لتقليل console spam)
  React.useEffect(() => {
    // console.log('🔍 [SimpleBiddersList] البيانات المستلمة:', {
    //   isOwner,
    //   biddersCount: bidders?.length || 0,
    //   bidders: bidders,
    //   currentBid,
    //   auctionStatus
    // });
  }, [bidders, isOwner, currentBid, auctionStatus]);

  const parseNumericValue = (value: string | number | null | undefined): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[\,\s]/g, '');
      const parsed = parseInt(cleaned, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // ترتيب كامل بدون قصّ، مع إتاحة زر "عرض المزيد" بدلاً من سكرول داخلي
  const sortedAll = useMemo(() => {
    const arr = Array.isArray(bidders) ? bidders.slice() : [];
    return arr.sort((a, b) => parseNumericValue(b.amount) - parseNumericValue(a.amount));
  }, [bidders]);

  const [showAll, setShowAll] = useState(false);
  const MAX_VISIBLE = isOwner ? 9 : 5; // المالك يرى أكثر، الزائر يرى أقل بشكل افتراضي
  const displayed = showAll ? sortedAll : sortedAll.slice(0, MAX_VISIBLE);

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* رأس القائمة الموحد */}
      <div className="flex-shrink-0 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <HandRaisedIcon className="h-6 w-6 text-blue-600" />
            قائمة المزايدين
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              {Array.isArray(bidders) ? bidders.length : 0} مزايد
            </div>
            {/* زر تحديث للمالك - لحل مشكلة عدم ظهور المزايدين */}
            {isOwner && onRefresh && (
              <button
                onClick={onRefresh}
                title="تحديث قائمة المزايدين"
                className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 flex items-center gap-1"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                تحديث
              </button>
            )}
            {sortedAll.length > MAX_VISIBLE && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                {showAll ? 'عرض أقل' : 'عرض المزيد'}
              </button>
            )}
          </div>
        </div>
      </div>

      {(!Array.isArray(displayed) || displayed.length === 0) ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <HandRaisedIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">لا توجد مزايدات حتى الآن</p>
          <p className="mt-1 text-sm text-gray-400">كن أول من يزايد على هذه السيارة</p>
        </div>
      ) : (
        <>
          {/* قائمة صفوف موحدة بدون بطاقات شبكية */}
          <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto">
            {displayed.map((bidder) => (
              <li
                key={bidder.id}
                className={bidder.isWinning ? 'bg-green-50 p-4' : 'p-4'}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* يسار: بيانات المزايد */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {/* Avatar */}
                    {bidder.avatar ? (
                      <div className="h-9 w-9 overflow-hidden rounded-full border border-white shadow-sm flex-shrink-0">
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${bidder.avatar})` }}
                          title={quickDecodeName(bidder.name)}
                        />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                        <UserIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-1">
                        <span className={`truncate text-sm font-semibold ${bidder.isWinning ? 'text-green-700' : 'text-gray-900'}`}>
                          {quickDecodeName(bidder.name)}
                        </span>
                        {bidder.isVerified && (
                          <CheckCircleIcon className="h-4 w-4 text-green-600" title="حساب موثق" />
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <ClockIcon className="h-3.5 w-3.5" />
                        <span>{bidder.timeAgo}</span>
                        {typeof bidder.totalBids === 'number' && bidder.totalBids > 0 && (
                          <span>({bidder.totalBids})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* يمين: المبلغ والفارق */}
                  <div className="flex-shrink-0 text-left sm:text-right">
                    <div className={`text-sm font-bold ${bidder.isWinning ? 'text-green-600' : 'text-gray-800'}`}>
                      {formatNumber(String(bidder.amount || '0'))} د.ل
                    </div>
                    {!bidder.isWinning && currentBid && bidder.amount && (
                      <div className="text-xs text-gray-500">
                        -{formatNumber(String(parseNumericValue(currentBid) - parseNumericValue(bidder.amount)))} د.ل
                      </div>
                    )}
                  </div>
                </div>

                {/* أزرار المالك */}
                {isOwner && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {onMessageBidder && (
                      <button
                        onClick={() => onMessageBidder(bidder.userIdStr, bidder.name)}
                        title="مراسلة المزايد"
                        className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" /> مراسلة
                      </button>
                    )}
                    {bidder.phone && onContactBidder && (
                      <button
                        onClick={() => onContactBidder(bidder.phone as string)}
                        title="اتصال بالمزايد"
                        className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                      >
                        <PhoneIcon className="h-3.5 w-3.5" /> اتصال
                      </button>
                    )}
                    {/* 🎯 زر تأكيد البيع يظهر فقط على أعلى مزايد (الرابح) */}
                    {auctionStatus !== 'sold' && onAcceptBid && bidder.amount && bidder.isWinning && (
                      <button
                        onClick={() => onAcceptBid(bidder.userIdStr, String(bidder.amount))}
                        title="تأكيد البيع لأعلى مزايد"
                        className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:from-emerald-700 hover:to-green-700 shadow-md"
                      >
                        <TrophyIcon className="h-3.5 w-3.5" /> تأكيد البيع
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {sortedAll.length > MAX_VISIBLE && (
            <div className="p-4 text-center">
              <button
                onClick={() => setShowAll((v) => !v)}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                {showAll ? 'عرض أقل' : `عرض المزيد (${sortedAll.length - MAX_VISIBLE})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SimpleBiddersList;
