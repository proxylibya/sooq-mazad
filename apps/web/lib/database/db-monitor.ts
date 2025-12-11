/**
 * نظام مراقبة وحماية قاعدة البيانات المتقدم
 * يوفر: مراقبة الأداء، الحماية من الهجمات، التنبيهات الذكية
 */

import { PrismaClient } from '@prisma/client';
import { Logger } from '@/utils/logger';

const logger = new Logger('DatabaseMonitor');

// إعدادات العتبات
const THRESHOLDS = {
  // أداء الاستعلامات (بالميلي ثانية)
  QUERY_SLOW: 1000,
  QUERY_CRITICAL: 3000,
  
  // الاتصالات
  CONNECTION_WARNING: 15,
  CONNECTION_CRITICAL: 20,
  
  // حجم قاعدة البيانات (بالميجابايت)
  DB_SIZE_WARNING: 500,
  DB_SIZE_CRITICAL: 1000,
  
  // معدلات الأخطاء
  ERROR_RATE_WARNING: 0.05, // 5%
  ERROR_RATE_CRITICAL: 0.10, // 10%
};

// إحصائيات الاستعلامات
interface QueryStats {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  slowQueries: number;
  avgDuration: number;
  lastReset: Date;
}

// حالة الاتصالات
interface ConnectionHealth {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  timestamp: Date;
}

// معلومات قاعدة البيانات
interface DatabaseInfo {
  size: string;
  sizeBytes: number;
  tables: number;
  indexes: number;
  connections: ConnectionHealth;
  performance: {
    cacheHitRatio: number;
    transactionRate: number;
  };
}

class DatabaseMonitor {
  private prisma: PrismaClient;
  private stats: QueryStats;
  private alertHistory: Map<string, Date>;
  private isEnabled: boolean;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
    this.stats = this.initializeStats();
    this.alertHistory = new Map();
    this.isEnabled = process.env.DB_MONITORING === 'true';
  }

  private initializeStats(): QueryStats {
    return {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      slowQueries: 0,
      avgDuration: 0,
      lastReset: new Date(),
    };
  }

  /**
   * مراقبة استعلام - تسجيل الأداء والأخطاء
   */
  async trackQuery(
    model: string,
    operation: string,
    duration: number,
    success: boolean
  ): Promise<void> {
    if (!this.isEnabled) return;

    this.stats.totalQueries++;
    
    if (success) {
      this.stats.successfulQueries++;
    } else {
      this.stats.failedQueries++;
    }

    // تحديث متوسط المدة
    this.stats.avgDuration = 
      (this.stats.avgDuration * (this.stats.totalQueries - 1) + duration) / 
      this.stats.totalQueries;

    // تتبع الاستعلامات البطيئة
    if (duration > THRESHOLDS.QUERY_SLOW) {
      this.stats.slowQueries++;
      
      if (duration > THRESHOLDS.QUERY_CRITICAL) {
        await this.sendAlert('CRITICAL_SLOW_QUERY', {
          model,
          operation,
          duration,
          threshold: THRESHOLDS.QUERY_CRITICAL,
        });
      } else {
        logger.warn(`Slow query detected: ${model}.${operation} (${duration}ms)`);
      }
    }

    // فحص معدل الأخطاء
    const errorRate = this.stats.failedQueries / this.stats.totalQueries;
    if (errorRate > THRESHOLDS.ERROR_RATE_CRITICAL) {
      await this.sendAlert('HIGH_ERROR_RATE', {
        rate: errorRate,
        failed: this.stats.failedQueries,
        total: this.stats.totalQueries,
      });
    }
  }

  /**
   * فحص صحة قاعدة البيانات
   */
  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    checks: Record<string, boolean>;
    details: any;
  }> {
    const checks: Record<string, boolean> = {};
    const details: any = {};

    try {
      // 1. فحص الاتصال
      const connectionStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const connectionLatency = Date.now() - connectionStart;
      
      checks.connection = connectionLatency < 1000;
      details.connectionLatency = connectionLatency;

      // 2. فحص عدد الاتصالات
      const connections = await this.getConnectionStats();
      checks.connections = connections.active < THRESHOLDS.CONNECTION_WARNING;
      details.connections = connections;

      // 3. فحص حجم قاعدة البيانات
      const dbInfo = await this.getDatabaseInfo();
      checks.dbSize = dbInfo.sizeBytes < THRESHOLDS.DB_SIZE_WARNING * 1024 * 1024;
      details.databaseInfo = dbInfo;

      // 4. فحص معدل الأخطاء
      const errorRate = this.stats.totalQueries > 0 
        ? this.stats.failedQueries / this.stats.totalQueries 
        : 0;
      checks.errorRate = errorRate < THRESHOLDS.ERROR_RATE_WARNING;
      details.errorRate = errorRate;

      // تحديد الحالة العامة
      const passedChecks = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.keys(checks).length;
      
      let status: 'healthy' | 'degraded' | 'critical';
      if (passedChecks === totalChecks) {
        status = 'healthy';
      } else if (passedChecks >= totalChecks * 0.75) {
        status = 'degraded';
      } else {
        status = 'critical';
      }

      return { status, checks, details };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'critical',
        checks: {},
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * الحصول على إحصائيات الاتصالات
   */
  private async getConnectionStats(): Promise<ConnectionHealth> {
    try {
      const result = await this.prisma.$queryRaw<Array<{
        state: string;
        count: string;
      }>>`
        SELECT 
          state,
          CAST(COUNT(*) AS TEXT) as count
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `;

      const stats: any = {};
      result.forEach(row => {
        stats[row.state] = parseInt(row.count);
      });

      return {
        total: result.reduce((sum, row) => sum + parseInt(row.count), 0),
        active: stats['active'] || 0,
        idle: stats['idle'] || 0,
        waiting: stats['idle in transaction'] || 0,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get connection stats:', error);
      return {
        total: 0,
        active: 0,
        idle: 0,
        waiting: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * الحصول على معلومات قاعدة البيانات
   */
  private async getDatabaseInfo(): Promise<DatabaseInfo> {
    try {
      // حجم قاعدة البيانات
      const sizeResult = await this.prisma.$queryRaw<Array<{
        size: string;
        size_bytes: string;
      }>>`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as size,
          CAST(pg_database_size(current_database()) AS TEXT) as size_bytes
      `;

      // عدد الجداول والفهارس
      const tablesResult = await this.prisma.$queryRaw<Array<{
        table_count: string;
        index_count: string;
      }>>`
        SELECT 
          CAST((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') AS TEXT) as table_count,
          CAST((SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') AS TEXT) as index_count
      `;

      // نسبة cache hit
      const cacheResult = await this.prisma.$queryRaw<Array<{
        cache_hit_ratio: number;
      }>>`
        SELECT 
          ROUND(
            100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0),
            2
          ) as cache_hit_ratio
        FROM pg_stat_database
        WHERE datname = current_database()
      `;

      const connections = await this.getConnectionStats();

      return {
        size: sizeResult[0].size,
        sizeBytes: parseInt(sizeResult[0].size_bytes),
        tables: parseInt(tablesResult[0].table_count),
        indexes: parseInt(tablesResult[0].index_count),
        connections,
        performance: {
          cacheHitRatio: cacheResult[0]?.cache_hit_ratio || 0,
          transactionRate: 0, // يمكن حسابها لاحقاً
        },
      };
    } catch (error) {
      logger.error('Failed to get database info:', error);
      throw error;
    }
  }

  /**
   * إرسال تنبيه
   */
  private async sendAlert(type: string, data: any): Promise<void> {
    // منع إرسال تنبيهات متكررة (مرة كل 5 دقائق)
    const lastAlert = this.alertHistory.get(type);
    if (lastAlert && Date.now() - lastAlert.getTime() < 5 * 60 * 1000) {
      return;
    }

    this.alertHistory.set(type, new Date());

    logger.error(`[DATABASE ALERT] ${type}`, data);

    // هنا يمكن إضافة إرسال التنبيهات عبر:
    // - Email
    // - Slack
    // - SMS
    // - Sentry
    
    try {
      // حفظ التنبيه في قاعدة البيانات
      await this.prisma.systemActivityLog.create({
        data: {
          action: 'PERFORMANCE_ALERT',
          component: 'DatabaseMonitor',
          severity: type.includes('CRITICAL') ? 'CRITICAL' : 'WARNING',
          message: `Database alert: ${type}`,
          metadata: data,
        },
      });
    } catch (error) {
      // تجنب loop لا نهائي من الأخطاء
      console.error('Failed to save alert:', error);
    }
  }

  /**
   * الحصول على إحصائيات الاستعلامات
   */
  getQueryStats(): QueryStats {
    return { ...this.stats };
  }

  /**
   * إعادة تعيين الإحصائيات
   */
  resetStats(): void {
    this.stats = this.initializeStats();
    logger.info('Query statistics reset');
  }

  /**
   * فحص الجداول الكبيرة
   */
  async findLargeTables(limit: number = 10): Promise<Array<{
    tableName: string;
    size: string;
    rowCount: number;
  }>> {
    try {
      const result = await this.prisma.$queryRaw<Array<{
        tablename: string;
        size: string;
        row_count: string;
      }>>`
        SELECT 
          tablename,
          pg_size_pretty(pg_total_relation_size(quote_ident(tablename))) AS size,
          CAST(
            (SELECT COUNT(*) FROM information_schema.columns 
             WHERE table_name = tablename) 
            AS TEXT
          ) as row_count
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(quote_ident(tablename)) DESC
        LIMIT ${limit}
      `;

      return result.map(row => ({
        tableName: row.tablename,
        size: row.size,
        rowCount: parseInt(row.row_count),
      }));
    } catch (error) {
      logger.error('Failed to find large tables:', error);
      return [];
    }
  }

  /**
   * فحص الفهارس غير المستخدمة
   */
  async findUnusedIndexes(): Promise<Array<{
    tableName: string;
    indexName: string;
    size: string;
  }>> {
    try {
      const result = await this.prisma.$queryRaw<Array<{
        tablename: string;
        indexname: string;
        size: string;
      }>>`
        SELECT 
          schemaname || '.' || tablename as tablename,
          indexname,
          pg_size_pretty(pg_relation_size(indexrelid)) as size
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
        AND schemaname = 'public'
        ORDER BY pg_relation_size(indexrelid) DESC
      `;

      return result.map(row => ({
        tableName: row.tablename,
        indexName: row.indexname,
        size: row.size,
      }));
    } catch (error) {
      logger.error('Failed to find unused indexes:', error);
      return [];
    }
  }
}

// Export singleton instance
let monitorInstance: DatabaseMonitor | null = null;

export function createDatabaseMonitor(prisma: PrismaClient): DatabaseMonitor {
  if (!monitorInstance) {
    monitorInstance = new DatabaseMonitor(prisma);
  }
  return monitorInstance;
}

export function getDatabaseMonitor(): DatabaseMonitor | null {
  return monitorInstance;
}

export type { QueryStats, ConnectionHealth, DatabaseInfo };
export { DatabaseMonitor, THRESHOLDS };
