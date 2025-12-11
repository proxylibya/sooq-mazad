import React, { useState } from 'react';
import { SecurityCheck, VerificationType } from '../../types/wallet';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import DevicePhoneMobileIcon from '@heroicons/react/24/outline/DevicePhoneMobileIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';
import LockClosedIcon from '@heroicons/react/24/outline/LockClosedIcon';
import BuildingLibraryIcon from '@heroicons/react/24/outline/BuildingLibraryIcon';
import { SecurityIcon, VerificationIcon } from '../icons/PaymentMethodIcons';

interface SecurityChecksDisplayProps {
  securityChecks: SecurityCheck[];
  onVerificationComplete?: (checkId: string, success: boolean) => void;
  className?: string;
}

// دالة للحصول على أيقونة نوع التحقق
const getVerificationIcon = (type: VerificationType) => {
  switch (type) {
    case 'phone':
      return <DevicePhoneMobileIcon className="h-4 w-4" />;
    case 'email':
      return <EnvelopeIcon className="h-4 w-4" />;
    case 'two_factor':
    case 'twoFactor':
      return <LockClosedIcon className="h-4 w-4" />;
    case 'identity':
      return <BuildingLibraryIcon className="h-4 w-4" />;
    case 'payment':
      return <VerificationIcon className="h-4 w-4" />;
    default:
      return <VerificationIcon className="h-4 w-4" />;
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

// دالة للحصول على وصف نوع التحقق
const getVerificationDescription = (type: VerificationType): string => {
  switch (type) {
    case 'phone':
      return 'سيتم إرسال رمز تحقق إلى رقم هاتفك المسجل';
    case 'email':
      return 'سيتم إرسال رمز تحقق إلى بريدك الإلكتروني';
    case 'two_factor':
    case 'twoFactor':
      return 'استخدم تطبيق المصادقة الثنائية للحصول على الرمز';
    case 'identity':
      return 'سيتم التحقق من هويتك';
    case 'payment':
      return 'سيتم التحقق من طريقة الدفع';
    default:
      return 'تحقق إضافي مطلوب';
  }
};

// دالة للحصول على لون حالة التحقق
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'verified':
      return 'text-green-600 bg-green-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// دالة للحصول على أيقونة حالة التحقق
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'verified':
      return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
    case 'failed':
      return <XCircleIcon className="h-4 w-4 text-red-600" />;
    case 'pending':
      return <ClockIcon className="h-4 w-4 text-yellow-600" />;
    default:
      return <ExclamationTriangleIcon className="h-4 w-4 text-gray-600" />;
  }
};

// مكون عرض فحص أمان واحد
const SecurityCheckItem: React.FC<{
  check: SecurityCheck;
  onVerificationComplete?: (checkId: string, success: boolean) => void;
}> = ({ check, onVerificationComplete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode.trim()) return;

    setIsVerifying(true);

    // محاكاة عملية التحقق
    setTimeout(() => {
      const success = verificationCode === '123456'; // رمز تجريبي
      onVerificationComplete?.(check.id, success);
      setIsVerifying(false);
      if (success) {
        setIsExpanded(false);
        setVerificationCode('');
      }
    }, 1500);
  };

  const isExpired = false;
  const timeRemaining = 0;

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{getVerificationIcon(check.type)}</div>
          <div className="flex-1">
            <h6 className="text-sm font-medium text-gray-900">
              {getVerificationTypeText(check.type)}
            </h6>
            <p className="text-xs text-gray-600">{getVerificationDescription(check.type)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(check.status)}`}>
            {check.status === 'pending'
              ? 'في الانتظار'
              : check.status === 'verified'
                ? 'مكتمل'
                : check.status === 'failed'
                  ? 'فشل'
                  : check.status}
          </span>
          {getStatusIcon(check.status)}
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="mt-2 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>مطلوب: {check.required ? 'نعم' : 'لا'}</span>
          {check.completedAt && (
            <span>مكتمل في: {new Date(check.completedAt).toLocaleDateString('ar-LY')}</span>
          )}
        </div>
      </div>

      {/* قسم إدخال رمز التحقق */}
      {check.status === 'pending' && !isExpired && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 transition-colors hover:text-blue-700"
          >
            {isExpanded ? 'إخفاء' : 'إدخال رمز التحقق'}
          </button>

          {isExpanded && (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="أدخل رمز التحقق"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                disabled={isVerifying}
              />
              <button
                onClick={handleVerify}
                disabled={!verificationCode.trim() || isVerifying}
                className="w-full rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isVerifying ? 'جاري التحقق...' : 'تحقق'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* رسالة الفشل */}
      {check.status === 'failed' && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="rounded border border-red-200 bg-red-50 p-2">
            <p className="text-xs text-red-800">فشل التحقق. يرجى المحاولة مرة أخرى.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const SecurityChecksDisplay: React.FC<SecurityChecksDisplayProps> = ({
  securityChecks,
  onVerificationComplete,
  className = '',
}) => {
  if (securityChecks.length === 0) {
    return null;
  }

  const completedChecks = securityChecks.filter((check) => check.status === 'verified').length;
  const totalChecks = securityChecks.length;
  const allCompleted = completedChecks === totalChecks;
  const hasFailedChecks = securityChecks.some((check) => check.status === 'failed');

  return (
    <div className={`rounded-lg border border-yellow-200 bg-yellow-50 p-4 ${className}`}>
      {/* عنوان القسم */}
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-medium text-yellow-900">
          <SecurityIcon className="h-5 w-5 text-yellow-600" />
          فحوصات الأمان المطلوبة
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-sm text-yellow-700">
            {completedChecks}/{totalChecks}
          </span>
          {allCompleted && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="mb-4">
        <div className="h-2 w-full rounded-full bg-yellow-200">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              allCompleted ? 'bg-green-500' : hasFailedChecks ? 'bg-red-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${(completedChecks / totalChecks) * 100}%` }}
          ></div>
        </div>
        <p className="mt-1 text-xs text-yellow-700">
          {allCompleted
            ? 'تم إكمال جميع فحوصات الأمان بنجاح'
            : `${totalChecks - completedChecks} فحص متبقي`}
        </p>
      </div>

      {/* قائمة فحوصات الأمان */}
      <div className="space-y-3">
        {securityChecks.map((check) => (
          <SecurityCheckItem
            key={check.id}
            check={check}
            onVerificationComplete={onVerificationComplete}
          />
        ))}
      </div>

      {/* رسالة تحذيرية */}
      {!allCompleted && (
        <div className="mt-4 border-t border-yellow-200 pt-3">
          <p className="flex items-start gap-2 text-xs text-yellow-700">
            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            يجب إكمال جميع فحوصات الأمان قبل المتابعة. هذه الإجراءات ضرورية لحماية حسابك ومعاملاتك.
          </p>
        </div>
      )}
    </div>
  );
};

export default SecurityChecksDisplay;
