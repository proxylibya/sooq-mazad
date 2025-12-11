import type { SecurityAction, RiskLevel } from '@prisma/client';
import type { IncomingHttpHeaders } from 'http';

export type LogSecurityEventInput = {
  userId: string | null;
  action: SecurityAction;
  description: string;
  riskLevel: RiskLevel;
  ipAddress: string | null;
  userAgent: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Lightweight logger used by API routes. It avoids DB writes to keep it safe by default.
 * Replace internals later to persist to DB or external monitoring if needed.
 */
export async function logSecurityEvent(input: LogSecurityEventInput): Promise<void> {
  try {
    const payload = {
      ...input,
      timestamp: new Date().toISOString(),
    };
    
    // Skip console output in test environment to avoid noise
    if (process.env.NODE_ENV !== 'test') {
      // For now, just log to console to avoid failures if DB is unavailable
      // You can wire this to utils/securityMonitoring or a queue later.
      console.warn('[SECURITY]', payload);
    }
  } catch (e) {
    // Never throw from logger; swallow to avoid breaking API responses
  }
}

/**
 * Extract client IP from Next/Node headers.
 */
export function getClientIpFromHeaders(
  headers: IncomingHttpHeaders | Headers | Record<string, unknown>,
): string | undefined {
  try {
    // Handle both Node and WHATWG Headers
    const get = (name: string): string | undefined => {
      if (headers instanceof Headers) return headers.get(name) || undefined;
      const h = (headers as IncomingHttpHeaders)[name.toLowerCase()];
      if (Array.isArray(h)) return h[0];
      return (h as string) || undefined;
    };

    const xff = get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();

    const realIp = get('x-real-ip');
    if (realIp) return realIp;

    const cfConnectingIp = get('cf-connecting-ip');
    if (cfConnectingIp) return cfConnectingIp;

    return undefined;
  } catch {
    return undefined;
  }
}

export default {
  logSecurityEvent,
  getClientIpFromHeaders,
};
