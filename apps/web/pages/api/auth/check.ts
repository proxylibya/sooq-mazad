import { NextApiRequest, NextApiResponse } from 'next';
import { sessionManager } from '../../../lib/security/sessionManager';

// لا نحتاج PrismaClient هنا لأن sessionManager يتعامل معه

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // فحص وجود التوكن في الكوكيز أو الهيدر
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(200).json({
        authenticated: false,
        message: 'لا يوجد توكن مصادقة',
        user: null,
      });
    }

    // التحقق من صحة الجلسة باستخدام النظام المحسن
    const sessionResult = await sessionManager.verifySession(token);

    if (!sessionResult.valid) {
      // إذا كان التوكن منتهي الصلاحية، جرب التجديد
      if (sessionResult.error === 'انتهت صلاحية الجلسة') {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
          const renewResult = await sessionManager.renewSession(refreshToken);
          if (renewResult.success) {
            // تعيين الكوكيز الجديدة
            sessionManager.setSessionCookies(
              res,
              renewResult.accessToken!,
              renewResult.refreshToken!,
              renewResult.expiresAt!,
            );

            // إعادة التحقق من الجلسة الجديدة
            const newSessionResult = await sessionManager.verifySession(renewResult.accessToken!);
            if (newSessionResult.valid) {
              return res.status(200).json({
                authenticated: true,
                message: 'تم تجديد الجلسة بنجاح',
                user: {
                  id: newSessionResult.user!.id,
                  name: newSessionResult.user!.name,
                  email: newSessionResult.user!.email,
                  phone: newSessionResult.user!.phone,
                  role: newSessionResult.user!.role,
                  accountType: newSessionResult.user!.accountType,
                  verified: newSessionResult.user!.verified,
                  profileImage: newSessionResult.user!.profileImage,
                  createdAt: newSessionResult.user!.createdAt,
                },
                tokenValid: true,
                renewed: true,
              });
            }
          }
        }
      }

      return res.status(200).json({
        authenticated: false,
        message: sessionResult.error || 'الجلسة غير صالحة',
        user: null,
        tokenValid: false,
      });
    }

    // الجلسة صالحة
    return res.status(200).json({
      authenticated: true,
      message: 'المستخدم مصادق بنجاح',
      user: {
        id: sessionResult.user!.id,
        name: sessionResult.user!.name,
        email: sessionResult.user!.email,
        phone: sessionResult.user!.phone,
        role: sessionResult.user!.role,
        accountType: sessionResult.user!.accountType,
        verified: sessionResult.user!.verified,
        profileImage: sessionResult.user!.profileImage,
        createdAt: sessionResult.user!.createdAt,
      },
      tokenValid: true,
      needsRenewal: sessionResult.needsRenewal,
    });
  } catch (error) {
    console.error('خطأ في فحص المصادقة:', error);

    return res.status(500).json({
      authenticated: false,
      message: 'خطأ في الخادم أثناء فحص المصادقة',
      user: null,
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
    });
  }
}
