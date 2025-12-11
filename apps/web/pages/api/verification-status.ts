import { NextApiRequest, NextApiResponse } from 'next';
import {
  VerificationStatus,
  UserVerificationStatus,
  VerificationLevel,
} from '../../types/verification';

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
    // هنا نعيد بيانات تجريبية
    const mockVerificationStatus: UserVerificationStatus = {
      id: `verification_${userId}`,
      userId,
      phoneVerified: false,
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
          documentType: 'national_id',
          frontImage: '',
          status: VerificationStatus.UNDER_REVIEW,
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // قبل يومين
          extractedData: {
            fullName: 'غير محدد',
            dateOfBirth: 'غير محدد',
            documentNumber: 'غير محدد',
            nationality: 'غير محدد',
          },
          aiAnalysis: {
            isAuthentic: true,
            confidenceScore: 85,
            detectedIssues: ['إضاءة غير كافية'],
            qualityScore: 82,
            documentQuality: {
              brightness: 75,
              contrast: 80,
              sharpness: 85,
              resolution: 90,
            },
            securityFeatures: {
              watermark: true,
              hologram: false,
              microtext: true,
              uvFeatures: false,
            },
          },
        },
      ],
    };

    res.status(200).json({
      success: true,
      message: 'تم الحصول على حالة التحقق بنجاح',
      data: mockVerificationStatus,
    });
  } catch (error) {
    console.error('خطأ في الحصول على حالة التحقق:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء الحصول على حالة التحقق',
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
    const { verificationId, newStatus, reviewerId, rejectionReason } = req.body;

    if (!verificationId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: 'معرف التحقق والحالة الجديدة مطلوبان',
      });
    }

    // التحقق من صحة الحالة الجديدة
    if (!Object.values(VerificationStatus).includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'حالة التحقق غير صحيحة',
      });
    }

    // في التطبيق الحقيقي، ستحدث قاعدة البيانات
    // تم إزالة console.log لأسباب أمنية

    if (reviewerId) {
      // تم إزالة console.log لأسباب أمنية
    }

    if (rejectionReason && newStatus === VerificationStatus.REJECTED) {
      // تم إزالة console.log لأسباب أمنية
    }

    // إرسال إشعار للمستخدم
    await sendStatusUpdateNotification(userId, newStatus, rejectionReason);

    // تحديث مستوى التحقق إذا تمت الموافقة
    let newVerificationLevel = VerificationLevel.BASIC;
    if (newStatus === VerificationStatus.APPROVED) {
      newVerificationLevel = VerificationLevel.STANDARD;
    }

    const updatedStatus: UserVerificationStatus = {
      id: `verification_${userId}`,
      userId,
      phoneVerified: false,
      emailVerified: false,
      identityVerified: newStatus === VerificationStatus.APPROVED,
      addressVerified: false,
      bankAccountVerified: false,
      isVerified: newStatus === VerificationStatus.APPROVED,
      verificationLevel: newVerificationLevel,
      level: newVerificationLevel,
      documents: [],
      checks: [],
      verifiedDocuments: newStatus === VerificationStatus.APPROVED ? ['national_id'] : [],
      verificationHistory: [], // في التطبيق الحقيقي، ستحدث السجل
    };

    res.status(200).json({
      success: true,
      message: getUpdateMessage(newStatus),
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
      return 'تم قبول التحقق بنجاح! حسابك الآن موثق.';
    case VerificationStatus.REJECTED:
      return 'تم رفض طلب التحقق.';
    case VerificationStatus.UNDER_REVIEW:
      return 'تم وضع طلب التحقق قيد المراجعة.';
    case VerificationStatus.PENDING:
      return 'تم تحديث حالة طلب التحقق إلى معلق.';
    default:
      return 'تم تحديث حالة التحقق.';
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

    switch (newStatus) {
      case VerificationStatus.APPROVED:
        message = '[SUCCESS] تهانينا! تم قبول وثيقتك وحسابك الآن موثق.';
        break;
      case VerificationStatus.REJECTED:
        message = `[ERROR] تم رفض طلب التحقق. ${rejectionReason ? `السبب: ${rejectionReason}` : 'يرجى المحاولة مرة أخرى بوثيقة أوضح.'}`;
        break;
      case VerificationStatus.UNDER_REVIEW:
        message = '[CLOCK] وثيقتك قيد المراجعة. سنرسل لك إشعاراً عند اكتمال المراجعة.';
        break;
      default:
        message = 'تم تحديث حالة طلب التحقق الخاص بك.';
    }

    // في التطبيق الحقيقي، ستستخدم خدمة إشعارات حقيقية

    // يمكن إضافة إرسال SMS أو بريد إلكتروني أو push notification هنا
  } catch (error) {
    console.error('خطأ في إرسال إشعار تحديث الحالة:', error);
  }
}

// دالة مساعدة للحصول على إحصائيات التحقق (للإدارة)
export async function getVerificationStats() {
  // في التطبيق الحقيقي، ستستعلم من قاعدة البيانات
  return {
    totalRequests: 1250,
    pendingRequests: 45,
    approvedRequests: 980,
    rejectedRequests: 225,
    averageReviewTime: '18 ساعة',
    successRate: 78.4,
  };
}

// دالة للحصول على طلبات التحقق المعلقة (للمراجعين)
export async function getPendingVerifications(limit: number = 50) {
  // في التطبيق الحقيقي، ستستعلم من قاعدة البيانات
  return {
    requests: [],
    total: 45,
    page: 1,
    limit,
  };
}
