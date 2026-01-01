// CSRF Protection - Server-side utilities
import { NextApiRequest } from 'next';
import crypto from 'crypto';

export const TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds

// In-memory store for CSRF tokens (use KeyDB/Redis in production)
const tokenStore = new Map<string, { token: string; expiresAt: number }>();

/**
 * توليد CSRF Token عشوائي
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * حفظ CSRF Token
 */
export function storeCSRFToken(sessionId: string, token: string): void {
  tokenStore.set(sessionId, {
    token,
    expiresAt: Date.now() + TOKEN_EXPIRY,
  });

  // تنظيف التوكنات المنتهية بشكل دوري
  cleanupExpiredTokens();
}

/**
 * التحقق من CSRF Token
 */
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = tokenStore.get(sessionId);

  if (!stored) {
    return false;
  }

  if (Date.now() > stored.expiresAt) {
    tokenStore.delete(sessionId);
    return false;
  }

  return stored.token === token;
}

/**
 * حذف CSRF Token
 */
export function deleteCSRFToken(sessionId: string): void {
  tokenStore.delete(sessionId);
}

/**
 * الحصول على Session ID من Request
 */
export function getSessionId(req: NextApiRequest): string {
  // محاولة الحصول على Session ID من الكوكيز
  const cookies = req.headers.cookie;
  if (cookies) {
    const sessionMatch = cookies.match(/csrf_session=([^;]+)/);
    if (sessionMatch) {
      return sessionMatch[1];
    }
  }

  // إنشاء Session ID جديد إذا لم يوجد
  return generateSessionId();
}

/**
 * توليد Session ID جديد
 */
function generateSessionId(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * تنظيف التوكنات المنتهية
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, data] of tokenStore.entries()) {
    if (now > data.expiresAt) {
      tokenStore.delete(sessionId);
    }
  }
}

// تنظيف دوري كل 10 دقائق
setInterval(cleanupExpiredTokens, 600000);

/**
 * CSRF Middleware للتحقق من التوكن في الطلبات
 */
export function csrfMiddleware(req: NextApiRequest): {
  valid: boolean;
  error?: string;
} {
  // الحصول على التوكن من الـ header
  const token = req.headers['x-csrf-token'];

  if (!token || typeof token !== 'string') {
    return {
      valid: false,
      error: 'CSRF token is missing',
    };
  }

  // الحصول على Session ID
  const sessionId = getSessionId(req);

  // التحقق من التوكن
  const isValid = verifyCSRFToken(sessionId, token);

  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid or expired CSRF token',
    };
  }

  return {
    valid: true,
  };
}
