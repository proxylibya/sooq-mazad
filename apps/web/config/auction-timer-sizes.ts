/**
 * تكوين أحجام عداد المزايدة الدائري
 * هذا الملف يحتوي على الأحجام المحفوظة والمعتمدة للمشروع
 */

export interface AuctionTimerSizeConfig {
  containerSize: string;
  padding: string;
  priceSize: string;
  timeSize: string;
  currencySize: string;
  strokeWidth: number;
  radius: number;
  svgSize: number;
}

export type AuctionTimerSize = 'mini' | 'compact' | 'small' | 'medium' | 'medium-mobile' | 'large';

/**
 * الأحجام المعتمدة والمحفوظة للمشروع
 * تم تحديد هذه القيم بناءً على التصميم المطلوب
 */
export const AUCTION_TIMER_SIZES: Record<AuctionTimerSize, AuctionTimerSizeConfig> = {
  // الحجم المصغر - للبطاقات الشبكية (العداد البسيط القديم)
  mini: {
    containerSize: 'w-32 h-32',
    padding: 'p-2',
    priceSize: 'text-sm',
    timeSize: 'text-xs',
    currencySize: 'text-xs',
    strokeWidth: 2,
    radius: 55,
    svgSize: 128,
  },

  // الحجم المدمج - للبطاقات الشبكية (العداد الكامل مصغر)
  compact: {
    containerSize: 'w-36 h-36', // تصغير الحجم من w-40 h-40 إلى w-36 h-36
    padding: 'p-0.5', // تقليل المساحة الداخلية للحد الأدنى
    priceSize: 'text-xs', // تصغير حجم السعر من text-sm إلى text-xs
    timeSize: 'text-xs', // حجم الوقت مصغر
    currencySize: 'text-xs', // حجم العملة مصغر
    strokeWidth: 3,
    radius: 63, // تصغير نصف القطر من 70 إلى 63
    svgSize: 144, // تصغير حجم SVG من 160 إلى 144
  },

  small: {
    containerSize: 'w-44 h-44',
    padding: 'p-4',
    priceSize: 'text-base',
    timeSize: 'text-xs',
    currencySize: 'text-xs',
    strokeWidth: 3,
    radius: 75,
    svgSize: 176,
  },

  // الحجم المتوسط - محفوظ ومعتمد للمشروع (للشاشات الكبيرة)
  medium: {
    containerSize: 'w-56 h-56', // الحجم الأصلي للشاشات الكبيرة
    padding: 'p-4', // المساحة الداخلية الأصلية
    priceSize: 'text-xl', // حجم السعر الأصلي
    timeSize: 'text-base', // حجم الوقت الأصلي
    currencySize: 'text-sm', // حجم العملة الأصلي
    strokeWidth: 5, // سمك الخط الأصلي
    radius: 98, // نصف القطر الأصلي
    svgSize: 224, // حجم SVG الأصلي
  },

  // الحجم المتوسط للشاشات الصغيرة (640px أو أقل)
  'medium-mobile': {
    containerSize: 'w-48 h-48', // تم تقليل الحجم بـ 30 بكسل للشاشات الصغيرة
    padding: 'p-1', // مساحة داخلية مقللة للشاشات الصغيرة
    priceSize: 'text-sm', // حجم السعر مقلل للشاشات الصغيرة
    timeSize: 'text-xs', // حجم الوقت مقلل للشاشات الصغيرة
    currencySize: 'text-xs', // حجم العملة مقلل للشاشات الصغيرة
    strokeWidth: 3, // سمك خط مقلل للشاشات الصغيرة
    radius: 82, // نصف قطر مقلل للشاشات الصغيرة
    svgSize: 192, // حجم SVG مقلل للشاشات الصغيرة
  },

  large: {
    containerSize: 'w-64 h-64',
    padding: 'p-4',
    priceSize: 'text-2xl',
    timeSize: 'text-base',
    currencySize: 'text-sm',
    strokeWidth: 6,
    radius: 110,
    svgSize: 256,
  },
};

/**
 * الحجم الافتراضي للمشروع
 */
export const DEFAULT_AUCTION_TIMER_SIZE: AuctionTimerSize = 'medium';

/**
 * دالة للحصول على تكوين الحجم
 */
export const getAuctionTimerSizeConfig = (
  size: AuctionTimerSize = DEFAULT_AUCTION_TIMER_SIZE,
): AuctionTimerSizeConfig => {
  return AUCTION_TIMER_SIZES[size];
};

/**
 * التحقق من صحة الحجم
 */
export const isValidAuctionTimerSize = (size: string): size is AuctionTimerSize => {
  return Object.keys(AUCTION_TIMER_SIZES).includes(size);
};
