import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

interface ManageStatusRequest {
  action: 'pause' | 'resume' | 'end' | 'cancel';
  reason?: string;
}

interface ManageStatusResponse {
  success: boolean;
  message: string;
  data?: {
    auctionId: string;
    newStatus: string;
    updatedAt: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ManageStatusResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST method is allowed',
    });
  }

  try {
    const { id: auctionId } = req.query;
    const { action, reason }: ManageStatusRequest = req.body;

    // التحقق من صحة البيانات
    if (!auctionId || !action) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير مكتملة',
        error: 'Missing required fields: auctionId, action',
      });
    }

    // التحقق من صحة العملية
    const validActions = ['pause', 'resume', 'end', 'cancel'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'عملية غير صحيحة',
        error: 'Invalid action. Must be one of: pause, resume, end, cancel',
      });
    }

    // جلب بيانات المزاد
    const auction = await prisma.auctions.findUnique({
      where: { id: parseInt(auctionId as string) },
      include: {
        car: {
          include: {
            user: true,
          },
        },
        bids: {
          include: {
            user: true,
          },
          orderBy: {
            amount: 'desc',
          },
        },
      },
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'المزاد غير موجود',
        error: 'Auction not found',
      });
    }

    // التحقق من أن المستخدم هو صاحب المزاد
    // ملاحظة: يجب إضافة نظام المصادقة هنا للتحقق من هوية المستخدم
    // const userId = req.user?.id; // من نظام المصادقة
    // if (auction.car.userId !== userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'غير مصرح لك بإدارة هذا المزاد',
    //     error: 'Unauthorized'
    //   });
    // }

    // التحقق من إمكانية تنفيذ العملية
    const canPerformAction = validateAction(auction.status, action);
    if (!canPerformAction.valid) {
      return res.status(400).json({
        success: false,
        message: canPerformAction.message,
        error: canPerformAction.error,
      });
    }

    const now = new Date();
    let newStatus: string;
    const updateData: any = {
      updatedAt: now,
    };

    // تحديد الحالة الجديدة وبيانات التحديث
    switch (action) {
      case 'pause':
        // Since PAUSED is not in AuctionStatus enum, we'll use CANCELLED for paused auctions
        newStatus = 'CANCELLED';
        updateData.status = 'CANCELLED';
        break;
      case 'resume':
        newStatus = 'ACTIVE';
        updateData.status = 'ACTIVE';
        break;
      case 'end':
        newStatus = 'ENDED';
        updateData.status = 'ENDED';
        updateData.endTime = now;
        // تحديد الفائز إذا كان هناك مزايدات
        if (auction.bids.length > 0) {
          const highestBid = auction.bids[0];
          updateData.winnerId = highestBid.bidderId;
          updateData.finalPrice = highestBid.amount;
        }
        break;
      case 'cancel':
        newStatus = 'CANCELLED';
        updateData.status = 'CANCELLED';
        updateData.endTime = now;
        break;
      default:
        throw new Error('Invalid action');
    }

    // تحديث المزاد
    const updatedAuction = await prisma.auctions.update({
      where: { id: parseInt(auctionId as string) },
      data: updateData,
    });

    // إنشاء سجل للعملية
    await prisma.auctionLog.create({
      data: {
        auctionId: parseInt(auctionId as string),
        action: `AUCTION_${action.toUpperCase()}`,
        details: {
          previousStatus: auction.status,
          newStatus,
          reason: reason || `${getActionText(action)} من قبل المالك`,
          timestamp: now.toISOString(),
        },
        createdAt: now,
      },
    });

    // إرسال إشعارات للمزايدين (يمكن تطويرها لاحقاً)
    if (auction.bids.length > 0) {
      await notifyBiddersOfStatusChange(auction.bids, action, auction.title);
    }

    console.log(`[تم بنجاح] تم ${getActionText(action)} للمزاد ${auctionId}`);

    return res.status(200).json({
      success: true,
      message: `تم ${getActionText(action)} بنجاح`,
      data: {
        auctionId: auctionId as string,
        newStatus,
        updatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error(`[فشل] خطأ في إدارة المزاد:`, error);

    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم أثناء إدارة المزاد',
      error:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
  }
}

// دالة للتحقق من إمكانية تنفيذ العملية
function validateAction(currentStatus: string, action: string) {
  switch (action) {
    case 'pause':
      if (currentStatus !== 'ACTIVE') {
        return {
          valid: false,
          message: 'لا يمكن إيقاف المزاد إلا إذا كان نشطاً',
          error: 'Can only pause active auctions',
        };
      }
      break;
    case 'resume':
      if (currentStatus !== 'PAUSED') {
        return {
          valid: false,
          message: 'لا يمكن استئناف المزاد إلا إذا كان متوقفاً مؤقتاً',
          error: 'Can only resume paused auctions',
        };
      }
      break;
    case 'end':
      if (!['ACTIVE', 'PAUSED'].includes(currentStatus)) {
        return {
          valid: false,
          message: 'لا يمكن إنهاء المزاد إلا إذا كان نشطاً أو متوقفاً مؤقتاً',
          error: 'Can only end active or paused auctions',
        };
      }
      break;
    case 'cancel':
      if (['ENDED', 'CANCELLED'].includes(currentStatus)) {
        return {
          valid: false,
          message: 'لا يمكن إلغاء مزاد منتهي أو ملغي مسبقاً',
          error: 'Cannot cancel already ended or cancelled auctions',
        };
      }
      break;
  }

  return { valid: true };
}

// دالة لتحويل العملية إلى نص عربي
function getActionText(action: string): string {
  switch (action) {
    case 'pause':
      return 'إيقاف المزاد مؤقتاً';
    case 'resume':
      return 'استئناف المزاد';
    case 'end':
      return 'إنهاء المزاد';
    case 'cancel':
      return 'إلغاء المزاد';
    default:
      return 'تحديث المزاد';
  }
}

// دالة لإشعار المزايدين بتغيير الحالة (يمكن تطويرها لاحقاً)
async function notifyBiddersOfStatusChange(bids: any[], action: string, auctionTitle: string) {
  console.log(
    `📧 إرسال إشعارات لـ ${bids.length} مزايد حول ${getActionText(action)} للمزاد: ${auctionTitle}`,
  );
}
