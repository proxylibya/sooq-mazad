import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type AuctionStatus = 'upcoming' | 'live' | 'ended';

interface AuctionProgressBarProps {
  auctionStatus: AuctionStatus;
  startTime?: string | Date;
  endTime?: string | Date;
  currentPrice?: number;
  startingPrice?: number;
  reservePrice?: number;
  className?: string;
  showPercentage?: boolean;
  size?: 'small' | 'medium' | 'large';
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

const AuctionProgressBar: React.FC<AuctionProgressBarProps> = ({
  auctionStatus,
  startTime,
  endTime,
  currentPrice = 0,
  startingPrice = 0,
  reservePrice = 0,
  className = '',
  showPercentage = true,
  size = 'medium',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });

  const [progress, setProgress] = useState(0);

  // حساب الوقت المتبقي للمزادات القادمة والنشطة
  useEffect(() => {
    if (auctionStatus === 'ended') {
      setProgress(100);
      return;
    }

    const calculateTimeLeft = () => {
      const targetTime = auctionStatus === 'upcoming' ? startTime : endTime;
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
  }, [auctionStatus, startTime, endTime]);

  // حساب التقدم بناءً على نوع المزاد
  useEffect(() => {
    const calculateProgress = () => {
      switch (auctionStatus) {
        case 'ended':
          return 100;

        case 'upcoming': {
          // للمزادات القادمة: حساب التقدم بناءً على الوقت المتبقي
          if (!startTime) return 0;

          const now = new Date().getTime();
          const start = new Date(startTime).getTime();
          const totalDuration = 24 * 60 * 60 * 1000; // افتراض 24 ساعة كمدة إعلان
          const timeUntilStart = start - now;

          if (timeUntilStart <= 0) return 100; // بدأ المزاد

          // حساب التقدم العكسي (كلما قل الوقت، زاد التقدم)
          const progressValue = Math.max(
            0,
            Math.min(100, ((totalDuration - timeUntilStart) / totalDuration) * 100),
          );

          return progressValue;
        }

        case 'live': {
          // للمزادات المباشرة: حساب التقدم بناءً على السعر
          if (!reservePrice || reservePrice <= startingPrice) {
            // إذا لم يكن هناك سعر مطلوب، استخدم التقدم الزمني
            if (!endTime) return 10;

            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const totalDuration = 24 * 60 * 60 * 1000; // افتراض 24 ساعة
            const timeRemaining = end - now;

            if (timeRemaining <= 0) return 100;

            const timeElapsed = totalDuration - timeRemaining;
            return Math.max(10, Math.min(90, (timeElapsed / totalDuration) * 100));
          }

          // حساب التقدم بناءً على السعر
          const priceRange = reservePrice - startingPrice;
          const currentRange = currentPrice - startingPrice;

          if (priceRange <= 0) return currentPrice > startingPrice ? 50 : 10;

          const priceProgress = (currentRange / priceRange) * 100;
          return Math.max(0, Math.min(100, priceProgress));
        }

        default:
          return 0;
      }
    };

    setProgress(calculateProgress());
  }, [auctionStatus, currentPrice, startingPrice, reservePrice, timeLeft, startTime, endTime]);

  // إعدادات الحجم
  const sizeConfig = {
    small: {
      height: 'h-2',
      text: 'text-xs',
      padding: 'px-2 py-1',
    },
    medium: {
      height: 'h-3',
      text: 'text-sm',
      padding: 'px-3 py-2',
    },
    large: {
      height: 'h-4',
      text: 'text-base',
      padding: 'px-4 py-3',
    },
  };

  // إعدادات الألوان بناءً على نوع المزاد
  const getColorConfig = () => {
    switch (auctionStatus) {
      case 'upcoming':
        return {
          bg: 'bg-amber-200',
          fill: 'bg-gradient-to-r from-amber-500 to-amber-600',
          text: 'text-amber-800',
          label: 'مزاد قادم',
        };
      case 'live':
        return {
          bg: 'bg-blue-200',
          fill: 'bg-gradient-to-r from-blue-500 to-blue-600',
          text: 'text-blue-800',
          label: 'مزاد مباشر',
        };
      case 'ended':
        return {
          bg: 'bg-green-200',
          fill: 'bg-gradient-to-r from-green-500 to-green-600',
          text: 'text-green-800',
          label: 'مزاد منتهي',
        };
      default:
        return {
          bg: 'bg-gray-200',
          fill: 'bg-gradient-to-r from-gray-500 to-gray-600',
          text: 'text-gray-800',
          label: 'غير محدد',
        };
    }
  };

  const colorConfig = getColorConfig();
  const currentSizeConfig = sizeConfig[size];

  return (
    <div className={cn('w-full', className)}>
      {/* شريط التقدم */}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full',
          currentSizeConfig.height,
          colorConfig.bg,
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorConfig.fill,
          )}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />

        {/* تأثير الإضاءة للمزادات النشطة */}
        {auctionStatus === 'live' && (
          <div
            className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        )}
      </div>

      {/* معلومات إضافية */}
      {showPercentage && (
        <div
          className={cn(
            'mt-1 flex items-center justify-between',
            currentSizeConfig.text,
            colorConfig.text,
          )}
        >
          <span className="font-medium">{colorConfig.label}</span>
          <span className="font-bold">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};

export default AuctionProgressBar;
