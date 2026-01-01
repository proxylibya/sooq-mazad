import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'معرف الإعلان مطلوب',
      });
    }

    switch (req.method) {
      case 'DELETE':
        return await deleteListing(req, res, id);
      case 'PUT':
        return await updateListing(req, res, id);
      default:
        res.setHeader('Allow', ['DELETE', 'PUT']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('خطأ في API الإعلان:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

async function deleteListing(req: NextApiRequest, res: NextApiResponse, listingId: string) {
  try {
    console.log('🗑️ محاولة حذف الإعلان:', listingId);

    // التحقق من نوع الإعلان (سيارة أم مزاد)
    // أولاً نحاول البحث في جدول المزادات
    try {
      const auction = await dbHelpers.getAuctionById(listingId);

      if (auction) {
        // إذا كان مزاد، نحذفه مع السيارة المرتبطة به
        await dbHelpers.deleteAuction(listingId);

        // حذف السيارة المرتبطة بالمزاد أيضاً
        if (auction.carId) {
          await dbHelpers.deleteCar(auction.carId);
        }

        console.log('[تم بنجاح] تم حذف المزاد والسيارة المرتبطة:', listingId);

        return res.status(200).json({
          success: true,
          message: 'تم حذف المزاد بنجاح',
          type: 'auction',
        });
      }
    } catch (auctionError) {
      console.log('[البحث] لم يتم العثور على مزاد بهذا المعرف، جاري البحث في السيارات...');
    }

    // إذا لم يكن مزاد، نحاول البحث في جدول السيارات
    try {
      const car = await dbHelpers.getCarById(listingId);

      if (car) {
        // إذا كانت سيارة، نحذفها
        await dbHelpers.deleteCar(listingId);
        console.log('[تم بنجاح] تم حذف السيارة:', listingId);

        return res.status(200).json({
          success: true,
          message: 'تم حذف الإعلان بنجاح',
          type: 'car',
        });
      }
    } catch (carError) {
      console.log('[البحث] لم يتم العثور على سيارة بهذا المعرف');
    }

    // إذا لم يتم العثور على الإعلان
    console.log('[فشل] لم يتم العثور على الإعلان:', listingId);
    return res.status(404).json({
      success: false,
      error: 'الإعلان غير موجود',
    });
  } catch (error) {
    console.error('[فشل] خطأ في حذف الإعلان:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في حذف الإعلان',
    });
  }
}

async function updateListing(req: NextApiRequest, res: NextApiResponse, listingId: string) {
  try {
    const updateData = req.body;
    console.log('[التحرير] محاولة تحديث الإعلان:', listingId, updateData);

    // التحقق من نوع الإعلان (سيارة أم مزاد)
    const car = await dbHelpers.getCarById(listingId);

    if (car) {
      // إذا كانت سيارة، نحدثها
      const updatedCar = await dbHelpers.updateCar(listingId, updateData);
      console.log('[تم بنجاح] تم تحديث السيارة:', listingId);

      return res.status(200).json({
        success: true,
        message: 'تم تحديث الإعلان بنجاح',
        listing: updatedCar,
        type: 'car',
      });
    }

    // إذا لم تكن سيارة، نحاول تحديث المزاد
    const auction = await dbHelpers.getAuctionById(listingId);

    if (auction) {
      const updatedAuction = await dbHelpers.updateAuction(listingId, updateData);
      console.log('[تم بنجاح] تم تحديث المزاد:', listingId);

      return res.status(200).json({
        success: true,
        message: 'تم تحديث المزاد بنجاح',
        listing: updatedAuction,
        type: 'auction',
      });
    }

    // إذا لم يتم العثور على الإعلان
    return res.status(404).json({
      success: false,
      error: 'الإعلان غير موجود',
    });
  } catch (error) {
    console.error('[فشل] خطأ في تحديث الإعلان:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في تحديث الإعلان',
    });
  }
}
