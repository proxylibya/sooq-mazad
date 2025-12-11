import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/middleware/auth';
import { auctionEventBus } from '@/lib/live/auctionEventBus';
import { notificationService } from '@/lib/services/UnifiedNotificationService';
import { messageService } from '@/lib/services/UnifiedMessageService';

interface AcceptSaleRequest {
  bidderId: number | string;
  amount: number;
  reason?: string;
}

interface AcceptSaleResponse {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse<AcceptSaleResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed', error: 'Only POST method is allowed' });
  }

  try {
    console.log('[Accept Sale] بدء معالجة تأكيد البيع...');
    
    const authUser = await verifyToken(req);
    if (!authUser?.id) {
      console.log('[Accept Sale] ❌ مستخدم غير مصرح');
      return res.status(401).json({ success: false, message: 'غير مصرح - الرجاء تسجيل الدخول', error: 'UNAUTHORIZED' });
    }

    console.log('[Accept Sale] ✅ مستخدم مصرح:', authUser.id);

    const { id: auctionIdParam } = req.query;
    const auctionId = String(auctionIdParam);
    const { bidderId, amount, reason }: AcceptSaleRequest = req.body;

    console.log('[Accept Sale] البيانات المستلمة:', { auctionId, bidderId, amount, reason });

    if (!auctionId || bidderId === undefined || amount === undefined) {
      console.log('[Accept Sale] ❌ بيانات غير مكتملة');
      return res.status(400).json({ success: false, message: 'بيانات غير مكتملة', error: 'MISSING_FIELDS' });
    }

    const bidderIdStr = String(bidderId).trim();
    const isNumericId = /^\d+$/.test(bidderIdStr);
    const finalBidderId: number | string = isNumericId ? parseInt(bidderIdStr, 10) : bidderIdStr;
    const finalAmount = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/[\,\s]/g, ''));
    
    console.log('[Accept Sale] البيانات المعالجة:', { finalBidderId, finalAmount, isNumericId });
    
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      console.log('[Accept Sale] ❌ مبلغ غير صحيح');
      return res.status(400).json({ success: false, message: 'مدخلات غير صحيحة', error: 'INVALID_AMOUNT' });
    }

    // جلب المزاد
    console.log('[Accept Sale] جلب بيانات المزاد:', auctionId);
    const auction = await prisma.auctions.findUnique({
      where: { id: auctionId },
      select: {
        id: true,
        sellerId: true,
        status: true,
        carId: true,
      },
    });

    if (!auction) {
      console.log('[Accept Sale] ❌ المزاد غير موجود');
      return res.status(404).json({ success: false, message: 'المزاد غير موجود', error: 'AUCTION_NOT_FOUND' });
    }

    console.log('[Accept Sale] بيانات المزاد:', auction);
    console.log('[Accept Sale] 🔍 حالة المزاد في DB:', auction.status);

    // تحقق الملكية
    if (String(authUser.id) !== String(auction.sellerId)) {
      console.log('[Accept Sale] ❌ غير مصرح - ليس المالك');
      return res.status(403).json({ success: false, message: 'غير مصرح لك بتأكيد هذا البيع', error: 'UNAUTHORIZED' });
    }

    console.log('[Accept Sale] ✅ المستخدم هو المالك');

    // السماح بالقبول عندما يكون المزاد نشطاً أو منتهياً أو قادماً
    // القادم (UPCOMING): يسمح للمالك بقبول عرض مبكر قبل بدء المزاد
    const allowedStatuses = ['UPCOMING', 'ACTIVE', 'ENDED'];
    if (!allowedStatuses.includes(String(auction.status))) {
      console.log('[Accept Sale] ❌ حالة المزاد غير صالحة:', auction.status);
      console.log('[Accept Sale] ❌ الحالات المسموحة:', allowedStatuses);
      return res.status(400).json({ 
        success: false, 
        message: `لا يمكن تأكيد البيع في هذه الحالة (الحالة الحالية: ${auction.status})`, 
        error: 'AUCTION_NOT_ACTIVE' 
      });
    }

    console.log('[Accept Sale] ✅ حالة المزاد صالحة');

    const now = new Date();

    // جلب بيانات إضافية للإشعارات والرسائل
    console.log('[Accept Sale] جلب بيانات إضافية...');
    const auctionDetails = await prisma.auctions.findUnique({
      where: { id: auctionId },
      include: {
        car: {
          select: {
            title: true,
            brand: true,
            model: true,
            year: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    const winner = await prisma.users.findFirst({
      where: typeof finalBidderId === 'number' 
        ? { publicId: finalBidderId }
        : { id: String(finalBidderId) },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    if (!winner) {
      console.log('[Accept Sale] ❌ المشتري غير موجود');
      return res.status(404).json({ success: false, message: 'المشتري غير موجود', error: 'BUYER_NOT_FOUND' });
    }

    const carTitle = auctionDetails?.car?.title || 
                    `${auctionDetails?.car?.brand || ''} ${auctionDetails?.car?.model || ''} ${auctionDetails?.car?.year || ''}`.trim() ||
                    'السيارة';

    console.log('[Accept Sale] بدء Transaction...');
    try {
      await prisma.$transaction(async (tx) => {
        console.log('[Accept Sale] تحديث المزاد...');
        await tx.auction.update({
          where: { id: auctionId },
          data: {
            status: 'SOLD', // ✅ تم البيع - يجب أن يعرض العداد الأحمر
            highestBidderId: String(finalBidderId),
            currentPrice: finalAmount,
            endTime: now,
            updatedAt: now,
            // ملاحظة: buyerName سيُجلب ديناميكياً من علاقة highestBidderId -> User
          },
        });

        console.log('[Accept Sale] تحديث السيارة...');
        await tx.car.update({
          where: { id: auction.carId },
          data: { status: 'SOLD', updatedAt: now },
        });
        
        console.log('[Accept Sale] ✅ Transaction مكتملة');
      });
    } catch (txError) {
      console.error('[Accept Sale] ❌ خطأ في Transaction:', txError);
      throw txError;
    }

    // ✨ تنظيف Cache بعد تأكيد البيع
    console.log('[Accept Sale] تنظيف Cache...');
    try {
      const { clearCache } = await import('../../../../lib/core/cache/UnifiedCache');
      // مسح جميع cache المزادات لضمان عرض الحالة المحدثة
      await clearCache(`api:auctions:list:*`);
      await clearCache(`api:auctions:${auctionId}:*`);
      await clearCache(`auction:${auctionId}:*`);
      console.log('[Accept Sale] ✅ تم تنظيف Cache بنجاح');
    } catch (cacheError) {
      console.log('[Accept Sale] ⚠️ فشل تنظيف Cache (غير حرج):', cacheError);
    }

    // ✨ إرسال الإشعارات
    console.log('[Accept Sale] إرسال الإشعارات...');
    try {
      // إشعار للمشتري
      await notificationService.sendAuctionWon({
        auctionId,
        winnerId: winner.id,
        winnerName: winner.name,
        amount: finalAmount,
        carTitle,
      });

      // إشعار تأكيد البيع للمشتري
      await notificationService.sendSaleConfirmedToWinner({
        auctionId,
        winnerId: winner.id,
        sellerName: auctionDetails?.seller?.name || 'البائع',
        sellerPhone: auctionDetails?.seller?.phone || undefined,
        amount: finalAmount,
        carTitle,
        carId: auction.carId,
      });

      // إشعار تأكيد البيع للبائع
      await notificationService.sendSaleConfirmedToSeller({
        auctionId,
        sellerId: auction.sellerId,
        winnerName: winner.name,
        winnerPhone: winner.phone || undefined,
        amount: finalAmount,
        carTitle,
        carId: auction.carId,
      });

      console.log('[Accept Sale] ✅ تم إرسال جميع الإشعارات');
    } catch (notifError) {
      console.error('[Accept Sale] ⚠️ خطأ في إرسال الإشعارات (غير حرج):', notifError);
    }

    // ✨ إنشاء محادثة بين البائع والمشتري
    console.log('[Accept Sale] إنشاء محادثة...');
    try {
      const conversation = await messageService.createAuctionConversation({
        auctionId,
        sellerId: auction.sellerId,
        winnerId: winner.id,
        carTitle,
        winnerName: winner.name,
        amount: finalAmount,
      });

      console.log('[Accept Sale] ✅ تم إنشاء المحادثة:', conversation.id);
    } catch (msgError) {
      console.error('[Accept Sale] ⚠️ خطأ في إنشاء المحادثة (غير حرج):', msgError);
    }

    // إرسال Event للتحديث الحي
    console.log('[Accept Sale] إرسال Event...');
    try {
      // إرسال الحالة بأحرف كبيرة لتطابق Prisma enum
      auctionEventBus.emitStatusChanged({ auctionId, status: 'SOLD', timestamp: now.toISOString() });
      console.log('[Accept Sale] تم إرسال SSE event بنجاح - status: SOLD');
    } catch (eventError) {
      console.log('[Accept Sale] فشل إرسال Event (غير حرج):', eventError);
    }

    console.log('[Accept Sale] تم تأكيد البيع بنجاح (مع الإشعارات والمحادثة)');
    return res.status(200).json({
      success: true,
      message: reason?.trim() ? reason : 'تم تأكيد البيع بنجاح للمزايد المحدد! سيتم التواصل لإتمام الصفقة.',
      data: {
        auctionId,
        winnerId: finalBidderId,
        winningAmount: finalAmount,
        endedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Accept Sale] ❌ خطأ عام:', error);
    console.error('[Accept Sale] تفاصيل الخطأ:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم أثناء تأكيد البيع', 
      error: error instanceof Error ? error.message : 'INTERNAL_ERROR' 
    });
  }
}
