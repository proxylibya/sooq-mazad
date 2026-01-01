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

    const { id: messageId } = req.query;

    if (!messageId || typeof messageId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'معرف الرسالة مطلوب',
      });
    }

    switch (req.method) {
      case 'DELETE':
        return await deleteMessage(messageId, authUser.id, req, res);
      default:
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('[API /api/messages/[id]] خطأ:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

async function deleteMessage(
  messageId: string,
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // حذف الرسالة (الدالة تتحقق من المالك تلقائياً)
    const deleted = await dbHelpers.deleteMessage(messageId, userId);

    if (!deleted) {
      return res.status(403).json({
        success: false,
        error: 'الرسالة غير موجودة أو غير مسموح لك بحذفها',
      });
    }

    console.log(`[Message Delete] تم حذف الرسالة ${messageId} بواسطة المستخدم ${userId}`);

    return res.status(200).json({
      success: true,
      message: 'تم حذف الرسالة بنجاح',
    });
  } catch (error) {
    console.error('[Message Delete] خطأ في الحذف:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في حذف الرسالة',
    });
  }
}

export default withApiRateLimit(handler, {
  maxAttempts: 100,
  windowMs: 60 * 1000,
});
