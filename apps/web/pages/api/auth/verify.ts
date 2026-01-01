import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../middleware/auth';

interface VerifyResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
    accountType: string;
    verified: boolean;
    status: string;
  };
  error?: string;
  code?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<VerifyResponse>) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({
      success: false,
      error: `الطريقة ${req.method} غير مدعومة`,
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    // استخراج التوكن من الهيدر أو الكوكيز
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'مطلوب توكن المصادقة',
        code: 'TOKEN_REQUIRED',
      });
    }

    // التحقق من صحة التوكن (عادي أو إداري)
    const user = await verifyToken(req);

    // إذا فشل التحقق، إرجاع خطأ
    // (تم إزالة التحقق الإداري لأن الدوال غير موجودة)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'توكن غير صحيح أو منتهي الصلاحية',
        code: 'INVALID_TOKEN',
      });
    }

    // تم إزالة تسجيل عملية التحقق للمدراء لأن الدالة غير موجودة

    // إرجاع بيانات المستخدم
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        verified: user.verified,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ داخلي في الخادم',
      code: 'INTERNAL_ERROR',
    });
  }
}
