/**
 * API Stream للإشعارات الفورية (Server-Sent Events)
 *
 * يرسل الإشعارات الجديدة فور حدوثها بدون الحاجة للتحديث
 *
 * @version 1.0.0
 * @date 2025-01-22
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwtUtils';

// تخزين الاتصالات النشطة
const activeConnections = new Map<string, NextApiResponse>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // التحقق من المصادقة
  let userId: string;
  try {
    const token =
      req.headers.authorization?.replace('Bearer ', '') ||
      req.cookies.token ||
      (req.query.token as string);

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - No token' });
    }

    const decoded = verifyUserToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    userId = (decoded as any).sub || (decoded as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - Invalid payload' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }

  // إعداد SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // لـ Nginx

  console.log(`[SSE] [متصل] اتصال جديد من المستخدم: ${userId}`);

  // إضافة الاتصال للقائمة النشطة
  activeConnections.set(userId, res);

  // إرسال رسالة ترحيب
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

  // جلب الإشعارات الأخيرة (آخر دقيقة)
  const lastMinute = new Date(Date.now() - 60000);

  try {
    const recentNotifications = await prisma.notifications.findMany({
      where: {
        userId,
        createdAt: { gte: lastMinute },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (recentNotifications.length > 0) {
      res.write(
        `data: ${JSON.stringify({
          type: 'initial',
          notifications: recentNotifications,
        })}\n\n`,
      );
    }
  } catch (error) {
    console.error('[SSE] خطأ في جلب الإشعارات الأولية:', error);
  }

  // مراقبة الإشعارات الجديدة كل 5 ثوان
  const checkInterval = setInterval(async () => {
    try {
      // جلب الإشعارات الجديدة منذ آخر فحص
      const newNotifications = await prisma.notifications.findMany({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 6000) }, // آخر 6 ثوان
        },
        orderBy: { createdAt: 'desc' },
      });

      if (newNotifications.length > 0) {
        const eventData = JSON.stringify({
          type: 'new',
          notifications: newNotifications,
          count: newNotifications.length,
        });

        res.write(`data: ${eventData}\n\n`);
        console.log(
          `[SSE] [إرسال] إرسال ${newNotifications.length} إشعار جديد للمستخدم: ${userId}`,
        );
      }

      // إرسال heartbeat للحفاظ على الاتصال
      res.write(`: heartbeat\n\n`);
    } catch (error) {
      console.error('[SSE] خطأ في فحص الإشعارات:', error);
    }
  }, 5000);

  // التنظيف عند إغلاق الاتصال
  req.on('close', () => {
    console.log(`[SSE] [مقطوع] قطع الاتصال للمستخدم: ${userId}`);
    clearInterval(checkInterval);
    activeConnections.delete(userId);
    res.end();
  });
}

/**
 * دالة مساعدة لإرسال إشعار فوري لمستخدم معين
 */
export function sendImmediateNotification(userId: string, notification: any): void {
  const connection = activeConnections.get(userId);
  if (connection) {
    try {
      connection.write(
        `data: ${JSON.stringify({
          type: 'push',
          notification,
        })}\n\n`,
      );
      console.log(`[SSE] [فوري] إرسال إشعار فوري للمستخدم: ${userId}`);
    } catch (error) {
      console.error('[SSE] خطأ في إرسال إشعار فوري:', error);
      activeConnections.delete(userId);
    }
  }
}

/**
 * دالة مساعدة لإرسال إشعار لجميع المستخدمين المتصلين
 */
export function broadcastNotification(notification: any): void {
  let sentCount = 0;
  activeConnections.forEach((connection, userId) => {
    try {
      connection.write(
        `data: ${JSON.stringify({
          type: 'broadcast',
          notification,
        })}\n\n`,
      );
      sentCount++;
    } catch (error) {
      console.error(`[SSE] خطأ في البث للمستخدم ${userId}:`, error);
      activeConnections.delete(userId);
    }
  });
  console.log(`[SSE] [بث] بث إشعار لـ ${sentCount} مستخدم`);
}

// منع timeout في Vercel
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
    responseLimit: false,
  },
};
