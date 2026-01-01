import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getUserListings(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('[خطأ حرج] خطأ في API إعلانات المستخدم:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
    });
  }
}

async function getUserListings(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      console.log('[فشل] معرف المستخدم مفقود أو غير صحيح:', {
        userId,
        type: typeof userId,
      });
      return res.status(400).json({
        success: false,
        error: 'معرف المستخدم مطلوب',
      });
    }

    // جلب إعلانات المستخدم من قاعدة البيانات
    const listings = await dbHelpers.getUserListings(userId);

    // التحقق من صحة النتائج
    if (!Array.isArray(listings)) {
      console.error('[خطأ] getUserListings لم يرجع مصفوفة:', typeof listings);
      return res.status(500).json({
        success: false,
        error: 'خطأ في معالجة البيانات',
      });
    }

    console.log(`[نجح] تم جلب ${listings.length} إعلان للمستخدم ${userId}`);

    // طباعة عينة من الإعلانات للتشخيص
    if (listings.length > 0) {
      console.log(
        '[معلومات] عينة من الإعلانات:',
        listings.slice(0, 2).map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          status: l.status,
          hasImage: !!l.image,
        })),
      );
    }

    return res.status(200).json({
      success: true,
      listings,
      count: listings.length,
    });
  } catch (error) {
    console.error('[خطأ] خطأ في جلب إعلانات المستخدم:', error);
    console.error('[تفاصيل] تفاصيل الخطأ:', {
      message: error instanceof Error ? error.message : 'خطأ غير معروف',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب الإعلانات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
    });
  }
}
