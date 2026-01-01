// مساعدات المزاد
export interface AuctionTiming {
  startDate: string;
  startTime: string;
  displayText: string;
}

// حساب أدنى زيادة تلقائياً بناءً على سعر البداية
export const calculateMinimumBid = (startingPrice: string): number => {
  const price = parseFloat(startingPrice.replace(/,/g, '')) || 0;

  if (price < 10000) return 100;
  if (price < 50000) return 500;
  if (price < 100000) return 1000;
  return 2000;
};

// حساب السعر المتوقع للمزاد
export const calculateExpectedPrice = (startingPrice: string): string => {
  const price = parseFloat(startingPrice.replace(/,/g, '')) || 0;
  const minExpected = Math.round(price * 1.15);
  const maxExpected = Math.round(price * 1.4);
  return `${minExpected.toLocaleString()} - ${maxExpected.toLocaleString()}`;
};

// تحويل خيار التوقيت إلى تاريخ ووقت فعلي
export const convertTimingToDateTime = (
  timing: string,
  customDate?: string,
  customTime?: string,
): AuctionTiming => {
  const now = new Date();
  let startDate: Date;
  let displayText: string;

  switch (timing) {
    case 'now':
      // بدء خلال 30 دقيقة
      startDate = new Date(now.getTime() + 30 * 60 * 1000);
      displayText = 'فوراً (خلال 30 دقيقة)';
      break;

    case 'today':
      // اليوم في الساعة 8 مساءً
      startDate = new Date(now);
      startDate.setHours(20, 0, 0, 0);

      // إذا كان الوقت قد مضى، اجعله غداً
      if (startDate <= now) {
        startDate.setDate(startDate.getDate() + 1);
        displayText = 'غداً في الساعة 8 مساءً';
      } else {
        displayText = 'اليوم في الساعة 8 مساءً';
      }
      break;

    case 'tomorrow':
      // غداً في الساعة 8 مساءً
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(20, 0, 0, 0);
      displayText = 'غداً في الساعة 8 مساءً';
      break;

    case 'custom':
      // وقت مخصص
      if (!customDate || !customTime) {
        throw new Error('التاريخ والوقت المخصص مطلوبان');
      }

      startDate = new Date(`${customDate}T${customTime}`);
      displayText = `${customDate} في الساعة ${customTime}`;
      break;

    default:
      throw new Error('خيار التوقيت غير صحيح');
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    startTime: startDate.toISOString().split('T')[1].slice(0, 5),
    displayText,
  };
};

// حساب وقت انتهاء المزاد
export const calculateEndDateTime = (
  startDate: string,
  startTime: string,
  duration: string,
): Date => {
  const startDateTime = new Date(`${startDate}T${startTime}`);

  switch (duration) {
    case '24h':
      return new Date(startDateTime.getTime() + 24 * 60 * 60 * 1000);
    case '3d':
      return new Date(startDateTime.getTime() + 3 * 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(startDateTime.getTime() + 7 * 24 * 60 * 60 * 1000);
    default:
      throw new Error('مدة المزاد غير صحيحة');
  }
};

// التحقق من صحة بيانات المزاد
export const validateAuctionData = (
  data: any,
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // التحقق من سعر البداية
  if (!data.startingPrice) {
    errors.startingPrice = 'سعر البداية مطلوب';
  } else {
    const price = parseFloat(data.startingPrice.replace(/,/g, ''));
    if (price < 500) {
      errors.startingPrice = 'سعر البداية يجب أن يكون 500 د.ل على الأقل';
    } else if (price > 50000000) {
      errors.startingPrice = 'سعر البداية يجب أن يكون أقل من 50,000,000 د.ل';
    }
  }

  // التحقق من مدة المزاد
  if (!data.auctionDuration) {
    errors.auctionDuration = 'مدة المزاد مطلوبة';
  } else if (!['24h', '3d', '7d'].includes(data.auctionDuration)) {
    errors.auctionDuration = 'مدة المزاد غير صحيحة';
  }

  // التحقق من وقت البدء
  if (!data.startTiming) {
    errors.startTiming = 'وقت بدء المزاد مطلوب';
  } else if (!['now', 'today', 'tomorrow', 'custom'].includes(data.startTiming)) {
    errors.startTiming = 'وقت بدء المزاد غير صحيح';
  }

  // التحقق من الوقت المخصص
  if (data.startTiming === 'custom') {
    if (!data.customStartDate) {
      errors.customStartDate = 'التاريخ مطلوب للوقت المخصص';
    }
    if (!data.customStartTime) {
      errors.customStartTime = 'الوقت مطلوب للوقت المخصص';
    }

    // التحقق من أن التاريخ في المستقبل
    if (data.customStartDate && data.customStartTime) {
      const customDateTime = new Date(`${data.customStartDate}T${data.customStartTime}`);
      if (customDateTime <= new Date()) {
        errors.customStartDate = 'يجب أن يكون التاريخ والوقت في المستقبل';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// تنسيق عرض المدة
export const formatDuration = (duration: string): string => {
  switch (duration) {
    case '24h':
      return 'سريع (24 ساعة)';
    case '3d':
      return 'عادي (3 أيام)';
    case '7d':
      return 'مطول (7 أيام)';
    default:
      return duration;
  }
};

// تنسيق عرض التوقيت
export const formatTiming = (timing: string, customDate?: string, customTime?: string): string => {
  switch (timing) {
    case 'now':
      return 'فوراً';
    case 'today':
      return 'اليوم المساء';
    case 'tomorrow':
      return 'غداً المساء';
    case 'custom':
      return customDate && customTime ? `${customDate} ${customTime}` : 'وقت مخصص';
    default:
      return timing;
  }
};

// تنسيق عرض تاريخ المزاد حسب نوعه وحالته
export const formatAuctionDate = (
  auctionType: 'upcoming' | 'live' | 'ended' | 'sold',
  startTime?: string,
  endTime?: string,
): string => {
  try {
    if (auctionType === 'upcoming' && startTime) {
      const startDate = new Date(startTime);
      if (isNaN(startDate.getTime())) {
        return 'وقت غير صحيح';
      }

      const now = new Date();
      const diffInHours = Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) {
        return 'يبدأ خلال دقائق';
      } else if (diffInHours < 24) {
        return `يبدأ خلال ${diffInHours} ساعة`;
      } else {
        return startDate.toLocaleDateString('ar-LY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } else if (auctionType === 'live') {
      return 'مزاد نشط الآن';
    } else if (auctionType === 'sold') {
      return 'تم البيع';
    } else if (auctionType === 'ended' && endTime) {
      const endDate = new Date(endTime);
      if (isNaN(endDate.getTime())) {
        return 'انتهى';
      }

      return `انتهى في ${endDate.toLocaleDateString('ar-LY', {
        month: 'short',
        day: 'numeric',
      })}`;
    }

    return 'غير محدد';
  } catch (error) {
    console.error('خطأ في تنسيق تاريخ المزاد:', error);
    return 'غير محدد';
  }
};

// إنشاء ملخص المزاد
export const createAuctionSummary = (data: any) => {
  const minimumBid = calculateMinimumBid(data.startingPrice);
  const expectedPrice = calculateExpectedPrice(data.startingPrice);

  try {
    const timing = convertTimingToDateTime(
      data.startTiming,
      data.customStartDate,
      data.customStartTime,
    );

    const endDateTime = calculateEndDateTime(
      timing.startDate,
      timing.startTime,
      data.auctionDuration,
    );

    return {
      startingPrice: data.startingPrice,
      minimumBid: minimumBid.toLocaleString(),
      expectedPrice,
      duration: formatDuration(data.auctionDuration),
      startTiming: timing.displayText,
      endDateTime: endDateTime.toLocaleString('ar-LY'),
    };
  } catch (error) {
    console.error('خطأ في إنشاء ملخص المزاد:', error);
    return null;
  }
};
