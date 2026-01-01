import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { triggerAuctionEndedNotifications } from '../../../../utils/notifications/auctionEventTriggers';
import { RateLimitConfigs, withApiRateLimit } from '../../../../utils/rateLimiter';

// استخدام عميل Prisma الموحد (Singleton)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface EndAuctionResponse {
  success: boolean;
  auction?: {
    id: string;
    status: string;
    winnerId?: string;
    finalPrice?: number;
  };
  message: string;
}

export default withApiRateLimit(handler, RateLimitConfigs.ADMIN_SENSITIVE);

async function handler(req: NextApiRequest, res: NextApiResponse<EndAuctionResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'طريقة غير مدعومة',
    });
  }

  try {
    // التحقق من الرمز المميز (مدير فقط)
    const token = req.cookies.authToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'مطلوب تسجيل الدخول',
      });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صالح',
      });
    }

    // التحقق من صلاحيات الإدارة
    const userRole = decoded.role;
    if (!['AUCTION_MANAGER'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لإنهاء المزادات',
      });
    }

    const { auctionId } = req.query;

    if (!auctionId || typeof auctionId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'معرف المزاد مطلوب',
      });
    }

    // جلب المزاد مع أعلى مزايدة
    const auction = await prisma.auctions.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          include: { bidder: true },
        },
      },
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'المزاد غير موجود',
      });
    }

    if (auction.status === 'ENDED') {
      return res.status(400).json({
        success: false,
        message: 'المزاد منتهي مسبقاً',
      });
    }

    // إنهاء المزاد
    const winningBid = auction.bids[0];
    const updatedAuction = await prisma.auctions.update({
      where: { id: auctionId },
      data: {
        status: 'ENDED',
        highestBidderId: winningBid?.bidderId || null,
        currentPrice: winningBid?.amount || auction.startingPrice,
      },
    });

    // تشغيل إشعارات انتهاء المزاد
    try {
      await triggerAuctionEndedNotifications(auctionId);
    } catch (notificationError) {
      console.error('خطأ في إرسال إشعارات انتهاء المزاد:', notificationError);
      // لا نوقف العملية بسبب فشل الإشعارات
    }

    return res.status(200).json({
      success: true,
      auction: {
        id: updatedAuction.id,
        status: updatedAuction.status,
        winnerId: updatedAuction.highestBidderId || undefined,
        finalPrice: updatedAuction.currentPrice,
      },
      message: winningBid
        ? `تم إنهاء المزاد. الفائز: ${winningBid.bidder.name} بمبلغ ${winningBid.amount.toLocaleString()} د.ل`
        : 'تم إنهاء المزاد بدون مزايدات',
    });
  } catch (error: any) {
    console.error('خطأ في إنهاء المزاد:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في إنهاء المزاد',
    });
  }
}
