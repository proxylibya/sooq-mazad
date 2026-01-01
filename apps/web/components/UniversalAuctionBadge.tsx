import React from 'react';
import SmartAuctionBadge from './SmartAuctionBadge';
import CompactAuctionClock from './features/auctions/timer/CompactAuctionClock';
import MiniAuctionStatus from './features/auctions/status/MiniAuctionStatus';
import AuctionStatusDisplay from './features/auctions/status/AuctionStatusDisplay';

interface UniversalAuctionBadgeProps {
  auctionType: 'upcoming' | 'live' | 'ended' | 'sold';
  startTime?: string;
  endTime?: string;
  buyerName?: string | null;
  className?: string;

  // خيارات التصميم
  style?: 'original' | 'compact' | 'smart' | 'mini' | 'clock';
  variant?: 'minimal' | 'detailed' | 'premium'; // للشارة الذكية
  size?: 'small' | 'medium'; // للساعة المدمجة
  showTime?: boolean; // للشارة المصغرة
  compact?: boolean; // للشارة الأصلية
}

/**
 * شارة المزاد الشاملة - مكون واحد يجمع كل خيارات العرض
 * يختار التصميم المناسب تلقائياً أو حسب التفضيل المحدد
 */
const UniversalAuctionBadge: React.FC<UniversalAuctionBadgeProps> = ({
  auctionType,
  startTime,
  endTime,
  buyerName,
  className = '',
  style = 'smart', // التصميم الافتراضي
  variant = 'detailed',
  size = 'small',
  showTime = true,
  compact = true,
}) => {
  // اختيار التصميم المناسب
  const renderBadge = () => {
    switch (style) {
      case 'original':
        return (
          <AuctionStatusDisplay
            auctionType={auctionType}
            startTime={startTime}
            endTime={endTime}
            buyerName={buyerName}
            compact={compact}
            className={className}
          />
        );

      case 'compact':
        return (
          <AuctionStatusDisplay
            auctionType={auctionType}
            startTime={startTime}
            endTime={endTime}
            buyerName={buyerName}
            compact={true}
            className={className}
          />
        );

      case 'smart':
        return (
          <SmartAuctionBadge
            auctionType={auctionType}
            startTime={startTime}
            endTime={endTime}
            buyerName={buyerName}
            variant={variant}
            className={className}
          />
        );

      case 'mini':
        return (
          <MiniAuctionStatus
            auctionType={auctionType}
            startTime={startTime}
            endTime={endTime}
            buyerName={buyerName}
            showTime={showTime}
            className={className}
          />
        );

      case 'clock':
        return (
          <CompactAuctionClock
            auctionType={auctionType}
            startTime={startTime}
            endTime={endTime}
            buyerName={buyerName}
            size={size}
            className={className}
          />
        );

      default:
        return (
          <SmartAuctionBadge
            auctionType={auctionType}
            startTime={startTime}
            endTime={endTime}
            buyerName={buyerName}
            variant="detailed"
            className={className}
          />
        );
    }
  };

  return renderBadge();
};

// مكونات مساعدة للاستخدام السريع
export const QuickAuctionBadge = {
  // للبطاقات الصغيرة
  Mini: (props: Omit<UniversalAuctionBadgeProps, 'style'>) => (
    <UniversalAuctionBadge {...props} style="mini" />
  ),

  // للبطاقات العادية
  Smart: (props: Omit<UniversalAuctionBadgeProps, 'style'>) => (
    <UniversalAuctionBadge {...props} style="smart" variant="detailed" />
  ),

  // للعرض المتميز
  Premium: (props: Omit<UniversalAuctionBadgeProps, 'style'>) => (
    <UniversalAuctionBadge {...props} style="smart" variant="premium" />
  ),

  // للساعة المدمجة
  Clock: (props: Omit<UniversalAuctionBadgeProps, 'style'>) => (
    <UniversalAuctionBadge {...props} style="clock" />
  ),

  // للتصميم الأصلي
  Original: (props: Omit<UniversalAuctionBadgeProps, 'style'>) => (
    <UniversalAuctionBadge {...props} style="original" />
  ),
};

export default UniversalAuctionBadge;
