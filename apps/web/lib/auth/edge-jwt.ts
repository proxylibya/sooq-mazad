/**
 * 🔐 Edge-Compatible JWT System
 * نظام JWT متوافق مع Edge Runtime
 * يستخدم jose بدلاً من jsonwebtoken
 */

import { jwtVerify, SignJWT } from 'jose';

// =====================================
// Configuration
// =====================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'sooq_mazad_admin_jwt_secret_2024_unified';

// تحويل السر إلى Uint8Array للاستخدام مع jose
const getSecretKey = (secret: string) => new TextEncoder().encode(secret);

// =====================================
// Types
// =====================================

export interface UserPayload {
    userId: string;
    phone?: string;
    role?: string;
    accountType?: string;
    iat?: number;
    exp?: number;
}

export interface AdminPayload {
    id: string;
    username?: string;
    role?: string;
    iat?: number;
    exp?: number;
}

// =====================================
// User JWT Functions
// =====================================

/**
 * إنشاء JWT token للمستخدم
 */
export async function createUserToken(payload: Omit<UserPayload, 'iat' | 'exp'>): Promise<string> {
    const token = await new SignJWT(payload as any)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getSecretKey(JWT_SECRET));

    return token;
}

/**
 * التحقق من JWT token للمستخدم
 */
export async function verifyUserToken(token: string): Promise<UserPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecretKey(JWT_SECRET));
        return payload as unknown as UserPayload;
    } catch (error) {
        // Token invalid or expired
        return null;
    }
}

// =====================================
// Admin JWT Functions
// =====================================

/**
 * إنشاء JWT token للمدير
 */
export async function createAdminToken(payload: Omit<AdminPayload, 'iat' | 'exp'>): Promise<string> {
    const token = await new SignJWT(payload as any)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(getSecretKey(ADMIN_JWT_SECRET));

    return token;
}

/**
 * التحقق من JWT token للمدير
 */
export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecretKey(ADMIN_JWT_SECRET));
        return payload as unknown as AdminPayload;
    } catch (error) {
        // Token invalid or expired
        return null;
    }
}

// =====================================
// Cookie Names
// =====================================

export const COOKIE_NAMES = {
    USER_TOKEN: 'token',
    USER_TOKEN_ALT: ['user_token', 'auth_token'],
    ADMIN_TOKEN: 'admin_session',
} as const;

// =====================================
// Helper Functions
// =====================================

/**
 * استخراج token من الـ cookies
 */
export function extractUserToken(cookies: { get: (name: string) => { value: string; } | undefined; }): string | null {
    // Try main cookie name first
    let token = cookies.get(COOKIE_NAMES.USER_TOKEN)?.value;

    // Try alternative names
    if (!token) {
        for (const altName of COOKIE_NAMES.USER_TOKEN_ALT) {
            token = cookies.get(altName)?.value;
            if (token) break;
        }
    }

    return token || null;
}

/**
 * استخراج admin token من الـ cookies
 */
export function extractAdminToken(cookies: { get: (name: string) => { value: string; } | undefined; }): string | null {
    return cookies.get(COOKIE_NAMES.ADMIN_TOKEN)?.value || null;
}

/**
 * إنشاء cookie string للـ token
 */
export function createTokenCookie(token: string, isProduction: boolean = false): string {
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const expires = new Date(Date.now() + maxAge * 1000).toUTCString();

    const parts = [
        `${COOKIE_NAMES.USER_TOKEN}=${encodeURIComponent(token)}`,
        `Max-Age=${maxAge}`,
        `Expires=${expires}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
    ];

    if (isProduction) {
        parts.push('Secure');
    }

    return parts.join('; ');
}

/**
 * إنشاء cookie string لمسح الـ token
 */
export function createClearTokenCookie(): string[] {
    const cookiesToClear = [COOKIE_NAMES.USER_TOKEN, ...COOKIE_NAMES.USER_TOKEN_ALT, COOKIE_NAMES.ADMIN_TOKEN];

    return cookiesToClear.map(name => [
        `${name}=`,
        'Max-Age=0',
        'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
    ].join('; '));
}
