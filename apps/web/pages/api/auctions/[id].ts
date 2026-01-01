import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import {
  getAuctionWithVehicle,
  incrementAuctionViews,
} from '../../../lib/services/universal/auctionService';
import { logger } from '../../../lib/core/logging/UnifiedLogger';
import apiResponse from '../../../lib/api/response';
import { decodeApiResponse } from '../../../lib/universal-name-decoder';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'معرف المزاد مطلوب',
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getAuctionByIdFromDB(req, res, id);
      case 'PUT':
        return await updateAuction(req, res, id);
      case 'DELETE':
        return await deleteAuction(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('خطأ في API المزاد:', error);
    console.error('تفاصيل الخطأ:', error.message, error.stack);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

async function getAuctionByIdFromDB(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    logger.info(`[API] طلب جلب المزاد: ${id}`, { auctionId: id });

    // استخدام النظام الموحد لجلب المزاد مع السيارة والصور
    const auctionWithVehicle = await getAuctionWithVehicle(id);

    if (!auctionWithVehicle) {
      logger.warn(`[API] المزاد غير موجود: ${id}`, { auctionId: id });
      return apiResponse.notFound(
        res,
        'المزاد غير موجود أو تم حذفه',
        { auctionId: id },
        { route: 'api/auctions/[id]' },
        'AUCTION_NOT_FOUND',
      );
    }

    // تحديث عداد المشاهدات
    await incrementAuctionViews(id);

    logger.info(`[API] تم جلب المزاد بنجاح: ${id}`, {
      auctionId: id,
      imagesCount: auctionWithVehicle.car.images.length,
    });

    // فك تشفير البيانات قبل الإرجاع
    const decodedData = decodeApiResponse(auctionWithVehicle);

    // إرجاع البيانات المنسقة مع فك التشفير
    return apiResponse.ok(
      res,
      decodedData,
      { route: 'api/auctions/[id]', message: 'تم جلب المزاد بنجاح' },
      'OK',
    );
  } catch (error) {
    logger.error(`[API] خطأ في جلب المزاد ${id}:`, error);
    return apiResponse.serverError(
      res,
      'خطأ في جلب المزاد',
      error instanceof Error ? error.message : 'خطأ غير محدد',
      { auctionId: id },
      'FETCH_ERROR',
    );
  }
}

async function updateAuction(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const updateData = req.body;

    const updatedAuction = await prisma.auctions.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'تم تحديث المزاد بنجاح',
      data: updatedAuction,
    });
  } catch (error) {
    console.error('خطأ في تحديث المزاد:', error);
    return apiResponse.serverError(res, 'خطأ في تحديث المزاد');
  }
}

async function deleteAuction(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    await prisma.auctions.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'تم حذف المزاد بنجاح',
    });
  } catch (error) {
    console.error('خطأ في حذف المزاد:', error);
    return apiResponse.serverError(res, 'خطأ في حذف المزاد');
  }
}
