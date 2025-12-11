/**
 * نظام الترويج الموحد - الأنواع والواجهات
 * Universal Promotion System - Types & Interfaces
 */

// نوع المنتج المُروَّج
export type PromotionSourceType = 'auction' | 'car' | 'showroom' | 'transport';

// نوع التسعير
export type PricingType = 'fixed' | 'per_day';

// مستوى الباقة
export type PackageLevel = 'NONE' | 'BASIC' | 'PREMIUM' | 'VIP';

// حالة الترويج
export type PromotionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';

/**
 * تعريف الباقة
 */
export interface PromotionPackage {
    id: PackageLevel;
    name: string;
    nameEn: string;
    price: number;
    days?: number; // فقط للسوق الفوري
    features: string[];
    priority: number;
    color: 'slate' | 'blue' | 'purple' | 'amber';
    badge?: string;
}

/**
 * إعدادات الترويج حسب نوع المنتج
 */
export interface PromotionConfig {
    sourceType: PromotionSourceType;
    pricingType: PricingType;
    packages: Record<PackageLevel, PromotionPackage>;
    adType: string; // نوع الإعلان في قاعدة البيانات
}

/**
 * بيانات إنشاء ترويج جديد
 */
export interface CreatePromotionInput {
    sourceType: PromotionSourceType;
    sourceId: string;
    packageLevel: PackageLevel;
    title: string;
    description?: string;
    imageUrl?: string;
    location?: string;
    // للمزادات
    auctionEndDate?: Date;
    // للسوق الفوري
    customDays?: number;
}

/**
 * بيانات الترويج المحفوظ
 */
export interface Promotion {
    id: string;
    sourceType: PromotionSourceType;
    sourceId: string;
    title: string;
    description?: string;
    imageUrl?: string;
    linkUrl: string;
    packageLevel: PackageLevel;
    priority: number;
    price: number;
    startDate: Date;
    endDate: Date;
    status: PromotionStatus;
    views: number;
    clicks: number;
    location?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * ملخص تكلفة الترويج
 */
export interface PromotionCostSummary {
    packageName: string;
    basePrice: number;
    days?: number;
    totalPrice: number;
    duration: string; // "حتى انتهاء المزاد" أو "7 أيام"
}
