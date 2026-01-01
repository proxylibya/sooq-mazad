import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'الطريقة غير مسموحة',
    });
  }

  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف وكلمة المرور مطلوبان',
      });
    }

    // تنسيق رقم الهاتف
    let normalizedPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (normalizedPhone.startsWith('00218')) {
      normalizedPhone = '+218' + normalizedPhone.slice(5);
    } else if (normalizedPhone.startsWith('218')) {
      normalizedPhone = '+' + normalizedPhone;
    } else if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '+218' + normalizedPhone.slice(1);
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+218' + normalizedPhone;
    }

    // البحث عن المستخدم
    const phoneFormats = [
      normalizedPhone,
      normalizedPhone.replace('+218', '0'),
      normalizedPhone.replace('+218', ''),
      phone
    ];

    const user = await prisma.users.findFirst({
      where: {
        OR: phoneFormats.map(p => ({ phone: p }))
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'رقم الهاتف غير مسجل',
      });
    }

    // البحث عن كلمة المرور
    const userPassword = await prisma.user_passwords.findFirst({
      where: { userId: user.id }
    });

    if (!userPassword) {
      return res.status(401).json({
        success: false,
        error: 'لم يتم تعيين كلمة مرور لهذا الحساب',
      });
    }

    // التحقق من كلمة المرور
    const isValid = await bcrypt.compare(password, userPassword.hashedPassword);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'كلمة المرور غير صحيحة',
      });
    }

    // إنشاء التوكن
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // تحديث آخر تسجيل دخول
    await prisma.users.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // حفظ الـ token في cookie للـ middleware
    const isSecureCookie = process.env.SESSION_COOKIE_SECURE === 'true';
    const maxAge = 60 * 60 * 24 * 7; // 7 أيام بالثواني
    const expires = new Date(Date.now() + maxAge * 1000).toUTCString();

    const cookieValue = [
      `token=${encodeURIComponent(token)}`,
      `Max-Age=${maxAge}`,
      `Expires=${expires}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      isSecureCookie ? 'Secure' : '',
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookieValue);

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          verified: user.verified,
          accountType: user.accountType,
        },
        token,
      },
    });
  } catch (error) {
    console.error('[خطأ] في تسجيل الدخول:', error);

    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم',
    });
  }
}
