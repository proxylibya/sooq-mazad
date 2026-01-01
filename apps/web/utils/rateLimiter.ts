import type { NextApiRequest, NextApiResponse } from 'next';
import {
  applyRateLimit,
  RateLimitConfigs,
  RateLimitIdentifiers,
  getClientIP,
} from '../lib/rateLimiter';

export type NextHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

// Wrapper for upload endpoints (default: 30 requests per minute per IP/endpoint)
export function withUploadRateLimit(
  handler: NextHandler,
  config: { maxAttempts: number; windowMs: number } = {
    maxAttempts: 30,
    windowMs: 60 * 1000,
  },
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ok = await applyRateLimit(req, res, config);
    if (!ok) return;
    return handler(req, res);
  };
}

// Generic API rate limit wrapper using predefined configs
export function withApiRateLimit(handler: NextHandler, config = RateLimitConfigs.API_GENERAL) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ok = await applyRateLimit(req, res, config);
    if (!ok) return;
    return handler(req, res);
  };
}

export { applyRateLimit, RateLimitConfigs, RateLimitIdentifiers, getClientIP };
