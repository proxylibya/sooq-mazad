import { NextApiRequest, NextApiResponse } from 'next';
import {
  VerificationStatus,
  UserVerificationStatus,
  VerificationLevel,
  DocumentType,
} from '../../../types/verification';

interface VerificationStatusResponse {
  success: boolean;
  message: string;
  data?: UserVerificationStatus;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerificationStatusResponse>,
) {
  const { method, query } = req;
  const userId = query.userId as string;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'معرف المستخدم مطلوب',
    });
  }

  switch (method) {
    case 'GET':
      return handleGetVerificationStatus(req, res, userId);
    case 'POST':
      return handleUpdateVerificationStatus(req, res, userId);
    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
}

// الحصول على حالة التحقق للمستخدم
async function handleGetVerificationStatus(
  req: NextApiRequest,
  res: NextApiResponse<VerificationStatusResponse>,
  userId: string,
) {
  try {
    // في التطبيق الحقيقي، ستستعلم من قاعدة البيانات
    // هنا نعيد بيانات تجريبية محدثة
    const mockVerificationStatus: UserVerificationStatus = {
      id: `verification_${userId}`,
      userId,
      phoneVerified: true, // الهاتف مؤكد تلقائياً (لا يوجد نظام SMS)
      emailVerified: false,
      identityVerified: false,
      addressVerified: false,
      bankAccountVerified: false,
      isVerified: false,
      verificationLevel: VerificationLevel.BASIC,
      level: VerificationLevel.BASIC,
      documents: [],
      checks: [],
      verifiedDocuments: [],
      verificationHistory: [
        {
          id: 'verify_123456789',
          userId,
          documentType: DocumentType.NATIONAL_ID,
          frontImage: '',
          status: VerificationStatus.PENDING,
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // قبل يوم واحد
          extractedData: {
            fullName: 'غير محدد',
            dateOfBirth: 'غير محدد',
            documentNumber: 'غير محدد',
            nationality: 'غير محدد',
          },
          aiAnalysis: {
            isAuthentic: true,
            confidenceScore: 92,
            detectedIssues: [],
            qualityScore: 88,
            documentQuality: {
              brightness: 85,
              contrast: 90,
              sharpness: 88,
              resolution: 95,
            },
            securityFeatures: {
              watermark: true,
              hologram: true,
              microtext: true,
              uvFeatures: false,
            },
            processingStatus: 'completed',
            reviewStatus: 'pending_manual_review',
          },
        },
      ],
    };

    // تحديد مستوى التحقق بناءً على الوثائق المؤكدة
    const verifiedDocsCount = mockVerificationStatus.verificationHistory.filter(
      (h) => h.status === VerificationStatus.APPROVED,
    ).length;

    if (verifiedDocsCount >= 3) {
      mockVerificationStatus.verificationLevel = VerificationLevel.PREMIUM;
      mockVerificationStatus.level = VerificationLevel.PREMIUM;
    } else if (verifiedDocsCount >= 2) {
      mockVerificationStatus.verificationLevel = VerificationLevel.STANDARD;
      mockVerificationStatus.level = VerificationLevel.STANDARD;
    }

    // تحديث حالة التحقق العامة
    mockVerificationStatus.isVerified = verifiedDocsCount > 0;
    mockVerificationStatus.identityVerified = mockVerificationStatus.verificationHistory.some(
      (h) =>
        h.documentType === DocumentType.NATIONAL_ID && h.status === VerificationStatus.APPROVED,
    );

    res.status(200).json({
      success: true,
      message: 'تم الحصول على حالة التحقق بنجاح',
      data: mockVerificationStatus,
    });
  } catch (error) {
    console.error('خطأ في جلب حالة التحقق:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب حالة التحقق',
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
    });
  }
}

// تحديث حالة التحقق
async function handleUpdateVerificationStatus(
  req: NextApiRequest,
  res: NextApiResponse<VerificationStatusResponse>,
  userId: string,
) {
  try {
    const { status, documentType, rejectionReason } = req.body;

    if (!status || !documentType) {
      return res.status(400).json({
        success: false,
        message: 'الحالة ونوع الوثيقة مطلوبان',
      });
    }

    // التحقق من صحة الحالة
    if (!Object.values(VerificationStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'حالة التحقق غير صحيحة',
      });
    }

    // في التطبيق الحقيقي، ستحدث قاعدة البيانات
    console.log(`تحديث حالة التحقق للمستخدم ${userId}:`, {
      status,
      documentType,
      rejectionReason,
    });

    // محاكاة تحديث البيانات
    const updatedStatus: UserVerificationStatus = {
      id: `verification_${userId}`,
      userId,
      phoneVerified: true,
      emailVerified: false,
      identityVerified:
        status === VerificationStatus.APPROVED && documentType === DocumentType.NATIONAL_ID,
      addressVerified: false,
      bankAccountVerified: false,
      isVerified: status === VerificationStatus.APPROVED,
      verificationLevel:
        status === VerificationStatus.APPROVED
          ? VerificationLevel.STANDARD
          : VerificationLevel.BASIC,
      level:
        status === VerificationStatus.APPROVED
          ? VerificationLevel.STANDARD
          : VerificationLevel.BASIC,
      documents: [],
      checks: [],
      verifiedDocuments: status === VerificationStatus.APPROVED ? [documentType] : [],
      verificationHistory: [
        {
          id: 'verify_updated_' + Date.now(),
          userId,
          documentType,
          frontImage: '',
          status,
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          reviewedAt: new Date(),
          rejectionReason,
          extractedData: {
            fullName: 'أحمد محمد السالم',
            dateOfBirth: '1990-05-15',
            documentNumber: '1234567890',
            nationality: 'ليبي',
          },
          aiAnalysis: {
            isAuthentic: true,
            confidenceScore: 92,
            detectedIssues: rejectionReason ? [rejectionReason] : [],
            qualityScore: 88,
            reviewCompleted: true,
            finalDecision: status,
          },
        },
      ],
    };

    // إرسال إشعار للمستخدم
    await sendStatusUpdateNotification(userId, status, rejectionReason);

    res.status(200).json({
      success: true,
      message: getUpdateMessage(status),
      data: updatedStatus,
    });
  } catch (error) {
    console.error('خطأ في تحديث حالة التحقق:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث حالة التحقق',
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
    });
  }
}

// دالة للحصول على رسالة التحديث
function getUpdateMessage(status: VerificationStatus): string {
  switch (status) {
    case VerificationStatus.APPROVED:
      return 'تم قبول طلب التحقق بنجاح';
    case VerificationStatus.REJECTED:
      return 'تم رفض طلب التحقق';
    case VerificationStatus.UNDER_REVIEW:
      return 'طلب التحقق قيد المراجعة';
    case VerificationStatus.PENDING:
      return 'طلب التحقق في انتظار المعالجة';
    case VerificationStatus.EXPIRED:
      return 'انتهت صلاحية طلب التحقق';
    default:
      return 'تم تحديث حالة التحقق';
  }
}

// دالة لإرسال إشعار تحديث الحالة
async function sendStatusUpdateNotification(
  userId: string,
  newStatus: VerificationStatus,
  rejectionReason?: string,
): Promise<void> {
  try {
    let message = '';
    let title = '';

    switch (newStatus) {
      case VerificationStatus.APPROVED:
        title = 'تم قبول طلب التحقق';
        message = '[SUCCESS] تهانينا! تم قبول وثيقتك وحسابك الآن موثق.';
        break;
      case VerificationStatus.REJECTED:
        title = 'تم رفض طلب التحقق';
        message = `[ERROR] تم رفض طلب التحقق. ${rejectionReason ? `السبب: ${rejectionReason}` : 'يرجى المحاولة مرة أخرى بوثيقة أوضح.'}`;
        break;
      case VerificationStatus.UNDER_REVIEW:
        title = 'طلب التحقق قيد المراجعة';
        message = '[CLOCK] وثيقتك قيد المراجعة. سنرسل لك إشعاراً عند اكتمال المراجعة.';
        break;
      case VerificationStatus.PENDING:
        title = 'تم استلام طلب التحقق';
        message = '[DOCUMENT] تم استلام طلب التحقق وسيتم معالجته قريباً.';
        break;
      default:
        title = 'تحديث حالة التحقق';
        message = 'تم تحديث حالة طلب التحقق الخاص بك.';
    }

    // في التطبيق الحقيقي، سيتم إرسال الإشعار عبر:
    // - البريد الإلكتروني
    // - رسالة نصية
    // - إشعار داخل التطبيق
    // - Push notification

    console.log(`إرسال إشعار للمستخدم ${userId}:`, {
      title,
      message,
      status: newStatus,
    });

    // محاكاة حفظ الإشعار في قاعدة البيانات
    const notificationData = {
      id: `notification_${Date.now()}`,
      userId,
      type: 'verification_status_update',
      title,
      message,
      data: {
        verificationStatus: newStatus,
        rejectionReason,
      },
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
    };
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
    // لا نرمي خطأ هنا لأن فشل الإشعار لا يجب أن يؤثر على نجاح العملية الأساسية
  }
}

// دالة للحصول على إحصائيات التحقق
export async function getVerificationStats(userId: string) {
  try {
    // في التطبيق الحقيقي، ستستعلم من قاعدة البيانات
    const stats = {
      totalSubmissions: 1,
      approvedDocuments: 0,
      rejectedDocuments: 0,
      pendingReview: 1,
      verificationLevel: VerificationLevel.BASIC,
      completionPercentage: 25, // 25% مكتمل
      estimatedCompletionTime: '24-48 ساعة',
      lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      nextSteps: [
        'انتظار مراجعة الهوية الوطنية',
        'رفع إثبات العنوان (اختياري)',
        'رفع كشف بنكي (اختياري)',
      ],
    };

    return stats;
  } catch (error) {
    console.error('خطأ في جلب إحصائيات التحقق:', error);
    return null;
  }
}
