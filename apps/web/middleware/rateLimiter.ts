/**
 * Rate Limiter Middleware
 */

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const requestCounts = new Map<string, { count: number; resetTime: number; }>();

interface RateLimitOptions {
    windowMs?: number;
    max?: number;
}

export function rateLimiter(options: RateLimitOptions = {}) {
    const { windowMs = 60000, max = 100 } = options;

    return (handler: NextApiHandler) => {
        return async (req: NextApiRequest, res: NextApiResponse) => {
            const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';
            const now = Date.now();

            const record = requestCounts.get(ip);

            if (!record || now > record.resetTime) {
                requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
            } else if (record.count >= max) {
                return res.status(429).json({
                    success: false,
                    error: 'عدد الطلبات كثير جداً، حاول مرة أخرى لاحقاً'
                });
            } else {
                record.count++;
            }

            return handler(req, res);
        };
    };
}

// Alias for compatibility
export const withRateLimit = rateLimiter;

// Pre-configured rate limiters
export const apiRateLimit = rateLimiter({ windowMs: 60000, max: 100 });
export const authRateLimit = rateLimiter({ windowMs: 60000, max: 10 });
export const uploadRateLimit = rateLimiter({ windowMs: 60000, max: 20 });

export default rateLimiter;
