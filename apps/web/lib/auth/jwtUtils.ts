/**
 * JWT Utilities
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function signToken(payload: Record<string, unknown>, expiresIn: string | number = '7d'): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
}

export function verifyToken<T = Record<string, unknown>>(token: string): T | null {
    try {
        return jwt.verify(token, JWT_SECRET) as T;
    } catch {
        return null;
    }
}

// Alias for compatibility
export const verifyUserToken = verifyToken;

export function decodeToken<T = Record<string, unknown>>(token: string): T | null {
    try {
        return jwt.decode(token) as T;
    } catch {
        return null;
    }
}

export default { signToken, verifyToken, decodeToken };
