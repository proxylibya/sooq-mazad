// @ts-nocheck
/**
 * مكون عرض المزاد المباشر مع WebSocket
 * مثال استخدام للتحديثات الفورية
 */

import { useAuctionUpdates, useAuctionViewers } from '@/hooks/useWebSocket';
import { useCallback, useEffect, useState } from 'react';

interface Bid {
  id: string;
  amount: number;
  userName: string;
  timestamp: number;
  isLeading: boolean;
}

interface LiveAuctionCardProps {
  auctionId: string;
  initialBids?: Bid[];
  initialCurrentBid?: number;
  endTime: Date;
  onBidPlaced?: (amount: number) => void;
}

export function LiveAuctionCard({
  auctionId,
  initialBids = [],
  initialCurrentBid = 0,
  endTime,
  onBidPlaced,
}: LiveAuctionCardProps) {
  const [bids, setBids] = useState<Bid[]>(initialBids);
  const [currentBid, setCurrentBid] = useState(initialCurrentBid);
  const [isEnded, setIsEnded] = useState(false);
  const [bidAmount, setBidAmount] = useState('');

  // الاتصال بـ WebSocket والاشتراك في تحديثات المزاد
  const { isConnected } = useAuctionUpdates(
    auctionId,
    useCallback((update) => {
      if (update.type === 'bid') {
        const bidData = update.data as Bid;

        // إضافة المزايدة للقائمة
        setBids((prev) => [bidData, ...prev].slice(0, 10)); // آخر 10 مزايدات

        // تحديث المزايدة الحالية
        if (bidData.isLeading) {
          setCurrentBid(bidData.amount);
        }
      } else if (update.type === 'auction_end') {
        setIsEnded(true);
      }
    }, []),
  );

  // الحصول على عدد المشاهدين
  const { viewersCount } = useAuctionViewers(auctionId);

  // العد التنازلي
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining('انتهى');
        setIsEnded(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  // وضع مزايدة
  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= currentBid) {
      alert('المبلغ يجب أن يكون أكبر من المزايدة الحالية');
      return;
    }

    onBidPlaced?.(amount);
    setBidAmount('');
  };

  return (
    <div className="rtl rounded-lg bg-white p-6 shadow-lg">
      {/* رأس البطاقة */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">مزاد مباشر</h2>
        <div className="flex items-center gap-4">
          {/* حالة الاتصال */}
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-sm text-gray-600">{isConnected ? 'متصل' : 'غير متصل'}</span>
          </div>

          {/* عدد المشاهدين */}
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="text-sm text-gray-600">{viewersCount} مشاهد</span>
          </div>
        </div>
      </div>

      {/* المزايدة الحالية */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-6">
        <div className="text-center">
          <p className="mb-2 text-gray-600">المزايدة الحالية</p>
          <p className="text-4xl font-bold text-blue-600">
            {currentBid.toLocaleString('ar-LY')} د.ل
          </p>
        </div>
      </div>

      {/* الوقت المتبقي */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">الوقت المتبقي:</span>
          <span className={`text-xl font-bold ${isEnded ? 'text-red-600' : 'text-gray-800'}`}>
            {timeRemaining}
          </span>
        </div>
      </div>

      {/* نموذج المزايدة */}
      {!isEnded && (
        <div className="mb-6">
          <label className="mb-2 block text-gray-700">مبلغ المزايدة</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`أكبر من ${currentBid.toLocaleString('ar-LY')}`}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              disabled={!isConnected}
            />
            <button
              onClick={handlePlaceBid}
              disabled={!isConnected || isEnded}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              زايد
            </button>
          </div>
        </div>
      )}

      {/* قائمة المزايدات الأخيرة */}
      <div>
        <h3 className="mb-3 font-bold text-gray-800">آخر المزايدات</h3>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {bids.length === 0 ? (
            <p className="py-4 text-center text-gray-500">لا توجد مزايدات بعد</p>
          ) : (
            bids.map((bid) => (
              <div
                key={bid.id}
                className={`flex items-center justify-between rounded-lg p-3 ${
                  bid.isLeading ? 'border border-green-200 bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div>
                  <p className="font-medium">{bid.userName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(bid.timestamp).toLocaleTimeString('ar-LY')}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold">{bid.amount.toLocaleString('ar-LY')} د.ل</p>
                  {bid.isLeading && (
                    <p className="text-xs font-medium text-green-600">الرابح حالياً</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* رسالة انتهاء المزاد */}
      {isEnded && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-center font-bold text-red-800">انتهى المزاد</p>
        </div>
      )}
    </div>
  );
}

export default LiveAuctionCard;
