import React from 'react';
import {
  XMarkIcon,
  UserCircleIcon,
  StarIcon,
  HandRaisedIcon,
  CalendarIcon,
  PhoneIcon,
  CheckCircleIcon,
  TrophyIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { BidderForList } from '../../hooks/useBidders';

interface BidderDetailsModalProps {
  bidder: BidderForList | null;
  isOpen: boolean;
  onClose: () => void;
  formatNumber: (num: string) => string;
  isOwner?: boolean;
  onAcceptBid?: (bidderId: number, amount: string) => void;
  onContactBidder?: (phone: string) => void;
}

const BidderDetailsModal: React.FC<BidderDetailsModalProps> = ({
  bidder,
  isOpen,
  onClose,
  formatNumber,
  isOwner = false,
  onAcceptBid,
  onContactBidder,
}) => {
  if (!isOpen || !bidder) return null;

  // دالة لعرض التقييم بالنجوم
  const renderRating = (rating: number = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i}>
          {i <= rating ? (
            <StarSolid className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarIcon className="h-5 w-5 text-gray-300" />
          )}
        </span>,
      );
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  // دالة لتنسيق رقم الهاتف (إخفاء جزئي)
  const formatPhoneNumber = (phone: string = '') => {
    if (phone.length < 4) return phone;
    const start = phone.slice(0, 3);
    const end = phone.slice(-2);
    const middle = '*'.repeat(phone.length - 5);
    return `${start}${middle}${end}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* صورة وحالة المزايد */}
        <div className="mb-6 text-center">
          <div className="relative mx-auto mb-4 inline-block">
            {bidder.avatar ? (
              <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg">
                {/* استخدام div مع background-image بدلاً من img لتجنب تحذيرات Next.js */}
                <div 
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${bidder.avatar})` }}
                  title={bidder.name}
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg">
                <UserCircleIcon className="h-12 w-12 text-gray-500" />
              </div>
            )}

            {/* حالة التوثيق */}
            {bidder.isVerified ? (
              <CheckCircleSolid className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white text-green-500 shadow-sm" />
            ) : (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-red-500 shadow-sm"></div>
            )}

            {/* حالة الفوز */}
            {bidder.isWinning && (
              <div className="absolute -top-2 -left-2 rounded-full bg-yellow-400 p-1 shadow-sm">
                <TrophyIcon className="h-4 w-4 text-yellow-800" />
              </div>
            )}
          </div>

          {/* اسم المزايد */}
          <h2 className="text-xl font-bold text-gray-900">{bidder.name}</h2>
          
          {/* حالة التوثيق */}
          <div className="mt-2 flex items-center justify-center gap-2">
            {bidder.isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                <CheckCircleIcon className="h-4 w-4" />
                حساب موثق
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                غير موثق
              </span>
            )}

            {bidder.isWinning && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                <TrophyIcon className="h-4 w-4" />
                المزايد الرابح
              </span>
            )}
          </div>
        </div>

        {/* تفاصيل المزايدة */}
        <div className="mb-6 space-y-4">
          {/* المبلغ المزايد به */}
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-green-50 p-4 text-center">
            <div className="mb-1 text-sm text-gray-600">المبلغ المزايد به</div>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(bidder.amount || '0')} <span className="text-lg">د.ل</span>
            </div>
            {bidder.increaseAmount && (
              <div className="mt-1 text-sm text-gray-500">
                زيادة: +{formatNumber(bidder.increaseAmount)} د.ل
              </div>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="grid grid-cols-2 gap-4">
            {/* التقييم */}
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="mb-2 flex justify-center">
                {renderRating(bidder.rating)}
              </div>
              <div className="text-sm text-gray-600">التقييم</div>
              <div className="font-semibold text-gray-900">{bidder.rating}/5</div>
            </div>

            {/* المرتبة */}
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="mb-2 flex justify-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                  bidder.bidRank === 1 ? 'bg-yellow-500' : 
                  bidder.bidRank === 2 ? 'bg-gray-400' : 
                  bidder.bidRank === 3 ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {bidder.bidRank}
                </div>
              </div>
              <div className="text-sm text-gray-600">المرتبة</div>
              <div className="font-semibold text-gray-900">#{bidder.bidRank}</div>
            </div>

            {/* إجمالي المزايدات */}
            {bidder.totalBids && (
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <HandRaisedIcon className="mx-auto mb-2 h-6 w-6 text-blue-500" />
                <div className="text-sm text-gray-600">إجمالي المزايدات</div>
                <div className="font-semibold text-gray-900">{bidder.totalBids}</div>
              </div>
            )}

            {/* وقت المزايدة */}
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <ClockIcon className="mx-auto mb-2 h-6 w-6 text-purple-500" />
              <div className="text-sm text-gray-600">وقت المزايدة</div>
              <div className="font-semibold text-gray-900">{bidder.timeAgo}</div>
            </div>
          </div>

          {/* معلومات إضافية */}
          {(bidder.joinDate || bidder.phone) && (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              {bidder.joinDate && (
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">تاريخ الانضمام</div>
                    <div className="font-medium text-gray-900">{bidder.joinDate}</div>
                  </div>
                </div>
              )}

              {bidder.phone && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">رقم الهاتف</div>
                    <div className="font-medium text-gray-900" dir="ltr">
                      {isOwner ? bidder.phone : formatPhoneNumber(bidder.phone)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="space-y-3">
          {/* زر تأكيد البيع للمالك */}
          {isOwner && onAcceptBid && (
            <button
              onClick={() => onAcceptBid(bidder.id, bidder.amount || '0')}
              className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition-colors ${
                bidder.isWinning
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5" />
                {bidder.isWinning ? 'تأكيد البيع' : 'قبول المزايدة'}
              </div>
              <div className="text-sm opacity-90">
                بسعر {formatNumber(bidder.amount || '0')} د.ل
              </div>
            </button>
          )}

          {/* زر الاتصال */}
          {bidder.phone && onContactBidder && (
            <button
              onClick={() => onContactBidder(bidder.phone || '')}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center justify-center gap-2">
                <PhoneIcon className="h-5 w-5" />
                الاتصال بالمزايد
              </div>
            </button>
          )}

          {/* زر الإغلاق */}
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidderDetailsModal;
