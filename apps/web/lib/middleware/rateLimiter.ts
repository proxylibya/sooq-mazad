/**
 * 🔄 Rate Limiter Middleware - إعادة تصدير من النظام الموحد
 */
// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next';
import { rateLimiter } from '../security/UnifiedRateLimiter';

export const RateLimitConfigs = {
  API_GENERAL: { maxAttempts: 100, windowMs: 60000 },
  AUTH_LOGIN: { maxAttempts: 5, windowMs: 900000 },
  FILE_UPLOAD: { maxAttempts: 20, windowMs: 60000 },
  SEARCH: { maxAttempts: 60, windowMs: 60000 },
  MESSAGING: { maxAttempts: 30, windowMs: 60000 },
};

export const withRateLimit = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
  config: { maxAttempts: number; windowMs: number; } = RateLimitConfigs.API_GENERAL,
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const forwarded = req.headers['x-forwarded-for'];
    const identifier = forwarded
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
      : req.socket?.remoteAddress || 'unknown';

    const result = await rateLimiter.checkLimit('api_general', identifier);

    if (!result.allowed) {
      const retryAfter = result.retryAfter || 60000;
      res.setHeader('Retry-After', String(Math.ceil(retryAfter / 1000)));
      res.setHeader('X-RateLimit-Remaining', '0');
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter,
      });
    }

    const remaining = result.limitInfo?.remainingPoints ?? 0;
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    return handler(req, res);
  };
};

export const withApiRateLimit = withRateLimit;
export const apiRateLimit = RateLimitConfigs.API_GENERAL;

export default withRateLimit;
