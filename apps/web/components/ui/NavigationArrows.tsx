/**
 * 🚀 مكون أسهم التنقل المُحسَّن للأداء
 * نظام موحد وسريع للتنقل بين الصور
 */

import React, { memo } from 'react';

interface NavigationArrowsProps {
  /** دالة الانتقال للصورة السابقة */
  onPrevious: (e: React.MouseEvent) => void;
  /** دالة الانتقال للصورة التالية */
  onNext: (e: React.MouseEvent) => void;
  /** إظهار الأسهم أم لا */
  show: boolean;
  /** فئات CSS إضافية */
  className?: string;
  /** تعطيل الأزرار */
  disabled?: boolean;
  /** إخفاء السهم السابق */
  hidePrevious?: boolean;
  /** إخفاء السهم التالي */
  hideNext?: boolean;
  /** إظهار مؤشرات الصور */
  showIndicators?: boolean;
  /** الفهرس الحالي للصورة */
  currentIndex?: number;
  /** العدد الإجمالي للصور */
  totalImages?: number;
  /** جعل الأسهم مرئية دائماً */
  alwaysVisible?: boolean;
}

/**
 * مكون أسهم التنقل الموحد والمُحسَّن للأداء
 * يضمن الاتساق والسرعة في جميع أنحاء التطبيق
 */
const NavigationArrows: React.FC<NavigationArrowsProps> = memo(
  ({
    onPrevious,
    onNext,
    show,
    className = '',
    disabled = false,
    hidePrevious = false,
    hideNext = false,
    showIndicators = false,
    currentIndex = 0,
    totalImages = 0,
    alwaysVisible = false,
  }) => {
    if (!show) return null;

    // ⚠️ تحذير مهم: لا تغير اتجاه الأسهم!
    // هذه الأسهم تم إصلاحها بعد مشكلة عكس الاتجاه
    // [محمي] d='M15 19l-7-7 7-7' للسهم الأيسر
    // [محمي] d='M9 5l7 7-7 7' للسهم الأيمن

    // 🚀 استخدام CSS classes المُحسَّنة للأداء
    const buttonBaseClasses = disabled
      ? 'gallery-nav-btn cursor-not-allowed opacity-50'
      : alwaysVisible
        ? 'gallery-nav-btn'
        : 'gallery-nav-btn opacity-0 group-hover:opacity-100';

    return (
      <>
        {/* السهم الأيسر - للصورة السابقة */}
        {!hidePrevious && (
          <button
            onClick={(e) => {
              if (disabled) return;
              e.preventDefault();
              e.stopPropagation();
              // 🚀 استخدام requestAnimationFrame للأداء الأمثل
              requestAnimationFrame(() => onPrevious(e));
            }}
            className={`${buttonBaseClasses} gallery-nav-btn--left ${className}`}
            aria-label="الصورة السابقة"
            type="button"
            disabled={disabled}
          >
            <svg
              className="gallery-icon text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* السهم الأيمن - للصورة التالية */}
        {!hideNext && (
          <button
            onClick={(e) => {
              if (disabled) return;
              e.preventDefault();
              e.stopPropagation();
              // 🚀 استخدام requestAnimationFrame للأداء الأمثل
              requestAnimationFrame(() => onNext(e));
            }}
            className={`${buttonBaseClasses} gallery-nav-btn--right ${className}`}
            aria-label="الصورة التالية"
            type="button"
            disabled={disabled}
          >
            <svg
              className="gallery-icon text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* مؤشرات الصور */}
        {showIndicators && totalImages > 1 && (
          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 transform gap-2">
            {Array.from({ length: totalImages }, (_, index) => (
              <div
                key={index}
                className={`gpu-accelerated h-2 w-2 rounded-full ${
                  index === currentIndex
                    ? 'scale-110 bg-white shadow-lg'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                style={{ transition: 'all 100ms cubic-bezier(0.2, 0, 0, 1)' }}
                aria-label={`الصورة ${index + 1} من ${totalImages}`}
              />
            ))}
          </div>
        )}
      </>
    );
  },
);

export default NavigationArrows;

// المكون الموحد - الواجهة الرئيسية للاستخدام
export const UnifiedNavigationArrows: React.FC<Omit<NavigationArrowsProps, 'className'>> = (
  props,
) => <NavigationArrows {...props} className="unified-navigation-arrows" />;
