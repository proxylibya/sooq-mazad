import React, { useState, useEffect } from 'react';
import Image from 'next/image';
// // import { useSession } from 'next-auth/react'; // تم تعطيل نظام المصادقة مؤقتاً // تم تعطيل نظام المصادقة مؤقتاً
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import FireIcon from '@heroicons/react/24/outline/FireIcon';
import { TrophyIcon as TrophySolid } from '@heroicons/react/24/solid';
import { calculateMinimumBid } from '../utils/auctionHelpers';

interface Bid {
  id: number;
  bidder: string;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
  bidderAvatar?: string;
  isVerified?: boolean;
}

interface LocalUser {
  id?: string;
  fullName?: string;
  name?: string;
  profileImage?: string;
  image?: string;
}

interface LiveAuctionProps {
  carId: number;
  carTitle: string;
  startingPrice: number;
  currentBid: number;
  endTime: Date;
  className?: string;
  onBidPlaced?: (amount: number) => void;
}

const LiveAuction: React.FC<LiveAuctionProps> = ({
  carId: _carId,
  carTitle,
  startingPrice,
  currentBid: initialCurrentBid,
  endTime,

  className = '',
  onBidPlaced,
}) => {
  // const { data: session } = useSession(); // تم تعطيل نظام المصادقة مؤقتاً
  // استخدام نظام المصادقة الحالي من localStorage
  const [user, setUser] = useState<LocalUser | null>(null);

  // تحميل بيانات المستخدم من localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);
  const [currentBid, setCurrentBid] = useState(initialCurrentBid);

  // حساب الحد الأدنى للزيادة تلقائياً
  const minimumIncrement = calculateMinimumBid(currentBid.toString());

  const [bidAmount, setBidAmount] = useState(initialCurrentBid + minimumIncrement);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  // بيانات المزايدات - ستُجلب من الخادم لاحقاً، افتراضياً فارغة
  const [bids, setBids] = useState<Bid[]>([]);

  // حساب الوقت المتبقي
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        );
      } else {
        setTimeLeft('انتهى المزاد');
        setIsActive(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  // تمت إزالة محاكاة المزايدات التلقائية لضمان عدم وجود بيانات وهمية

  // تحديث bidAmount عندما يتغير currentBid
  useEffect(() => {
    setBidAmount(currentBid + minimumIncrement);
  }, [currentBid, minimumIncrement]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const handleBidSubmit = async () => {
    if (!user) {
      setNotification({ type: 'error', message: 'يجب تسجيل الدخول للمزايدة' });
      return;
    }

    if (!isActive) {
      setNotification({ type: 'error', message: 'انتهى وقت المزاد' });
      return;
    }

    if (bidAmount <= currentBid) {
      setNotification({
        type: 'error',
        message: `يجب أن تكون المزايدة أكبر من ${formatNumber(currentBid)} د.ل`,
      });
      return;
    }

    if (bidAmount < currentBid + minimumIncrement) {
      setNotification({
        type: 'error',
        message: `الحد الأدنى للزيادة هو ${formatNumber(minimumIncrement)} د.ل`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // محاكاة API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newBid: Bid = {
        id: Date.now(),
        bidder: user?.fullName || user?.name || 'أنت',
        amount: bidAmount,
        timestamp: new Date(),
        isWinning: true,
        bidderAvatar:
          user?.profileImage ||
          user?.image ||
          '/images/default-avatar.svg',
        isVerified: true,
      };

      setBids((prev) => {
        const updated = prev.map((bid) => ({ ...bid, isWinning: false }));
        return [newBid, ...updated];
      });

      setCurrentBid(bidAmount);
      setBidAmount(bidAmount + minimumIncrement);
      setNotification({ type: 'success', message: 'تم تقديم مزايدتك بنجاح!' });

      if (onBidPlaced) {
        onBidPlaced(bidAmount);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'حدث خطأ أثناء تقديم المزايدة',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeLeftColor = () => {
    const now = new Date().getTime();
    const distance = endTime.getTime() - now;
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    if (minutes <= 10) return 'text-red-600 animate-pulse';
    if (minutes <= 30) return 'text-orange-600';
    return 'text-green-600';
  };

  const isUrgent = () => {
    const now = new Date().getTime();
    const distance = endTime.getTime() - now;
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    return minutes <= 10;
  };

  return (
    <div
      className={`rounded-lg border-2 bg-white shadow-sm ${isUrgent() ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${isUrgent() ? 'bg-red-100' : 'bg-blue-100'}`}>
            {isUrgent() ? (
              <FireIcon className="h-6 w-6 text-red-600" />
            ) : (
              <TrophySolid className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">مزاد مباشر</h3>
            <p className="text-sm text-gray-600">{carTitle}</p>
          </div>
        </div>

        <div className={`text-right ${isUrgent() ? 'animate-pulse' : ''}`}>
          <div className="text-sm text-gray-600">ينتهي خلال</div>
          <div className={`text-lg font-bold ${getTimeLeftColor()}`}>{timeLeft}</div>
        </div>
      </div>

      {/* Current Bid */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-4">
        <div className="text-center">
          <div className="mb-1 text-sm text-gray-600">المزايدة الحالية</div>
          <div className="text-3xl font-bold text-green-600">
            {formatNumber(currentBid)} <span className="text-lg">د.ل</span>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            السعر الابتدائي: {formatNumber(startingPrice)} د.ل
          </div>
        </div>
      </div>

      {/* Bid Form */}
      {isActive ? (
        <div className="mb-6">
          <div className="mb-3 flex gap-3">
            <div className="flex-1">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                min={currentBid + minimumIncrement}
                step={minimumIncrement}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-semibold focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder={`أدخل مزايدتك (الحد الأدنى: ${formatNumber(currentBid + minimumIncrement)})`}
              />
            </div>
            <button
              onClick={handleBidSubmit}
              disabled={isSubmitting || !user}
              className={`rounded-lg px-6 py-3 font-semibold transition-colors ${
                isSubmitting || !user
                  ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                  : isUrgent()
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                  جاري المزايدة...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <HandRaisedIcon className="h-5 w-5" />
                  {user ? 'زايد الآن' : 'سجل للمزايدة'}
                </div>
              )}
            </button>
          </div>

          <div className="text-sm text-gray-600">
            الحد الأدنى للزيادة: {formatNumber(minimumIncrement)} د.ل
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-lg bg-gray-100 p-4 text-center">
          <TrophyIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <div className="text-lg font-semibold text-gray-700">انتهى المزاد</div>
          <div className="text-sm text-gray-600">
            المشتري: {(bids.find((bid) => bid.isWinning)?.bidder) || 'غير محدد'} بمبلغ {formatNumber(currentBid)} د.ل
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`mb-4 rounded-lg p-3 ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800'
              : notification.type === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Quick Bid Buttons */}
      {isActive && user && (
        <div className="mb-6">
          <div className="mb-2 text-sm text-gray-600">مزايدة سريعة:</div>
          <div className="flex gap-2">
            {[1, 2, 5].map((multiplier) => {
              const quickBidAmount = currentBid + minimumIncrement * multiplier;
              return (
                <button
                  key={multiplier}
                  onClick={() => setBidAmount(quickBidAmount)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50"
                >
                  +{formatNumber(minimumIncrement * multiplier)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bid History */}
      <div>
        <h4 className="text-md mb-3 font-semibold text-gray-900">تاريخ المزايدات</h4>
        <div className="max-h-60 space-y-3 overflow-y-auto">
          {bids.map((bid) => (
            <div
              key={bid.id}
              className={`flex items-center justify-between rounded-lg p-3 ${
                bid.isWinning ? 'border border-green-200 bg-green-50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={bid.bidderAvatar || '/images/default-avatar.svg'}
                  alt={bid.bidder}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{bid.bidder}</span>
                    {bid.isVerified && <CheckCircleIcon className="h-4 w-4 text-blue-500" />}
                    {bid.isWinning && <TrophySolid className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="text-sm text-gray-500">
                    {bid.timestamp.toLocaleTimeString('ar-LY', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <div
                className={`font-semibold ${bid.isWinning ? 'text-green-600' : 'text-gray-700'}`}
              >
                {formatNumber(bid.amount)} د.ل
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveAuction;
