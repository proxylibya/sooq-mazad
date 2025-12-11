import { NextApiRequest, NextApiResponse } from 'next';
import { computeTieredIncrement, isAuctionActive } from '../../../../config/auction-constants';
import { auctionEventBus } from '../../../../lib/live/auctionEventBus';
import prisma, { dbHelpers } from '../../../../lib/prisma';
import { simpleBidProcessor } from '../../../../lib/queue/bidQueue';
import { auctionStatusService } from '../../../../lib/services/auctionStatusService';

interface BidRequest {
  userId: string;
  amount: number;
  auctionId: string;
  // تأكيد صريح للمزايدة العالية جداً لحماية من أخطاء الإدخال
  confirmHighBid?: boolean;
}

interface GetBidsResponse {
  success: boolean;
  message: string;
  data?: Array<{
    id: string;
    auctionId: string;
    userId: string;
    amount: number;
    timestamp: string;
    isWinning: boolean;
    bidder?: {
      id: string;
      name: string | null;
      profileImage: string | null;
      verified: boolean | null;
      phone?: string | null;
      email?: string | null;
      createdAt?: string;
    };
  }>;
  error?: string;
}

interface BidResponse {
  success: boolean;
  message: string;
  data?: {
    bidId: string;
    amount: number;
    timestamp: string;
    userId: string;
    auctionId: string;
  };
  error?: string;
  // معلومات إضافية اختيارية لمساعدة الواجهة على اتخاذ القرار
  requiredConfirm?: boolean;
  recommendedMin?: number;
  minIncrement?: number;
}

// تم إزالة البيانات الوهمية - سيتم استخدام قاعدة البيانات الحقيقية

export default async function handler(req: NextApiRequest, res: NextApiResponse<BidResponse>) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'معرف المزاد مطلوب',
      error: 'معرف المزاد غير صحيح',
    });
  }

  if (req.method === 'POST') {
    return handleCreateBid(req, res, id);
  } else if (req.method === 'GET') {
    return handleGetBids(req, res, id);
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({
      success: false,
      message: 'طريقة غير مدعومة',
      error: `طريقة ${req.method} غير مدعومة`,
    });
  }
}

async function handleCreateBid(
  req: NextApiRequest,
  res: NextApiResponse<BidResponse>,
  auctionId: string,
) {
  try {
    const { userId, amount, confirmHighBid }: BidRequest = req.body;

    console.log('[البحث] بيانات المزايدة المستلمة:', {
      userId,
      amount,
      auctionId,
    });

    // التحقق من البيانات المطلوبة
    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'بيانات المزايدة غير مكتملة',
        error: 'معرف المستخدم ومبلغ المزايدة مطلوبان',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'مبلغ المزايدة غير صحيح',
        error: 'مبلغ المزايدة يجب أن يكون أكبر من صفر',
      });
    }

    // تحديث حالة المزاد فوراً قبل المتابعة لضمان دقة الحالة
    try {
      await auctionStatusService.updateSingleAuction(auctionId);
    } catch (_e) {
      // تجاهل أخطاء التحديث اللحظي حتى لا تمنع المزايدة - سيتم التحقق من الحالة أدناه
    }

    // التحقق من وجود المزاد في قاعدة البيانات - استعلام مباشر وخفيف لتفادي فشل includes الثقيلة
    const auction = await prisma.auctions.findUnique({
      where: { id: auctionId },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        currentPrice: true,
        startPrice: true,
        minimumBid: true,
        sellerId: true,
        carId: true, // ✅ لتحديث حالة السيارة
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          select: { amount: true },
        },
      },
    });
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'المزاد غير موجود',
        error: 'المزاد غير موجود',
      });
    }

    // التحقق من أن المزاد ما زال نشطاً - باستخدام الدالة الموحدة
    if (!isAuctionActive(auction.status)) {
      return res.status(400).json({
        success: false,
        message: 'المزاد غير نشط حالياً',
        error: 'AUCTION_NOT_ACTIVE',
      });
    }

    // التحقق من أن المزاد لم ينته
    if (new Date() > new Date(auction.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'انتهى وقت المزاد',
        error: 'لا يمكن المزايدة بعد انتهاء المزاد',
      });
    }

    // التحقق من أن المستخدم ليس صاحب المزاد (مع تحويل الأنواع لضمان المقارنة الصحيحة)
    if (String(userId).trim() === String(auction.sellerId).trim()) {
      console.warn('[🚨 Security] منع مزايدة المالك على مزاده:', {
        userId,
        sellerId: auction.sellerId,
        auctionId
      });
      return res.status(400).json({
        success: false,
        message: 'لا يمكن للبائع المزايدة على مزاده الخاص',
        error: 'OWNER_CANNOT_BID',
      });
    }

    // الحصول على أعلى مزايدة حالية (دقيق باستخدام المزايدات إن وجدت)
    const highestFromBids = Array.isArray(auction.bids) && auction.bids.length
      ? Number(auction.bids[0]?.amount) || null
      : null;
    const highestBid = typeof highestFromBids === 'number'
      ? Math.max(Number(auction.currentPrice || 0), highestFromBids)
      : (auction.currentPrice || auction.startPrice);

    // حساب الزيادة الدنيا - ديناميكي حسب الشريحة السعرية مع احترام القيمة المكونة والحد الأدنى
    const configuredIncrement = typeof auction.minimumBid === 'number' ? auction.minimumBid : 500;
    const minimumIncrement = computeTieredIncrement(highestBid, configuredIncrement);

    const recommendedMin = highestBid + minimumIncrement;

    // التحقق من أن المزايدة الجديدة ليست أقل من الحد الأدنى المطلوب
    // ملاحظة: يُسمح بالمساواة مع الحد الأدنى (>=) لتوافق أزرار +500/+1000/+2000
    if (amount < recommendedMin) {
      return res.status(400).json({
        success: false,
        message: `المزايدة يجب أن تكون على الأقل ${recommendedMin.toLocaleString()} د.ل`,
        error: 'BID_TOO_LOW',
        recommendedMin,
        minIncrement: minimumIncrement,
      });
    }

    // كشف المبالغ الشاذة لحماية المستخدم (تأكيد مزدوج)
    const outlierBySteps = amount >= recommendedMin + minimumIncrement * 20;
    const outlierByMultiple = highestBid > 0 ? amount >= highestBid * 3 : false;
    const suspiciousRound = amount % 1000 === 0 && amount >= recommendedMin * 5;
    const isOutlier = outlierBySteps || outlierByMultiple || suspiciousRound;

    if (isOutlier && !confirmHighBid) {
      return res.status(400).json({
        success: false,
        message: `المبلغ المدخل مرتفع جداً مقارنة بالسعر الحالي. للتأكيد، أعد الإرسال مع confirmHighBid=true. الحد الأدنى المقترح الآن هو ${recommendedMin.toLocaleString()} د.ل والزيادة الدنيا ${minimumIncrement.toLocaleString()} د.ل`,
        error: 'HIGH_BID_CONFIRMATION_REQUIRED',
        requiredConfirm: true,
        recommendedMin,
        minIncrement: minimumIncrement,
      });
    }

    // إنشاء المزايدة ضمن معاملة ذرّية مع قفل لمنع التضارب
    let newBid;
    try {
      // استخدام قفل بسيط لمنع المزايدات المتزامنة على نفس المزاد
      newBid = await simpleBidProcessor.processBid(auctionId, async () => {
        return await dbHelpers.createBidTransactional({
          amount,
          auctionId,
          bidderId: userId,
        });
      });
    } catch (e: unknown) {
      const message = (e as Error)?.message || '';
      if (message === 'BID_TOO_LOW') {
        // إعادة حساب لإرجاع قيم مساعدة للواجهة
        const highestFromBids2 = Array.isArray(auction?.bids) && auction!.bids.length
          ? Math.max(...auction!.bids.map((b: any) => Number(b.amount) || 0))
          : null;
        const highestBid2 = typeof highestFromBids2 === 'number'
          ? Math.max(Number(auction?.currentPrice || 0), highestFromBids2)
          : ((auction as any)?.currentPrice || (auction as any)?.startPrice || 0);
        const configuredIncrement2 = typeof (auction as any)?.minimumBid === 'number' ? (auction as any).minimumBid : 500;
        const minimumIncrement2 = computeTieredIncrement(highestBid2, configuredIncrement2);
        const recommendedMin2 = highestBid2 + minimumIncrement2;

        return res.status(400).json({
          success: false,
          message: 'المزايدة أقل من الحد الأدنى المسموح',
          error: 'BID_TOO_LOW',
          recommendedMin: recommendedMin2,
          minIncrement: minimumIncrement2,
        });
      }
      if (message === 'AUCTION_NOT_ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'المزاد غير نشط أو منتهي',
          error: 'AUCTION_NOT_ACTIVE',
        });
      }
      if (message === 'BID_FROM_SELLER_NOT_ALLOWED') {
        return res.status(400).json({
          success: false,
          message: 'لا يمكن للبائع المزايدة على مزاده الخاص',
          error: 'BID_FROM_SELLER_NOT_ALLOWED',
        });
      }
      if (message === 'AUCTION_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'المزاد غير موجود',
          error: 'AUCTION_NOT_FOUND',
        });
      }
      return res.status(409).json({
        success: false,
        message: 'تعارض بسبب مزايدات متزامنة، حاول مرة أخرى',
        error: message || 'BID_FAILED',
      });
    }

    console.log('[تم بنجاح] تم تسجيل المزايدة ضمن معاملة:', newBid.id);

    // البيع التلقائي معطل حالياً (لا يوجد حقل reservePrice في schema)
    const autoSold = false;

    // إرسال الاستجابة
    // بث تحديث فوري عبر Event Bus (SSE)
    try {
      auctionEventBus.emitBidUpdated({
        auctionId,
        currentBid: newBid.amount,
        highestBidderId: newBid.bidderId,
        timestamp: new Date().toISOString(),
      });
    } catch (_e) {
      // تجاهل أخطاء البث حتى لا تؤثر على الاستجابة
    }

    return res.status(201).json({
      success: true,
      message: autoSold
        ? '🏆 مبروك! مزايدتك وصلت للسعر المطلوب وتم بيع السيارة لك تلقائياً!'
        : 'تم تسجيل المزايدة بنجاح',
      data: {
        bidId: newBid.id,
        amount: newBid.amount,
        timestamp: newBid.createdAt.toISOString(),
        userId: newBid.bidderId,
        auctionId: newBid.auctionId,
        autoSold, // ✅ إضافة علم للواجهة
      },
    });
  } catch (error) {
    console.error('خطأ في تسجيل المزايدة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل المزايدة',
      error: 'خطأ في الخادم',
    });
  }
}

async function handleGetBids(req: NextApiRequest, res: NextApiResponse<GetBidsResponse>, auctionId: string) {
  try {
    console.log('[handleGetBids] بدء جلب المزايدات للمزاد:', auctionId);

    // التحقق من صحة معرف المزاد
    if (!auctionId || auctionId.trim() === '') {
      console.error('[handleGetBids] معرف المزاد فارغ أو غير صحيح');
      return res.status(400).json({
        success: false,
        message: 'معرف المزاد غير صحيح',
        error: 'INVALID_AUCTION_ID',
      });
    }

    // جلب المزاد مع المزايدات من قاعدة البيانات باستعلام مباشر وخفيف
    const auction = await prisma.auctions.findUnique({
      where: { id: auctionId.trim() },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          include: {
            users: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                verified: true,
                phone: true,
                email: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!auction) {
      console.log('[handleGetBids] المزاد غير موجود في قاعدة البيانات:', auctionId);
      // إرجاع قائمة فارغة بدلاً من 404 لتجنب أخطاء الواجهة
      return res.status(200).json({
        success: true,
        message: 'لا توجد مزايدات بعد',
        data: [],
      });
    }

    console.log('[handleGetBids] تم العثور على المزاد:', {
      auctionId: auction.id,
      bidsCount: auction.bids?.length || 0,
      status: auction.status
    });

    // معالجة آمنة للمزايدات مع فحص البيانات
    // حساب أعلى مزايدة مرة واحدة لتحسين الأداء
    const maxAmountOverall = auction.bids && auction.bids.length > 0
      ? Math.max(
        ...auction.bids
          .filter((b: any) => b && typeof b.amount === 'number')
          .map((b: any) => b.amount),
      )
      : 0;

    const formattedBids = auction.bids && Array.isArray(auction.bids)
      ? auction.bids
        .map((bid) => {
          // التأكد من صحة بيانات المزايدة
          if (!bid || !bid.id || typeof bid.amount !== 'number' || !bid.createdAt) {
            console.warn('[handleGetBids] مزايدة بها بيانات ناقصة أو نوع مبلغ غير صحيح:', {
              id: bid?.id,
              amountType: typeof bid?.amount,
              hasCreatedAt: !!bid?.createdAt,
            });
            return null;
          }

          return {
            id: bid.id,
            auctionId: auctionId,
            userId: (bid as any).bidderId || 'unknown',
            amount: bid.amount,
            timestamp: bid.createdAt.toISOString(),
            isWinning: bid.amount === maxAmountOverall,
            bidder: (bid as any).users || null,
          };
        })
        .filter(Boolean) // إزالة المزايدات غير الصحيحة
      : [];

    console.log(`[handleGetBids] تم معالجة وجلب ${formattedBids.length} مزايدة صحيحة للمزاد ${auctionId}`);

    return res.status(200).json({
      success: true,
      message: 'تم جلب المزايدات بنجاح',
      data: formattedBids,
    });
  } catch (error) {
    console.error('[handleGetBids] خطأ في جلب المزايدات:', error);
    console.error('[handleGetBids] تفاصيل الخطأ:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      auctionId: auctionId
    });

    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المزايدات',
      error: 'SERVER_ERROR',
    });
  }
}
