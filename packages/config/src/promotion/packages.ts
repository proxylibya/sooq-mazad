/**
 * نظام الترويج الموحد - تعريف الباقات
 * Universal Promotion System - Package Definitions
 */

import type { PackageLevel, PromotionConfig, PromotionPackage, PromotionSourceType } from './types';

// ═══════════════════════════════════════════════════════════════
// باقات المزادات - AUCTION PACKAGES
// السعر ثابت، الترويج ينتهي مع انتهاء المزاد
// ═══════════════════════════════════════════════════════════════

export const AUCTION_PACKAGES: Record<PackageLevel, PromotionPackage> = {
    NONE: {
        id: 'NONE',
        name: 'بدون ترويج',
        nameEn: 'No Promotion',
        price: 0,
        features: [],
        priority: 0,
        color: 'slate',
    },
    BASIC: {
        id: 'BASIC',
        name: 'الباقة الأساسية',
        nameEn: 'Basic',
        price: 30,
        features: [
            'شارة مميز',
            'أولوية في البحث',
        ],
        priority: 1,
        color: 'blue',
    },
    PREMIUM: {
        id: 'PREMIUM',
        name: 'الباقة المتقدمة',
        nameEn: 'Premium',
        price: 60,
        features: [
            'شارة مميز',
            'أولوية في البحث',
            'ظهور في الصفحة الرئيسية',
            'إشعارات للمتابعين',
        ],
        priority: 2,
        color: 'purple',
    },
    VIP: {
        id: 'VIP',
        name: 'باقة VIP',
        nameEn: 'VIP',
        price: 100,
        features: [
            'شارة VIP ذهبية',
            'أعلى أولوية في البحث',
            'ظهور دائم في الصفحة الرئيسية',
            'إشعارات لجميع المستخدمين',
            'تقرير إحصائيات مفصل',
        ],
        priority: 3,
        color: 'amber',
        badge: 'الأفضل',
    },
};

// ═══════════════════════════════════════════════════════════════
// باقات السوق الفوري - MARKETPLACE PACKAGES
// السعر بالأيام (7/14/30 يوم)
// ═══════════════════════════════════════════════════════════════

export const MARKETPLACE_PACKAGES: Record<PackageLevel, PromotionPackage> = {
    NONE: {
        id: 'NONE',
        name: 'بدون ترويج',
        nameEn: 'No Promotion',
        price: 0,
        days: 0,
        features: [],
        priority: 0,
        color: 'slate',
    },
    BASIC: {
        id: 'BASIC',
        name: 'الباقة الأساسية',
        nameEn: 'Basic',
        price: 50,
        days: 7,
        features: [
            'شارة مميز',
            'أولوية في البحث',
        ],
        priority: 1,
        color: 'blue',
    },
    PREMIUM: {
        id: 'PREMIUM',
        name: 'الباقة المتقدمة',
        nameEn: 'Premium',
        price: 100,
        days: 14,
        features: [
            'شارة مميز',
            'أولوية في البحث',
            'ظهور في الصفحة الرئيسية',
            'إشعارات للمتابعين',
        ],
        priority: 2,
        color: 'purple',
    },
    VIP: {
        id: 'VIP',
        name: 'باقة VIP',
        nameEn: 'VIP',
        price: 200,
        days: 30,
        features: [
            'شارة VIP ذهبية',
            'أعلى أولوية في البحث',
            'ظهور دائم في الصفحة الرئيسية',
            'إشعارات لجميع المستخدمين',
            'تقرير إحصائيات مفصل',
        ],
        priority: 3,
        color: 'amber',
        badge: 'الأفضل',
    },
};

// ═══════════════════════════════════════════════════════════════
// إعدادات الترويج حسب نوع المنتج
// ═══════════════════════════════════════════════════════════════

export const PROMOTION_CONFIGS: Record<PromotionSourceType, PromotionConfig> = {
    auction: {
        sourceType: 'auction',
        pricingType: 'fixed',
        packages: AUCTION_PACKAGES,
        adType: 'AUCTION_LISTING',
    },
    car: {
        sourceType: 'car',
        pricingType: 'per_day',
        packages: MARKETPLACE_PACKAGES,
        adType: 'CAR_LISTING',
    },
    showroom: {
        sourceType: 'showroom',
        pricingType: 'per_day',
        packages: MARKETPLACE_PACKAGES,
        adType: 'SHOWROOM_AD',
    },
    transport: {
        sourceType: 'transport',
        pricingType: 'per_day',
        packages: MARKETPLACE_PACKAGES,
        adType: 'TRANSPORT_SERVICE',
    },
};

// ═══════════════════════════════════════════════════════════════
// دوال مساعدة للحصول على الباقات
// ═══════════════════════════════════════════════════════════════

/**
 * الحصول على الباقات حسب نوع المنتج
 */
export function getPackagesForSource(sourceType: PromotionSourceType): Record<PackageLevel, PromotionPackage> {
    return PROMOTION_CONFIGS[sourceType].packages;
}

/**
 * الحصول على باقة محددة
 */
export function getPackage(sourceType: PromotionSourceType, level: PackageLevel): PromotionPackage {
    return PROMOTION_CONFIGS[sourceType].packages[level];
}

/**
 * الحصول على نوع التسعير
 */
export function getPricingType(sourceType: PromotionSourceType): 'fixed' | 'per_day' {
    return PROMOTION_CONFIGS[sourceType].pricingType;
}

/**
 * هل الترويج ينتهي مع المنتج؟
 */
export function isPromotionLinkedToProduct(sourceType: PromotionSourceType): boolean {
    return sourceType === 'auction';
}
