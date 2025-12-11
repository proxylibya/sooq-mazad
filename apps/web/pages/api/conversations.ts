import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../lib/prisma';
import { verifyToken } from '../../middleware/auth';
import { withApiRateLimit } from '../../utils/rateLimiter';

interface ConversationRequest {
  userId1?: string;
  userId2?: string;
  otherUserId?: string; // بديل مبسط - يُستخدم مع المستخدم المصادق
  title?: string;
  type?: 'DIRECT' | 'GROUP';
}

interface ConversationResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConversationResponse>,
) {
  try {
    const authUser = await verifyToken(req);

    switch (req.method) {
      case 'GET':
        return await getConversations(req, res, authUser?.id || null);
      case 'POST':
        if (!authUser?.id) return res.status(401).json({ success: false, error: 'Unauthorized' });
        return await createConversation(req, res, authUser.id);
      case 'PUT':
        if (!authUser?.id) return res.status(401).json({ success: false, error: 'Unauthorized' });
        return await updateConversation(req, res, authUser.id);
      case 'DELETE':
        if (!authUser?.id) return res.status(401).json({ success: false, error: 'Unauthorized' });
        return await deleteConversation(req, res, authUser.id);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('خطأ في API المحادثات:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

// جلب المحادثات
async function getConversations(req: NextApiRequest, res: NextApiResponse, authUserId: string | null) {
  try {
    const { userId, conversationId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'معرف المستخدم مطلوب',
      });
    }

    // If authenticated, enforce userId matches auth
    if (authUserId && String(authUserId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'غير مسموح' });
    }

    let result;

    if (conversationId) {
      // جلب محادثة محددة
      result = await dbHelpers.getConversationById(conversationId as string, userId as string);
    } else {
      // جلب جميع محادثات المستخدم
      result = await dbHelpers.getUserConversations(userId as string);
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('خطأ في جلب المحادثات:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب المحادثات',
    });
  }
}

// إنشاء محادثة جديدة
async function createConversation(req: NextApiRequest, res: NextApiResponse, authUserId: string) {
  try {
    const { userId1: rawUserId1, userId2: rawUserId2, otherUserId, title, type = 'DIRECT' }: ConversationRequest = req.body;

    // دعم otherUserId كبديل مبسط (يُستخدم المستخدم المصادق كـ userId1)
    let userId1 = rawUserId1;
    let userId2 = rawUserId2;

    if (otherUserId && !userId1 && !userId2) {
      userId1 = authUserId;
      userId2 = otherUserId;
    }

    // التحقق من صحة البيانات
    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        error: 'معرفات المستخدمين مطلوبة (userId1 و userId2) أو otherUserId',
      });
    }

    if (userId1 === userId2) {
      return res.status(400).json({
        success: false,
        error: 'لا يمكن إنشاء محادثة مع نفس المستخدم',
      });
    }

    // enforce that auth user is one of participants
    if (String(authUserId) !== String(userId1) && String(authUserId) !== String(userId2)) {
      return res.status(403).json({ success: false, error: 'غير مسموح' });
    }

    // التحقق من وجود المستخدمين
    const user1 = await dbHelpers.getUserById(userId1);
    const user2 = await dbHelpers.getUserById(userId2);

    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        error: 'أحد المستخدمين غير موجود',
      });
    }

    // إنشاء أو جلب المحادثة
    const conversation = await dbHelpers.getOrCreateDirectConversation(
      userId1.toString(),
      userId2.toString(),
    );

    return res.status(200).json({
      success: true,
      message: conversation.id ? 'تم جلب المحادثة الموجودة' : 'تم إنشاء محادثة جديدة',
      data: conversation,
    });
  } catch (error) {
    console.error('خطأ في إنشاء المحادثة:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
    });
  }
}

// تحديث محادثة
async function updateConversation(req: NextApiRequest, res: NextApiResponse, authUserId: string) {
  try {
    const { conversationId, userId, title, lastReadAt } = req.body;

    if (!conversationId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'معرف المحادثة ومعرف المستخدم مطلوبان',
      });
    }

    // enforce auth user matches provided userId
    if (String(authUserId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'غير مسموح' });
    }

    // تحديث وقت آخر قراءة إذا تم تمريره
    if (lastReadAt) {
      await dbHelpers.updateParticipantLastRead(conversationId, userId, new Date(lastReadAt));
    }

    // تحديث عنوان المحادثة إذا تم تمريره
    if (title) {
      await dbHelpers.updateConversationTitle(conversationId, title);
    }

    return res.status(200).json({
      success: true,
      message: 'تم تحديث المحادثة بنجاح',
    });
  } catch (error) {
    console.error('خطأ في تحديث المحادثة:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في تحديث المحادثة',
    });
  }
}

// حذف محادثة
async function deleteConversation(req: NextApiRequest, res: NextApiResponse, authUserId: string) {
  try {
    const { conversationId, userId } = req.body;

    if (!conversationId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'معرف المحادثة ومعرف المستخدم مطلوبان',
      });
    }

    // enforce auth user matches provided userId
    if (String(authUserId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'غير مسموح' });
    }

    // التحقق من أن المستخدم مشارك في المحادثة
    const isParticipant = await dbHelpers.isUserInConversation(conversationId, userId);

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'غير مسموح لك بحذف هذه المحادثة',
      });
    }

    // حذف المحادثة (سيتم حذف الرسائل تلقائياً بسبب CASCADE)
    await dbHelpers.deleteConversation(conversationId);

    return res.status(200).json({
      success: true,
      message: 'تم حذف المحادثة بنجاح',
    });
  } catch (error) {
    console.error('خطأ في حذف المحادثة:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في حذف المحادثة',
    });
  }
}

// تطبيق Rate Limiting على API المحادثات
export default withApiRateLimit(handler, {
  maxAttempts: 100, // 100 طلب في الدقيقة
  windowMs: 60 * 1000,
});
