/**
 * Ultra-Optimized Cars API - مثال على API محسّن بالكامل
 * يستخدم جميع تقنيات التحسين المتقدمة
 */

import { generateCacheKey, getCachedQuery } from '@/lib/cache/queryCache';
import { withCompression } from '@/lib/compression/responseCompressor';
import { prisma } from '@/lib/prisma';
import { generalLimiter, withRateLimit } from '@/lib/security/rateLimiter';
import { withOptimizations } from '@/middleware/performanceMiddleware';
import { NextApiRequest, NextApiResponse } from 'next';
// تم حذف queryBatcher - استخدام prisma.cars.findMany مباشرة

/**
 * Handler رئيسي مع جميع التحسينات
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      limit = '20',
      status = 'AVAILABLE',
      brand,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      status: status as string,
    };

    if (brand && brand !== 'all') {
      where.brand = brand;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    // Generate cache key
    const cacheKey = generateCacheKey({
      page,
      limit,
      status,
      brand,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    });

    // استخدام Cache + Query Batching
    const [cars, total] = await getCachedQuery(
      `cars-v2:${cacheKey}`,
      async () => {
        // استخدام Query Batching للأداء الأفضل
        return await Promise.all([
          prisma.cars.findMany({
            where,
            select: {
              // Select فقط الحقول المطلوبة
              id: true,
              title: true,
              brand: true,
              model: true,
              year: true,
              price: true,
              images: true,
              condition: true,
              mileage: true,
              location: true,
              featured: true,
              views: true,
              createdAt: true,
              // بيانات البائع المختصرة فقط
              seller: {
                select: {
                  id: true,
                  name: true,
                  verified: true,
                  rating: true,
                },
              },
            },
            orderBy: {
              [sortBy as string]: sortOrder,
            },
            skip,
            take: limitNum,
          }),
          prisma.cars.count({ where }),
        ]);
      },
      { ttl: 60, prefix: 'api-v2' }, // Cache لمدة 60 ثانية
    );

    // Response محسّن
    const response = {
      success: true,
      data: {
        cars,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasMore: pageNum * limitNum < total,
        },
      },
      meta: {
        cached: true,
        timestamp: new Date().toISOString(),
        version: '2.0',
      },
    };

    // إضافة Performance Headers
    res.setHeader('X-API-Version', '2.0');
    res.setHeader('X-Optimized', 'true');

    return res.status(200).json(response);
  } catch (error) {
    console.error('Cars API v2 error:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// تطبيق جميع optimizations
export default withCompression(
  withRateLimit(
    withOptimizations(handler, {
      cache: 60,
      performance: true,
    }),
    generalLimiter,
  ),
  {
    threshold: 512, // 512 bytes
    level: 6,
    prefer: 'auto',
  },
);
