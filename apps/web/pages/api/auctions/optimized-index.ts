/**
 * API محسّن لجلب المزادات
 * يستخدم Prisma Selectors + Caching
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuctionsWithVehicles } from '../../../lib/services/universal/auctionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = (req.query.status as string | undefined) || 'active';

    if (status === 'upcoming') {
      // سلوك سابق: صفحة واحدة فقط من المزادات القادمة
      const { auctions } = await getAuctionsWithVehicles({
        status: 'UPCOMING',
        limit,
        offset: 0,
        sortBy: 'startTime',
        sortOrder: 'asc',
      });
      return res.status(200).json({
        data: auctions,
        pagination: {
          page: 1,
          limit,
          total: auctions.length,
          totalPages: 1,
        },
      });
    }

    // الافتراضي: المزادات النشطة مع ترقيم صفحات حقيقي
    const offset = (page - 1) * limit;
    const { auctions, total } = await getAuctionsWithVehicles({
      status: 'ACTIVE',
      limit,
      offset,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return res.status(200).json({
      data: auctions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب البيانات' });
  }
}
