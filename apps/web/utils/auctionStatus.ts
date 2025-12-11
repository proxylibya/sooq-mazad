/**
 * مساعدات موحدة لحساب حالة المزاد
 */

import type { AuctionStatus, AuctionStatusInfo } from '@/types/auction-unified';

/**
 * ✨ دالة موحدة شاملة لتحديد ما إذا كان المزاد "تم بيعه"
 * @param auction - بيانات المزاد
 * @returns true إذا تم البيع
 */
export function isAuctionSold(auction: any): boolean {
  // 1. فحص حالة قاعدة البيانات (أولوية قصوى)
  const dbStatus = String(auction.status || '').toUpperCase();
  if (dbStatus === 'SOLD') return true;

  const carStatus = String(auction.car?.status || '').toUpperCase();
  if (carStatus === 'SOLD') return true;

  // 2. فحص وجود مشتري
  if (auction.buyerName || auction.winner) return true;

  // 3. فحص الوصول للسعر المطلوب + انتهاء المزاد
  const now = new Date();
  const auctionEndTime = auction.endDate || auction.endTime || auction.auctionEndTime;
  const hasEnded = auctionEndTime ? now > new Date(auctionEndTime) : false;

  if (hasEnded) {
    const currentBid = parseFloat(String(auction.currentBid || auction.currentPrice || 0).replace(/[,\s]/g, ''));
    const reservePrice = parseFloat(String(auction.reservePrice || 0).replace(/[,\s]/g, ''));

    if (reservePrice > 0 && currentBid >= reservePrice) {
      return true;
    }
  }

  return false;
}

/**
 * ✨ دالة موحدة لتحديد حالة المزاد الأساسية (بدون فحص البيع)
 * @param auction - بيانات المزاد
 * @returns حالة المزاد
 */
export function getAuctionStatus(auction: any): AuctionStatus {
  // 0) 🔒 أولاً: فحص حالة SOLD من قاعدة البيانات (أولوية قصوى مطلقة)
  const dbStatus = String(auction.status || '').toUpperCase();
  if (dbStatus === 'SOLD') {
    return 'sold';
  }

  const carStatus = String(auction.car?.status || '').toUpperCase();
  if (carStatus === 'SOLD') {
    return 'sold';
  }

  // 0.5) 🔍 فحص إضافي: auctionType من DB
  const auctionType = String(auction.auctionType || '').toLowerCase();
  if (auctionType === 'sold') {
    return 'sold';
  }

  // 1) الحالة المحسوبة زمنياً
  const startTime = auction.startDate || auction.auctionStartTime || auction.startTime;
  const endTime = auction.endDate || auction.auctionEndTime || auction.endTime;

  // ✅ إصلاح: فحص أن الأوقات ليست empty objects
  const hasValidStartTime = startTime && (typeof startTime !== 'object' || (typeof startTime === 'object' && Object.keys(startTime).length > 0));
  const hasValidEndTime = endTime && (typeof endTime !== 'object' || (typeof endTime === 'object' && Object.keys(endTime).length > 0));

  if (hasValidStartTime && hasValidEndTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const now = new Date();
      if (now < start) return 'upcoming';

      // ✅ الإصلاح: فحص البيع قبل إرجاع 'ended'
      if (now > end) {
        // فحص إذا تم البيع بعد انتهاء الوقت
        if (isAuctionSold(auction)) {
          return 'sold';
        }
        return 'ended'; // منتهي زمنياً (لم يُباع)
      }
      return 'live';
    }
  }

  // 2) fallback إلى حالة قاعدة البيانات
  if (auction.status) {
    switch (String(auction.status).toUpperCase()) {
      case 'UPCOMING':
      case 'SCHEDULED':
        return 'upcoming';
      case 'ACTIVE':
      case 'LIVE':
        return 'live';
      case 'ENDED':
      case 'COMPLETED':
      case 'CANCELLED':
      case 'SUSPENDED':
        // ✅ فحص البيع حتى في fallback
        if (isAuctionSold(auction)) {
          return 'sold';
        }
        return 'ended';
    }
  }

  // 3) fallback إلى auctionType إن وُجد
  if (auction.auctionType) {
    const type = String(auction.auctionType).toLowerCase();
    if (['upcoming', 'live', 'ended', 'sold'].includes(type)) {
      return type as AuctionStatus;
    }
  }

  // 4) fallback أخير - نفضل 'upcoming' إذا لم نستطع تحديد الحالة
  // لأن المزادات الجديدة عادة تكون قادمة
  return 'upcoming';
}

/**
 * ✨ دالة موحدة شاملة لتحديد حالة المزاد الكاملة
 * @param auction - بيانات المزاد
 * @returns معلومات الحالة الكاملة
 */
export function getFullAuctionStatus(auction: any): AuctionStatusInfo {
  const baseStatus = getAuctionStatus(auction);
  const isSold = isAuctionSold(auction);

  const now = new Date();
  const startTime = auction.startDate || auction.startTime || auction.auctionStartTime;
  const endTime = auction.endDate || auction.endTime || auction.auctionEndTime;

  const isUpcoming = startTime ? now < new Date(startTime) : false;
  const isEnded = endTime ? now > new Date(endTime) : false;
  const isLive = !isUpcoming && !isEnded;

  const currentBid = parseFloat(String(auction.currentBid || auction.currentPrice || 0).replace(/[,\s]/g, ''));
  const reservePrice = parseFloat(String(auction.reservePrice || 0).replace(/[,\s]/g, ''));
  const hasReachedReserve = reservePrice > 0 && currentBid >= reservePrice;

  // الحالة النهائية: إذا تم البيع، نعرض 'sold' بدلاً من الحالة الأساسية
  const finalStatus: AuctionStatus = isSold ? 'sold' : baseStatus;

  return {
    status: finalStatus,
    isSold,
    hasReachedReserve,
    isEnded,
    isLive,
    isUpcoming,
  };
}

/**
 * دالة لتحديد معلومات عرض حالة المزاد
 * استخدام النظام الموحد من auction-theme.ts و auction-labels.ts
 * @param status - حالة المزاد
 * @returns معلومات العرض
 */
export const getAuctionStatusInfo = (status: AuctionStatus) => {
  // استيراد ديناميكي للألوان والنصوص لتجنب الدورات الدائرية
  const COLORS = {
    live: {
      gradient: 'from-red-600 to-red-500',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-300',
    },
    upcoming: {
      gradient: 'from-amber-600 to-amber-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-300',
    },
    sold: {
      gradient: 'from-green-600 to-green-500',
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-300',
    },
    ended: {
      gradient: 'from-gray-500 to-gray-400',
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-300',
    },
  };

  const LABELS = {
    live: 'مزاد مباشر',
    upcoming: 'مزاد قادم',
    sold: 'تم البيع',
    ended: 'مزاد منتهي',
  };

  const BUTTONS = {
    live: 'bg-red-600 hover:bg-red-700 text-white',
    upcoming: 'bg-amber-600 hover:bg-amber-700 text-white',
    sold: 'bg-green-600 text-white cursor-not-allowed',
    ended: 'bg-gray-400 text-gray-700 cursor-not-allowed',
  };

  const colors = COLORS[status] || COLORS.ended;

  return {
    color: colors.gradient,
    bgColor: colors.bg,
    textColor: colors.text,
    borderColor: colors.border,
    label: LABELS[status] || 'غير محدد',
    pulse: status === 'live', // فقط المزادات المباشرة تنبض
    buttonClass: BUTTONS[status] || BUTTONS.ended,
  };
};

/**
 * دالة لتحديد السعر المعروض حسب حالة المزاد
 * @param auction - بيانات المزاد
 * @param status - حالة المزاد
 * @returns السعر المعروض
 */
export const getDisplayPrice = (auction: any, status: AuctionStatus): string => {
  // للمزادات المباعة: عرض السعر النهائي
  if (status === 'sold') {
    return auction.finalBid || auction.currentBid || auction.currentPrice || '0';
  }

  // للمزادات المنتهية: عرض السعر النهائي إذا وجد
  if (status === 'ended' && auction.finalBid) {
    return auction.finalBid;
  }

  // للمزادات القادمة: عرض سعر البداية
  if (status === 'upcoming') {
    return auction.startingBid || auction.startingPrice || '0';
  }

  // للمزادات المباشرة: عرض السعر الحالي
  return auction.currentBid || auction.currentPrice || auction.startingBid || auction.startingPrice || '0';
};

/**
 * دالة لتحديد تسمية السعر حسب حالة المزاد
 * @param status - حالة المزاد
 * @returns تسمية السعر
 */
export const getPriceLabel = (status: AuctionStatus): string => {
  switch (status) {
    case 'sold':
      return 'سعر البيع النهائي';
    case 'ended':
      return 'السعر النهائي';
    case 'upcoming':
      return 'سعر البداية';
    case 'live':
    default:
      return 'المزايدة الحالية';
  }
};

/**
 * دالة لتحديد الوقت المستخدم في العداد
 * @param auction - بيانات المزاد
 * @param status - حالة المزاد
 * @returns الوقت المستخدم
 */
export const getTimerEndTime = (auction: any, status: AuctionStatus): string => {
  if (status === 'upcoming') {
    return auction.startDate || auction.auctionStartTime || auction.startTime;
  }
  return auction.endDate || auction.auctionEndTime || auction.endTime;
};

/**
 * دالة للتحقق من إمكانية المزايدة
 * @param status - حالة المزاد
 * @returns هل يمكن المزايدة
 */
export const canBid = (status: AuctionStatus): boolean => {
  return status === 'live';
};

/**
 * دالة للتحقق من إمكانية إضافة تذكير
 * @param status - حالة المزاد
 * @returns هل يمكن إضافة تذكير
 */
export const canAddReminder = (status: AuctionStatus): boolean => {
  return status === 'upcoming';
};
