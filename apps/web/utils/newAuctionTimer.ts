/**
 * ⚠️ هذا الملف مُعطل - تم دمجه في auctionTimer.ts
 * استخدم utils/auctionTimer.ts بدلاً من هذا الملف
 * 
 * @deprecated استخدم auctionTimer.ts
 */

// تم نقل جميع الوظائف إلى auctionTimer.ts

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
  startTime?: any;
  endTime?: any;
  currentPrice?: number;
  startingPrice?: number;
  reservePrice?: number;
}

// 🛠️ دالة تحويل التواريخ الآمنة الجديدة
const parseDateTime = (input: any): Date | null => {
  // معالجة القيم الفارغة
  if (!input || input === null || input === undefined) {
    return null;
  }

  // معالجة empty objects
  if (typeof input === 'object' && !(input instanceof Date)) {
    if (Object.keys(input).length === 0) {
      console.warn('[Timer V8] تم استقبال object فارغ');
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

// 🎯 حساب الوقت المتبقي بطريقة بسيطة وواضحة
const calculateTimeRemaining = (targetDate: Date, currentDate: Date): TimeLeft => {
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

// 🎯 تحديد حالة المزاد
const determineAuctionStatus = (
  startTime: Date | null,
  endTime: Date | null,
  currentTime: Date
): { status: 'upcoming' | 'active' | 'ended'; message: string; } => {
  // إذا انتهى المزاد
  if (endTime && currentTime >= endTime) {
    return { status: 'ended', message: 'انتهى المزاد' };
  }

  // إذا لم يبدأ المزاد بعد
  if (startTime && currentTime < startTime) {
    return { status: 'upcoming', message: 'يبدأ قريباً' };
  }

  // المزاد نشط
  return { status: 'active', message: 'مزاد مباشر' };
};

// 📏 حساب النسبة المئوية للتقدم
const calculateProgress = (
  status: 'upcoming' | 'active' | 'ended',
  startTime: Date | null,
  endTime: Date | null,
  currentTime: Date
): number => {
  if (status === 'ended') return 100;

  if (!startTime || !endTime) return 0;

  const totalDuration = endTime.getTime() - startTime.getTime();
  if (totalDuration <= 0) return 0;

  if (status === 'upcoming') {
    // للمزادات القادمة: عكس الوقت المتبقي
    const timeToStart = startTime.getTime() - currentTime.getTime();
    const maxWaitTime = 24 * 60 * 60 * 1000; // يوم واحد
    const progress = Math.max(0, 100 - (timeToStart / maxWaitTime) * 100);
    return Math.min(100, progress);
  }

  // للمزادات النشطة: الوقت المنقضي
  const elapsedTime = currentTime.getTime() - startTime.getTime();
  return Math.min(100, (elapsedTime / totalDuration) * 100);
};

// ⚡ النظام الأساسي الجديد - دالة رئيسية واحدة
export const calculateUnifiedProgress = (params: UnifiedProgressParams): UnifiedAuctionProgress => {
  const currentTime = new Date();

  // تحويل التواريخ بأمان
  const startTime = parseDateTime(params.startTime);
  const endTime = parseDateTime(params.endTime);

  // نظام fallback للتواريخ المفقودة
  let targetTime = endTime;
  let fallbackUsed = false;

  if (!targetTime) {
    // إنشاء تاريخ احتياطي
    fallbackUsed = true;
    targetTime = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000); // ساعتين من الآن
    console.info('[Timer V8] استخدام fallback - مزاد ينتهي خلال ساعتين');
  }

  // تحديد حالة المزاد
  const auctionInfo = determineAuctionStatus(startTime, endTime, currentTime);

  // حساب الوقت المتبقي
  let timeLeft: TimeLeft;

  if (auctionInfo.status === 'upcoming' && startTime) {
    timeLeft = calculateTimeRemaining(startTime, currentTime);
  } else if (auctionInfo.status === 'active' && targetTime) {
    timeLeft = calculateTimeRemaining(targetTime, currentTime);
  } else {
    timeLeft = { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  // حساب النسبة المئوية
  const progress = calculateProgress(auctionInfo.status, startTime, endTime, currentTime);

  // تحديد إذا كان الوقت حرج (آخر 5 دقائق)
  const isUrgent = auctionInfo.status === 'active' && timeLeft.totalSeconds <= 300;

  // تحديد نوع التقدم
  const progressType = auctionInfo.status === 'ended' ? 'completed' : 'time-based';

  // إشعار إيجابي عندما يعمل النظام
  if (timeLeft.totalSeconds > 0) {
    console.info(`[Timer V8] ✅ العداد يعمل - ${auctionInfo.status} - ${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`);
  }

  return {
    timeLeft,
    displayProgress: progress,
    isUrgent,
    progressType,
    status: auctionInfo.status,
    message: fallbackUsed ? `${auctionInfo.message} (وضع الاختبار)` : auctionInfo.message
  };
};

import { useEffect, useState } from 'react';

// 🔗 Hook الموحد الجديد
export const useUnifiedAuctionProgress = (params: UnifiedProgressParams): UnifiedAuctionProgress => {
  const [progress, setProgress] = useState<UnifiedAuctionProgress>(() =>
    calculateUnifiedProgress(params)
  );

  useEffect(() => {
    // حساب فوري عند تغيير المعاملات
    setProgress(calculateUnifiedProgress(params));

    // تحديث كل ثانية
    const interval = setInterval(() => {
      setProgress(calculateUnifiedProgress(params));
    }, 1000);

    return () => clearInterval(interval);
  }, [params.auctionStatus, params.startTime, params.endTime, params.currentPrice]);

  return progress;
};

// 🔄 التوافق مع النظام القديم
export const calculateTimeLeft = (
  auctionStatus: string,
  startTime?: any,
  endTime?: any,
): TimeLeft => {
  const result = calculateUnifiedProgress({
    auctionStatus,
    startTime,
    endTime
  });

  return result.timeLeft;
};
