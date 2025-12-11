/**
 * 🏆 نظام ترتيب الإعلانات الموحد
 * Unified Promotion Sorting Service
 * 
 * يوفر نظام ترتيب موحد لجميع أنواع الإعلانات:
 * - السيارات (marketplace)
 * - المزادات (auctions)
 * - خدمات النقل (transport)
 * - الساحات (yards)
 */

import type { PromotionPackage } from '../promotion/promotion-system';

/**
 * واجهة العنصر القابل للترتيب
 */
export interface SortablePromotionItem {
    id: string | number;
    featured?: boolean;
    promotionPackage?: PromotionPackage | string | null;
    promotionPriority?: number;
    promotionEndDate?: Date | string | null;
    promotionDays?: number;
    verified?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * خيارات الترتيب
 */
export interface SortingOptions {
    /** عدد المميزة في الأعلى (افتراضي: 6) */
    maxFeaturedAtTop?: number;
    /** هل نخلط المميزة مع العادية؟ */
    mixFeaturedWithRegular?: boolean;
    /** الترتيب الثانوي */
    secondarySort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'rating';
    /** هل نتحقق من صلاحية الترويج؟ */
    checkPromotionValidity?: boolean;
}

/**
 * حساب أولوية العنصر حسب باقة الترويج
 */
export const getPromotionPriority = (item: SortablePromotionItem): number => {
    // إذا كان له أولوية محددة، استخدمها
    if (item.promotionPriority !== undefined && item.promotionPriority > 0) {
        return item.promotionPriority;
    }
    return 0;
};

/**
 * التحقق من صلاحية الترويج
 */
export const isPromotionValid = (item: SortablePromotionItem): boolean => {
    // إذا لم يكن مميز، رجّع false
    if (!item.featured) return false;

    // إذا كانت الباقة مجانية، رجّع false
    if (!item.promotionPackage || item.promotionPackage === 'free') return false;

    // التحقق من تاريخ الانتهاء
    if (item.promotionEndDate) {
        const endDate = new Date(item.promotionEndDate);
        if (endDate < new Date()) return false;
    }

    return true;
};

/**
 * دالة الترتيب الرئيسية الموحدة
 * تُستخدم في جميع صفحات العرض
 */
export const sortByPromotion = <T extends SortablePromotionItem>(
    items: T[],
    options: SortingOptions = {}
): T[] => {
    const {
        checkPromotionValidity = true,
        secondarySort = 'newest',
    } = options;

    return [...items].sort((a, b) => {
        // 1. المميزة الصالحة أولاً
        const aValid = checkPromotionValidity ? isPromotionValid(a) : (a.featured || false);
        const bValid = checkPromotionValidity ? isPromotionValid(b) : (b.featured || false);

        if (aValid !== bValid) {
            return bValid ? 1 : -1;
        }

        // 2. ثم حسب أولوية الباقة (الأعلى أولاً)
        const aPriority = getPromotionPriority(a);
        const bPriority = getPromotionPriority(b);

        if (aPriority !== bPriority) {
            return bPriority - aPriority;
        }

        // 3. ثم الموثقين
        const aVerified = a.verified ? 1 : 0;
        const bVerified = b.verified ? 1 : 0;
        if (aVerified !== bVerified) {
            return bVerified - aVerified;
        }

        // 4. الترتيب الثانوي
        switch (secondarySort) {
            case 'oldest':
                const aOld = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bOld = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return aOld - bOld;

            case 'newest':
            default:
                const aNew = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bNew = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bNew - aNew;
        }
    });
};

/**
 * فصل العناصر المميزة عن العادية
 */
export const separateByPromotion = <T extends SortablePromotionItem>(
    items: T[],
    options: SortingOptions = {}
): { featured: T[]; regular: T[]; } => {
    const { checkPromotionValidity = true } = options;

    const featured: T[] = [];
    const regular: T[] = [];

    for (const item of items) {
        const isValid = checkPromotionValidity ? isPromotionValid(item) : (item.featured || false);

        if (isValid) {
            featured.push(item);
        } else {
            regular.push(item);
        }
    }

    // ترتيب المميزة حسب الأولوية
    featured.sort((a, b) => getPromotionPriority(b) - getPromotionPriority(a));

    // ترتيب العادية حسب الأحدث
    regular.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
    });

    return { featured, regular };
};

/**
 * دمج المميزة مع العادية بشكل ذكي
 * يضع عدد محدد من المميزة في الأعلى ثم يمزج الباقي
 */
export const mergeWithFeaturedItems = <T extends SortablePromotionItem>(
    items: T[],
    options: SortingOptions = {}
): T[] => {
    const { maxFeaturedAtTop = 6 } = options;

    const { featured, regular } = separateByPromotion(items, options);

    // المميزة في الأعلى (حد أقصى)
    const topFeatured = featured.slice(0, maxFeaturedAtTop);
    const remainingFeatured = featured.slice(maxFeaturedAtTop);

    // دمج الباقي
    const mixed = [...remainingFeatured, ...regular];
    mixed.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
    });

    return [...topFeatured, ...mixed];
};

/**
 * ترتيب عناصر Prisma للاستخدام في APIs
 */
export const getPrismaPromotionOrderBy = () => {
    return [
        { featured: 'desc' as const },
        { promotionPriority: 'desc' as const },
        { verified: 'desc' as const },
        { createdAt: 'desc' as const },
    ];
};

/**
 * شرط Prisma للعناصر المميزة فقط
 */
export const getPrismaFeaturedWhere = () => {
    return {
        featured: true,
        promotionEndDate: {
            gt: new Date(),
        },
    };
};

/**
 * إحصائيات الترويج
 */
export interface PromotionStats {
    total: number;
    featured: number;
    byPackage: Record<string, number>;
}

/**
 * حساب إحصائيات الترويج للعناصر
 */
export const getPromotionStats = <T extends SortablePromotionItem>(
    items: T[]
): PromotionStats => {
    const stats: PromotionStats = {
        total: items.length,
        featured: 0,
        byPackage: {},
    };

    for (const item of items) {
        if (isPromotionValid(item)) {
            stats.featured++;
        }

        const pkg = (item.promotionPackage as string) || 'free';
        stats.byPackage[pkg] = (stats.byPackage[pkg] || 0) + 1;
    }

    return stats;
};

export default {
    sortByPromotion,
    separateByPromotion,
    mergeWithFeaturedItems,
    getPromotionPriority,
    isPromotionValid,
    getPrismaPromotionOrderBy,
    getPrismaFeaturedWhere,
    getPromotionStats,
};
