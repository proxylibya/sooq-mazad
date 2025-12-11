/**
 * نظام كاش بسيط متوافق مع KeyDB Alternative
 * يستبدل advancedCaching.ts لحل مشاكل التوافق
 */

import { cache } from '../lib/core/cache/UnifiedCache';

interface SimpleCacheOptions {
  ttl?: number; // بالثواني
  namespace?: string;
}

class SimpleCaching {
  private readonly defaultTTL = 3600; // ساعة واحدة

  /**
   * حفظ في الكاش
   */
  async set<T>(key: string, value: T, options: SimpleCacheOptions = {}): Promise<boolean> {
    const { ttl = this.defaultTTL, namespace = 'default' } = options;

    try {
      return await cache.set(key, value, { ttl, namespace });
    } catch (error) {
      console.error('خطأ في حفظ الكاش:', error);
      return false;
    }
  }

  /**
   * جلب من الكاش
   */
  async get<T>(key: string, namespace = 'default'): Promise<T | null> {
    try {
      return await cache.get<T>(key, namespace);
    } catch (error) {
      console.error('خطأ في جلب من الكاش:', error);
      return null;
    }
  }

  /**
   * جلب أو تعيين (Get-or-Set Pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: SimpleCacheOptions = {},
  ): Promise<T> {
    const { ttl = this.defaultTTL, namespace = 'default' } = options;

    try {
      return await cache.getOrSet(key, fetcher, { ttl, namespace });
    } catch (error) {
      console.error('خطأ في getOrSet:', error);
      // في حالة الخطأ، جلب البيانات مباشرة
      return await fetcher();
    }
  }

  /**
   * حذف من الكاش
   */
  async delete(key: string, namespace = 'default'): Promise<boolean> {
    try {
      return await cache.delete(key, namespace);
    } catch (error) {
      console.error('خطأ في حذف من الكاش:', error);
      return false;
    }
  }

  /**
   * مسح جميع الكاش
   */
  async clear(): Promise<boolean> {
    try {
      return await cache.clear();
    } catch (error) {
      console.error('خطأ في مسح الكاش:', error);
      return false;
    }
  }

  /**
   * فحص وجود مفتاح
   */
  async exists(key: string, namespace = 'default'): Promise<boolean> {
    try {
      return await cache.exists(key, namespace);
    } catch (error) {
      console.error('خطأ في فحص وجود المفتاح:', error);
      return false;
    }
  }

  /**
   * إحصائيات الكاش
   */
  getStats() {
    try {
      return cache.getStats();
    } catch (error) {
      console.error('خطأ في جلب إحصائيات الكاش:', error);
      return {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        hitRate: 0,
        memoryUsage: 0,
      };
    }
  }
}

// مثيل موحد
export const simpleCache = new SimpleCaching();

// دوال مساعدة للتوافق مع النظام القديم
export const setCache = <T>(key: string, value: T, ttl = 3600): Promise<boolean> => {
  return simpleCache.set(key, value, { ttl });
};

export const getCache = <T>(key: string): Promise<T | null> => {
  return simpleCache.get<T>(key);
};

export const deleteCache = (key: string): Promise<boolean> => {
  return simpleCache.delete(key);
};

export const clearCache = (): Promise<boolean> => {
  return simpleCache.clear();
};

export default simpleCache;
