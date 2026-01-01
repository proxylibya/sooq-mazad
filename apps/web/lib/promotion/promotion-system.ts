/**
 * نظام الترويج الموحد للإعلانات
 * يدعم: السيارات، المزادات، المعارض، خدمات النقل
 */

export type EntityType = 'car' | 'auction' | 'showroom' | 'transport';

export type PromotionPackage = 'free' | 'basic' | 'premium' | 'vip';

export interface PromotionPackageConfig {
    id: PromotionPackage;
    name: string;
    nameEn: string;
    price: number;
    days: number;
    priority: number;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    features: string[];
    popular?: boolean;
    viewsMultiplier: number;
}

// تكوين باقات الترويج
export const PROMOTION_PACKAGES: Record<PromotionPackage, PromotionPackageConfig> = {
    free: {
        id: 'free',
        name: 'مجاني',
        nameEn: 'Free',
        price: 0,
        days: 0,
        priority: 0,
        color: 'gray',
        gradientFrom: 'from-gray-400',
        gradientTo: 'to-gray-500',
        features: ['ظهور عادي في القوائم'],
        viewsMultiplier: 1,
    },
    basic: {
        id: 'basic',
        name: 'الباقة الأساسية',
        nameEn: 'Basic',
        price: 15,
        days: 7,
        priority: 1,
        color: 'blue',
        gradientFrom: 'from-blue-500',
        gradientTo: 'to-blue-600',
        features: [
            'ظهور في المقدمة لمدة 7 أيام',
            'شارة "مميز" على الإعلان',
            'زيادة المشاهدات بنسبة 200%',
        ],
        viewsMultiplier: 2,
    },
    premium: {
        id: 'premium',
        name: 'الباقة المتقدمة',
        nameEn: 'Premium',
        price: 35,
        days: 14,
        priority: 2,
        color: 'green',
        gradientFrom: 'from-green-500',
        gradientTo: 'to-emerald-600',
        features: [
            'ظهور في المقدمة لمدة 14 يوم',
            'شارة "مميز" على الإعلان',
            'ظهور في الصفحة الرئيسية',
            'زيادة المشاهدات بنسبة 400%',
            'إشعارات للمهتمين',
        ],
        popular: true,
        viewsMultiplier: 4,
    },
    vip: {
        id: 'vip',
        name: 'باقة VIP',
        nameEn: 'VIP',
        price: 65,
        days: 30,
        priority: 3,
        color: 'amber',
        gradientFrom: 'from-amber-500',
        gradientTo: 'to-orange-600',
        features: [
            'ظهور في المقدمة لمدة 30 يوم',
            'شارة VIP حصرية',
            'ظهور في جميع الصفحات',
            'أكبر عدد مشاهدات',
            'أولوية في نتائج البحث',
            'دعم فني مميز',
        ],
        viewsMultiplier: 6,
    },
};

// الحصول على قائمة الباقات المدفوعة فقط
export const getPaidPackages = (): PromotionPackageConfig[] => {
    return Object.values(PROMOTION_PACKAGES).filter((pkg) => pkg.price > 0);
};

// الحصول على باقة بواسطة المعرف
export const getPackageById = (id: PromotionPackage): PromotionPackageConfig => {
    return PROMOTION_PACKAGES[id] || PROMOTION_PACKAGES.free;
};

// التحقق من صلاحية الترويج
export const isPromotionActive = (endDate: Date | string | null | undefined): boolean => {
    if (!endDate) return false;
    const end = new Date(endDate);
    return end > new Date();
};

// حساب تاريخ انتهاء الترويج
export const calculatePromotionEndDate = (startDate: Date, days: number): Date => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    return endDate;
};

// الحصول على نوع الشارة حسب الباقة
export const getBadgeVariant = (
    packageType: PromotionPackage,
): 'gold' | 'premium' | 'vip' | 'basic' => {
    switch (packageType) {
        case 'vip':
            return 'vip';
        case 'premium':
            return 'premium';
        case 'basic':
            return 'basic';
        default:
            return 'gold';
    }
};

// الحصول على نص الشارة
export const getBadgeText = (packageType: PromotionPackage): string => {
    switch (packageType) {
        case 'vip':
            return 'VIP';
        case 'premium':
            return 'مميز';
        case 'basic':
            return 'مميز';
        default:
            return '';
    }
};

// ترتيب الإعلانات حسب الأولوية
export interface SortableItem {
    featured?: boolean;
    promotionPackage?: string | null;
    promotionPriority?: number;
    promotionEndDate?: Date | string | null;
    createdAt?: Date | string;
}

export const sortByPromotion = <T extends SortableItem>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
        // المميزة أولاً
        const aFeatured = a.featured ? 1 : 0;
        const bFeatured = b.featured ? 1 : 0;
        if (aFeatured !== bFeatured) return bFeatured - aFeatured;

        // ثم حسب الأولوية
        const aPriority = a.promotionPriority || 0;
        const bPriority = b.promotionPriority || 0;
        if (aPriority !== bPriority) return bPriority - aPriority;

        // ثم حسب تاريخ الإنشاء (الأحدث أولاً)
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
    });
};

// فصل الإعلانات المميزة عن العادية
export const separateFeaturedItems = <T extends SortableItem>(
    items: T[],
): { featured: T[]; regular: T[]; } => {
    const now = new Date();
    const featured: T[] = [];
    const regular: T[] = [];

    for (const item of items) {
        const isActive =
            item.featured && item.promotionEndDate && new Date(item.promotionEndDate) > now;
        if (isActive) {
            featured.push(item);
        } else {
            regular.push(item);
        }
    }

    // ترتيب المميزة حسب الأولوية
    featured.sort((a, b) => (b.promotionPriority || 0) - (a.promotionPriority || 0));

    // ترتيب العادية حسب تاريخ الإنشاء
    regular.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
    });

    return { featured, regular };
};

// دمج الإعلانات المميزة مع العادية بترتيب ذكي
export const mergeWithFeatured = <T extends SortableItem>(
    items: T[],
    maxFeaturedAtTop: number = 6,
): T[] => {
    const { featured, regular } = separateFeaturedItems(items);

    // عرض عدد محدود من المميزة في الأعلى
    const topFeatured = featured.slice(0, maxFeaturedAtTop);
    const remainingFeatured = featured.slice(maxFeaturedAtTop);

    // توزيع البقية بين الإعلانات العادية
    const result = [...topFeatured];

    // دمج المميزة المتبقية مع العادية
    const mixedItems = [...remainingFeatured, ...regular];

    // ترتيب المختلط حسب التاريخ
    mixedItems.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
    });

    return [...result, ...mixedItems];
};

// تحويل نوع الكيان إلى نص عربي
export const getEntityTypeName = (type: EntityType): string => {
    switch (type) {
        case 'car':
            return 'سيارة';
        case 'auction':
            return 'مزاد';
        case 'showroom':
            return 'معرض';
        case 'transport':
            return 'خدمة نقل';
        default:
            return 'إعلان';
    }
};

// التحقق من كفاية الرصيد
export const checkWalletBalance = async (
    userId: string,
    amount: number,
): Promise<{ sufficient: boolean; balance: number; }> => {
    try {
        const response = await fetch(`/api/wallet/balance?userId=${userId}`);
        if (!response.ok) {
            return { sufficient: false, balance: 0 };
        }
        const data = await response.json();
        const balance = data.totalBalance?.local || 0;
        return { sufficient: balance >= amount, balance };
    } catch {
        return { sufficient: false, balance: 0 };
    }
};
