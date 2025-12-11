/**
 * API Endpoint for Bid Validation
 * /api/auctions/validate-bid/[auctionId]
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { auctionReservationService } from '../../../../services/auctionReservationService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface ValidateBidRequest {
  bidAmount: number;
}

interface ValidateBidResponse {
  success: boolean;
  validation?: {
    isValid: boolean;
    message: string;
    reservationId?: string;
    maxAllowedBid?: number;
  };
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidateBidResponse>,
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

    const userId = decoded.userId;
    const { auctionId } = req.query;

    if (!auctionId || typeof auctionId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'معرف المزاد مطلوب',
      });
    }

    // Validate request body
    const { bidAmount }: ValidateBidRequest = req.body;

    if (!bidAmount || bidAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'مبلغ العرض مطلوب ويجب أن يكون أكبر من الصفر',
      });
    }

    // Validate bid against reservation
    const validation = await auctionReservationService.validateBidReservation(
      userId,
      auctionId,
      bidAmount,
    );

    return res.status(200).json({
      success: true,
      validation: {
        isValid: validation.isValid,
        message: validation.message,
        reservationId: validation.reservationId || undefined,
      },
      message: 'تم التحقق من العرض',
    });
  } catch (error: any) {
    console.error('خطأ في التحقق من العرض:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في التحقق من العرض',
    });
  }
}
