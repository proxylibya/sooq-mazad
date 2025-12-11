import React, { useState, useEffect } from 'react';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import FireIcon from '@heroicons/react/24/outline/FireIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import { formatAuctionDate } from '../../../../utils/auctionHelpers';

interface AuctionStatusDisplayProps {
  auctionType: 'upcoming' | 'live' | 'ended' | 'sold';
  startTime?: string;
  endTime?: string;
  buyerName?: string | null;
  className?: string;
  compact?: boolean; // خاصية جديدة للعرض المدمج
}

/**
 * مكون عرض حالة المزاد بشكل واضح ومفهوم
 * يعرض التاريخ والوقت بتنسيق مناسب حسب حالة المزاد
 * مع إمكانية العرض المدمج الموفر للمساحة
 */
const AuctionStatusDisplay: React.FC<AuctionStatusDisplayProps> = ({
  auctionType,
  startTime,
  endTime,
  buyerName,
  className = '',
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  // حساب الوقت المتبقي للمزادات النشطة والقادمة
  useEffect(() => {
    if (!compact || auctionType === 'ended') return;

    const calculateTimeLeft = () => {
      const targetTime = auctionType === 'upcoming' ? startTime : endTime;
      if (!targetTime) return;

      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          hours,
          minutes,
          seconds,
          totalSeconds: Math.floor(difference / 1000),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [auctionType, startTime, endTime, compact]);

  const getStatusConfig = () => {
    switch (auctionType) {
      case 'upcoming':
        return {
          icon: ClockIcon,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          text: compact ? 'مزاد قادم' : formatAuctionDate(auctionType, startTime, endTime),
          statusText: 'مزاد قادم',
        };

      case 'live':
        return {
          icon: FireIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          text: compact ? 'مزاد مباشر' : formatAuctionDate(auctionType, startTime, endTime),
          statusText: 'مزاد مباشر',
        };

      case 'ended':
        return {
          icon: CheckCircleIcon,
          color: buyerName ? 'text-green-600' : 'text-gray-600',
          bgColor: buyerName ? 'bg-green-50' : 'bg-gray-50',
          borderColor: buyerName ? 'border-green-200' : 'border-gray-200',
          text: buyerName
            ? `تم البيع لـ ${buyerName}`
            : formatAuctionDate(auctionType, startTime, endTime),
          statusText: 'مزاد منتهي',
        };

      case 'sold':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: buyerName ? `تم البيع لـ ${buyerName}` : 'تم البيع بنجاح',
          statusText: 'مباع',
        };

      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'غير محدد',
          statusText: 'غير محدد',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  // تنسيق الوقت المتبقي
  const formatTimeLeft = () => {
    if (timeLeft.totalSeconds <= 0) return null;

    if (timeLeft.hours > 0) {
      return `${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, '0')}ساعة`;
    } else if (timeLeft.minutes > 0) {
      return `${timeLeft.minutes}:${timeLeft.seconds.toString().padStart(2, '0')}دقيقة`;
    } else {
      return `${timeLeft.seconds}ثانية`;
    }
  };

  // العرض المدمج الصغير
  if (compact) {
    const timeDisplay = formatTimeLeft();
    const isUrgent =
      auctionType === 'live' && timeLeft.totalSeconds <= 300 && timeLeft.totalSeconds > 0;

    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${config.bgColor} ${config.borderColor} border ${isUrgent ? 'animate-pulse ring-1 ring-red-300' : ''} ${className} `}
      >
        <IconComponent className={`h-3 w-3 ${config.color} flex-shrink-0`} />
        <div className="flex min-w-0 flex-col items-center">
          <span className={`${config.color} truncate`}>{config.statusText}</span>
          {timeDisplay && (
            <span
              className={`text-xs ${isUrgent ? 'font-bold text-red-600' : config.color} opacity-90`}
            >
              {auctionType === 'upcoming' ? 'يبدأ ' : 'ينتهي '}
              {timeDisplay}
            </span>
          )}
        </div>
      </div>
    );
  }

  // العرض العادي
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${config.bgColor} ${config.borderColor} ${className} `}
    >
      <IconComponent className={`h-4 w-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
    </div>
  );
};

export default AuctionStatusDisplay;
