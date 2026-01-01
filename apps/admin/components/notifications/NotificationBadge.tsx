/**
 * شارة الإشعارات - لعرض عدد الإشعارات على القوائم
 */
import React from 'react';

interface NotificationBadgeProps {
  count: number;
  urgent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  maxCount?: number;
  showZero?: boolean;
  className?: string;
}

export default function NotificationBadge({
  count,
  urgent = false,
  size = 'sm',
  maxCount = 99,
  showZero = false,
  className = '',
}: NotificationBadgeProps) {
  if (count === 0 && !showZero) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count;

  const sizeClasses = {
    sm: 'min-w-[18px] h-[18px] text-[10px] px-1',
    md: 'min-w-[22px] h-[22px] text-xs px-1.5',
    lg: 'min-w-[26px] h-[26px] text-sm px-2',
  };

  const colorClasses = urgent
    ? 'bg-red-500 text-white animate-pulse'
    : 'bg-blue-500 text-white';

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full font-bold
        ${sizeClasses[size]}
        ${colorClasses}
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
}
