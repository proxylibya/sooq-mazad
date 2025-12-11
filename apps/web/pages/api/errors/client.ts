/**
 * API لاستقبال أخطاء العميل
 * Client Error Reporting API
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface ClientError {
  id: string;
  type: string;
  severity: string;
  message: string;
  userMessage?: string;
  timestamp: string;
  statusCode?: number;
  metadata?: Record<string, unknown>;
}

interface ClientErrorReport extends ClientError {
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // التحقق من method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
        timestamp: new Date().toISOString(),
      },
    });
  }

  try {
    // استخراج بيانات الخطأ
    const clientError: ClientErrorReport = req.body;

    // إضافة معلومات إضافية من الطلب
    const enrichedError = {
      ...clientError,
      userAgent: req.headers?.['user-agent'],
      ip: req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress,
      referer: req.headers?.referer,
      receivedAt: new Date().toISOString(),
    };

    // تسجيل الخطأ
    console.log('📱 Client Error Received:', {
      id: enrichedError.id,
      type: enrichedError.type,
      severity: enrichedError.severity,
      message: enrichedError.message,
      userMessage: enrichedError.userMessage,
      timestamp: enrichedError.timestamp,
      url: enrichedError.url,
      userAgent: enrichedError.userAgent,
    });

    // حفظ في قاعدة البيانات (اختياري)
    if (process.env.SAVE_CLIENT_ERRORS === 'true') {
      await saveClientError(enrichedError);
    }

    // إرسال إشعار للأخطاء الحرجة
    if (enrichedError.severity === 'CRITICAL' || enrichedError.severity === 'HIGH') {
      await sendCriticalErrorAlert(enrichedError);
    }

    // إرجاع استجابة نجاح
    res.status(200).json({
      success: true,
      data: {
        errorId: enrichedError.id,
        received: true,
        timestamp: new Date().toISOString(),
      },
      message: 'تم استلام تقرير الخطأ بنجاح',
    });
  } catch (error) {
    // معالجة أخطاء API
    console.error('[فشل] Error in client error reporting API:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ في معالجة تقرير الخطأ',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

// حفظ خطأ العميل في قاعدة البيانات
async function saveClientError(clientError: ClientErrorReport): Promise<void> {
  try {
    // يمكن استخدام Prisma أو أي ORM آخر
    // const savedError = await prisma.clientError.create({
    //   data: {
    //     id: clientError.id,
    //     type: clientError.type,
    //     severity: clientError.severity,
    //     message: clientError.message,
    //     userMessage: clientError.userMessage,
    //     timestamp: new Date(clientError.timestamp),
    //     statusCode: clientError.statusCode,
    //     metadata: clientError.metadata,
    //     userAgent: clientError.userAgent,
    //     url: clientError.url,
    //     userId: clientError.userId,
    //     sessionId: clientError.sessionId
    //   }
    // });
  } catch (error) {
    console.error('[فشل] Failed to save client error to database:', error);
  }
}

// إرسال تنبيه للأخطاء الحرجة
async function sendCriticalErrorAlert(clientError: ClientErrorReport): Promise<void> {
  try {
    // يمكن إرسال إيميل أو رسالة Slack أو إشعار push
    console.log('🚨 CRITICAL CLIENT ERROR ALERT:', {
      id: clientError.id,
      type: clientError.type,
      severity: clientError.severity,
      message: clientError.message,
      url: clientError.url,
      userAgent: clientError.userAgent,
      timestamp: clientError.timestamp,
    });

    // مثال على إرسال webhook إلى Slack
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🚨 خطأ حرج في العميل`,
          attachments: [
            {
              color: 'danger',
              fields: [
                {
                  title: 'نوع الخطأ',
                  value: clientError.type,
                  short: true,
                },
                {
                  title: 'مستوى الخطورة',
                  value: clientError.severity,
                  short: true,
                },
                {
                  title: 'الرسالة',
                  value: clientError.message,
                  short: false,
                },
                {
                  title: 'الصفحة',
                  value: clientError.url || 'غير محدد',
                  short: true,
                },
                {
                  title: 'الوقت',
                  value: new Date(clientError.timestamp).toLocaleString('ar-SA'),
                  short: true,
                },
              ],
            },
          ],
        }),
      });
    }

    // مثال على إرسال إيميل
    if (process.env.ADMIN_EMAIL && process.env.SENDGRID_API_KEY) {
      // يمكن استخدام SendGrid أو أي خدمة إيميل أخرى
    }
  } catch (error) {
    console.error('[فشل] Failed to send critical error alert:', error);
  }
}

// إضافة معلومات إضافية للطلب
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
