import {
  BoltIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { useQuickNotifications } from './EnhancedNotificationSystem';

interface QuickBiddingProps {
  auctionId: string;
  currentBid: number;
  minimumIncrement: number;
  userMaxBid?: number;
  onBid: (amount: number) => Promise<boolean>;
  disabled?: boolean;
  className?: string;
}

const QuickBidding: React.FC<QuickBiddingProps> = ({
  auctionId,
  currentBid,
  minimumIncrement = 1000,
  userMaxBid,
  onBid,
  disabled = false,
  className = '',
}) => {
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [lastBidTime, setLastBidTime] = useState<number>(0);

  const notifications = useQuickNotifications();

  // أزرار المزايدة السريعة
  const quickBidAmounts = [
    minimumIncrement,
    minimumIncrement * 2,
    minimumIncrement * 5,
    minimumIncrement * 10,
  ];

  // منع المزايدة المتكررة السريعة
  const canBid = () => {
    const now = Date.now();
    return now - lastBidTime > 2000; // منع المزايدة لمدة ثانيتين
  };

  // معالجة المزايدة
  const handleBid = async (increment: number) => {
    if (!canBid()) {
      notifications.warning('انتظر قليلاً', 'يرجى الانتظار قبل المزايدة مرة أخرى');
      return;
    }

    if (disabled || isSubmitting) return;

    const bidAmount = currentBid + increment;

    // التحقق من الحد الأقصى للمستخدم
    if (userMaxBid && bidAmount > userMaxBid) {
      notifications.warning(
        'تجاوز الحد الأقصى',
        `المبلغ ${bidAmount.toLocaleString()} د.ل يتجاوز حدك الأقصى ${userMaxBid.toLocaleString()} د.ل`,
      );
      return;
    }

    setIsSubmitting(true);
    setLastBidTime(Date.now());

    try {
      const success = await onBid(bidAmount);

      if (success) {
        notifications.bid('تم تسجيل مزايدتك!', `مزايدة بقيمة ${bidAmount.toLocaleString()} د.ل`, {
          label: 'عرض المزاد',
          onClick: () => (window.location.href = `/auction/${auctionId}`),
        });
        setCustomAmount('');
        setShowCustomInput(false);
      } else {
        notifications.error('فشل في المزايدة', 'حدث خطأ أثناء تسجيل مزايدتك. حاول مرة أخرى.');
      }
    } catch (error) {
      notifications.error('خطأ في المزايدة', 'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // معالجة المزايدة المخصصة
  const handleCustomBid = async () => {
    const amount = parseInt(customAmount.replace(/,/g, ''));

    if (isNaN(amount) || amount <= 0) {
      notifications.warning('مبلغ غير صحيح', 'يرجى إدخال مبلغ صحيح');
      return;
    }

    if (amount <= currentBid) {
      notifications.warning(
        'مبلغ غير كافي',
        `يجب أن يكون المبلغ أكبر من المزايدة الحالية ${currentBid.toLocaleString()} د.ل`,
      );
      return;
    }

    const increment = amount - currentBid;
    await handleBid(increment);
  };

  // تنسيق المبلغ المدخل
  const formatCustomAmount = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCustomAmount(e.target.value);
    setCustomAmount(formatted);
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      {/* العنوان والمزايدة الحالية */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">مزايدة سريعة</h3>
        </div>
        <div className="text-left">
          <div className="text-xs text-gray-500">المزايدة الحالية</div>
          <div className="text-lg font-bold text-blue-600">
            {currentBid.toLocaleString('en-US')} د.ل
          </div>
        </div>
      </div>

      {/* تحذير الحد الأقصى */}
      {userMaxBid && currentBid >= userMaxBid * 0.9 && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              اقتربت من حدك الأقصى ({userMaxBid.toLocaleString()} د.ل)
            </span>
          </div>
        </div>
      )}

      {/* أزرار المزايدة السريعة */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {quickBidAmounts.map((amount, index) => {
          const bidAmount = currentBid + amount;
          const isOverLimit = typeof userMaxBid === 'number' ? bidAmount > userMaxBid : false;

          return (
            <button
              key={index}
              onClick={() => handleBid(amount)}
              disabled={disabled || isSubmitting || isOverLimit}
              className={`relative rounded-lg border-2 p-3 transition-all duration-200 ${
                isOverLimit
                  ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                  : disabled || isSubmitting
                    ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                    : 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100 active:scale-95'
              } `}
            >
              <div className="mb-1 flex items-center justify-center gap-1">
                <PlusIcon className="h-4 w-4" />
                <span className="font-semibold">{amount.toLocaleString('en-US')}</span>
              </div>
              <div className="text-xs opacity-75">= {bidAmount.toLocaleString('en-US')} د.ل</div>

              {/* مؤشر التحميل */}
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
                  <div
                    className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                    style={{ width: 24, height: 24 }}
                    role="status"
                    aria-label="جاري التحميل"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* مزايدة مخصصة */}
      <div className="border-t border-gray-200 pt-4">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            disabled={disabled || isSubmitting}
            className="w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center justify-center gap-2">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span>مزايدة بمبلغ مخصص</span>
            </div>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder={`أكثر من ${currentBid.toLocaleString()}`}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-center text-lg font-semibold transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">د.ل</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCustomBid}
                disabled={!customAmount || disabled || isSubmitting}
                className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                    <span className="sr-only">جاري المزايدة</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <BoltIcon className="h-4 w-4" />
                    زايد الآن
                  </div>
                )}
              </button>

              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomAmount('');
                }}
                disabled={isSubmitting}
                className="rounded-lg border border-gray-300 px-4 py-3 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

      {/* معلومات إضافية */}
      <div className="mt-4 text-center text-xs text-gray-500">
        الحد الأدنى للزيادة: {minimumIncrement.toLocaleString()} د.ل
      </div>
    </div>
  );
};

export default QuickBidding;
