/**
 * Hook for managing auction fund reservations
 * هوك إدارة حجز أموال المزادات
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface AuctionReservation {
  id: string;
  auctionId: string;
  reservedAmount: number;
  currency: string;
  status: 'ACTIVE' | 'RELEASED' | 'USED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}

export interface ReservationStats {
  totalReservations: number;
  activeReservations: number;
  totalAmountReserved: number;
}

export interface BidValidation {
  isValid: boolean;
  message: string;
  reservationId?: string;
  maxAllowedBid?: number;
}

export const useAuctionReservation = () => {
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<AuctionReservation[]>([]);
  const [stats, setStats] = useState<ReservationStats | null>(null);

  // Reserve funds for auction
  const reserveFunds = useCallback(
    async (
      auctionId: string,
      minimumAmount: number,
      durationHours: number = 24,
    ): Promise<{ success: boolean; reservation?: any }> => {
      setLoading(true);
      try {
        const response = await fetch(`/api/auctions/reserve/${auctionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            minimumAmount,
            durationHours,
          }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success(result.message || 'تم حجز الأموال بنجاح');
          return { success: true, reservation: result.reservation };
        } else {
          toast.error(result.message || 'فشل في حجز الأموال');
          return { success: false };
        }
      } catch (error) {
        console.error('خطأ في حجز الأموال:', error);
        toast.error('حدث خطأ في الاتصال');
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Validate bid amount
  const validateBid = useCallback(
    async (auctionId: string, bidAmount: number): Promise<BidValidation> => {
      try {
        const response = await fetch(`/api/auctions/validate-bid/${auctionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            bidAmount,
          }),
        });

        const result = await response.json();

        if (result.success && result.validation) {
          return result.validation;
        } else {
          return {
            isValid: false,
            message: result.message || 'فشل في التحقق من العرض',
          };
        }
      } catch (error) {
        console.error('خطأ في التحقق من العرض:', error);
        return {
          isValid: false,
          message: 'حدث خطأ في التحقق من العرض',
        };
      }
    },
    [],
  );

  // Release reservation
  const releaseReservation = useCallback(async (reservationId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auctions/release-reservation/${reservationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'تم تحرير الحجز بنجاح');
        // Update reservations list
        setReservations((prev) =>
          prev.map((res) =>
            res.id === reservationId ? { ...res, status: 'RELEASED' as const } : res,
          ),
        );
        return true;
      } else {
        toast.error(result.message || 'فشل في تحرير الحجز');
        return false;
      }
    } catch (error) {
      console.error('خطأ في تحرير الحجز:', error);
      toast.error('حدث خطأ في الاتصال');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user reservations
  const fetchReservations = useCallback(
    async (status?: string, auctionId?: string): Promise<void> => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (auctionId) params.append('auctionId', auctionId);

        const response = await fetch(`/api/auctions/reservations?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });

        const result = await response.json();

        if (result.success) {
          setReservations(result.reservations || []);
          setStats(result.stats || null);
        } else {
          toast.error(result.message || 'فشل في استرجاع الحجوزات');
        }
      } catch (error) {
        console.error('خطأ في استرجاع الحجوزات:', error);
        toast.error('حدث خطأ في الاتصال');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Process winning bid (admin only)
  const processWinningBid = useCallback(
    async (
      auctionId: string,
      winnerId: string,
      finalBidAmount: number,
    ): Promise<{ success: boolean; transactionId?: string }> => {
      setLoading(true);
      try {
        const response = await fetch(`/api/auctions/process-winning-bid/${auctionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            winnerId,
            finalBidAmount,
          }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success(result.message || 'تم معالجة دفع العرض الفائز بنجاح');
          return {
            success: true,
            transactionId: result.payment?.transactionId,
          };
        } else {
          toast.error(result.message || 'فشل في معالجة دفع العرض الفائز');
          return { success: false };
        }
      } catch (error) {
        console.error('خطأ في معالجة دفع العرض الفائز:', error);
        toast.error('حدث خطأ في الاتصال');
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Cleanup expired reservations (admin only)
  const cleanupExpiredReservations = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auctions/reservations', {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'تم تنظيف الحجوزات المنتهية الصلاحية بنجاح');
        return true;
      } else {
        toast.error(result.message || 'فشل في تنظيف الحجوزات');
        return false;
      }
    } catch (error) {
      console.error('خطأ في تنظيف الحجوزات:', error);
      toast.error('حدث خطأ في الاتصال');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get active reservation for auction
  const getActiveReservation = useCallback(
    (auctionId: string): AuctionReservation | null => {
      return (
        reservations.find((res) => res.auctionId === auctionId && res.status === 'ACTIVE') || null
      );
    },
    [reservations],
  );

  // Check if reservation is expired
  const isReservationExpired = useCallback((reservation: AuctionReservation): boolean => {
    return new Date() > new Date(reservation.expiresAt);
  }, []);

  // Calculate remaining time for reservation
  const getReservationRemainingTime = useCallback((reservation: AuctionReservation): number => {
    const now = new Date().getTime();
    const expires = new Date(reservation.expiresAt).getTime();
    return Math.max(0, expires - now);
  }, []);

  // Format remaining time
  const formatRemainingTime = useCallback((milliseconds: number): string => {
    if (milliseconds <= 0) return 'منتهي الصلاحية';

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`;
    } else {
      return `${minutes} دقيقة`;
    }
  }, []);

  return {
    loading,
    reservations,
    stats,
    reserveFunds,
    validateBid,
    releaseReservation,
    fetchReservations,
    processWinningBid,
    cleanupExpiredReservations,
    getActiveReservation,
    isReservationExpired,
    getReservationRemainingTime,
    formatRemainingTime,
  };
};
