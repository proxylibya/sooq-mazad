/**
 * نظام الترويج الموحد - الدوال المساعدة
 * Universal Promotion System - Utility Functions
 */

import { getPackage, getPricingType, isPromotionLinkedToProduct } from './packages';
import type {
    CreatePromotionInput,
    PackageLevel,
    PromotionCostSummary,
    PromotionSourceType,
} from './types';

// ═══════════════════════════════════════════════════════════════
// حساب التكلفة والمدة
// ═══════════════════════════════════════════════════════════════

/**
 * حساب تكلفة الترويج
 */
export function calculatePromotionCost(
    sourceType: PromotionSourceType,
    packageLevel: PackageLevel,
    customDays?: number
): PromotionCostSummary {
    const pkg = getPackage(sourceType, packageLevel);
    const pricingType = getPricingType(sourceType);

    if (packageLevel === 'NONE') {
        return {
            packageName: pkg.name,
            basePrice: 0,
            totalPrice: 0,
            duration: '-',
        };
    }

    if (pricingType === 'fixed') {
        // المزادات - سعر ثابت
        return {
            packageName: pkg.name,
            basePrice: pkg.price,
            totalPrice: pkg.price,
            duration: 'حتى انتهاء المزاد',
        };
    } else {
        // السوق الفوري - سعر بالأيام
        const days = customDays || pkg.days || 7;
        const pricePerDay = pkg.price / (pkg.days || 7);
        const totalPrice = customDays ? Math.round(pricePerDay * customDays) : pkg.price;

        return {
            packageName: pkg.name,
            basePrice: pkg.price,
            days,
            totalPrice,
            duration: `${days} يوم`,
        };
    }
}

/**
 * حساب تاريخ انتهاء الترويج
 */
export function calculatePromotionEndDate(
    sourceType: PromotionSourceType,
    packageLevel: PackageLevel,
    startDate: Date,
    options?: {
        auctionEndDate?: Date;
        customDays?: number;
    }
): Date {
    if (packageLevel === 'NONE') {
        return startDate;
    }

    const pkg = getPackage(sourceType, packageLevel);
    const linkedToProduct = isPromotionLinkedToProduct(sourceType);

    if (linkedToProduct && options?.auctionEndDate) {
        // المزادات - ينتهي مع المزاد
        return options.auctionEndDate;
    } else {
        // السوق الفوري - بعدد أيام محدد
        const days = options?.customDays || pkg.days || 7;
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days);
        return endDate;
    }
}

// ═══════════════════════════════════════════════════════════════
// بناء بيانات الترويج
// ═══════════════════════════════════════════════════════════════

/**
 * بناء بيانات الترويج لقاعدة البيانات
 */
export function buildPromotionData(input: CreatePromotionInput & { createdBy: string; }) {
    const {
        sourceType,
        sourceId,
        packageLevel,
        title,
        description,
        imageUrl,
        location,
        auctionEndDate,
        customDays,
        createdBy,
    } = input;

    if (packageLevel === 'NONE') {
        return null;
    }

    const pkg = getPackage(sourceType, packageLevel);
    const startDate = new Date();
    const endDate = calculatePromotionEndDate(sourceType, packageLevel, startDate, {
        auctionEndDate,
        customDays,
    });

    const cost = calculatePromotionCost(sourceType, packageLevel, customDays);

    // تحديد نوع الإعلان
    const adTypeMap: Record<PromotionSourceType, string> = {
        auction: 'AUCTION_LISTING',
        car: 'CAR_LISTING',
        showroom: 'SHOWROOM_AD',
        transport: 'TRANSPORT_SERVICE',
    };

    // بناء رابط الإعلان
    const linkUrlMap: Record<PromotionSourceType, string> = {
        auction: `/auction/${sourceId}`,
        car: `/car/${sourceId}`,
        showroom: `/showroom/${sourceId}`,
        transport: `/transport/${sourceId}`,
    };

    return {
        id: `promo_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`,
        title: `ترويج: ${title}`,
        description,
        imageUrl,
        linkUrl: linkUrlMap[sourceType],
        adType: adTypeMap[sourceType],
        sourceId,
        sourceType,
        position: pkg.priority,
        priority: pkg.priority,
        isActive: true,
        startDate,
        endDate,
        location,
        createdBy,
        updatedAt: new Date(),
        // معلومات إضافية
        _meta: {
            packageLevel,
            packageName: pkg.name,
            totalPrice: cost.totalPrice,
            duration: cost.duration,
        },
    };
}

// ═══════════════════════════════════════════════════════════════
// التحقق من الترويج
// ═══════════════════════════════════════════════════════════════

/**
 * التحقق من صلاحية الترويج
 */
export function isPromotionValid(endDate: Date): boolean {
    return new Date() < endDate;
}

/**
 * حساب الأيام المتبقية
 */
export function getRemainingDays(endDate: Date): number {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * تنسيق المدة المتبقية
 */
export function formatRemainingTime(endDate: Date): string {
    const days = getRemainingDays(endDate);

    if (days === 0) {
        const hours = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60));
        if (hours > 0) {
            return `${hours} ساعة`;
        }
        return 'انتهى';
    }

    if (days === 1) return 'يوم واحد';
    if (days === 2) return 'يومان';
    if (days <= 10) return `${days} أيام`;
    return `${days} يوم`;
}

// ═══════════════════════════════════════════════════════════════
// تصدير الألوان للواجهة
// ═══════════════════════════════════════════════════════════════

export const PACKAGE_COLORS = {
    NONE: {
        border: 'border-slate-700',
        borderSelected: 'border-slate-500',
        bg: 'bg-slate-800',
        bgSelected: 'bg-slate-500/10',
        text: 'text-slate-400',
        badge: 'bg-slate-600 text-slate-300',
    },
    BASIC: {
        border: 'border-slate-700',
        borderSelected: 'border-blue-500',
        bg: 'bg-slate-800',
        bgSelected: 'bg-blue-500/10',
        text: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-400',
    },
    PREMIUM: {
        border: 'border-slate-700',
        borderSelected: 'border-purple-500',
        bg: 'bg-slate-800',
        bgSelected: 'bg-purple-500/10',
        text: 'text-purple-400',
        badge: 'bg-purple-500/20 text-purple-400',
    },
    VIP: {
        border: 'border-slate-700',
        borderSelected: 'border-amber-500',
        bg: 'bg-slate-800',
        bgSelected: 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5',
        text: 'text-amber-400',
        badge: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black',
    },
} as const;
