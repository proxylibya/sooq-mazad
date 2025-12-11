/**
 * نظام الترويج الموحد للإعلانات
 * يدعم: السيارات، المزادات، المعارض، خدمات النقل
 */

export type EntityType = 'car' | 'auction' | 'showroom' | 'transport';

export type PromotionPackage = string;

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
