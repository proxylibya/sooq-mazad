import React, { useState } from 'react';

interface EnhancedPromotionCardProps {
  onPromote?: () => void;
  price?: string;
  duration?: string;
  className?: string;
  userBalance?: number; // رصيد المستخدم الحالي
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'libyana' | 'madar';
}

interface BalancePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  price: string;
  userBalance: number;
  onConfirm: () => void;
}

// مكون النافذة المنبثقة لوسائل الدفع
const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, provider }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const providerInfo = {
    libyana: {
      name: 'ليبيانا',
      color: 'bg-purple-500',
      icon: (
        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 2H7C5.9 2 5 2.9 5 4v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H7V6h10v10z" />
        </svg>
      ),
    },
    madar: {
      name: 'مدار',
      color: 'bg-orange-500',
      icon: (
        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
        </svg>
      ),
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber.trim()) {
      alert('يرجى إدخال رقم كرت التعبئة');
      return;
    }

    setIsSubmitting(true);

    // محاكاة عملية الدفع
    setTimeout(() => {
      setIsSubmitting(false);
      alert('تم إرسال طلب التعبئة بنجاح! سيتم التواصل معك قريباً.');
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* رأس النافذة */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 ${providerInfo[provider].color} flex items-center justify-center rounded-full`}
            >
              {providerInfo[provider].icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              تعبئة كرت {providerInfo[provider].name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* رسالة التنبيه */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="mb-1 font-semibold text-blue-900">معلومات مهمة</h4>
              <p className="text-sm text-blue-700">
                قم بإدخال رقم كرت التعبئة الخاص بك وسيتم التواصل معك لتأكيد العملية
              </p>
            </div>
          </div>
        </div>

        {/* نموذج التعبئة */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">رقم كرت التعبئة</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="أدخل رقم كرت التعبئة هنا..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* معلومات إضافية */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-semibold text-gray-900">فئات الكروت المتاحة:</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded border bg-white p-2 text-center">
                <div className="font-bold text-green-600">5 د.ل</div>
                <div className="text-xs text-gray-600">أسبوع واحد</div>
              </div>
              <div className="rounded border bg-white p-2 text-center">
                <div className="font-bold text-green-600">10 د.ل</div>
                <div className="text-xs text-gray-600">أسبوعين</div>
              </div>
              <div className="rounded border bg-white p-2 text-center">
                <div className="font-bold text-green-600">20 د.ل</div>
                <div className="text-xs text-gray-600">شهر كامل</div>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-orange-600 px-4 py-3 text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  جاري الإرسال...
                </div>
              ) : (
                'إرسال طلب التعبئة'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// مكون النافذة المنبثقة للدفع من الرصيد
const BalancePaymentModal: React.FC<BalancePaymentModalProps> = ({
  isOpen,
  onClose,
  price,
  userBalance,
  onConfirm,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // استخراج القيمة الرقمية من السعر
  const priceValue = parseFloat(price.replace(/[^\d.]/g, ''));
  const isBalanceSufficient = userBalance >= priceValue;

  const handleConfirm = async () => {
    if (!isBalanceSufficient) {
      alert('الرصيد غير كافي لإتمام العملية');
      return;
    }

    setIsProcessing(true);

    // محاكاة عملية الدفع
    setTimeout(() => {
      setIsProcessing(false);
      alert('تم الدفع من الرصيد بنجاح! تم تفعيل الترويج.');
      onConfirm();
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* رأس النافذة */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">الدفع من الرصيد</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* معلومات الدفع */}
        <div className="mb-6 space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-3 font-semibold text-gray-900">تفاصيل العملية</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">مبلغ الترويج:</span>
                <span className="font-bold text-gray-900">{price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">رصيدك الحالي:</span>
                <span
                  className={`font-bold ${isBalanceSufficient ? 'text-green-600' : 'text-red-600'}`}
                >
                  {userBalance.toFixed(2)} د.ل
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <span className="text-gray-600">الرصيد بعد الدفع:</span>
                <span
                  className={`font-bold ${isBalanceSufficient ? 'text-green-600' : 'text-red-600'}`}
                >
                  {isBalanceSufficient ? (userBalance - priceValue).toFixed(2) : '---'} د.ل
                </span>
              </div>
            </div>
          </div>

          {/* رسالة التحذير أو التأكيد */}
          {isBalanceSufficient ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="mb-1 font-semibold text-green-900">الرصيد كافي</h4>
                  <p className="text-sm text-green-700">يمكنك إتمام عملية الدفع من رصيدك المتوفر</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="mb-1 font-semibold text-red-900">الرصيد غير كافي</h4>
                  <p className="text-sm text-red-700">
                    تحتاج إلى تعبئة رصيدك أولاً لإتمام هذه العملية
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isBalanceSufficient || isProcessing}
            className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري المعالجة...
              </div>
            ) : (
              'تأكيد الدفع'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const EnhancedPromotionCard: React.FC<EnhancedPromotionCardProps> = ({
  onPromote,
  price = '5 د.ل',
  duration = '7 أيام كاملة',
  className = '',
  userBalance = 150.75, // رصيد افتراضي للاختبار
}) => {
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    provider: 'libyana' | 'madar';
  }>({
    isOpen: false,
    provider: 'libyana',
  });

  const [balanceModal, setBalanceModal] = useState(false);

  const handlePaymentClick = (provider: 'libyana' | 'madar') => {
    setPaymentModal({ isOpen: true, provider });
  };

  const handleBalancePayment = () => {
    setBalanceModal(true);
  };

  const handleBalanceConfirm = () => {
    // هنا يمكن إضافة منطق خصم المبلغ من الرصيد
    if (onPromote) {
      onPromote();
    }
  };

  return (
    <>
      <div
        className={`relative transform overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4 text-white shadow-2xl transition-all duration-300 hover:scale-105 ${className}`}
      >
        {/* تأثيرات الخلفية المتحركة */}
        <div className="absolute inset-0 -translate-x-full -skew-x-12 transform animate-pulse bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="absolute right-0 top-0 h-20 w-20 -translate-y-10 translate-x-10 animate-bounce rounded-full bg-white/5"></div>
        <div className="absolute bottom-0 left-0 h-16 w-16 -translate-x-8 translate-y-8 animate-ping rounded-full bg-white/5"></div>

        <div className="relative z-10">
          <div className="mb-4 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-white/20 shadow-lg backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-8 w-8 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-xl font-bold text-white">عزز إعلانك الآن</h3>
            <p className="text-xs text-blue-100">احصل على مشاهدات أكثر بكثير خلال يوم واحد</p>
          </div>

          {/* المزايا المحسنة - مختصرة */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-white/15 p-2 backdrop-blur-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.563.563 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-white">علامة متميزة</div>
                <div className="text-xs text-blue-100">يظهر في الأعلى لمدة 7 أيام</div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-white/15 p-2 backdrop-blur-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-white">مشاهدات كثيرة</div>
                <div className="text-xs text-blue-100">زيادة كبيرة في المشاهدات</div>
              </div>
            </div>
          </div>

          {/* السعر ووسائل الدفع - مختصر */}
          <div className="mb-4 rounded-lg border border-white/30 bg-white/20 p-3 backdrop-blur-sm">
            <div className="mb-3 text-center">
              <div className="mb-1 text-2xl font-bold text-white">{price}</div>
              <div className="text-xs text-blue-100">لمدة {duration}</div>
            </div>

            {/* وسائل الدفع مع أيقونات حقيقية */}
            <div className="space-y-2">
              <div className="mb-2 text-center text-xs font-medium text-blue-100">وسائل الدفع:</div>

              {/* عرض الرصيد الحالي */}
              <div className="mb-2 text-center">
                <div className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span className="text-xs text-white">رصيدك: {userBalance.toFixed(2)} د.ل</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-1">
                {/* زر الدفع من الرصيد */}
                <button
                  onClick={handleBalancePayment}
                  className="flex transform items-center gap-1 rounded-lg bg-white/20 px-2 py-1 transition-all duration-200 hover:scale-105 hover:bg-white/30"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-white">الرصيد</span>
                </button>

                <button
                  onClick={() => handlePaymentClick('libyana')}
                  className="flex transform items-center gap-1 rounded-lg bg-white/20 px-2 py-1 transition-all duration-200 hover:scale-105 hover:bg-white/30"
                >
                  {/* أيقونة ليبيانا الحقيقية */}
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-white">ليبيانا</span>
                </button>
                <button
                  onClick={() => handlePaymentClick('madar')}
                  className="flex transform items-center gap-1 rounded-lg bg-white/20 px-2 py-1 transition-all duration-200 hover:scale-105 hover:bg-white/30"
                >
                  {/* أيقونة مدار الحقيقية */}
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-white">مدار</span>
                </button>
              </div>
            </div>
          </div>

          {/* زر الترويج المحسن */}
          <button
            onClick={onPromote}
            className="flex w-full transform animate-pulse items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-orange-600 hover:shadow-xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            عزز إعلانك الآن
          </button>

          {/* ضمانات مختصرة */}
          <div className="mt-3 space-y-1">
            <p className="text-center text-xs text-blue-100">
              <svg
                className="mr-1 inline h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              تفعيل فوري خلال 5 دقائق
            </p>
            <p className="text-center text-xs text-blue-100">
              <svg
                className="mr-1 inline h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              ضمان استرداد الأموال
            </p>
          </div>
        </div>
      </div>

      {/* النافذة المنبثقة لوسائل الدفع */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, provider: 'libyana' })}
        provider={paymentModal.provider}
      />

      {/* النافذة المنبثقة للدفع من الرصيد */}
      <BalancePaymentModal
        isOpen={balanceModal}
        onClose={() => setBalanceModal(false)}
        price={price}
        userBalance={userBalance}
        onConfirm={handleBalanceConfirm}
      />
    </>
  );
};

export default EnhancedPromotionCard;
