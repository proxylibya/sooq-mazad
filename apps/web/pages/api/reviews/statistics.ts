import { NextApiRequest, NextApiResponse } from 'next';
import { ReviewService } from '../../../lib/services/reviewService';
import { logger } from '../../../lib/utils/logger';

interface StatisticsResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatisticsResponse>,
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getStatistics(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    logger.error('خطأ في API إحصائيات التقييمات', error as Error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

// جلب إحصائيات التقييمات
async function getStatistics(req: NextApiRequest, res: NextApiResponse<StatisticsResponse>) {
  try {
    const { itemId, itemType } = req.query;

    const statistics = await ReviewService.getReviewStats(
      itemId as string | undefined,
      itemType as string | undefined,
    );

    return res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    logger.error('خطأ في جلب إحصائيات التقييمات', error as Error);
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب الإحصائيات',
    });
  }
}


