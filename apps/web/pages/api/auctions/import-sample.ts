import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { dbHelpers } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // قراءة البيانات من الملف المؤقت
    const tempFile = path.join(process.cwd(), 'temp_auctions.json');

    if (!fs.existsSync(tempFile)) {
      return res.status(404).json({
        success: false,
        message: 'ملف المزادات المؤقت غير موجود. يرجى تشغيل السكريبت أولاً.',
      });
    }

    const auctionsData = JSON.parse(fs.readFileSync(tempFile, 'utf8'));

    // إضافة كل مزاد إلى النظام
    const results = [];
    for (const auctionData of auctionsData) {
      try {
        // تحويل البيانات إلى التنسيق المطلوب
        const formattedData = {
          title: auctionData.title,
          carData: {
            brand: auctionData.car.brand,
            model: auctionData.car.model,
            year: auctionData.car.year,
            condition: auctionData.car.condition,
            mileage: auctionData.car.mileage,
            location: auctionData.car.location,
            images: auctionData.car.images || [],
            description: auctionData.car.description,
            fuelType: auctionData.car.fuelType,
            transmission: auctionData.car.transmission,
            bodyType: auctionData.car.bodyType,
            doors: auctionData.car.doors,
            color: auctionData.car.color,
            phone: auctionData.car.phone,
          },
          startingPrice: auctionData.startingPrice,
          currentBid: auctionData.currentBid,
          reservePrice: auctionData.reservePrice,
          status: auctionData.status,
          startTime: new Date(auctionData.startTime),
          endTime: new Date(auctionData.endTime),
          duration: Math.ceil(
            (new Date(auctionData.endTime).getTime() - new Date(auctionData.startTime).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
          totalBids: auctionData.totalBids,
          participants: auctionData.participants,
          sellerId: auctionData.sellerId,
          featured: auctionData.featured,
          winnerId: auctionData.winnerId,
          buyerName: auctionData.buyerName,
          bids: auctionData.bids || [],
        };

        const result = await dbHelpers.createAuction(formattedData);
        results.push({
          id: result.id,
          title: result.title,
          status: 'success',
        });
      } catch (error) {
        console.error(`[فشل] فشل في استيراد المزاد: ${auctionData.title}`, error);
        results.push({
          title: auctionData.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'خطأ غير معروف',
        });
      }
    }

    // حذف الملف المؤقت بعد الاستيراد
    fs.unlinkSync(tempFile);

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return res.status(200).json({
      success: true,
      message: `تم استيراد ${successCount} مزاد بنجاح${errorCount > 0 ? ` مع ${errorCount} أخطاء` : ''}`,
      data: {
        total: results.length,
        success: successCount,
        errors: errorCount,
        results: results,
      },
    });
  } catch (error) {
    console.error('خطأ في استيراد المزادات:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في استيراد المزادات',
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
    });
  }
}
