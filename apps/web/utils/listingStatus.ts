/**
 * مساعدات موحدة لحالات الإعلانات والمزادات
 * يضمن التطابق بين جميع أجزاء التطبيق
 */

export type ListingStatus =
  | 'active'
  | 'pending'
  | 'sold'
  | 'expired'
  | 'upcoming'
  | 'live'
  | 'ended';
export type ListingType = 'marketplace' | 'auction';

/**
 * معلومات حالة الإعلان
 */
export interface StatusInfo {
  color: string;
  text: string;
  icon: string;
}

/**
 * دالة موحدة لتحديد لون حالة الإعلان
 */
export const getStatusColor = (status: ListingStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-green-100 text-green-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'sold':
      return 'bg-red-100 text-red-800';
    // حالات المزاد
    case 'live':
      return 'bg-green-100 text-green-800';
    case 'upcoming':
      return 'bg-yellow-100 text-yellow-800';
    case 'ended':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * دالة موحدة لتحديد نص حالة الإعلان
 */
export const getStatusText = (status: ListingStatus): string => {
  switch (status) {
    case 'active':
      return 'نشط';
    case 'pending':
      return 'نشط';
    case 'expired':
      return 'منتهي الصلاحية';
    case 'sold':
      return 'مباع';
    // حالات المزاد
    case 'live':
      return 'مزاد مباشر';
    case 'upcoming':
      return 'مزاد قادم';
    case 'ended':
      return 'مزاد منتهي';
    default:
      return 'غير محدد';
  }
};

/**
 * دالة موحدة لتحديد نوع الإعلان
 */
export const getTypeColor = (type: ListingType): string => {
  switch (type) {
    case 'marketplace':
      return 'bg-green-100 text-green-800';
    case 'auction':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * دالة موحدة لتحديد نص نوع الإعلان
 */
export const getTypeText = (type: ListingType): string => {
  switch (type) {
    case 'marketplace':
      return 'السوق الفوري';
    case 'auction':
      return 'مزاد';
    default:
      return 'غير محدد';
  }
};

/**
 * دالة لتحديد ما إذا كانت الحالة نشطة
 */
export const isActiveStatus = (status: ListingStatus): boolean => {
  return status === 'active' || status === 'live';
};

/**
 * دالة لتحديد ما إذا كانت الحالة مكتملة
 */
export const isCompletedStatus = (status: ListingStatus): boolean => {
  return status === 'sold' || status === 'ended';
};

/**
 * دالة لتحديد ما إذا كانت الحالة في الانتظار
 */
export const isPendingStatus = (status: ListingStatus): boolean => {
  return status === 'pending' || status === 'upcoming';
};

/**
 * دالة لتحويل حالة قاعدة البيانات إلى حالة العرض
 */
export const mapDatabaseStatusToDisplayStatus = (
  dbStatus: string,
  type: ListingType,
): ListingStatus => {
  const upperStatus = dbStatus.toUpperCase();

  if (type === 'auction') {
    switch (upperStatus) {
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
        return 'ended';
      default:
        return 'upcoming';
    }
  } else {
    switch (upperStatus) {
      case 'AVAILABLE':
        return 'active';
      case 'ACTIVE':
        return 'active';
      case 'PENDING':
        return 'active';
      case 'SOLD':
        return 'sold';
      case 'EXPIRED':
        return 'expired';
      default:
        return 'active';
    }
  }
};

/**
 * دالة لحساب إحصائيات الإعلانات
 */
export const calculateListingStats = (listings: any[]) => {
  const total = listings.length;
  const marketplace = listings.filter((l) => l.type === 'marketplace').length;
  const auction = listings.filter((l) => l.type === 'auction').length;
  const active = listings.filter((l) => isActiveStatus(l.status)).length;
  const completed = listings.filter((l) => isCompletedStatus(l.status)).length;
  const pending = listings.filter((l) => isPendingStatus(l.status)).length;
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalFavorites = listings.reduce((sum, l) => sum + (l.favorites || 0), 0);

  return {
    total,
    marketplace,
    auction,
    active,
    completed,
    pending,
    totalViews,
    totalFavorites,
  };
};

/**
 * دالة لتصفية الإعلانات حسب الحالة والنوع
 */
export const filterListings = (
  listings: any[],
  statusFilter: string = 'all',
  typeFilter: string = 'all',
  searchTerm: string = '',
) => {
  return listings.filter((listing) => {
    const matchesSearch =
      !searchTerm ||
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    const matchesType = typeFilter === 'all' || listing.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });
};

/**
 * دالة لتحديد الحالة المناسبة عند إنشاء إعلان جديد
 */
export const getInitialStatus = (type: ListingType): ListingStatus => {
  return type === 'auction' ? 'upcoming' : 'active';
};
