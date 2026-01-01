/**
 * Spinner - مكونات الدوران
 * نظام التحميل العالمي الموحد - سوق مزاد
 *
 * @description مكونات spinner متنوعة للتحميل
 * @version 2.0.0
 */

import React from 'react';

// ============================================
// Types
// ============================================

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type SpinnerColor = 'blue' | 'white' | 'gray' | 'green' | 'red' | 'amber' | 'primary';

export interface SpinnerProps {
  /** الحجم */
  size?: SpinnerSize;
  /** اللون */
  color?: SpinnerColor;
  /** كلاسات إضافية */
  className?: string;
  /** نص للقارئات الصوتية */
  label?: string;
}

// ============================================
// Size & Color Classes
// ============================================

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
  xl: 'h-12 w-12 border-[3px]',
  '2xl': 'h-16 w-16 border-4',
};

const colorClasses: Record<SpinnerColor, string> = {
  blue: 'border-blue-200 border-t-blue-600',
  white: 'border-white/30 border-t-white',
  gray: 'border-gray-200 border-t-gray-600',
  green: 'border-green-200 border-t-green-600',
  red: 'border-red-200 border-t-red-600',
  amber: 'border-amber-200 border-t-amber-600',
  primary: 'border-blue-200 border-t-blue-600',
};

// ============================================
// Classic Spinner (دائرة دوارة)
// ============================================

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className = '',
  label = 'جاري التحميل',
}) => (
  <div
    className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className} `.trim()}
    role="status"
    aria-label={label}
  >
    <span className="sr-only">{label}</span>
  </div>
);

// ============================================
// Dots Spinner (نقاط متحركة)
// ============================================

export const DotsSpinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className = '',
  label = 'جاري التحميل',
}) => {
  const dotSizes: Record<SpinnerSize, string> = {
    xs: 'h-1 w-1',
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
    xl: 'h-3 w-3',
    '2xl': 'h-4 w-4',
  };

  const dotColors: Record<SpinnerColor, string> = {
    blue: 'bg-blue-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    amber: 'bg-amber-600',
    primary: 'bg-blue-600',
  };

  return (
    <div className={`flex items-center gap-1 ${className}`} role="status" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`animate-bounce rounded-full ${dotSizes[size]} ${dotColors[color]} `.trim()}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
};

// ============================================
// Pulse Spinner (نبض)
// ============================================

export const PulseSpinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className = '',
  label = 'جاري التحميل',
}) => {
  const pulseSizes: Record<SpinnerSize, string> = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
    '2xl': 'h-16 w-16',
  };

  const pulseColors: Record<SpinnerColor, string> = {
    blue: 'bg-blue-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    amber: 'bg-amber-600',
    primary: 'bg-blue-600',
  };

  return (
    <div className={`relative ${pulseSizes[size]} ${className}`} role="status" aria-label={label}>
      <div
        className={`absolute inset-0 animate-ping rounded-full opacity-75 ${pulseColors[color]}`}
      />
      <div className={`relative h-full w-full rounded-full ${pulseColors[color]}`} />
      <span className="sr-only">{label}</span>
    </div>
  );
};

// ============================================
// Ring Spinner (حلقة)
// ============================================

export const RingSpinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className = '',
  label = 'جاري التحميل',
}) => {
  const ringSizes: Record<SpinnerSize, { size: string; stroke: number }> = {
    xs: { size: 'h-3 w-3', stroke: 2 },
    sm: { size: 'h-4 w-4', stroke: 2 },
    md: { size: 'h-6 w-6', stroke: 3 },
    lg: { size: 'h-8 w-8', stroke: 3 },
    xl: { size: 'h-12 w-12', stroke: 4 },
    '2xl': { size: 'h-16 w-16', stroke: 4 },
  };

  const ringColors: Record<SpinnerColor, { track: string; indicator: string }> = {
    blue: { track: 'stroke-blue-200', indicator: 'stroke-blue-600' },
    white: { track: 'stroke-white/30', indicator: 'stroke-white' },
    gray: { track: 'stroke-gray-200', indicator: 'stroke-gray-600' },
    green: { track: 'stroke-green-200', indicator: 'stroke-green-600' },
    red: { track: 'stroke-red-200', indicator: 'stroke-red-600' },
    amber: { track: 'stroke-amber-200', indicator: 'stroke-amber-600' },
    primary: { track: 'stroke-blue-200', indicator: 'stroke-blue-600' },
  };

  return (
    <svg
      className={`animate-spin ${ringSizes[size].size} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label}
    >
      <circle
        className={ringColors[color].track}
        cx="12"
        cy="12"
        r="10"
        strokeWidth={ringSizes[size].stroke}
      />
      <circle
        className={ringColors[color].indicator}
        cx="12"
        cy="12"
        r="10"
        strokeWidth={ringSizes[size].stroke}
        strokeLinecap="round"
        strokeDasharray="31.4"
        strokeDashoffset="10"
      />
      <span className="sr-only">{label}</span>
    </svg>
  );
};

// ============================================
// Bars Spinner (أشرطة)
// ============================================

export const BarsSpinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className = '',
  label = 'جاري التحميل',
}) => {
  const barSizes: Record<SpinnerSize, { height: string; width: string; gap: string }> = {
    xs: { height: 'h-3', width: 'w-0.5', gap: 'gap-0.5' },
    sm: { height: 'h-4', width: 'w-0.5', gap: 'gap-0.5' },
    md: { height: 'h-5', width: 'w-1', gap: 'gap-1' },
    lg: { height: 'h-6', width: 'w-1', gap: 'gap-1' },
    xl: { height: 'h-8', width: 'w-1.5', gap: 'gap-1' },
    '2xl': { height: 'h-10', width: 'w-2', gap: 'gap-1.5' },
  };

  const barColors: Record<SpinnerColor, string> = {
    blue: 'bg-blue-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    amber: 'bg-amber-600',
    primary: 'bg-blue-600',
  };

  return (
    <div
      className={`flex items-end ${barSizes[size].gap} ${className}`}
      role="status"
      aria-label={label}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={` ${barSizes[size].width} ${barColors[color]} animate-pulse rounded-full`.trim()}
          style={{
            height: `${60 + Math.sin((i * Math.PI) / 2) * 40}%`,
            animationDelay: `${i * 100}ms`,
            animationDuration: '600ms',
          }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
};

// ============================================
// تصدير افتراضي
// ============================================

export default Spinner;
