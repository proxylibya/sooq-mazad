/**
 * مكون الشارة الموحد لجميع حالات المزاد
 * يستخدم النظام الموحد من auction-theme.ts و auction-labels.ts
 */

import React from 'react';
import { AUCTION_COLORS, AUCTION_EFFECTS } from '@/config/auction-theme';
import { AUCTION_LABELS } from '@/config/auction-labels';
import { getFullAuctionStatus } from '@/utils/auctionStatus';
import type { AuctionStatus } from '@/types/auction-unified';

interface UnifiedAuctionBadgeProps {
  /** بيانات المزاد */
  auction?: any;
  
  /** الحالة مباشرة (بديل لـ auction) */
  status?: AuctionStatus;
  
  /** نوع العرض */
  variant?: 'minimal' | 'detailed' | 'premium';
  
  /** الموضع */
  position?: 'inline' | 'overlay';
  
  /** الحجم */
  size?: 'small' | 'medium' | 'large';
  
  /** إظهار النبض للمزادات المباشرة */
  showPulse?: boolean;
  
  /** CSS classes إضافية */
  className?: string;
}

export const UnifiedAuctionBadge: React.FC<UnifiedAuctionBadgeProps> = ({
  auction,
  status: propStatus,
  variant = 'minimal',
  position = 'inline',
  size = 'medium',
  showPulse = true,
  className = '',
}) => {
  // تحديد الحالة النهائية
  const finalStatus: AuctionStatus = propStatus || (auction ? getFullAuctionStatus(auction).status : 'live');
  
  // الحصول على الألوان والنصوص
  const colors = AUCTION_COLORS[finalStatus];
  const labels = AUCTION_LABELS[finalStatus];
  const effects = AUCTION_EFFECTS[finalStatus];
  
  // تحديد الحجم
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base',
  };
  
  // تحديد النص المعروض
  const displayText = variant === 'minimal' ? labels.short : labels.badge;
  
  // تحديد النبض
  const pulseClass = (showPulse && finalStatus === 'live' && effects.pulse) ? effects.pulse : '';
  
  // تحديد الموضع
  const positionClasses = position === 'overlay' 
    ? 'absolute top-2 right-2 z-10' 
    : 'inline-flex';
  
  // الأيقونة حسب الحالة
  const getIcon = () => {
    switch (finalStatus) {
      case 'live':
        return (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="6" />
          </svg>
        );
      case 'upcoming':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'sold':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'ended':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  // Minimal Variant - شارة بسيطة
  if (variant === 'minimal') {
    return (
      <span
        className={`
          ${positionClasses}
          ${sizeClasses[size]}
          ${colors.bg}
          ${colors.text}
          ${colors.border}
          ${pulseClass}
          font-semibold
          rounded-full
          border
          items-center
          whitespace-nowrap
          ${className}
        `}
      >
        {displayText}
      </span>
    );
  }
  
  // Detailed Variant - شارة مع أيقونة
  if (variant === 'detailed') {
    return (
      <div
        className={`
          ${positionClasses}
          ${sizeClasses[size]}
          ${colors.bg}
          ${colors.text}
          ${colors.border}
          ${pulseClass}
          font-semibold
          rounded-lg
          border
          flex
          items-center
          shadow-sm
          ${className}
        `}
      >
        {getIcon()}
        <span>{displayText}</span>
      </div>
    );
  }
  
  // Premium Variant - شارة متقدمة مع gradient
  return (
    <div
      className={`
        ${positionClasses}
        ${sizeClasses[size]}
        ${pulseClass}
        bg-gradient-to-r ${colors.gradient}
        text-white
        font-bold
        rounded-lg
        flex
        items-center
        shadow-lg
        ${effects.glow}
        ${className}
      `}
    >
      {getIcon()}
      <span>{displayText}</span>
    </div>
  );
};

export default UnifiedAuctionBadge;
