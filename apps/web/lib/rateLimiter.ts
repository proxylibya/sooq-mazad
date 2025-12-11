/**
 * Rate Limiter - Re-export from UnifiedRateLimiter
 */
export * from './security/UnifiedRateLimiter';
export { default } from './security/UnifiedRateLimiter';

import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimiter } from './security/UnifiedRateLimiter';

/**
 * Rate Limit Configuration Presets
 */
export const RateLimitConfigs = {
    API_GENERAL: { maxAttempts: 100, windowMs: 60 * 1000 },
    AUTH_LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
    FILE_UPLOAD: { maxAttempts: 20, windowMs: 60 * 1000 },
    SEARCH: { maxAttempts: 60, windowMs: 60 * 1000 },
    MESSAGING: { maxAttempts: 30, windowMs: 60 * 1000 },
    SENSITIVE: { maxAttempts: 10, windowMs: 60 * 1000 },
};

/**
 * Rate Limit Identifier Types
 */
export const RateLimitIdentifiers = {
    IP: 'ip',
    USER: 'user',
    ENDPOINT: 'endpoint',
    COMBINED: 'combined',
};

/**
 * Get client IP address from request
 */
export function getClientIP(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
        ? Array.isArray(forwarded)
            ? forwarded[0]
            : forwarded.split(',')[0]
        : req.socket?.remoteAddress;
    return ip || 'unknown';
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
    req: NextApiRequest,
    res: NextApiResponse,
    config: { maxAttempts: number; windowMs: number; } = RateLimitConfigs.API_GENERAL
): Promise<boolean> {
    const identifier = getClientIP(req);
    const ruleName = `custom_${config.maxAttempts}_${config.windowMs}`;

    // Add custom rule if not exists
    rateLimiter.addRule({
        name: ruleName,
        windowMs: config.windowMs,
        maxRequests: config.maxAttempts,
    });

    const result = await rateLimiter.checkLimit(ruleName, identifier);

    if (!result.allowed) {
        res.status(429).json({
            success: false,
            error: 'عدد كبير من الطلبات',
            message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً',
            retryAfter: result.retryAfter,
        });
        return false;
    }

    return true;
}

/**
 * Middleware wrapper for rate limiting
 */
export function withRateLimit(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
    config: { maxAttempts: number; windowMs: number; } = RateLimitConfigs.API_GENERAL
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const ok = await applyRateLimit(req, res, config);
        if (!ok) return;
        return handler(req, res);
    };
}

/**
 * Pre-configured rate limiter for general API use
 */
export const generalLimiter = {
    check: async (req: NextApiRequest, res: NextApiResponse) => {
        return applyRateLimit(req, res, RateLimitConfigs.API_GENERAL);
    },
};

