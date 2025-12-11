import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { PhoneSystem } from '../../../utils/phone-system';

// prisma imported from @/lib/prisma

interface ResendCodeRequest {
  phone: string;
  type: 'registration' | 'password_reset';
}

interface ResendCodeResponse {
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
  res: NextApiResponse<ResendCodeResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { phone, type }: ResendCodeRequest = req.body;

    // التحقق من البيانات المطلوبة
    if (!phone || !type) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف ونوع الطلب مطلوبان',
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

    if (type === 'registration' && !user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود. يرجى إعادة التسجيل.',
      });
    }

    if (type === 'password_reset' && !user) {
      return res.status(404).json({
        success: false,
        error: 'رقم الهاتف غير مسجل',
      });
    }

    // لا حاجة للتحقق من الرموز السابقة - النظام مبسط الآن

    // إنشاء رمز تحقق جديد (للعرض في الكونسول فقط)
    const verificationCode = generateVerificationCode();

    // عرض رمز التحقق الجديد في الكونسول (بدلاً من إرسال SMS)
    if (type === 'registration') {
      console.log(`📱 رمز التحقق الجديد (تسجيل) لـ ${normalizedPhone}: ${verificationCode}`);
    } else {
      console.log(
        `📱 رمز إعادة تعيين كلمة المرور الجديد لـ ${normalizedPhone}: ${verificationCode}`,
      );
    }

    return res.status(200).json({
      success: true,
      message: 'تم إرسال رمز التحقق الجديد بنجاح',
      data: {
        phone: normalizedPhone,
        codeSent: true,
        expiresIn: 600, // 10 دقائق بالثواني
      },
    });
  } catch (error) {
    console.error('خطأ في إعادة إرسال رمز التحقق:', error);
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
