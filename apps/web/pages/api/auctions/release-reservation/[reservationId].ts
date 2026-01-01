/**
 * API Endpoint for Releasing Auction Reservations
 * /api/auctions/release-reservation/[reservationId]
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { auctionReservationService } from '../../../../services/auctionReservationService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface ReleaseReservationResponse {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReleaseReservationResponse>,
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

    const { reservationId } = req.query;

    if (!reservationId || typeof reservationId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'معرف الحجز مطلوب',
      });
    }

    // Release reservation
    await auctionReservationService.releaseReservation(reservationId);

    return res.status(200).json({
      success: true,
      message: 'تم تحرير الحجز بنجاح',
    });
  } catch (error: any) {
    console.error('خطأ في تحرير الحجز:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في تحرير الحجز',
    });
  }
}
