import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { PhoneSystem } from '../../../utils/phone-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'الطريقة غير مسموحة',
    });
  }

  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف مطلوب',
      });
    }

    // التحقق من صحة رقم الهاتف
    const phoneValidation = PhoneSystem.validate(phone);

    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: phoneValidation.error || 'رقم الهاتف غير صحيح',
      });
    }

    // البحث عن المستخدم في قاعدة البيانات
    const normalizedPhone = phoneValidation.normalizedPhone;
    const phoneFormats = [
      normalizedPhone,
      normalizedPhone.replace('+218', '0'),
      normalizedPhone.replace('+218', ''),
      phone
    ];

    const existingUser = await prisma.users.findFirst({
      where: {
        OR: phoneFormats.map(p => ({ phone: p }))
      },
      select: { id: true, name: true }
    });

    const phoneExists = !!existingUser;

    return res.status(200).json({
      success: true,
      data: {
        phone: normalizedPhone,
        exists: phoneExists,
        message: phoneExists ? 'رقم الهاتف مسجل مسبقاً' : 'رقم الهاتف غير مسجل',
      },
    });
  } catch (error) {
    console.error('[خطأ] في التحقق من رقم الهاتف:', error);

    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم',
    });
  }
}
