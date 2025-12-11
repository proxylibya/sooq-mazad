/**
 * Middleware عالمي لضمان عرض الأرقام الغربية (0-9) فقط في جميع أنحاء التطبيق
 * يتعامل مع جميع أنواع عرض الأرقام ويحولها تلقائياً إلى التنسيق الغربي
 */

import { convertToWesternNumeralsOnly } from './westernNumeralsOnly';

/**
 * فئة إدارة التحويل العالمي للأرقام
 */
export class WesternNumeralsMiddleware {
  private static instance: WesternNumeralsMiddleware;
  private initialized = false;
  private observers: MutationObserver[] = [];

  private constructor() {
    // منع الإنشاء المباشر
  }

  /**
   * الحصول على المثيل الوحيد
   */
  static getInstance(): WesternNumeralsMiddleware {
    if (!WesternNumeralsMiddleware.instance) {
      WesternNumeralsMiddleware.instance = new WesternNumeralsMiddleware();
    }
    return WesternNumeralsMiddleware.instance;
  }

  /**
   * تهيئة النظام العالمي
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    if (typeof window === 'undefined') {
      return; // عدم التشغيل في البيئة الخادمة
    }

    try {
      this.setupGlobalOverrides();
      this.setupFormValidation();
      // تم تعطيل مراقبة DOM والفحص الدوري والتكامل مع React لتقليل الحمل وتحسين الأداء
      // this.setupDOMObserver();
      // this.setupReactIntegration();
      // this.setupInitialConversion();

      // Keep references to unused optional helpers to avoid TS/ESLint warnings without invoking them
      void [this.setupDOMObserver, this.setupReactIntegration, this.setupInitialConversion];

      this.initialized = true;
      // تم حذف سجلات الكونسول لتجنب الضوضاء والأثر على الأداء
    } catch (error) {
      // صامت: تجنب رمي أخطاء تؤثر على تجربة المستخدم
    }
  }

  /**
   * إعداد تعديلات عالمية لـ JavaScript
   */
  private setupGlobalOverrides(): void {
    // تعديل Number.prototype.toLocaleString
    const originalToLocaleString = Number.prototype.toLocaleString;
    Number.prototype.toLocaleString = function (
      _locales?: string | string[],
      options?: Intl.NumberFormatOptions,
    ) {
      // إجبار استخدام en-US دائماً
      const result = originalToLocaleString.call(this, 'en-US', options);
      return convertToWesternNumeralsOnly(result);
    };

    // تعديل Date.prototype.toLocaleDateString
    const originalToLocaleDateString = Date.prototype.toLocaleDateString;
    Date.prototype.toLocaleDateString = function (
      _locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      const result = originalToLocaleDateString.call(this, 'en-US', options);
      return convertToWesternNumeralsOnly(result);
    };

    // تعديل Date.prototype.toLocaleTimeString
    const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
    Date.prototype.toLocaleTimeString = function (
      _locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      const result = originalToLocaleTimeString.call(this, 'en-US', options);
      return convertToWesternNumeralsOnly(result);
    };

    // تعديل Date.prototype.toLocaleString
    const originalToLocaleStringDate = Date.prototype.toLocaleString;
    Date.prototype.toLocaleString = function (
      _locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      const result = originalToLocaleStringDate.call(this, 'en-US', options);
      return convertToWesternNumeralsOnly(result);
    };

    // تعديل Intl.NumberFormat
    const OriginalNumberFormat = Intl.NumberFormat;
    (Intl as any).NumberFormat = function (
      _locales?: string | string[],
      options?: Intl.NumberFormatOptions,
    ) {
      // إجبار استخدام en-US دائماً
      const formatter = new OriginalNumberFormat('en-US', options);
      const originalFormat = formatter.format.bind(formatter);

      // إنشاء wrapper object بدلاً من تعديل الخاصية المحمية
      const wrappedFormatter = Object.create(formatter);

      // إعادة تعريف format كدالة
      Object.defineProperty(wrappedFormatter, 'format', {
        value: function (value: number) {
          const result = originalFormat(value);
          return convertToWesternNumeralsOnly(result);
        },
        writable: false,
        enumerable: true,
        configurable: false,
      });

      // نسخ باقي الخصائص والوظائف
      Object.getOwnPropertyNames(formatter).forEach((prop) => {
        if (prop !== 'format' && !wrappedFormatter.hasOwnProperty(prop)) {
          const descriptor = Object.getOwnPropertyDescriptor(formatter, prop);
          if (descriptor) {
            Object.defineProperty(wrappedFormatter, prop, descriptor);
          }
        }
      });

      return wrappedFormatter;
    };

    // الحفاظ على الخصائص الأصلية
    (Intl as any).NumberFormat.prototype = OriginalNumberFormat.prototype;
    (Intl as any).NumberFormat.supportedLocalesOf = OriginalNumberFormat.supportedLocalesOf;
  }

  /**
   * إعداد مراقب DOM لتحويل المحتوى الجديد
   */
  private setupDOMObserver(): void {
    if (!window.MutationObserver) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.convertElementContent(node as Element);
            } else if (node.nodeType === Node.TEXT_NODE && node.textContent) {
              const converted = convertToWesternNumeralsOnly(node.textContent);
              if (converted !== node.textContent) {
                node.textContent = converted;
              }
            }
          });
        } else if (mutation.type === 'characterData' && mutation.target.textContent) {
          const converted = convertToWesternNumeralsOnly(mutation.target.textContent);
          if (converted !== mutation.target.textContent) {
            mutation.target.textContent = converted;
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    this.observers.push(observer);
  }

  /**
   * تحويل محتوى عنصر معين
   */
  private convertElementContent(element: Element): void {
    // تحويل النصوص المباشرة
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

    const textNodes: Text[] = [];
    let node;

    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    textNodes.forEach((textNode) => {
      if (textNode.textContent) {
        const converted = convertToWesternNumeralsOnly(textNode.textContent);
        if (converted !== textNode.textContent) {
          textNode.textContent = converted;
        }
      }
    });

    // تحويل قيم الخصائص المهمة
    const attributesToCheck = [
      'value',
      'placeholder',
      'title',
      'alt',
      'data-value',
      'data-price',
      'data-amount',
    ];

    attributesToCheck.forEach((attr) => {
      if (element.hasAttribute(attr)) {
        const value = element.getAttribute(attr);
        if (value) {
          const converted = convertToWesternNumeralsOnly(value);
          if (converted !== value) {
            element.setAttribute(attr, converted);
          }
        }
      }
    });

    // تحويل محتوى عناصر الإدخال
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      if (element.value) {
        const converted = convertToWesternNumeralsOnly(element.value);
        if (converted !== element.value) {
          element.value = converted;
        }
      }
    }
  }

  /**
   * إعداد تكامل مع React
   */
  private setupReactIntegration(): void {
    // رصد تغييرات React
    if (typeof window !== 'undefined' && (window as any).React) {
      // تم تعطيل التكامل لتقليل استهلاك الموارد
      // مراقبة تحديثات React
      const checkReactUpdates = () => {
        requestAnimationFrame(() => {
          this.convertDocumentContent();
          setTimeout(checkReactUpdates, 100); // فحص كل 100ms
        });
      };

      checkReactUpdates();
    }
  }

  /**
   * إعداد التحقق من النماذج
   */
  private setupFormValidation(): void {
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLElement;

      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        // تحويل القيمة المدخلة فورياً
        const converted = convertToWesternNumeralsOnly(target.value);
        if (converted !== target.value) {
          target.value = converted;

          // إرسال حدث input جديد للتأكد من تحديث React
          target.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });

    // معالجة أحداث لصق النص
    document.addEventListener('paste', (event) => {
      const target = event.target as HTMLElement;

      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        setTimeout(() => {
          const converted = convertToWesternNumeralsOnly(target.value);
          if (converted !== target.value) {
            target.value = converted;
            target.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, 10);
      }
    });
  }

  /**
   * تحويل أولي لجميع محتويات الصفحة
   */
  private setupInitialConversion(): void {
    // انتظار تحميل الصفحة كاملاً
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.convertDocumentContent();
      });
    } else {
      this.convertDocumentContent();
    }

    // تحويل إضافي بعد تحميل النوافذ
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.convertDocumentContent();
      }, 500);
    });
  }

  /**
   * تحويل جميع محتويات الوثيقة
   */
  private convertDocumentContent(): void {
    try {
      // تحويل النصوص
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);

      const textNodes: Text[] = [];
      let node;

      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      textNodes.forEach((textNode) => {
        if (textNode.textContent && this.containsNonWesternNumerals(textNode.textContent)) {
          textNode.textContent = convertToWesternNumeralsOnly(textNode.textContent);
        }
      });

      // تحويل قيم الإدخالات
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
          if (input.value && this.containsNonWesternNumerals(input.value)) {
            input.value = convertToWesternNumeralsOnly(input.value);
          }
        }
      });

      // تحويل خصائص العناصر المهمة
      const elementsWithData = document.querySelectorAll(
        '[data-value], [data-price], [data-amount], [title], [alt]',
      );
      elementsWithData.forEach((element) => {
        ['data-value', 'data-price', 'data-amount', 'title', 'alt'].forEach((attr) => {
          const value = element.getAttribute(attr);
          if (value && this.containsNonWesternNumerals(value)) {
            element.setAttribute(attr, convertToWesternNumeralsOnly(value));
          }
        });
      });
    } catch (error) {
      console.warn('تحذير في تحويل محتوى الوثيقة:', error);
    }
  }

  /**
   * فحص وجود أرقام غير غربية
   */
  private containsNonWesternNumerals(text: string): boolean {
    return /[٠-٩०-९۰-۹]/.test(text);
  }

  /**
   * إيقاف النظام
   */
  destroy(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers = [];
    this.initialized = false;
    // تم تعطيل سجل الإيقاف لتقليل الضوضاء في الكونسول
  }

  /**
   * تحويل نص معين يدوياً
   */
  convertText(text: string): string {
    return convertToWesternNumeralsOnly(text);
  }

  /**
   * فحص حالة النظام
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * تهيئة النظام العالمي
 */
export function initializeWesternNumeralsMiddleware(): void {
  if (typeof window !== 'undefined') {
    const middleware = WesternNumeralsMiddleware.getInstance();
    middleware.initialize();

    // إضافة للنطاق العالمي للتشخيص
    (window as any).westernNumeralsMiddleware = middleware;
  }
}

/**
 * دالة مساعدة للتحويل السريع
 */
export function ensureWesternNumerals(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return '';
  return convertToWesternNumeralsOnly(String(text));
}

// تصدير المثيل الوحيد
export const westernNumeralsMiddleware = WesternNumeralsMiddleware.getInstance();

// تصدير افتراضي
export default WesternNumeralsMiddleware;
