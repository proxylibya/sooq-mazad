import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/middleware/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API لإدارة إشعار محدد
 * GET /api/notifications/[id] - جلب إشعار
 * PUT /api/notifications/[id] - تعليم كمقروء
 * DELETE /api/notifications/[id] - حذف إشعار
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // التحقق من المصادقة
        const authUser = await verifyToken(req);
        if (!authUser?.id) {
            return res.status(401).json({ success: false, error: 'يجب تسجيل الدخول' });
        }

        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, error: 'معرف الإشعار مطلوب' });
        }

        const userId = String(authUser.id);

        switch (req.method) {
            case 'GET':
                return await handleGet(id, userId, res);
            case 'PUT':
                return await handlePut(id, userId, res);
            case 'DELETE':
                return await handleDelete(id, userId, res);
            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                return res.status(405).json({ success: false, error: 'طريقة غير مدعومة' });
        }
    } catch (error) {
        console.error('[Notifications] خطأ في API:', error);
        return res.status(500).json({ success: false, error: 'خطأ في الخادم' });
    }
}

// جلب إشعار محدد
async function handleGet(notificationId: string, userId: string, res: NextApiResponse) {
    try {
        const notification = await prisma.notifications.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });

        if (!notification) {
            return res.status(404).json({ success: false, error: 'الإشعار غير موجود' });
        }

        return res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error('[Notifications] خطأ في جلب الإشعار:', error);
        return res.status(500).json({ success: false, error: 'خطأ في جلب الإشعار' });
    }
}

// تعليم إشعار كمقروء
async function handlePut(notificationId: string, userId: string, res: NextApiResponse) {
    try {
        const notification = await prisma.notifications.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });

        if (!notification) {
            return res.status(404).json({ success: false, error: 'الإشعار غير موجود' });
        }

        await prisma.notifications.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return res.status(200).json({ success: true, message: 'تم تعليم الإشعار كمقروء' });
    } catch (error) {
        console.error('[Notifications] خطأ في تحديث الإشعار:', error);
        return res.status(500).json({ success: false, error: 'خطأ في تحديث الإشعار' });
    }
}

// حذف إشعار
async function handleDelete(notificationId: string, userId: string, res: NextApiResponse) {
    try {
        const notification = await prisma.notifications.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });

        if (!notification) {
            // الإشعار غير موجود أو تم حذفه مسبقاً - نعتبره نجاحاً
            return res.status(200).json({ success: true, message: 'الإشعار غير موجود أو تم حذفه' });
        }

        await prisma.notifications.delete({
            where: { id: notificationId },
        });

        console.log('[Notifications] تم حذف الإشعار:', notificationId);
        return res.status(200).json({ success: true, message: 'تم حذف الإشعار' });
    } catch (error) {
        console.error('[Notifications] خطأ في حذف الإشعار:', error);
        return res.status(500).json({ success: false, error: 'خطأ في حذف الإشعار' });
    }
}
