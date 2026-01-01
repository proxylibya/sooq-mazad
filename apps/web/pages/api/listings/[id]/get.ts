import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'معرف الإعلان مطلوب',
      });
    }

    console.log('[API] جلب بيانات الإعلان للتحرير:', id);

    // أولاً نحاول البحث في المزادات
    try {
      const auction = await dbHelpers.getAuctionById(id);
      
      if (auction) {
        console.log('[API] تم العثور على مزاد:', id);
        return res.status(200).json({
          success: true,
          type: 'auction',
          data: auction,
        });
      }
    } catch (error) {
      console.log('[API] لا يوجد مزاد بهذا المعرف، جاري البحث في السيارات...');
    }

    // إذا لم نجد مزاد، نبحث في السيارات
    try {
      const car = await dbHelpers.getCarById(id);
      
      if (car) {
        console.log('[API] تم العثور على سيارة:', id);
        return res.status(200).json({
          success: true,
          type: 'car',
          data: car,
        });
      }
    } catch (error) {
      console.log('[API] لا توجد سيارة بهذا المعرف');
    }

    // لم نجد الإعلان
    console.log('[API] لم يتم العثور على الإعلان:', id);
    return res.status(404).json({
      success: false,
      error: 'الإعلان غير موجود',
    });

  } catch (error) {
    console.error('[API] خطأ في جلب بيانات الإعلان:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}
