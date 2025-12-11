import React, { useState, useEffect } from 'react';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import FireIcon from '@heroicons/react/24/outline/FireIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';

interface MiniAuctionStatusProps {
  auctionType: 'upcoming' | 'live' | 'ended' | 'sold';
  startTime?: string;
  endTime?: string;
  buyerName?: string | null;
  className?: string;
  showTime?: boolean;
}

/**
 * شارة المزاد المصغرة - أصغر حجم ممكن مع الحفاظ على الوضوح
 * مثالية للبطاقات الصغيرة والقوائم المضغوطة
 * تصميم مدمج يعرض: حالة مزاد - ساعة
 */
const MiniAuctionStatus: React.FC<MiniAuctionStatusProps> = ({
  auctionType,
  startTime,
  endTime,
  buyerName,
  className = '',
  showTime = true,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  // حساب الوقت المتبقي المبسط
  useEffect(() => {
    if (!showTime || auctionType === 'ended') return;

    const calculateTimeLeft = () => {
      const targetTime = auctionType === 'upcoming' ? startTime : endTime;
      if (!targetTime) return;

      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
          setTimeLeft(`${hours}ساعة`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}دقيقة`);
        } else {
          setTimeLeft('< 1دقيقة');
        }
      } else {
        setTimeLeft('');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // تحديث كل دقيقة

    return () => clearInterval(timer);
  }, [auctionType, startTime, endTime, showTime]);

  // تحديد تكوين الحالة
  const getStatusConfig = () => {
    switch (auctionType) {
      case 'upcoming':
        return {
          icon: ClockIcon,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-300',
          text: 'قادم',
          dot: 'bg-amber-400',
        };

      case 'live':
        return {
          icon: FireIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          text: 'نشط',
          dot: 'bg-blue-400 animate-pulse',
        };

      case 'ended':
        return {
          icon: CheckCircleIcon,
          color: buyerName ? 'text-green-600' : 'text-gray-600',
          bgColor: buyerName ? 'bg-green-50' : 'bg-gray-50',
          borderColor: buyerName ? 'border-green-300' : 'border-gray-300',
          text: buyerName ? 'مُباع' : 'انتهى',
          dot: buyerName ? 'bg-green-400' : 'bg-gray-400',
        };

      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-300',
          text: 'غير محدد',
          dot: 'bg-gray-400',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 ${config.bgColor} ${config.borderColor} text-xs font-medium transition-all duration-200 ${className} `}
    >
      {/* نقطة الحالة */}
      <div className={`h-1.5 w-1.5 rounded-full ${config.dot} flex-shrink-0`} />

      {/* النص والوقت في سطر واحد */}
      <span className={`${config.color} flex items-center gap-1 truncate`}>
        {config.text}
        {showTime && timeLeft && <span className="opacity-75">- {timeLeft}</span>}
      </span>
    </div>
  );
};

export default MiniAuctionStatus;
