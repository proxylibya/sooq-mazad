/**
 * API سريع لجلب إحصائيات التقييمات
 * محسن للاستخدام في البطاقات والمعاينات
 */

import { NextApiRequest, NextApiResponse } from 'next';
import CachedReviewService from '../../../lib/services/cachedReviewService';
import { logger } from '../../../lib/utils/logger';

interface QuickStatsResponse {
  success: boolean;
  data?: {
    averageRating: number;
    totalReviews: number;
    hasReviews: boolean;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuickStatsResponse>
) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({
        success: false,
        error: 'طريقة غير مدعومة',
      });
    }

    const { itemId, itemType } = req.query;

    if (!itemId || !itemType) {
      return res.status(400).json({
        success: false,
        error: 'معرف العنصر ونوعه مطلوبان',
      });
    }

    // جلب الإحصائيات من النظام المحسن
    const stats = await CachedReviewService.getReviewStats(
      itemId as string,
      itemType as string
    );

    // إرجاع بيانات مبسطة للاستخدام السريع
    return res.status(200).json({
      success: true,
      data: {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
        hasReviews: stats.totalReviews > 0,
      },
    });

  } catch (error) {
    logger.error('خطأ في API الإحصائيات السريعة', error as Error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}
