// Auction Status Service - تحديث حالة المزادات
import logger from '../logger';
import prisma from '../prisma';

/**
 * تحديث حالة جميع المزادات
 */
export async function updateAllAuctionStatuses(): Promise<{
  updated: number;
  errors: number;
}> {
  const startTime = Date.now();
  let updated = 0;
  let errors = 0;

  try {
    const now = new Date();

    // تحديث المزادات النشطة التي انتهى وقتها
    const expiredActive = await prisma.auctions.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lte: now,
        },
      },
      data: {
        status: 'ENDED',
      },
    });

    updated += expiredActive.count;

    // تحديث المزادات القادمة التي حان وقت بدئها
    const readyToStart = await prisma.auctions.updateMany({
      where: {
        status: 'UPCOMING',
        startDate: {
          lte: now,
        },
        endDate: {
          gt: now,
        },
      },
      data: {
        status: 'ACTIVE',
      },
    });

    updated += readyToStart.count;

    const duration = Date.now() - startTime;

    logger.info('Auction statuses updated successfully', {
      updated,
      errors,
      duration,
    });

    return { updated, errors };
  } catch (error) {
    errors++;
    logger.error('Error updating auction statuses', {
      error: error instanceof Error ? error.message : error,
    });
    return { updated, errors };
  }
}

/**
 * تحديث حالة مزاد واحد
 */
export async function updateAuctionStatus(auctionId: string): Promise<{
  success: boolean;
  status?: string;
  error?: string;
}> {
  try {
    const auction = await prisma.auctions.findUnique({
      where: { id: auctionId },
    });

    if (!auction) {
      return { success: false, error: 'المزاد غير موجود' };
    }

    const now = new Date();
    let newStatus = auction.status;

    // تحديد الحالة الجديدة
    if (auction.status === 'UPCOMING' && auction.startDate <= now && auction.endDate > now) {
      newStatus = 'ACTIVE';
    } else if (auction.status === 'ACTIVE' && auction.endDate <= now) {
      newStatus = 'ENDED';
    }

    if (newStatus !== auction.status) {
      await prisma.auctions.update({
        where: { id: auctionId },
        data: { status: newStatus },
      });

      logger.info(`Auction status updated: ${auctionId}`, {
        auctionId,
        oldStatus: auction.status,
        newStatus,
      });
    }

    return { success: true, status: newStatus };
  } catch (error) {
    logger.error(`Error updating auction status: ${auctionId}`, {
      error: error instanceof Error ? error.message : error,
      auctionId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطأ في تحديث حالة المزاد',
    };
  }
}

/**
 * كائن الخدمة الرئيسي
 */
export const auctionStatusService = {
  updateAuctionStatuses: updateAllAuctionStatuses,
  updateSingleAuction: updateAuctionStatus,
  getStatus: () => ({
    lastRun: new Date().toISOString(),
    isRunning: false,
  }),
};
