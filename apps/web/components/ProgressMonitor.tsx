import React, { useState, useEffect } from 'react';

interface ProgressMonitorProps {
  auctionStatus: 'upcoming' | 'live' | 'ended';
  startTime?: string;
  endTime?: string;
  currentPrice?: number;
  startingPrice?: number;
  reservePrice?: number;
}

/**
 * مكون مراقبة التقدم المباشر
 * يعرض تفاصيل دقيقة عن حسابات التقدم
 */
const ProgressMonitor: React.FC<ProgressMonitorProps> = ({
  auctionStatus,
  startTime,
  endTime,
  currentPrice = 0,
  startingPrice = 0,
  reservePrice = 0,
}) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progressType, setProgressType] = useState('');

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date().getTime();

      switch (auctionStatus) {
        case 'ended':
          setProgress(100);
          setProgressType('مكتمل');
          setTimeLeft(0);
          break;

        case 'upcoming': {
          if (!startTime) return;

          const auctionStartTime = new Date(startTime).getTime();
          const difference = auctionStartTime - now;
          setTimeLeft(Math.max(0, Math.floor(difference / 1000)));

          if (difference <= 0) {
            setProgress(100);
            setProgressType('بدأ المزاد');
            return;
          }

          // للمزادات قصيرة المدى
          if (difference <= 10 * 60 * 1000) {
            const totalAnnouncementTime = 10 * 60 * 1000;
            const actualAnnouncementTime = Math.min(
              difference + 5 * 60 * 1000,
              totalAnnouncementTime,
            );
            const elapsed = actualAnnouncementTime - difference;
            const progressValue = (elapsed / actualAnnouncementTime) * 100;

            setProgress(Math.max(0, Math.min(100, progressValue)));
            setProgressType('عد تنازلي قصير المدى');
          }
          // للمزادات متوسطة المدى
          else if (difference <= 60 * 60 * 1000) {
            const totalTime = 60 * 60 * 1000;
            const elapsed = totalTime - difference;
            const progressValue = (elapsed / totalTime) * 100;
            setProgress(Math.max(10, Math.min(90, progressValue)));
            setProgressType('عد تنازلي متوسط المدى');
          }
          // للمزادات طويلة المدى
          else {
            const hoursRemaining = difference / (60 * 60 * 1000);
            const progressValue = Math.max(5, Math.min(25, 25 - hoursRemaining * 2));
            setProgress(progressValue);
            setProgressType('عد تنازلي طويل المدى');
          }
          break;
        }

        case 'live': {
          if (!endTime) return;

          const auctionEndTime = new Date(endTime).getTime();
          const difference = auctionEndTime - now;
          setTimeLeft(Math.max(0, Math.floor(difference / 1000)));

          if (reservePrice && reservePrice > startingPrice) {
            const priceRange = reservePrice - startingPrice;
            const currentRange = currentPrice - startingPrice;

            if (priceRange <= 0) {
              setProgress(currentPrice > startingPrice ? 50 : 10);
              setProgressType('مزايدة أساسية');
            } else {
              const priceProgress = (currentRange / priceRange) * 100;
              setProgress(Math.max(0, Math.min(100, priceProgress)));
              setProgressType('تقدم بناءً على السعر');
            }
          } else {
            const totalDuration = 24 * 60 * 60 * 1000;
            const timeRemaining = difference;

            if (timeRemaining <= 0) {
              setProgress(100);
              setProgressType('انتهى الوقت');
            } else {
              const timeElapsed = totalDuration - timeRemaining;
              const progressValue = Math.max(10, Math.min(90, (timeElapsed / totalDuration) * 100));
              setProgress(progressValue);
              setProgressType('تقدم بناءً على الوقت');
            }
          }
          break;
        }
      }
    };

    calculateProgress();
    const timer = setInterval(calculateProgress, 500);

    return () => clearInterval(timer);
  }, [auctionStatus, startTime, endTime, currentPrice, startingPrice, reservePrice]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (auctionStatus) {
      case 'upcoming':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'live':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ended':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <h3 className="mb-3 font-semibold">مراقب التقدم المباشر</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>حالة المزاد:</span>
          <span className="font-medium">
            {auctionStatus === 'upcoming' ? 'قادم' : auctionStatus === 'live' ? 'مباشر' : 'منتهي'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>نوع التقدم:</span>
          <span className="font-medium">{progressType}</span>
        </div>

        <div className="flex justify-between">
          <span>التقدم الحالي:</span>
          <span className="font-bold">{Math.round(progress * 100) / 100}%</span>
        </div>

        {timeLeft > 0 && (
          <div className="flex justify-between">
            <span>الوقت المتبقي:</span>
            <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
          </div>
        )}

        {auctionStatus === 'live' && reservePrice > 0 && (
          <>
            <div className="flex justify-between">
              <span>السعر الحالي:</span>
              <span className="font-medium">{currentPrice.toLocaleString()} د.ل</span>
            </div>
            <div className="flex justify-between">
              <span>سعر البيع:</span>
              <span className="font-medium">{reservePrice.toLocaleString()} د.ل</span>
            </div>
            <div className="flex justify-between">
              <span>المتبقي للهدف:</span>
              <span className="font-medium">
                {Math.max(0, reservePrice - currentPrice).toLocaleString()} د.ل
              </span>
            </div>
          </>
        )}
      </div>

      {/* شريط التقدم المرئي */}
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs">
          <span>0%</span>
          <span>100%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-current transition-all duration-500 ease-in-out"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressMonitor;
