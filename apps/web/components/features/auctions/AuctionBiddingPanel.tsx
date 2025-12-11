import { useState } from 'react';
import { HandRaisedIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface AuctionBiddingPanelProps {
  currentPrice: number;
  minimumBid: number;
  currency: string;
  isOwner: boolean;
  isAuthenticated: boolean;
  auctionStatus: 'upcoming' | 'live' | 'ended' | 'sold';
  onPlaceBid: (amount: number) => Promise<void>;
  onRequireLogin: () => void;
}

export default function AuctionBiddingPanel({
  currentPrice,
  minimumBid,
  currency = 'LYD',
  isOwner,
  isAuthenticated,
  auctionStatus,
  onPlaceBid,
  onRequireLogin,
}: AuctionBiddingPanelProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitBid = async () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }

    const amount = parseFloat(bidAmount);
    if (!amount || amount < minimumBid) {
      setError(`المبلغ يجب أن يكون ${minimumBid.toLocaleString()} ${currency} على الأقل`);
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onPlaceBid(amount);
      setBidAmount('');
    } catch (err) {
      setError('فشل في تقديم المزايدة. حاول مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // إذا كان المزاد منتهي أو قادم
  if (auctionStatus !== 'live') {
    return (
      <div className="rounded-xl bg-gray-100 p-6 text-center">
        <p className="text-gray-600">
          {auctionStatus === 'ended' && 'المزاد منتهي'}
          {auctionStatus === 'upcoming' && 'المزاد لم يبدأ بعد'}
          {auctionStatus === 'sold' && 'تم البيع'}
        </p>
      </div>
    );
  }

  // إذا كان المستخدم هو المالك
  if (isOwner) {
    return (
      <div className="rounded-xl bg-amber-50 p-6 text-center">
        <p className="text-amber-800">لا يمكنك المزايدة على مزادك الخاص</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* السعر الحالي */}
      <div className="mb-6 text-center">
        <p className="mb-2 text-sm text-gray-600">السعر الحالي</p>
        <p className="text-4xl font-bold text-blue-600">
          {currentPrice.toLocaleString()} <span className="text-2xl">{currency}</span>
        </p>
      </div>

      {/* حد أدنى للمزايدة */}
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">
          الحد الأدنى للمزايدة:{' '}
          <span className="font-semibold text-gray-900">
            {minimumBid.toLocaleString()} {currency}
          </span>
        </p>
      </div>

      {/* حقل إدخال المزايدة */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={`أدخل مبلغ المزايدة (${minimumBid.toLocaleString()}+)`}
            className="w-full rounded-lg border-2 border-blue-200 px-4 py-3 pr-12 text-right text-lg focus:border-blue-500 focus:outline-none"
            min={minimumBid}
            step="100"
          />
          <CurrencyDollarIcon className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* زر المزايدة */}
      <button
        onClick={handleSubmitBid}
        disabled={isSubmitting || !bidAmount}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
            <span className="sr-only">جاري المزايدة</span>
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <HandRaisedIcon className="ml-2 h-6 w-6" />
            ضع مزايدتك الآن
          </span>
        )}
      </button>

      {/* مزايدات سريعة */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[100, 500, 1000].map((increment) => (
          <button
            key={increment}
            onClick={() => setBidAmount((currentPrice + increment).toString())}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            +{increment}
          </button>
        ))}
      </div>
    </div>
  );
}
