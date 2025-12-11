import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // السماح فقط بطريقة POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: 'طريقة غير مدعومة',
    });
  }

  try {
    // تحديث حالة المزادات
    const updateResult = await dbHelpers.updateAuctionStatuses();

    return res.status(200).json({
      success: true,
      message: 'تم تحديث حالة المزادات بنجاح',
      data: {
        upcomingToActive: updateResult.upcomingToActive,
        activeToEnded: updateResult.activeToEnded,
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
