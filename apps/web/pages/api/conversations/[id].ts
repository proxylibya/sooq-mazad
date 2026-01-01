import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../lib/prisma';
import { verifyToken } from '../../../middleware/auth';
import { withApiRateLimit } from '../../../utils/rateLimiter';

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  try {
    const authUser = await verifyToken(req);
    
    if (!authUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'يجب تسجيل الدخول' 
      });
    }

    const { id: conversationId } = req.query;

    if (!conversationId || typeof conversationId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'معرف المحادثة مطلوب',
      });
    }

    switch (req.method) {
      case 'DELETE':
        return await deleteConversation(conversationId, authUser.id, res);
      default:
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('[API /api/conversations/[id]] خطأ:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

async function deleteConversation(
  conversationId: string,
  userId: string,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // التحقق من أن المستخدم مشارك في المحادثة
    const isParticipant = await dbHelpers.isUserInConversation(conversationId, userId);

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'غير مسموح لك بحذف هذه المحادثة',
      });
    }

    // حذف المحادثة (سيتم حذف الرسائل تلقائياً بسبب CASCADE في قاعدة البيانات)
    await dbHelpers.deleteConversation(conversationId);

    console.log(`[Conversation Delete] تم حذف المحادثة ${conversationId} بواسطة المستخدم ${userId}`);

    return res.status(200).json({
      success: true,
      message: 'تم حذف المحادثة بنجاح',
    });
  } catch (error) {
    console.error('[Conversation Delete] خطأ في الحذف:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في حذف المحادثة',
    });
  }
}

export default withApiRateLimit(handler, {
  maxAttempts: 50,
  windowMs: 60 * 1000,
});
