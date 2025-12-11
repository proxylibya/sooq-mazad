// @ts-nocheck
import { calculateMinimumBid } from '@/utils/auctionHelpers';
import { HandRaisedIcon, TrophyIcon } from '@heroicons/react/24/outline';
import React, { useMemo, useState } from 'react';

interface AuctionBiddingPanelProps {
  auction: {
    id: string;
    currentPrice: number;
    startingPrice: number;
    endTime: string;
    status: string;
    totalBids: number;
    highestBidderId?: string;
  };
  isAuthenticated: boolean;
  user?: { id: string };
  onBid: (amount: number) => void;
  onLoginRequired: () => void;
  loading?: boolean;
}

const AuctionBiddingPanel: React.FC<AuctionBiddingPanelProps> = ({
  auction,
  isAuthenticated,
  user,
  onBid,
  onLoginRequired,
  loading = false,
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');

  const minimumBid = useMemo(() => {
    return calculateMinimumBid(auction.currentPrice, auction.startingPrice);
  }, [auction.currentPrice, auction.startingPrice]);

  const isUserHighestBidder = user?.id === auction.highestBidderId;
  const isAuctionActive = auction.status === 'ACTIVE';
  const isAuctionEnded = auction.status === 'ENDED';

  const handleBidSubmit = () => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    const bidValue = parseFloat(bidAmount);

    if (isNaN(bidValue) || bidValue < minimumBid) {
      setBidError(`الحد الأدنى للمزايدة هو ${minimumBid.toLocaleString()} دينار`);
      return;
    }

    setBidError('');
    onBid(bidValue);
    setBidAmount('');
  };

  const suggestedBids = useMemo(() => {
    const base = minimumBid;
    return [base, base + 500, base + 1000, base + 2000];
  }, [minimumBid]);

  if (isAuctionEnded) {
    return (
      <div className="rounded-lg bg-gray-50 p-6">
        <div className="text-center">
          <TrophyIcon className="mx-auto mb-3 h-12 w-12 text-yellow-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">انتهى المزاد</h3>
          <p className="text-gray-600">
            السعر النهائي:{' '}
            <span className="font-bold text-green-600">
              {auction.currentPrice.toLocaleString()} دينار
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-20 rounded-lg border border-gray-200 bg-white p-6">
      <div className="space-y-6">
        {/* معلومات السعر الحالي */}
        <div className="text-center">
          <div className="mb-1 text-sm text-gray-500">السعر الحالي</div>
          <div className="text-3xl font-bold text-green-600">
            {auction.currentPrice.toLocaleString()} دينار
          </div>
          <div className="mt-1 text-sm text-gray-500">{auction.totalBids} مزايدة</div>
        </div>

        {/* مؤشر حالة المستخدم */}
        {isUserHighestBidder && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
            <TrophyIcon className="ml-2 inline h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">أنت أعلى مزايد حالياً</span>
          </div>
        )}

        {/* نموذج المزايدة */}
        {isAuctionActive && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                مبلغ المزايدة (دينار)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder={`الحد الأدنى: ${minimumBid.toLocaleString()}`}
                  min={minimumBid}
                  disabled={loading}
                />
              </div>
              {bidError && <p className="mt-1 text-sm text-red-500">{bidError}</p>}
            </div>

            {/* المزايدات السريعة */}
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">مزايدة سريعة</div>
              <div className="grid grid-cols-2 gap-2">
                {suggestedBids.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBidAmount(amount.toString())}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50"
                    disabled={loading}
                  >
                    {amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* زر المزايدة */}
            <button
              onClick={handleBidSubmit}
              disabled={loading || !bidAmount}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                  <span className="sr-only">جاري المزايدة</span>
                </>
              ) : (
                <>
                  <HandRaisedIcon className="h-5 w-5" />
                  ضع مزايدتك
                </>
              )}
            </button>

            {!isAuthenticated && (
              <div className="text-center text-sm text-gray-500">
                <button
                  onClick={onLoginRequired}
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  سجل دخولك
                </button>{' '}
                للمشاركة في المزاد
              </div>
            )}
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="space-y-2 border-t pt-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>السعر الابتدائي:</span>
            <span className="font-medium">{auction.startingPrice.toLocaleString()} دينار</span>
          </div>
          <div className="flex justify-between">
            <span>الحد الأدنى للزيادة:</span>
            <span className="font-medium">
              {(minimumBid - auction.currentPrice).toLocaleString()} دينار
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionBiddingPanel;
