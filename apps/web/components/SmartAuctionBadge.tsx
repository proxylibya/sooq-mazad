import React, { useState, useEffect } from 'react';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import FireIcon from '@heroicons/react/24/outline/FireIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';

interface SmartAuctionBadgeProps {
  auctionType: 'upcoming' | 'live' | 'ended' | 'sold';
  startTime?: string;
  endTime?: string;
  buyerName?: string | null;
  className?: string;
  variant?: 'minimal' | 'detailed' | 'premium';
}

/**
 * شارة المزاد الذكية - تصميم متطور مع تأثيرات بصرية
 * تعرض حالة المزاد والوقت المتبقي بطريقة أنيقة وموفرة للمساحة
 */
const SmartAuctionBadge: React.FC<SmartAuctionBadgeProps> = ({
  auctionType,
  startTime,
  endTime,
  buyerName,
  className = '',
  variant = 'minimal',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  // حساب الوقت المتبقي
  useEffect(() => {
    if (auctionType === 'ended' || auctionType === 'sold') return;

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

  // تحديد تكوين الحالة
  const getStatusConfig = () => {
    switch (auctionType) {
      case 'upcoming':
        return {
          icon: CalendarIcon,
          color: 'text-amber-600',
          bgGradient: 'bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50',
          borderColor: 'border-amber-200',
          shadowColor: 'shadow-amber-100',
          statusText: 'قادم',
          timePrefix: 'يبدأ',
          glowColor: 'shadow-amber-200/50',
        };

      case 'live':
        return {
          icon: FireIcon,
          color: 'text-blue-600',
          bgGradient: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50',
          borderColor: 'border-blue-200',
          shadowColor: 'shadow-blue-100',
          statusText: 'مباشر',
          timePrefix: 'ينتهي',
          glowColor: 'shadow-blue-200/50',
        };

      case 'sold':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgGradient: 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50',
          borderColor: 'border-green-200',
          shadowColor: 'shadow-green-100',
          statusText: 'تم البيع',
          timePrefix: '',
          glowColor: 'shadow-green-200/50',
        };

      case 'ended':
        return {
          icon: CheckCircleIcon,
          color: buyerName ? 'text-green-600' : 'text-gray-600',
          bgGradient: buyerName
            ? 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50'
            : 'bg-gradient-to-r from-gray-50 to-slate-50',
          borderColor: buyerName ? 'border-green-200' : 'border-gray-200',
          shadowColor: buyerName ? 'shadow-green-100' : 'shadow-gray-100',
          statusText: buyerName ? 'مُباع' : 'انتهى',
          timePrefix: '',
          glowColor: buyerName ? 'shadow-green-200/50' : 'shadow-gray-200/50',
        };

      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-600',
          bgGradient: 'bg-gray-50',
          borderColor: 'border-gray-200',
          shadowColor: 'shadow-gray-100',
          statusText: 'غير محدد',
          timePrefix: '',
          glowColor: 'shadow-gray-200/50',
        };
    }
  };

  // تنسيق الوقت المتبقي
  const formatTimeLeft = () => {
    if (timeLeft.totalSeconds <= 0) return null;

    if (timeLeft.hours > 0) {
      return {
        time: `${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, '0')}`,
        unit: 'ساعة',
      };
    } else if (timeLeft.minutes > 0) {
      return {
        time: `${timeLeft.minutes}:${timeLeft.seconds.toString().padStart(2, '0')}`,
        unit: 'دقيقة',
      };
    } else {
      return {
        time: `${timeLeft.seconds}`,
        unit: 'ثانية',
      };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;
  const timeDisplay = formatTimeLeft();

  // تحديد ما إذا كان الوقت عاجل
  const isUrgent =
    auctionType === 'live' && timeLeft.totalSeconds <= 300 && timeLeft.totalSeconds > 0;
  const isCritical =
    auctionType === 'live' && timeLeft.totalSeconds <= 60 && timeLeft.totalSeconds > 0;

  // تحديد تكوين المتغير
  const getVariantConfig = () => {
    switch (variant) {
      case 'detailed':
        return {
          container: 'px-3 py-2 gap-2',
          icon: 'w-4 h-4',
          statusText: 'text-sm font-semibold',
          timeText: 'text-xs font-mono',
          showUnit: true,
        };
      case 'premium':
        return {
          container: 'px-4 py-2.5 gap-2.5',
          icon: 'w-5 h-5',
          statusText: 'text-sm font-bold',
          timeText: 'text-sm font-mono',
          showUnit: true,
        };
      default: // minimal
        return {
          container: 'px-2 py-1.5 gap-1.5',
          icon: 'w-3.5 h-3.5',
          statusText: 'text-xs font-medium',
          timeText: 'text-xs font-mono',
          showUnit: false,
        };
    }
  };

  const variantConfig = getVariantConfig();

  return (
    <div
      className={`inline-flex items-center rounded-lg border backdrop-blur-sm ${config.bgGradient} ${config.borderColor} ${config.shadowColor} ${variantConfig.container} ${isUrgent ? 'animate-pulse' : ''} ${isCritical ? 'shadow-lg shadow-red-200/50 ring-2 ring-red-300' : ''} ${variant === 'premium' ? `shadow-lg hover:shadow-xl ${config.glowColor}` : 'shadow-sm hover:shadow-md'} transition-all duration-300 hover:scale-105 ${className} `}
    >
      {/* الأيقونة مع تأثير التوهج */}
      <div className="relative">
        <IconComponent className={`${variantConfig.icon} ${config.color} flex-shrink-0`} />
        {auctionType === 'live' && variant === 'premium' && (
          <SparklesIcon className="absolute -left-1 -top-1 h-2 w-2 animate-ping text-blue-400" />
        )}
      </div>

      {/* المحتوى */}
      <div className="flex min-w-0 flex-col items-center">
        {/* حالة المزاد */}
        <span className={`${variantConfig.statusText} ${config.color} truncate leading-tight`}>
          {config.statusText}
        </span>

        {/* الوقت المتبقي */}
        {timeDisplay && auctionType !== 'ended' && (
          <div
            className={` ${variantConfig.timeText} ${
              isCritical
                ? 'animate-bounce font-bold text-red-600'
                : isUrgent
                  ? 'font-bold text-red-600'
                  : config.color
            } flex items-center gap-1 leading-tight opacity-90`}
          >
            {variant !== 'minimal' && <span className="text-xs">{config.timePrefix}</span>}
            <span className="font-bold">{timeDisplay.time}</span>
            {variantConfig.showUnit && timeDisplay.unit && (
              <span className="text-xs">{timeDisplay.unit}</span>
            )}
          </div>
        )}

        {/* اسم المشتري للمزادات المنتهية */}
        {auctionType === 'ended' && buyerName && variant !== 'minimal' && (
          <span
            className={`${variantConfig.timeText} ${config.color} max-w-20 truncate leading-tight opacity-90`}
          >
            {buyerName}
          </span>
        )}
      </div>
    </div>
  );
};

export default SmartAuctionBadge;
