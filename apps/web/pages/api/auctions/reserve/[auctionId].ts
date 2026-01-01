/**
 * API Endpoint for Auction Fund Reservation
 * /api/auctions/reserve/[auctionId]
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { auctionReservationService } from '../../../../services/auctionReservationService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface ReserveRequest {
  minimumAmount: number;
  durationHours?: number;
}

interface ReserveResponse {
  success: boolean;
  reservation?: {
    id: string;
    reservedAmount: number;
    expiresAt: string;
    status: string;
  };
  message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ReserveResponse>) {
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
    const { minimumAmount, durationHours = 24 }: ReserveRequest = req.body;

    if (!minimumAmount || minimumAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'مبلغ الحد الأدنى مطلوب ويجب أن يكون أكبر من الصفر',
      });
    }

    if (minimumAmount < 10) {
      return res.status(400).json({
        success: false,
        message: 'الحد الأدنى للحجز هو 10 دينار ليبي',
      });
    }

    if (durationHours < 1 || durationHours > 168) {
      // Max 1 week
      return res.status(400).json({
        success: false,
        message: 'مدة الحجز يجب أن تكون بين ساعة واحدة و 168 ساعة (أسبوع)',
      });
    }

    // Reserve funds
    const reservation = await auctionReservationService.reserveFundsForAuction(
      userId,
      auctionId,
      minimumAmount,
      durationHours,
    );

    return res.status(200).json({
      success: true,
      reservation: {
        id: reservation.id,
        reservedAmount: reservation.reservedAmount,
        expiresAt: reservation.expiresAt.toISOString(),
        status: reservation.status,
      },
      message: 'تم حجز الأموال بنجاح',
    });
  } catch (error: any) {
    console.error('خطأ في حجز الأموال:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في حجز الأموال',
    });
  }
}
