import { NextApiRequest, NextApiResponse } from 'next';
import { SecurityLogger } from '../../lib/security';

// تخزين البلاغات في الذاكرة (في الإنتاج يجب استخدام قاعدة بيانات)
const reportsStore = new Map<string, Report[]>();
const blockedUsers = new Set<string>();

interface Report {
  id: string;
  reporterId: string;
  targetType: 'message' | 'user' | 'conversation';
  targetId: string;
  type: string;
  reason: string;
  description: string;
  evidence?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  action?: string;
}

interface BlockedUser {
  userId: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
  duration?: number; // بالساعات، undefined = دائم
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        return await createReport(req, res);
      case 'GET':
        return await getReports(req, res);
      case 'PUT':
        return await updateReport(req, res);
      case 'DELETE':
        return await deleteReport(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('خطأ في API البلاغات:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

// إنشاء بلاغ جديد
async function createReport(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { reporterId, targetType, targetId, type, reason, description, evidence } = req.body;

    // التحقق من البيانات المطلوبة
    if (!reporterId || !targetType || !targetId || !type || !reason || !description) {
      return res.status(400).json({
        success: false,
        error: 'بيانات غير مكتملة',
      });
    }

    // التحقق من أن المستخدم لم يتم حظره
    if (blockedUsers.has(reporterId)) {
      return res.status(403).json({
        success: false,
        error: 'تم حظر حسابك من إرسال البلاغات',
      });
    }

    // فحص معدل البلاغات (حد أقصى 5 بلاغات في الساعة)
    const userReports = getUserReports(reporterId);
    const recentReports = userReports.filter((report) => {
      const reportTime = new Date(report.createdAt).getTime();
      const hourAgo = Date.now() - 60 * 60 * 1000;
      return reportTime > hourAgo;
    });

    if (recentReports.length >= 5) {
      return res.status(429).json({
        success: false,
        error: 'تم تجاوز حد البلاغات المسموح (5 بلاغات/ساعة)',
      });
    }

    // إنشاء البلاغ
    const report: Report = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reporterId,
      targetType,
      targetId,
      type,
      reason,
      description,
      evidence,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // حفظ البلاغ
    const targetReports = reportsStore.get(targetId) || [];
    targetReports.push(report);
    reportsStore.set(targetId, targetReports);

    // تسجيل في سجل الأمان
    SecurityLogger.log(
      reporterId,
      'REPORT_CREATED',
      {
        reportId: report.id,
        targetType,
        targetId,
        type,
        reason,
      },
      'medium',
    );

    // فحص إذا كان الهدف يحتاج إجراء فوري
    await checkForImmediateAction(report);

    return res.status(201).json({
      success: true,
      data: {
        reportId: report.id,
        status: report.status,
      },
    });
  } catch (error) {
    console.error('خطأ في إنشاء البلاغ:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في إنشاء البلاغ',
    });
  }
}

// جلب البلاغات
async function getReports(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { targetId, reporterId, status, limit = '50' } = req.query;
    const limitNum = parseInt(limit as string);

    let allReports: Report[] = [];

    if (targetId) {
      // جلب بلاغات هدف محدد
      allReports = reportsStore.get(targetId as string) || [];
    } else if (reporterId) {
      // جلب بلاغات مستخدم محدد
      allReports = getUserReports(reporterId as string);
    } else {
      // جلب جميع البلاغات
      for (const reports of reportsStore.values()) {
        allReports.push(...reports);
      }
    }

    // فلترة حسب الحالة
    if (status) {
      allReports = allReports.filter((report) => report.status === status);
    }

    // ترتيب حسب التاريخ (الأحدث أولاً)
    allReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // تحديد العدد
    allReports = allReports.slice(0, limitNum);

    return res.status(200).json({
      success: true,
      data: allReports,
      total: allReports.length,
    });
  } catch (error) {
    console.error('خطأ في جلب البلاغات:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب البلاغات',
    });
  }
}

// تحديث حالة البلاغ
async function updateReport(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { reportId, status, reviewedBy, action } = req.body;

    if (!reportId || !status || !reviewedBy) {
      return res.status(400).json({
        success: false,
        error: 'بيانات غير مكتملة',
      });
    }

    // البحث عن البلاغ
    let foundReport: Report | null = null;
    let targetId: string | null = null;

    for (const [id, reports] of reportsStore.entries()) {
      const report = reports.find((r) => r.id === reportId);
      if (report) {
        foundReport = report;
        targetId = id;
        break;
      }
    }

    if (!foundReport || !targetId) {
      return res.status(404).json({
        success: false,
        error: 'البلاغ غير موجود',
      });
    }

    // تحديث البلاغ
    foundReport.status = status;
    foundReport.reviewedAt = new Date().toISOString();
    foundReport.reviewedBy = reviewedBy;
    if (action) foundReport.action = action;

    // تسجيل في سجل الأمان
    SecurityLogger.log(
      reviewedBy,
      'REPORT_REVIEWED',
      {
        reportId,
        status,
        action,
        originalReporter: foundReport.reporterId,
      },
      'medium',
    );

    // تنفيذ الإجراء إذا لزم الأمر
    if (status === 'resolved' && action) {
      await executeAction(foundReport, action, reviewedBy);
    }

    return res.status(200).json({
      success: true,
      data: foundReport,
    });
  } catch (error) {
    console.error('خطأ في تحديث البلاغ:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في تحديث البلاغ',
    });
  }
}

// حذف البلاغ
async function deleteReport(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { reportId } = req.query;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        error: 'معرف البلاغ مطلوب',
      });
    }

    // البحث عن البلاغ وحذفه
    let deleted = false;

    for (const [targetId, reports] of reportsStore.entries()) {
      const reportIndex = reports.findIndex((r) => r.id === reportId);
      if (reportIndex !== -1) {
        reports.splice(reportIndex, 1);
        if (reports.length === 0) {
          reportsStore.delete(targetId);
        }
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'البلاغ غير موجود',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'تم حذف البلاغ بنجاح',
    });
  } catch (error) {
    console.error('خطأ في حذف البلاغ:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في حذف البلاغ',
    });
  }
}

// دوال مساعدة
function getUserReports(reporterId: string): Report[] {
  const userReports: Report[] = [];
  for (const reports of reportsStore.values()) {
    userReports.push(...reports.filter((r) => r.reporterId === reporterId));
  }
  return userReports;
}

// فحص الحاجة لإجراء فوري
async function checkForImmediateAction(report: Report) {
  const targetReports = reportsStore.get(report.targetId) || [];

  // إذا كان هناك 3 بلاغات أو أكثر لنفس الهدف في آخر 24 ساعة
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentReports = targetReports.filter((r) => {
    const reportTime = new Date(r.createdAt).getTime();
    return reportTime > dayAgo && r.status === 'pending';
  });

  if (recentReports.length >= 3) {
    // تعليق تلقائي مؤقت
    SecurityLogger.log(
      'system',
      'AUTO_SUSPEND',
      {
        targetId: report.targetId,
        targetType: report.targetType,
        reportsCount: recentReports.length,
        reason: 'Multiple reports in 24 hours',
      },
      'high',
    );

    // يمكن إضافة منطق التعليق هنا
  }
}

// تنفيذ الإجراء
async function executeAction(report: Report, action: string, reviewedBy: string) {
  switch (action) {
    case 'block_user':
      if (report.targetType === 'user') {
        blockedUsers.add(report.targetId);
        SecurityLogger.log(
          reviewedBy,
          'USER_BLOCKED',
          {
            blockedUserId: report.targetId,
            reason: report.reason,
            reportId: report.id,
          },
          'high',
        );
      }
      break;

    case 'delete_message':
      if (report.targetType === 'message') {
        // منطق حذف الرسالة
        SecurityLogger.log(
          reviewedBy,
          'MESSAGE_DELETED',
          {
            messageId: report.targetId,
            reason: report.reason,
            reportId: report.id,
          },
          'medium',
        );
      }
      break;

    case 'warn_user':
      SecurityLogger.log(
        reviewedBy,
        'USER_WARNED',
        {
          warnedUserId: report.targetId,
          reason: report.reason,
          reportId: report.id,
        },
        'low',
      );
      break;
  }
}
