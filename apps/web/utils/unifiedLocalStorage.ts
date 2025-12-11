/**
 * 🔐 نظام localStorage الموحد والآمن
 * 
 * يجمع أفضل المزايا من الأنظمة المتعددة في نظام واحد شامل
 * - معالجة آمنة للأخطاء
 * - تنظيف البيانات التالفة
 * - استيراد/تصدير البيانات
 * - مساعدات متخصصة (المقارنة، بيانات المستخدم)
 * 
 * @version 2.0.0 - موحد
 * @date 2025-11-09
 */

// ==========================================
// النظام الرئيسي - UnifiedLocalStorage
// ==========================================

export class UnifiedLocalStorage {
  /**
   * التحقق من وجود بيئة المتصفح
   */
  private static isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  /**
   * حفظ قيمة في localStorage بشكل آمن
   * @param key مفتاح التخزين
   * @param value القيمة المراد حفظها (أي نوع)
   * @returns true إذا تم الحفظ بنجاح
   */
  static setItem<T>(key: string, value: T): boolean {
    try {
      if (!this.isClient()) {
        return false;
      }

      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[UnifiedLocalStorage] خطأ في حفظ ${key}:`, error);
      }
      return false;
    }
  }

  /**
   * جلب قيمة من localStorage بشكل آمن
   * @param key مفتاح التخزين
   * @param defaultValue القيمة الافتراضية
   * @returns القيمة المحفوظة أو القيمة الافتراضية
   */
  static getItem<T>(key: string, defaultValue: T): T {
    try {
      if (!this.isClient()) {
        return defaultValue;
      }

      const item = localStorage.getItem(key);

      // التحقق من وجود القيمة
      if (item === null || item === undefined) {
        return defaultValue;
      }

      // التحقق من القيم النصية التالفة
      const corruptedValues = ['undefined', 'null', 'NaN', 'Infinity', '-Infinity'];
      if (corruptedValues.includes(item) || item.trim() === '') {
        this.removeItem(key);
        return defaultValue;
      }

      // محاولة تحليل JSON
      try {
        const parsed = JSON.parse(item);

        // التحقق من صحة النتيجة
        if (parsed === undefined) {
          this.removeItem(key);
          return defaultValue;
        }

        return parsed as T;
      } catch (parseError) {
        // إذا فشل التحليل، احذف البيانات التالفة
        this.removeItem(key);
        return defaultValue;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[UnifiedLocalStorage] خطأ في جلب ${key}:`, error);
      }
      return defaultValue;
    }
  }

  /**
   * إزالة قيمة من localStorage
   * @param key مفتاح التخزين
   * @returns true إذا تم الحذف بنجاح
   */
  static removeItem(key: string): boolean {
    try {
      if (!this.isClient()) {
        return false;
      }

      localStorage.removeItem(key);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[UnifiedLocalStorage] خطأ في حذف ${key}:`, error);
      }
      return false;
    }
  }

  /**
   * التحقق من وجود مفتاح في localStorage
   * @param key مفتاح التخزين
   * @returns true إذا كان المفتاح موجود وصالح
   */
  static hasItem(key: string): boolean {
    try {
      if (!this.isClient()) {
        return false;
      }

      const item = localStorage.getItem(key);
      return item !== null && item !== 'undefined' && item !== 'null' && item.trim() !== '';
    } catch (error) {
      return false;
    }
  }

  /**
   * مسح جميع البيانات من localStorage
   * @returns true إذا تم المسح بنجاح
   */
  static clear(): boolean {
    try {
      if (!this.isClient()) {
        return false;
      }

      localStorage.clear();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * الحصول على جميع المفاتيح في localStorage
   * @returns قائمة بجميع المفاتيح
   */
  static getAllKeys(): string[] {
    try {
      if (!this.isClient()) {
        return [];
      }

      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      return [];
    }
  }

  /**
   * الحصول على حجم localStorage بالبايت (تقريبي)
   * @returns حجم البيانات بالبايت
   */
  static getSize(): number {
    try {
      if (!this.isClient()) {
        return 0;
      }

      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage[key];
          total += (key.length + value.length) * 2; // UTF-16 encoding (2 bytes per char)
        }
      }
      return total;
    } catch (error) {
      return 0;
    }
  }

  /**
   * الحصول على حجم localStorage بالكيلوبايت
   * @returns حجم البيانات بالكيلوبايت
   */
  static getSizeKB(): number {
    return Math.round(this.getSize() / 1024);
  }

  /**
   * تنظيف البيانات التالفة من localStorage
   * @returns عدد العناصر التي تم حذفها
   */
  static cleanupCorruptedData(): number {
    if (!this.isClient()) {
      return 0;
    }

    let cleanedCount = 0;
    const suspiciousPatterns = [
      'undefined',
      'null',
      '',
      'NaN',
      'Infinity',
      '-Infinity',
      '[object Object]',
      '[object Array]',
    ];

    try {
      const keys = this.getAllKeys();

      for (const key of keys) {
        try {
          const item = localStorage.getItem(key);

          // فحص القيم التالفة الأساسية
          if (!item || suspiciousPatterns.includes(item.trim())) {
            localStorage.removeItem(key);
            cleanedCount++;
            continue;
          }

          // فحص القيم القصيرة المشكوك فيها
          if (item.includes('undefined') && item.length < 20) {
            localStorage.removeItem(key);
            cleanedCount++;
            continue;
          }

          // محاولة تحليل JSON للتأكد من صحة البيانات
          if (item.startsWith('{') || item.startsWith('[') || item.startsWith('"')) {
            try {
              const parsed = JSON.parse(item);
              if (parsed === undefined || parsed === null) {
                localStorage.removeItem(key);
                cleanedCount++;
              }
            } catch (parseError) {
              localStorage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          localStorage.removeItem(key);
          cleanedCount++;
        }
      }

      if (process.env.NODE_ENV === 'development' && cleanedCount > 0) {
        console.log(`[UnifiedLocalStorage] تم تنظيف ${cleanedCount} عنصر تالف`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[UnifiedLocalStorage] خطأ في التنظيف:', error);
      }
    }

    return cleanedCount;
  }

  /**
   * تنظيف بيانات المستخدم عند تسجيل الخروج
   * يحذف جميع المفاتيح المرتبطة ببيانات المستخدم
   */
  static clearUserData(): void {
    if (!this.isClient()) {
      return;
    }

    const userDataKeys = [
      'user',
      'token',
      'authToken',
      'refreshToken',
      'wallet',
      'favorites',
      'reminders',
      'userSettings',
      'userPreferences',
      'cartItems',
      'wishlist',
      'recentSearches',
      'searchHistory',
      'userSession',
      'authSession',
      'adminUser',
      'adminToken',
    ];

    userDataKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        // Silent failure
      }
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[UnifiedLocalStorage] تم مسح بيانات المستخدم');
    }
  }

  /**
   * تصدير جميع البيانات من localStorage
   * @returns كائن يحتوي على جميع البيانات
   */
  static exportData(): Record<string, any> {
    const data: Record<string, any> = {};

    try {
      if (!this.isClient()) {
        return data;
      }

      const keys = this.getAllKeys();

      for (const key of keys) {
        try {
          const item = localStorage.getItem(key);
          if (item && item !== 'undefined' && item !== 'null') {
            try {
              data[key] = JSON.parse(item);
            } catch {
              // إذا فشل التحليل، احفظ النص كما هو
              data[key] = item;
            }
          }
        } catch (error) {
          // Skip corrupted items
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[UnifiedLocalStorage] خطأ في التصدير:', error);
      }
    }

    return data;
  }

  /**
   * استيراد البيانات إلى localStorage
   * @param data كائن يحتوي على البيانات المراد استيرادها
   * @returns true إذا تم الاستيراد بنجاح
   */
  static importData(data: Record<string, any>): boolean {
    try {
      if (!this.isClient() || !data) {
        return false;
      }

      for (const [key, value] of Object.entries(data)) {
        this.setItem(key, value);
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[UnifiedLocalStorage] خطأ في الاستيراد:', error);
      }
      return false;
    }
  }

  /**
   * الحصول على إحصائيات localStorage
   * @returns كائن يحتوي على الإحصائيات
   */
  static getStats() {
    return {
      totalKeys: this.getAllKeys().length,
      sizeBytes: this.getSize(),
      sizeKB: this.getSizeKB(),
      maxSizeKB: 5120, // معظم المتصفحات: 5MB
      usagePercent: Math.round((this.getSizeKB() / 5120) * 100),
    };
  }
}

// ==========================================
// مساعدات متخصصة - Compare List
// ==========================================

/**
 * نظام إدارة قائمة المقارنة
 */
export class CompareListStorage {
  private static readonly COMPARE_LIST_KEY = 'compareList';
  private static readonly MAX_ITEMS = 3;

  /**
   * الحصول على قائمة المقارنة
   */
  static getCompareList(): any[] {
    const list = UnifiedLocalStorage.getItem(this.COMPARE_LIST_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  /**
   * حفظ قائمة المقارنة
   */
  static setCompareList(list: any[]): boolean {
    if (!Array.isArray(list)) {
      return false;
    }
    return UnifiedLocalStorage.setItem(this.COMPARE_LIST_KEY, list);
  }

  /**
   * إضافة عنصر لقائمة المقارنة
   */
  static addToCompare(item: any): boolean {
    const currentList = this.getCompareList();

    // التحقق من الحد الأقصى
    if (currentList.length >= this.MAX_ITEMS) {
      return false;
    }

    // التحقق من عدم وجود العنصر مسبقاً
    if (currentList.some((c) => c.id === item.id)) {
      return false;
    }

    currentList.push(item);
    return this.setCompareList(currentList);
  }

  /**
   * إزالة عنصر من قائمة المقارنة
   */
  static removeFromCompare(itemId: number | string): boolean {
    const currentList = this.getCompareList();
    const newList = currentList.filter((item) => item.id !== itemId);
    return this.setCompareList(newList);
  }

  /**
   * مسح قائمة المقارنة بالكامل
   */
  static clearCompareList(): boolean {
    return this.setCompareList([]);
  }

  /**
   * التحقق من وجود عنصر في القائمة
   */
  static isInCompareList(itemId: number | string): boolean {
    const currentList = this.getCompareList();
    return currentList.some((item) => item.id === itemId);
  }

  /**
   * الحصول على عدد العناصر في القائمة
   */
  static getCompareCount(): number {
    return this.getCompareList().length;
  }

  /**
   * التحقق من إمكانية إضافة المزيد
   */
  static canAddMore(): boolean {
    return this.getCompareList().length < this.MAX_ITEMS;
  }
}

// ==========================================
// Exports - للتوافقية مع الكود القديم
// ==========================================

/**
 * @deprecated استخدم UnifiedLocalStorage بدلاً منها
 */
export const SafeLocalStorage = UnifiedLocalStorage;

/**
 * دالة مساعدة سريعة
 */
export const storage = {
  get: <T>(key: string, defaultValue: T) => UnifiedLocalStorage.getItem(key, defaultValue),
  set: (key: string, value: any) => UnifiedLocalStorage.setItem(key, value),
  remove: (key: string) => UnifiedLocalStorage.removeItem(key),
  has: (key: string) => UnifiedLocalStorage.hasItem(key),
  clear: () => UnifiedLocalStorage.clear(),
  cleanup: () => UnifiedLocalStorage.cleanupCorruptedData(),
  clearUserData: () => UnifiedLocalStorage.clearUserData(),
  getAllKeys: () => UnifiedLocalStorage.getAllKeys(),
  getStats: () => UnifiedLocalStorage.getStats(),
  exportData: () => UnifiedLocalStorage.exportData(),
  importData: (data: Record<string, any>) => UnifiedLocalStorage.importData(data),
};

// ==========================================
// Export Default
// ==========================================

export default UnifiedLocalStorage;
