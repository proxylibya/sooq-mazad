import { NextApiRequest, NextApiResponse } from 'next';
import { notificationManager } from '../../../lib/notifications/notificationManager';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'رمز المصادقة مطلوب' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'رمز المصادقة غير صحيح' });
    }

    await notificationManager.removePushSubscription(user.userId);

    res.status(200).json({
      success: true,
      message: 'تم إلغاء تفعيل الإشعارات بنجاح',
    });
  } catch (error) {
    console.error('خطأ في إلغاء تفعيل الإشعارات:', error);
    res.status(500).json({
      error: 'خطأ في الخادم',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
