/**
 * نظام KeyDB الموحد - بديل Redis
 * جميع عمليات التخزين المؤقت تمر عبر هذا الملف
 */

import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number; // بالثواني
  prefix?: string;
}

class KeyDBUnifiedClient {
  private client: Redis;
  private defaultTTL = 3600; // ساعة واحدة
  private prefix = 'sooq:';

  constructor() {
    this.client = new Redis({
      host: process.env.KEYDB_HOST || 'localhost',
      port: parseInt(process.env.KEYDB_PORT || '6379'),
      password: process.env.KEYDB_PASSWORD,
      db: parseInt(process.env.KEYDB_DB || '0'),
      keyPrefix: this.prefix,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.client.on('error', (err) => {
      console.error('❌ KeyDB Connection Error:', err.message);
    });

    this.client.on('connect', () => {
      console.log('✅ KeyDB Connected Successfully');
    });
  }

  /**
   * الاتصال بـ KeyDB
   */
  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to KeyDB:', error);
      throw error;
    }
  }

  /**
   * الحصول على قيمة من التخزين المؤقت
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * تخزين قيمة في التخزين المؤقت
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<boolean> {
    try {
      const ttl = options?.ttl || this.defaultTTL;
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttl > 0) {
        await this.client.setex(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      
      return true;
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  /**
   * حذف مفتاح من التخزين المؤقت
   */
  async del(key: string | string[]): Promise<number> {
    try {
      const keys = Array.isArray(key) ? key : [key];
      return await this.client.del(...keys);
    } catch (error) {
      console.error(`Error deleting key(s):`, error);
      return 0;
    }
  }

  /**
   * البحث عن مفاتيح بنمط معين
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      // إزالة البادئة من النتائج
      const keys = await this.client.keys(this.prefix + pattern);
      return keys.map(k => k.replace(this.prefix, ''));
    } catch (error) {
      console.error(`Error finding keys with pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * مسح جميع المفاتيح في قاعدة البيانات الحالية
   */
  async flush(): Promise<void> {
    try {
      await this.client.flushdb();
      console.log('✅ KeyDB cache flushed');
    } catch (error) {
      console.error('Error flushing cache:', error);
      throw error;
    }
  }

  /**
   * التحقق من وجود مفتاح
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  /**
   * تعيين وقت انتهاء صلاحية لمفتاح
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error(`Error setting expiry for key ${key}:`, error);
      return false;
    }
  }

  /**
   * الحصول على الوقت المتبقي لانتهاء صلاحية مفتاح
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Error getting TTL for key ${key}:`, error);
      return -2; // Key does not exist
    }
  }

  /**
   * زيادة قيمة رقمية
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`Error incrementing key ${key}:`, error);
      return 0;
    }
  }

  /**
   * إنقاص قيمة رقمية
   */
  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      console.error(`Error decrementing key ${key}:`, error);
      return 0;
    }
  }

  /**
   * إضافة عنصر إلى قائمة
   */
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.lpush(key, ...values);
    } catch (error) {
      console.error(`Error pushing to list ${key}:`, error);
      return 0;
    }
  }

  /**
   * الحصول على عناصر من قائمة
   */
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      console.error(`Error getting list range for ${key}:`, error);
      return [];
    }
  }

  /**
   * إضافة عنصر إلى مجموعة
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sadd(key, ...members);
    } catch (error) {
      console.error(`Error adding to set ${key}:`, error);
      return 0;
    }
  }

  /**
   * الحصول على أعضاء المجموعة
   */
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      console.error(`Error getting set members for ${key}:`, error);
      return [];
    }
  }

  /**
   * تخزين hash
   */
  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hset(key, field, value);
    } catch (error) {
      console.error(`Error setting hash field for ${key}:`, error);
      return 0;
    }
  }

  /**
   * الحصول على قيمة من hash
   */
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      console.error(`Error getting hash field for ${key}:`, error);
      return null;
    }
  }

  /**
   * الحصول على جميع قيم hash
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      console.error(`Error getting all hash fields for ${key}:`, error);
      return {};
    }
  }

  /**
   * إغلاق الاتصال
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      console.log('✅ KeyDB connection closed');
    } catch (error) {
      console.error('Error closing KeyDB connection:', error);
    }
  }

  /**
   * الحصول على العميل الأصلي لعمليات متقدمة
   */
  getClient(): Redis {
    return this.client;
  }
}

// إنشاء مثيل واحد للاستخدام في جميع أنحاء التطبيق
export const keydb = new KeyDBUnifiedClient();

// وظائف مساعدة للاستخدام السريع
export const cache = {
  get: (key: string) => keydb.get(key),
  set: (key: string, value: any, ttl?: number) => keydb.set(key, value, { ttl }),
  del: (key: string | string[]) => keydb.del(key),
  exists: (key: string) => keydb.exists(key),
  flush: () => keydb.flush(),
  keys: (pattern: string) => keydb.keys(pattern)
};

export default keydb;
