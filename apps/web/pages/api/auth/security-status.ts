import { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit, apiRateLimit } from '../../../middleware/rateLimiter';
import { getSecurityStats } from '../../../utils/security';

// تخزين مؤقت لحالة الأمان (في الإنتاج يفضل استخدام Redis)
const securityStatus = new Map<
  string,
  {
    attempts: number;
    lastAttempt: number;
    blocked: boolean;
    blockExpiry: number;
  }
>();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'طريقة غير مدعومة',
    });
  }

  try {
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';

    // الحصول على حالة الأمان للعميل
    const clientStatus = securityStatus.get(clientIP) || {
      attempts: 0,
      lastAttempt: 0,
      blocked: false,
      blockExpiry: 0,
    };

    // فحص انتهاء الحظر
    if (clientStatus.blocked && Date.now() > clientStatus.blockExpiry) {
      clientStatus.blocked = false;
      clientStatus.attempts = 0;
      securityStatus.set(clientIP, clientStatus);
    }

    // حساب الوقت المتبقي للحظر
    const blockTimeRemaining = clientStatus.blocked
      ? Math.max(0, Math.ceil((clientStatus.blockExpiry - Date.now()) / 1000))
      : 0;

    // الحصول على إحصائيات الأمان العامة
    const stats = getSecurityStats();

    return res.status(200).json({
      success: true,
      isBlocked: clientStatus.blocked,
      attempts: clientStatus.attempts,
      blockTimeRemaining,
      lastAttempt: clientStatus.lastAttempt ? new Date(clientStatus.lastAttempt) : null,
      securityStats: {
        totalBlockedIPs: stats.blockedIPs.length,
        activeCSRFTokens: stats.activeCSRFTokens,
        totalSuspiciousIPs: stats.totalSuspiciousIPs,
      },
    });
  } catch (error) {
    console.error('خطأ في فحص حالة الأمان:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم',
    });
  }
}

// الحصول على IP العميل
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers?.['x-forwarded-for'] as string | undefined;
  const real = req.headers?.['x-real-ip'] as string | undefined;
  const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress;

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (real) {
    return real;
  }

  return remoteAddress || 'unknown';
}

// تنظيف البيانات القديمة كل 30 دقيقة
setInterval(
  () => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 ساعة

    for (const [ip, status] of securityStatus.entries()) {
      if (now - status.lastAttempt > maxAge) {
        securityStatus.delete(ip);
      }
    }
  },
  30 * 60 * 1000,
);

export default withRateLimit(handler, apiRateLimit);
