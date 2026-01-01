import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/middleware/auth';
import { auctionEventBus } from '@/lib/live/auctionEventBus';

interface AcceptBidRequest {
  bidderId: number | string;
  amount: number;
  reason?: string;
}

interface AcceptBidResponse {
  success: boolean;
  message: string;
  data?: {
    auctionId: string;
    winnerId: number | string;
    winningAmount: number;
    endedAt: string;
  };
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AcceptBidResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST method is allowed',
    });
  }

  try {
    const authUser = await verifyToken(req);
    if (!authUser?.id) {
      return res.status(401).json({ success: false, message: 'غير مصرح - الرجاء تسجيل الدخول', error: 'UNAUTHORIZED' });
    }

    const { id: auctionIdParam } = req.query;
    const auctionId = String(auctionIdParam);
    const { bidderId, amount, reason }: AcceptBidRequest = req.body;

    // تحقق أساسي
    if (!auctionId || bidderId === undefined || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير مكتملة',
        error: 'Missing required fields: auctionId, bidderId, amount',
      });
    }

    // تحويل الأنواع
    const bidderIdStr = String(bidderId).trim();
    const isNumericId = /^\d+$/.test(bidderIdStr);
    const finalBidderId: number | string = isNumericId ? parseInt(bidderIdStr, 10) : bidderIdStr;
    const finalAmount = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/[\,\s]/g, ''));
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'مدخلات غير صحيحة',
        error: 'Invalid bidderId or amount',
      });
    }

    // جلب المزاد والبائع وأعلى مزايدة
    const auction = await prisma.auctions.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          select: { amount: true, bidderId: true },
        },
      },
    });

    if (!auction) {
      return res.status(404).json({ success: false, message: 'المزاد غير موجود', error: 'AUCTION_NOT_FOUND' });
    }

    // التحقق من الملكية
    if (String(authUser.id) !== String(auction.sellerId)) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بتأكيد هذا البيع', error: 'UNAUTHORIZED' });
    }

    // السماح بالقبول فقط عندما يكون المزاد نشطاً أو منتهياً
    if (!['ACTIVE', 'ENDED'].includes(String(auction.status))) {
      return res.status(400).json({ success: false, message: 'لا يمكن تأكيد البيع في هذه الحالة', error: 'AUCTION_NOT_ACTIVE' });
    }

    // التحقق من أن المزايد المختار هو الأعلى
    const highest = auction.bids && auction.bids.length ? auction.bids[0] : null;
    if (!highest || String(highest.bidderId) !== String(finalBidderId)) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تأكيد البيع إلا لأعلى مزايد',
        error: 'NOT_HIGHEST_BIDDER',
      });
    }

    const now = new Date();

    // جلب اسم المشتري لتحديثه في المزاد
    const bidder = await prisma.users.findUnique({
      where: typeof finalBidderId === 'number' ? { id: finalBidderId } : { uid: String(finalBidderId) },
      select: { name: true, id: true, uid: true }
    });

    // تنفيذ التحديث ضمن معاملة ذرّية
    await prisma.$transaction(async (tx) => {
      // تحديث المزاد إلى SOLD
      await tx.auction.update({
        where: { id: auctionId },
        data: {
          status: 'SOLD',  // ✅ تصحيح: SOLD بدلاً من ENDED
          highestBidderId: String(finalBidderId),
          buyerName: bidder?.name || null,  // ✅ إضافة اسم المشتري
          currentPrice: finalAmount,
          endTime: now,
          updatedAt: now,
        },
      });

      // تحديث السيارة إلى SOLD أيضاً
      await tx.car.update({
        where: { id: auction.carId },
        data: { status: 'SOLD', updatedAt: now },
      });
    });

    // بث تغيير الحالة
    try {
      auctionEventBus.emitStatusChanged({ auctionId, status: 'SOLD', timestamp: now.toISOString() });
      console.log('[✅ Accept Bid] تم إرسال SSE event - status: SOLD');
    } catch (error) {
      console.error('[❌ Accept Bid] فشل إرسال SSE event:', error);
    }

    return res.status(200).json({
      success: true,
      message: reason?.trim() ? reason : 'تم تأكيد البيع بنجاح! سيتم التواصل مع المشتري لإتمام الصفقة.',
      data: {
        auctionId,
        winnerId: finalBidderId,
        winningAmount: finalAmount,
        endedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('[فشل] خطأ في تأكيد البيع:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم أثناء تأكيد البيع',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
    });
  }
}
