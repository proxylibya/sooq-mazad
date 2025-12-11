// تحسينات الأداء لمكونات معلومات البائع

import { useCallback } from 'react';

// ذاكرة تخزين مؤقت للبيانات
interface SellerData {
  id: string;
  name: string;
  phone: string;
  email: string;
  profileImage: string;
  verified: boolean;
  accountType: string;
  rating: number;
  reviewsCount: number;
  city: string;
  memberSince: string;
  createdAt?: Date;
  description: string;
  isOnline: boolean;
  stats: {
    totalListings: number;
    activeListings: number;
    totalViews: number;
    successfulDeals: number;
    responseRate: string;
    avgResponseTime: string;
  };
}

interface CacheEntry {
  data: SellerData;
  timestamp: number;
}

const sellerDataCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

// إدارة ذاكرة التخزين المؤقت
export const sellerCacheManager = {
  // حفظ البيانات في الذاكرة المؤقتة
  set: (key: string, data: SellerData) => {
    sellerDataCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  },

  // جلب البيانات من الذاكرة المؤقتة
  get: (key: string): SellerData | null => {
    const entry = sellerDataCache.get(key) as CacheEntry;

    if (!entry) return null;

    // التحقق من انتهاء صلاحية البيانات
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      sellerDataCache.delete(key);
      return null;
    }

    return entry.data;
  },

  // مسح البيانات المنتهية الصلاحية
  cleanup: () => {
    const now = Date.now();
    for (const [key, entry] of sellerDataCache.entries()) {
      if (now - (entry as CacheEntry).timestamp > CACHE_DURATION) {
        sellerDataCache.delete(key);
      }
    }
  },

  // مسح جميع البيانات
  clear: () => {
    sellerDataCache.clear();
  },
};

// تحسين تنسيق البيانات
export const optimizeSellerData = (rawData: Record<string, unknown> | null): SellerData | null => {
  if (!rawData) return null;

  const stats = (rawData.stats as Record<string, unknown>) || {};

  return {
    id: String(rawData.id || 'unknown'),
    name: String(rawData.name || 'بائع غير معروف'),
    phone: String(rawData.phone || ''),
    email: String(rawData.email || ''),
    profileImage: String(rawData.profileImage || '/images/default-avatar.svg'),
    verified: Boolean(rawData.verified),
    accountType: String(rawData.accountType || 'REGULAR_USER'),
    rating: Math.max(0, Math.min(5, Number(rawData.rating) || 0)),
    reviewsCount: Math.max(0, Number(rawData.reviewsCount) || 0),
    city: String(rawData.city || ''),
    memberSince:
      rawData.memberSince || rawData.createdAt
        ? new Date(rawData.createdAt as string | number | Date).getFullYear().toString()
        : 'غير محدد',
    createdAt: rawData.createdAt
      ? new Date(rawData.createdAt as string | number | Date)
      : undefined,
    description: String(rawData.description || ''),
    isOnline: Boolean(rawData.isOnline),
    stats: {
      totalListings: Math.max(0, Number(stats.totalListings) || 0),
      activeListings: Math.max(0, Number(stats.activeListings) || 0),
      totalViews: Math.max(0, Number(stats.totalViews) || 0),
      successfulDeals: Math.max(0, Number(stats.successfulDeals) || 0),
      responseRate: String(stats.responseRate || '95%'),
      avgResponseTime: String(stats.avgResponseTime || '45 دقيقة'),
    },
  };
};

// تحسين معالجات الأحداث
export const useOptimizedHandlers = (sellerId: string, sellerPhone: string) => {
  const handleContact = useCallback(() => {
    if (!sellerPhone) return;

    // تنظيف رقم الهاتف
    const cleanPhone = sellerPhone.replace(/[^\d+]/g, '');
    const phoneWithCountryCode = cleanPhone.startsWith('+')
      ? cleanPhone
      : `+218${cleanPhone.replace(/^0/, '')}`;

    window.open(`tel:${phoneWithCountryCode}`, '_self');
  }, [sellerPhone]);

  const handleWhatsApp = useCallback(() => {
    if (!sellerPhone) return;

    const cleanPhone = sellerPhone.replace(/[^\d]/g, '');
    const phoneWithCountryCode = cleanPhone.startsWith('218')
      ? cleanPhone
      : `218${cleanPhone.replace(/^0/, '')}`;

    const message = encodeURIComponent('مرحباً، أنا مهتم بإعلانك في موقع مزاد السيارات');

    window.open(`https://wa.me/${phoneWithCountryCode}?text=${message}`, '_blank');
  }, [sellerPhone]);

  return { handleContact, handleWhatsApp };
};

// تحسين تحميل الصور
export const optimizeImageLoading = (imageSrc: string | undefined) => {
  if (!imageSrc) return '/images/default-avatar.svg';

  // إضافة معاملات تحسين الصورة
  if (imageSrc.includes('cloudinary') || imageSrc.includes('imagekit')) {
    return `${imageSrc}?w=200&h=200&c=fill&f=auto&q=auto`;
  }

  return imageSrc;
};

// تحسين عرض التقييمات
export const optimizeRatingDisplay = (rating: number, reviewsCount: number) => {
  const safeRating = Math.max(0, Math.min(5, rating || 0));
  const safeReviewsCount = Math.max(0, reviewsCount || 0);

  const stars = [];
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 !== 0;

  for (let i = 0; i < 5; i++) {
    stars.push({
      key: i,
      type: i < fullStars ? 'full' : i === fullStars && hasHalfStar ? 'half' : 'empty',
    });
  }

  return {
    stars,
    displayRating: safeRating.toFixed(1),
    displayReviews: safeReviewsCount,
    hasRating: safeRating > 0,
  };
};

// تحسين تنسيق الأرقام
export const optimizeNumberFormatting = (number: number | undefined) => {
  if (!number || number === 0) return '0';

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}م`;
  } else if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}ك`;
  }

  return number.toLocaleString('ar-LY');
};

// تحسين تنسيق التواريخ
export const optimizeDateFormatting = (dateString: string | undefined) => {
  if (!dateString) return 'غير محدد';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 1) return 'اليوم';
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`;
    if (diffInDays < 30) return `منذ ${Math.floor(diffInDays / 7)} أسابيع`;
    if (diffInDays < 365) return `منذ ${Math.floor(diffInDays / 30)} أشهر`;

    return `منذ ${Math.floor(diffInDays / 365)} سنوات`;
  } catch {
    return 'غير محدد';
  }
};

// تحسين البحث والتصفية
export const optimizeSellerSearch = (sellers: SellerData[], searchTerm: string): SellerData[] => {
  if (!searchTerm.trim()) return sellers;

  const term = searchTerm.toLowerCase().trim();

  return sellers.filter(
    (seller) =>
      seller.name?.toLowerCase().includes(term) ||
      seller.city?.toLowerCase().includes(term) ||
      seller.phone?.includes(term),
  );
};

// تحسين الترتيب
export const optimizeSellerSorting = (sellers: SellerData[], sortBy: string): SellerData[] => {
  const sortedSellers = [...sellers];

  switch (sortBy) {
    case 'rating':
      return sortedSellers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'reviews':
      return sortedSellers.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    case 'listings':
      return sortedSellers.sort(
        (a, b) => (b.stats?.activeListings || 0) - (a.stats?.activeListings || 0),
      );
    case 'name':
      return sortedSellers.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'));
    case 'newest':
      return sortedSellers.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );
    default:
      return sortedSellers;
  }
};

// تنظيف الذاكرة المؤقتة دورياً
if (typeof window !== 'undefined') {
  setInterval(() => {
    sellerCacheManager.cleanup();
  }, CACHE_DURATION);
}

export default {
  sellerCacheManager,
  optimizeSellerData,
  useOptimizedHandlers,
  optimizeImageLoading,
  optimizeRatingDisplay,
  optimizeNumberFormatting,
  optimizeDateFormatting,
  optimizeSellerSearch,
  optimizeSellerSorting,
};
