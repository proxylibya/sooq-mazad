import React from 'react';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';

interface ChargingSuccessCardProps {
  cardNumber: string;
  cardValue: number;
  currentBalance: number;
  cardProvider: string;
  onBackToWallet: () => void;
  onChargeAnother: () => void;
}

const ChargingSuccessCard: React.FC<ChargingSuccessCardProps> = ({
  cardNumber,
  cardValue,
  currentBalance,
  cardProvider,
  onBackToWallet,
  onChargeAnother,
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-green-200 bg-white p-8 shadow-2xl">
        {/* أيقونة النجاح */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-inner">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-green-700">تمت عملية الشحن بنجاح!</h2>
          <p className="text-gray-600">تم شحن رصيدك عبر كرت {cardProvider}</p>
        </div>

        {/* تفاصيل العملية */}
        <div className="mb-6 space-y-4">
          {/* قيمة الكرت المشحونة */}
          <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-5 w-5 text-green-600"
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
              </div>
              <div>
                <div className="text-sm text-gray-600">قيمة الكرت المشحونة</div>
                <div className="text-lg font-bold text-green-700">+{cardValue.toFixed(2)} د.ل</div>
              </div>
            </div>
          </div>

          {/* الرصيد الحالي */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-5 w-5 text-blue-600"
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
              <div>
                <div className="text-sm text-gray-600">رصيدك الآن</div>
                <div className="text-xl font-bold text-blue-700">
                  {currentBalance.toLocaleString('en-US')} د.ل
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل الكرت */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-center">
              <div className="mb-1 text-sm text-gray-500">رقم الكرت</div>
              <div className="mb-2 font-mono text-lg tracking-widest text-gray-800">
                {cardNumber.replace(/(\d{4})\d{8}(\d{4})/, '$1 **** **** $2')}
              </div>
              <div className="text-xs text-gray-500">
                تاريخ العملية: {new Date().toLocaleDateString('en-US')} -{' '}
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* أزرار العمليات */}
        <div className="space-y-3">
          <button
            onClick={onBackToWallet}
            className="w-full transform rounded-xl bg-green-600 px-6 py-3 font-bold text-white shadow-lg transition-colors hover:scale-[1.02] hover:bg-green-700 hover:shadow-xl"
          >
            العودة للمحفظة
          </button>
          <button
            onClick={onChargeAnother}
            className="w-full rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            شحن كرت آخر
          </button>
        </div>

        {/* معلومة إضافية */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2 text-blue-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">تم إضافة الرصيد إلى محفظتك فوراً</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargingSuccessCard;
