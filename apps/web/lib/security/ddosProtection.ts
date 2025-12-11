// DDoS Protection Module
import { NextApiRequest } from 'next';
import keydbClient from '../keydb';
import logger from '../logger';

interface DDoSConfig {
  enabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  blockDuration: number; // بالدقائق
}

const defaultConfig: DDoSConfig = {
  enabled: true,
  requestsPerMinute: 60,
  requestsPerHour: 600,
  blockDuration: 60,
};

/**
 * التحقق من محاولات DDoS
 */
export async function checkDDoS(
  req: NextApiRequest,
  config: Partial<DDoSConfig> = {},
): Promise<{ blocked: boolean; reason?: string }> {
  const fullConfig = { ...defaultConfig, ...config };

  if (!fullConfig.enabled) {
    return { blocked: false };
  }

  const ip = getClientIP(req);
  const now = Date.now();

  try {
    // فحص عدد الطلبات في الدقيقة
    const minuteKey = `ddos:minute:${ip}:${Math.floor(now / 60000)}`;
    const minuteCount = await keydbClient.get<number>(minuteKey);
    const currentMinuteCount = minuteCount ? parseInt(String(minuteCount), 10) : 0;

    if (currentMinuteCount >= fullConfig.requestsPerMinute) {
      await blockIP(ip, fullConfig.blockDuration);
      logger.warn(`DDoS attack detected from IP: ${ip} (minute limit exceeded)`, {
        ip,
        count: currentMinuteCount,
        limit: fullConfig.requestsPerMinute,
      });
      return {
        blocked: true,
        reason: 'تم تجاوز عدد الطلبات المسموح به في الدقيقة',
      };
    }

    // فحص عدد الطلبات في الساعة
    const hourKey = `ddos:hour:${ip}:${Math.floor(now / 3600000)}`;
    const hourCount = await keydbClient.get<number>(hourKey);
    const currentHourCount = hourCount ? parseInt(String(hourCount), 10) : 0;

    if (currentHourCount >= fullConfig.requestsPerHour) {
      await blockIP(ip, fullConfig.blockDuration);
      logger.warn(`DDoS attack detected from IP: ${ip} (hour limit exceeded)`, {
        ip,
        count: currentHourCount,
        limit: fullConfig.requestsPerHour,
      });
      return {
        blocked: true,
        reason: 'تم تجاوز عدد الطلبات المسموح به في الساعة',
      };
    }

    // تحديث العدادات
    await keydbClient.set(minuteKey, currentMinuteCount + 1, 60);
    await keydbClient.set(hourKey, currentHourCount + 1, 3600);

    return { blocked: false };
  } catch (error) {
    logger.error('Error checking DDoS protection', {
      error: error instanceof Error ? error.message : error,
      ip,
    });
    return { blocked: false };
  }
}

/**
 * حظر IP
 */
export async function blockIP(ip: string, durationMinutes: number): Promise<void> {
  try {
    const blockKey = `blocked:ip:${ip}`;
    await keydbClient.set(blockKey, Date.now(), durationMinutes * 60);
    logger.info(`IP blocked: ${ip} for ${durationMinutes} minutes`, {
      ip,
      durationMinutes,
    });
  } catch (error) {
    logger.error('Error blocking IP', {
      error: error instanceof Error ? error.message : error,
      ip,
    });
  }
}

/**
 * إلغاء حظر IP
 */
export async function unblockIP(ip: string): Promise<void> {
  try {
    const blockKey = `blocked:ip:${ip}`;
    await keydbClient.del(blockKey);
    logger.info(`IP unblocked: ${ip}`, { ip });
  } catch (error) {
    logger.error('Error unblocking IP', {
      error: error instanceof Error ? error.message : error,
      ip,
    });
  }
}

/**
 * التحقق من حالة الحظر
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
  try {
    const blockKey = `blocked:ip:${ip}`;
    const blocked = await keydbClient.exists(blockKey);
    return blocked;
  } catch (error) {
    logger.error('Error checking if IP is blocked', {
      error: error instanceof Error ? error.message : error,
      ip,
    });
    return false;
  }
}

/**
 * الحصول على قائمة IPs المحظورة
 */
export async function getBlockedIPs(): Promise<string[]> {
  try {
    const keys = await keydbClient.keys('blocked:ip:*');
    return keys.map((key) => key.replace('blocked:ip:', ''));
  } catch (error) {
    logger.error('Error getting blocked IPs', {
      error: error instanceof Error ? error.message : error,
    });
    return [];
  }
}

/**
 * الحصول على إحصائيات DDoS
 */
export async function getDDoSStats(): Promise<{
  totalBlocked: number;
  blockedIPs: string[];
  recentAttempts: number;
}> {
  try {
    const blockedIPs = await getBlockedIPs();
    const now = Date.now();
    const minuteKey = `ddos:minute:*:${Math.floor(now / 60000)}`;
    const recentKeys = await keydbClient.keys(minuteKey);

    return {
      totalBlocked: blockedIPs.length,
      blockedIPs,
      recentAttempts: recentKeys.length,
    };
  } catch (error) {
    logger.error('Error getting DDoS stats', {
      error: error instanceof Error ? error.message : error,
    });
    return {
      totalBlocked: 0,
      blockedIPs: [],
      recentAttempts: 0,
    };
  }
}

/**
 * الحصول على IP الخاص بالعميل
 */
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  const ip = forwarded
    ? Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(',')[0].trim()
    : req.socket?.remoteAddress;
  return ip || 'unknown';
}

// إنشاء كائن ddosProtection مع جميع الوظائف
export const ddosProtection = {
  checkDDoS,
  blockIP,
  unblockIP,
  isIPBlocked,
  getBlockedIPs,
  getDDoSStats,
};

// Export default أيضاً للتوافق
export default ddosProtection;
