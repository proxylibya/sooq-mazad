/**
 * Middleware للمصادقة
 */

import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// تشخيص: طباعة JWT_SECRET عند أول استخدام
let jwtSecretLogged = false;
function logJwtSecret() {
    if (!jwtSecretLogged) {
        console.log('[Auth Middleware] JWT_SECRET loaded:', JWT_SECRET ? `${JWT_SECRET.substring(0, 15)}...` : 'USING DEFAULT');
        jwtSecretLogged = true;
    }
}

export interface AuthenticatedRequest extends NextApiRequest {
    user?: {
        id: string;
        phone: string;
        name: string;
    };
}

/**
 * Middleware للتحقق من المستخدم
 */
export function withAuth(handler: NextApiHandler) {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
        try {
            const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: 'غير مصرح - يرجى تسجيل الدخول'
                });
            }

            const decoded = jwt.verify(token, JWT_SECRET) as any;

            const user = await prisma.users.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    phone: true,
                    name: true,
                }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'المستخدم غير موجود'
                });
            }

            req.user = user;
            return handler(req, res);
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(401).json({
                success: false,
                error: 'جلسة غير صالحة'
            });
        }
    };
}

/**
 * جلب المستخدم من الطلب (بدون إجبار)
 */
export async function getUserFromRequest(req: NextApiRequest): Promise<any> {
    try {
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) return null;

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const user = await prisma.users.findUnique({
            where: { id: decoded.userId }
        });

        return user;
    } catch {
        return null;
    }
}

/**
 * التحقق من صلاحية التوكن - تستقبل request أو token مباشرة
 */
export async function verifyToken(reqOrToken: NextApiRequest | string): Promise<any> {
    logJwtSecret(); // تشخيص
    try {
        let token: string | undefined;

        if (typeof reqOrToken === 'string') {
            token = reqOrToken;
        } else {
            const authHeader = reqOrToken.headers.authorization;
            let cookieToken = reqOrToken.cookies?.token;

            // فك تشفير الـ Cookie إذا كان مُشفراً (يُحفظ بـ encodeURIComponent)
            if (cookieToken) {
                try {
                    cookieToken = decodeURIComponent(cookieToken);
                } catch {
                    // إذا فشل فك التشفير، استخدم القيمة كما هي
                }
            }

            // أولاً: محاولة من Authorization header
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
            // ثانياً: محاولة من Cookie
            else if (cookieToken) {
                token = cookieToken;
            }

            console.log('[verifyToken] 🔐 Token extraction:', {
                hasAuthHeader: !!authHeader,
                hasCookieToken: !!cookieToken,
                extractedTokenLength: token?.length || 0,
                tokenSource: authHeader?.startsWith('Bearer ') ? 'header' : cookieToken ? 'cookie' : 'none',
            });
        }

        if (!token) {
            console.log('[verifyToken] ❌ No token found');
            return null;
        }

        // التحقق من صلاحية الـ Token
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as any;
            console.log('[verifyToken] 🔓 Token decoded successfully:', {
                userId: decoded.userId,
                phone: decoded.phone?.substring(0, 8) + '...',
                role: decoded.role,
                exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'no-exp',
            });
        } catch (jwtError) {
            console.error('[verifyToken] ❌ JWT decode failed:', {
                error: jwtError instanceof Error ? jwtError.message : 'Unknown',
                tokenPreview: token.substring(0, 20) + '...',
            });
            return null;
        }

        if (!decoded.userId) {
            console.log('[verifyToken] ❌ No userId in token');
            return null;
        }

        // جلب بيانات المستخدم من قاعدة البيانات
        const user = await prisma.users.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                accountType: true,
                verified: true,
                status: true,
                profileImage: true,
                createdAt: true,
            }
        });

        if (!user) {
            console.log('[verifyToken] ❌ User not found in database for ID:', decoded.userId);
            return null;
        }

        console.log('[verifyToken] ✅ User authenticated:', user.id);
        return user;
    } catch (error) {
        console.error('[verifyToken] ❌ Unexpected error:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
}

/**
 * إنشاء توكن جديد
 */
export function createToken(payload: object, expiresIn: string = '7d'): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
}

export default withAuth;
