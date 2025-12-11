/**
 * ⚠️ DEPRECATED - استخدم utils/auctionTimer.ts بدلاً من هذا الملف
 *
 * هذا الملف تم دمجه في نظام Timer الموحد V8.0
 * جميع الوظائف والأنواع متاحة الآن في auctionTimer.ts
 *
 * @deprecated منذ v8.0 - استخدم './auctionTimer' مباشرة
 */

// إعادة تصدير جميع الوظائف والأنواع من auctionTimer.ts
export type { TimeLeft, UnifiedAuctionProgress, UnifiedProgressParams } from './auctionTimer';

export {
  calculateUnifiedProgress,
  useUnifiedAuctionProgress,
  calculateTimeRemaining,
  getAuctionStatus,
} from './auctionTimer';

// للتوافق مع الكود القديم
export { calculateUnifiedProgress as calculateUnifiedAuctionProgress } from './auctionTimer';
