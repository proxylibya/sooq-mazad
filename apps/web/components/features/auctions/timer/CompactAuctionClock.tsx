import React, { useState, useEffect } from 'react';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import FireIcon from '@heroicons/react/24/outline/FireIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';

interface CompactAuctionClockProps {
  auctionType: 'upcoming' | 'live' | 'ended' | 'sold';
  startTime?: string;
  endTime?: string;
  buyerName?: string | null;
  className?: string;
  size?: 'small' | 'medium';
}

/**
 * ساعة المزاد المدمجة - تصميم ذكي يوفر المساحة
 * يعرض حالة المزاد مع الوقت المتبقي في تصميم مضغوط وأنيق
 */
const CompactAuctionClock: React.FC<CompactAuctionClockProps> = ({
  auctionType,
  startTime,
  endTime,
  buyerName,
  className = '',
  size = 'small',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  // حساب الوقت المتبقي
  useEffect(() => {
    if (auctionType === 'ended') return;

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
  }, [auctionType, startTime, endTime]);

  // تحديد الألوان والأيقونات
  const getStatusConfig = () => {
    switch (auctionType) {
      case 'upcoming':
        return {
          icon: CalendarIcon,
          color: 'text-amber-600',
          bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50',
          borderColor: 'border-amber-200',
          statusText: 'مزاد قادم',
          timePrefix: 'يبدأ',
        };

      case 'live':
        return {
          icon: FireIcon,
          color: 'text-blue-600',
          bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200',
          statusText: 'مزاد مباشر',
          timePrefix: 'ينتهي',
        };

      case 'ended':
        return {
          icon: CheckCircleIcon,
          color: buyerName ? 'text-green-600' : 'text-gray-600',
          bgColor: buyerName ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gray-50',
          borderColor: buyerName ? 'border-green-200' : 'border-gray-200',
          statusText: buyerName ? 'تم البيع' : 'مزاد منتهي',
          timePrefix: '',
        };

      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          statusText: 'غير محدد',
          timePrefix: '',
        };
    }
  };

  // تنسيق الوقت المتبقي
  const formatTimeLeft = () => {
    if (timeLeft.totalSeconds <= 0) return null;

    if (timeLeft.hours > 0) {
      return `${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, '0')}`;
    } else if (timeLeft.minutes > 0) {
      return `${timeLeft.minutes}:${timeLeft.seconds.toString().padStart(2, '0')}`;
    } else {
      return `${timeLeft.seconds}ث`;
    }
  };

  // تحديد الوحدة الزمنية
  const getTimeUnit = () => {
    if (timeLeft.totalSeconds <= 0) return '';

    if (timeLeft.hours > 0) {
      return 'ساعة';
    } else if (timeLeft.minutes > 0) {
      return 'دقيقة';
    } else {
      return '';
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;
  const timeDisplay = formatTimeLeft();
  const timeUnit = getTimeUnit();

  // تحديد ما إذا كان الوقت عاجل (أقل من 5 دقائق للمزادات النشطة)
  const isUrgent =
    auctionType === 'live' && timeLeft.totalSeconds <= 300 && timeLeft.totalSeconds > 0;

  // تحديد أحجام المكون
  const sizeConfig =
    size === 'medium'
      ? {
          container: 'px-3 py-2',
          icon: 'w-4 h-4',
          text: 'text-sm',
          timeText: 'text-xs',
        }
      : {
          container: 'px-2 py-1.5',
          icon: 'w-3.5 h-3.5',
          text: 'text-xs',
          timeText: 'text-xs',
        };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border shadow-sm ${config.bgColor} ${config.borderColor} ${sizeConfig.container} ${isUrgent ? 'animate-pulse ring-2 ring-red-200' : ''} transition-all duration-200 hover:shadow-md ${className} `}
    >
      {/* الأيقونة */}
      <IconComponent className={`${sizeConfig.icon} ${config.color} flex-shrink-0`} />

      {/* المحتوى */}
      <div className="flex min-w-0 flex-col items-center">
        {/* حالة المزاد */}
        <span className={`${sizeConfig.text} font-medium ${config.color} truncate`}>
          {config.statusText}
        </span>

        {/* الوقت المتبقي */}
        {timeDisplay && auctionType !== 'ended' && (
          <div
            className={`${sizeConfig.timeText} ${isUrgent ? 'font-bold text-red-600' : config.color} flex items-center gap-1 opacity-90`}
          >
            <span>{config.timePrefix}</span>
            <span className="font-mono font-bold">{timeDisplay}</span>
            {timeUnit && <span>{timeUnit}</span>}
          </div>
        )}

        {/* اسم المشتري للمزادات المنتهية */}
        {auctionType === 'ended' && buyerName && (
          <span className={`${sizeConfig.timeText} ${config.color} max-w-20 truncate opacity-90`}>
            {buyerName}
          </span>
        )}
      </div>
    </div>
  );
};

export default CompactAuctionClock;
