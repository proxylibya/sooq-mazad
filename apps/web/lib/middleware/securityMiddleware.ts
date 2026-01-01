/**
 * Middleware الأمان المتقدم
 */

import { NextApiRequest, NextApiResponse } from 'next';

export interface SecurityRequest extends NextApiRequest {
  security?: {
    clientId: string;
    riskScore: number;
    isBlocked: boolean;
    rateLimited: boolean;
  };
}

const BLOCKED_IPS = new Set<string>();
const SUSPICIOUS_USER_AGENTS = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget'];
const rateLimitStore = new Map<string, { count: number; resetAt: number; }>();

const RATE_LIMITS: Record<string, { limit: number; window: number; }> = {
  '/api/auth/login': { limit: 5, window: 15 * 60 * 1000 },
  default: { limit: 200, window: 60 * 1000 },
};

function checkRateLimit(key: string, limit: number, window: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + window });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}

function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  const realIP = req.headers['x-real-ip'];
  if (typeof realIP === 'string') return realIP;
  return req.socket?.remoteAddress || 'unknown';
}

function isLibyanIP(ip: string): boolean {
  return ['41.252.', '41.253.', '196.12.', '196.13.'].some((r) => ip.startsWith(r));
}

function hasSuspiciousHeaders(req: NextApiRequest): boolean {
  let count = 0;
  ['x-forwarded-for', 'x-real-ip', 'x-cluster-client-ip'].forEach((h) => {
    if (req.headers[h]) count++;
  });
  return count > 2;
}

function addSecurityHeaders(res: NextApiResponse): void {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

export function securityMiddleware(req: SecurityRequest, res: NextApiResponse, next: () => void) {
  try {
    const clientIp = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const clientId = `${clientIp}_${userAgent.slice(0, 50)}`;

    if (BLOCKED_IPS.has(clientIp)) {
      return res.status(403).json({ success: false, error: 'الوصول محظور' });
    }

    const isSuspiciousUA = SUSPICIOUS_USER_AGENTS.some((p) =>
      userAgent.toLowerCase().includes(p)
    );

    const endpoint = req.url?.split('?')[0] || 'unknown';
    const rateLimit = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
    const isAllowed = checkRateLimit(clientId, rateLimit.limit, rateLimit.window);

    if (!isAllowed) {
      return res.status(429).json({ success: false, error: 'تجاوز الحد المسموح' });
    }

    let riskScore = 0;
    if (isSuspiciousUA) riskScore += 20;
    if (!isLibyanIP(clientIp)) riskScore += 10;
    if (hasSuspiciousHeaders(req)) riskScore += 15;

    req.security = { clientId, riskScore, isBlocked: riskScore >= 50, rateLimited: !isAllowed };

    if (req.security.isBlocked) {
      return res.status(403).json({ success: false, error: 'تم رفض الطلب' });
    }

    addSecurityHeaders(res);
    next();
  } catch {
    next();
  }
}

export function withSecurity(handler: (req: SecurityRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: SecurityRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve, reject) => {
      securityMiddleware(req, res, async () => {
        try {
          await handler(req, res);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };
}

export default securityMiddleware;
