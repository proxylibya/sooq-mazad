/**
 * API Endpoint for Processing Winning Bid Payment
 * /api/auctions/process-winning-bid/[auctionId]
 */

import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { auctionReservationService } from '../../../../services/auctionReservationService';
import { triggerAuctionEndedNotifications } from '../../../../utils/notifications/auctionEventTriggers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface ProcessWinningBidRequest {
  finalBidAmount: number;
  winnerId: string;
}

interface ProcessWinningBidResponse {
  success: boolean;
  payment?: {
    transactionId: string;
    amount: number;
    status: string;
  };
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProcessWinningBidResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'طريقة غير مدعومة',
    });
  }

  try {
    // Verify JWT token
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

    // Check if user has admin permissions for auction management
    const userRole = decoded.role;
    if (!['AUCTION_MANAGER'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لمعالجة دفعات المزادات',
      });
    }

    const { auctionId } = req.query;

    if (!auctionId || typeof auctionId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'معرف المزاد مطلوب',
      });
    }

    // Validate request body
    const { finalBidAmount, winnerId }: ProcessWinningBidRequest = req.body;

    if (!finalBidAmount || finalBidAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'مبلغ العرض الفائز مطلوب ويجب أن يكون أكبر من الصفر',
      });
    }

    if (!winnerId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الفائز مطلوب',
      });
    }

    // Process winning bid payment
    const paymentResult = await auctionReservationService.processWinningBidPayment(
      winnerId,
      auctionId,
      finalBidAmount,
    );

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.message,
      });
    }

    // تشغيل إشعارات انتهاء المزاد والفوز
    try {
      await triggerAuctionEndedNotifications(auctionId);
    } catch (notificationError) {
      console.error('خطأ في إرسال إشعارات انتهاء المزاد:', notificationError);
      // لا نوقف العملية بسبب فشل الإشعارات
    }

    return res.status(200).json({
      success: true,
      payment: {
        transactionId: paymentResult.transactionId!,
        amount: finalBidAmount,
        status: 'COMPLETED',
      },
      message: 'تم معالجة دفع العرض الفائز بنجاح',
    });
  } catch (error: any) {
    console.error('خطأ في معالجة دفع العرض الفائز:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في معالجة دفع العرض الفائز',
    });
  }
}
