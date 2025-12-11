import { verifyToken } from '@/lib/auth/jwtUtils';
import { prisma } from '@/lib/prisma';
import { CursorPaginationHelper } from '@/utils/pagination-helpers';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // التحقق من المصادقة باستخدام JWT
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'غير مصرح - سجل الدخول أولاً' });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, error: 'توكن غير صالح' });
    }

    const { cursor, pageSize = '30', type, unreadOnly } = req.query;

    // بناء where clause
    const where: any = {
      userId: decoded.userId,
    };

    if (type && typeof type === 'string') {
      where.type = type;
    }

    if (unreadOnly === 'true') {
      where.read = false;
    }

    // استخدام cursor-based pagination
    const result = await CursorPaginationHelper.query(
      prisma.notification,
      cursor ? (cursor as string) : null,
      parseInt(pageSize as string),
      where,
      { createdAt: 'desc' },
    );

    // حساب عدد الإشعارات غير المقروءة
    const unreadCount = await prisma.notifications.count({
      where: {
        userId: decoded.userId,
        read: false,
      },
    });

    return res.status(200).json({
      success: true,
      data: result.data,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching paginated notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في جلب الإشعارات',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
