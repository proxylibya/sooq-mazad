/**
 * SkeletonBase - المكون الأساسي للـ Skeleton
 * نظام التحميل العالمي الموحد - سوق مزاد
 *
 * @description مكون أساسي قابل لإعادة الاستخدام لإنشاء تأثيرات التحميل
 * @version 2.0.0
 */

import React from 'react';

// ============================================
// Types & Interfaces
// ============================================

export type SkeletonVariant = 'shimmer' | 'pulse' | 'wave';
export type SkeletonShape = 'rectangle' | 'circle' | 'rounded' | 'pill';

export interface SkeletonBaseProps {
  /** عرض العنصر */
  width?: string | number;
  /** ارتفاع العنصر */
  height?: string | number;
  /** شكل العنصر */
  shape?: SkeletonShape;
  /** نوع التأثير */
  variant?: SkeletonVariant;
  /** كلاسات إضافية */
  className?: string;
  /** تأخير التأثير (بالمللي ثانية) */
  delay?: number;
  /** إظهار أم إخفاء */
  visible?: boolean;
  /** عدد التكرارات */
  count?: number;
  /** المسافة بين التكرارات */
  gap?: number;
  /** اتجاه التكرار */
  direction?: 'horizontal' | 'vertical';
}

// ============================================
// CSS Classes & Styles
// ============================================

const shapeClasses: Record<SkeletonShape, string> = {
  rectangle: 'rounded-none',
  circle: 'rounded-full',
  rounded: 'rounded-lg',
  pill: 'rounded-full',
};

const variantClasses: Record<SkeletonVariant, string> = {
  shimmer: 'skeleton-shimmer',
  pulse: 'animate-pulse',
  wave: 'skeleton-wave',
};

// ============================================
// SkeletonBase Component
// ============================================

const SkeletonBase: React.FC<SkeletonBaseProps> = ({
  width = '100%',
  height = '1rem',
  shape = 'rounded',
  variant = 'shimmer',
  className = '',
  delay = 0,
  visible = true,
  count = 1,
  gap = 8,
  direction = 'vertical',
}) => {
  if (!visible) return null;

  const baseStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    animationDelay: delay ? `${delay}ms` : undefined,
  };

  const skeletonElement = (index: number) => (
    <div
      key={index}
      className={`bg-gray-200 dark:bg-gray-700 ${shapeClasses[shape]} ${variantClasses[variant]} ${className} `.trim()}
      style={{
        ...baseStyle,
        animationDelay: delay ? `${delay + index * 100}ms` : `${index * 100}ms`,
      }}
      aria-hidden="true"
    />
  );

  if (count === 1) {
    return skeletonElement(0);
  }

  return (
    <div
      className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'}`}
      style={{ gap: `${gap}px` }}
    >
      {Array.from({ length: count }).map((_, index) => skeletonElement(index))}
    </div>
  );
};

// ============================================
// Preset Components
// ============================================

/** عنصر نصي */
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  variant?: SkeletonVariant;
}> = ({ lines = 1, className = '', variant = 'shimmer' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBase
        key={i}
        height={16}
        width={i === lines - 1 && lines > 1 ? '70%' : '100%'}
        variant={variant}
        delay={i * 50}
      />
    ))}
  </div>
);

/** صورة مربعة أو مستطيلة */
export const SkeletonImage: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: SkeletonVariant;
}> = ({ width = '100%', height = 200, className = '', variant = 'shimmer' }) => (
  <SkeletonBase
    width={width}
    height={height}
    shape="rounded"
    variant={variant}
    className={className}
  />
);

/** صورة دائرية (أفاتار) */
export const SkeletonAvatar: React.FC<{
  size?: number;
  className?: string;
  variant?: SkeletonVariant;
}> = ({ size = 48, className = '', variant = 'shimmer' }) => (
  <SkeletonBase width={size} height={size} shape="circle" variant={variant} className={className} />
);

/** زر */
export const SkeletonButton: React.FC<{
  width?: string | number;
  height?: number;
  className?: string;
  variant?: SkeletonVariant;
}> = ({ width = 100, height = 40, className = '', variant = 'shimmer' }) => (
  <SkeletonBase
    width={width}
    height={height}
    shape="rounded"
    variant={variant}
    className={className}
  />
);

/** شارة */
export const SkeletonBadge: React.FC<{
  width?: number;
  className?: string;
  variant?: SkeletonVariant;
}> = ({ width = 60, className = '', variant = 'shimmer' }) => (
  <SkeletonBase width={width} height={24} shape="pill" variant={variant} className={className} />
);

/** عنوان */
export const SkeletonTitle: React.FC<{
  width?: string | number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: SkeletonVariant;
}> = ({ width = '60%', size = 'md', className = '', variant = 'shimmer' }) => {
  const heights = { sm: 20, md: 24, lg: 32, xl: 40 };
  return (
    <SkeletonBase
      width={width}
      height={heights[size]}
      shape="rounded"
      variant={variant}
      className={className}
    />
  );
};

/** فاصل */
export const SkeletonDivider: React.FC<{
  className?: string;
}> = ({ className = '' }) => (
  <div className={`h-px w-full bg-gray-200 dark:bg-gray-700 ${className}`} />
);

export default SkeletonBase;
