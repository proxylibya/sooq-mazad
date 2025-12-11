/**
 * مدير URLs الآمن للـ blob objects
 */

import React from 'react';

interface BlobUrlEntry {
  url: string;
  blob: Blob;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  maxAge: number;
}

class BlobUrlManager {
  private urls: Map<string, BlobUrlEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private maxUrls: number = 100;
  private defaultMaxAge: number = 30 * 60 * 1000; // 30 دقيقة

  constructor() {
    // بدء تنظيف دوري كل 5 دقائق
    this.startCleanupInterval();

    // تنظيف عند إغلاق الصفحة
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });
    }
  }

  /**
   * إنشاء blob URL آمن
   */
  createBlobUrl(blob: Blob, maxAge?: number): string {
    try {
      const url = URL.createObjectURL(blob);
      const entry: BlobUrlEntry = {
        url,
        blob,
        createdAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 0,
        maxAge: maxAge || this.defaultMaxAge,
      };

      this.urls.set(url, entry);

      // تنظيف URLs القديمة إذا تجاوزنا الحد الأقصى
      if (this.urls.size > this.maxUrls) {
        this.cleanupOldUrls();
      }

      console.log(`🔗 تم إنشاء blob URL: ${url.substring(0, 50)}...`);
      return url;
    } catch (error) {
      console.error('خطأ في إنشاء blob URL:', error);
      throw new Error('فشل في إنشاء blob URL');
    }
  }

  /**
   * الوصول إلى blob URL مع تسجيل الاستخدام
   */
  accessBlobUrl(url: string): boolean {
    const entry = this.urls.get(url);
    if (!entry) {
      console.warn(`⚠️ محاولة الوصول إلى blob URL غير موجود: ${url}`);
      return false;
    }

    // التحقق من انتهاء الصلاحية
    const now = new Date();
    const age = now.getTime() - entry.createdAt.getTime();

    if (age > entry.maxAge) {
      console.warn(`⏰ blob URL منتهي الصلاحية: ${url}`);
      this.revokeBlobUrl(url);
      return false;
    }

    // تحديث معلومات الوصول
    entry.lastAccessed = now;
    entry.accessCount++;

    return true;
  }

  /**
   * إلغاء blob URL
   */
  revokeBlobUrl(url: string): void {
    try {
      const entry = this.urls.get(url);
      if (entry) {
        URL.revokeObjectURL(url);
        this.urls.delete(url);
        console.log(`🗑️ تم إلغاء blob URL: ${url.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error('خطأ في إلغاء blob URL:', error);
    }
  }

  /**
   * إلغاء جميع blob URLs
   */
  revokeAllBlobUrls(): void {
    for (const url of this.urls.keys()) {
      this.revokeBlobUrl(url);
    }
    console.log('🧹 تم إلغاء جميع blob URLs');
  }

  /**
   * تنظيف URLs القديمة
   */
  private cleanupOldUrls(): void {
    const now = new Date();
    const urlsToRevoke: string[] = [];

    for (const [url, entry] of this.urls.entries()) {
      const age = now.getTime() - entry.createdAt.getTime();
      const timeSinceLastAccess = now.getTime() - entry.lastAccessed.getTime();

      // إلغاء URLs منتهية الصلاحية أو غير مستخدمة لفترة طويلة
      if (age > entry.maxAge || timeSinceLastAccess > 10 * 60 * 1000) {
        // 10 دقائق بدون استخدام
        urlsToRevoke.push(url);
      }
    }

    // إلغاء URLs القديمة
    urlsToRevoke.forEach((url) => this.revokeBlobUrl(url));

    // إذا كان لا يزال لدينا الكثير من URLs، إلغاء الأقل استخداماً
    if (this.urls.size > this.maxUrls) {
      const entries = Array.from(this.urls.entries());
      entries.sort((a, b) => a[1].accessCount - b[1].accessCount);

      const toRemove = entries.slice(0, Math.floor(this.maxUrls * 0.2)); // إزالة 20%
      toRemove.forEach(([url]) => this.revokeBlobUrl(url));
    }
  }

  /**
   * بدء تنظيف دوري
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(
      () => {
        this.cleanupOldUrls();
      },
      5 * 60 * 1000,
    ); // كل 5 دقائق
  }

  /**
   * إيقاف التنظيف الدوري
   */
  stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * تنظيف شامل
   */
  cleanup(): void {
    this.revokeAllBlobUrls();
    this.stopCleanupInterval();
  }

  /**
   * الحصول على إحصائيات
   */
  getStats(): {
    totalUrls: number;
    totalAccesses: number;
    oldestUrl: Date | null;
    newestUrl: Date | null;
  } {
    const entries = Array.from(this.urls.values());

    return {
      totalUrls: entries.length,
      totalAccesses: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      oldestUrl:
        entries.length > 0
          ? new Date(Math.min(...entries.map((e) => e.createdAt.getTime())))
          : null,
      newestUrl:
        entries.length > 0
          ? new Date(Math.max(...entries.map((e) => e.createdAt.getTime())))
          : null,
    };
  }

  /**
   * طباعة إحصائيات
   */
  printStats(): void {
    const stats = this.getStats();
    console.group('📊 إحصائيات blob URLs');
    console.log(`🔗 إجمالي URLs: ${stats.totalUrls}`);
    console.log(`👆 إجمالي الوصولات: ${stats.totalAccesses}`);
    if (stats.oldestUrl) {
      console.log(`⏰ أقدم URL: ${stats.oldestUrl.toLocaleString('ar-SA')}`);
    }
    if (stats.newestUrl) {
      console.log(`🆕 أحدث URL: ${stats.newestUrl.toLocaleString('ar-SA')}`);
    }
    console.groupEnd();
  }

  /**
   * تعيين الحد الأقصى للـ URLs
   */
  setMaxUrls(max: number): void {
    this.maxUrls = max;
    if (this.urls.size > max) {
      this.cleanupOldUrls();
    }
  }

  /**
   * تعيين العمر الافتراضي للـ URLs
   */
  setDefaultMaxAge(maxAge: number): void {
    this.defaultMaxAge = maxAge;
  }
}

// إنشاء مثيل واحد للمدير
export const blobUrlManager = new BlobUrlManager();

/**
 * دالة مساعدة لإنشاء blob URL آمن
 */
export function createSafeBlobUrl(blob: Blob, maxAge?: number): string {
  return blobUrlManager.createBlobUrl(blob, maxAge);
}

/**
 * دالة مساعدة لإلغاء blob URL
 */
export function revokeSafeBlobUrl(url: string): void {
  blobUrlManager.revokeBlobUrl(url);
}

/**
 * Hook React لإدارة blob URLs
 */
export function useBlobUrl(blob: Blob | null, maxAge?: number): string | null {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (blob) {
      const blobUrl = createSafeBlobUrl(blob, maxAge);
      setUrl(blobUrl);

      return () => {
        revokeSafeBlobUrl(blobUrl);
      };
    } else {
      setUrl(null);
    }
  }, [blob, maxAge]);

  return url;
}

// تصدير المدير للاستخدام المباشر
export default blobUrlManager;
