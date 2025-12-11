import React from 'react';

interface TransactionDetailsProps {
  cardValue: number;
  currentBalance: number;
  cardNumber: string;
  showCardNumber?: boolean;
  className?: string;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  cardValue,
  currentBalance,
  cardNumber,
  showCardNumber = true,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
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
              {currentBalance.toLocaleString('ar-LY')} د.ل
            </div>
          </div>
        </div>
      </div>

      {/* تفاصيل الكرت */}
      {showCardNumber && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-center">
            <div className="mb-1 text-sm text-gray-500">رقم الكرت</div>
            <div className="mb-2 font-mono text-lg tracking-widest text-gray-800">
              {cardNumber.replace(/(\d{4})\d{8}(\d{4})/, '$1 **** **** $2')}
            </div>
            <div className="text-xs text-gray-500">
              تاريخ العملية: {new Date().toLocaleDateString('ar-LY')} -{' '}
              {new Date().toLocaleTimeString('ar-LY', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetails;
