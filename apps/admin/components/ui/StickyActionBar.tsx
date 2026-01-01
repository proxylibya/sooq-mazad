/**
 * مكون شريط الأزرار الثابت
 * Sticky Action Bar Component
 * يظهر دائماً في أسفل الشاشة لسهولة الوصول
 */

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  icon?: 'prev' | 'next' | 'none' | React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
}

interface StickyActionBarProps {
  /** زر الجانب الأيمن (عادة السابق أو إلغاء) */
  leftButton?: ActionButton;
  /** زر الجانب الأيسر (عادة التالي أو حفظ) */
  rightButton?: ActionButton;
  /** أزرار إضافية في المنتصف */
  centerButtons?: ActionButton[];
  /** إظهار خلفية شفافة */
  transparent?: boolean;
  /** محتوى مخصص بالكامل */
  children?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-600/50',
  secondary: 'border border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600',
  success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-600/50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50',
  warning: 'bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-600/50',
};

function ActionButtonComponent({ button }: { button: ActionButton }) {
  const variant = button.variant || 'secondary';
  const isLoading = button.loading;
  const isDisabled = button.disabled || isLoading;

  const renderIcon = () => {
    if (isLoading) {
      return (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      );
    }

    // ملاحظة: الأسهم معكوسة للغة العربية (RTL)
    // السابق = سهم لليمين، التالي = سهم لليسار
    if (button.icon === 'prev') {
      return <ArrowRightIcon className="h-5 w-5" />;
    }
    if (button.icon === 'next') {
      return <ArrowLeftIcon className="h-5 w-5" />;
    }
    if (button.icon && button.icon !== 'none') {
      return button.icon;
    }
    return null;
  };

  const iconPosition = button.icon === 'next' ? 'after' : 'before';

  return (
    <button
      onClick={button.onClick}
      disabled={isDisabled}
      className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} `}
    >
      {iconPosition === 'before' && renderIcon()}
      <span>{isLoading && button.loadingText ? button.loadingText : button.label}</span>
      {iconPosition === 'after' && renderIcon()}
    </button>
  );
}

export default function StickyActionBar({
  leftButton,
  rightButton,
  centerButtons,
  transparent = false,
  children,
}: StickyActionBarProps) {
  return (
    <>
      {/* Spacer لمنع المحتوى من الاختفاء خلف الشريط الثابت */}
      <div className="h-24" />

      {/* الشريط الثابت */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700 ${transparent ? 'bg-slate-900/80 backdrop-blur-lg' : 'bg-slate-900'} shadow-[0_-4px_20px_rgba(0,0,0,0.3)]`}
      >
        <div className="mx-auto max-w-4xl px-4 py-4">
          {children ? (
            children
          ) : (
            <div className="flex items-center justify-between gap-4">
              {/* الجانب الأيمن */}
              <div className="flex items-center gap-3">
                {leftButton && <ActionButtonComponent button={leftButton} />}
              </div>

              {/* المنتصف */}
              {centerButtons && centerButtons.length > 0 && (
                <div className="flex items-center gap-3">
                  {centerButtons.map((btn, index) => (
                    <ActionButtonComponent key={index} button={btn} />
                  ))}
                </div>
              )}

              {/* الجانب الأيسر */}
              <div className="flex items-center gap-3">
                {rightButton && <ActionButtonComponent button={rightButton} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * مكون Spacer منفصل يمكن استخدامه في أي مكان
 * لإضافة مساحة في نهاية المحتوى
 */
export function StickyBarSpacer({ height = 24 }: { height?: number }) {
  return <div style={{ height: `${height * 4}px` }} />;
}
