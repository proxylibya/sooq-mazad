import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/middleware/auth';
import { NextApiRequest, NextApiResponse } from 'next';

interface RelistRequestBody {
  startTime?: string;
  endTime?: string;
  priceStrategy?: 'current' | 'starting';
}

interface RelistResponseBody {
  success: boolean;
  message: string;
  data?: {
    newAuctionId: string;
    startTime: string;
    endTime: string;
  };
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed', error: 'Only POST method is allowed' });
  }

  try {
    const authUser = await verifyToken(req);
    if (!authUser?.id) {
      return res.status(401).json({ success: false, message: 'غير مصرح - الرجاء تسجيل الدخول', error: 'UNAUTHORIZED' });
    }

    const { id: auctionIdParam } = req.query;
    const auctionId = String(auctionIdParam);

    const { startTime: startTimeStr, endTime: endTimeStr, priceStrategy = 'current' }: RelistRequestBody = req.body || {};

    // جلب المزاد القديم - استخدام أسماء الحقول الصحيحة من schema.prisma
    const oldAuction = await prisma.auctions.findUnique({
      where: { id: auctionId },
      select: {
        id: true,
        title: true,
        description: true,
        carId: true,
        sellerId: true,
        startPrice: true, // اسم الحقل في schema
        currentPrice: true,
        minimumBid: true, // اسم الحقل في schema
        status: true,
      },
    });

    if (!oldAuction) {
      return res.status(404).json({ success: false, message: 'المزاد غير موجود', error: 'AUCTION_NOT_FOUND' });
    }

    // تحقق الملكية
    if (String(authUser.id) !== String(oldAuction.sellerId)) {
      return res.status(403).json({ success: false, message: 'غير مصرح بإعادة طرح هذا المزاد', error: 'UNAUTHORIZED' });
    }

    // منع إعادة نشر المزاد المباع
    if (oldAuction.status === 'SOLD') {
      return res.status(400).json({ success: false, message: 'لا يمكن إعادة طرح مزاد تم بيعه', error: 'ALREADY_SOLD' });
    }

    const now = new Date();
    const defaultStart = new Date(now.getTime() + 60 * 60 * 1000); // بعد ساعة
    const defaultEnd = new Date(defaultStart.getTime() + 7 * 24 * 60 * 60 * 1000); // لمدة 7 أيام

    const newStart = startTimeStr ? new Date(startTimeStr) : defaultStart;
    const newEnd = endTimeStr ? new Date(endTimeStr) : defaultEnd;

    if (!(newStart instanceof Date) || isNaN(newStart.getTime()) || !(newEnd instanceof Date) || isNaN(newEnd.getTime())) {
      return res.status(400).json({ success: false, message: 'تواريخ غير صالحة', error: 'INVALID_DATES' });
    }
    if (newEnd <= newStart) {
      return res.status(400).json({ success: false, message: 'يجب أن يكون وقت الانتهاء بعد وقت البدء', error: 'END_BEFORE_START' });
    }

    const baseStarting = priceStrategy === 'current'
      ? (Number(oldAuction.currentPrice) || Number(oldAuction.startPrice) || 0)
      : (Number(oldAuction.startPrice) || 0);
    const startPrice = Math.max(0, baseStarting);

    // إنشاء معرف فريد للمزاد الجديد (مطلوب حسب schema.prisma)
    const newAuctionId = `auction_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // إنشاء مزاد جديد بناءً على القديم - استخدام أسماء الحقول الصحيحة من schema.prisma
    const created = await prisma.auctions.create({
      data: {
        id: newAuctionId, // المعرف الفريد للمزاد - مطلوب
        title: oldAuction.title || 'مزاد سيارة',
        description: oldAuction.description || null,
        carId: oldAuction.carId,
        sellerId: oldAuction.sellerId,
        startPrice: startPrice, // اسم الحقل في schema
        currentPrice: startPrice,
        startDate: newStart, // اسم الحقل في schema
        endDate: newEnd, // اسم الحقل في schema
        status: 'UPCOMING',
        featured: false,
        minimumBid: typeof oldAuction.minimumBid === 'number' ? oldAuction.minimumBid : 500, // اسم الحقل في schema
        updatedAt: new Date(), // مطلوب في schema
      },
      select: { id: true, startDate: true, endDate: true },
    });

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء مزاد جديد وإعادة طرحه بنجاح',
      data: {
        newAuctionId: created.id,
        startTime: created.startDate.toISOString(),
        endTime: created.endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('[فشل] خطأ في إعادة طرح المزاد:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ أثناء إعادة طرح المزاد', error: 'SERVER_ERROR' });
  }
}
