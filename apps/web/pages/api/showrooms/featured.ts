/**
 * API لجلب المعارض المميزة باستخدام Static JSON Cache
 *
 * @route GET /api/showrooms/featured
 */

import { getOrSetCache } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cacheKey = 'showrooms:featured';

    // جلب من الكاش أو قاعدة البيانات
    const showrooms = await getOrSetCache(
      cacheKey,
      async () => {
        return await prisma.showrooms.findMany({
          where: {
            featured: true,
            verified: true,
          },
          include: {
            _count: {
              select: {
                cars: true,
              },
            },
          },
          orderBy: {
            rating: 'desc',
          },
          take: 20,
        });
      },
      120 // 2 دقائق - المعارض لا تتغير كثيراً
    );

    return res.status(200).json({
      success: true,
      data: showrooms,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('خطأ في جلب المعارض:', errorMessage);
    return res.status(500).json({
      error: 'فشل جلب المعارض',
      message: errorMessage,
    });
  }
}
