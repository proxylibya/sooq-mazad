import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { PhoneSystem } from '../../../utils/phone-system';

// prisma imported from @/lib/prisma

interface ResetPasswordRequest {
  phone: string;
  token: string;
  password: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    passwordReset: boolean;
    user: {
      id: string;
      name: string;
      phone: string;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResetPasswordResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'الطريقة غير مسموحة',
    });
  }

  try {
    const { phone, token, password }: ResetPasswordRequest = req.body;

    // التحقق من البيانات المطلوبة
    if (!phone || !token || !password) {
      return res.status(400).json({
        success: false,
        error: 'جميع البيانات مطلوبة',
      });
    }

    // معالجة رقم الهاتف - النظام الموحد
    const phoneValidation = PhoneSystem.validate(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: phoneValidation.error || 'رقم الهاتف غير صحيح',
      });
    }

    const normalizedPhone = phoneValidation.normalizedPhone;

    // التحقق من قوة كلمة المرور (نظام موحد)
    const { quickPasswordCheck } = await import('../../../utils/passwordValidation');
    const passwordError = quickPasswordCheck(password, 6);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        error: passwordError,
      });
    }

    // التحقق من صحة الرمز المميز
    let decodedToken: { type: string; phone: string; timestamp: number; };
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as {
        type: string;
        phone: string;
        timestamp: number;
      };
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'رمز التحقق منتهي الصلاحية أو غير صحيح',
      });
    }

    // التحقق من أن الرمز المميز مخصص لإعادة تعيين كلمة المرور
    if (decodedToken.type !== 'password_reset' || decodedToken.phone !== normalizedPhone) {
      return res.status(401).json({
        success: false,
        error: 'رمز التحقق غير صحيح',
      });
    }

    // التحقق من أن الرمز المميز لم يمر عليه أكثر من 15 دقيقة
    const tokenAge = Date.now() - decodedToken.timestamp;
    if (tokenAge > 15 * 60 * 1000) {
      // 15 دقيقة
      return res.status(401).json({
        success: false,
        error: 'رمز التحقق منتهي الصلاحية',
      });
    }

    // البحث عن المستخدم - بجميع التنسيقات
    const searchFormats = PhoneSystem.getSearchFormats(phone);
    let user = null;

    for (const format of searchFormats) {
      user = await prisma.users.findFirst({
        where: { phone: format },
        include: { user_passwords: true },
      });
      if (user) break;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(password, 12);

    // تحديث كلمة المرور
    if (user.user_passwords) {
      // تحديث كلمة المرور الموجودة
      await prisma.user_passwords.update({
        where: { userId: user.id },
        data: { hashedPassword: hashedPassword },
      });
    } else {
      // إنشاء كلمة مرور جديدة (في حالة عدم وجودها)
      await prisma.user_passwords.create({
        data: {
          id: `pwd_${Date.now()}`,
          userId: user.id,
          hashedPassword: hashedPassword,
        },
      });
    }

    // تحديث تاريخ آخر تعديل للمستخدم
    await prisma.users.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    // إلغاء جميع رموز إعادة تعيين كلمة المرور للمستخدم
    await prisma.verification_codes.updateMany({
      where: {
        phone: normalizedPhone,
        type: 'PASSWORD_RESET',
        used: false,
      },
      data: { used: true },
    });

    console.log(`🔐 تم إعادة تعيين كلمة المرور للمستخدم: ${user.name} (${normalizedPhone})`);

    return res.status(200).json({
      success: true,
      message: 'تم إعادة تعيين كلمة المرور بنجاح',
      data: {
        passwordReset: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error('خطأ في إعادة تعيين كلمة المرور:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ داخلي في الخادم',
    });
  }
}
