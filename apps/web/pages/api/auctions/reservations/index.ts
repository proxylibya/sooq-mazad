/**
 * API Endpoint for Managing User Reservations
 * /api/auctions/reservations
 */

import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { auctionReservationService } from '../../../../services/auctionReservationService';

const JWT_SECRET = process.env.JWT_SECRET;

interface GetReservationsResponse {
  success: boolean;
  reservations?: Array<{
    id: string;
    auctionId: string;
    reservedAmount: number;
    currency: string;
    status: string;
    createdAt: string;
    expiresAt: string;
    metadata?: Record<string, unknown>;
  }>;
  stats?: {
    totalReservations: number;
    activeReservations: number;
    totalAmountReserved: number;
  };
  message: string;
}

interface CleanupResponse {
  success: boolean;
  cleaned?: number;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetReservationsResponse | CleanupResponse>,
) {
  if (!['GET', 'DELETE'].includes(req.method!)) {
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

    // Ensure server is configured with a JWT secret
    if (!JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server misconfigured: missing JWT secret',
      });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صالح',
      });
    }

    const userId = decoded.userId;
    const userRole = decoded.role;

    if (req.method === 'GET') {
      // Get user reservations
      const { status, auctionId } = req.query;

      const reservations = await auctionReservationService.getUserReservations(
        userId,
        status as string,
      );

      const stats = await auctionReservationService.getReservationStats(auctionId as string);

      return res.status(200).json({
        success: true,
        reservations: reservations.map((reservation) => ({
          id: reservation.id,
          auctionId: reservation.auctionId,
          reservedAmount: reservation.reservedAmount,
          currency: reservation.currency,
          status: reservation.status,
          createdAt: reservation.createdAt.toISOString(),
          expiresAt: reservation.expiresAt.toISOString(),
          metadata: reservation.metadata,
        })),
        stats: {
          totalReservations: stats.totalReservations,
          activeReservations: stats.activeReservations,
          totalAmountReserved: stats.totalAmountReserved,
        },
        message: 'تم استرجاع الحجوزات بنجاح',
      });
    } else if (req.method === 'DELETE') {
      // Cleanup expired reservations (admin only)
      if (!['AUCTION_MANAGER'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية لتنظيف الحجوزات',
        });
      }

      await auctionReservationService.cleanupExpiredReservations();

      return res.status(200).json({
        success: true,
        message: 'تم تنظيف الحجوزات المنتهية الصلاحية بنجاح',
      });
    }
  } catch (error: unknown) {
    console.error('خطأ في إدارة الحجوزات:', error);

    return res.status(500).json({
      success: false,
      message: (error instanceof Error ? error.message : 'حدث خطأ في إدارة الحجوزات'),
    });
  }
}
