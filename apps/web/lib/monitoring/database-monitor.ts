/**
 * نظام مراقبة قاعدة البيانات المتقدم
 * يراقب صحة قاعدة البيانات ويرسل تنبيهات عند المشاكل
 */

// تم حذف dbConnectionManager - استخدام prisma مباشرة
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../utils/logger';

interface DatabaseMetrics {
  connectionHealth: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  errorRate: number;
  queryCount: number;
  activeConnections: number;
  timestamp: Date;
}

interface AlertRule {
  name: string;
  condition: (metrics: DatabaseMetrics) => boolean;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  cooldown: number; // بالثواني
}

interface DatabaseAlert {
  rule: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  metrics: DatabaseMetrics;
}

class DatabaseMonitor {
  private alertRules: AlertRule[] = [];
  private alertHistory: DatabaseAlert[] = [];
  private lastAlerts: Map<string, Date> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private metricsHistory: DatabaseMetrics[] = [];
  private readonly maxHistorySize = 1000; // الاحتفاظ بآخر 1000 قياس

  constructor() {
    this.setupAlertRules();
    this.startMonitoring();
  }

  private setupAlertRules(): void {
    this.alertRules = [
      {
        name: 'high_response_time',
        condition: (metrics) => metrics.responseTime > 5000, // أكثر من 5 ثوان
        severity: 'warning',
        message: 'وقت استجابة قاعدة البيانات مرتفع',
        cooldown: 300 // 5 دقائق
      },
      {
        name: 'very_high_response_time',
        condition: (metrics) => metrics.responseTime > 10000, // أكثر من 10 ثوان
        severity: 'critical',
        message: 'وقت استجابة قاعدة البيانات مرتفع جداً',
        cooldown: 180 // 3 دقائق
      },
      {
        name: 'high_error_rate',
        condition: (metrics) => metrics.errorRate > 0.1, // أكثر من 10%
        severity: 'warning',
        message: 'معدل أخطاء قاعدة البيانات مرتفع',
        cooldown: 300
      },
      {
        name: 'critical_error_rate',
        condition: (metrics) => metrics.errorRate > 0.25, // أكثر من 25%
        severity: 'critical',
        message: 'معدل أخطاء قاعدة البيانات حرج',
        cooldown: 180
      },
      {
        name: 'connection_unhealthy',
        condition: (metrics) => metrics.connectionHealth === 'critical',
        severity: 'critical',
        message: 'اتصال قاعدة البيانات في حالة حرجة',
        cooldown: 60 // دقيقة واحدة
      },
      {
        name: 'low_performance',
        condition: (_metrics) => {
          // إذا كان متوسط وقت الاستجابة في آخر 10 دقائق > 3 ثوان
          const recent = this.metricsHistory.slice(-20); // آخر 20 قياس
          if (recent.length < 5) return false;
          const avgResponseTime = recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
          return avgResponseTime > 3000;
        },
        severity: 'warning',
        message: 'أداء قاعدة البيانات منخفض بشكل مستمر',
        cooldown: 600 // 10 دقائق
      }
    ];
  }

  private async collectMetrics(): Promise<DatabaseMetrics> {
    try {
      // فحص صحة الاتصال بطريقة بسيطة
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      // تحديد حالة الصحة بناءً على وقت الاستجابة
      let connectionHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (responseTime > 5000) {
        connectionHealth = 'critical';
      } else if (responseTime > 2000) {
        connectionHealth = 'warning';
      }

      return {
        connectionHealth,
        responseTime,
        errorRate: 0,
        queryCount: 0,
        activeConnections: 1,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('فشل في جمع إحصائيات قاعدة البيانات', error as Error);

      return {
        connectionHealth: 'critical',
        responseTime: 0,
        errorRate: 1,
        queryCount: 0,
        activeConnections: 0,
        timestamp: new Date()
      };
    }
  }

  private checkAlertRules(metrics: DatabaseMetrics): void {
    const now = new Date();

    for (const rule of this.alertRules) {
      if (!rule.condition(metrics)) {
        continue;
      }

      // التحقق من cooldown
      const lastAlert = this.lastAlerts.get(rule.name);
      if (lastAlert) {
        const timeSinceLastAlert = (now.getTime() - lastAlert.getTime()) / 1000;
        if (timeSinceLastAlert < rule.cooldown) {
          continue; // لا يزال في فترة cooldown
        }
      }

      // إنشاء تنبيه جديد
      const alert: DatabaseAlert = {
        rule: rule.name,
        severity: rule.severity,
        message: rule.message,
        timestamp: now,
        metrics: { ...metrics }
      };

      this.handleAlert(alert);
      this.lastAlerts.set(rule.name, now);
    }
  }

  private async handleAlert(alert: DatabaseAlert): Promise<void> {
    // إضافة للتاريخ
    this.alertHistory.push(alert);

    // الاحتفاظ بآخر 500 تنبيه فقط
    if (this.alertHistory.length > 500) {
      this.alertHistory = this.alertHistory.slice(-500);
    }

    // تسجيل التنبيه
    const logLevel = alert.severity === 'critical' ? 'error' :
      alert.severity === 'warning' ? 'warn' : 'info';

    logger[logLevel](`تنبيه قاعدة البيانات: ${alert.message}`, {
      rule: alert.rule,
      severity: alert.severity,
      metrics: alert.metrics
    });

    // حفظ التنبيه في ملف
    await this.saveAlertToFile(alert);

    // إرسال تنبيه فوري للحالات الحرجة
    if (alert.severity === 'critical') {
      await this.sendCriticalAlert(alert);
    }
  }

  private async saveAlertToFile(alert: DatabaseAlert): Promise<void> {
    try {
      const alertsDir = path.join(process.cwd(), 'logs', 'database-alerts');

      // إنشاء المجلد إذا لم يكن موجوداً
      try {
        await fs.access(alertsDir);
      } catch {
        await fs.mkdir(alertsDir, { recursive: true });
      }

      const filename = `alerts_${new Date().toISOString().split('T')[0]}.json`;
      const filepath = path.join(alertsDir, filename);

      let existingAlerts: DatabaseAlert[] = [];
      try {
        const content = await fs.readFile(filepath, 'utf8');
        existingAlerts = JSON.parse(content);
      } catch {
        // الملف غير موجود أو فارغ
      }

      existingAlerts.push(alert);
      await fs.writeFile(filepath, JSON.stringify(existingAlerts, null, 2));

    } catch (error) {
      logger.error('فشل في حفظ التنبيه', error as Error);
    }
  }

  private async sendCriticalAlert(alert: DatabaseAlert): Promise<void> {
    // هنا يمكنك إضافة إرسال الإشعارات عبر:
    // - البريد الإلكتروني
    // - Slack/Discord
    // - SMS
    // - Push notifications

    logger.error('🚨 تنبيه حرج في قاعدة البيانات!', {
      alert: alert.message,
      metrics: alert.metrics,
      timestamp: alert.timestamp.toISOString()
    });

    // مثال: إرسال webhook (يمكن تفعيله حسب الحاجة)
    /*
    if (process.env.ALERT_WEBHOOK_URL) {
      try {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 تنبيه حرج: ${alert.message}`,
            details: alert.metrics
          })
        });
      } catch (error) {
        logger.error('فشل في إرسال webhook', error as Error);
      }
    }
    */
  }

  private startMonitoring(): void {
    const intervalMs = 30000; // كل 30 ثانية

    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();

        // إضافة للتاريخ
        this.metricsHistory.push(metrics);
        if (this.metricsHistory.length > this.maxHistorySize) {
          this.metricsHistory.shift();
        }

        // فحص قواعد التنبيه
        this.checkAlertRules(metrics);

        // تسجيل دوري للإحصائيات (كل 5 دقائق)
        if (this.metricsHistory.length % 10 === 0) {
          logger.info('إحصائيات قاعدة البيانات', {
            health: metrics.connectionHealth,
            responseTime: `${metrics.responseTime.toFixed(2)}ms`,
            errorRate: `${(metrics.errorRate * 100).toFixed(2)}%`,
            queryCount: metrics.queryCount,
            activeConnections: metrics.activeConnections
          });
        }

      } catch (error) {
        logger.error('خطأ في مراقب قاعدة البيانات', error as Error);
      }
    }, intervalMs);

    logger.info('بدء مراقبة قاعدة البيانات', { intervalMs });
  }

  // API العامة
  public getCurrentMetrics(): DatabaseMetrics | null {
    return this.metricsHistory.length > 0
      ? this.metricsHistory[this.metricsHistory.length - 1]
      : null;
  }

  public getMetricsHistory(limit: number = 100): DatabaseMetrics[] {
    return this.metricsHistory.slice(-limit);
  }

  public getRecentAlerts(limit: number = 50): DatabaseAlert[] {
    return this.alertHistory.slice(-limit);
  }

  public getHealthSummary(): {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    totalQueries: number;
    avgResponseTime: number;
    errorRate: number;
    recentAlerts: number;
  } {
    const currentMetrics = this.getCurrentMetrics();
    const recentMetrics = this.metricsHistory.slice(-100);
    const avgResponseTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
      : 0;
    const errorRate = recentMetrics.length > 0
      ? recentMetrics.filter(m => m.connectionHealth === 'critical').length / recentMetrics.length
      : 0;
    const recentAlerts = this.alertHistory.filter(
      alert => Date.now() - alert.timestamp.getTime() < 3600000 // آخر ساعة
    ).length;

    return {
      status: currentMetrics?.connectionHealth || 'critical',
      uptime: Date.now(),
      totalQueries: this.metricsHistory.length,
      avgResponseTime,
      errorRate,
      recentAlerts
    };
  }

  public async generateHealthReport(): Promise<string> {
    const summary = this.getHealthSummary();
    const recentMetrics = this.getMetricsHistory(20);
    const recentAlerts = this.getRecentAlerts(10);

    const report = `
# تقرير صحة قاعدة البيانات
## التاريخ: ${new Date().toISOString()}

### الحالة العامة: ${summary.status.toUpperCase()}

### الإحصائيات:
- وقت التشغيل: ${Math.floor(summary.uptime / 1000 / 60)} دقيقة
- إجمالي الاستعلامات: ${summary.totalQueries}
- متوسط وقت الاستجابة: ${summary.avgResponseTime.toFixed(2)}ms
- معدل الأخطاء: ${(summary.errorRate * 100).toFixed(2)}%
- تنبيهات الساعة الأخيرة: ${summary.recentAlerts}

### آخر القياسات (${recentMetrics.length}):
${recentMetrics.map(m =>
      `- ${m.timestamp.toISOString()}: ${m.connectionHealth} (${m.responseTime.toFixed(2)}ms, ${(m.errorRate * 100).toFixed(2)}% errors)`
    ).join('\n')}

### آخر التنبيهات (${recentAlerts.length}):
${recentAlerts.map(a =>
      `- ${a.timestamp.toISOString()}: [${a.severity.toUpperCase()}] ${a.message}`
    ).join('\n')}
`;

    // حفظ التقرير
    try {
      const reportsDir = path.join(process.cwd(), 'logs', 'database-reports');
      await fs.mkdir(reportsDir, { recursive: true });

      const filename = `health_report_${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
      const filepath = path.join(reportsDir, filename);

      await fs.writeFile(filepath, report);
      logger.info('تم إنشاء تقرير صحة قاعدة البيانات', { filepath });
    } catch (error) {
      logger.error('فشل في حفظ تقرير الصحة', error as Error);
    }

    return report;
  }

  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('تم إيقاف مراقب قاعدة البيانات');
    }
  }
}

// إنشاء مثيل واحد مشترك
const databaseMonitor = new DatabaseMonitor();

// معالجة إغلاق التطبيق
process.on('SIGINT', () => {
  databaseMonitor.stop();
});

process.on('SIGTERM', () => {
  databaseMonitor.stop();
});

export { DatabaseMonitor, databaseMonitor };
export type { DatabaseAlert, DatabaseMetrics };

