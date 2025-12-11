// Advanced Blocking System
import logger from '../logger';

export enum ThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum BlockReason {
  SQL_INJECTION = 'SQL_INJECTION',
  XSS = 'XSS',
  COMMAND_INJECTION = 'COMMAND_INJECTION',
  PATH_TRAVERSAL = 'PATH_TRAVERSAL',
  BOT = 'BOT',
  RATE_LIMIT = 'RATE_LIMIT',
  SUSPICIOUS_BEHAVIOR = 'SUSPICIOUS_BEHAVIOR',
}

export const checkBlockingRules = async (params: {
  ip?: string;
  userId?: string;
  userAgent?: string;
}) => {
  try {
    logger.info('Checking blocking rules', params);
    return { blocked: false, reason: null as BlockReason | null };
  } catch (error) {
    logger.error('Error checking blocking rules', { error });
    return { blocked: false, reason: null as BlockReason | null };
  }
};

export const addBlockingRule = async (rule: { type: string; value: string; duration?: number }) => {
  try {
    logger.info('Adding blocking rule', rule);
    return { success: true };
  } catch (error) {
    logger.error('Error adding blocking rule', { error });
    return { success: false };
  }
};

export const advancedBlocking = {
  async analyzeRequest(params: {
    ip: string;
    userAgent: string;
    url: string;
    method?: string;
    body?: unknown;
    headers?: Record<string, unknown>;
  }): Promise<{ allowed: boolean; threatLevel: ThreatLevel; reasons: BlockReason[] }> {
    try {
      const reasons: BlockReason[] = [];
      let threat: ThreatLevel = ThreatLevel.LOW;

      const ua = (params.userAgent || '').toLowerCase();
      if (/curl|wget|bot|crawler/.test(ua)) {
        reasons.push(BlockReason.BOT);
        threat = ThreatLevel.MEDIUM;
      }

      const url = params.url || '';
      if (/["'`;]|(union\s+select)|(<script)/i.test(url)) {
        reasons.push(BlockReason.SQL_INJECTION);
        reasons.push(BlockReason.XSS);
        threat = ThreatLevel.HIGH;
      }

      const allowed = reasons.length === 0;
      return { allowed, threatLevel: threat, reasons };
    } catch (error) {
      logger.error('Error analyzing request', { error });
      return { allowed: true, threatLevel: ThreatLevel.LOW, reasons: [] };
    }
  },
};

export default { checkBlockingRules, addBlockingRule, advancedBlocking, ThreatLevel, BlockReason };
