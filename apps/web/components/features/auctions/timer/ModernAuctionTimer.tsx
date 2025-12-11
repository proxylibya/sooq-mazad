import React, { useEffect, useState } from 'react';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import FireIcon from '@heroicons/react/24/outline/FireIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';

interface ModernAuctionTimerProps {
  endTime: string;
  auctionType: 'upcoming' | 'live' | 'ended' | 'sold';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const ModernAuctionTimer: React.FC<ModernAuctionTimerProps> = ({
  endTime,
  auctionType,
  size = 'medium',
  showIcon = true,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(endTime).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          totalSeconds: Math.floor(difference / 1000),
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  // تحديد الأيقونة حسب نوع المزاد
  const getIcon = () => {
    switch (auctionType) {
      case 'live':
        return <FireIcon className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'upcoming':
        return <CalendarIcon className="h-4 w-4 text-amber-500" />;
      case 'sold': // ✅ تم البيع
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'ended':
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // تحديد الألوان حسب نوع المزاد
  const getColors = () => {
    switch (auctionType) {
      case 'live': // مباشر - أزرق
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          accent: 'text-blue-500',
        };
      case 'upcoming': // قادم - أصفر
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          accent: 'text-amber-500',
        };
      case 'sold': // ✅ تم البيع - أخضر
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          accent: 'text-green-600',
        };
      case 'ended': // منتهي - رمادي
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          accent: 'text-gray-500',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          accent: 'text-gray-500',
        };
    }
  };

  // تحديد أحجام النص
  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          container: 'px-2 py-1',
          text: 'text-xs',
          time: 'text-sm font-mono',
        };
      case 'large':
        return {
          container: 'px-4 py-3',
          text: 'text-base',
          time: 'text-xl font-mono',
        };
      default: // medium
        return {
          container: 'px-3 py-2',
          text: 'text-sm',
          time: 'text-base font-mono',
        };
    }
  };

  const colors = getColors();
  const sizes = getSizes();

  // تنسيق الوقت
  const formatTime = () => {
    if (auctionType === 'sold') { // ✅ تم البيع
      return 'تم البيع';
    }
    if (auctionType === 'ended') {
      return 'انتهى المزاد';
    }

    if (timeLeft.totalSeconds <= 0) {
      return auctionType === 'upcoming' ? 'يبدأ الآن' : 'انتهى';
    }

    // إذا كان أكثر من يوم
    if (timeLeft.days > 0) {
      return `${timeLeft.days}د ${timeLeft.hours.toString().padStart(2, '0')}:${timeLeft.minutes.toString().padStart(2, '0')}`;
    }

    // إذا كان أقل من يوم
    return `${timeLeft.hours.toString().padStart(2, '0')}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`;
  };

  // تحديد النص التوضيحي
  const getLabel = () => {
    switch (auctionType) {
      case 'live':
        return 'الوقت المتبقي';
      case 'upcoming':
        return 'يبدأ خلال';
      case 'sold': // ✅ تم البيع
        return 'مبروك البيع!';
      case 'ended':
        return 'انتهى المزاد';
      default:
        return 'الوقت المتبقي';
    }
  };

  // تحديد ما إذا كان الوقت قريب من الانتهاء (أقل من 5 دقائق)
  const isUrgent =
    auctionType === 'live' && timeLeft.totalSeconds <= 300 && timeLeft.totalSeconds > 0;

  return (
    <div
      className={` ${colors.bg} ${colors.border} rounded-lg border ${sizes.container} flex items-center justify-center gap-2 transition-all duration-200 ${isUrgent ? 'animate-pulse ring-2 ring-red-200' : ''} `}
    >
      {showIcon && getIcon()}
      <div className="text-center">
        <div className={`${sizes.time} font-bold ${isUrgent ? 'text-red-600' : colors.text}`}>
          {formatTime()}
        </div>
        <div className={`${sizes.text} ${colors.accent} mt-1`}>{getLabel()}</div>
      </div>
    </div>
  );
};

export default ModernAuctionTimer;
