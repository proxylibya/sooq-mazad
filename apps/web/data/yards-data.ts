/**
 * بيانات وأنواع الساحات الموحدة
 * Unified Yards Data and Types
 */

// ===== أنواع البيانات =====

export interface Yard {
    id: string;
    slug: string;
    name: string;
    description?: string;
    image: string;
    images: string[];
    city: string;
    area?: string;
    address?: string;
    phone?: string;
    phones: string[];
    email?: string;
    auctionDays: string[];
    auctionTimeFrom?: string;
    auctionTimeTo?: string;
    capacity?: number;
    verified: boolean;
    featured: boolean;
    rating?: number;
    reviewsCount: number;
    activeAuctions: number;
    services: string[];
    vehicleTypes: string[];
    managerName?: string;
    managerPhone?: string;
}

export interface YardStats {
    total: number;
    totalCapacity: number;
    activeAuctions: number;
}

export interface YardAuction {
    id: string;
    title: string;
    description?: string;
    currentPrice: number;
    startPrice: number;
    minimumBid: number;
    endDate: string;
    startDate: string;
    status: string;
    displayStatus: 'live' | 'upcoming' | 'sold' | 'ended';
    featured: boolean;
    views: number;
    totalBids: number;
    images: string[];
    highestBidder?: string;
    car?: {
        id: string;
        brand?: string;
        model?: string;
        year?: number;
        mileage?: number;
        condition?: string;
        fuelType?: string;
        transmission?: string;
        location?: string;
    };
    seller?: {
        id: string;
        name: string;
        verified: boolean;
    };
}

// ===== الثوابت والبيانات المشتركة =====

/**
 * تسميات أيام الأسبوع بالعربية
 */
export const dayLabels: Record<string, string> = {
    SAT: 'السبت',
    SUN: 'الأحد',
    MON: 'الاثنين',
    TUE: 'الثلاثاء',
    WED: 'الأربعاء',
    THU: 'الخميس',
    FRI: 'الجمعة',
};

/**
 * تسميات أنواع المركبات بالعربية
 */
export const vehicleTypeLabels: Record<string, string> = {
    CARS: 'سيارات',
    TRUCKS: 'شاحنات',
    MOTORCYCLES: 'دراجات نارية',
    BOATS: 'قوارب',
    OTHER: 'أخرى',
};

/**
 * حالات الساحات
 */
export const yardStatusLabels: Record<string, { label: string; color: string; }> = {
    ACTIVE: { label: 'نشط', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    INACTIVE: { label: 'غير نشط', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    PENDING: { label: 'في الانتظار', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    SUSPENDED: { label: 'موقوف', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

/**
 * خدمات الساحات المتاحة
 */
export const yardServices = [
    { id: 'security', label: 'حراسة أمنية', icon: 'ShieldCheckIcon' },
    { id: 'entry_management', label: 'تنظيم دخول', icon: 'TicketIcon' },
    { id: 'lighting', label: 'إنارة', icon: 'LightBulbIcon' },
    { id: 'parking', label: 'مواقف', icon: 'TruckIcon' },
    { id: 'maintenance', label: 'خدمات صيانة', icon: 'WrenchScrewdriverIcon' },
    { id: 'inspection', label: 'فحص فني', icon: 'ClipboardDocumentCheckIcon' },
    { id: 'washing', label: 'غسيل سيارات', icon: 'SparklesIcon' },
    { id: 'towing', label: 'سحب سيارات', icon: 'TruckIcon' },
    { id: 'wifi', label: 'واي فاي', icon: 'WifiIcon' },
    { id: 'cafe', label: 'مقهى/استراحة', icon: 'CubeIcon' },
];

/**
 * أنواع المركبات
 */
export const vehicleTypes = [
    { value: 'CARS', label: 'سيارات', icon: 'TruckIcon' },
    { value: 'TRUCKS', label: 'شاحنات', icon: 'TruckIcon' },
    { value: 'MOTORCYCLES', label: 'دراجات نارية', icon: 'TruckIcon' },
    { value: 'BOATS', label: 'قوارب', icon: 'TruckIcon' },
    { value: 'OTHER', label: 'أخرى', icon: 'CubeIcon' },
];

// ===== دوال مساعدة =====

/**
 * تنسيق يوم الأسبوع للعرض
 */
export function formatAuctionDay(day: string): string {
    return dayLabels[day] || day;
}

/**
 * تنسيق نوع المركبة للعرض
 */
export function formatVehicleType(type: string): string {
    return vehicleTypeLabels[type] || type;
}

/**
 * تنسيق الخدمة للعرض
 */
export function formatService(serviceId: string): string {
    const service = yardServices.find((s) => s.id === serviceId);
    return service?.label || serviceId;
}
