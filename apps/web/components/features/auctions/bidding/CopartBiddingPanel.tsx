import {
  MINIMUM_BID_AMOUNT,
  QUICK_BID_OPTIONS,
  computeTieredIncrement,
} from '@/config/auction-constants';
import { useAuctionSSE } from '@/hooks/useAuctionSSE';
import {
  BoltIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import React, { useEffect, useMemo, useState } from 'react';
import BidConfirmModal from './BidConfirmModal';

// إضافة CSS للتأثير المتحرك
const shimmerStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// إضافة الأنماط للرأس
if (typeof document !== 'undefined' && !document.getElementById('shimmer-styles')) {
  const style = document.createElement('style');
  style.id = 'shimmer-styles';
  style.innerHTML = shimmerStyles;
  document.head.appendChild(style);
}

interface CopartBiddingPanelProps {
  auctionId: string;
  currentPrice?: number; // المبلغ الحالي (اختياري عند تمرير externalLivePrice)
  startingPrice: number;
  reservePrice?: number | null;
  minimumBidIncrement?: number | null; // الحد الأدنى للزيادة من الخادم
  status: 'upcoming' | 'live' | 'ended' | 'sold';
  userId?: string; // معرف المستخدم المطلوب للـ API الحالي
  isOwner?: boolean;
  onRequireLogin?: () => void; // لإظهار نافذة تسجيل الدخول من الصفحة
  onBidSuccess?: (newAmount: number) => void; // لتحديث الصفحة فور النجاح
  // عند التوحيد: تعطيل اشتراك SSE الداخلي وتمرير سعر حي خارجي
  sseDisabled?: boolean;
  externalLivePrice?: number | null;
  // إخفاء ترويسة السعر الحالي داخل اللوحة عند وجود العداد الدائري لتفادي التكرار
  hideCurrentPriceHeader?: boolean;
}

const CopartBiddingPanel: React.FC<CopartBiddingPanelProps> = ({
  auctionId,
  currentPrice,
  startingPrice,
  reservePrice,
  minimumBidIncrement,
  status,
  userId,
  isOwner = false,
  onRequireLogin,
  onBidSuccess,
  sseDisabled = false,
  externalLivePrice,
  hideCurrentPriceHeader = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [incrementAmount, setIncrementAmount] = useState<string>('');

  // السعر الحالي الحي عبر SSE أو قيمة قادمة من الأب
  const initialLivePrice =
    typeof externalLivePrice === 'number' &&
    Number.isFinite(externalLivePrice) &&
    externalLivePrice > 0
      ? externalLivePrice
      : typeof currentPrice === 'number' && Number.isFinite(currentPrice) && currentPrice > 0
        ? currentPrice
        : startingPrice;
  const [livePrice, setLivePrice] = useState<number>(initialLivePrice);
  useEffect(() => {
    // تزامن عند تغيّر الخصائص الخارجية
    if (
      typeof externalLivePrice === 'number' &&
      Number.isFinite(externalLivePrice) &&
      externalLivePrice > 0
    ) {
      setLivePrice(externalLivePrice);
      return;
    }
    const next =
      typeof currentPrice === 'number' && Number.isFinite(currentPrice) && currentPrice > 0
        ? currentPrice
        : startingPrice;
    setLivePrice(next);
  }, [externalLivePrice, currentPrice, startingPrice]);

  // الاشتراك في بث المزاد عبر SSE لتحديث السعر فورياً (يمكن تعطيله من الأب)
  useAuctionSSE([auctionId], {
    enabled: !sseDisabled,
    onBid: (p) => {
      if (String(p.auctionId) === String(auctionId) && Number.isFinite(p.currentBid)) {
        setLivePrice(p.currentBid as number);
      }
    },
  });

  // نافذة تأكيد مخصصة بدل نافذة المتصفح
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string | undefined>(undefined);

  // الحد الأدنى للزيادة - ديناميكي حسب السعر الحالي (مع احترام قيمة الخادم عند توفرها)
  const minimumIncrement = useMemo(() => {
    const base = Number.isFinite(livePrice) && livePrice > 0 ? livePrice : startingPrice;
    const dynamicInc = computeTieredIncrement(base, minimumBidIncrement || undefined);
    return Math.max(MINIMUM_BID_AMOUNT, dynamicInc);
  }, [livePrice, startingPrice, minimumBidIncrement]);

  // أزرار الزيادة السريعة - موحّدة من إعدادات المشروع
  const quickIncrements = useMemo(() => {
    return QUICK_BID_OPTIONS.map((o) => o.amount);
  }, []);

  const formatNumber = (n: number | string) => {
    const v = typeof n === 'string' ? Number(n.replace(/,/g, '')) : n;
    if (!Number.isFinite(v)) return '0';
    return Math.floor(v as number).toLocaleString('en-US');
  };

  // دالة لتحسين رسائل الخطأ باللغة العربية مع تلميحات
  const getLocalizedErrorMessage = (error: string): string => {
    const lowerError = error.toLowerCase();

    if (lowerError.includes('bid_too_low') || lowerError.includes('أقل من الحد الأدنى')) {
      return `المبلغ أقل من الحد الأدنى المطلوب\n\nمعلومة: الحد الأدنى للزيادة هو ${formatNumber(minimumIncrement)} د.ل\nاقتراح: جرّب مبلغاً أعلى من ${formatNumber((Number.isFinite(livePrice) && livePrice > 0 ? livePrice : startingPrice) + minimumIncrement)} د.ل`;
    }

    if (lowerError.includes('auction_not_active') || lowerError.includes('المزاد غير نشط')) {
      return `المزاد غير نشط حالياً\n\nملاحظة: تأكد من أن المزاد في الحالة النشطة للمشاركة\nإجراء مقترح: حدّث الصفحة أو انتظر بداية المزاد`;
    }

    if (lowerError.includes('owner_cannot_bid') || lowerError.includes('لا يمكنك المزايدة')) {
      return `لا يمكن للمالك المزايدة على إعلانه\n\nملاحظة: هذا الإعلان مملوك لك\nيمكنك إدارة المزاد من لوحة التحكم`;
    }

    if (lowerError.includes('high_bid_confirmation') || lowerError.includes('مرتفع جداً')) {
      return `المبلغ مرتفع مقارنة بالسعر الحالي\n\nنصيحة: تحقق من المبلغ قبل التأكيد\nتأكيد: اضغط "تأكيد" إذا كنت متأكداً من المبلغ`;
    }

    if (lowerError.includes('network') || lowerError.includes('اتصال')) {
      return `مشكلة في الاتصال بالإنترنت\n\nالحلول:\n• تحقق من اتصالك بالإنترنت\n• حدّث الصفحة وحاول مرة أخرى\n• انتظر قليلاً ثم أعد المحاولة`;
    }

    if (lowerError.includes('server') || lowerError.includes('خادم')) {
      return `خطأ مؤقت في الخادم\n\nمعلومة: هذا خطأ مؤقت وسيتم حله قريباً\nجرّب مرة أخرى خلال دقيقة`;
    }

    // رسالة افتراضية محسنة
    return `حدث خطأ غير متوقع\n\nنصائح للحل:\n• تأكد من صحة المبلغ المدخل\n• حدّث الصفحة وحاول مرة أخرى\n• تواصل مع الدعم إذا استمر الخطأ\n\nتفاصيل الخطأ: ${error}`;
  };

  const parseCustom = (s: string) => {
    const cleaned = s.replace(/[^\d]/g, '');
    const v = parseInt(cleaned, 10);
    return Number.isFinite(v) ? v : NaN;
  };

  const placeBid = async (finalAmount: number, confirmHighBid: boolean = false) => {
    // console.log('[CopartBiddingPanel] محاولة المزايدة:', {
    //   auctionId,
    //   finalAmount,
    //   userId,
    //   isOwner,
    // }); // معطل لتقليل console spam

    if (isOwner) {
      setError(getLocalizedErrorMessage('owner_cannot_bid'));
      return;
    }
    if (status !== 'live') {
      const statusMessage =
        status === 'upcoming'
          ? 'المزاد لم يبدأ بعد'
          : status === 'ended'
            ? 'انتهى المزاد'
            : 'تم البيع';
      setError(getLocalizedErrorMessage(`auction_not_active: ${statusMessage}`));
      return;
    }
    if (!userId) {
      if (onRequireLogin) onRequireLogin();
      else setError('يجب تسجيل الدخول أولاً للمشاركة في المزاد');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      type BidApiResponse = {
        success?: boolean;
        message?: string;
        error?: string;
        requiredConfirm?: boolean;
        recommendedMin?: number;
        minIncrement?: number;
      };
      // تنفيذ الطلب نحو API الصحيح
      const res = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: finalAmount,
          ...(confirmHighBid ? { confirmHighBid: true } : {}),
        }),
      });

      // console.log('[CopartBiddingPanel] استجابة API:', {
      //   status: res.status,
      //   statusText: res.statusText,
      //   ok: res.ok,
      // }); // معطل

      const raw1 = await res.json().catch(() => ({}) as unknown);
      const data: BidApiResponse = (raw1 || {}) as BidApiResponse;

      // console.log('[CopartBiddingPanel] بيانات الاستجابة:', data); // معطل

      if (res.status === 401) {
        // جلسة غير مصادق عليها
        if (onRequireLogin) onRequireLogin();
        setIsSubmitting(false);
        return;
      }
      if (!res.ok) {
        // في حالة طلب تأكيد خاص من الخادم لمبالغ كبيرة، نفتح المودال برسالة الخادم
        if (data?.error === 'HIGH_BID_CONFIRMATION_REQUIRED' || data?.requiredConfirm) {
          setPendingAmount(finalAmount);
          setConfirmMessage(
            data?.message ||
              `المبلغ المدخل مرتفع مقارنة بالسعر الحالي.\n\nالمبلغ: ${formatNumber(finalAmount)} د.ل\nالحد الأدنى المقترح: ${formatNumber(
                String(data?.recommendedMin || 0),
              )} د.ل\nالزيادة الدنيا: ${formatNumber(String(data?.minIncrement || 0))} د.ل\n\nيرجى التأكيد للمتابعة.`,
          );
          setIsConfirmOpen(true);
          setIsSubmitting(false);
          return;
        }
        // تفضيل رمز الخطأ إن وُجد لتحسين الترجمة المحلية
        if (typeof data?.error === 'string' && data.error) {
          // تحديث السعر المحلي إذا كان الخطأ BID_TOO_LOW لتجنب تكرار المشكلة
          if (data.error === 'BID_TOO_LOW' && data.recommendedMin && data.minIncrement) {
            const actualCurrentPrice = data.recommendedMin - data.minIncrement;
            console.log('[CopartBiddingPanel] BID_TOO_LOW - تحديث السعر:', {
              oldPrice: livePrice,
              newPrice: actualCurrentPrice,
              recommendedMin: data.recommendedMin,
              minIncrement: data.minIncrement,
            });
            if (actualCurrentPrice > livePrice) {
              setLivePrice(actualCurrentPrice);
            }
          }
          setError(getLocalizedErrorMessage(data.error));
          setIsSubmitting(false);
          return;
        }
        if (typeof data?.message === 'string') {
          setError(getLocalizedErrorMessage(data.message));
          setIsSubmitting(false);
          return;
        }
        throw new Error('فشل في تسجيل المزايدة');
      }

      // نجاح
      if (onBidSuccess) onBidSuccess(finalAmount);
      // تحديث السعر المحلي فورياً بدون انتظار SSE
      setLivePrice(finalAmount);
      setIncrementAmount('');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'حدث خطأ أثناء تسجيل المزايدة';
      setError(getLocalizedErrorMessage(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickBid = async (increment: number) => {
    const next =
      (Number.isFinite(livePrice) && livePrice > 0 ? livePrice : startingPrice) + increment;
    setPendingAmount(next);
    setConfirmMessage(undefined);
    setIsConfirmOpen(true);
  };

  const handleCustomBid = async () => {
    const inc = parseCustom(incrementAmount);
    if (!Number.isFinite(inc) || inc <= 0) {
      setError('يرجى إدخال قيمة زيادة صحيحة');
      return;
    }
    if (inc < minimumIncrement) {
      setError(`الزيادة أقل من الحد الأدنى (${formatNumber(minimumIncrement)} د.ل)`);
      return;
    }
    const final = (Number.isFinite(livePrice) && livePrice > 0 ? livePrice : startingPrice) + inc;
    setPendingAmount(final);
    setConfirmMessage(undefined);
    setIsConfirmOpen(true);
  };

  // حالات غير نشطة
  if (status === 'ended' || status === 'sold' || status === 'upcoming') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-2">
        <div className="space-y-1 text-center">
          {status === 'upcoming' && (
            <>
              <div className="text-xs text-gray-600">سعر البداية</div>
              <div className="text-xl font-bold text-amber-600">
                {formatNumber(startingPrice)} <span className="text-sm">د.ل</span>
              </div>
              <div className="inline-flex items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
                <ClockIcon className="h-3 w-3" /> المزاد لم يبدأ بعد
              </div>
            </>
          )}
          {status === 'ended' && (
            <>
              <div className="text-xs text-gray-600">السعر النهائي</div>
              <div className="text-xl font-bold text-green-600">
                {formatNumber(livePrice)} <span className="text-sm">د.ل</span>
              </div>
            </>
          )}
          {status === 'sold' && (
            <>
              <div className="text-xs font-medium text-green-700">تم البيع</div>
              <div className="text-xl font-bold text-green-600">
                {formatNumber(livePrice)} <span className="text-sm">د.ل</span>
              </div>
            </>
          )}
          {reservePrice ? (
            <div className="text-xs text-gray-600">
              سعر البيع:{' '}
              <span
                className={`font-semibold ${livePrice >= (reservePrice || 0) ? 'text-green-700' : 'text-orange-600'}`}
              >
                {formatNumber(reservePrice)} د.ل
              </span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // حالة Live فقط
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2">
      {/* السعر الحالي - محدث لحظياً (اختياري لإخفائه عند وجود العداد الدائري) */}
      {!hideCurrentPriceHeader && (
        <div className="mb-2 text-center">
          <div className="text-xs text-gray-500">المزايدة الحالية</div>
          <div className="text-2xl font-bold text-blue-700">
            {formatNumber(livePrice)} <span className="text-sm">د.ل</span>
          </div>
        </div>
      )}

      {/* معلومات مساعدة */}
      <div className="mb-2 grid grid-cols-2 gap-1 text-center">
        <div className="rounded-lg bg-gray-50 p-1.5">
          <div className="text-xs text-gray-500">الحد الأدنى للزيادة</div>
          <div className="text-sm font-semibold text-gray-800">
            {formatNumber(minimumIncrement)} د.ل
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-1.5">
          <div className="text-xs text-gray-500">السعر الابتدائي</div>
          <div className="text-sm font-semibold text-gray-800">
            {formatNumber(startingPrice)} د.ل
          </div>
        </div>
      </div>

      {/* السعر المطلوب */}
      {typeof reservePrice === 'number' && reservePrice > 0 && (
        <div className="mb-2 rounded-lg border border-orange-200 bg-orange-50 p-1.5 text-center text-xs">
          {livePrice >= reservePrice ? (
            <span className="inline-flex items-center gap-1 text-green-700">
              <CheckCircleIcon className="h-3 w-3 text-green-600" /> تم الوصول لسعر البيع
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-orange-700">
              <ClockIcon className="h-3 w-3 text-orange-500" /> سعر البيع:{' '}
              {formatNumber(reservePrice)} د.ل
            </span>
          )}
        </div>
      )}

      {/* أزرار مزايدة سريعة */}
      <div className="mb-1 grid grid-cols-3 gap-1">
        {quickIncrements.map((inc: number) => {
          const base = Number.isFinite(livePrice) && livePrice > 0 ? livePrice : startingPrice;
          const finalAmount = base + inc;
          const belowMin = inc < minimumIncrement;
          const disabled = isSubmitting || isOwner || belowMin;
          return (
            <button
              key={inc}
              onClick={() => handleQuickBid(inc)}
              disabled={disabled}
              className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                disabled
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
              title={
                belowMin
                  ? `الحد الأدنى للزيادة هو ${formatNumber(minimumIncrement)} د.ل`
                  : `سيصبح المبلغ ${formatNumber(finalAmount)} د.ل`
              }
            >
              +{formatNumber(inc)}
            </button>
          );
        })}
      </div>

      {/* عرض الأخطاء بشكل واضح للمستخدم */}
      {error && (
        <div
          className="mb-1 rounded-lg border border-red-200 bg-red-50 p-1.5 text-center text-xs text-red-800"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* إدخال مقدار الزيادة فقط - الوضع الموحد */}

      {/* مزايدة مخصصة */}
      <div className="mb-1">
        <div className="relative">
          <input
            type="text"
            value={incrementAmount}
            onChange={(e) => {
              const v = e.target.value.replace(/[^\d,]/g, '');
              setIncrementAmount(v);
              if (error) setError('');
            }}
            placeholder={`أدخل مقدار الزيادة (الحد الأدنى ${formatNumber(minimumIncrement)} د.ل)`}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            dir="ltr"
          />
          <CurrencyDollarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        {/* معاينة المبلغ النهائي بعد التأكيد */}
        {(() => {
          const entered = parseCustom(incrementAmount);
          if (!Number.isFinite(entered) || entered <= 0) return null;
          const base = Number.isFinite(livePrice) && livePrice > 0 ? livePrice : startingPrice;
          const final = base + (entered as number);
          return (
            <div className="mt-1">
              <div className="rounded-lg border border-green-200 bg-green-50 p-1.5 text-center">
                <span className="text-xs font-medium text-green-700">مزايدتك التالية:</span>
                <span className="mr-1 text-sm font-bold text-green-800">
                  {formatNumber(final)} د.ل
                </span>
                <span className="text-xs text-green-600">
                  (زيادة {formatNumber(entered as number)} د.ل)
                </span>
              </div>
            </div>
          );
        })()}
        <div className="mt-1 grid grid-cols-2 gap-1">
          <button
            onClick={handleCustomBid}
            disabled={
              !incrementAmount ||
              parseCustom(incrementAmount) < minimumIncrement ||
              isSubmitting ||
              isOwner
            }
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
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
                <BoltIcon className="h-3 w-3" /> زايد الآن
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIncrementAmount('');
              setError('');
            }}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            مسح الحقل
          </button>
        </div>
      </div>

      {/* حالة المالك أو الأخطاء */}
      {isOwner && (
        <div className="mb-1 rounded-lg border border-amber-200 bg-amber-50 p-1.5 text-center text-xs text-amber-800">
          <ExclamationTriangleIcon className="ml-1 inline h-3 w-3" /> هذا الإعلان خاص بك - لا يمكنك
          المزايدة عليه
        </div>
      )}

      {/* نافذة تأكيد المزايدة */}
      <BidConfirmModal
        open={isConfirmOpen}
        amount={pendingAmount || 0}
        recommendedMin={
          (Number.isFinite(livePrice) && livePrice > 0 ? livePrice : startingPrice) +
          minimumIncrement
        }
        minIncrement={minimumIncrement}
        message={confirmMessage}
        onConfirm={async () => {
          setIsConfirmOpen(false);
          if (pendingAmount) await placeBid(pendingAmount, true);
        }}
        onCancel={() => {
          setIsConfirmOpen(false);
        }}
      />
    </div>
  );
};

export default CopartBiddingPanel;
