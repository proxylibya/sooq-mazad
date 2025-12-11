/**
 * API محسّن لجلب السيارات
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
    const brand = req.query.brand as string | undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const query = req.query.q as string | undefined;

    // مفتاح الكاش
    const cacheKey = `cars:list:${page}:${limit}:${brand || 'all'}:${minPrice || 0}:${maxPrice || 0}:${query || ''}`;

    // جلب من الكاش أو من DB
    const result = await getOrSetCache(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;

        // بناء شروط البحث
        const where: Record<string, unknown> = {
          status: 'AVAILABLE',
          isAuction: false,
        };

        if (brand) where.brand = brand;
        if (minPrice) where.price = { ...(where.price as object || {}), gte: minPrice };
        if (maxPrice) where.price = { ...(where.price as object || {}), lte: maxPrice };
        if (query) {
          where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
          ];
        }

        const [cars, total] = await Promise.all([
          prisma.cars.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              title: true,
              brand: true,
              model: true,
              year: true,
              price: true,
              mileage: true,
              images: true,
              location: true,
              createdAt: true,
            },
          }),
          prisma.cars.count({ where }),
        ]);

        return {
          cars,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      },
      60 // كاش لمدة دقيقة
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب البيانات' });
  }
}
