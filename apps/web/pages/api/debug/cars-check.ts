import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // التحقق من إجمالي السيارات
    const totalCars = await dbHelpers.prisma.cars.count();
    
    // التحقق من السيارات المتاحة
    const availableCars = await dbHelpers.prisma.cars.count({
      where: { status: 'AVAILABLE' }
    });
    
    // التحقق من السيارات غير المزادات
    const nonAuctionCars = await dbHelpers.prisma.cars.count({
      where: { 
        status: 'AVAILABLE',
        isAuction: false 
      }
    });
    
    // جلب عينة من السيارات
    const sampleCars = await dbHelpers.prisma.cars.findMany({
      where: { 
        status: 'AVAILABLE'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        status: true,
        isAuction: true,
        createdAt: true,
        sellerId: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // التحقق من المزادات النشطة
    const activeAuctions = await dbHelpers.prisma.auctions.count({
      where: {
        status: { in: ['UPCOMING', 'ACTIVE'] }
      }
    });

    // محاولة استخدام دالة getMarketplaceCars
    let marketplaceCarsResult = null;
    let marketplaceCarsError = null;
    try {
      marketplaceCarsResult = await dbHelpers.getMarketplaceCars({
        limit: 5,
        status: 'AVAILABLE'
      });
    } catch (error) {
      marketplaceCarsError = error.message;
    }

    return res.json({
      success: true,
      debug: {
        totalCars,
        availableCars,
        nonAuctionCars,
        activeAuctions,
        sampleCars,
        marketplaceCars: {
          result: marketplaceCarsResult,
          error: marketplaceCarsError
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('خطأ في فحص السيارات:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
