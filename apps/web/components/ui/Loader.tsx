import React from 'react';

export type LoaderVariant = 'spinner' | 'pulse' | 'dots';
export type LoaderSize = 'sm' | 'md' | 'lg';

export interface LoaderProps {
  /** النص الذي سيظهر بجانب المؤثر */
  message?: string;
  /** تفعيل غطاء ملء الشاشة بشفافية وتمويه خلفي */
  fullScreen?: boolean;
  /** نمط المؤثر: دوران، نبض، نقاط */
  variant?: LoaderVariant;
  /** حجم المؤثر */
  size?: LoaderSize;
  /** كلاسـات إضافية للحاوية الداخلية (البطاقة) */
  className?: string;
}

const sizeToBox: Record<LoaderSize, string> = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const textSize: Record<LoaderSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const Loader: React.FC<LoaderProps> = ({
  message = 'جاري التحميل...',
  fullScreen = false,
  variant = 'spinner',
  size = 'md',
  className = '',
}) => {
  const box = sizeToBox[size];
  const tSize = textSize[size];

  const icon = (() => {
    switch (variant) {
      case 'pulse':
        return (
          <span className={`relative inline-flex ${box}`} aria-hidden="true">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-60`}
            />
            <span
              className={`relative inline-flex ${box} rounded-full bg-gradient-to-r from-blue-500 to-indigo-600`}
            />
          </span>
        );
      case 'dots':
        return (
          <span className="inline-flex items-center gap-1" aria-hidden="true">
            <span
              className={`${size === 'sm' ? 'h-1.5 w-1.5' : size === 'lg' ? 'h-2.5 w-2.5' : 'h-2 w-2'} inline-block animate-bounce rounded-full bg-blue-600`}
              style={{ animationDelay: '0ms' }}
            />
            <span
              className={`${size === 'sm' ? 'h-1.5 w-1.5' : size === 'lg' ? 'h-2.5 w-2.5' : 'h-2 w-2'} inline-block animate-bounce rounded-full bg-blue-600`}
              style={{ animationDelay: '150ms' }}
            />
            <span
              className={`${size === 'sm' ? 'h-1.5 w-1.5' : size === 'lg' ? 'h-2.5 w-2.5' : 'h-2 w-2'} inline-block animate-bounce rounded-full bg-blue-600`}
              style={{ animationDelay: '300ms' }}
            />
          </span>
        );
      case 'spinner':
      default:
        return (
          <span
            className={`inline-block ${box} animate-spin rounded-full border-4 border-blue-600/25 border-t-blue-600`}
            aria-hidden="true"
          />
        );
    }
  })();

  return (
    <div
      className={`${
        fullScreen
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-gray-900/70'
          : 'flex items-center justify-center'
      }`}
    >
      <div
        className={`inline-flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3 shadow-lg ring-1 ring-gray-900/10 backdrop-blur dark:bg-gray-800/90 ${className}`}
      >
        {icon}
        <p className={`text-gray-700 dark:text-gray-300 ${tSize}`}>{message}</p>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  );
};

export default Loader;
