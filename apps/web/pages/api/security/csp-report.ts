import { NextApiRequest, NextApiResponse } from 'next';
import apiResponse from '../../../lib/api/response';
import { logSecurityEvent } from '../../../lib/security/securityLog';
import { SecurityAction, RiskLevel } from '@prisma/client';

interface CSPReport {
  'document-uri': string;
  referrer?: string;
  'violated-directive': string;
  'effective-directive': string;
  'original-policy': string;
  disposition: string;
  'blocked-uri': string;
  'line-number'?: number;
  'column-number'?: number;
  'source-file'?: string;
  'status-code': number;
  'script-sample'?: string;
}

interface CSPReportWrapper {
  'csp-report': CSPReport;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // قبول POST فقط لتقارير CSP
  if (req.method !== 'POST') {
    await logSecurityEvent({
      userId: null,
      action: SecurityAction.UNAUTHORIZED_ACCESS,
      description: 'Method not allowed on /api/security/csp-report',
      riskLevel: RiskLevel.LOW,
      ipAddress: ((req.headers['x-forwarded-for'] as string) ||
        req.socket.remoteAddress ||
        null) as string | null,
      userAgent: ((req.headers['user-agent'] as string) || null) as string | null,
      metadata: { method: req.method },
    });
    return apiResponse.methodNotAllowed(res, ['POST']);
  }

  try {
    const report: CSPReportWrapper = req.body;

    if (!report || !report['csp-report']) {
      return apiResponse.badRequest(
        res,
        'Invalid CSP report format',
        undefined,
        { route: 'api/security/csp-report' },
        'INVALID_CSP_REPORT',
      );
    }

    const cspReport = report['csp-report'];

    // تسجيل التقرير (في الإنتاج يجب إرساله لخدمة مراقبة)
    console.log('🔒 CSP Violation Report:', {
      timestamp: new Date().toISOString(),
      documentUri: cspReport['document-uri'],
      violatedDirective: cspReport['violated-directive'],
      blockedUri: cspReport['blocked-uri'],
      sourceFile: cspReport['source-file'],
      lineNumber: cspReport['line-number'],
      columnNumber: cspReport['column-number'],
      originalPolicy: cspReport['original-policy']?.substring(0, 100) + '...',
    });

    // في الإنتاج، يمكن إرسال هذا لخدمة مراقبة مثل Sentry أو DataDog
    // await sendToMonitoringService(cspReport);

    return apiResponse.noContent(res); // No Content - CSP reports don't need response content
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('خطأ في معالجة تقرير CSP:', message);
    await logSecurityEvent({
      userId: null,
      action: SecurityAction.SUSPICIOUS_ACTIVITY,
      description: 'Error while processing CSP report',
      riskLevel: RiskLevel.MEDIUM,
      ipAddress: ((req.headers['x-forwarded-for'] as string) ||
        req.socket.remoteAddress ||
        null) as string | null,
      userAgent: ((req.headers['user-agent'] as string) || null) as string | null,
      metadata: { error: message },
    });
    return apiResponse.serverError(
      res,
      'Internal server error',
      message,
      { route: 'api/security/csp-report' },
      'CSP_REPORT_ERROR',
    );
  }
}

// تعطيل bodyParser للسماح بـ raw body من المتصفحات
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10kb', // حد صغير لتقارير CSP
    },
  },
};
