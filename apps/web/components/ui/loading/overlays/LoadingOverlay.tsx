/**
 * LoadingOverlay - طبقات التحميل
 * نظام التحميل العالمي الموحد - سوق مزاد
 *
 * @description مكونات overlay للتحميل بأنواع مختلفة
 * @version 2.0.0
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { useLoading } from '../LoadingProvider';
import {
  DotsSpinner,
  PulseSpinner,
  RingSpinner,
  Spinner,
  SpinnerColor,
  SpinnerSize,
} from '../spinners/Spinner';

// ============================================
// Types
// ============================================

export type OverlayVariant = 'blur' | 'solid' | 'transparent' | 'gradient';
export type SpinnerVariant = 'spinner' | 'dots' | 'pulse' | 'ring';

export interface LoadingOverlayProps {
  /** إظهار الطبقة */
  visible?: boolean;
  /** نص التحميل */
  message?: string;
  /** نمط الطبقة */
  variant?: OverlayVariant;
  /** نوع الـ spinner */
  spinnerVariant?: SpinnerVariant;
  /** حجم الـ spinner */
  spinnerSize?: SpinnerSize;
  /** لون الـ spinner */
  spinnerColor?: SpinnerColor;
  /** ملء الشاشة بالكامل */
  fullScreen?: boolean;
  /** كلاسات إضافية */
  className?: string;
  /** z-index */
  zIndex?: number;
  /** إمكانية الإغلاق */
  closeable?: boolean;
  /** callback عند الإغلاق */
  onClose?: () => void;
  /** محتوى إضافي */
  children?: ReactNode;
}

// ============================================
// Variant Styles
// ============================================

const variantClasses: Record<OverlayVariant, string> = {
  blur: 'bg-white/70 backdrop-blur-sm dark:bg-gray-900/70',
  solid: 'bg-white dark:bg-gray-900',
  transparent: 'bg-black/50',
  gradient: 'bg-gradient-to-br from-blue-600/90 to-indigo-600/90',
};

// ============================================
// LoadingOverlay Component
// ============================================

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = true,
  message = 'جاري التحميل...',
  variant = 'blur',
  spinnerVariant = 'spinner',
  spinnerSize = 'lg',
  spinnerColor = 'blue',
  fullScreen = false,
  className = '',
  zIndex = 50,
  closeable = false,
  onClose,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  if (!isVisible) return null;

  // اختيار spinner حسب النوع
  const SpinnerComponent = {
    spinner: Spinner,
    dots: DotsSpinner,
    pulse: PulseSpinner,
    ring: RingSpinner,
  }[spinnerVariant];

  // تحديد لون الـ spinner حسب الـ variant
  const effectiveSpinnerColor: SpinnerColor =
    variant === 'gradient' || variant === 'transparent' ? 'white' : spinnerColor;

  // تحديد لون النص
  const textColorClass =
    variant === 'gradient' || variant === 'transparent'
      ? 'text-white'
      : 'text-gray-700 dark:text-gray-300';

  return (
    <div
      className={` ${fullScreen ? 'fixed inset-0' : 'absolute inset-0'} flex items-center justify-center ${variantClasses[variant]} ${className} `.trim()}
      style={{ zIndex }}
      onClick={closeable ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <SpinnerComponent size={spinnerSize} color={effectiveSpinnerColor} />

        {message && (
          <p className={`text-center text-sm font-medium ${textColorClass}`}>{message}</p>
        )}

        {children}

        {closeable && (
          <button
            onClick={onClose}
            className={`mt-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              variant === 'gradient' || variant === 'transparent'
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            } `.trim()}
          >
            إلغاء
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// FullPageLoader - تحميل صفحة كاملة
// ============================================

export const FullPageLoader: React.FC<{
  message?: string;
  variant?: OverlayVariant;
  spinnerVariant?: SpinnerVariant;
}> = ({ message = 'جاري تحميل الصفحة...', variant = 'blur', spinnerVariant = 'spinner' }) => (
  <LoadingOverlay
    visible
    fullScreen
    message={message}
    variant={variant}
    spinnerVariant={spinnerVariant}
    spinnerSize="xl"
    zIndex={9999}
  />
);

// ============================================
// SectionLoader - تحميل قسم
// ============================================

export const SectionLoader: React.FC<{
  message?: string;
  minHeight?: string | number;
  className?: string;
}> = ({ message = 'جاري التحميل...', minHeight = 200, className = '' }) => (
  <div
    className={`relative w-full ${className}`}
    style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
  >
    <LoadingOverlay visible message={message} variant="blur" spinnerSize="md" />
  </div>
);

// ============================================
// ButtonLoader - تحميل داخل زر
// ============================================

export const ButtonLoader: React.FC<{
  size?: SpinnerSize;
  color?: SpinnerColor;
}> = ({ size = 'sm', color = 'white' }) => <Spinner size={size} color={color} />;

// ============================================
// InlineLoader - تحميل في السطر
// ============================================

export const InlineLoader: React.FC<{
  message?: string;
  size?: SpinnerSize;
  color?: SpinnerColor;
}> = ({ message, size = 'sm', color = 'blue' }) => (
  <span className="inline-flex items-center gap-2">
    <Spinner size={size} color={color} />
    {message && <span className="text-sm text-gray-600">{message}</span>}
  </span>
);

// ============================================
// NavigationLoader - تحميل التنقل (شريط علوي)
// ============================================

export const NavigationLoader: React.FC<{
  visible?: boolean;
  color?: string;
}> = ({ visible = true, color = 'bg-blue-600' }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 200);
      return () => clearTimeout(timeout);
    }

    setProgress(30);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[9999] h-1">
      <div
        className={`h-full ${color} transition-all duration-300 ease-out`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// ============================================
// GlobalNavigationLoader - مكون متصل بـ Context
// ============================================

export const GlobalNavigationLoader: React.FC = () => {
  const { isPageTransitioning } = useLoading();
  return <NavigationLoader visible={isPageTransitioning} />;
};

// ============================================
// تصدير افتراضي
// ============================================

export default LoadingOverlay;
