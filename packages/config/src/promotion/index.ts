/**
 * نظام الترويج الموحد
 * Universal Promotion System
 * 
 * ═══════════════════════════════════════════════════════════════
 * 
 * الاستخدام:
 * 
 * import { 
 *   AUCTION_PACKAGES,
 *   MARKETPLACE_PACKAGES,
 *   calculatePromotionCost,
 *   buildPromotionData,
 * } from '@sooq-mazad/config/promotion';
 * 
 * ═══════════════════════════════════════════════════════════════
 * 
 * الفروقات:
 * 
 * | النوع          | المسار          | المدة              | التسعير        |
 * |----------------|-----------------|--------------------|--------------  |
 * | سوق المزاد     | /auctions       | حتى انتهاء المزاد  | ثابت (30/60/100) |
 * | السوق الفوري   | /marketplace    | بالأيام (7/14/30)  | بالأيام        |
 * 
 * ═══════════════════════════════════════════════════════════════
 */

// Types
export type {
    CreatePromotionInput,
    PackageLevel,
    PricingType,
    Promotion,
    PromotionConfig,
    PromotionCostSummary,
    PromotionPackage,
    PromotionSourceType,
    PromotionStatus
} from './types';

// Packages
export {
    AUCTION_PACKAGES,
    MARKETPLACE_PACKAGES,
    PROMOTION_CONFIGS,
    getPackage,
    getPackagesForSource,
    getPricingType,
    isPromotionLinkedToProduct
} from './packages';

// Utils
export {
    PACKAGE_COLORS, buildPromotionData,
    calculatePromotionCost,
    calculatePromotionEndDate,
    formatRemainingTime,
    getRemainingDays,
    isPromotionValid
} from './utils';

