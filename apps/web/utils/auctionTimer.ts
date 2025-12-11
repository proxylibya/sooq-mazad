import { useEffect, useRef, useState } from 'react';

/**
 * 🔄 نظام العداد المحسن الجديد - إعادة بناء كامل
 * يدعم جميع أنواع المزادات مع معالجة آمنة للتواريخ
 * v8.1 - إصلاح مشكلة الـ fallback timer
 */

// 📊 أنواع البيانات
export interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export interface UnifiedAuctionProgress {
  timeLeft: TimeLeft;
  displayProgress: number;
  isUrgent: boolean;
  progressType: 'time-based' | 'price-based' | 'completed';
  status: 'upcoming' | 'active' | 'ended';
  message: string;
}

export interface UnifiedProgressParams {
  auctionStatus: string;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  currentPrice?: number;
  startingPrice?: number;
  reservePrice?: number;
}

// 🛠️ دوال مساعدة للاختبارات والاستخدام العام
export const calculateTimeRemaining = (endTime: Date | string | null): TimeLeft & { isExpired: boolean; } => {
  if (!endTime) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
  }

  try {
    const end = new Date(endTime);
    if (isNaN(end.getTime())) {
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
    }

    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds, totalSeconds, isExpired: false };
  } catch {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
  }
};

export const getAuctionStatus = (startTime: Date | string | null, endTime: Date | string | null): 'upcoming' | 'live' | 'ended' => {
  if (!startTime || !endTime) return 'ended';

  try {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'ended';

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'live';
  } catch {
    return 'ended';
  }
};

// 🛠️ دالة تحويل التواريخ الآمنة الجديدة
const parseDateTime = (input: string | Date | null | undefined): Date | null => {
  // معالجة القيم الفارغة
  if (!input || input === null || input === undefined) {
    return null;
  }

  // معالجة empty objects (تحذير مقلل)
  if (typeof input === 'object' && !(input instanceof Date)) {
    if (Object.keys(input).length === 0) {
      if (Math.random() < 0.01) { // تحذير 1% من المرات فقط
        console.warn('[Timer V8] تم استقبال object فارغ');
      }
      return null;
    }
  }

  // معالجة Date objects
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  // معالجة strings
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // معالجة numbers (timestamps)
  if (typeof input === 'number') {
    const parsed = new Date(input);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

// 🎯 حساب الوقت المتبقي بطريقة بسيطة وواضحة (دالة داخلية)
const calculateTimeLeftInternal = (targetDate: Date, currentDate: Date): TimeLeft => {
  const diffMs = targetDate.getTime() - currentDate.getTime();

  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds };
};

// 🎯 تحديد حالة المزاد - محسّن ليحترم statusHint عند غياب التواريخ
const determineAuctionStatus = (
  startTime: Date | null,
  endTime: Date | null,
  currentTime: Date,
  statusHint?: 'upcoming' | 'active' | 'ended' | null
): { status: 'upcoming' | 'active' | 'ended'; message: string; } => {
  // إذا انتهى المزاد
  if (endTime && currentTime >= endTime) {
    return { status: 'ended', message: 'انتهى المزاد' };
  }

  // إذا لم يبدأ المزاد بعد
  if (startTime && currentTime < startTime) {
    return { status: 'upcoming', message: 'يبدأ قريباً' };
  }

  // ✅ الإصلاح الجذري: إذا لم تتوفر التواريخ، نحترم statusHint
  if (!startTime && !endTime && statusHint) {
    const messages: Record<string, string> = {
      upcoming: 'مزاد قادم',
      active: 'مزاد مباشر',
      ended: 'انتهى المزاد'
    };
    return { status: statusHint, message: messages[statusHint] || 'مزاد مباشر' };
  }

  // ✅ إذا كان startTime غير موجود لكن statusHint = 'upcoming'، نحترم ذلك
  if (!startTime && statusHint === 'upcoming') {
    return { status: 'upcoming', message: 'مزاد قادم' };
  }

  // المزاد نشط (افتراضي)
  return { status: 'active', message: 'مزاد مباشر' };
};

// 📏 حساب النسبة المئوية للتقدم المحسّن
const calculateProgress = (
  status: 'upcoming' | 'active' | 'ended',
  startTime: Date | null,
  endTime: Date | null,
  currentTime: Date
): number => {
  if (status === 'ended') return 100;

  if (!startTime || !endTime) return 15;

  const totalDuration = endTime.getTime() - startTime.getTime();
  if (totalDuration <= 0) return 15;

  if (status === 'upcoming') {
    // للمزادات القادمة: الوقت المتبقي حتى البداية
    const timeToStart = startTime.getTime() - currentTime.getTime();
    if (timeToStart <= 0) return 5; // على وشك البداية

    // شريط ينمو من 5% إلى 25% كلما اقترب البداية
    const maxWaitTime = 24 * 60 * 60 * 1000; // 24 ساعة
    const progress = 25 - ((timeToStart / maxWaitTime) * 20);
    return Math.min(25, Math.max(5, progress));
  }

  // للمزادات النشطة: الوقت المنقضي من إجمالي المدة
  const elapsedTime = currentTime.getTime() - startTime.getTime();
  const progress = (elapsedTime / totalDuration) * 100;

  // شريط من 25% إلى 100% حسب الوقت المنقضي
  const adjustedProgress = 25 + (progress * 0.75);
  return Math.min(100, Math.max(25, adjustedProgress));
};

// ⚡ النظام الأساسي الجديد - دالة رئيسية واحدة
export const calculateUnifiedProgress = (params: UnifiedProgressParams): UnifiedAuctionProgress => {
  const currentTime = new Date();

  // تحويل التواريخ بأمان
  const startTime = parseDateTime(params.startTime);
  const endTime = parseDateTime(params.endTime);

  // تلميح الحالة من المعاملات (معالجة 'sold' كـ 'ended') - يُحسب أولاً
  const statusHint: 'upcoming' | 'active' | 'ended' | null = (() => {
    const s = typeof params.auctionStatus === 'string' ? params.auctionStatus.toLowerCase() : '';
    if (s === 'sold') return 'ended';
    if (s === 'upcoming') return 'upcoming';
    if (s === 'ended') return 'ended';
    if (s === 'live' || s === 'active') return 'active';
    return null;
  })();

  // تحديد حالة المزاد - مع تمرير statusHint
  const auctionInfo = determineAuctionStatus(startTime, endTime, currentTime, statusHint);

  // تحديد التاريخ المستهدف
  let targetTime: Date | null = null;
  let fallbackUsed = false;

  if (auctionInfo.status === 'upcoming' && startTime) {
    targetTime = startTime;
  } else if (auctionInfo.status === 'active' && endTime) {
    targetTime = endTime;
  }

  // نظام fallback للتواريخ المفقودة (يحترم تلميح الحالة إن توفر)
  if (!targetTime) {
    fallbackUsed = true;
    const fallbackStatus = statusHint || auctionInfo.status;
    if (fallbackStatus === 'upcoming') {
      // للمزادات القادمة: 30 دقيقة من الآن
      targetTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
      if (Math.random() < 0.01) {
        console.info('[Timer V8] استخدام fallback - مزاد يبدأ خلال 30 دقيقة');
      }
    } else if (fallbackStatus === 'ended') {
      // للمزادات المنتهية: وقت متبقّي صفر
      targetTime = currentTime;
      if (Math.random() < 0.01) {
        console.info('[Timer V8] استخدام fallback - مزاد منتهي');
      }
    } else {
      // للمزادات النشطة: ساعتين من الآن
      targetTime = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
      if (Math.random() < 0.01) {
        console.info('[Timer V8] استخدام fallback - مزاد ينتهي خلال ساعتين');
      }
    }
  }
  // حساب الوقت المتبقي
  let timeLeft: TimeLeft;

  if (targetTime) {
    timeLeft = calculateTimeLeftInternal(targetTime, currentTime);
  } else {
    timeLeft = { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  // حساب النسبة المئوية
  const progress = calculateProgress(auctionInfo.status, startTime, endTime, currentTime);

  // تحديد إذا كان الوقت حرج (آخر 5 دقائق)
  const isUrgent = timeLeft.totalSeconds <= 300 && timeLeft.totalSeconds > 0; // آخر 5 دقائق

  // تحديد نوع التقدم
  const progressType: 'time-based' | 'completed' = auctionInfo.status === 'ended' ? 'completed' : 'time-based';

  // تحديد الحالة الفعلية مع إعادة التحقق
  let actualStatus = auctionInfo.status;

  // ✅ الإصلاح الجذري: فحص حالة SOLD أولاً بدون أي شروط إضافية
  // يجب فحص params.auctionStatus مباشرة بغض النظر عن statusHint
  const isSold = params.auctionStatus &&
    String(params.auctionStatus).toLowerCase() === 'sold';

  if (isSold) {
    // ✅ إذا تم البيع، نبقى على حالة 'ended' بدون إعادة حساب
    actualStatus = 'ended';
  } else if (startTime && endTime) {
    // إعادة التحقق من الحالة بناءً على الوقت الحالي فقط للمزادات غير المباعة
    if (currentTime < startTime) {
      actualStatus = 'upcoming';
    } else if (currentTime >= startTime && currentTime < endTime) {
      actualStatus = 'active';
    } else if (currentTime >= endTime) {
      actualStatus = 'ended';
    }
  } else if (statusHint) {
    // ✅ الإصلاح الجذري: إذا لم تتوفر التواريخ، نحترم statusHint
    // هذا يضمن عرض "مزاد قادم" بشكل صحيح حتى لو كانت التواريخ غير متوفرة
    actualStatus = statusHint;
  }

  // تسجيل تغيير الحالة (مهم للتشخيص)
  if (actualStatus !== auctionInfo.status && Math.random() < 0.05) {
    console.info(`[⏰ Timer] تحديث الحالة: ${auctionInfo.status} → ${actualStatus}`);
  }

  // تشخيص مفصل للنتائج النهائية
  const result = {
    timeLeft,
    displayProgress: progress,
    isUrgent,
    progressType,
    status: actualStatus,
    message: fallbackUsed
      ? (process.env.NODE_ENV !== 'production'
        ? `${auctionInfo.message} (وضع الاختبار)`
        : auctionInfo.message)
      : auctionInfo.message
  };

  // تسجيل نجاح العملية مع البيانات الحقيقية (معطل تقريباً - 0.1% فقط)
  if (!fallbackUsed && Math.random() < 0.001) {
    console.info(`[✅ Real Timer] ${auctionInfo.status} - ${progress.toFixed(0)}% - ${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`);
  }

  return result;
};

// 🔗 Hook الموحد المحسّن مع تحديث تلقائي
export const useUnifiedAuctionProgress = (
  params: UnifiedProgressParams,
  externalTick?: number,
): UnifiedAuctionProgress => {
  // ✅ حفظ targetTime الأصلي للـ fallback - لا يُعاد حسابه كل ثانية
  const fallbackTargetRef = useRef<Date | null>(null);
  const paramsKeyRef = useRef<string>('');

  // إنشاء مفتاح فريد للمعاملات لمعرفة متى تتغير
  const currentParamsKey = `${params.auctionStatus}-${params.startTime}-${params.endTime}`;

  // إعادة تعيين الـ fallback عند تغيير المعاملات الأساسية
  if (paramsKeyRef.current !== currentParamsKey) {
    paramsKeyRef.current = currentParamsKey;
    fallbackTargetRef.current = null; // سيتم حسابه مرة واحدة في أول استدعاء
  }

  // دالة محسنة تستخدم fallback ثابت
  const calculateWithStableFallback = (): UnifiedAuctionProgress => {
    const currentTime = new Date();
    const startTime = parseDateTime(params.startTime);
    const endTime = parseDateTime(params.endTime);

    // تحديد statusHint
    const statusHint: 'upcoming' | 'active' | 'ended' | null = (() => {
      const s = typeof params.auctionStatus === 'string' ? params.auctionStatus.toLowerCase() : '';
      if (s === 'sold') return 'ended';
      if (s === 'upcoming') return 'upcoming';
      if (s === 'ended') return 'ended';
      if (s === 'live' || s === 'active') return 'active';
      return null;
    })();

    const auctionInfo = determineAuctionStatus(startTime, endTime, currentTime, statusHint);

    // تحديد targetTime - مع استخدام fallback ثابت
    let targetTime: Date | null = null;
    let fallbackUsed = false;

    if (auctionInfo.status === 'upcoming' && startTime) {
      targetTime = startTime;
    } else if (auctionInfo.status === 'active' && endTime) {
      targetTime = endTime;
    }

    // ✅ نظام fallback ثابت - يُحسب مرة واحدة فقط
    if (!targetTime) {
      fallbackUsed = true;

      // إذا لم يكن هناك fallback محسوب مسبقاً، احسبه الآن
      if (!fallbackTargetRef.current) {
        const fallbackStatus = statusHint || auctionInfo.status;
        if (fallbackStatus === 'upcoming') {
          fallbackTargetRef.current = new Date(currentTime.getTime() + 30 * 60 * 1000);
          console.info('[Timer V8.1] ⏰ حساب fallback جديد - مزاد يبدأ خلال 30 دقيقة');
        } else if (fallbackStatus === 'ended') {
          fallbackTargetRef.current = currentTime;
        } else {
          fallbackTargetRef.current = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
        }
      }

      targetTime = fallbackTargetRef.current;
    }

    // حساب الوقت المتبقي
    const timeLeft = targetTime
      ? calculateTimeLeftInternal(targetTime, currentTime)
      : { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };

    // حساب النسبة المئوية
    const progress = calculateProgress(auctionInfo.status, startTime, endTime, currentTime);

    // تحديد الحالة الفعلية
    let actualStatus = auctionInfo.status;
    const isSold = params.auctionStatus && String(params.auctionStatus).toLowerCase() === 'sold';

    if (isSold) {
      actualStatus = 'ended';
    } else if (startTime && endTime) {
      if (currentTime < startTime) {
        actualStatus = 'upcoming';
      } else if (currentTime >= startTime && currentTime < endTime) {
        actualStatus = 'active';
      } else if (currentTime >= endTime) {
        actualStatus = 'ended';
      }
    } else if (statusHint) {
      actualStatus = statusHint;
    }

    // ✅ التحقق من انتهاء الـ fallback timer
    if (fallbackUsed && timeLeft.totalSeconds <= 0 && actualStatus === 'upcoming') {
      // العداد انتهى، تحويل لـ active
      actualStatus = 'active';
      fallbackTargetRef.current = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
      console.info('[Timer V8.1] ⏰ انتهى عداد upcoming، تحويل لـ active');
    }

    return {
      timeLeft,
      displayProgress: progress,
      isUrgent: timeLeft.totalSeconds <= 300 && timeLeft.totalSeconds > 0,
      progressType: actualStatus === 'ended' ? 'completed' : 'time-based',
      status: actualStatus,
      message: fallbackUsed
        ? (process.env.NODE_ENV !== 'production'
          ? `${auctionInfo.message} (عداد تقديري)`
          : auctionInfo.message)
        : auctionInfo.message
    };
  };

  const [progress, setProgress] = useState<UnifiedAuctionProgress>(() =>
    calculateWithStableFallback(),
  );

  // تحديث عند تغيير المعاملات أو externalTick
  useEffect(() => {
    const newProgress = calculateWithStableFallback();
    setProgress(newProgress);
  }, [
    params.auctionStatus,
    params.startTime,
    params.endTime,
    params.currentPrice,
    params.startingPrice,
    params.reservePrice,
    externalTick,
  ]);

  // نظام Timer موحد - يعمل فقط بدون externalTick
  useEffect(() => {
    // إذا كان هناك externalTick، لا نستخدم timer داخلي
    if (typeof externalTick === 'number') {
      return;
    }

    // مؤقت داخلي كل ثانية للتحديث المستمر
    const interval = setInterval(() => {
      const newProgress = calculateWithStableFallback();

      // تسجيل تغيير الحالة
      if (newProgress.status !== progress.status) {
        console.info(`[⏰ Timer] تغيرت حالة المزاد من ${progress.status} إلى ${newProgress.status}`);
      }

      setProgress(newProgress);
    }, 1000);

    return () => clearInterval(interval);
  }, [externalTick, currentParamsKey, progress.status]);

  return progress;
};

// 🔄 التوافق مع النظام القديم
export const calculateTimeLeft = (
  auctionStatus: string,
  startTime?: string | Date | null,
  endTime?: string | Date | null,
): TimeLeft => {
  const result = calculateUnifiedProgress({
    auctionStatus,
    startTime,
    endTime
  });

  return result.timeLeft;
};
