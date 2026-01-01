import React from 'react';
import {
  PaymentMethodConfig,
  SecurityLevel,
  SecurityCheck,
  VerificationType,
} from '../../types/wallet';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import LockClosedIcon from '@heroicons/react/24/outline/LockClosedIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import { SecurityIcon, VerificationIcon } from '../icons/PaymentMethodIcons';

interface TransactionSummaryProps {
  amount: number;
  fees: number;
  netAmount: number;
  method: PaymentMethodConfig;
  securityChecks?: SecurityCheck[];
  className?: string;
}

// دالة للحصول على نص مستوى الأمان
const getSecurityLevelText = (level: SecurityLevel): string => {
  switch (level) {
    case 'low':
      return 'أمان منخفض';
    case 'medium':
      return 'أمان متوسط';
    case 'high':
      return 'أمان عالي';
    case 'maximum':
      return 'أمان فائق';
    default:
      return 'غير محدد';
  }
};

// دالة للحصول على نص نوع التحقق
const getVerificationTypeText = (type: VerificationType): string => {
  switch (type) {
    case 'phone':
      return 'تحقق عبر الهاتف';
    case 'email':
      return 'تحقق عبر البريد الإلكتروني';
    case 'two_factor':
    case 'twoFactor':
      return 'مصادقة ثنائية';
    case 'identity':
      return 'تحقق الهوية';
    case 'payment':
      return 'تحقق الدفع';
    default:
      return type;
  }
};

// دالة لحساب وقت المعالجة المتوقع
const getEstimatedProcessingTime = (method: PaymentMethodConfig): string => {
  const { deposit } = method.processingTime;

  // استخدام وقت الإيداع
  const timeText = deposit || 'غير محدد';

  return timeText;
};

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  amount,
  fees,
  netAmount,
  method,
  securityChecks = [],
  className = '',
}) => {
  const hasSecurityChecks = securityChecks.length > 0;
  const isHighSecurity = method.securityLevel === 'high' || method.securityLevel === 'maximum';

  return (
    <div className={`rounded-lg bg-gray-50 p-4 ${className}`}>
      {/* عنوان القسم */}
      <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
        <InformationCircleIcon className="h-5 w-5 text-blue-600" />
        ملخص المعاملة
      </h4>

      {/* تفاصيل المبالغ */}
      <div className="mb-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">المبلغ المطلوب:</span>
          <span className="font-medium">{amount.toLocaleString('en-US')} د.ل</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">الرسوم:</span>
          <span className={`font-medium ${fees > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {fees > 0 ? `${fees.toFixed(2)} د.ل` : 'بدون رسوم'}
          </span>
        </div>

        <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
          <span>المجموع الإجمالي:</span>
          <span className="flex items-center gap-1 text-blue-600">
            <CurrencyDollarIcon className="h-4 w-4" />
            {netAmount.toFixed(2)} د.ل
          </span>
        </div>
      </div>

      {/* معلومات طريقة الدفع */}
      <div className="mb-4 border-t border-gray-200 pt-3">
        <h5 className="mb-2 font-medium text-gray-800">تفاصيل طريقة الدفع</h5>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">وقت المعالجة:</span>
            <span className="font-medium text-gray-800">{getEstimatedProcessingTime(method)}</span>
          </div>

          <div className="flex items-center gap-2">
            <LockClosedIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">مستوى الأمان:</span>
            <span className={`font-medium ${isHighSecurity ? 'text-red-600' : 'text-green-600'}`}>
              {getSecurityLevelText(method.securityLevel)}
            </span>
          </div>
        </div>
      </div>

      {/* فحوصات الأمان المطلوبة */}
      {hasSecurityChecks && (
        <div className="mb-4 border-t border-gray-200 pt-3">
          <h5 className="mb-2 flex items-center gap-2 font-medium text-gray-800">
            <SecurityIcon className="h-4 w-4 text-yellow-600" />
            فحوصات الأمان المطلوبة
          </h5>
          <div className="space-y-2">
            {securityChecks.map((check, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                <span className="text-gray-700">{getVerificationTypeText(check.type)}</span>
                <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-600">
                  {check.status === 'pending' ? 'في الانتظار' : check.status}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 rounded bg-yellow-50 p-2 text-xs text-yellow-700">
            <ExclamationTriangleIcon className="ml-1 inline h-3 w-3" />
            سيتم طلب هذه التحققات عند المتابعة لضمان أمان المعاملة
          </p>
        </div>
      )}

      {/* تحذيرات خاصة */}
      {method.securityLevel === 'maximum' && (
        <div className="border-t border-gray-200 pt-3">
          <div className="rounded border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">تحذير أمني</p>
                <p className="mt-1 text-xs text-red-700">
                  هذه طريقة دفع عالية الأمان تتطلب تحققات إضافية. قد تستغرق المعالجة وقتاً أطول.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* معلومات إضافية للعملات الرقمية */}
      {method.id === 'CRYPTOCURRENCY' && (
        <div className="border-t border-gray-200 pt-3">
          <div className="rounded border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="mt-0.5 h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">معلومات العملات الرقمية</p>
                <ul className="mt-1 space-y-1 text-xs text-blue-700">
                  <li>• سيتم إنشاء عنوان محفظة مؤقت للدفع</li>
                  <li>• تأكد من إرسال العملة الصحيحة للعنوان المحدد</li>
                  <li>• قد تختلف رسوم الشبكة حسب حالة البلوك تشين</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* معلومات إضافية للتحويل البنكي */}
      {method.id === 'BANK_ACCOUNT' && (
        <div className="border-t border-gray-200 pt-3">
          <div className="rounded border border-green-200 bg-green-50 p-3">
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="mt-0.5 h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">التحويل البنكي</p>
                <ul className="mt-1 space-y-1 text-xs text-green-700">
                  <li>• سيتم خصم المبلغ من حسابك البنكي المربوط</li>
                  <li>• ستصلك رسالة تأكيد عند اكتمال التحويل</li>
                  <li>• يمكن إلغاء المعاملة خلال ساعة من الطلب</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionSummary;
