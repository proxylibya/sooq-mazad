/**
 * خدمة التقييمات المحسنة مع نظام تخزين مؤقت
 * تحسين الأداء وتقليل استعلامات قاعدة البيانات
 */

import { logger } from '../logger';
import { ReviewData, ReviewFilters, ReviewService, ReviewStats } from './reviewService';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CachedReviewService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static readonly CACHE_DURATION = {
    STATS: 1 * 60 * 1000, // دقيقة واحدة للإحصائيات (أقل للتحديث السريع)
    REVIEWS: 30 * 1000, // 30 ثانية للتقييمات (أقل للتحديث الفوري)
  };

  /**
   * تنظيف الذاكرة المؤقتة المنتهية الصلاحية
   */
  private static cleanExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * إنشاء مفتاح للذاكرة المؤقتة
   */
  private static createCacheKey(type: string, params: any): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  /**
   * جلب من الذاكرة المؤقتة
   */
  private static getFromCache<T>(key: string): T | null {
    this.cleanExpiredCache();
    const entry = this.cache.get(key);

    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }

    return null;
  }

  /**
   * حفظ في الذاكرة المؤقتة
   */
  private static setCache<T>(key: string, data: T, duration: number) {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    });
  }

  /**
   * إزالة من الذاكرة المؤقتة (عند إنشاء تقييم جديد)
   */
  private static invalidateCache(itemId?: string, itemType?: string) {
    if (itemId && itemType) {
      // إزالة الإحصائيات الخاصة بهذا العنصر
      const statsKey = this.createCacheKey('stats', { itemId, itemType });
      this.cache.delete(statsKey);

      // إزالة التقييمات الخاصة بهذا العنصر
      for (const key of this.cache.keys()) {
        if (key.includes(`"itemId":"${itemId}"`) && key.includes(`"itemType":"${itemType}"`)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * جلب إحصائيات التقييمات مع تخزين مؤقت محسن
   */
  static async getReviewStats(
    itemId?: string,
    itemType?: string,
    forceRefresh: boolean = false,
  ): Promise<ReviewStats> {
    const cacheKey = this.createCacheKey('stats', { itemId, itemType });

    logger.debug('[CachedReviewService] جلب إحصائيات التقييمات', { forceRefresh });

    // إذا كان force refresh، تجاهل الـ cache
    if (!forceRefresh) {
      // محاولة الجلب من الذاكرة المؤقتة
      const cachedStats = this.getFromCache<ReviewStats>(cacheKey);
      if (cachedStats) {
        logger.debug('[Cache Hit Stats] إحصائيات مخزنة');
        return cachedStats;
      }
    }

    logger.debug('[Cache Miss Stats] جلب إحصائيات جديدة');

    // جلب من قاعدة البيانات
    const stats = await ReviewService.getReviewStats(itemId, itemType);

    // حفظ في الذاكرة المؤقتة
    this.setCache(cacheKey, stats, this.CACHE_DURATION.STATS);
    logger.debug('[Cache Set Stats] تم حفظ الإحصائيات', { totalReviews: stats.totalReviews });

    return stats;
  }

  /**
   * جلب التقييمات مع تخزين مؤقت محسن
   */
  static async getReviews(filters: ReviewFilters) {
    const cacheKey = this.createCacheKey('reviews', filters);

    logger.debug('[CachedReviewService] جلب التقييمات', { cacheSize: this.cache.size });

    // محاولة الجلب من الذاكرة المؤقتة
    const cachedReviews = this.getFromCache(cacheKey);
    if (cachedReviews) {
      logger.debug('[Cache Hit] تقييمات مخزنة');
      return cachedReviews;
    }

    logger.debug('[Cache Miss] جلب تقييمات جديدة');

    // جلب من قاعدة البيانات
    const reviews = await ReviewService.getReviews(filters);

    // حفظ في الذاكرة المؤقتة
    this.setCache(cacheKey, reviews, this.CACHE_DURATION.REVIEWS);
    logger.debug('[Cache Set] تم حفظ التقييمات', { count: reviews.data?.reviews?.length || 0 });

    return reviews;
  }

  /**
   * إنشاء تقييم جديد مع إبطال شامل للذاكرة المؤقتة
   */
  static async createReview(data: ReviewData) {
    logger.debug('[CachedReviewService] إنشاء تقييم جديد', { itemType: data.itemType });

    const result = await ReviewService.createReview(data);

    if (result.success) {
      logger.info('[CachedReviewService] تم إنشاء التقييم بنجاح');

      // إبطال كامل وشامل للذاكرة المؤقتة
      this.cache.clear();
      logger.debug('[Cache Clear] تم مسح الذاكرة المؤقتة');

      // إضافة تأخير بسيط لضمان تحديث قاعدة البيانات
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return result;
  }

  /**
   * تحديث تقييم مع إبطال الذاكرة المؤقتة
   */
  static async updateReview(reviewId: string, userId: string, data: any) {
    const result = await ReviewService.updateReview(reviewId, userId, data);

    if (result.success) {
      // إبطال جميع الذاكرة المؤقتة (طريقة آمنة)
      this.cache.clear();
    }

    return result;
  }

  /**
   * حذف تقييم مع إبطال الذاكرة المؤقتة
   */
  static async deleteReview(reviewId: string, userId: string) {
    const result = await ReviewService.deleteReview(reviewId, userId);

    if (result.success) {
      // إبطال جميع الذاكرة المؤقتة (طريقة آمنة)
      this.cache.clear();
    }

    return result;
  }

  /**
   * تحديث مفيد/غير مفيد
   */
  static async updateHelpfulness(reviewId: string, type: 'helpful' | 'notHelpful') {
    return await ReviewService.updateHelpfulness(reviewId, type);
  }

  /**
   * إحصائيات الذاكرة المؤقتة (للمطورين)
   */
  static getCacheStats() {
    this.cleanExpiredCache();
    return {
      totalEntries: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        remainingTime: entry.expiresAt - Date.now(),
      })),
    };
  }

  /**
   * مسح الذاكرة المؤقتة (للمطورين)
   */
  static clearCache() {
    this.cache.clear();
    return { message: 'تم مسح الذاكرة المؤقتة بنجاح' };
  }
}

export default CachedReviewService;
