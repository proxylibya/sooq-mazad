import type { NextApiRequest, NextApiResponse } from 'next';
import { generateCSRFToken, storeCSRFToken, getSessionId, TOKEN_EXPIRY } from '../../lib/csrf';

/**
 * API Endpoint لإنشاء وإرجاع CSRF Token
 * GET /api/csrf-token
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // الحصول على Session ID أو إنشاء واحد جديد
    const sessionId = getSessionId(req);

    // إنشاء CSRF Token
    const token = generateCSRFToken();

    // حفظ Token مع Session ID
    storeCSRFToken(sessionId, token);

    // حساب تاريخ انتهاء الصلاحية
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY);

    // إعداد Cookie للـ Session ID
    const cookieParts = [
      `csrf_session=${sessionId}`,
      'Path=/',
      `Max-Age=${TOKEN_EXPIRY / 1000}`, // تحويل من milliseconds إلى seconds
      'HttpOnly',
      'SameSite=Lax',
    ];

    if (process.env.NODE_ENV === 'production') {
      cookieParts.push('Secure');
    }

    res.setHeader('Set-Cookie', cookieParts.join('; '));

    // إرجاع Token والتاريخ
    return res.status(200).json({
      token,
      expires: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate CSRF token',
    });
  }
}
