/**
 * API محسّن لجلب المعارض
 * يستخدم Prisma Selectors + Unified Cache
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrSetCache } from '../../../lib/cache';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    // مفتاح الكاش
    const cacheKey = `showrooms:list:${page}:${limit}`;

    // جلب من الكاش أو من DB
    const result = await getOrSetCache(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;

        const [showrooms, total] = await Promise.all([
          prisma.showrooms.findMany({
            where: { verified: true },
            skip,
            take: limit,
            orderBy: { rating: 'desc' },
            select: {
              id: true,
              name: true,
              city: true,
              rating: true,
              verified: true,
              featured: true,
              logoUrl: true,
              _count: { select: { cars: true } },
            },
          }),
          prisma.showrooms.count({ where: { verified: true } }),
        ]);

        return {
          showrooms,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
      },
      120 // كاش لمدة دقيقتين
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching showrooms:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب البيانات' });
  }
}
