import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { keydb } from '@/lib/keydb';

/**
 * API للتحقق من صحة نظام المعارض
 * GET /api/health/showrooms
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const healthReport: any = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {},
  };

  try {
    // 1. فحص اتصال قاعدة البيانات
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthReport.checks.database = {
        status: 'ok',
        message: 'PostgreSQL متصل ويعمل بشكل صحيح',
      };
    } catch (dbError: any) {
      healthReport.checks.database = {
        status: 'error',
        message: 'فشل الاتصال بـ PostgreSQL',
        error: dbError.message,
      };
      healthReport.status = 'unhealthy';
    }

    // 2. فحص جدول المعارض
    try {
      const showroomsCount = await prisma.showrooms.count();
      healthReport.checks.showroomsTable = {
        status: 'ok',
        message: `جدول المعارض يعمل بشكل صحيح`,
        count: showroomsCount,
      };
    } catch (tableError: any) {
      healthReport.checks.showroomsTable = {
        status: 'error',
        message: 'مشكلة في جدول المعارض',
        error: tableError.message,
      };
      healthReport.status = 'unhealthy';
    }

    // 3. فحص KeyDB Cache
    try {
      const testKey = '__health_check_showrooms__';
      await keydb.set(testKey, 'ok', 10);
      const result = await keydb.get(testKey);
      await keydb.del(testKey);

      if (result === 'ok') {
        healthReport.checks.cache = {
          status: 'ok',
          message: 'KeyDB Cache يعمل بشكل صحيح',
        };
      } else {
        healthReport.checks.cache = {
          status: 'warning',
          message: 'KeyDB Cache لا يعمل بشكل صحيح',
        };
      }
    } catch (cacheError: any) {
      healthReport.checks.cache = {
        status: 'warning',
        message: 'KeyDB Cache غير متاح',
        error: cacheError.message,
        note: 'التطبيق سيعمل بدون cache ولكن الأداء قد يكون أبطأ',
      };
    }

    // 4. فحص API Endpoint
    try {
      const sampleShowrooms = await prisma.showrooms.findMany({
        take: 1,
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

      healthReport.checks.apiEndpoint = {
        status: 'ok',
        message: 'API Endpoint يعمل بشكل صحيح',
        sample: sampleShowrooms.length > 0 ? sampleShowrooms[0] : null,
      };
    } catch (apiError: any) {
      healthReport.checks.apiEndpoint = {
        status: 'error',
        message: 'مشكلة في API Endpoint',
        error: apiError.message,
      };
      healthReport.status = 'unhealthy';
    }

    // 5. إحصائيات عامة
    try {
      const stats = await prisma.showrooms.groupBy({
        by: ['status'],
        _count: true,
      });

      healthReport.statistics = {
        byStatus: stats.reduce((acc: any, item: any) => {
          acc[item.status] = item._count;
          return acc;
        }, {}),
      };
    } catch (statsError: any) {
      healthReport.statistics = {
        error: 'فشل في جلب الإحصائيات',
      };
    }

    // تحديد HTTP Status Code
    const httpStatus = healthReport.status === 'healthy' ? 200 : 503;

    return res.status(httpStatus).json({
      success: healthReport.status === 'healthy',
      ...healthReport,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: 'حدث خطأ غير متوقع',
      error: error.message,
    });
  }
}
