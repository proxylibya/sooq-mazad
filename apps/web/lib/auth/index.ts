/**
 * 🔐 نظام المصادقة الموحد
 * Unified Authentication System
 */

import jwt from 'jsonwebtoken';

// Re-export from unified auth system
export * from './unified-auth-system';

export interface VerifiedUser {
  userId: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
}

// ⚠️ يجب أن يتطابق مع الـ secret المستخدم في login.ts
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * التحقق من صلاحية التوكن
 */
export function verifyToken(token?: string): VerifiedUser | null {
  if (!token) return null;

  // استخدام نفس الـ secret الموحد
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload | string;
    if (typeof decoded === 'object' && decoded && 'userId' in decoded) {
      const payload = decoded as jwt.JwtPayload & { userId?: string; email?: string; name?: string; phone?: string; role?: string; };
      if (payload.userId) {
        return {
          userId: payload.userId,
          email: payload.email,
          name: payload.name,
          phone: payload.phone,
          role: payload.role
        };
      }
    }
    return null;
  } catch (error) {
    console.error('❌ [verifyToken] فشل التحقق من التوكن:', error instanceof Error ? error.message : 'خطأ غير معروف');
    return null;
  }
}

/**
 * التحقق من JWT
 */
export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * التحقق من توكن المستخدم
 */
export function verifyUserToken(token: string): VerifiedUser | null {
  return verifyToken(token);
}

/**
 * إنشاء توكن جديد
 */
export function createToken(payload: object, expiresIn: string | number = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

/**
 * التحقق من المصادقة
 */
export async function checkAuth(token?: string): Promise<VerifiedUser | null> {
  return verifyToken(token);
}

/**
 * التحقق من المصادقة (alias)
 */
export const verifyAuth = checkAuth;
