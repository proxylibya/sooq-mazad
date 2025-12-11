import { NextApiRequest, NextApiResponse } from 'next';
import { auctionStatusService } from '../../../lib/services/auctionStatusService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // الحصول على حالة الخدمة
    const serviceStatus = auctionStatusService.getStatus();

    return res.status(200).json({
      success: true,
      message: 'حالة خدمة تحديث المزادات',
      data: {
        serviceStatus: serviceStatus,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[فشل] خطأ في الحصول على حالة الخدمة:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الحصول على حالة الخدمة',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
    });
  }
}
