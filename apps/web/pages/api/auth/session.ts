import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface SessionResponse {
  user: {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    role?: string;
    status?: string;
  } | null;
  authenticated: boolean;
}

// دالة مساعدة لتحليل الكوكيز
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });
  return cookies;
}

// API للتحقق من جلسة المستخدم
export default async function handler(req: NextApiRequest, res: NextApiResponse<SessionResponse | { error: string; }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // محاولة الحصول على token من cookies أو headers
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies['auth-token'] || cookies['token'] || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // لا يوجد token - المستخدم غير مسجل الدخول (وهذا طبيعي)
      return res.status(200).json({
        user: null,
        authenticated: false
      });
    }

    // التحقق من صحة الـ token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId?: string;
      id?: string;
      name?: string;
      phone?: string;
      email?: string;
      role?: string;
      status?: string;
    };

    // إرجاع بيانات المستخدم
    return res.status(200).json({
      user: {
        id: decoded.userId || decoded.id || '',
        name: decoded.name,
        phone: decoded.phone,
        email: decoded.email,
        role: decoded.role || 'USER',
        status: decoded.status || 'ACTIVE'
      },
      authenticated: true
    });

  } catch (error) {
    // Token غير صالح أو منتهي الصلاحية
    console.log('[Session API] Token verification failed:', error instanceof Error ? error.message : 'Unknown error');

    return res.status(200).json({
      user: null,
      authenticated: false
    });
  }
}
