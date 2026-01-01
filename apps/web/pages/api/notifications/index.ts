import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, error: 'طريقة غير مدعومة' });
    }
  } catch (error) {
    console.error('خطأ في API الإشعارات:', error);
    return res.status(500).json({ success: false, error: 'خطأ في الخادم' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { userId, limit = '20', unreadOnly = 'false' } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ success: false, error: 'معرف المستخدم مطلوب' });
  }

  const take = Number(limit) || 20;
  const onlyUnread = String(unreadOnly) === 'true';

  try {
    const where: any = { userId };
    if (onlyUnread) where.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notifications.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
      }),
      prisma.notifications.count({ where: { userId, isRead: false } }),
    ]);

    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error);
    return res.status(500).json({ success: false, error: 'خطأ في جلب الإشعارات' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { notificationId, userId, markAll = false } = req.body || {};

  try {
    if (markAll) {
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ success: false, error: 'معرف المستخدم مطلوب' });
      }

      const result = await prisma.notifications.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });

      return res.status(200).json({ success: true, updated: result.count });
    }

    if (!notificationId || typeof notificationId !== 'string') {
      return res.status(400).json({ success: false, error: 'معرف الإشعار مطلوب' });
    }

    await prisma.notifications.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('خطأ في تحديث الإشعار:', error);
    return res.status(500).json({ success: false, error: 'خطأ في تحديث الإشعار' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { notificationId, userId, deleteAll = false } = req.body || {};

  try {
    if (deleteAll) {
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ success: false, error: 'معرف المستخدم مطلوب' });
      }

      const result = await prisma.notifications.deleteMany({
        where: { userId },
      });

      return res.status(200).json({ success: true, deleted: result.count });
    }

    if (!notificationId || typeof notificationId !== 'string') {
      return res.status(400).json({ success: false, error: 'معرف الإشعار مطلوب' });
    }

    await prisma.notifications.delete({
      where: { id: notificationId },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('خطأ في حذف الإشعار:', error);
    return res.status(500).json({ success: false, error: 'خطأ في حذف الإشعار' });
  }
}
