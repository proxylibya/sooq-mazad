/**
 * API تشخيصي للتحقق من صحة الـ Token
 * GET /api/debug/verify-token
 */

import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const result: any = {
        timestamp: new Date().toISOString(),
        headers: {},
        cookies: {},
        token: null,
        decoded: null,
        user: null,
        errors: [],
    };

    try {
        // 1. فحص الـ Headers
        const authHeader = req.headers.authorization;
        result.headers = {
            hasAuthorization: !!authHeader,
            authorizationType: authHeader?.split(' ')[0] || null,
            authorizationLength: authHeader?.length || 0,
        };

        // 2. فحص الـ Cookies
        const cookieToken = req.cookies?.token;
        result.cookies = {
            hasToken: !!cookieToken,
            tokenLength: cookieToken?.length || 0,
            allCookies: Object.keys(req.cookies || {}),
        };

        // 3. استخراج الـ Token
        let token: string | undefined;
        let tokenSource: string = 'none';

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
            tokenSource = 'authorization-header';
        } else if (cookieToken) {
            token = cookieToken;
            tokenSource = 'cookie';
        }

        result.token = {
            found: !!token,
            source: tokenSource,
            length: token?.length || 0,
            preview: token ? `${token.substring(0, 20)}...${token.substring(token.length - 10)}` : null,
        };

        if (!token) {
            result.errors.push('No token found in request');
            return res.status(200).json(result);
        }

        // 4. فك تشفير الـ Token
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            result.decoded = {
                success: true,
                userId: decoded.userId,
                phone: decoded.phone,
                role: decoded.role,
                issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null,
                expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
                isExpired: decoded.exp ? Date.now() > decoded.exp * 1000 : false,
            };

            // 5. التحقق من المستخدم في قاعدة البيانات
            if (decoded.userId) {
                const user = await prisma.users.findUnique({
                    where: { id: decoded.userId },
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        role: true,
                        status: true,
                    },
                });

                if (user) {
                    result.user = {
                        found: true,
                        id: user.id,
                        name: user.name,
                        phone: user.phone,
                        role: user.role,
                        status: user.status,
                        matchesToken: user.id === decoded.userId && user.phone === decoded.phone,
                    };
                } else {
                    result.user = { found: false, searchedId: decoded.userId };
                    result.errors.push(`User not found in database: ${decoded.userId}`);
                }
            }
        } catch (jwtError: any) {
            result.decoded = {
                success: false,
                error: jwtError.message,
                errorName: jwtError.name,
            };
            result.errors.push(`JWT verification failed: ${jwtError.message}`);
        }

        // 6. التلخيص
        result.summary = {
            tokenValid: result.decoded?.success === true,
            userExists: result.user?.found === true,
            canAuthenticate: result.decoded?.success === true && result.user?.found === true && !result.decoded?.isExpired,
        };

        return res.status(200).json(result);
    } catch (error: any) {
        result.errors.push(`Unexpected error: ${error.message}`);
        return res.status(500).json(result);
    }
}
