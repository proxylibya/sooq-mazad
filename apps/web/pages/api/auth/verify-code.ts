import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { PhoneSystem } from '../../../utils/phone-system';

// prisma imported from @/lib/prisma

interface VerifyCodeRequest {
  phone: string;
  code: string;
  type: 'password_reset' | 'registration' | 'login';
}

interface VerifyCodeResponse {
  success: boolean;
  message?: string;
  token?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyCodeResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { phone, code, type }: VerifyCodeRequest = req.body;

    // التحقق من البيانات المطلوبة
    if (!phone || !code || !type) {
      return res.status(400).json({
        success: false,
        error: 'البيانات المطلوبة مفقودة',
      });
    }

    // التحقق من صحة رقم الهاتف - النظام الموحد
    const phoneValidation = PhoneSystem.validate(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: phoneValidation.error || 'رقم الهاتف غير صحيح',
      });
    }

    const normalizedPhone = phoneValidation.normalizedPhone;

    console.log(`[البحث] التحقق من الرمز: ${code} للهاتف: ${normalizedPhone} (نوع: ${type})`);

    // التحقق من صحة الرمز (6 أرقام)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: 'رمز التحقق يجب أن يكون 6 أرقام',
      });
    }

    // في بيئة التطوير، نقبل الرمز 123456 لجميع الأرقام
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isTestCode = code === '123456';

    if (isDevelopment && isTestCode) {
      // إنشاء token للتحقق من إعادة تعيين كلمة المرور
      if (type === 'password_reset') {
        const resetToken = jwt.sign(
          {
            phone: normalizedPhone,
            type: 'password_reset',
            timestamp: Date.now(),
          },
          process.env.JWT_SECRET || 'your-secret-key-change-in-production',
          { expiresIn: '15m' },
        );

        return res.status(200).json({
          success: true,
          message: 'تم التحقق بنجاح',
          token: resetToken,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'تم التحقق بنجاح',
      });
    }

    // في بيئة الإنتاج أو للرموز الحقيقية، التحقق من قاعدة البيانات
    try {
      // البحث عن رمز التحقق في قاعدة البيانات - بجميع التنسيقات
      const searchFormats = PhoneSystem.getSearchFormats(phone);
      let verificationRecord = null;

      for (const format of searchFormats) {
        verificationRecord = await prisma.verification_codes.findFirst({
          where: {
            phone: format,
            code: code,
            type: type.toUpperCase(),
            used: false,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        if (verificationRecord) break;
      }

      if (!verificationRecord) {
        return res.status(400).json({
          success: false,
          error: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
        });
      }

      // تحديد الرمز كمستخدم
      await prisma.verification_codes.update({
        where: { id: verificationRecord.id },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });

      // إنشاء token للتحقق من إعادة تعيين كلمة المرور
      if (type === 'password_reset') {
        const resetToken = jwt.sign(
          {
            phone: normalizedPhone,
            type: 'password_reset',
            timestamp: Date.now(),
            verificationId: verificationRecord.id,
          },
          process.env.JWT_SECRET || 'your-secret-key-change-in-production',
          { expiresIn: '15m' },
        );

        return res.status(200).json({
          success: true,
          message: 'تم التحقق بنجاح',
          token: resetToken,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'تم التحقق بنجاح',
      });
    } catch (dbError) {
      console.error('خطأ في قاعدة البيانات:', dbError);

      // في حالة فشل قاعدة البيانات، نستخدم نظام احتياطي
      if (isDevelopment) {
        if (type === 'password_reset') {
          const resetToken = jwt.sign(
            {
              phone: normalizedPhone,
              type: 'password_reset',
              timestamp: Date.now(),
            },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: '15m' },
          );

          return res.status(200).json({
            success: true,
            message: 'تم التحقق بنجاح (نظام احتياطي)',
            token: resetToken,
          });
        }

        return res.status(200).json({
          success: true,
          message: 'تم التحقق بنجاح (نظام احتياطي)',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'خطأ في الخادم',
      });
    }
  } catch (error) {
    console.error('خطأ في التحقق من الرمز:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}
