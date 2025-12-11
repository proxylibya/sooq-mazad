/**
 * نظام المصادقة
 * Auth System
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
    id: string;
    phone: string;
    name?: string;
    role: string;
    status: string;
}

export interface AuthResult {
    success: boolean;
    user?: AuthUser;
    token?: string;
    error?: string;
}

/**
 * إنشاء توكن JWT
 */
export function createToken(user: AuthUser, expiresIn: string = '7d'): string {
    return jwt.sign(
        {
            userId: user.id,
            phone: user.phone,
            role: user.role,
            type: 'user',
        },
        JWT_SECRET,
        { expiresIn }
    );
}

/**
 * التحقق من توكن JWT
 */
export function verifyToken(token: string): AuthUser | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            phone: string;
            role: string;
        };
        return {
            id: decoded.userId,
            phone: decoded.phone,
            role: decoded.role,
            status: 'ACTIVE',
        };
    } catch {
        return null;
    }
}

/**
 * تسجيل الخروج
 */
export async function logout(): Promise<{ success: boolean; }> {
    // في الحقيقة، يتم هذا على جانب العميل بحذف الكوكيز
    return { success: true };
}

export default {
    createToken,
    verifyToken,
    logout,
};
