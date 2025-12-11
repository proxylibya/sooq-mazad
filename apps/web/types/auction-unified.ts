/**
 * ملف الأنواع الموحدة لنظام المزادات
 * يحتوي على جميع الأنواع المستخدمة في جميع الملفات
 */

// ============================================
// أنواع حالات المزاد - 4 حالات فقط
// ============================================

/**
 * حالات المزاد الموحدة:
 * - live: مزاد مباشر (حي الآن)
 * - upcoming: مزاد قادم (يبدأ قريباً)
 * - sold: تم البيع (بيع بنجاح)
 * - ended: مزاد منتهي (انتهى بدون بيع)
 */
export type AuctionStatus = 'live' | 'upcoming' | 'sold' | 'ended';

// ============================================
// معلومات حالة المزاد الكاملة
// ============================================

export interface AuctionStatusInfo {
  /** الحالة الأساسية للمزاد */
  status: AuctionStatus;
  
  /** هل تم البيع؟ */
  isSold: boolean;
  
  /** هل وصل السعر الحالي للسعر المطلوب؟ */
  hasReachedReserve: boolean;
  
  /** هل المزاد انتهى؟ */
  isEnded: boolean;
  
  /** هل المزاد حي الآن؟ */
  isLive: boolean;
  
  /** هل المزاد قادم؟ */
  isUpcoming: boolean;
}

// ============================================
// بيانات العداد
// ============================================

export interface AuctionTimerData {
  /** وقت البداية */
  startTime: string | Date | null;
  
  /** وقت النهاية */
  endTime: string | Date | null;
  
  /** السعر الحالي */
  currentBid: number | string;
  
  /** سعر البداية */
  startingBid?: number | string;
  
  /** السعر المطلوب */
  reservePrice?: number | string;
  
  /** حالة المزاد */
  status: AuctionStatus;
  
  /** عدد المزايدات */
  bidCount?: number;
}

// ============================================
// بيانات بطاقة المزاد
// ============================================

export interface AuctionCardData {
  /** معرف المزاد */
  id: string | number;
  
  /** عنوان المزاد */
  title: string;
  
  /** السعر الحالي */
  currentBid: string | number;
  
  /** سعر البداية */
  startingBid: string | number;
  
  /** السعر النهائي (للمزادات المباعة) */
  finalBid?: string | number | null;
  
  /** عدد المزايدات */
  bidCount: number;
  
  /** حالة المزاد */
  status: AuctionStatus;
  
  /** هل تم البيع؟ */
  isSold: boolean;
  
  /** وقت البداية */
  startTime: string;
  
  /** وقت النهاية */
  endTime: string;
  
  /** السعر المطلوب */
  reservePrice?: string | number;
  
  /** اسم المشتري (للمزادات المباعة) */
  buyerName?: string | null;
  
  /** الموقع */
  location?: string;
  
  /** المنطقة */
  area?: string;
  
  /** الصور */
  images: string[];
  
  /** الصورة الأساسية */
  image?: string;
  
  /** بيانات السيارة */
  brand?: string;
  model?: string;
  year?: string | number;
  mileage?: string | number;
  condition?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  
  /** رقم الهاتف */
  phone?: string;
  
  /** الوصف */
  description?: string;
}

// ============================================
// معلومات المزاد الكاملة
// ============================================

export interface FullAuctionData extends AuctionCardData {
  /** معرف البائع */
  sellerId?: string | number;
  
  /** معلومات البائع */
  seller?: {
    id: string | number;
    name: string;
    phone?: string;
    verified?: boolean;
    profileImage?: string;
  };
  
  /** المزايدات */
  bids?: Array<{
    id: string | number;
    amount: number;
    bidder: {
      id: string | number;
      name: string;
      verified?: boolean;
    };
    createdAt: Date | string;
  }>;
  
  /** معلومات السيارة الكاملة */
  car?: {
    id: string | number;
    title?: string;
    brand: string;
    model: string;
    year: number;
    mileage?: number;
    condition?: string;
    location?: string;
    description?: string;
    images?: string[];
    carImages?: Array<{
      fileUrl: string;
      isPrimary?: boolean;
      fileName?: string;
      category?: string;
    }>;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    color?: string;
    interiorColor?: string;
    seatCount?: number;
  };
  
  /** حالة قاعدة البيانات الأصلية */
  dbStatus?: string;
  
  /** تاريخ الإنشاء */
  createdAt?: Date | string;
  
  /** تاريخ التحديث */
  updatedAt?: Date | string;
}

// ============================================
// خيارات الفلترة
// ============================================

export interface AuctionFilterOptions {
  /** الحالة */
  status?: AuctionStatus | 'all';
  
  /** البحث */
  search?: string;
  
  /** الماركة */
  brand?: string;
  
  /** الحد الأدنى للسعر */
  minPrice?: number;
  
  /** الحد الأقصى للسعر */
  maxPrice?: number;
  
  /** الترتيب */
  sortBy?: 'price' | 'date' | 'bids' | 'endTime';
  
  /** اتجاه الترتيب */
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// إحصائيات المزادات
// ============================================

export interface AuctionStats {
  /** عدد المزادات المباشرة */
  live: number;
  
  /** عدد المزادات القادمة */
  upcoming: number;
  
  /** عدد المزادات المباعة */
  sold: number;
  
  /** عدد المزادات المنتهية */
  ended: number;
  
  /** المجموع الكلي */
  total: number;
}

// ============================================
// خيارات العرض
// ============================================

export interface AuctionDisplayOptions {
  /** نوع العرض */
  viewType?: 'grid' | 'list';
  
  /** حجم البطاقة */
  cardSize?: 'small' | 'medium' | 'large';
  
  /** إظهار العداد */
  showTimer?: boolean;
  
  /** إظهار الشارة */
  showBadge?: boolean;
  
  /** نوع الشارة */
  badgeVariant?: 'minimal' | 'detailed' | 'premium';
}
