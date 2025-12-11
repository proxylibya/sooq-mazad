/**
 * نظام إعادة المحاولة الذكي مع Exponential Backoff
 * Smart Retry System with Exponential Backoff
 */

import { ErrorType, ErrorSeverity } from './advanced-error-handler';

// إعدادات إعادة المحاولة
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // بالميلي ثانية
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean; // إضافة عشوائية للتأخير
  retryableErrors: ErrorType[];
  onRetry?: (attempt: number, error: any) => void;
  onSuccess?: (attempt: number) => void;
  onFailure?: (finalError: any, totalAttempts: number) => void;
}

// الإعدادات الافتراضية
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // ثانية واحدة
  maxDelay: 30000, // 30 ثانية
  backoffMultiplier: 2,
  jitter: true,
  retryableErrors: [
    ErrorType.NETWORK,
    ErrorType.TIMEOUT,
    ErrorType.EXTERNAL_SERVICE,
    ErrorType.DATABASE,
  ],
};

// إعدادات مخصصة للعمليات المختلفة
export const RETRY_CONFIGS = {
  // عمليات قاعدة البيانات
  DATABASE: {
    ...DEFAULT_RETRY_CONFIG,
    maxAttempts: 5,
    baseDelay: 500,
    retryableErrors: [ErrorType.DATABASE, ErrorType.TIMEOUT],
  },

  // العمليات الحرجة (إنشاء المزادات والمعاملات)
  CRITICAL: {
    ...DEFAULT_RETRY_CONFIG,
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 60000,
    retryableErrors: [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.DATABASE,
      ErrorType.EXTERNAL_SERVICE,
    ],
  },

  // العمليات السريعة
  FAST: {
    ...DEFAULT_RETRY_CONFIG,
    maxAttempts: 2,
    baseDelay: 200,
    maxDelay: 5000,
  },

  // الخدمات الخارجية
  EXTERNAL: {
    ...DEFAULT_RETRY_CONFIG,
    maxAttempts: 4,
    baseDelay: 1500,
    maxDelay: 45000,
    retryableErrors: [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.EXTERNAL_SERVICE],
  },
};

// فئة نظام إعادة المحاولة
export class RetrySystem {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  // تحديد ما إذا كان الخطأ قابل لإعادة المحاولة
  private isRetryableError(error: any): boolean {
    // فحص نوع الخطأ
    if (error.type && this.config.retryableErrors.includes(error.type)) {
      return true;
    }

    // فحص أكواد الخطأ المحددة
    const retryableCodes = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET',
      'EPIPE',
      'P2024', // Prisma timeout
      'P2034', // Prisma transaction conflict
    ];

    if (error.code && retryableCodes.includes(error.code)) {
      return true;
    }

    // فحص أكواد HTTP
    const retryableHttpCodes = [408, 429, 500, 502, 503, 504];
    if (error.statusCode && retryableHttpCodes.includes(error.statusCode)) {
      return true;
    }

    // فحص رسائل الخطأ
    const retryableMessages = ['timeout', 'connection', 'network', 'temporary', 'unavailable'];

    const errorMessage = (error.message || '').toLowerCase();
    return retryableMessages.some((msg) => errorMessage.includes(msg));
  }

  // حساب التأخير للمحاولة التالية
  private calculateDelay(attempt: number): number {
    let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);

    // تطبيق الحد الأقصى للتأخير
    delay = Math.min(delay, this.config.maxDelay);

    // إضافة عشوائية (jitter) لتجنب thundering herd
    if (this.config.jitter) {
      const jitterAmount = delay * 0.1; // 10% jitter
      delay += (Math.random() - 0.5) * 2 * jitterAmount;
    }

    return Math.max(delay, 0);
  }

  // انتظار لفترة محددة
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // تنفيذ العملية مع إعادة المحاولة
  async execute<T>(
    operation: () => Promise<T>,
    operationName: string = 'Unknown Operation',
  ): Promise<T> {
    let lastError: any;
    let attempt = 0;

    console.log(`التحديث بدء تنفيذ العملية: ${operationName}`);

    while (attempt < this.config.maxAttempts) {
      attempt++;

      try {
        console.log(
          `البرق المحاولة ${attempt}/${this.config.maxAttempts} للعملية: ${operationName}`,
        );

        const result = await operation();

        if (attempt > 1) {
          console.log(`تم بنجاح نجحت العملية في المحاولة ${attempt}: ${operationName}`);
          this.config.onSuccess?.(attempt);
        }

        return result;
      } catch (error) {
        lastError = error;

        console.warn(
          `فشل فشلت المحاولة ${attempt}/${this.config.maxAttempts} للعملية: ${operationName}`,
        );
        console.warn(`التقرير سبب الفشل:`, error.message || error);

        // التحقق من إمكانية إعادة المحاولة
        if (!this.isRetryableError(error)) {
          console.error(`ممنوع الخطأ غير قابل لإعادة المحاولة: ${operationName}`);
          throw error;
        }

        // التحقق من وصول الحد الأقصى للمحاولات
        if (attempt >= this.config.maxAttempts) {
          console.error(`ممنوع تم الوصول للحد الأقصى من المحاولات: ${operationName}`);
          break;
        }

        // حساب التأخير والانتظار
        const delay = this.calculateDelay(attempt);
        console.log(`⏳ انتظار ${delay}ms قبل المحاولة التالية...`);

        this.config.onRetry?.(attempt, error);
        await this.sleep(delay);
      }
    }

    // فشل نهائي
    console.error(`💥 فشل نهائي في العملية بعد ${attempt} محاولات: ${operationName}`);
    this.config.onFailure?.(lastError, attempt);
    throw lastError;
  }

  // تنفيذ عملية قاعدة البيانات مع إعادة المحاولة
  async executeDatabase<T>(
    operation: () => Promise<T>,
    operationName: string = 'Database Operation',
  ): Promise<T> {
    const dbRetrySystem = new RetrySystem(RETRY_CONFIGS.DATABASE);
    return dbRetrySystem.execute(operation, operationName);
  }

  // تنفيذ عملية حرجة مع إعادة المحاولة
  async executeCritical<T>(
    operation: () => Promise<T>,
    operationName: string = 'Critical Operation',
  ): Promise<T> {
    const criticalRetrySystem = new RetrySystem(RETRY_CONFIGS.CRITICAL);
    return criticalRetrySystem.execute(operation, operationName);
  }

  // تنفيذ عملية خدمة خارجية مع إعادة المحاولة
  async executeExternal<T>(
    operation: () => Promise<T>,
    operationName: string = 'External Service Operation',
  ): Promise<T> {
    const externalRetrySystem = new RetrySystem(RETRY_CONFIGS.EXTERNAL);
    return externalRetrySystem.execute(operation, operationName);
  }
}

// دوال مساعدة للاستخدام السريع
export const withRetry = async <T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>,
  operationName?: string,
): Promise<T> => {
  const retrySystem = new RetrySystem(config);
  return retrySystem.execute(operation, operationName);
};

export const withDatabaseRetry = async <T>(
  operation: () => Promise<T>,
  operationName?: string,
): Promise<T> => {
  const retrySystem = new RetrySystem(RETRY_CONFIGS.DATABASE);
  return retrySystem.execute(operation, operationName);
};

export const withCriticalRetry = async <T>(
  operation: () => Promise<T>,
  operationName?: string,
): Promise<T> => {
  const retrySystem = new RetrySystem(RETRY_CONFIGS.CRITICAL);
  return retrySystem.execute(operation, operationName);
};

export const withExternalRetry = async <T>(
  operation: () => Promise<T>,
  operationName?: string,
): Promise<T> => {
  const retrySystem = new RetrySystem(RETRY_CONFIGS.EXTERNAL);
  return retrySystem.execute(operation, operationName);
};

// Decorator للدوال
export function Retryable(config?: Partial<RetryConfig>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const retrySystem = new RetrySystem(config);
      return retrySystem.execute(
        () => method.apply(this, args),
        `${target.constructor.name}.${propertyName}`,
      );
    };
  };
}

// مثال على الاستخدام:
/*
class DatabaseService {
  @Retryable(RETRY_CONFIGS.DATABASE)
  async createUser(userData: any) {
    // عملية إنشاء المستخدم
  }
  
  @Retryable(RETRY_CONFIGS.CRITICAL)
  async createAuction(auctionData: any) {
    // عملية إنشاء المزاد
  }
}
*/

export default RetrySystem;
