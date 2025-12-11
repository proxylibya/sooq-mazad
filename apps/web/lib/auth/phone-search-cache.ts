/**
 * نظام Caching للبحث عن أرقام الهواتف
 * يقلل من عدد استعلامات قاعدة البيانات تحت الضغط
 */

interface CacheEntry {
  userId: string;
  phone: string;
  timestamp: number;
}

class PhoneSearchCache {
  private cache: Map<string, CacheEntry>;
  private TTL: number; // Time To Live in milliseconds

  constructor(ttlSeconds: number = 300) { // 5 دقائق افتراضياً
    this.cache = new Map();
    this.TTL = ttlSeconds * 1000;
    
    // تنظيف تلقائي كل دقيقة
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * الحصول على userId من Cache
   */
  get(phone: string): string | null {
    const normalized = phone.trim().toLowerCase();
    const entry = this.cache.get(normalized);
    
    if (!entry) return null;
    
    // فحص الصلاحية
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(normalized);
      return null;
    }
    
    return entry.userId;
  }

  /**
   * حفظ في Cache
   */
  set(phone: string, userId: string, actualPhone: string): void {
    const normalized = phone.trim().toLowerCase();
    
    this.cache.set(normalized, {
      userId,
      phone: actualPhone,
      timestamp: Date.now()
    });
  }

  /**
   * مسح من Cache (عند تحديث البيانات)
   */
  invalidate(phone: string): void {
    const normalized = phone.trim().toLowerCase();
    this.cache.delete(normalized);
  }

  /**
   * مسح كامل
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * تنظيف المدخلات المنتهية
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => this.cache.delete(key));
    
    if (process.env.NODE_ENV === 'development' && toDelete.length > 0) {
      console.log(`[Phone Cache] تم تنظيف ${toDelete.length} مدخلات منتهية`);
    }
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats() {
    return {
      size: this.cache.size,
      ttl: this.TTL,
      entries: Array.from(this.cache.values()).map(e => ({
        phone: e.phone,
        age: Date.now() - e.timestamp
      }))
    };
  }
}

// Singleton instance
export const phoneSearchCache = new PhoneSearchCache(300); // 5 دقائق

export default phoneSearchCache;
