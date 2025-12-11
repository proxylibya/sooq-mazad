/**
 * ثوابت نظام المزادات
 * Auction System Constants
 */

// الحد الأدنى الثابت للمزايدة بالدينار الليبي
export const MINIMUM_BID_AMOUNT = 500;

// إعدادات المزايدة السريعة
export const QUICK_BID_OPTIONS = [
  { label: '+500', amount: 500 },
  { label: '+1000', amount: 1000 },
  { label: '+2000', amount: 2000 },
] as const;

// حدود المزايدة
export const BID_LIMITS = {
  MINIMUM: MINIMUM_BID_AMOUNT,
  MAXIMUM: 10000000, // 10 مليون دينار ليبي
  INCREMENT_STEP: 100, // خطوة التحكم في الزيادة/النقصان
} as const;

// حالات المزاد - موحّدة في جميع أنحاء التطبيق
export const AUCTION_STATUS = {
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE',     // ✅ الحالة الرسمية في قاعدة البيانات للمزاد النشط
  LIVE: 'LIVE',         // ⚠️ مرادف لـ ACTIVE - يُستخدم في الواجهة فقط
  ENDING_SOON: 'ENDING_SOON',
  ENDED: 'ENDED',
  SOLD: 'SOLD',
  CANCELLED: 'CANCELLED',
  SUSPENDED: 'SUSPENDED',
} as const;

/**
 * تحقق من كون المزاد نشطاً (يقبل المزايدات)
 * يوحّد المنطق في مكان واحد لتجنب التضارب
 */
export function isAuctionActive(status: string | null | undefined): boolean {
  if (!status) return false;
  const normalized = String(status).toUpperCase().trim();
  return normalized === 'ACTIVE' || normalized === 'LIVE';
}

/**
 * تحويل حالة المزاد للعرض في الواجهة
 */
export function getDisplayStatus(status: string | null | undefined): 'upcoming' | 'live' | 'ended' | 'sold' {
  if (!status) return 'upcoming';
  const normalized = String(status).toUpperCase().trim();

  if (normalized === 'UPCOMING' || normalized === 'PENDING') return 'upcoming';
  if (normalized === 'ACTIVE' || normalized === 'LIVE') return 'live';
  if (normalized === 'SOLD') return 'sold';
  if (normalized === 'ENDED' || normalized === 'CANCELLED' || normalized === 'SUSPENDED') return 'ended';

  return 'upcoming';
}

// رسائل التحقق
export const BID_VALIDATION_MESSAGES = {
  INVALID_AMOUNT: 'أدخل مبلغ صحيح',
  BELOW_MINIMUM: `الحد الأدنى للمزايدة ${MINIMUM_BID_AMOUNT} دينار ليبي`,
  ABOVE_MAXIMUM: 'المبلغ أكبر من الحد المسموح',
  INSUFFICIENT_INCREMENT: 'المبلغ أقل من الزيادة المطلوبة',
  BINDING_BID: 'العروض ملزمة ولا يمكن إلغاؤها',
  CHECK_WALLET: 'تأكد من رصيد المحفظة قبل المزايدة',
} as const;

export type AuctionStatus = typeof AUCTION_STATUS[keyof typeof AUCTION_STATUS];
export type QuickBidOption = typeof QUICK_BID_OPTIONS[number];

// عامل بداية السعر الافتراضي (قابل للتهيئة)
export const DEFAULT_START_PRICE_FACTOR = 0.70;

// عوامل مرنة حسب نوع الهيكل والحالة (اختياري)
export const START_PRICE_FACTORS = {
  default: DEFAULT_START_PRICE_FACTOR,
  byBodyType: {
    SUV: 0.75,
    PICKUP: 0.65,
    TRUCK: 0.65,
    SEDAN: 0.70,
    HATCHBACK: 0.65,
    COUPE: 0.70,
    VAN: 0.60,
  },
  byCondition: {
    NEW: 0.85,
    USED: 0.70,
    NEEDS_REPAIR: 0.55,
  },
} as const;

// اختيار عامل البداية المناسب حسب الفئة/الحالة
// ملاحظة: هذه الدالة تستخدم القيم الثابتة كـ fallback
// للحصول على القيم من الإعدادات، استخدم getStartPriceFactorFromSettings من auction-settings-loader.ts
export function getStartPriceFactor(bodyType?: string, condition?: string): number {
  try {
    // محاولة تحميل من الإعدادات المخصصة أولاً
    if (typeof window === 'undefined') {
      // في السيرفر - يمكن قراءة من ملف
      try {
        const { getStartPriceFactorFromSettings } = require('./auction-settings-loader');
        return getStartPriceFactorFromSettings(bodyType, condition);
      } catch (error) {
        // تابع للقيم الثابتة
      }
    }

    // القيم الثابتة كـ fallback
    const bt = (bodyType || '').toString().trim().toUpperCase();
    const cond = (condition || '').toString().trim().toUpperCase();
    const byCond = (START_PRICE_FACTORS.byCondition as unknown as Record<string, number>)[cond];
    const byType = (START_PRICE_FACTORS.byBodyType as unknown as Record<string, number>)[bt];
    const factor = Number(byCond ?? byType ?? START_PRICE_FACTORS.default ?? DEFAULT_START_PRICE_FACTOR);
    return Number.isFinite(factor) && factor > 0 && factor < 1 ? factor : DEFAULT_START_PRICE_FACTOR;
  } catch {
    return DEFAULT_START_PRICE_FACTOR;
  }
}

// تقريب قيمة للاقرب إلى خطوة الزيادة المحددة
export function roundToIncrement(value: number, increment: number): number {
  const v = Number(value) || 0;
  const inc = Number(increment) || 0;
  if (inc <= 0) return Math.floor(v);
  return Math.ceil(v / inc) * inc;
}

// زيادات مزايدة متدرجة حسب الشريحة السعرية (مع احترام الحد الأدنى)
export function computeTieredIncrement(currentBasePrice: number, configuredMinIncrement?: number): number {
  const price = Number(currentBasePrice) || 0;
  let tierIncrement = MINIMUM_BID_AMOUNT; // الأساس 500 د.ل

  // سياسة متدرجة بسيطة: كلما ارتفع السعر ارتفعت الزيادة الدنيا المقترحة
  if (price >= 100000) {
    tierIncrement = 2000;
  } else if (price >= 50000) {
    tierIncrement = 1000;
  } else {
    tierIncrement = 500;
  }

  const configured = Number(configuredMinIncrement || 0);
  return Math.max(tierIncrement, configured, MINIMUM_BID_AMOUNT);
}
