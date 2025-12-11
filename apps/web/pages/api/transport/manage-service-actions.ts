import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { isTransportOwner } from '../../../utils/accountTypeUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // إضافة headers للـ CORS
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // التحقق من التوثيق
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'رمز المصادقة مطلوب',
      });
    }

    let decoded: JwtPayload & { userId?: string; id?: string; };
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      decoded = jwt.verify(token, secret) as JwtPayload & { userId?: string; id?: string; };
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'رمز المصادقة غير صحيح',
      });
    }

    // التحقق من نوع الحساب
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: { id: true, accountType: true, name: true },
    });

    if (!user || !isTransportOwner(user.accountType)) {
      return res.status(403).json({
        success: false,
        error: 'هذه الخدمة متاحة فقط لحسابات خدمات النقل',
      });
    }

    const { action, serviceId } = req.body;

    console.log('تم استلام طلب:', {
      action,
      serviceId,
      userId: decoded.userId,
    });

    if (!action || !serviceId) {
      return res.status(400).json({
        success: false,
        error: 'معرف الخدمة والإجراء مطلوبان',
      });
    }

    // التحقق من ملكية الخدمة
    const existingService = await prisma.transport_services.findFirst({
      where: {
        id: serviceId,
        userId: decoded.userId,
      },
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'الخدمة غير موجودة أو ليس لديك صلاحية للوصول إليها',
      });
    }

    let result;
    let message = '';

    switch (action) {
      case 'delete':
        // حذف الخدمة

        await prisma.transport_services.delete({
          where: { id: serviceId },
        });
        message = 'تم حذف الخدمة بنجاح';
        result = { deleted: true };

        break;

      case 'pause':
        // إيقاف الخدمة مؤقتاً

        result = await prisma.transport_services.update({
          where: { id: serviceId },
          data: {
            status: 'PAUSED',
            updatedAt: new Date(),
          },
          include: {
            users: {
              select: {
                id: true,
                name: true,
                phone: true,
                verified: true,
                profileImage: true,
                accountType: true,
              },
            },
          },
        });
        message = 'تم إيقاف الخدمة مؤقتاً';

        break;

      case 'activate':
        // تفعيل الخدمة

        result = await prisma.transport_services.update({
          where: { id: serviceId },
          data: {
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
          include: {
            users: {
              select: {
                id: true,
                name: true,
                phone: true,
                verified: true,
                profileImage: true,
                accountType: true,
              },
            },
          },
        });
        message = 'تم تفعيل الخدمة بنجاح';

        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'إجراء غير صحيح',
        });
    }

    return res.status(200).json({
      success: true,
      message,
      data: result,
    });
  } catch (error) {
    console.error('خطأ في إدارة الخدمة:', error);

    // التأكد من إرجاع JSON صحيح
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  } finally {
    // نستخدم Prisma Singleton من lib/prisma، لذلك لا نغلق الاتصال هنا
  }
}
