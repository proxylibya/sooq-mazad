import React from 'react';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import PaymentCountdownTimer from './PaymentCountdownTimer';

interface SaleConfirmedStatusProps {
  buyerInfo: {
    id: number;
    name: string;
    phone?: string;
    isVerified: boolean;
    avatar?: string;
  };
  saleDetails: {
    amount: string;
    confirmedAt: Date;
    paymentDeadline: Date;
  };
  formatNumber: (num: string | number) => string;
  onContactBuyer?: () => void;
  onViewPaymentDetails?: () => void;
  onPaymentTimeUp?: () => void;
}

const SaleConfirmedStatus: React.FC<SaleConfirmedStatusProps> = ({
  buyerInfo,
  saleDetails,
  formatNumber,
  onContactBuyer,
  onViewPaymentDetails,
  onPaymentTimeUp,
}) => {
  // معالجة انتهاء وقت الدفع
  const handlePaymentTimeUp = () => {
    if (onPaymentTimeUp) {
      onPaymentTimeUp();
    }
  };

  // معالجة تحذير الوقت القصير
  const handlePaymentWarning = (_minutesLeft: number) => {};

  return (
    <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg">
      {/* رأس الحالة */}
      <div className="mb-6 flex items-center justify-center">
        <div className="flex items-center space-x-3 space-x-reverse">
          <CheckCircleSolid className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-green-800">تم تأكيد البيع بنجاح!</h2>
        </div>
      </div>

      {/* تفاصيل البيع */}
      <div className="mb-6 space-y-4">
        {/* معلومات المشتري */}
        <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-800">
            <UserIcon className="ml-2 h-6 w-6 text-blue-600" />
            معلومات المشتري
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-sm text-gray-600">الاسم:</span>
              <div className="flex items-center">
                <span className="font-semibold text-gray-800">{buyerInfo.name}</span>
                {buyerInfo.isVerified && (
                  <CheckCircleSolid className="mr-1 h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            {buyerInfo.phone && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">الهاتف:</span>
                <span className="font-semibold text-gray-800">{buyerInfo.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* تفاصيل المبلغ والوقت */}
        <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-800">
            <CurrencyDollarIcon className="ml-2 h-6 w-6 text-green-600" />
            تفاصيل البيع
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-sm text-gray-600">المبلغ النهائي:</span>
              <span className="text-xl font-bold text-green-600">
                {formatNumber(saleDetails.amount)} د.ل
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">تاريخ التأكيد:</span>
              <span className="font-semibold text-gray-800">
                {new Date(saleDetails.confirmedAt).toLocaleDateString('ar-LY')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* العد التنازلي لتأكيد الدفع */}
      <div className="mb-6">
        <PaymentCountdownTimer
          deadline={saleDetails.paymentDeadline}
          onTimeUp={handlePaymentTimeUp}
          onWarning={handlePaymentWarning}
          showNotifications={true}
          size="medium"
        />
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onContactBuyer}
          className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <PhoneIcon className="ml-2 h-5 w-5" />
          التواصل مع المشتري
        </button>

        <button
          onClick={onViewPaymentDetails}
          className="flex flex-1 items-center justify-center rounded-lg bg-gray-600 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-700"
        >
          <DocumentTextIcon className="ml-2 h-5 w-5" />
          عرض تفاصيل الدفع
        </button>
      </div>

      {/* ملاحظة مهمة */}
      <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
        <p className="text-sm text-yellow-800">
          <strong>ملاحظة مهمة:</strong> لا تسلم المركبة إلا بعد تأكيد وصول المبلغ كاملاً إلى حسابك.
        </p>
      </div>
    </div>
  );
};

export default SaleConfirmedStatus;
