import { NextApiRequest, NextApiResponse } from 'next';

interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const SECURE_COOKIE_ENABLED = process.env.SESSION_COOKIE_SECURE === 'true';

/**
 * مسح جميع كوكيز الجلسة
 */
function clearAllSessionCookies(res: NextApiResponse): void {

  // مسح جميع الكوكيز المحتملة
  const cookiesToClear = [
    'token',
    'user_token',
    'auth_token',
    'user_access_token',
    'user_refresh_token',
    'admin_session',
  ];

  const cookies = cookiesToClear.map(name => {
    const parts = [
      `${name}=`,
      'Max-Age=0',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
    ];
    if (SECURE_COOKIE_ENABLED) parts.push('Secure');
    return parts.join('; ');
  });

  res.setHeader('Set-Cookie', cookies);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LogoutResponse>) {
  // إعداد headers للترميز العربي
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Accept-Charset', 'utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'الطريقة غير مسموحة',
    });
  }

  try {
    // الحصول على التوكن من الهيدر
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (token) {
      // التحقق من صحة التوكن
      const user = verifyToken(token);

      if (user) {
        console.log(`تم تسجيل خروج المستخدم: ${user.id}`);
      }
    }

    // مسح جميع كوكيز الجلسة
    clearAllSessionCookies(res);

    // تسجيل الخروج ناجح دائماً من جهة الخادم
    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح',
    });

  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error);

    // حتى في حالة الخطأ، نحاول مسح الكوكيز ونعتبر تسجيل الخروج ناجحاً
    try { clearAllSessionCookies(res); } catch { }
    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح',
    });
  }
}
