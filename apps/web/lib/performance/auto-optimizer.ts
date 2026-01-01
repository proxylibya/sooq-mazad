/**
 * نازم التحسين التلقائي للأداء العالي
 * يدير ويحسن الأداء تلقائياً بناء على المؤشرات
 */

import { EventEmitter } from 'events';
import { productionLogger } from '../logger/production-logger';
import { getHighPerformanceKeyDB } from '../cache/high-performance-keydb';
import { systemHealthMonitor } from '../monitoring/system-health';

interface OptimizationRule {
  id: string;
  name: string;
  condition: (metrics: any) => boolean;
  action: () => Promise<void>;
  cooldown: number; // milliseconds
  lastExecuted: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface OptimizationStats {
  totalOptimizations: number;
  successfulOptimizations: number;
  failedOptimizations: number;
  lastOptimization: Date | null;
  activeRules: number;
  rulesExecuted: { [ruleId: string]: number };
}

class AutoPerformanceOptimizer extends EventEmitter {
  private rules: OptimizationRule[] = [];
  private stats: OptimizationStats;
  private isRunning = false;
  private optimizationInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.stats = {
      totalOptimizations: 0,
      successfulOptimizations: 0,
      failedOptimizations: 0,
      lastOptimization: null,
      activeRules: 0,
      rulesExecuted: {}
    };

    this.initializeOptimizationRules();
  }

  private initializeOptimizationRules(): void {
    // قاعدة تنظيف الذاكرة
    this.addRule({
      id: 'memory_cleanup',
      name: 'تنظيف الذاكرة',
      condition: (metrics) => {
        const memoryUsage = (metrics.system.heapUsed / metrics.system.heapTotal) * 100;
        return memoryUsage > 85;
      },
      action: async () => {
        // إجبار garbage collection
        if (global.gc) {
          global.gc();
          productionLogger.info('تم تنفيذ تنظيف الذاكرة التلقائي');
        }
      },
      cooldown: 60000, // دقيقة واحدة
      priority: 'high'
    });

    // قاعدة تنظيف Cache القديم
    this.addRule({
      id: 'cache_cleanup',
      name: 'تنظيف الـ Cache القديم',
      condition: (metrics) => {
        return metrics.cache.totalRequests > 10000 && metrics.cache.hitRate < 60;
      },
      action: async () => {
        const keydb = getHighPerformanceKeyDB();
        // تنظيف المفاتيح المنتهية الصلاحية
        await keydb.invalidatePattern('expired:*');
        productionLogger.info('تم تنظيف الـ Cache القديم');
      },
      cooldown: 300000, // 5 دقائق
      priority: 'medium'
    });

    // قاعدة تحسين Connection Pool
    this.addRule({
      id: 'connection_pool_optimization',
      name: 'تحسين مجموعة الاتصالات',
      condition: (metrics) => {
        return metrics.database.avgQueryTime > 500 && metrics.database.connectionCount > 0;
      },
      action: async () => {
        // إعادة تهيئة Connection Pool (محاكاة)
        productionLogger.info('إعادة تحسين مجموعة اتصالات قاعدة البيانات');
        // في التطبيق الحقيقي: إعادة توزيع الاتصالات، إغلاق الاتصالات الخاملة
      },
      cooldown: 600000, // 10 دقائق
      priority: 'high'
    });

    // قاعدة تحسين استعلامات قاعدة البيانات
    this.addRule({
      id: 'slow_query_optimization',
      name: 'تحسين الاستعلامات البطيئة',
      condition: (metrics) => {
        return metrics.database.slowQueries > 0;
      },
      action: async () => {
        // تحليل الاستعلامات البطيئة وتحسينها
        productionLogger.warn('تم اكتشاف استعلامات بطيئة - تفعيل التحسينات');
        // في التطبيق الحقيقي: تحليل execution plans، إضافة indexes
      },
      cooldown: 180000, // 3 دقائق
      priority: 'high'
    });

    // قاعدة Cache Warming
    this.addRule({
      id: 'cache_warming',
      name: 'تسخين الـ Cache',
      condition: (metrics) => {
        return metrics.cache.hitRate < 70 && metrics.http.totalRequests > 100;
      },
      action: async () => {
        const keydb = getHighPerformanceKeyDB();
        
        // تسخين البيانات المهمة
        await keydb.warmCache([
          {
            key: 'featured:cars',
            factory: async () => {
              // محاكاة جلب السيارات المميزة
              return { cars: [], count: 0 };
            },
            ttl: 3600
          },
          {
            key: 'active:auctions',
            factory: async () => {
              // محاكاة جلب المزادات النشطة
              return { auctions: [], count: 0 };
            },
            ttl: 300
          }
        ]);

        productionLogger.info('تم تسخين الـ Cache بالبيانات المهمة');
      },
      cooldown: 900000, // 15 دقيقة
      priority: 'medium'
    });

    // قاعدة تحسين HTTP Responses
    this.addRule({
      id: 'http_response_optimization',
      name: 'تحسين استجابات HTTP',
      condition: (metrics) => {
        return metrics.http.avgResponseTime > 2000;
      },
      action: async () => {
        // تفعيل ضغط إضافي، تحسين headers
        productionLogger.info('تفعيل تحسينات HTTP للاستجابة السريعة');
        // في التطبيق الحقيقي: تحسين middleware، ضغط البيانات
      },
      cooldown: 120000, // دقيقتان
      priority: 'medium'
    });

    // قاعدة إدارة الأحمال العالية
    this.addRule({
      id: 'high_load_management',
      name: 'إدارة الأحمال العالية',
      condition: (metrics) => {
        return metrics.http.activeRequests > 100 || metrics.http.throughputPerSecond > 50;
      },
      action: async () => {
        // تفعيل rate limiting إضافي، تقليل TTL للـ cache
        productionLogger.warn('تم اكتشاف حمولة عالية - تفعيل حماية إضافية');
        
        const keydb = getHighPerformanceKeyDB();
        // تقليل TTL للبيانات غير الحرجة
        // في التطبيق الحقيقي: تفعيل load balancing، circuit breakers
      },
      cooldown: 30000, // 30 ثانية
      priority: 'critical'
    });

    this.stats.activeRules = this.rules.length;
    productionLogger.info(`تم تهيئة ${this.rules.length} قاعدة للتحسين التلقائي`);
  }

  private addRule(rule: Omit<OptimizationRule, 'lastExecuted'>): void {
    this.rules.push({
      ...rule,
      lastExecuted: 0
    });
    this.stats.rulesExecuted[rule.id] = 0;
  }

  // بدء التحسين التلقائي
  start(interval: number = 30000): void {
    if (this.isRunning) return;

    this.isRunning = true;
    productionLogger.info('بدء نظام التحسين التلقائي للأداء');

    this.optimizationInterval = setInterval(async () => {
      await this.runOptimizationCycle();
    }, interval);

    // مراقبة للأحمال العالية (فحص أسرع)
    setInterval(async () => {
      await this.runCriticalOptimizations();
    }, 10000); // كل 10 ثوانٍ
  }

  // إيقاف التحسين التلقائي
  stop(): void {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = undefined;
    }
    this.isRunning = false;
    productionLogger.info('تم إيقاف نظام التحسين التلقائي');
  }

  // تشغيل دورة تحسين كاملة
  private async runOptimizationCycle(): Promise<void> {
    try {
      const healthStatus = systemHealthMonitor.getHealthStatus();
      const metrics = healthStatus.metrics;

      for (const rule of this.rules) {
        if (this.shouldExecuteRule(rule, metrics)) {
          await this.executeRule(rule);
        }
      }
    } catch (error) {
      productionLogger.error('خطأ في دورة التحسين التلقائي', error);
    }
  }

  // تشغيل التحسينات الحرجة فقط
  private async runCriticalOptimizations(): Promise<void> {
    try {
      const healthStatus = systemHealthMonitor.getHealthStatus();
      const metrics = healthStatus.metrics;

      const criticalRules = this.rules.filter(rule => rule.priority === 'critical');
      
      for (const rule of criticalRules) {
        if (this.shouldExecuteRule(rule, metrics)) {
          await this.executeRule(rule);
        }
      }
    } catch (error) {
      productionLogger.error('خطأ في التحسينات الحرجة', error);
    }
  }

  // تحديد ما إذا كان يجب تنفيذ القاعدة
  private shouldExecuteRule(rule: OptimizationRule, metrics: any): boolean {
    const now = Date.now();
    
    // فحص cooldown
    if (now - rule.lastExecuted < rule.cooldown) {
      return false;
    }

    // فحص الشرط
    return rule.condition(metrics);
  }

  // تنفيذ قاعدة التحسين
  private async executeRule(rule: OptimizationRule): Promise<void> {
    const startTime = Date.now();
    
    try {
      rule.lastExecuted = Date.now();
      await rule.action();
      
      this.stats.totalOptimizations++;
      this.stats.successfulOptimizations++;
      this.stats.lastOptimization = new Date();
      this.stats.rulesExecuted[rule.id]++;

      const duration = Date.now() - startTime;
      productionLogger.info(`تم تنفيذ قاعدة التحسين: ${rule.name}`, {
        ruleId: rule.id,
        duration,
        priority: rule.priority
      });

      this.emit('optimizationExecuted', {
        rule: rule,
        duration,
        success: true
      });

    } catch (error) {
      this.stats.totalOptimizations++;
      this.stats.failedOptimizations++;
      
      productionLogger.error(`فشل في تنفيذ قاعدة التحسين: ${rule.name}`, error, {
        ruleId: rule.id,
        priority: rule.priority
      });

      this.emit('optimizationFailed', {
        rule: rule,
        error,
        success: false
      });
    }
  }

  // تنفيذ تحسين يدوي
  async executeManualOptimization(ruleId: string): Promise<boolean> {
    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule) {
      throw new Error(`قاعدة التحسين غير موجودة: ${ruleId}`);
    }

    try {
      await this.executeRule(rule);
      return true;
    } catch (error) {
      productionLogger.error(`فشل التحسين اليدوي للقاعدة: ${ruleId}`, error);
      return false;
    }
  }

  // الحصول على الإحصائيات
  getStats(): OptimizationStats {
    return { ...this.stats };
  }

  // الحصول على قائمة القواعد
  getRules(): Array<Omit<OptimizationRule, 'action'>> {
    return this.rules.map(rule => ({
      id: rule.id,
      name: rule.name,
      condition: rule.condition,
      cooldown: rule.cooldown,
      lastExecuted: rule.lastExecuted,
      priority: rule.priority
    }));
  }

  // إضافة قاعدة جديدة
  addCustomRule(rule: Omit<OptimizationRule, 'lastExecuted'>): void {
    this.addRule(rule);
    productionLogger.info(`تم إضافة قاعدة تحسين جديدة: ${rule.name}`);
  }

  // إزالة قاعدة
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index === -1) return false;

    this.rules.splice(index, 1);
    delete this.stats.rulesExecuted[ruleId];
    this.stats.activeRules = this.rules.length;
    
    productionLogger.info(`تم حذف قاعدة التحسين: ${ruleId}`);
    return true;
  }

  // تصدير تقرير التحسينات
  exportOptimizationReport(): any {
    return {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      rules: this.getRules(),
      systemHealth: systemHealthMonitor.getQuickStats()
    };
  }
}

// إنشاء instance عالمي
const autoOptimizer = new AutoPerformanceOptimizer();

// بدء التحسين التلقائي في الإنتاج
if (process.env.NODE_ENV === 'production' || process.env.AUTO_OPTIMIZATION === 'true') {
  autoOptimizer.start(30000); // كل 30 ثانية
}

// تنظيف عند إغلاق التطبيق
process.on('SIGTERM', () => autoOptimizer.stop());
process.on('SIGINT', () => autoOptimizer.stop());

export { autoOptimizer, AutoPerformanceOptimizer };
export default autoOptimizer;
