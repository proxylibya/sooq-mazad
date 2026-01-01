/**
 * API للإحصائيات مع استخدام Materialized Views
 *
 * @route GET /api/statistics/dashboard
 */

import { getOrSetCache } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cacheKey = 'statistics:dashboard';

    // جلب من الكاش أو قاعدة البيانات
    const stats = await getOrSetCache(
      cacheKey,
      async () => {
        // جلب الإحصائيات الأساسية
        const [totalCars, totalAuctions, totalUsers, totalBids] = await Promise.all([
          prisma.cars.count({ where: { status: 'AVAILABLE' } }),
          prisma.auctions.count({ where: { status: 'ACTIVE' } }),
          prisma.users.count({ where: { status: 'ACTIVE' } }),
          prisma.bids.count(),
        ]);

        // أفضل المزايدين
        const topBidders = await prisma.bids.groupBy({
          by: ['bidderId'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        });

        // السيارات الأكثر مشاهدة
        const trendingCars = await prisma.cars.findMany({
          where: { status: 'AVAILABLE' },
          orderBy: { views: 'desc' },
          take: 10,
          select: { id: true, title: true, brand: true, views: true },
        });

        return {
          summary: { totalCars, totalAuctions, totalUsers, totalBids },
          topBidders,
          trendingCars,
          generatedAt: new Date(),
        };
      },
      300 // 5 دقائق
    );

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('خطأ في جلب الإحصائيات:', errorMessage);
    return res.status(500).json({
      error: 'فشل جلب الإحصائيات',
      message: errorMessage,
    });
  }
}
