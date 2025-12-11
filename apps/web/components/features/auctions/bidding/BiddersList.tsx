import React, { useState, useMemo } from 'react';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import ArrowUpIcon from '@heroicons/react/24/outline/ArrowUpIcon';
import ArrowDownIcon from '@heroicons/react/24/outline/ArrowDownIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import EyeSlashIcon from '@heroicons/react/24/outline/EyeSlashIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import ShoppingCartIcon from '@heroicons/react/24/outline/ShoppingCartIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import { quickDecodeName } from '../../../../utils/universalNameDecoder';
import {
  CheckCircleIcon as CheckCircleSolid,
  StarIcon as StarSolid,
} from '@heroicons/react/24/solid';
import BidderDetailsModal from '../../../modals/BidderDetailsModal';
import { BidderForList } from '../../../../hooks/useBidders';

interface BiddersListProps {
  bidders: BidderForList[];
  currentBid: string | number | null;
  formatNumber: (num: string) => string;
  isOwner?: boolean; // هل المستخدم الحالي هو صاحب الإعلان
  onAcceptBid?: (bidderId: number | string, amount: string) => void; // دالة تأكيد البيع
  onContactBidder?: (phone: string) => void; // دالة الاتصال بالمزايد
}

const BiddersList: React.FC<BiddersListProps> = ({
  bidders,
  currentBid,
  formatNumber,
  isOwner = false,
  onAcceptBid,
  onContactBidder,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState<{
    bidderId: number | string;
    bidderName: string;
    amount: string;
  } | null>(null);
  
  // حالة modal تفاصيل المزايد
  const [selectedBidder, setSelectedBidder] = useState<BidderForList | null>(null);
  const [showBidderDetails, setShowBidderDetails] = useState(false);

  // دالة للتعامل مع طلب تأكيد البيع
  const handleAcceptBidRequest = (bidderId: number | string, bidderName: string, amount: string) => {
    setShowConfirmModal({ bidderId, bidderName, amount });
  };

  // دالة تأكيد البيع النهائية
  const confirmAcceptBid = () => {
    if (showConfirmModal && onAcceptBid) {
      onAcceptBid(showConfirmModal.bidderId, showConfirmModal.amount);
      setShowConfirmModal(null);
    }
  };

  // دالة فتح تفاصيل المزايد
  const handleBidderClick = (bidder: BidderForList) => {
    setSelectedBidder(bidder);
    setShowBidderDetails(true);
  };

  // دالة إغلاق تفاصيل المزايد
  const closeBidderDetails = () => {
    setSelectedBidder(null);
    setShowBidderDetails(false);
  };

  // دالة مساعدة لتحويل القيم إلى أرقام
  const parseNumericValue = (value: string | number | null | undefined): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[,\s]/g, '');
      const parsed = parseInt(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const [showAllBidders, setShowAllBidders] = useState(false);
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedBidders = useMemo(() => {
    const filtered = showOnlyVerified ? bidders.filter((b) => b.isVerified) : bidders;

    return filtered.sort((a, b) => {
      const amountA = parseNumericValue(a.amount);
      const amountB = parseNumericValue(b.amount);
      return sortOrder === 'desc' ? amountB - amountA : amountA - amountB;
    });
  }, [bidders, showOnlyVerified, sortOrder]);

  const displayedBidders = showAllBidders ? sortedBidders : sortedBidders.slice(0, 5);

  // دالة لعرض التقييم بالنجوم
  const renderRating = (rating: number = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i}>
          {i <= rating ? (
            <StarSolid className="h-2.5 w-2.5 text-yellow-400" />
          ) : (
            <StarIcon className="h-2.5 w-2.5 text-gray-300" />
          )}
        </span>,
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  // حساب نص نطاق المزايدة مسبقاً لتبسيط JSX ومنع مشاكل parsing
  const rangeText = useMemo(() => {
    try {
      const amounts = bidders
        .filter((b) => b.amount)
        .map((b) => parseNumericValue(b.amount));
      if (amounts.length === 0) return '0';
      const range = Math.max(...amounts) - Math.min(...amounts);
      return formatNumber(range.toString());
    } catch {
      return '0';
    }
  }, [bidders, formatNumber]);

  // دالة لتنسيق الاسم (الاسم الأول واللقب فقط)
  const formatName = (fullName: string) => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
    }
    return fullName;
  };

  // دوال مساعدة محذوفة لتقليل التحذيرات - متاحة في BidderDetailsModal

  // getBidderCardStyle removed: simplified row design

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <HandRaisedIcon className="h-6 w-6 text-blue-600" />
            قائمة المزايدين
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              {displayedBidders.length} من {bidders.length} مزايد
            </div>
            <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnlyVerified(!showOnlyVerified)}
              className={`rounded-lg p-2 transition-colors ${
                showOnlyVerified
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={showOnlyVerified ? 'عرض جميع المزايدين' : 'عرض المزايدين الموثقين فقط'}
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>

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

            {bidders.length > 5 && (
              <button
                onClick={() => setShowAllBidders(!showAllBidders)}
                className="rounded-lg bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
                title={showAllBidders ? 'عرض أقل' : 'عرض الكل'}
              >
                {showAllBidders ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            )}
            </div>
          </div>
        </div>
      </div>

      {sortedBidders.length === 0 ? (
        <div className="p-6 text-center">
          <HandRaisedIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">لا توجد مزايدات حتى الآن</p>
          <p className="mt-1 text-sm text-gray-400">كن أول من يزايد على هذه السيارة!</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {displayedBidders.map((bidder, index) => (
            <li
              key={bidder.id}
              className={`p-4 transition-colors hover:bg-gray-50 ${bidder.isWinning ? 'bg-green-50' : ''}`}
              onClick={() => handleBidderClick(bidder)}
              title="انقر لعرض تفاصيل المزايد"
            >
              <div className="flex items-center justify-between gap-3">
                {/* اليسار: بيانات المزايد */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {bidder.avatar ? (
                      <div className="h-7 w-7 overflow-hidden rounded-full border border-white shadow-sm">
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${bidder.avatar})` }}
                          title={quickDecodeName(bidder.name)}
                        />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
                        <UserIcon className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                    )}
                    {bidder.isVerified && (
                      <CheckCircleSolid className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-white text-blue-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-1">
                      <span className={`truncate text-xs font-semibold ${bidder.isWinning ? 'text-green-700' : 'text-gray-900'}`}>
                        {formatName(quickDecodeName(bidder.name))}
                      </span>
                      {bidder.isVerified ? (
                        <CheckCircleSolid className="h-4 w-4 text-green-600" title="حساب موثق" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-600" title="حساب غير موثق" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-0.5">
                        {renderRating(bidder.rating)}
                        <span>({bidder.rating || 0})</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <ClockIcon className="h-2.5 w-2.5" />
                        <span>{bidder.timeAgo}</span>
                      </div>
                      {bidder.totalBids && (
                        <div className="flex items-center gap-0.5">
                          <HandRaisedIcon className="h-2.5 w-2.5" />
                          <span>{bidder.totalBids}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* اليمين: السعر وزر القبول */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="text-right">
                    <div className={`text-sm font-bold ${bidder.isWinning ? 'text-green-600' : 'text-gray-700'}`}>
                      {formatNumber(bidder.amount || '0')} د.ل
                    </div>
                    {bidder.increaseAmount && (
                      <div className="text-xs text-gray-500">(+{formatNumber(bidder.increaseAmount)} د.ل)</div>
                    )}
                    {bidder.isWinning && (
                      <div className="mt-0.5 flex items-center justify-end gap-0.5 text-xs font-medium text-green-600">
                        <TrophyIcon className="h-2.5 w-2.5" />
                        رابح
                      </div>
                    )}
                    {index === 1 && !bidder.isWinning && (
                      <div className="mt-0.5 text-xs font-medium text-blue-600">ثاني</div>
                    )}
                    {index === 2 && !bidder.isWinning && (
                      <div className="mt-0.5 text-xs font-medium text-orange-600">ثالث</div>
                    )}
                  </div>
                  {isOwner && onAcceptBid && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // تمرير المعرف النصّي الحقيقي إن توفر
                        const realId = bidder.userIdStr || bidder.id;
                        handleAcceptBidRequest(realId, bidder.name, bidder.amount || '0');
                      }}
                      className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium transition-all duration-200 ${bidder.isWinning ? 'bg-green-600 text-white shadow-sm hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      title={`تأكيد البيع بسعر ${formatNumber(bidder.amount || '0')} د.ل`}
                    >
                      <ShoppingCartIcon className="h-2.5 w-2.5" />
                      {bidder.isWinning ? 'تأكيد' : 'قبول'}
                    </button>
                  )}
                </div>
              </div>

              {!bidder.isWinning && currentBid && bidder.amount && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>الفرق عن المزايدة الرابحة</span>
                    <span>
                      -{formatNumber((parseNumericValue(currentBid) - parseNumericValue(bidder.amount)).toString())} د.ل
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${(parseNumericValue(bidder.amount) / parseNumericValue(currentBid)) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {!showAllBidders && bidders.length > 5 && (
        <div className="p-4 text-center">
          <button
            onClick={() => setShowAllBidders(true)}
            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            عرض جميع المزايدين ({bidders.length - 5} أكثر)
          </button>
        </div>
      )}

      {showAllBidders && bidders.length > 5 && (
        <div className="p-4 text-center">
          <button
            onClick={() => setShowAllBidders(false)}
            className="rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            عرض أقل
          </button>
        </div>
      )}

      {bidders.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{bidders.length}</div>
              <div className="text-xs text-gray-500">إجمالي المزايدين</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {bidders.filter((b) => b.isVerified).length}
              </div>
              <div className="text-xs text-gray-500">مزايدين موثقين</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {bidders.filter((b) => !b.isVerified).length}
              </div>
              <div className="text-xs text-gray-500">غير موثقين</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {rangeText}
                <span className="text-sm"> د.ل</span>
              </div>
              <div className="text-xs text-gray-500">نطاق المزايدة</div>
            </div>
          </div>
        </div>
      )}

      {/* قائمة منبثقة صغيرة لتأكيد البيع */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="mx-4 w-80 rounded-lg bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-medium text-gray-900">تأكيد البيع</h3>
            </div>

            <div className="mb-4">
              <p className="mb-3 text-sm text-gray-600">
                هل تريد تأكيد البيع لـ{' '}
                <span className="font-medium">{showConfirmModal.bidderName}</span> بسعر{' '}
                <span className="font-bold text-green-600">
                  {formatNumber(showConfirmModal.amount)} د.ل
                </span>
                ؟
              </p>

              <div className="rounded-md bg-amber-50 p-2">
                <p className="text-xs text-amber-700">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" /> لا يمكن التراجع عن
                  هذا الإجراء
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={confirmAcceptBid}
                className="flex-1 rounded-md bg-green-600 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                تأكيد
              </button>
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 rounded-md bg-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal تفاصيل المزايد */}
      <BidderDetailsModal
        bidder={selectedBidder}
        isOpen={showBidderDetails}
        onClose={closeBidderDetails}
        formatNumber={formatNumber}
        isOwner={isOwner}
        onAcceptBid={onAcceptBid}
        onContactBidder={onContactBidder}
      />
    </div>
  );
};

export default BiddersList;
