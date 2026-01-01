/**
 * نظام التوطين لليبيا
 * يدير جميع بيانات التوطين للموقع الليبي
 */

import { SafeLocalStorage } from './safeLocalStorage';
import { convertToWesternNumerals, formatCurrency } from './numberUtils';

// تحكم في سجل الرسائل: معطل بشكل افتراضي للحد من الضجيج
const VERBOSE_LOGS =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true';

// واجهة البلد المحسنة
export interface Country {
  code: string;
  name: string;
  nameEn: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  currencyName: string;
  domain: string;
  language: string;
  direction: 'rtl' | 'ltr';
  phoneCode: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

// واجهة بيانات التوطين
export interface LocalizationData {
  country: Country;
  currency: CurrencyData;
  content: ContentData;
  ui: UIData;
  business: BusinessData;
}

// بيانات العملة
export interface CurrencyData {
  code: string;
  symbol: string;
  name: string;
  rate: number; // معدل التحويل مقابل الدولار
  decimals: number;
  format: 'before' | 'after'; // موضع رمز العملة
}

// بيانات المحتوى
export interface ContentData {
  welcomeMessage: string;
  siteTitle: string;
  siteDescription: string;
  contactInfo: ContactInfo;
  legalInfo: LegalInfo;
  paymentMethods: string[];
  shippingInfo: ShippingInfo;
}

// معلومات الاتصال
export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  supportLanguages: string[];
}

// المعلومات القانونية
export interface LegalInfo {
  termsUrl: string;
  privacyUrl: string;
  refundPolicy: string;
  importRegulations: string[];
  taxInfo: string;
}

// معلومات الشحن
export interface ShippingInfo {
  available: boolean;
  cost: number;
  duration: string;
  restrictions: string[];
}

// بيانات واجهة المستخدم
export interface UIData {
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  direction: 'rtl' | 'ltr';
  language: string;
}

// بيانات الأعمال
export interface BusinessData {
  marketType: 'auction' | 'marketplace' | 'both';
  popularBrands: string[];
  localDealers: string[];
  inspectionCenters: string[];
  financingOptions: string[];
}

// بيانات ليبيا فقط
export const LIBYA_CONFIG: Country = {
  code: 'LY',
  name: 'ليبيا',
  nameEn: 'Libya',
  flag: 'ليبيا',
  currency: 'LYD',
  currencySymbol: 'د.ل',
  currencyName: 'دينار ليبي',
  domain: 'ly',
  language: 'ar',
  direction: 'rtl',
  phoneCode: '+218',
  timezone: 'Africa/Tripoli',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'en-US', // استخدام الأرقام الإنجليزية فقط
};

// مصفوفة البلدان - ليبيا فقط للتوافق مع الكود الموجود
export const countries: Country[] = [LIBYA_CONFIG];

// فئة إدارة التوطين
export class LocalizationManager {
  private static instance: LocalizationManager;
  private currentLocalization: LocalizationData | null = null;
  private listeners: ((data: LocalizationData) => void)[] = [];

  private constructor() {
    // تهيئة غير متزامنة في الخلفية
    this.initializeFromStorage().catch((error) => {
      console.error('خطأ في التهيئة الأولية:', error);
    });
  }

  static getInstance(): LocalizationManager {
    if (!LocalizationManager.instance) {
      LocalizationManager.instance = new LocalizationManager();
    }
    return LocalizationManager.instance;
  }

  // تهيئة النظام - ليبيا فقط
  private async initializeFromStorage(): Promise<void> {
    try {
      // تنظيف البيانات التالفة أولاً (client-side only)
      if (typeof window !== 'undefined') {
        this.cleanupCorruptedData();
      }

      const savedData = SafeLocalStorage.getJSON<LocalizationData | null>('localizationData', null);
      if (savedData && typeof savedData === 'object') {
        this.currentLocalization = savedData;
      } else {
        await this.setLibyaConfig();
      }
    } catch (error) {
      console.error('خطأ في تهيئة البيانات من التخزين المحلي:', error);
      await this.handleInitializationError(error);
    }
  }

  // تعيين إعدادات ليبيا
  private async setLibyaConfig(): Promise<void> {
    try {
      const localizationData = await this.generateLibyaLocalizationData();
      this.currentLocalization = localizationData;

      // حفظ في التخزين المحلي
      SafeLocalStorage.setJSON('localizationData', localizationData);

      // إشعار جميع المستمعين
      this.notifyListeners(localizationData);
    } catch (error) {
      console.error('خطأ في تعيين إعدادات ليبيا:', error);
      throw error;
    }
  }

  // معالجة أخطاء التهيئة
  private async handleInitializationError(error: unknown): Promise<void> {
    console.error('معالجة خطأ التهيئة:', error);

    try {
      // محاولة مسح البيانات التالفة
      SafeLocalStorage.removeItem('localizationData');

      // محاولة تعيين إعدادات ليبيا
      await this.setLibyaConfig();
    } catch (fallbackError) {
      console.error('فشل في إصلاح خطأ التهيئة:', fallbackError);

      // كحل أخير، إنشاء بيانات أساسية
      this.createFallbackLocalization();
    }
  }

  // إنشاء بيانات توطين أساسية كحل أخير
  private createFallbackLocalization(): void {
    try {
      this.currentLocalization = {
        country: LIBYA_CONFIG,
        currency: {
          code: LIBYA_CONFIG.currency,
          symbol: LIBYA_CONFIG.currencySymbol,
          name: LIBYA_CONFIG.currencyName,
          rate: 1,
          decimals: 2,
          format: 'after',
        },
        content: {
          welcomeMessage: `مرحباً بك في موقع مزاد السيارات`,
          siteTitle: 'مزاد السيارات',
          siteDescription: 'أفضل موقع لبيع وشراء السيارات',
          contactInfo: {
            phone: 'غير متاح',
            email: 'info@carauction.com',
            address: 'غير محدد',
            workingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
            supportLanguages: ['العربية'],
          },
          legalInfo: {
            termsUrl: '/terms',
            privacyUrl: '/privacy',
            refundPolicy: 'سياسة الاسترداد',
            importRegulations: [],
            taxInfo: 'معلومات الضرائب',
          },
          paymentMethods: ['نقداً'],
          shippingInfo: {
            available: false,
            cost: 0,
            duration: 'غير متاح',
            restrictions: [],
          },
        },
        ui: {
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          numberFormat: 'en-US', // استخدام الأرقام الغربية/اللاتينية فقط
          direction: 'rtl',
          language: 'ar',
        },
        business: {
          marketType: 'both',
          popularBrands: ['تويوتا', 'نيسان'],
          localDealers: [],
          inspectionCenters: [],
          financingOptions: [],
        },
      };
    } catch (error) {
      console.error('فشل في إنشاء بيانات التوطين الأساسية:', error);
    }
  }

  // تنظيف البيانات التالفة
  private cleanupCorruptedData(): void {
    // التحقق من وجود window (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const suspiciousKeys = ['selectedCountry', 'localizationData'];

      for (const key of suspiciousKeys) {
        try {
          const value = SafeLocalStorage.getItem(key);
          if (value === 'undefined' || value === 'null' || value === '') {
            SafeLocalStorage.removeItem(key);
          }
        } catch (error) {
          console.warn(`خطأ في تنظيف المفتاح ${key}:`, error);
        }
      }

      // Silent cleanup - no console spam
    } catch (error) {
      console.warn('خطأ في تنظيف البيانات التالفة:', error);
    }
  }

  // توليد بيانات التوطين لليبيا
  private async generateLibyaLocalizationData(): Promise<LocalizationData> {
    const currencyData = await this.getLibyaCurrencyData();
    const contentData = this.getLibyaContentData();
    const uiData = this.getLibyaUIData();
    const businessData = this.getLibyaBusinessData();

    return {
      country: LIBYA_CONFIG,
      currency: currencyData,
      content: contentData,
      ui: uiData,
      business: businessData,
    };
  }

  // الحصول على بيانات العملة الليبية
  private async getLibyaCurrencyData(): Promise<CurrencyData> {
    return {
      code: LIBYA_CONFIG.currency,
      symbol: LIBYA_CONFIG.currencySymbol,
      name: LIBYA_CONFIG.currencyName,
      rate: 4.8, // معدل الدينار الليبي مقابل الدولار
      decimals: 2,
      format: 'after', // رمز العملة بعد الرقم في العربية
    };
  }

  // الحصول على بيانات المحتوى الليبي
  private getLibyaContentData(): ContentData {
    return {
      welcomeMessage: 'مرحباً بك في موقع مزاد السيارات - ليبيا',
      siteTitle: 'مزاد السيارات ليبيا',
      siteDescription: 'أفضل موقع لبيع وشراء السيارات في ليبيا',
      contactInfo: {
        phone: '+218-91-234-5678',
        email: 'info@carauction.com',
        address: 'طرابلس، ليبيا',
        workingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
        supportLanguages: ['العربية'],
      },
      legalInfo: {
        termsUrl: '/terms-ly',
        privacyUrl: '/privacy-ly',
        refundPolicy: 'سياسة الاسترداد حسب القوانين الليبية',
        importRegulations: ['يرجى مراجعة قوانين الاستيراد الليبية'],
        taxInfo: 'الضرائب حسب القوانين الليبية',
      },
      paymentMethods: [
        'نقداً',
        'تحويل بنكي',
        'المصرف الإسلامي الليبي',
        'المصرف التضامن',
        'مصرف الأمان',
      ],
      shippingInfo: {
        available: true,
        cost: 50,
        duration: '3-5 أيام عمل',
        restrictions: ['داخل ليبيا فقط'],
      },
    };
  }

  // الحصول على بيانات واجهة المستخدم الليبية
  private getLibyaUIData(): UIData {
    return {
      dateFormat: LIBYA_CONFIG.dateFormat,
      timeFormat: '24h',
      numberFormat: LIBYA_CONFIG.numberFormat,
      direction: LIBYA_CONFIG.direction,
      language: LIBYA_CONFIG.language,
    };
  }

  // الحصول على بيانات الأعمال الليبية
  private getLibyaBusinessData(): BusinessData {
    return {
      marketType: 'both',
      popularBrands: ['تويوتا', 'هيونداي', 'كيا', 'نيسان', 'شيفروليه'],
      localDealers: ['وكالة الفاتح', 'شركة الأندلس', 'مؤسسة الوفاء'],
      inspectionCenters: ['مركز الفحص الفني - طرابلس', 'مركز الفحص الفني - بنغازي'],
      financingOptions: ['تمويل إسلامي', 'تقسيط'],
    };
  }

  // إضافة مستمع للتغييرات
  addListener(callback: (data: LocalizationData) => void): void {
    this.listeners.push(callback);

    // إرسال البيانات الحالية فوراً إذا كانت متاحة
    if (this.currentLocalization) {
      callback(this.currentLocalization);
    }
  }

  // إزالة مستمع
  removeListener(callback: (data: LocalizationData) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  // إشعار جميع المستمعين
  private notifyListeners(data: LocalizationData): void {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('خطأ في إشعار المستمع:', error);
      }
    });
  }

  // الحصول على البيانات الحالية
  getCurrentLocalization(): LocalizationData | null {
    return this.currentLocalization;
  }

  // الحصول على البلد الحالي
  getCurrentCountry(): Country | null {
    return this.currentLocalization?.country || null;
  }

  // تنسيق السعر حسب البلد بالأرقام الغربية/اللاتينية فقط
  formatPrice(amount: number, showCurrency: boolean = true): string {
    if (!this.currentLocalization) {
      // fallback مع ضمان الأرقام الغربية
      const fallbackFormatted = new Intl.NumberFormat('en-US').format(amount);
      return showCurrency ? `${fallbackFormatted} د.ل` : fallbackFormatted;
    }

    const { currency } = this.currentLocalization;

    try {
      // استخدام دالة formatCurrency المخصصة التي تضمن الأرقام الغربية
      if (showCurrency) {
        return formatCurrency(amount, currency.code, 'en-US');
      } else {
        // تنسيق الرقم فقط بدون عملة مع ضمان الأرقام الغربية
        const formatter = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: currency.decimals,
          maximumFractionDigits: currency.decimals,
        });
        const formatted = formatter.format(amount);
        return convertToWesternNumerals(formatted);
      }
    } catch (error) {
      console.error('خطأ في تنسيق السعر:', error);
      // fallback آمن مع الأرقام الغربية
      const fallbackFormatted = new Intl.NumberFormat('en-US').format(amount);
      return showCurrency ? `${fallbackFormatted} ${currency.symbol}` : fallbackFormatted;
    }
  }

  // تحويل السعر - ليبيا فقط (الدينار الليبي)
  convertPrice(amount: number, fromCurrency: string, toCurrency?: string): number {
    if (!this.currentLocalization) return amount;

    const targetCurrency = toCurrency || this.currentLocalization.currency.code;
    if (fromCurrency === targetCurrency) return amount;

    // معدل الدينار الليبي مقابل الدولار
    const lydRate = 4.8;

    if (fromCurrency === 'USD' && targetCurrency === 'LYD') {
      return amount * lydRate;
    } else if (fromCurrency === 'LYD' && targetCurrency === 'USD') {
      return amount / lydRate;
    }

    return amount; // إذا لم تكن العملة مدعومة، إرجاع المبلغ كما هو
  }

  // تنسيق التاريخ بشكل موحد (ميلادي فقط)
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory', // التأكد من استخدام التقويم الميلادي
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      // استخدام en-US مع النص العربي للشهور لضمان الأرقام الإنجليزية
      const formatted = date.toLocaleDateString('en-US', finalOptions);
      return convertToWesternNumerals(formatted);
    } catch (error) {
      console.error('خطأ في تنسيق التاريخ:', error);
      // fallback إلى التنسيق الإنجليزي
      return date.toLocaleDateString('en-US', finalOptions);
    }
  }

  // تنسيق التاريخ والوقت معاً
  formatDateTime(date: Date): string {
    try {
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        calendar: 'gregory',
      });
      return convertToWesternNumerals(formatted);
    } catch (error) {
      console.error('خطأ في تنسيق التاريخ والوقت:', error);
      return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US');
    }
  }

  // إضافة معالج أخطاء عام للتطبيق
  static setupGlobalErrorHandler(): void {
    // معالج أخطاء JavaScript العامة
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message && event.error.message.includes('JSON.parse')) {
        // console.warn('تم اكتشاف خطأ JSON.parse، محاولة الإصلاح...');
        LocalizationManager.handleJSONParseError(event.error);
      }
    });

    // معالج الوعود المرفوضة
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes('JSON.parse')) {
        // console.warn('تم اكتشاف خطأ JSON.parse في Promise، محاولة الإصلاح...');
        LocalizationManager.handleJSONParseError(event.reason);
        event.preventDefault(); // منع ظهور الخطأ في Console
      }
    });
  }

  // معالج خطأ JSON.parse
  static handleJSONParseError(_error: Error): void {
    // التحقق من وجود window (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // console.log('الأدوات معالجة خطأ JSON.parse...');

      // قائمة المفاتيح المشكوك فيها
      const suspiciousKeys = [
        'selectedCountry',
        'localizationData',
        'compareList',
        'userPreferences',
        'cartItems',
        'wishlist',
        'recentSearches',
      ];

      let fixedCount = 0;

      for (const key of suspiciousKeys) {
        try {
          const value = SafeLocalStorage.getItem(key);
          if (value === 'undefined' || value === 'null' || value === '') {
            SafeLocalStorage.removeItem(key);
            fixedCount++;
          }
        } catch (cleanupError) {
          // Silent error handling
        }
      }

      if (fixedCount > 0) {
        if (VERBOSE_LOGS) {
          console.log(`تم بنجاح تم إصلاح ${fixedCount} مفتاح تالف`);
        }

        // إعادة تهيئة نظام التوطين
        const instance = LocalizationManager.getInstance();
        instance.initializeFromStorage().catch((initError) => {
          console.error('خطأ في إعادة التهيئة:', initError);
        });
      }
    } catch (handlerError) {
      console.error('خطأ في معالج JSON.parse:', handlerError);
    }
  }
}

// تصدير المثيل الوحيد
export const localizationManager = LocalizationManager.getInstance();

// تصدير للتوافق مع الكود الموجود
export const LocalizationSystem = LocalizationManager;
