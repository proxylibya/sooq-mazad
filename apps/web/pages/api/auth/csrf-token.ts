import { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit, apiRateLimit } from '../../../middleware/rateLimiter';
import { generateCSRFToken } from '../../../utils/security';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'طريقة غير مدعومة',
    });
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'معرف الجلسة مطلوب',
      });
    }

    // إنشاء CSRF token
    const token = generateCSRFToken(sessionId);

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('خطأ في إنشاء CSRF token:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم',
    });
  }
}

export default withRateLimit(handler, apiRateLimit);
