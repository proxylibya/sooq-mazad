import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      pageSize = '20',
      sortBy = 'startTime',
      sortOrder = 'desc',
      search,
      status,
      minPrice,
      maxPrice,
      city,
      category,
      isLive,
      hasReserve,
      featured, // فلتر المميزة فقط
    } = req.query;

    // بناء filters
    // ✅ استبعاد مزادات الساحات - تظهر فقط في /yards/[slug]
    const filters: Record<string, any> = {
      yardId: null, // مزادات أونلاين فقط
    };

    if (search && typeof search === 'string') {
      filters.OR = [
        {
          car: {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { brand: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (status && typeof status === 'string') {
      filters.status = status;
    }

    if (minPrice || maxPrice) {
      filters.currentPrice = {};
      if (minPrice) filters.currentPrice.gte = parseFloat(minPrice as string);
      if (maxPrice) filters.currentPrice.lte = parseFloat(maxPrice as string);
    }

    if (city && typeof city === 'string') {
      filters.car = {
        ...filters.car,
        location: city,
      };
    }

    if (category && typeof category === 'string') {
      filters.car = {
        ...filters.car,
        bodyType: category,
      };
    }

    if (isLive !== undefined) {
      const now = new Date();
      filters.startTime = { lte: now };
      filters.endTime = { gte: now };
      filters.status = 'ACTIVE';
    }

    if (hasReserve !== undefined) {
      filters.reservePrice = hasReserve === 'true' ? { not: null } : { equals: null };
    }

    // فلتر المميزة فقط
    if (featured === 'true') {
      filters.featured = true;
    }

    // استدعاء pagination مع include للـ car
    const { skip, take } = {
      skip: (parseInt(page as string) - 1) * parseInt(pageSize as string),
      take: parseInt(pageSize as string),
    };

    // ترتيب المزادات المميزة أولاً، ثم حسب الترتيب المطلوب
    const orderBy = [
      { featured: 'desc' as const }, // المميزة أولاً
      { [sortBy as string]: sortOrder as 'asc' | 'desc' },
    ];

    const where = filters;

    const [data, total] = await Promise.all([
      prisma.auctions.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          car: {
            select: {
              id: true,
              title: true,
              brand: true,
              model: true,
              year: true,
              images: true,
              location: true,
              bodyType: true,
            },
          },
          _count: {
            select: {
              bids: true,
            },
          },
        },
      }),
      prisma.auctions.count({ where }),
    ]);

    const totalPages = Math.ceil(total / parseInt(pageSize as string));

    const result = {
      data,
      total,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      totalPages,
      hasNextPage: parseInt(page as string) < totalPages,
      hasPrevPage: parseInt(page as string) > 1,
    };

    // إضافة cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching paginated auctions:', error);
    return res.status(500).json({ error: 'Failed to fetch auctions' });
  }
}
