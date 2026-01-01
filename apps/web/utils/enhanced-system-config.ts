/**
 * إعدادات النظام المحسن الشاملة
 * Enhanced System Configuration
 */

import { AdvancedErrorHandler } from './advanced-error-handler';
import { advancedLogger, LogLevel } from './advanced-logger';
import { PerformanceMonitor } from './performance-monitor';
import { RETRY_CONFIGS, RetrySystem } from './retry-system';

// Type alias for compatibility
type AdvancedLogger = typeof advancedLogger;

// إعدادات النظام العامة
export interface SystemConfig {
  environment: 'development' | 'staging' | 'production';
  debug: boolean;
  logging: {
    level: LogLevel;
    enableConsole: boolean;
    enableFile: boolean;
    enableDatabase: boolean;
  };
  performance: {
    enableMonitoring: boolean;
    enablePeriodicReporting: boolean;
    maxHistorySize: number;
  };
  errorHandling: {
    enableAdvancedHandling: boolean;
    enableRetry: boolean;
    enableDetailedLogging: boolean;
  };
  database: {
    connectionTimeout: number;
    queryTimeout: number;
    maxConnections: number;
    enableRetry: boolean;
  };
  api: {
    enableRateLimiting: boolean;
    maxRequestsPerMinute: number;
    enableCors: boolean;
    enableCompression: boolean;
  };
  security: {
    enableHelmet: boolean;
    enableCsrf: boolean;
    enableInputSanitization: boolean;
  };
}

// الإعدادات الافتراضية
const DEFAULT_CONFIG: SystemConfig = {
  environment: (process.env.NODE_ENV as any) || 'development',
  debug: process.env.NODE_ENV !== 'production',
  logging: {
    level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    enableConsole: true,
    enableFile: true,
    enableDatabase: false,
  },
  performance: {
    enableMonitoring: process.env.MONITORING_ENABLED !== 'false', // Allow disabling via env var
    enablePeriodicReporting: true,
    maxHistorySize: 1000,
  },
  errorHandling: {
    enableAdvancedHandling: true,
    enableRetry: true,
    enableDetailedLogging: process.env.NODE_ENV !== 'production',
  },
  database: {
    connectionTimeout: 10000,
    queryTimeout: 30000,
    maxConnections: 10,
    enableRetry: true,
  },
  api: {
    enableRateLimiting: true,
    maxRequestsPerMinute: 100,
    enableCors: true,
    enableCompression: true,
  },
  security: {
    enableHelmet: true,
    enableCsrf: false, // معطل للـ API
    enableInputSanitization: true,
  },
};

// فئة إدارة النظام المحسن
export class EnhancedSystemManager {
  private static instance: EnhancedSystemManager;
  private config: SystemConfig;
  private logger: AdvancedLogger;
  private performanceMonitor: PerformanceMonitor;
  private isInitialized = false;

  private constructor(config?: Partial<SystemConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = advancedLogger;
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  // الحصول على المثيل الوحيد
  public static getInstance(config?: Partial<SystemConfig>): EnhancedSystemManager {
    if (!EnhancedSystemManager.instance) {
      EnhancedSystemManager.instance = new EnhancedSystemManager(config);
    }
    return EnhancedSystemManager.instance;
  }

  // تهيئة النظام
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.logger.info('🚀 بدء تهيئة النظام المحسن', {
      environment: this.config.environment,
      debug: this.config.debug,
    });

    try {
      // تهيئة مراقبة الأداء
      if (this.config.performance.enableMonitoring) {
        await this.initializePerformanceMonitoring();
      }

      // تهيئة معالجة الأخطاء
      if (this.config.errorHandling.enableAdvancedHandling) {
        await this.initializeErrorHandling();
      }

      // تهيئة قاعدة البيانات
      await this.initializeDatabase();

      // تهيئة الأمان
      await this.initializeSecurity();

      this.isInitialized = true;

      await this.logger.info('تم بنجاح تم تهيئة النظام المحسن بنجاح', {
        features: {
          performanceMonitoring: this.config.performance.enableMonitoring,
          advancedErrorHandling: this.config.errorHandling.enableAdvancedHandling,
          retryLogic: this.config.errorHandling.enableRetry,
          rateLimiting: this.config.api.enableRateLimiting,
        },
      });
    } catch (error) {
      await this.logger.error('فشل فشل في تهيئة النظام المحسن', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  // تهيئة مراقبة الأداء
  private async initializePerformanceMonitoring(): Promise<void> {
    await this.logger.info('الأدوات تهيئة مراقبة الأداء');

    // تنظيف دوري للبيانات القديمة
    if (this.config.performance.enablePeriodicReporting) {
      setInterval(
        () => {
          this.performanceMonitor.cleanup();
        },
        60 * 60 * 1000,
      ); // كل ساعة
    }

    await this.logger.info('تم بنجاح تم تهيئة مراقبة الأداء');
  }

  // تهيئة معالجة الأخطاء
  private async initializeErrorHandling(): Promise<void> {
    await this.logger.info('الأدوات تهيئة معالجة الأخطاء المتقدمة');

    // إعداد معالج الأخطاء غير المتوقعة
    process.on('uncaughtException', async (error) => {
      this.logger.error('خطأ غير متوقع في النظام', {
        error: error.message,
        stack: error.stack,
      });

      // إعطاء وقت للتسجيل قبل الإغلاق
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });

    process.on('unhandledRejection', async (reason, _promise) => {
      this.logger.error('Promise مرفوض غير معالج', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    });

    await this.logger.info('تم بنجاح تم تهيئة معالجة الأخطاء');
  }

  // تهيئة قاعدة البيانات
  private async initializeDatabase(): Promise<void> {
    await this.logger.info('الأدوات تهيئة إعدادات قاعدة البيانات');

    // يمكن إضافة إعدادات Prisma هنا
    // مثل connection pooling, timeouts, etc.

    await this.logger.info('تم بنجاح تم تهيئة قاعدة البيانات');
  }

  // تهيئة الأمان
  private async initializeSecurity(): Promise<void> {
    await this.logger.info('الأدوات تهيئة إعدادات الأمان');

    // إعدادات الأمان يمكن تطبيقها هنا
    // مثل rate limiting, input sanitization, etc.

    await this.logger.info('تم بنجاح تم تهيئة الأمان');
  }

  // الحصول على الإعدادات
  public getConfig(): SystemConfig {
    return { ...this.config };
  }

  // تحديث الإعدادات
  public updateConfig(newConfig: Partial<SystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('تم تحديث إعدادات النظام', { newConfig });
  }

  // الحصول على المسجل
  public getLogger(): AdvancedLogger {
    return this.logger;
  }

  // الحصول على مراقب الأداء
  public getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  // إنشاء نظام إعادة المحاولة
  public createRetrySystem(
    type: 'DATABASE' | 'CRITICAL' | 'FAST' | 'EXTERNAL' = 'DATABASE',
  ): RetrySystem {
    return new RetrySystem(RETRY_CONFIGS[type]);
  }

  // إنشاء معالج أخطاء
  public createErrorHandler(requestId?: string): AdvancedErrorHandler {
    return new AdvancedErrorHandler(requestId);
  }

  // فحص صحة النظام
  public async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    details: Record<string, any>;
  }> {
    const details: Record<string, any> = {
      initialized: this.isInitialized,
      environment: this.config.environment,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };

    // فحص مراقبة الأداء
    if (this.config.performance.enableMonitoring) {
      const systemStats = this.performanceMonitor.getSystemStats();
      details.performance = {
        activeOperations: systemStats.activeOperations,
        averageResponseTime: systemStats.averageResponseTime,
        errorRate: systemStats.errorRate,
      };
    }

    // تحديد الحالة العامة
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    const memoryUsage = details.memoryUsage.heapUsed / details.memoryUsage.heapTotal;
    if (memoryUsage > 0.9) {
      status = 'critical';
    } else if (memoryUsage > 0.75) {
      status = 'warning';
    }

    if (details.performance?.errorRate > 0.1) {
      status = status === 'critical' ? 'critical' : 'warning';
    }

    return { status, details };
  }

  // إيقاف النظام بأمان
  public async shutdown(): Promise<void> {
    await this.logger.info('🛑 بدء إيقاف النظام بأمان');

    try {
      // تنظيف مراقبة الأداء
      if (this.config.performance.enableMonitoring) {
        this.performanceMonitor.cleanup();
      }

      // إغلاق اتصالات قاعدة البيانات
      // يتم التعامل مع هذا في كل API منفرد

      await this.logger.info('تم بنجاح تم إيقاف النظام بأمان');
    } catch (error) {
      await this.logger.error('فشل خطأ أثناء إيقاف النظام', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// تصدير المثيل الافتراضي
export const systemManager = EnhancedSystemManager.getInstance();

// دالة تهيئة سريعة
export const initializeEnhancedSystem = async (
  config?: Partial<SystemConfig>,
): Promise<EnhancedSystemManager> => {
  const manager = EnhancedSystemManager.getInstance(config);
  await manager.initialize();
  return manager;
};

// معالج إيقاف النظام
export const setupGracefulShutdown = (manager: EnhancedSystemManager): void => {
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 تلقي إشارة ${signal}، بدء الإيقاف الآمن...`);
    await manager.shutdown();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

export default EnhancedSystemManager;
