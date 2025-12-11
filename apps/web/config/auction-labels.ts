/**
 * النصوص الموحدة لنظام المزادات
 */

import type { AuctionStatus } from '@/types/auction-unified';

export const AUCTION_LABELS = {
  live: {
    badge: 'مزاد مباشر',
    short: 'مباشر',
    timer: 'ينتهي خلال',
    button: 'مزايدة الآن',
    description: 'المزاد مباشر حالياً',
  },
  upcoming: {
    badge: 'مزاد قادم',
    short: 'قريباً',
    soonToLive: 'بعد قليل',
    timer: 'يبدأ خلال',
    button: 'عرض التفاصيل',
    description: 'المزاد سيبدأ قريباً',
  },
  sold: {
    badge: 'تم البيع',
    short: 'مُباع',
    timer: 'السعر النهائي',
    button: 'مباع',
    description: 'تم بيع المزاد بنجاح',
  },
  ended: {
    badge: 'مزاد منتهي',
    short: 'منتهي',
    timer: 'انتهى المزاد',
    button: 'المزاد منتهي',
    description: 'انتهى المزاد بدون بيع',
  },
} as const;

export const getAuctionLabels = (status: AuctionStatus) => {
  return AUCTION_LABELS[status];
};

export default AUCTION_LABELS;
