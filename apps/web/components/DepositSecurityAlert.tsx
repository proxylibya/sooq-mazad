import React from 'react';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import LockClosedIcon from '@heroicons/react/24/outline/LockClosedIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';

interface SecurityLevel {
  level: 'basic' | 'verified' | 'premium';
  isVerified: boolean;
  hasWallet: boolean;
  has2FA: boolean;
  maxDepositAmount: number;
  dailyLimit: number;
}

interface DepositSecurityAlertProps {
  securityLevel: SecurityLevel;
  isAuthenticated: boolean;
  onLogin: () => void;
  onVerify: () => void;
  onSetup2FA: () => void;
}

const DepositSecurityAlert: React.FC<DepositSecurityAlertProps> = ({
  securityLevel,
  isAuthenticated,
  onLogin,
  onVerify,
  onSetup2FA,
}) => {
  // إذا لم يكن مسجل دخول
  if (!isAuthenticated) {
    return (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-bold text-red-900">يجب تسجيل الدخول للإيداع</h3>
            <p className="mb-4 text-red-700">
              لضمان أمان أموالك وحماية حسابك، يجب تسجيل الدخول أولاً قبل إجراء أي عملية إيداع.
            </p>
            <button
              onClick={onLogin}
              className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-700"
            >
              تسجيل الدخول الآن
            </button>
          </div>
        </div>
      </div>
    );
  }

  // عرض مستوى الأمان الحالي
  const getSecurityLevelInfo = () => {
    switch (securityLevel.level) {
      case 'basic':
        return {
          color: 'yellow',
          icon: UserIcon,
          title: 'مستوى أمان أساسي',
          description: 'حسابك يحتاج لتحسينات أمنية إضافية',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
        };
      case 'verified':
        return {
          color: 'blue',
          icon: ShieldCheckIcon,
          title: 'مستوى أمان متوسط',
          description: 'حسابك محقق ولكن يمكن تحسين الأمان أكثر',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        };
      case 'premium':
        return {
          color: 'green',
          icon: CheckCircleIcon,
          title: 'مستوى أمان عالي',
          description: 'حسابك محمي بأعلى مستويات الأمان',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-900',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
        };
    }
  };

  const securityInfo = getSecurityLevelInfo();
  const SecurityIcon = securityInfo.icon;

  return (
    <div className="mb-6 space-y-4">
      {/* مستوى الأمان الحالي */}
      <div className={`${securityInfo.bgColor} border ${securityInfo.borderColor} rounded-xl p-6`}>
        <div className="flex items-start gap-4">
          <div
            className={`h-12 w-12 ${securityInfo.iconBg} flex flex-shrink-0 items-center justify-center rounded-full`}
          >
            <SecurityIcon className={`h-6 w-6 ${securityInfo.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${securityInfo.textColor} mb-2`}>
              {securityInfo.title}
            </h3>
            <p className={`${securityInfo.textColor} mb-4`}>{securityInfo.description}</p>

            {/* معلومات الحدود */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white/50 p-3">
                <p className="text-sm text-gray-600">الحد الأقصى للإيداع</p>
                <p className="text-lg font-bold text-gray-900">
                  {securityLevel.maxDepositAmount.toLocaleString()} د.ل
                </p>
              </div>
              <div className="rounded-lg bg-white/50 p-3">
                <p className="text-sm text-gray-600">الحد اليومي</p>
                <p className="text-lg font-bold text-gray-900">
                  {securityLevel.dailyLimit.toLocaleString()} د.ل
                </p>
              </div>
            </div>

            {/* إجراءات التحسين */}
            {securityLevel.level !== 'premium' && (
              <div className="space-y-2">
                <p className={`text-sm font-medium ${securityInfo.textColor} mb-2`}>
                  لزيادة حدود الإيداع:
                </p>
                <div className="flex flex-wrap gap-2">
                  {!securityLevel.isVerified && (
                    <button
                      onClick={onVerify}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                    >
                      <ShieldCheckIcon className="h-4 w-4" />
                      توثيق الهوية
                    </button>
                  )}
                  {!securityLevel.has2FA && (
                    <button
                      onClick={onSetup2FA}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
                    >
                      <LockClosedIcon className="h-4 w-4" />
                      تفعيل المصادقة الثنائية
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* نصائح الأمان */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h4 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
          <LockClosedIcon className="h-5 w-5 text-gray-600" />
          نصائح الأمان
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            تأكد من أن الرابط يبدأ بـ https://
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            لا تشارك معلومات حسابك مع أي شخص
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            تحقق من عنوان المحفظة قبل الإرسال
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            احتفظ بنسخة احتياطية من معلومات حسابك
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DepositSecurityAlert;
