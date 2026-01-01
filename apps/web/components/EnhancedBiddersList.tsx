// removed unused CheckIcon import

import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import React, { useMemo, useState } from 'react';
// removed unused XCircleIcon import
import ArrowDownIcon from '@heroicons/react/24/outline/ArrowDownIcon';
import ArrowUpIcon from '@heroicons/react/24/outline/ArrowUpIcon';
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import EyeSlashIcon from '@heroicons/react/24/outline/EyeSlashIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
// removed unused CurrencyDollarIcon and FunnelIcon imports
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import {
  CheckCircleIcon as CheckCircleSolid,
  TrophyIcon as TrophySolid,
} from '@heroicons/react/24/solid';
import { maskLibyanPhoneFirst7Xxx } from '../utils/phoneUtils';
import { quickDecodeName } from '../utils/universalNameDecoder';

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
  userIdStr?: string; // معرف المستخدم الحقيقي كنص إن توفر
}

interface EnhancedBiddersListProps {
  bidders: Bidder[];
  currentBid: string | number | null;
  formatNumber: (num: string) => string;
  isOwner?: boolean;
  onAcceptBid?: (bidderId: number | string, bidAmount: string) => void;
  compact?: boolean;
  isConfirmingSale?: boolean;
}

const EnhancedBiddersList: React.FC<EnhancedBiddersListProps> = ({
  bidders,
  currentBid: _currentBid,
  formatNumber,
  isOwner = false,
  onAcceptBid,
  compact = false,
  isConfirmingSale = false,
}) => {
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAllBidders, setShowAllBidders] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBidder, setSelectedBidder] = useState<Bidder | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // فلترة وترتيب المزايدين
  const filteredAndSortedBidders = useMemo(() => {
    let filtered = bidders;

    // فلترة حسب التحقق
    if (showVerifiedOnly) {
      filtered = filtered.filter((b) => b.isVerified);
    }

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // ترتيب حسب المبلغ
    return filtered.sort((a, b) => {
      const amountA = parseFloat(a.amount || '0');
      const amountB = parseFloat(b.amount || '0');
      return sortOrder === 'desc' ? amountB - amountA : amountA - amountB;
    });
  }, [bidders, showVerifiedOnly, sortOrder, searchTerm]);

  // عدد المزايدين الفريدين لعرضه في الرأس
  const uniqueCount = useMemo(() => {
    try {
      const ids = filteredAndSortedBidders.map((b) => b.id);
      return new Set(ids).size;
    } catch {
      return filteredAndSortedBidders.length;
    }
  }, [filteredAndSortedBidders]);

  // عدد المزايدين المعروضين (بدون سحب داخلي)
  const MAX_VISIBLE = compact ? 3 : 9;
  const displayedBidders = showAllBidders
    ? filteredAndSortedBidders
    : filteredAndSortedBidders.slice(0, MAX_VISIBLE);

  // دالة تأكيد البيع
  const handleAcceptBidClick = (bidder: Bidder) => {
    setSelectedBidder(bidder);
    setShowConfirmModal(true);
  };

  const confirmAcceptBid = () => {
    if (selectedBidder && onAcceptBid) {
      const realId = selectedBidder.userIdStr || selectedBidder.id;
      onAcceptBid(realId, selectedBidder.amount || '0');
      setShowConfirmModal(false);
      setSelectedBidder(null);
    }
  };

  // دالة تنسيق التقييم
  const renderRating = (rating?: number) => {
    if (!rating) return null;

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'fill-current text-amber-500' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="mr-1 text-xs text-gray-500">({rating})</span>
      </div>
    );
  };

  // دالة تنسيق رقم الهاتف المخفي جزئياً
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return null;
    return maskLibyanPhoneFirst7Xxx(phone);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* رأس القائمة */}
      <div className="border-b border-gray-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center text-lg font-semibold text-gray-800">
            <TrophyIcon className="ml-2 h-5 w-5 text-yellow-500" />
            قائمة المزايدين ({uniqueCount})
          </h3>

          {!compact && (
            <div className="flex items-center space-x-2 space-x-reverse">
              {/* فلتر المتحققين فقط */}
              <button
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  showVerifiedOnly
                    ? 'border border-green-300 bg-green-100 text-green-700'
                    : 'border border-gray-300 bg-gray-100 text-gray-600'
                }`}
              >
                <CheckCircleIcon className="ml-1 inline h-3 w-3" />
                متحققين فقط
              </button>

              {/* ترتيب */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
              >
                {sortOrder === 'desc' ? (
                  <ArrowDownIcon className="ml-1 inline h-3 w-3" />
                ) : (
                  <ArrowUpIcon className="ml-1 inline h-3 w-3" />
                )}
                {sortOrder === 'desc' ? 'الأعلى أولاً' : 'الأقل أولاً'}
              </button>
            </div>
          )}
        </div>

        {/* شريط البحث */}
        {!compact && (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="البحث عن مزايد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* قائمة المزايدين - بدون سحب داخلي */}
      <div className={`divide-y divide-gray-100`}>
        {displayedBidders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد مزايدات بعد'}
          </div>
        ) : (
          displayedBidders.map((bidder, index) => (
            <div
              key={bidder.id}
              className={`p-4 transition-colors hover:bg-gray-50 ${bidder.isWinning ? 'bg-green-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                {/* معلومات المزايد */}
                <div className="flex flex-1 items-center space-x-3 space-x-reverse">
                  {/* الترتيب والأيقونة */}
                  <div className="flex items-center">
                    {bidder.isWinning ? (
                      <TrophySolid className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold leading-none ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                              ? 'bg-gray-100 text-gray-700'
                              : index === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* صورة المزايد */}
                  <div className="relative">
                    {bidder.avatar ? (
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-white shadow-sm">
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${bidder.avatar})` }}
                          title={quickDecodeName(bidder.name)}
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                        <UserIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    {bidder.isVerified && (
                      <CheckCircleSolid className="absolute -bottom-1 -left-1 h-4 w-4 rounded-full bg-white text-green-500" />
                    )}
                  </div>

                  {/* تفاصيل المزايد */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="truncate text-sm font-medium text-gray-800">
                          {quickDecodeName(bidder.name)}
                          {bidder.isWinning && (
                            <span className="mr-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                              الفائز
                            </span>
                          )}
                        </p>

                        {!compact && (
                          <div className="mt-1 flex items-center space-x-3 space-x-reverse text-xs text-gray-500">
                            {bidder.rating && renderRating(bidder.rating)}
                            {bidder.totalBids && (
                              <span className="flex items-center">
                                <HandRaisedIcon className="ml-1 h-3 w-3" />
                                {bidder.totalBids} مزايدة
                              </span>
                            )}
                            {bidder.joinDate && (
                              <span className="flex items-center">
                                <CalendarDaysIcon className="ml-1 h-3 w-3" />
                                عضو منذ {bidder.joinDate}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* المبلغ والوقت */}
                      <div className="flex-shrink-0 text-left">
                        <p className="text-lg font-bold text-gray-800">
                          {formatNumber(bidder.amount || '0')} د.ل
                        </p>
                        {bidder.increaseAmount && (
                          <p className="text-xs text-green-600">
                            +{formatNumber(bidder.increaseAmount)} د.ل
                          </p>
                        )}
                        <p className="mt-1 flex items-center text-xs text-gray-500">
                          <ClockIcon className="ml-1 h-3 w-3" />
                          {bidder.timeAgo}
                        </p>
                      </div>
                    </div>

                    {/* معلومات إضافية للمالك */}
                    {isOwner && !compact && (
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
                          {bidder.phone && (
                            <span className="flex items-center">
                              <PhoneIcon className="ml-1 h-3 w-3" />
                              {formatPhoneNumber(bidder.phone)}
                            </span>
                          )}
                        </div>

                        {/* زر تأكيد البيع */}
                        <button
                          onClick={() => handleAcceptBidClick(bidder)}
                          disabled={isConfirmingSale}
                          className={`rounded-lg px-3 py-1 text-xs font-medium text-white transition-colors ${
                            isConfirmingSale
                              ? 'cursor-not-allowed bg-gray-400'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {isConfirmingSale ? 'جاري التأكيد...' : 'تأكيد البيع'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* زر عرض المزيد/أقل - موحد لكلا الوضعين */}
      {filteredAndSortedBidders.length > MAX_VISIBLE && (
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => setShowAllBidders(!showAllBidders)}
            className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {showAllBidders ? (
              <>
                <EyeSlashIcon className="ml-1 inline h-4 w-4" />
                عرض أقل
              </>
            ) : (
              <>
                <EyeIcon className="ml-1 inline h-4 w-4" />
                عرض جميع المزايدين ({filteredAndSortedBidders.length})
              </>
            )}
          </button>
        </div>
      )}

      {/* نافذة تأكيد البيع */}
      {showConfirmModal && selectedBidder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">تأكيد بيع المركبة</h3>

            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                <strong>تحذير:</strong> هذا الإجراء لا يمكن التراجع عنه. سيتم إنهاء المزاد وتأكيد
                البيع.
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm text-gray-600">تفاصيل البيع:</p>
              <div className="rounded-lg bg-gray-50 p-3">
                <p>
                  <strong>المشتري:</strong> {selectedBidder.name}
                </p>
                <p>
                  <strong>المبلغ:</strong> {formatNumber(selectedBidder.amount || '0')} د.ل
                </p>
                <p>
                  <strong>التحقق:</strong>{' '}
                  {selectedBidder.isVerified
                    ? 'متحقق <CheckIcon className="w-5 h-5 text-green-500" />'
                    : 'غير متحقق'}
                </p>
              </div>
            </div>

            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={confirmAcceptBid}
                disabled={isConfirmingSale}
                className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors ${
                  isConfirmingSale
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isConfirmingSale ? (
                  <div className="flex items-center justify-center">
                    <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                    جاري التأكيد...
                  </div>
                ) : (
                  'تأكيد البيع'
                )}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedBidder(null);
                }}
                className="flex-1 rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-400"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedBiddersList;
