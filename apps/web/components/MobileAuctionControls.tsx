import React from 'react';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import { BiddersList } from './features/auctions';

interface MobileAuctionControlsProps {
  // بيانات المزايدة
  currentBid: string | number;
  startingBid: string | number;
  reservePrice?: string | number;
  bidCount: number;
  timeRemaining: string;

  // بيانات المزايدين
  bidders: any[];

  // حالة المزايدة
  auctionStatus: 'upcoming' | 'live' | 'ended';
  isOwner: boolean;

  // دوال المعالجة
  formatNumber: (num: string | number) => string;
  onAcceptBid?: (bidderId: number, amount: string) => void;
}

const MobileAuctionControls: React.FC<MobileAuctionControlsProps> = ({
  currentBid,
  startingBid,
  reservePrice,
  bidCount,
  timeRemaining,
  bidders,
  auctionStatus,
  isOwner,
  formatNumber,
  onAcceptBid,
}) => {
  return (
    <div className="mobile-auction-controls block lg:hidden">
      <div className="mobile-auction-grid grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* حاوية عداد المزايدة */}
        <div className="mobile-auction-timer-container rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
          {/* العداد الدائري */}
          <div className="mb-6 flex items-center justify-center">
            <div className="relative mx-auto h-56 w-56">
              {/* شارة المباشر */}
              {auctionStatus === 'live' && (
                <div className="absolute -right-2 -top-2 z-50">
                  <div className="flex items-center gap-1.5 rounded-full border border-red-400 bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-white shadow-lg">
                    <div className="relative">
                      <div className="h-2 w-2 animate-ping rounded-full bg-white opacity-75"></div>
                      <div className="absolute inset-0 h-2 w-2 animate-pulse rounded-full bg-red-200"></div>
                    </div>
                    <span className="text-sm font-bold tracking-wide">مباشر</span>
                  </div>
                </div>
              )}

              {/* الخلفية الدائرية */}
              <div className="absolute inset-3 rounded-full border-4 border-blue-200 bg-white shadow-xl"></div>

              {/* الدائرة المتقدمة */}
              <svg className="absolute h-full w-full -rotate-90 transform" viewBox="0 0 256 256">
                <circle
                  cx="128"
                  cy="128"
                  r="108"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="none"
                  opacity="0.3"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="108"
                  stroke="#2563eb"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="678.58"
                  strokeDashoffset="407.15"
                  className="transition-all duration-700 ease-in-out"
                  style={{
                    filter: 'drop-shadow(rgba(37, 99, 235, 0.4) 0px 0px 6px)',
                    opacity: 0.9,
                  }}
                />
              </svg>

              {/* المحتوى الداخلي */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                {/* المزايدة الحالية */}
                <div className="mb-3 text-center">
                  <div className="mb-1 text-xs font-medium text-blue-700">المزايدة الحالية</div>
                  <div className="mb-1 text-2xl font-bold text-blue-700 transition-all duration-500">
                    <span className="price-value inline-block transition-transform duration-500">
                      {formatNumber(currentBid)}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-blue-700">دينار ليبي</div>
                </div>

                {/* العداد الزمني */}
                <div className="mb-3 text-center">
                  <div className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg">
                    <div className="font-mono text-lg font-bold">{timeRemaining}</div>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-blue-700">الوقت المتبقي</div>
                </div>

                {/* عدد المزايدات */}
                <div className="rounded-lg bg-blue-100 px-3 py-1 transition-all duration-300">
                  <div className="text-xs font-medium text-blue-800">+{bidCount} مزايدة</div>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="space-y-4">
            {/* المزايدة الحالية */}
            <div className="text-center">
              <div className="mb-1 text-sm text-gray-500">المزايدة الحالية</div>
              <div className="price-value text-3xl font-bold text-gray-900 transition-all duration-500">
                {formatNumber(currentBid)} <span className="text-lg text-gray-600">د.ل</span>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <span>{bidCount} مزايدة</span>
                </span>
              </div>
            </div>

            {/* السعر الابتدائي */}
            <div className="text-center">
              <div className="mb-1 text-sm text-gray-500">السعر الابتدائي</div>
              <div className="text-lg text-gray-700">{formatNumber(startingBid)} د.ل</div>
            </div>

            {/* سعر البيع */}
            {reservePrice && (
              <div className="text-center">
                <div className="mb-1 text-sm text-gray-500">سعر البيع</div>
                <div className="text-lg font-semibold text-orange-600">
                  {formatNumber(reservePrice)} د.ل
                </div>
                <div className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3 text-orange-500" />
                  <span>لم يتم الوصول لسعر البيع بعد</span>
                </div>
              </div>
            )}

            {/* تنبيه المالك */}
            {isOwner && (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-600" />
                <span className="text-center text-sm font-medium">
                  هذا الإعلان خاص بك - لا يمكنك المزايدة عليه
                </span>
              </div>
            )}
          </div>
        </div>

        {/* حاوية قائمة المزايدين */}
        <div className="mobile-bidders-container rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <HandRaisedIcon className="h-6 w-6 text-blue-600" />
              قائمة المزايدين
            </h3>
            <div className="text-sm text-gray-500">{bidders.length} مزايد</div>
          </div>

          <div className="bidders-container max-h-[400px] overflow-y-auto">
            <BiddersList
              bidders={bidders}
              currentBid={currentBid}
              formatNumber={formatNumber}
              isOwner={isOwner}
              onAcceptBid={onAcceptBid}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAuctionControls;
