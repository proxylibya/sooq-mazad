import React from 'react';
import {
  PaymentMethodConfig,
  SecurityLevel,
  VerificationType,
  PaymentMethod,
} from '../../types/wallet';
import {
  getPaymentMethodIcon,
  SecurityIcon,
  VerificationIcon,
  LibyanaLogo,
  MadarLogo,
} from '../icons/PaymentMethodIcons';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';

interface PaymentMethodCardProps {
  method: PaymentMethodConfig;
  isSelected: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

// دالة للحصول على نص نوع التحقق
const getVerificationTypeText = (type: VerificationType): string => {
  switch (type) {
    case 'phone':
      return 'هاتف';
    case 'email':
      return 'بريد';
    case 'two_factor':
    case 'twoFactor':
      return '2FA';
    case 'identity':
      return 'هوية';
    case 'payment':
      return 'دفع';
    default:
      return type;
  }
};

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  isSelected,
  isDisabled = false,
  onClick,
}) => {
  const cardClasses = `
    relative p-4 rounded-lg border-2 transition-all text-right cursor-pointer
    ${
      isSelected
        ? 'border-blue-500 bg-blue-50 shadow-md'
        : method.available && !isDisabled
          ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
    }
  `;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!method.available || isDisabled}
      className={cardClasses}
    >
      <div className="flex items-start gap-3">
        {/* أيقونة طريقة الدفع */}
        {method.id === 'libyana_card' ? (
          <LibyanaLogo className="h-12 w-12" size={48} />
        ) : method.id === 'madar_card' ? (
          <MadarLogo className="h-12 w-12" size={48} />
        ) : (
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm`}
          >
            {getPaymentMethodIcon(method.id, { className: 'w-6 h-6' })}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* اسم طريقة الدفع والعلامات */}
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{method.name}</h3>
            {method.popular && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                شائع
              </span>
            )}
            {!method.available && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                قريباً
              </span>
            )}
          </div>

          {/* وصف طريقة الدفع */}
          <p className="mb-2 line-clamp-2 text-sm text-gray-600">{method.description}</p>

          {/* معلومات الرسوم والحدود */}
          <div className="mb-2 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">الرسوم:</span>
              <span className="text-xs font-medium text-gray-700">
                {method.fees.deposit > 0 && `${method.fees.deposit} د.ل`}
                {method.fees.deposit === 0 && 'بدون رسوم'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{method.processingTime.deposit}</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">الحدود:</span>
              <span className="text-xs text-gray-700">
                {method.limits.min} - {method.limits.max.toLocaleString()} د.ل
              </span>
            </div>
          </div>

          {/* متطلبات التحقق */}
          <div className="mb-2 flex items-center gap-1">
            <VerificationIcon className="h-3 w-3 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {method.requiredVerifications.map((verification, index) => (
                <span
                  key={index}
                  className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                >
                  {getVerificationTypeText(verification)}
                </span>
              ))}
            </div>
          </div>

          {/* العملات المدعومة */}
          {method.supportedCurrencies.length > 1 && (
            <div className="mb-2 flex items-center gap-1">
              <span className="text-xs text-gray-500">العملات:</span>
              <div className="flex gap-1">
                {method.supportedCurrencies.slice(0, 3).map((currency, index) => (
                  <span
                    key={index}
                    className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600"
                  >
                    {currency}
                  </span>
                ))}
                {method.supportedCurrencies.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{method.supportedCurrencies.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* تحذيرات خاصة */}
          {method.securityLevel === 'maximum' && (
            <div className="mt-2 flex items-center gap-1">
              <ExclamationTriangleIcon className="h-3 w-3 text-amber-600" />
              <span className="text-xs font-medium text-amber-600">يتطلب تحققات أمان إضافية</span>
            </div>
          )}
        </div>
      </div>

      {/* مؤشر الاختيار */}
      {isSelected && (
        <div className="absolute left-2 top-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shadow-sm">
            <CheckCircleIcon className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      {/* طبقة التعطيل */}
      {!method.available && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-75">
          <span className="text-sm font-medium text-gray-500">قريباً</span>
        </div>
      )}
    </button>
  );
};

export default PaymentMethodCard;
