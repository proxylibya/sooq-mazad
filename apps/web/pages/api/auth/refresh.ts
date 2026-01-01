import { NextApiRequest, NextApiResponse } from 'next';
import { sessionManager } from '../../../lib/security/sessionManager';

interface RefreshResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    role: string;
    accountType: string;
    verified: boolean;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<RefreshResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'طريقة غير مدعومة',
    });
  }

  try {
    // الحصول على refresh token من الكوكيز أو الطلب
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'رمز التجديد مطلوب',
      });
    }

    // تجديد الجلسة باستخدام النظام المحسن
    const renewResult = await sessionManager.renewSession(refreshToken);

    if (!renewResult.success) {
      // مسح الكوكيز في حالة فشل التجديد
      sessionManager.clearSessionCookies(res);

      return res.status(401).json({
        success: false,
        error: renewResult.error || 'فشل في تجديد الجلسة',
      });
    }

    // تعيين الكوكيز الجديدة
    sessionManager.setSessionCookies(
      res,
      renewResult.accessToken!,
      renewResult.refreshToken!,
      renewResult.expiresAt!,
    );

    // التحقق من الجلسة الجديدة للحصول على بيانات المستخدم
    const sessionResult = await sessionManager.verifySession(renewResult.accessToken!);

    if (!sessionResult.valid) {
      return res.status(500).json({
        success: false,
        error: 'خطأ في التحقق من الجلسة الجديدة',
      });
    }

    console.log(`[التحديث] تم تجديد الجلسة بنجاح للمستخدم: ${sessionResult.user!.name}`);

    return res.status(200).json({
      success: true,
      message: 'تم تجديد الجلسة بنجاح',
      token: renewResult.accessToken,
      user: {
        id: sessionResult.user!.id,
        name: sessionResult.user!.name,
        phone: sessionResult.user!.phone,
        email: sessionResult.user!.email,
        role: sessionResult.user!.role,
        accountType: sessionResult.user!.accountType,
        verified: sessionResult.user!.verified,
      },
    });
  } catch (error) {
    console.error('خطأ في تجديد الجلسة:', error);

    // مسح الكوكيز في حالة الخطأ
    sessionManager.clearSessionCookies(res);

    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء تجديد الجلسة',
    });
  }
}
