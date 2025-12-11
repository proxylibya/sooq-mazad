import jwt from 'jsonwebtoken';
import type { NextApiRequest } from 'next';
import { User, TokenPayload } from './authUtils';

/**
 * إنشاء JWT token - يعمل فقط في بيئة الخادم
 */
export function createAuthToken(user: User, rememberMe: boolean = false): string {
  const payload: TokenPayload = {
    userId: user.id,
    phone: user.phone,
    role: user.role,
    accountType: user.accountType,
  };

  const expiresIn = rememberMe ? '30d' : '24h';

  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn,
  });
}

/**
 * التحقق من صحة JWT token - يعمل فقط في بيئة الخادم
 */
export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    ) as TokenPayload;

    return decoded;
  } catch (error) {
    console.error('خطأ في التحقق من الرمز المميز:', error);
    return null;
  }
}

/**
 * التحقق من انتهاء صلاحية الرمز المميز - يعمل فقط في بيئة الخادم
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;

    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
}

/**
 * الحصول على وقت انتهاء الرمز المميز - يعمل فقط في بيئة الخادم
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
}

/**
 * استخراج معرف المستخدم من الطلب - من headers أو cookies
 */
export function getUserIdFromRequest(req: NextApiRequest): string | null {
  try {
    // 1. البحث في Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAuthToken(token);
      if (decoded) {
        return decoded.userId;
      }
    }

    // 2. البحث في cookies
    const cookieToken = req.cookies.token || req.cookies.auth_token;
    if (cookieToken) {
      const decoded = verifyAuthToken(cookieToken);
      if (decoded) {
        return decoded.userId;
      }
    }

    // 3. البحث في req.body إذا كان موجوداً
    if (req.body && req.body.userId) {
      return req.body.userId;
    }

    return null;
  } catch (error) {
    console.error('خطأ في استخراج معرف المستخدم:', error);
    return null;
  }
}
