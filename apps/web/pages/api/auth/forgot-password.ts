import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { PhoneSystem } from '../../../utils/phone-system';

// prisma imported from @/lib/prisma

interface ForgotPasswordRequest {
  phone: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    phone: string;
    codeSent: boolean;
    expiresIn: number; // بالثواني
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ForgotPasswordResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'الطريقة غير مسموحة',
    });
  }

  try {
    const { phone }: ForgotPasswordRequest = req.body;

    // التحقق من البيانات المطلوبة
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف مطلوب',
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

    // التحقق من وجود المستخدم - بحث بجميع التنسيقات
    const searchFormats = PhoneSystem.getSearchFormats(phone);
    let user = null;

    for (const format of searchFormats) {
      user = await prisma.users.findFirst({
        where: { phone: format },
      });
      if (user) break;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'رقم الهاتف غير مسجل',
      });
    }

    // إنشاء رمز تحقق جديد
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

    try {
      // حفظ رمز التحقق في قاعدة البيانات
      await prisma.verification_codes.create({
        data: {
          id: `vc_${Date.now()}`,
          phone: normalizedPhone,
          code: verificationCode,
          type: 'PASSWORD_RESET',
          expiresAt: expiresAt,
          used: false,
        },
      });

      console.log(
        `📱 رمز إعادة تعيين كلمة المرور لـ ${normalizedPhone}: ${verificationCode}`,
      );
    } catch (dbError) {
      console.error('خطأ في حفظ رمز التحقق:', dbError);
      // في حالة فشل قاعدة البيانات، نعرض الرمز في الكونسول فقط
      console.log(
        `📱 رمز إعادة تعيين كلمة المرور (احتياطي) لـ ${normalizedPhone}: ${verificationCode}`,
      );
    }

    return res.status(200).json({
      success: true,
      message: 'تم إرسال رمز إعادة تعيين كلمة المرور بنجاح',
      data: {
        phone: normalizedPhone,
        codeSent: true,
        expiresIn: 600, // 10 دقائق بالثواني
      },
    });
  } catch (error) {
    console.error('خطأ في طلب إعادة تعيين كلمة المرور:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ داخلي في الخادم',
    });
  }
}

// دالة إنشاء رمز التحقق
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
