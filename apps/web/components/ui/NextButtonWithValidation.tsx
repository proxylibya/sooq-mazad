import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import React from 'react';
import { ForwardIcon } from '../common/icons/RTLIcon';

interface NextButtonWithValidationProps {
  onClick: () => void;
  errors: Record<string, string>;
  hasUserInteracted: boolean;
  isSubmitting?: boolean;
  submitText?: string;
  nextText?: string;
  isLastStep?: boolean;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const NextButtonWithValidation: React.FC<NextButtonWithValidationProps> = ({
  onClick,
  errors,
  hasUserInteracted,
  isSubmitting = false,
  submitText = 'إرسال',
  nextText = 'التالي',
  isLastStep = false,
  className = '',
  disabled = false,
  variant = 'primary',
  size = 'md',
  showIcon = true,
}) => {
  // التحقق من وجود أخطاء
  const hasErrors = Object.keys(errors).length > 0;
  const shouldShowErrors = hasErrors && hasUserInteracted;

  // تحديد ما إذا كان الزر معطلاً
  const isDisabled = disabled || isSubmitting || shouldShowErrors;

  // الحصول على النص المناسب للزر
  const getButtonText = () => {
    if (isSubmitting) {
      return '';
    }
    return isLastStep ? submitText : nextText;
  };

  // الحصول على الأيقونة المناسبة
  const getIcon = () => {
    if (isSubmitting) {
      return (
        <div
          className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
          style={{ width: 24, height: 24 }}
          role="status"
          aria-label="جاري التحميل"
        />
      );
    }
    if (isLastStep) {
      return <CheckIcon className="h-4 w-4" />;
    }
    return <ForwardIcon className="h-4 w-4" />;
  };

  // أنماط الحجم
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // أنماط المتغيرات
  const getVariantClasses = () => {
    if (isDisabled) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }

    switch (variant) {
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
      case 'primary':
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  // الحصول على رسالة الخطأ الأولى
  const getFirstError = () => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      return errors[errorKeys[0]];
    }
    return null;
  };

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={`inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${sizeClasses[size]} ${getVariantClasses()} ${!isDisabled ? 'shadow-sm hover:shadow-md active:scale-95' : ''} ${className} `}
      >
        {showIcon && getIcon()}
        <span>{getButtonText()}</span>
        {isSubmitting && (
          <span className="sr-only">{isLastStep ? 'جاري الإرسال' : 'جاري المعالجة'}</span>
        )}
      </button>

      {/* عرض رسالة الخطأ إذا كانت موجودة */}
      {shouldShowErrors && (
        <div className="mt-2 flex max-w-xs items-start gap-1">
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-right text-sm font-medium text-red-600">{getFirstError()}</p>
        </div>
      )}

      {/* عرض عدد الأخطاء إذا كان أكثر من واحد */}
      {shouldShowErrors && Object.keys(errors).length > 1 && (
        <div className="mt-1 text-right text-xs text-red-500">
          {Object.keys(errors).length - 1} خطأ إضافي
        </div>
      )}

      {/* مؤشر التقدم للإرسال */}
      {isSubmitting && (
        <div className="mt-2 h-1 w-full rounded-full bg-gray-200">
          <div
            className="h-1 animate-pulse rounded-full bg-blue-600"
            style={{ width: '60%' }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default NextButtonWithValidation;
