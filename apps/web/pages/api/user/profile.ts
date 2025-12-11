import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../middleware/auth';

interface ProfileResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProfileResponse>) {
  // دعم GET لجلب البيانات و POST/PUT لتحديثها
  if (req.method === 'GET') {
    try {
      // التحقق من المصادقة
      const user = await verifyToken(req);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'غير مصرح لك بالوصول',
        });
      }

      // إرجاع بيانات المستخدم
      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          accountType: user.accountType,
          verified: user.verified,
          status: user.status,
          profileImage: user.profileImage,
          city: user.city,
          bio: user.bio,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
      return res.status(500).json({
        success: false,
        error: 'خطأ في الخادم',
      });
    }
  }

  // دعم PUT و POST للتحديث
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET, POST or PUT',
    });
  }

  try {
    // التحقق من المصادقة للتحديث
    const user = await verifyToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'غير مصرح لك بالوصول',
      });
    }

    const body = req.body;

    // دعم التحديث الكامل (PUT) أو تحديث حقل واحد (POST)
    let updateData: any = {};

    if (body.field && body.value !== undefined) {
      // الطريقة القديمة - تحديث حقل واحد
      const allowedFields = ['name', 'email', 'phone', 'city', 'bio'];
      if (!allowedFields.includes(body.field)) {
        return res.status(400).json({
          success: false,
          message: 'هذا الحقل غير قابل للتعديل',
        });
      }
      updateData[body.field] = body.value;
    } else {
      // الطريقة الجديدة - تحديث كامل
      const allowedFields = ['name', 'email', 'phone', 'city', 'bio'];
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لا توجد بيانات للتحديث',
      });
    }

    // التحقق من صحة البيانات حسب نوع الحقل
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني غير صحيح',
        });
      }
    }

    if (updateData.phone) {
      // دعم جميع أنواع الأرقام الليبية (90-99)
      const cleanPhone = updateData.phone.replace(/[\s\-\(\)]/g, '');

      // التحقق من صيغ الأرقام الليبية المختلفة
      const isValidLibyanPhone =
        /^09[0-9]{8}$/.test(cleanPhone) ||      // 0912345678, 0923456789
        /^9[0-9]{8}$/.test(cleanPhone) ||       // 912345678, 923456789
        /^\+?2189[0-9]{8}$/.test(cleanPhone) || // +218912345678, 218912345678
        /^\+?21809[0-9]{8}$/.test(cleanPhone);  // +2180912345678

      // قبول الأرقام الدولية العامة كـ fallback
      const isInternational = /^\+?[1-9]\d{6,14}$/.test(cleanPhone);

      if (!isValidLibyanPhone && !isInternational) {
        return res.status(400).json({
          success: false,
          message: 'يرجى إدخال رقم هاتف صحيح (مثال: 0912345678 أو 0924444444)',
        });
      }
    }

    // تحديث قاعدة البيانات
    try {
      const updatedUser = await prisma.users.update({
        where: { id: user.id },
        data: updateData,
      });

      return res.status(200).json({
        success: true,
        message: 'تم تحديث البيانات بنجاح',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          phone: updatedUser.phone,
          email: updatedUser.email,
          city: updatedUser.city,
          bio: updatedUser.bio,
          profileImage: updatedUser.profileImage,
        },
      });
    } catch (dbError) {
      console.error('خطأ في تحديث قاعدة البيانات:', dbError);
      return res.status(500).json({
        success: false,
        error: 'خطأ في تحديث البيانات',
      });
    }
  } catch (error) {
    console.error('خطأ في تحديث بيانات المستخدم:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}
