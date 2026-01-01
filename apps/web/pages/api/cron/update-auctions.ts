import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../lib/prisma';
import {
  triggerAuctionEndingSoonNotifications,
  triggerPaymentReminders,
} from '../../../utils/notifications/auctionEventTriggers';

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
    // التحقق من مفتاح الأمان (اختياري)
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET || 'default-secret';

    if (authHeader !== `Bearer ${cronSecret}`) {
      // لا نرجع خطأ لتجنب كشف وجود الـ endpoint
      return res.status(200).json({ success: true, message: 'OK' });
    }

    // تحديث حالة المزادات
    const updateResult = await dbHelpers.updateAuctionStatuses();

    // تشغيل إشعارات اقتراب انتهاء المزادات
    await triggerAuctionEndingSoonNotifications();

    // تشغيل تذكيرات الدفع للفائزين
    await triggerPaymentReminders();

    // جلب إحصائيات المزادات الحالية
    const stats = await getAuctionStats();

    console.log('[تم بنجاح] تم تحديث حالة المزادات بنجاح:', {
      ...updateResult,
      currentStats: stats,
    });

    return res.status(200).json({
      success: true,
      message: 'تم تحديث حالة المزادات بنجاح',
      data: {
        ...updateResult,
        stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[فشل] خطأ في مهمة cron لتحديث المزادات:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في تحديث حالة المزادات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
    });
  }
}

// دالة للحصول على إحصائيات المزادات
async function getAuctionStats() {
  try {
    const auctions = await dbHelpers.getAuctionsWithFilters();

    const stats = {
      total: auctions.length,
      upcoming: auctions.filter((a) => a.status === 'UPCOMING').length,
      active: auctions.filter((a) => a.status === 'ACTIVE').length,
      ended: auctions.filter((a) => a.status === 'ENDED').length,
      cancelled: auctions.filter((a) => a.status === 'CANCELLED').length,
    };

    return stats;
  } catch (error) {
    console.error('خطأ في جلب إحصائيات المزادات:', error);
    return {
      total: 0,
      upcoming: 0,
      active: 0,
      ended: 0,
      cancelled: 0,
    };
  }
}
