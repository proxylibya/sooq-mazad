/**
 * حاسبة التقدم الموحدة للمزادات
 * تضمن نفس النتيجة في جميع المكونات
 */

export interface AuctionProgressData {
  progress: number;
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
  isActive: boolean;
}

interface CalculateProgressParams {
  auctionStatus: 'upcoming' | 'live' | 'ended';
  startTime?: string | Date;
  endTime: string | Date;
  currentPrice?: number;
  startingPrice?: number;
  reservePrice?: number;
}

/**
 * حساب التقدم الموحد للمزاد
 */
export function calculateAuctionProgress({
  auctionStatus,
  startTime,
  endTime,
  currentPrice = 0,
  startingPrice = 0,
  reservePrice = 0,
}: CalculateProgressParams): AuctionProgressData {
  const now = new Date().getTime();

  // حساب الوقت المتبقي
  const targetTime = auctionStatus === 'upcoming' ? startTime : endTime;
  let timeLeft = { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  let isActive = true;

  if (targetTime) {
    const target = new Date(targetTime).getTime();
    const difference = target - now;

    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      timeLeft = {
        hours,
        minutes,
        seconds,
        totalSeconds: Math.floor(difference / 1000),
      };
    } else {
      isActive = false;
    }
  }

  // حساب التقدم
  let progress = 20; // قيمة أساسية

  switch (auctionStatus) {
    case 'ended':
      progress = 100;
      break;

    case 'upcoming': {
      if (!startTime) {
        progress = 25;
        break;
      }

      const start = new Date(startTime).getTime();
      const difference = start - now;

      if (difference <= 0) {
        progress = 100; // بدأ المزاد
      } else {
        const hoursRemaining = difference / (1000 * 60 * 60);

        if (hoursRemaining <= 1) {
          // آخر ساعة: 70% إلى 90%
          progress = 70 + (1 - hoursRemaining) * 20;
        } else if (hoursRemaining <= 6) {
          // آخر 6 ساعات: 40% إلى 70%
          progress = 40 + ((6 - hoursRemaining) / 5) * 30;
        } else {
          // أكثر من 6 ساعات: 25% إلى 40%
          progress = Math.max(25, 40 - ((hoursRemaining - 6) / 12) * 15);
        }
      }
      break;
    }

    case 'live': {
      if (!endTime) {
        progress = 50;
        break;
      }

      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        progress = 100; // انتهى المزاد
      } else {
        // التقدم الأساسي: 35%
        progress = 35;

        // إضافة تقدم بناءً على السعر: حتى 45%
        if (currentPrice > 0 && startingPrice > 0) {
          const priceIncrease = currentPrice - startingPrice;

          if (reservePrice > 0 && reservePrice > startingPrice) {
            // مع سعر مطلوب
            const priceRatio = priceIncrease / (reservePrice - startingPrice);
            progress += Math.max(0, Math.min(45, priceRatio * 45));
          } else {
            // بدون سعر مطلوب
            const priceRatio = priceIncrease / startingPrice;
            progress += Math.max(0, Math.min(35, priceRatio * 35));
          }
        }

        // إضافة تقدم بناءً على الوقت: حتى 20%
        const hoursRemaining = difference / (1000 * 60 * 60);
        if (hoursRemaining <= 24) {
          const timeRatio = (24 - hoursRemaining) / 24;
          progress += Math.max(0, Math.min(20, timeRatio * 20));
        }
      }
      break;
    }
  }

  return {
    progress: Math.max(20, Math.min(95, progress)),
    timeLeft,
    isActive,
  };
}

/**
 * Hook بسيط لاستخدام حاسبة التقدم
 */
export function useAuctionProgress(params: CalculateProgressParams) {
  return calculateAuctionProgress(params);
}
