/**
 * ملف البيانات الوهمية للمزادات - مُعطل
 * تم تنظيف هذا الملف - يجب استخدام قاعدة البيانات الحقيقية فقط
 * @deprecated لا تستخدم البيانات الوهمية - استخدم API الحقيقي
 */

// أنواع البيانات فقط للتوافق مع الكود القديم
export interface MockAuction {
  id: string;
  title: string;
  description: string;
  startPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
  images: Array<{ id: string; url: string; alt: string; }>;
  seller: { id: string; name: string; phone: string; rating: number; verified: boolean; };
  bids: Array<{ id: string; amount: number; bidder: { id: string; name: string; }; timestamp: string; }>;
  vehicle?: {
    brand: string;
    model: string;
    year: number;
    mileage: number;
    condition: 'NEW' | 'USED' | 'DAMAGED';
    engineSize: string;
    fuelType: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
    transmission: 'MANUAL' | 'AUTOMATIC';
    color: string;
  };
  location: string;
  viewCount: number;
  watchCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuction {
  id: string;
  car_id: string;
  car_info: { make: string; model: string; year: number; };
  title: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  start_time: string;
  end_time: string;
  starting_price: number;
  current_bid: number | null;
  reserve_price?: number;
  total_bids: number;
  participants_count: number;
  seller_info: { name: string; type: string; };
  created_at: string;
}

// مصفوفة فارغة - لا توجد بيانات وهمية
export const mockAuctions: MockAuction[] = [];

// دوال فارغة للتوافق مع الكود القديم
export const getAuctionById = (_id: string): MockAuction | undefined => undefined;
export const findAuctionById = getAuctionById;
export const getMockAuctions = (): AdminAuction[] => [];
export const getActiveAuctions = (): MockAuction[] => [];
export const getEndingSoonAuctions = (): MockAuction[] => [];
export const searchAuctions = (_query: string): MockAuction[] => [];

export default mockAuctions;
