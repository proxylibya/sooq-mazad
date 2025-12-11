import { NextApiRequest, NextApiResponse } from 'next';
import { auctionStatusService } from '../../../lib/services/auctionStatusService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // تحديث فوري لحالة المزادات
    const result = await auctionStatusService.updateAuctionStatuses();

    // الحصول على حالة الخدمة
    const serviceStatus = auctionStatusService.getStatus();

    return res.status(200).json({
      success: true,
      message: 'تم تحديث حالة المزادات بنجاح',
      data: {
        updateResult: result,
        serviceStatus: serviceStatus,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[فشل] خطأ في تحديث حالة المزادات:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في تحديث حالة المزادات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
    });
  }
}
