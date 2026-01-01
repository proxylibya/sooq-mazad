/**
 * ============================================================
 * 🎯 نظام التنقل الموحد والمحسن
 * Unified Page Transition System
 * ============================================================
 *
 * يجمع بين:
 * - شريط تقدم علوي أنيق
 * - سبينر مركزي احترافي
 * - تأثيرات انتقال سلسة
 * - دعم RTL و Dark Mode
 *
 * الاستخدام في _app.tsx:
 * <UnifiedPageTransition>
 *   <Component {...pageProps} />
 * </UnifiedPageTransition>
 */

import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================
// TYPES & INTERFACES
// ============================================================

export type TransitionMode = 'none' | 'fade' | 'slide' | 'scale';
export type SpinnerStyle = 'simple' | 'dots' | 'pulse' | 'gradient';

export interface TransitionConfig {
  /** إظهار شريط التقدم العلوي */
  showProgressBar: boolean;
  /** إظهار السبينر المركزي */
  showSpinner: boolean;
  /** تأخير إظهار السبينر (ms) */
  spinnerDelay: number;
  /** لون شريط التقدم */
  progressColor: string;
  /** ارتفاع شريط التقدم */
  progressHeight: number;
  /** نمط الانتقال */
  transitionMode: TransitionMode;
  /** نص التحميل */
  loadingText: string;
  /** تفعيل blur للخلفية */
  enableBlur: boolean;
  /** نمط السبينر */
  spinnerStyle: SpinnerStyle;
}

const DEFAULT_CONFIG: TransitionConfig = {
  showProgressBar: true,
  showSpinner: true,
  spinnerDelay: 200,
  progressColor: '#3b82f6',
  progressHeight: 3,
  transitionMode: 'fade',
  loadingText: 'جاري التحميل...',
  enableBlur: true,
  spinnerStyle: 'simple',
};

// ============================================================
// SIMPLE ELEGANT SPINNER - دائرة بسيطة وجميلة
// ============================================================

interface SimpleSpinnerProps {
  size?: number;
}

const SimpleSpinner: React.FC<SimpleSpinnerProps> = ({ size = 48 }) => {
  return (
    <div
      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
      style={{
        width: size,
        height: size,
      }}
      role="status"
      aria-label="جاري التحميل"
    />
  );
};

// ============================================================
// PROGRESS BAR COMPONENT
// ============================================================

interface ProgressBarProps {
  progress: number;
  visible: boolean;
  color: string;
  height: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, visible, color, height }) => {
  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[99999]"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="تقدم تحميل الصفحة"
    >
      {/* الخلفية */}
      <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-700/50" />

      {/* شريط التقدم */}
      <div
        className="absolute left-0 top-0 h-full transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${color}, ${color}dd, ${color})`,
          opacity: visible ? 1 : 0,
          boxShadow: `0 0 15px ${color}60, 0 0 5px ${color}40`,
        }}
      />

      {/* تأثير اللمعان */}
      {visible && progress < 100 && (
        <div
          className="animate-shimmer absolute top-0 h-full w-32"
          style={{
            left: `${Math.min(progress - 15, 80)}%`,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          }}
        />
      )}
    </div>
  );
};

// ============================================================
// CENTER LOADER COMPONENT
// ============================================================

interface CenterLoaderProps {
  visible: boolean;
  text: string;
  enableBlur: boolean;
  spinnerStyle: SpinnerStyle;
  progressColor: string;
}

const CenterLoader: React.FC<CenterLoaderProps> = ({
  visible,
  text,
  enableBlur,
  spinnerStyle,
  progressColor,
}) => {
  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99998] flex items-center justify-center transition-opacity duration-200 ${enableBlur ? 'backdrop-blur-sm' : ''}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
      }}
      role="alert"
      aria-live="assertive"
      aria-busy="true"
    >
      {/* دائرة متحركة فقط */}
      <SimpleSpinner size={56} />
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export interface UnifiedPageTransitionProps {
  children: React.ReactNode;
  config?: Partial<TransitionConfig>;
}

const UnifiedPageTransition: React.FC<UnifiedPageTransitionProps> = ({
  children,
  config: customConfig = {},
}) => {
  const config = { ...DEFAULT_CONFIG, ...customConfig };
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSpinner, setShowSpinner] = useState(false);

  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const spinnerTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  // تنظيف المؤقتات
  const clearTimers = useCallback(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    if (spinnerTimer.current) {
      window.clearTimeout(spinnerTimer.current);
      spinnerTimer.current = null;
    }
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  // بدء التحميل
  const startLoading = useCallback(() => {
    clearTimers();
    setIsLoading(true);
    setProgress(0);
    setShowSpinner(false);

    // محاكاة التقدم
    progressTimer.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev;
        // تسارع سريع في البداية ثم بطيء
        const increment = prev < 30 ? 12 : prev < 60 ? 6 : prev < 80 ? 3 : 1;
        return Math.min(prev + increment, 85);
      });
    }, 100);

    // إظهار السبينر بعد التأخير
    if (config.showSpinner) {
      spinnerTimer.current = window.setTimeout(() => {
        setShowSpinner(true);
      }, config.spinnerDelay);
    }
  }, [clearTimers, config.showSpinner, config.spinnerDelay]);

  // إنهاء التحميل
  const stopLoading = useCallback(() => {
    clearTimers();
    setProgress(100);
    setShowSpinner(false);

    hideTimer.current = window.setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 150);
  }, [clearTimers]);

  // الاستماع لأحداث التوجيه
  useEffect(() => {
    router.events.on('routeChangeStart', startLoading);
    router.events.on('routeChangeComplete', stopLoading);
    router.events.on('routeChangeError', stopLoading);

    return () => {
      router.events.off('routeChangeStart', startLoading);
      router.events.off('routeChangeComplete', stopLoading);
      router.events.off('routeChangeError', stopLoading);
      clearTimers();
    };
  }, [router.events, startLoading, stopLoading, clearTimers]);

  // أنماط الانتقال للمحتوى
  const getContentStyle = (): React.CSSProperties => {
    if (config.transitionMode === 'none' || !isLoading) {
      return { opacity: 1, transform: 'none' };
    }

    switch (config.transitionMode) {
      case 'fade':
        return {
          opacity: isLoading ? 0.7 : 1,
          transition: 'opacity 200ms ease-out',
        };
      case 'slide':
        return {
          opacity: isLoading ? 0.8 : 1,
          transform: isLoading ? 'translateY(4px)' : 'translateY(0)',
          transition: 'opacity 200ms ease-out, transform 200ms ease-out',
        };
      case 'scale':
        return {
          opacity: isLoading ? 0.8 : 1,
          transform: isLoading ? 'scale(0.995)' : 'scale(1)',
          transition: 'opacity 200ms ease-out, transform 200ms ease-out',
        };
      default:
        return {};
    }
  };

  return (
    <>
      {/* شريط التقدم العلوي */}
      {config.showProgressBar && (
        <ProgressBar
          progress={progress}
          visible={isLoading}
          color={config.progressColor}
          height={config.progressHeight}
        />
      )}

      {/* السبينر المركزي */}
      <CenterLoader
        visible={showSpinner}
        text={config.loadingText}
        enableBlur={config.enableBlur}
        spinnerStyle={config.spinnerStyle}
        progressColor={config.progressColor}
      />

      {/* المحتوى مع تأثير الانتقال */}
      <div style={getContentStyle()}>{children}</div>

      {/* أنماط CSS المطلوبة */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }

        @keyframes progress-bar {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .animate-progress-bar {
          animation: progress-bar 1.5s linear infinite;
        }
      `}</style>
    </>
  );
};

// ============================================================
// EXPORTS
// ============================================================

export default UnifiedPageTransition;
export { CenterLoader, ProgressBar, SimpleSpinner };
