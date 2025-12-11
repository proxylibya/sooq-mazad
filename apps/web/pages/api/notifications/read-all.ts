import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/middleware/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API لتعليم جميع الإشعارات كمقروءة
 * POST /api/notifications/read-all
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // التحقق من الطريقة
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, error: 'طريقة غير مدعومة' });
    }

    try {
        // التحقق من المصادقة
        const authUser = await verifyToken(req);
        if (!authUser?.id) {
            return res.status(401).json({ success: false, error: 'يجب تسجيل الدخول' });
        }

        const userId = String(authUser.id);

        // تحديث جميع الإشعارات غير المقروءة
        const result = await prisma.notifications.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        console.log(`[Notifications] تم تعليم ${result.count} إشعار كمقروء للمستخدم:`, userId);

        return res.status(200).json({
            success: true,
            message: 'تم تعليم جميع الإشعارات كمقروءة',
            updated: result.count,
        });
    } catch (error) {
        console.error('[Notifications] خطأ في تعليم الإشعارات كمقروءة:', error);
        return res.status(500).json({
            success: false,
            error: 'فشل في تحديث الإشعارات',
        });
    }
}
