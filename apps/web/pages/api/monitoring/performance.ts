import { NextApiRequest, NextApiResponse } from 'next';
import {
  getPerformanceStats,
  checkDatabaseHealth,
  getDatabaseStats,
  getSlowQueriesReport,
} from '@/lib/monitoring/performanceMonitor';
import { getKeyDBStats } from '@/lib/keydb';

/**
 * API لمراقبة أداء النظام
 * GET /api/monitoring/performance
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // جمع جميع المعلومات بشكل متوازي
    const [dbHealth, dbStats, keydbStats, perfStats, slowQueries] = await Promise.all([
      checkDatabaseHealth(),
      getDatabaseStats(),
      getKeyDBStats(),
      Promise.resolve(getPerformanceStats()),
      Promise.resolve(getSlowQueriesReport()),
    ]);

    const report = {
      timestamp: new Date().toISOString(),
      status: dbHealth.healthy && keydbStats.connected ? 'healthy' : 'degraded',

      database: {
        healthy: dbHealth.healthy,
        latency: dbHealth.latency + 'ms',
        status: dbHealth.details,
        stats: dbStats,
      },

      cache: {
        connected: keydbStats.connected,
        type: 'KeyDB Alternative',
        stats: keydbStats,
      },

      performance: perfStats || {
        message: 'No performance data collected yet',
      },

      slowQueries: {
        count: slowQueries.count,
        top10: slowQueries.queries.slice(0, 10),
      },

      recommendations: generateRecommendations(dbHealth, perfStats, slowQueries),
    };

    res.status(200).json(report);
  } catch (error) {
    console.error('Performance monitoring error:', error);
    res.status(500).json({
      error: 'Failed to collect performance metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * توليد توصيات بناءً على البيانات
 */
function generateRecommendations(
  dbHealth: { healthy: boolean; latency: number },
  perfStats: any,
  slowQueries: any,
): string[] {
  const recommendations: string[] = [];

  if (!dbHealth.healthy) {
    recommendations.push(
      'Database latency is high. Consider optimizing queries or scaling database.',
    );
  }

  if (dbHealth.latency > 500) {
    recommendations.push(
      'Database response time is above 500ms. Review connection pooling settings.',
    );
  }

  if (slowQueries.count > 10) {
    recommendations.push(`Found ${slowQueries.count} slow queries. Review and optimize them.`);
  }

  if (perfStats && parseFloat(perfStats.averageDuration) > 1000) {
    recommendations.push(
      'Average API response time is above 1 second. Consider adding more caching.',
    );
  }

  if (perfStats && parseFloat(perfStats.successRate) < 95) {
    recommendations.push('API success rate is below 95%. Investigate failing endpoints.');
  }

  if (recommendations.length === 0) {
    recommendations.push('System performance is optimal.');
  }

  return recommendations;
}
