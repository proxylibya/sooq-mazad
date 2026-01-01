import { NextApiRequest, NextApiResponse } from 'next';

interface ImprovementNotification {
  id: string;
  userId: string;
  listingId: string;
  listingTitle: string;
  type: 'image_improvement' | 'content_improvement' | 'general_improvement';
  title: string;
  message: string;
  suggestions: string[];
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  createdAt: Date;
  read: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        return await createImprovementNotification(req, res);
      case 'GET':
        return await getImprovementNotifications(req, res);
      default:
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('خطأ في API إشعارات التحسين:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

// إنشاء إشعار تحسين جديد
async function createImprovementNotification(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, listingId, listingTitle, improvementType, invalidImagesCount, suggestions } =
      req.body;

    if (!userId || !listingId || !listingTitle) {
      return res.status(400).json({
        success: false,
        error: 'البيانات المطلوبة غير مكتملة',
      });
    }

    // إنشاء إشعار لطيف ومفيد
    const notification = createFriendlyNotification({
      userId,
      listingId,
      listingTitle,
      improvementType,
      invalidImagesCount,
      suggestions,
    });

    // في التطبيق الحقيقي، سيتم حفظ الإشعار في قاعدة البيانات

    // محاكاة إرسال الإشعار
    await sendFriendlyNotification(notification);

    return res.status(201).json({
      success: true,
      message: 'تم إرسال إشعار التحسين بنجاح',
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
      },
    });
  } catch (error) {
    console.error('خطأ في إنشاء إشعار التحسين:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في إرسال إشعار التحسين',
    });
  }
}

// الحصول على إشعارات التحسين للمستخدم
async function getImprovementNotifications(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, limit = '10' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'معرف المستخدم مطلوب',
      });
    }

    // جلب الإشعارات الحقيقية من قاعدة البيانات
    // TODO: تنفيذ جلب إشعارات التحسين من قاعدة البيانات
    const notifications: ImprovementNotification[] = [];

    return res.status(200).json({
      success: true,
      notifications: notifications.slice(0, parseInt(limit as string)),
    });
  } catch (error) {
    console.error('خطأ في جلب إشعارات التحسين:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب إشعارات التحسين',
    });
  }
}

// دالة لإنشاء إشعار لطيف ومفيد
function createFriendlyNotification(params: {
  userId: string;
  listingId: string;
  listingTitle: string;
  improvementType: string;
  invalidImagesCount?: number;
  suggestions?: string[];
}): ImprovementNotification {
  const { userId, listingId, listingTitle, improvementType, invalidImagesCount, suggestions } =
    params;

  const title = 'يمكنك تحسين إعلانك';
  let message = `إعلان "${listingTitle}" منشور بنجاح!`;
  let priority: 'low' | 'medium' | 'high' = 'medium';

  if (improvementType === 'image_improvement' && invalidImagesCount) {
    message += ` يمكنك جعله أكثر جاذبية بإصلاح ${invalidImagesCount} صورة`;
    priority = invalidImagesCount > 2 ? 'high' : 'medium';
  }

  return {
    id: `improvement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    listingId,
    listingTitle,
    type: 'image_improvement',
    title,
    message,
    suggestions: suggestions || [],
    priority,
    actionUrl: `/edit-listing/${listingId}`,
    createdAt: new Date(),
    read: false,
  };
}

// دالة لإرسال الإشعار بطريقة لطيفة
async function sendFriendlyNotification(notification: ImprovementNotification): Promise<void> {
  try {
    // في التطبيق الحقيقي، سيتم إرسال الإشعار عبر:
    // - إشعار داخل التطبيق
    // - بريد إلكتروني لطيف (اختياري)
    // - Push notification (اختياري)

    console.log(`📱 إرسال إشعار لطيف للمستخدم ${notification.userId}:`, {
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
    });

    // محاكاة تأخير الإرسال
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
    // لا نرمي خطأ هنا لأن فشل الإشعار لا يجب أن يؤثر على نجاح العملية الأساسية
  }
}
