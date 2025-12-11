/**
 * Skeleton - High Performance Skeleton Loader
 * هيكل تحميل محسن للأداء
 */

import React, { memo } from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const Skeleton = memo(function Skeleton({
  width,
  height,
  variant = 'text',
  animation = 'pulse',
  className = '',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'circular' ? height : '100%'),
    height: height ?? (variant === 'text' ? undefined : 'auto'),
  };

  return (
    <div
      className={`bg-gray-200 ${variantClasses[variant]} ${animationClasses[animation]} ${className} `}
      style={style}
      aria-hidden="true"
    />
  );
});

Skeleton.displayName = 'Skeleton';

// Skeleton Card preset
export const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <Skeleton variant="rectangular" height={200} className="mb-4 rounded-lg" />
      <Skeleton variant="text" className="mb-2" />
      <Skeleton variant="text" width="60%" />
    </div>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

// Skeleton Avatar preset
export const SkeletonAvatar = memo(function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} />;
});

SkeletonAvatar.displayName = 'SkeletonAvatar';

export default Skeleton;
