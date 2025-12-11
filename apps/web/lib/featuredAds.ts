export interface FeaturedAd {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  linkUrl?: string; // الحقل الجديد من جدول featured_ads
  location?: string;
  adType: 'CAR_LISTING' | 'AUCTION_LISTING' | 'SHOWROOM_AD' | 'TRANSPORT_SERVICE' | 'GENERIC_AD';
  sourceType?: 'car' | 'auction' | 'showroom' | 'transport';
  sourceId?: string; // معرف المصدر (المزاد/السيارة/المعرض)
  sourceData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  creator?: {
    id: string;
    name: string;
    phone?: string;
  };
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  priority: number;
  position?: number;
  sponsored?: boolean;
}

export const getAdImageUrl = (ad: FeaturedAd): string => {
  if (ad.imageUrl) return ad.imageUrl;

  if (ad.sourceData) {
    switch (ad.sourceType) {
      case 'car':
        return ad.sourceData.images?.[0]?.url || '/images/default-car.jpg';
      case 'auction':
        return ad.sourceData.images?.[0]?.url || '/images/default-auction.jpg';
      case 'showroom':
        return ad.sourceData.logo || '/images/default-showroom.jpg';
      case 'transport':
        return '/images/default-transport.jpg';
      default:
        return '/images/default-ad.jpg';
    }
  }

  return '/images/default-ad.jpg';
};

export const getAdTitle = (ad: FeaturedAd): string => {
  if (ad.title) return ad.title;

  if (ad.sourceData) {
    switch (ad.sourceType) {
      case 'car':
        return `${ad.sourceData.brand} ${ad.sourceData.model} ${ad.sourceData.year}`;
      case 'auction':
        return `مزاد: ${ad.sourceData.title || 'سيارة مميزة'}`;
      case 'showroom':
        return ad.sourceData.name || 'معرض مميز';
      case 'transport':
        return ad.sourceData.serviceName || 'خدمة نقل';
      default:
        return 'إعلان مميز';
    }
  }

  return 'إعلان مميز';
};

export const getAdDescription = (ad: FeaturedAd): string => {
  if (ad.description) return ad.description;

  if (ad.sourceData) {
    switch (ad.sourceType) {
      case 'car':
        return `${ad.sourceData.mileage || 0} كم - ${ad.sourceData.condition || 'مستعملة'}`;
      case 'auction':
        return ad.sourceData.description || 'مزاد على سيارة مميزة';
      case 'showroom':
        return ad.sourceData.description || 'معرض سيارات معتمد';
      case 'transport':
        return ad.sourceData.description || 'خدمة نقل موثوقة';
      default:
        return 'إعلان مميز متاح الآن';
    }
  }

  return 'إعلان مميز متاح الآن';
};

export const getAdLink = (ad: FeaturedAd): string => {
  if (ad.link) return ad.link;

  if (ad.sourceData) {
    switch (ad.sourceType) {
      case 'car':
        return `/cars/${ad.sourceData.id}`;
      case 'auction':
        return `/auctions/${ad.sourceData.id}`;
      case 'showroom':
        return `/showrooms/${ad.sourceData.id}`;
      case 'transport':
        return `/transport/${ad.sourceData.id}`;
      default:
        return '#';
    }
  }

  return '#';
};

export const trackAdClick = async (adId: string): Promise<void> => {
  try {
    await fetch('/api/featured-ads/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adId, action: 'click' }),
    });
  } catch (error) {
    console.error('Failed to track ad click:', error);
  }
};

export const trackAdView = async (adId: string): Promise<void> => {
  try {
    await fetch('/api/featured-ads/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adId, action: 'view' }),
    });
  } catch (error) {
    console.error('Failed to track ad view:', error);
  }
};
