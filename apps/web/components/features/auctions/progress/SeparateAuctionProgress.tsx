import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type AuctionStatus = 'upcoming' | 'live' | 'ended';

interface SeparateAuctionProgressProps {
  auctionStatus: AuctionStatus;
  startTime?: string | Date;
  endTime?: string | Date;
  currentPrice?: number;
  startingPrice?: number;
  reservePrice?: number;
  className?: string;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

/**
 * مكون منطق حساب التقدم للمزاد القادم
 * يحسب التقدم بناءً على الوقت المتبقي حتى بداية المزاد
 */
const UpcomingAuctionProgress: React.FC<{
  startTime: string | Date;
  onProgressUpdate: (progress: number) => void;
}> = ({ startTime, onProgressUpdate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const difference = start - now;

      if (difference <= 0) {
        // المزاد بدأ
        onProgressUpdate(100);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
        return;
      }

      // حساب الوقت المتبقي
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const totalSeconds = Math.floor(difference / 1000);

      setTimeLeft({ hours, minutes, seconds, totalSeconds });

      // حساب التقدم بناءً على الوقت المتبقي
      // افتراض أن المزاد يُعلن عنه قبل 24 ساعة من بدايته
      const totalAnnouncementDuration = 24 * 60 * 60 * 1000; // 24 ساعة
      const timeElapsed = totalAnnouncementDuration - difference;

      // التقدم يبدأ من 0% ويصل إلى 100% عند بداية المزاد
      const progress = Math.max(0, Math.min(100, (timeElapsed / totalAnnouncementDuration) * 100));
      onProgressUpdate(progress);
    };

    calculateProgress();
    const timer = setInterval(calculateProgress, 1000);

    return () => clearInterval(timer);
  }, [startTime, onProgressUpdate]);

  return null; // هذا المكون للمنطق فقط
};

/**
 * مكون منطق حساب التقدم للمزاد المباشر
 * يحسب التقدم بناءً على السعر الحالي مقارنة بالسعر المطلوب
 */
const LiveAuctionProgress: React.FC<{
  currentPrice: number;
  startingPrice: number;
  reservePrice?: number;
  endTime?: string | Date;
  onProgressUpdate: (progress: number) => void;
}> = ({ currentPrice, startingPrice, reservePrice, endTime, onProgressUpdate }) => {
  useEffect(() => {
    const calculateProgress = () => {
      // إذا كان هناك سعر مطلوب، احسب التقدم بناءً على السعر
      if (reservePrice && reservePrice > startingPrice) {
        const priceRange = reservePrice - startingPrice;
        const currentRange = currentPrice - startingPrice;

        if (priceRange <= 0) {
          onProgressUpdate(currentPrice > startingPrice ? 50 : 0);
          return;
        }

        const priceProgress = (currentRange / priceRange) * 100;
        const progress = Math.max(0, Math.min(100, priceProgress));
        onProgressUpdate(progress);
        return;
      }

      // إذا لم يكن هناك سعر مطلوب، احسب التقدم بناءً على الوقت
      if (endTime) {
        const now = new Date().getTime();
        const end = new Date(endTime).getTime();
        const totalDuration = 24 * 60 * 60 * 1000; // افتراض 24 ساعة
        const timeRemaining = end - now;

        if (timeRemaining <= 0) {
          onProgressUpdate(100);
          return;
        }

        const timeElapsed = totalDuration - timeRemaining;
        const progress = Math.max(10, Math.min(90, (timeElapsed / totalDuration) * 100));
        onProgressUpdate(progress);
        return;
      }

      // حالة افتراضية: إذا كان هناك مزايدات، أظهر تقدم أساسي
      const basicProgress =
        currentPrice > startingPrice
          ? Math.min(75, 25 + ((currentPrice - startingPrice) / startingPrice) * 50)
          : 10;
      onProgressUpdate(basicProgress);
    };

    calculateProgress();
    const timer = setInterval(calculateProgress, 1000);

    return () => clearInterval(timer);
  }, [currentPrice, startingPrice, reservePrice, endTime, onProgressUpdate]);

  return null; // هذا المكون للمنطق فقط
};

/**
 * مكون منطق عرض التقدم للمزاد المنتهي
 * يعرض شريط التقدم كمكتمل 100%
 */
const EndedAuctionProgress: React.FC<{
  onProgressUpdate: (progress: number) => void;
}> = ({ onProgressUpdate }) => {
  useEffect(() => {
    // المزاد المنتهي دائماً 100%
    onProgressUpdate(100);
  }, [onProgressUpdate]);

  return null; // هذا المكون للمنطق فقط
};

/**
 * المكون الرئيسي للتقدم المنفصل
 */
const SeparateAuctionProgress: React.FC<SeparateAuctionProgressProps> = ({
  auctionStatus,
  startTime,
  endTime,
  currentPrice = 0,
  startingPrice = 0,
  reservePrice,
  className = '',
}) => {
  const [progress, setProgress] = useState(0);

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
  };

  // إعدادات الألوان والتسميات بناءً على نوع المزاد
  const getStatusConfig = () => {
    switch (auctionStatus) {
      case 'upcoming':
        return {
          bg: 'bg-amber-100',
          fill: 'bg-gradient-to-r from-amber-400 to-amber-500',
          text: 'text-amber-800',
          label: 'مزاد قادم',
          description: 'العد التنازلي للبداية',
        };
      case 'live':
        return {
          bg: 'bg-blue-100',
          fill: 'bg-gradient-to-r from-blue-400 to-blue-500',
          text: 'text-blue-800',
          label: 'مزاد مباشر',
          description: 'التقدم نحو سعر البيع',
        };
      case 'ended':
        return {
          bg: 'bg-green-100',
          fill: 'bg-gradient-to-r from-green-400 to-green-500',
          text: 'text-green-800',
          label: 'مزاد منتهي',
          description: 'مكتمل',
        };
      default:
        return {
          bg: 'bg-gray-100',
          fill: 'bg-gradient-to-r from-gray-400 to-gray-500',
          text: 'text-gray-800',
          label: 'غير محدد',
          description: '',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={cn('w-full', className)}>
      {/* منطق حساب التقدم المنفصل */}
      {auctionStatus === 'upcoming' && startTime && (
        <UpcomingAuctionProgress startTime={startTime} onProgressUpdate={handleProgressUpdate} />
      )}

      {auctionStatus === 'live' && (
        <LiveAuctionProgress
          currentPrice={currentPrice}
          startingPrice={startingPrice}
          reservePrice={reservePrice}
          endTime={endTime}
          onProgressUpdate={handleProgressUpdate}
        />
      )}

      {auctionStatus === 'ended' && (
        <EndedAuctionProgress onProgressUpdate={handleProgressUpdate} />
      )}

      {/* شريط التقدم المرئي */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={cn('text-sm font-medium', statusConfig.text)}>{statusConfig.label}</span>
          <span className={cn('text-xs', statusConfig.text)}>{Math.round(progress)}%</span>
        </div>

        <div className={cn('relative h-3 w-full overflow-hidden rounded-full', statusConfig.bg)}>
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              statusConfig.fill,
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

        <div className={cn('text-xs', statusConfig.text)}>{statusConfig.description}</div>
      </div>
    </div>
  );
};

export default SeparateAuctionProgress;
