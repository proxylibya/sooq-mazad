/**
 * API محسنة لجلب مزاد واحد باستخدام Unified Cache
 *
 * @route GET /api/auctions/[id]/optimized
 */

import { getOrSetCache } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'معرف المزاد مطلوب' });
  }

  try {
    const cacheKey = `auction:${id}`;

    // جلب من Cache أو قاعدة البيانات
    const auction = await getOrSetCache(
      cacheKey,
      async () => {
        return await prisma.auctions.findUnique({
          where: { id },
          include: {
            cars: {
              include: {
                showrooms: {
                  select: {
                    id: true,
                    name: true,
                    city: true,
                    rating: true,
                  },
                },
              },
            },
            bids: {
              orderBy: { createdAt: 'desc' },
              take: 10,
              include: {
                users: {
                  select: {
                    id: true,
                    name: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
        });
      },
      60 // 60 ثانية TTL
    );

    if (!auction) {
      return res.status(404).json({ error: 'المزاد غير موجود' });
    }

    return res.status(200).json({
      success: true,
      data: auction,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('خطأ في جلب المزاد:', errorMessage);
    return res.status(500).json({
      error: 'فشل جلب المزاد',
      message: errorMessage,
    });
  }
}
