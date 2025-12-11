import React from 'react';
import { useRouter } from 'next/router';
import { BackIcon } from '../../icons/RTLIcon';

interface BackButtonProps {
  /** الرابط للعودة إليه */
  href?: string;
  /** النص المعروض بجانب الأيقونة */
  text?: string;
  /** فئات CSS إضافية */
  className?: string;
  /** نمط الزر */
  variant?: 'default' | 'purple' | 'green' | 'blue' | 'gray';
  /** حجم الزر */
  size?: 'sm' | 'md' | 'lg';
  /** دالة مخصصة للنقر (بدلاً من التنقل) */
  onClick?: () => void;
  /** إخفاء النص وعرض الأيقونة فقط */
  iconOnly?: boolean;
  /** تعطيل الزر */
  disabled?: boolean;
}

/**
 * مكون زر رجوع موحد يستخدم الأيقونة الصحيحة للعربية
 * يدعم التنقل التلقائي أو الدوال المخصصة
 */
const BackButton: React.FC<BackButtonProps> = ({
  href,
  text = 'رجوع',
  className = '',
  variant = 'default',
  size = 'md',
  onClick,
  iconOnly = false,
  disabled = false,
}) => {
  const router = useRouter();

  // أنماط الألوان المختلفة - ألوان رسمية محسّنة
  const variantStyles = {
    default:
      'text-gray-700 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border-gray-300 hover:border-blue-400 hover:shadow-md',
    purple:
      'text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border-purple-300 hover:shadow-md',
    green:
      'text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border-emerald-300 hover:shadow-md',
    blue: 'text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border-blue-300 hover:shadow-md',
    gray: 'text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border-gray-300 hover:shadow-md',
  };

  // أحجام مختلفة مع تحسينات في الحجم
  const sizeStyles = {
    sm: {
      container: 'p-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-1.5',
    },
    md: {
      container: 'p-2.5',
      icon: 'w-5 h-5',
      text: 'text-base',
      gap: 'gap-2',
    },
    lg: {
      container: 'p-3',
      icon: 'w-6 h-6',
      text: 'text-lg',
      gap: 'gap-2.5',
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  // تحديد الفئات النهائية مع تحسينات في التصميم
  const buttonClasses = `
    inline-flex items-center justify-center ${currentSize.gap} ${currentSize.container}
    rounded-full border transition-all duration-200 font-medium
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${currentVariant}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${iconOnly ? 'aspect-square' : ''}
    ${className}
  `.trim();

  // دالة التعامل مع النقر
  const handleClick = () => {
    if (disabled) return;

    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  // محتوى الزر
  const buttonContent = (
    <>
      <BackIcon className={currentSize.icon} />
      {!iconOnly && <span className={currentSize.text}>{text}</span>}
    </>
  );

  // إذا كان هناك رابط محدد، استخدم button مع onClick
  if (href && !onClick) {
    return (
      <button
        onClick={() => router.push(href)}
        className={`no-flip-icon ${buttonClasses}`}
        disabled={disabled}
        type="button"
        aria-label="رجوع"
      >
        {buttonContent}
      </button>
    );
  }

  // وإلا استخدم button عادي
  return (
    <button
      onClick={handleClick}
      className={`no-flip-icon ${buttonClasses}`}
      disabled={disabled}
      type="button"
      aria-label="رجوع"
    >
      {buttonContent}
    </button>
  );
};

export default BackButton;

// مكونات مساعدة للاستخدامات الشائعة
export const WalletBackButton: React.FC<Omit<BackButtonProps, 'href' | 'text' | 'variant'>> = (
  props,
) => <BackButton href="/wallet" text="العودة للمحفظة" variant="purple" {...props} />;

export const HomeBackButton: React.FC<Omit<BackButtonProps, 'href' | 'text'>> = (props) => (
  <BackButton href="/" text="العودة للرئيسية" {...props} />
);

export const SimpleBackButton: React.FC<Omit<BackButtonProps, 'href' | 'text'>> = (props) => (
  <BackButton text="رجوع" {...props} />
);
