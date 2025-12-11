// Activity Logger - Security Module
import logger from '../logger';
import { logSecurityEvent, getClientIpFromHeaders } from './securityLog';
import { SecurityAction, RiskLevel } from '@prisma/client';
import type { NextApiRequest } from 'next';

interface AdminAuthEventParams {
  userId?: string | null;
  username: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'TOKEN_REFRESH' | 'SESSION_EXPIRED';
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

/**
 * تسجيل حدث مصادقة للمشرفين
 */
export async function logAdminAuthEvent(params: AdminAuthEventParams): Promise<void>;
export async function logAdminAuthEvent(
  req: NextApiRequest,
  params: Partial<AdminAuthEventParams> & { type: string; username?: string },
): Promise<void>;
export async function logAdminAuthEvent(
  arg1: AdminAuthEventParams | NextApiRequest,
  arg2?: Partial<AdminAuthEventParams> & { type: string; username?: string },
): Promise<void> {
  // Normalize inputs
  let userId: string | null | undefined;
  let username: string = '';
  let action: string = 'LOGIN_SUCCESS';
  let ipAddress = '';
  let userAgent = '';
  let metadata: Record<string, unknown> | undefined;

  if (arg2) {
    const req = arg1 as NextApiRequest;
    const params = arg2;
    username = params.username || '';
    action = params.type;
    ipAddress = getClientIpFromHeaders(req.headers) ?? '';
    userAgent = (req.headers?.['user-agent'] as string) ?? '';
    userId = params.userId;
    metadata = params.metadata;
  } else {
    const p = arg1 as AdminAuthEventParams;
    ({ userId, username } = p);
    action = p.action;
    ipAddress = p.ipAddress;
    userAgent = p.userAgent;
    metadata = p.metadata;
  }

  try {
    // تحديد مستوى الخطورة بناءً على النشاط
    let riskLevel: RiskLevel = RiskLevel.LOW;
    let securityAction: SecurityAction = SecurityAction.LOGIN_SUCCESS;

    switch (action) {
      case 'LOGIN_FAILED':
        riskLevel = RiskLevel.MEDIUM;
        securityAction = SecurityAction.LOGIN_FAILED;
        break;
      case 'LOGIN_SUCCESS':
        riskLevel = RiskLevel.LOW;
        securityAction = SecurityAction.LOGIN_SUCCESS;
        break;
      case 'LOGOUT':
      case 'LOGOUT_SUCCESS':
        riskLevel = RiskLevel.LOW;
        securityAction = SecurityAction.LOGIN_SUCCESS; // Use LOGIN_SUCCESS as closest equivalent
        break;
      case 'TOKEN_REFRESH':
        riskLevel = RiskLevel.LOW;
        securityAction = SecurityAction.LOGIN_SUCCESS;
        break;
      case 'SESSION_EXPIRED':
        riskLevel = RiskLevel.LOW;
        securityAction = SecurityAction.SUSPICIOUS_ACTIVITY;
        break;
      case 'RATE_LIMIT_BLOCK':
        riskLevel = RiskLevel.MEDIUM;
        securityAction = SecurityAction.SUSPICIOUS_ACTIVITY;
        break;
      case 'CSRF_FAILURE':
        riskLevel = RiskLevel.MEDIUM;
        securityAction = SecurityAction.SUSPICIOUS_ACTIVITY;
        break;
      case 'USER_NOT_FOUND':
      case 'PASSWORD_INVALID':
        riskLevel = RiskLevel.MEDIUM;
        securityAction = SecurityAction.LOGIN_FAILED;
        break;
      case 'DEV_BYPASS_USED':
        riskLevel = RiskLevel.LOW;
        securityAction = SecurityAction.LOGIN_SUCCESS;
        break;
      case 'LOGIN_ERROR':
        riskLevel = RiskLevel.MEDIUM;
        securityAction = SecurityAction.SUSPICIOUS_ACTIVITY;
        break;
      default:
        // Fallback for unknown actions
        riskLevel = RiskLevel.LOW;
        securityAction = SecurityAction.LOGIN_SUCCESS;
        break;
    }

    // تسجيل في نظام الأمان
    await logSecurityEvent({
      userId: userId || null,
      action: securityAction,
      description: `Admin auth event: ${action} for ${username}`,
      riskLevel,
      ipAddress,
      userAgent,
      metadata: {
        ...metadata,
        username,
        action,
      },
    });

    // تسجيل في Logger العام
    logger.info(`Admin auth: ${action}`, {
      type: 'admin_auth',
      username,
      action,
      userId,
      ipAddress,
      userAgent,
      ...metadata,
    });
  } catch (error) {
    logger.error('Failed to log admin auth event', {
      error: error instanceof Error ? error.message : error,
      username,
      action,
    });
  }
}

/**
 * تسجيل نشاط عام للمشرف
 */
export async function logAdminActivity(params: {
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    logger.info(`Admin activity: ${params.action}`, {
      type: 'admin_activity',
      ...params,
    });
  } catch (error) {
    logger.error('Failed to log admin activity', {
      error: error instanceof Error ? error.message : error,
      userId: params.userId,
      action: params.action,
    });
  }
}
