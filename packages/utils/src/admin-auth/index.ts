/**
 * @sooq-mazad/utils - Enterprise Admin Authentication System
 * نظام مصادقة إداري موحد بمعايير عالمية
 * 
 * Features:
 * - JWT with RS256/HS256 support
 * - Session management with Redis-ready architecture
 * - Rate limiting ready
 * - Activity logging
 * - Two-factor authentication ready
 * - IP-based security
 */

import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    role: AdminRole;
    avatar?: string | null;
    is_active: boolean;
    two_factor_enabled: boolean;
    last_login?: Date | null;
    created_at: Date;
    permissions?: string[];
}

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT' | 'VIEWER';

export interface AdminSession {
    id: string;
    session_token: string;
    admin_id: string;
    ip_address?: string | null;
    user_agent?: string | null;
    device_fingerprint?: string | null;
    login_at: Date;
    last_activity: Date;
    expires_at: Date;
    is_active: boolean;
}

export interface LoginResult {
    success: boolean;
    admin?: AdminUser;
    token?: string;
    session?: AdminSession;
    error?: string;
    requiresTwoFactor?: boolean;
}

export interface TokenPayload {
    adminId: string;
    email: string;
    role: AdminRole;
    sessionId: string;
    type: 'admin';
    iat: number;
    exp: number;
}

export interface VerifyResult {
    valid: boolean;
    admin?: AdminUser;
    session?: AdminSession;
    error?: string;
}

export interface ActivityLog {
    admin_id: string;
    action: string;
    resource_type?: string;
    resource_id?: string;
    details?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    success: boolean;
    error_message?: string;
}

// ============================================
// CONFIGURATION
// ============================================

export const AUTH_CONFIG = {
    // JWT Settings
    JWT_SECRET: process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'change-this-in-production-min-32-chars!',
    JWT_EXPIRES_IN: '24h',
    JWT_ALGORITHM: 'HS256' as const,

    // Session Settings
    SESSION_DURATION_HOURS: 24,
    SESSION_REFRESH_THRESHOLD_HOURS: 6, // Refresh if less than 6 hours remaining
    MAX_SESSIONS_PER_ADMIN: 5,

    // Security Settings
    BCRYPT_ROUNDS: 12,
    TOKEN_LENGTH: 64,

    // Rate Limiting
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,

    // Cookie Settings
    COOKIE_NAME: 'admin_session',
    COOKIE_HTTP_ONLY: true,
    COOKIE_SECURE: process.env.SESSION_COOKIE_SECURE === 'true',
    COOKIE_SAME_SITE: 'lax' as const,
    COOKIE_PATH: '/',
    COOKIE_MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
} as const;

// ============================================
// PASSWORD UTILITIES
// ============================================

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, AUTH_CONFIG.BCRYPT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// ============================================
// TOKEN UTILITIES
// ============================================

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = AUTH_CONFIG.TOKEN_LENGTH): string {
    return randomBytes(length).toString('hex');
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
    return `sess_${generateSecureToken(32)}`;
}

/**
 * Create a JWT token for admin authentication
 */
export function createAdminToken(admin: AdminUser, sessionId: string): string {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        sessionId,
        type: 'admin',
    };

    return jwt.sign(payload, AUTH_CONFIG.JWT_SECRET, {
        expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN,
        algorithm: AUTH_CONFIG.JWT_ALGORITHM,
    });
}

/**
 * Verify and decode a JWT token
 */
export function verifyAdminToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET, {
            algorithms: [AUTH_CONFIG.JWT_ALGORITHM],
        }) as TokenPayload;

        // Ensure it's an admin token
        if (decoded.type !== 'admin') {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
}

// ============================================
// COOKIE UTILITIES
// ============================================

/**
 * Create cookie header value for setting admin session
 */
export function createSessionCookie(token: string): string {
    const parts = [
        `${AUTH_CONFIG.COOKIE_NAME}=${token}`,
        `Path=${AUTH_CONFIG.COOKIE_PATH}`,
        `Max-Age=${AUTH_CONFIG.COOKIE_MAX_AGE}`,
        `SameSite=${AUTH_CONFIG.COOKIE_SAME_SITE}`,
    ];

    if (AUTH_CONFIG.COOKIE_HTTP_ONLY) {
        parts.push('HttpOnly');
    }

    if (AUTH_CONFIG.COOKIE_SECURE) {
        parts.push('Secure');
    }

    return parts.join('; ');
}

/**
 * Create cookie header value for clearing admin session
 */
export function createClearSessionCookie(): string {
    return [
        `${AUTH_CONFIG.COOKIE_NAME}=`,
        `Path=${AUTH_CONFIG.COOKIE_PATH}`,
        'Max-Age=0',
        'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    ].join('; ');
}

/**
 * Parse cookies from request header
 */
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) return {};

    return cookieHeader.split(';').reduce((cookies, cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
            cookies[name] = decodeURIComponent(value);
        }
        return cookies;
    }, {} as Record<string, string>);
}

/**
 * Get admin token from request (cookie or header)
 */
export function getTokenFromRequest(req: {
    cookies?: Record<string, string>;
    headers?: { cookie?: string; authorization?: string; };
}): string | null {
    // Try cookies object first
    if (req.cookies?.[AUTH_CONFIG.COOKIE_NAME]) {
        return req.cookies[AUTH_CONFIG.COOKIE_NAME];
    }

    // Try cookie header
    if (req.headers?.cookie) {
        const cookies = parseCookies(req.headers.cookie);
        if (cookies[AUTH_CONFIG.COOKIE_NAME]) {
            return cookies[AUTH_CONFIG.COOKIE_NAME];
        }
    }

    // Try Authorization header
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        return req.headers.authorization.slice(7);
    }

    return null;
}

// ============================================
// DEVICE FINGERPRINT
// ============================================

/**
 * Generate a device fingerprint from request data
 */
export function generateDeviceFingerprint(
    ipAddress?: string,
    userAgent?: string,
    additionalData?: string
): string {
    const data = [ipAddress || '', userAgent || '', additionalData || ''].join('|');
    return createHash('sha256').update(data).digest('hex').substring(0, 32);
}

// ============================================
// ROLE & PERMISSION UTILITIES
// ============================================

const ROLE_HIERARCHY: Record<AdminRole, number> = {
    SUPER_ADMIN: 100,
    ADMIN: 80,
    MODERATOR: 60,
    SUPPORT: 40,
    VIEWER: 20,
};

const DEFAULT_PERMISSIONS: Record<AdminRole, string[]> = {
    SUPER_ADMIN: ['*'], // All permissions
    ADMIN: [
        'users:read', 'users:write', 'users:delete',
        'auctions:read', 'auctions:write', 'auctions:delete',
        'cars:read', 'cars:write', 'cars:delete',
        'transport:read', 'transport:write', 'transport:delete',
        'reports:read',
        'settings:read', 'settings:write',
    ],
    MODERATOR: [
        'users:read', 'users:write',
        'auctions:read', 'auctions:write',
        'cars:read', 'cars:write',
        'transport:read', 'transport:write',
        'reports:read',
    ],
    SUPPORT: [
        'users:read',
        'auctions:read',
        'cars:read',
        'transport:read',
        'tickets:read', 'tickets:write',
    ],
    VIEWER: [
        'users:read',
        'auctions:read',
        'cars:read',
        'transport:read',
        'reports:read',
    ],
};

/**
 * Check if admin has required role level
 */
export function hasRoleLevel(adminRole: AdminRole, requiredRole: AdminRole): boolean {
    return ROLE_HIERARCHY[adminRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if admin has specific permission
 */
export function hasPermission(admin: AdminUser, permission: string): boolean {
    // Super admin has all permissions
    if (admin.role === 'SUPER_ADMIN') return true;

    // Check custom permissions first
    if (admin.permissions?.includes(permission) || admin.permissions?.includes('*')) {
        return true;
    }

    // Check default role permissions
    const rolePermissions = DEFAULT_PERMISSIONS[admin.role] || [];
    return rolePermissions.includes(permission) || rolePermissions.includes('*');
}

/**
 * Get all permissions for an admin
 */
export function getAdminPermissions(admin: AdminUser): string[] {
    const rolePermissions = DEFAULT_PERMISSIONS[admin.role] || [];
    const customPermissions = admin.permissions || [];
    return [...new Set([...rolePermissions, ...customPermissions])];
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): { valid: boolean; errors: string[]; } {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('يجب أن تحتوي على حرف صغير واحد على الأقل');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('يجب أن تحتوي على رقم واحد على الأقل');
    }

    return { valid: errors.length === 0, errors };
}

// ============================================
// EXPORTS
// ============================================

export default {
    // Config
    AUTH_CONFIG,

    // Password
    hashPassword,
    verifyPassword,

    // Tokens
    generateSecureToken,
    generateSessionId,
    createAdminToken,
    verifyAdminToken,

    // Cookies
    createSessionCookie,
    createClearSessionCookie,
    parseCookies,
    getTokenFromRequest,

    // Device
    generateDeviceFingerprint,

    // Roles & Permissions
    hasRoleLevel,
    hasPermission,
    getAdminPermissions,

    // Validation
    isValidEmail,
    isStrongPassword,
};
