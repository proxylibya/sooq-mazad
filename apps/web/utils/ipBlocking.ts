import { NextApiRequest, NextApiResponse } from 'next';
import { getKeyDBClient } from './keydb';

interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: Date;
  expiresAt?: Date;
  attempts: number;
}

// قائمة IPs محظورة مؤقتاً في الذاكرة
const blockedIPs = new Map<string, BlockedIP>();

// قائمة دول محظورة (يمكن تخصيصها)
const BLOCKED_COUNTRIES = [
  'CN',
  'RU',
  'KP',
  'IR', // دول شائعة للهجمات
];

// قائمة User Agents مشبوهة
const SUSPICIOUS_USER_AGENTS = [
  'bot',
  'crawler',
  'spider',
  'scraper',
  'python',
  'curl',
  'wget',
  'nikto',
  'scanner',
  'sqlmap',
  'nmap',
  'masscan',
];

export function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(',')[0]
    : req.connection.remoteAddress;
  return ip || 'unknown';
}

export function isIPBlocked(ip: string): BlockedIP | null {
  const blocked = blockedIPs.get(ip);
  if (blocked && blocked.expiresAt && new Date() > blocked.expiresAt) {
    blockedIPs.delete(ip);
    return null;
  }
  return blocked || null;
}

export function blockIP(ip: string, reason: string, durationMs: number = 3600000): void {
  const blocked: BlockedIP = {
    ip,
    reason,
    blockedAt: new Date(),
    expiresAt: new Date(Date.now() + durationMs),
    attempts: (blockedIPs.get(ip)?.attempts || 0) + 1,
  };

  blockedIPs.set(ip, blocked);

  // حفظ في KeyDB إذا متوفر
  const keydb = getKeyDBClient();
  if (keydb) {
    keydb.setex(`blocked_ip:${ip}`, Math.ceil(durationMs / 1000), JSON.stringify(blocked));
  }
}

export function unblockIP(ip: string): void {
  blockedIPs.delete(ip);

  const keydb = getKeyDBClient();
  if (keydb) {
    keydb.del(`blocked_ip:${ip}`);
  }
}

export function isSuspiciousUserAgent(userAgent: string): boolean {
  if (!userAgent) return true;

  const ua = userAgent.toLowerCase();
  return SUSPICIOUS_USER_AGENTS.some((suspicious) => ua.includes(suspicious));
}

export function analyzeRequest(req: NextApiRequest): {
  suspicious: boolean;
  reasons: string[];
  riskScore: number;
} {
  const reasons: string[] = [];
  let riskScore = 0;

  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || '';

  // فحص IP محظور
  if (isIPBlocked(ip)) {
    reasons.push('IP محظور');
    riskScore += 100;
  }

  // فحص User Agent مشبوه
  if (isSuspiciousUserAgent(userAgent)) {
    reasons.push('User Agent مشبوه');
    riskScore += 50;
  }

  // فحص عدم وجود Referer للطلبات الحساسة
  if (!req.headers.referer && req.method === 'POST') {
    reasons.push('لا يوجد Referer');
    riskScore += 30;
  }

  // فحص طلبات سريعة جداً
  const acceptHeader = req.headers.accept || '';
  if (!acceptHeader.includes('text/html') && !acceptHeader.includes('application/json')) {
    reasons.push('Accept header مشبوه');
    riskScore += 20;
  }

  return {
    suspicious: riskScore >= 50,
    reasons,
    riskScore,
  };
}

export function withIPProtection(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip = getClientIP(req);

    // فحص IP محظور
    const blocked = isIPBlocked(ip);
    if (blocked) {
      res.status(403).json({
        error: 'IP محظور',
        reason: blocked.reason,
        blockedAt: blocked.blockedAt,
        expiresAt: blocked.expiresAt,
      });
      return;
    }

    // تحليل الطلب
    const analysis = analyzeRequest(req);

    // إذا كان مشبوه جداً، حظر فوري
    if (analysis.riskScore >= 80) {
      blockIP(ip, `نشاط مشبوه: ${analysis.reasons.join(', ')}`, 3600000); // ساعة واحدة
      res.status(403).json({
        error: 'تم حظر IP بسبب نشاط مشبوه',
        reasons: analysis.reasons,
      });
      return;
    }

    // إضافة معلومات التحليل للـ headers
    res.setHeader('X-Risk-Score', analysis.riskScore.toString());
    if (analysis.suspicious) {
      res.setHeader('X-Suspicious-Reasons', analysis.reasons.join(', '));
    }

    return handler(req, res);
  };
}

// تنظيف دوري للـ IPs المحظورة المنتهية الصلاحية
setInterval(
  () => {
    const now = new Date();
    for (const [ip, blocked] of blockedIPs.entries()) {
      if (blocked.expiresAt && now > blocked.expiresAt) {
        blockedIPs.delete(ip);
      }
    }
  },
  5 * 60 * 1000,
); // كل 5 دقائق

export { blockedIPs };
