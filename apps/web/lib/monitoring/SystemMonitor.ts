/**
 * نظام مراقبة شامل للأداء والأمان
 * مراقبة متقدمة لتحمل الضغط العالي والهجمات
 */

import os from 'os';
import process from 'process';
import { logger } from '../core/logging/UnifiedLogger';
import { cache } from '../core/cache/UnifiedCache';
import { rateLimiter } from '../security/UnifiedRateLimiter';

export interface SystemMetrics {
  timestamp: number;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
    heap: {
      used: number;
      total: number;
      limit: number;
    };
  };
  disk: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
  network: {
    connections: number;
    bytesReceived: number;
    bytesSent: number;
  };
  process: {
    pid: number;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'CPU_HIGH' | 'MEMORY_HIGH' | 'DISK_HIGH' | 'RESPONSE_SLOW' | 'ERROR_RATE_HIGH';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  resolved: boolean;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  score: number; // 0-100
  checks: {
    database: { status: boolean; latency: number };
    cache: { status: boolean; hitRate: number };
    memory: { status: boolean; usage: number };
    cpu: { status: boolean; usage: number };
    disk: { status: boolean; usage: number };
    network: { status: boolean; connections: number };
  };
  alerts: PerformanceAlert[];
  uptime: number;
  lastCheck: number;
}

class SystemMonitor {
  private metrics: SystemMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private isMonitoring = false;
  private intervalId?: NodeJS.Timeout;
  
  // عتبات التنبيه
  private thresholds = {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 80, critical: 95 },
    disk: { warning: 85, critical: 95 },
    responseTime: { warning: 2000, critical: 5000 },
    errorRate: { warning: 5, critical: 15 },
  };

  private cpuUsageHistory: number[] = [];
  private startTime = Date.now();
  private lastNetworkStats = { received: 0, sent: 0 };

  constructor() {
    this.setupProcessMonitoring();
  }

  /**
   * بدء المراقبة
   */
  startMonitoring(intervalMs = 10000): void {
    if (this.isMonitoring) {
      logger.warn('المراقبة قيد التشغيل بالفعل');
      return;
    }

    this.isMonitoring = true;
    
    // جمع المعايير بشكل دوري
    this.intervalId = setInterval(async () => {
      await this.collectMetrics();
      await this.checkAlerts();
    }, intervalMs);

    // فحص صحة النظام كل دقيقة
    setInterval(() => {
      this.performHealthCheck();
    }, 60000);

    // تنظيف البيانات القديمة كل ساعة
    setInterval(() => {
      this.cleanup();
    }, 3600000);

    logger.info('تم بدء مراقبة النظام', { intervalMs });
  }

  /**
   * إيقاف المراقبة
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    
    this.isMonitoring = false;
    logger.info('تم إيقاف مراقبة النظام');
  }

  /**
   * جمع معايير النظام
   */
  async collectMetrics(): Promise<SystemMetrics> {
    try {
      const timestamp = Date.now();
      
      // معايير المعالج
      const cpuUsage = await this.getCpuUsage();
      const loadAverage = os.loadavg();
      const cpuCores = os.cpus().length;

      // معايير الذاكرة
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;
      const processMemory = process.memoryUsage();

      // معايير القرص
      const diskStats = await this.getDiskUsage();
      
      // معايير الشبكة
      const networkStats = await this.getNetworkStats();

      // معايير العملية
      const processStats = {
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: processMemory,
        cpuUsage: process.cpuUsage(),
      };

      const metrics: SystemMetrics = {
        timestamp,
        cpu: {
          usage: cpuUsage,
          loadAverage,
          cores: cpuCores,
        },
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: usedMemory,
          usagePercent: memoryUsagePercent,
          heap: {
            used: processMemory.heapUsed,
            total: processMemory.heapTotal,
            limit: processMemory.rss,
          },
        },
        disk: diskStats,
        network: networkStats,
        process: processStats,
      };

      // حفظ المعايير
      this.metrics.push(metrics);
      
      // الاحتفاظ بآخر 1000 قياس فقط
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // حفظ في الكاش للوصول السريع
      await cache.set('system:metrics:latest', metrics, { ttl: 300 });

      return metrics;

    } catch (error) {
      logger.error('خطأ في جمع معايير النظام', error);
      throw error;
    }
  }

  /**
   * فحص التنبيهات
   */
  private async checkAlerts(): Promise<void> {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (!latestMetrics) return;

    const newAlerts: PerformanceAlert[] = [];

    // فحص استخدام المعالج
    if (latestMetrics.cpu.usage > this.thresholds.cpu.critical) {
      newAlerts.push(this.createAlert(
        'CPU_HIGH',
        'CRITICAL',
        `استخدام المعالج عالي جداً: ${latestMetrics.cpu.usage.toFixed(1)}%`,
        latestMetrics.cpu.usage,
        this.thresholds.cpu.critical
      ));
    } else if (latestMetrics.cpu.usage > this.thresholds.cpu.warning) {
      newAlerts.push(this.createAlert(
        'CPU_HIGH',
        'HIGH',
        `استخدام المعالج عالي: ${latestMetrics.cpu.usage.toFixed(1)}%`,
        latestMetrics.cpu.usage,
        this.thresholds.cpu.warning
      ));
    }

    // فحص استخدام الذاكرة
    if (latestMetrics.memory.usagePercent > this.thresholds.memory.critical) {
      newAlerts.push(this.createAlert(
        'MEMORY_HIGH',
        'CRITICAL',
        `استخدام الذاكرة عالي جداً: ${latestMetrics.memory.usagePercent.toFixed(1)}%`,
        latestMetrics.memory.usagePercent,
        this.thresholds.memory.critical
      ));
    } else if (latestMetrics.memory.usagePercent > this.thresholds.memory.warning) {
      newAlerts.push(this.createAlert(
        'MEMORY_HIGH',
        'HIGH',
        `استخدام الذاكرة عالي: ${latestMetrics.memory.usagePercent.toFixed(1)}%`,
        latestMetrics.memory.usagePercent,
        this.thresholds.memory.warning
      ));
    }

    // فحص استخدام القرص
    if (latestMetrics.disk.usagePercent > this.thresholds.disk.critical) {
      newAlerts.push(this.createAlert(
        'DISK_HIGH',
        'CRITICAL',
        `استخدام القرص عالي جداً: ${latestMetrics.disk.usagePercent.toFixed(1)}%`,
        latestMetrics.disk.usagePercent,
        this.thresholds.disk.critical
      ));
    } else if (latestMetrics.disk.usagePercent > this.thresholds.disk.warning) {
      newAlerts.push(this.createAlert(
        'DISK_HIGH',
        'HIGH',
        `استخدام القرص عالي: ${latestMetrics.disk.usagePercent.toFixed(1)}%`,
        latestMetrics.disk.usagePercent,
        this.thresholds.disk.warning
      ));
    }

    // إضافة التنبيهات الجديدة
    for (const alert of newAlerts) {
      this.addAlert(alert);
    }
  }

  /**
   * فحص صحة النظام الشامل
   */
  async performHealthCheck(): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      
      // فحص قاعدة البيانات
      const dbCheck = await this.checkDatabaseHealth();
      
      // فحص الكاش
      const cacheCheck = await this.checkCacheHealth();
      
      // الحصول على أحدث المعايير
      const latestMetrics = this.metrics[this.metrics.length - 1];
      
      const healthStatus: HealthStatus = {
        status: 'healthy',
        score: 100,
        checks: {
          database: dbCheck,
          cache: cacheCheck,
          memory: {
            status: latestMetrics ? latestMetrics.memory.usagePercent < this.thresholds.memory.warning : true,
            usage: latestMetrics ? latestMetrics.memory.usagePercent : 0,
          },
          cpu: {
            status: latestMetrics ? latestMetrics.cpu.usage < this.thresholds.cpu.warning : true,
            usage: latestMetrics ? latestMetrics.cpu.usage : 0,
          },
          disk: {
            status: latestMetrics ? latestMetrics.disk.usagePercent < this.thresholds.disk.warning : true,
            usage: latestMetrics ? latestMetrics.disk.usagePercent : 0,
          },
          network: {
            status: latestMetrics ? latestMetrics.network.connections < 1000 : true,
            connections: latestMetrics ? latestMetrics.network.connections : 0,
          },
        },
        alerts: this.getActiveAlerts(),
        uptime: Date.now() - this.startTime,
        lastCheck: Date.now(),
      };

      // حساب النتيجة الإجمالية
      let score = 100;
      const checks = Object.values(healthStatus.checks);
      const failedChecks = checks.filter(check => !check.status).length;
      score -= (failedChecks / checks.length) * 50;

      // تقليل النتيجة حسب شدة التنبيهات
      const criticalAlerts = healthStatus.alerts.filter(a => a.severity === 'CRITICAL').length;
      const highAlerts = healthStatus.alerts.filter(a => a.severity === 'HIGH').length;
      
      score -= criticalAlerts * 20;
      score -= highAlerts * 10;
      
      healthStatus.score = Math.max(0, Math.round(score));

      // تحديد الحالة العامة
      if (score >= 90) healthStatus.status = 'healthy';
      else if (score >= 70) healthStatus.status = 'degraded';
      else if (score >= 40) healthStatus.status = 'unhealthy';
      else healthStatus.status = 'critical';

      // حفظ في الكاش
      await cache.set('system:health', healthStatus, { ttl: 60 });

      logger.debug('فحص صحة النظام مكتمل', {
        status: healthStatus.status,
        score: healthStatus.score,
        duration: Date.now() - startTime,
      });

      return healthStatus;

    } catch (error) {
      logger.error('خطأ في فحص صحة النظام', error);
      
      return {
        status: 'critical',
        score: 0,
        checks: {
          database: { status: false, latency: -1 },
          cache: { status: false, hitRate: 0 },
          memory: { status: false, usage: 0 },
          cpu: { status: false, usage: 0 },
          disk: { status: false, usage: 0 },
          network: { status: false, connections: 0 },
        },
        alerts: [],
        uptime: Date.now() - this.startTime,
        lastCheck: Date.now(),
      };
    }
  }

  /**
   * الحصول على تقرير شامل
   */
  async generateReport(): Promise<{
    summary: {
      status: string;
      uptime: number;
      totalAlerts: number;
      criticalAlerts: number;
    };
    performance: {
      avgCpuUsage: number;
      avgMemoryUsage: number;
      peakMemoryUsage: number;
      diskUsage: number;
    };
    trends: {
      cpuTrend: 'increasing' | 'decreasing' | 'stable';
      memoryTrend: 'increasing' | 'decreasing' | 'stable';
    };
    topAlerts: PerformanceAlert[];
    recommendations: string[];
  }> {
    const healthStatus = await this.performHealthCheck();
    const recentMetrics = this.metrics.slice(-100); // آخر 100 قياس

    // حساب المتوسطات
    const avgCpuUsage = recentMetrics.reduce((sum, m) => sum + m.cpu.usage, 0) / recentMetrics.length;
    const avgMemoryUsage = recentMetrics.reduce((sum, m) => sum + m.memory.usagePercent, 0) / recentMetrics.length;
    const peakMemoryUsage = Math.max(...recentMetrics.map(m => m.memory.usagePercent));

    // تحليل الاتجاهات
    const cpuTrend = this.analyzeTrend(recentMetrics.map(m => m.cpu.usage));
    const memoryTrend = this.analyzeTrend(recentMetrics.map(m => m.memory.usagePercent));

    // أهم التنبيهات
    const topAlerts = this.alerts
      .filter(a => !a.resolved)
      .sort((a, b) => {
        const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 10);

    // توصيات
    const recommendations: string[] = [];
    
    if (avgCpuUsage > 70) {
      recommendations.push('يُنصح بتحسين كود التطبيق أو زيادة قوة المعالج');
    }
    
    if (avgMemoryUsage > 80) {
      recommendations.push('يُنصح بتحسين استخدام الذاكرة أو زيادة حجم الذاكرة المتاحة');
    }
    
    if (peakMemoryUsage > 95) {
      recommendations.push('خطر: الذاكرة ممتلئة تقريباً، قد يحدث crash للتطبيق');
    }
    
    if (healthStatus.checks.disk.usage > 85) {
      recommendations.push('مساحة القرص منخفضة، يُنصح بتنظيف الملفات غير المهمة');
    }

    return {
      summary: {
        status: healthStatus.status,
        uptime: healthStatus.uptime,
        totalAlerts: this.alerts.length,
        criticalAlerts: this.alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length,
      },
      performance: {
        avgCpuUsage: Math.round(avgCpuUsage * 100) / 100,
        avgMemoryUsage: Math.round(avgMemoryUsage * 100) / 100,
        peakMemoryUsage: Math.round(peakMemoryUsage * 100) / 100,
        diskUsage: Math.round(healthStatus.checks.disk.usage * 100) / 100,
      },
      trends: {
        cpuTrend,
        memoryTrend,
      },
      topAlerts,
      recommendations,
    };
  }

  /**
   * دوال مساعدة خاصة
   */
  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = process.hrtime();
      
      setTimeout(() => {
        const currentUsage = process.cpuUsage(startUsage);
        const currentTime = process.hrtime(startTime);
        
        const totalTime = currentTime[0] * 1000000 + currentTime[1] / 1000; // microseconds
        const totalCpu = currentUsage.user + currentUsage.system;
        const cpuPercent = (totalCpu / totalTime) * 100;
        
        resolve(Math.min(100, cpuPercent));
      }, 100);
    });
  }

  private async getDiskUsage(): Promise<{ total: number; free: number; used: number; usagePercent: number }> {
    // تنفيذ بسيط - يمكن تحسينه باستخدام مكتبات خاصة
    try {
      const fs = require('fs');
      const stats = fs.statSync(process.cwd());
      
      // قيم افتراضية - يُنصح باستخدام مكتبة disk-usage للحصول على بيانات دقيقة
      return {
        total: 100 * 1024 * 1024 * 1024, // 100GB افتراضي
        free: 50 * 1024 * 1024 * 1024,   // 50GB افتراضي
        used: 50 * 1024 * 1024 * 1024,   // 50GB افتراضي
        usagePercent: 50, // 50% افتراضي
      };
    } catch {
      return { total: 0, free: 0, used: 0, usagePercent: 0 };
    }
  }

  private async getNetworkStats(): Promise<{ connections: number; bytesReceived: number; bytesSent: number }> {
    // تنفيذ بسيط - يمكن تحسينه
    return {
      connections: Math.floor(Math.random() * 100), // قيمة تجريبية
      bytesReceived: this.lastNetworkStats.received + Math.floor(Math.random() * 1000),
      bytesSent: this.lastNetworkStats.sent + Math.floor(Math.random() * 1000),
    };
  }

  private async checkDatabaseHealth(): Promise<{ status: boolean; latency: number }> {
    try {
      const startTime = Date.now();
      // محاولة استعلام بسيط لقاعدة البيانات
      const prisma = require('../prisma');
      await prisma.users.findFirst({ take: 1 });
      const latency = Date.now() - startTime;
      
      return { status: latency < 1000, latency }; // صحي إذا كان أقل من ثانية
    } catch (error) {
      return { status: false, latency: -1 };
    }
  }

  private async checkCacheHealth(): Promise<{ status: boolean; hitRate: number }> {
    try {
      const stats = cache.getStats();
      const hitRate = stats.hitRate;
      
      return { status: hitRate > 50, hitRate }; // صحي إذا كان معدل الإصابة أكثر من 50%
    } catch (error) {
      return { status: false, hitRate: 0 };
    }
  }

  private createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    value: number,
    threshold: number
  ): PerformanceAlert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      value,
      threshold,
      timestamp: Date.now(),
      resolved: false,
    };
  }

  private addAlert(alert: PerformanceAlert): void {
    // تجنب التنبيهات المكررة
    const existingAlert = this.alerts.find(
      a => a.type === alert.type && !a.resolved && (Date.now() - a.timestamp) < 300000 // 5 دقائق
    );
    
    if (!existingAlert) {
      this.alerts.push(alert);
      
      // الاحتفاظ بآخر 1000 تنبيه
      if (this.alerts.length > 1000) {
        this.alerts = this.alerts.slice(-1000);
      }

      logger.warn(`تنبيه النظام: ${alert.message}`, {
        type: alert.type,
        severity: alert.severity,
        value: alert.value,
        threshold: alert.threshold,
      });
    }
  }

  private getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  private analyzeTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 10) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    const threshold = firstAvg * 0.1; // 10% تغيير
    
    if (diff > threshold) return 'increasing';
    if (diff < -threshold) return 'decreasing';
    return 'stable';
  }

  private setupProcessMonitoring(): void {
    // مراقبة إشارات العملية
    process.on('SIGTERM', () => {
      logger.info('تم تلقي إشارة SIGTERM، إيقاف المراقبة...');
      this.stopMonitoring();
    });

    process.on('SIGINT', () => {
      logger.info('تم تلقي إشارة SIGINT، إيقاف المراقبة...');
      this.stopMonitoring();
    });
  }

  private cleanup(): void {
    const oneHourAgo = Date.now() - 3600000;
    
    // تنظيف المعايير القديمة
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    
    // حل التنبيهات القديمة
    this.alerts.forEach(alert => {
      if (!alert.resolved && (Date.now() - alert.timestamp) > 3600000) {
        alert.resolved = true;
      }
    });

    logger.debug('تم تنظيف بيانات المراقبة القديمة');
  }

  /**
   * دوال عامة للوصول للبيانات
   */
  getMetrics(limit = 100): SystemMetrics[] {
    return this.metrics.slice(-limit);
  }

  getAlerts(onlyActive = true): PerformanceAlert[] {
    return onlyActive ? this.getActiveAlerts() : this.alerts;
  }

  isHealthy(): boolean {
    return this.getActiveAlerts().filter(a => a.severity === 'CRITICAL').length === 0;
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }
}

// إنشاء مثيل موحد
export const systemMonitor = new SystemMonitor();

// دوال مساعدة
export const startMonitoring = (intervalMs?: number) => systemMonitor.startMonitoring(intervalMs);
export const stopMonitoring = () => systemMonitor.stopMonitoring();
export const getSystemHealth = () => systemMonitor.performHealthCheck();
export const getSystemReport = () => systemMonitor.generateReport();
export const getSystemMetrics = (limit?: number) => systemMonitor.getMetrics(limit);

export default systemMonitor;
