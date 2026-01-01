/**
 * دوال مساعدة لتحديثات المزادات عبر WebSocket
 */

import { getSocketServer, Update, UpdateType } from './socket-server';
import { getAuctionTopic } from './topics';
import { logger } from '../logger';

/**
 * هيكل بيانات المزايدة
 */
export interface BidData {
  auctionId: string;
  bidId: string;
  amount: number;
  userId: string;
  userName: string;
  timestamp: number;
  isLeading: boolean;
}

/**
 * هيكل بيانات المزاد
 */
export interface AuctionData {
  auctionId: string;
  status: 'ACTIVE' | 'ENDED' | 'CANCELLED';
  currentBid?: number;
  bidCount?: number;
  endTime?: Date;
  [key: string]: unknown;
}

/**
 * إرسال تحديث مزايدة جديدة
 */
export async function sendBidUpdate(bidData: BidData): Promise<void> {
  const socketServer = getSocketServer();

  const update: Update = {
    type: 'bid',
    topic: getAuctionTopic(bidData.auctionId),
    data: bidData,
    timestamp: Date.now(),
  };

  try {
    await socketServer.publishUpdate(update);
    logger.info('Bid update sent', {
      auctionId: bidData.auctionId,
      amount: bidData.amount,
    });
  } catch (error) {
    logger.error('Failed to send bid update', error as Error);
  }
}

/**
 * إرسال تحديث بيانات المزاد
 */
export async function sendAuctionUpdate(auctionData: AuctionData): Promise<void> {
  const socketServer = getSocketServer();

  const update: Update = {
    type: 'auction',
    topic: getAuctionTopic(auctionData.auctionId),
    data: auctionData,
    timestamp: Date.now(),
  };

  try {
    await socketServer.publishUpdate(update);
    logger.debug('Auction update sent', { auctionId: auctionData.auctionId });
  } catch (error) {
    logger.error('Failed to send auction update', error as Error);
  }
}

/**
 * إرسال إشعار انتهاء المزاد
 */
export async function sendAuctionEndUpdate(auctionId: string, winnerId?: string): Promise<void> {
  const socketServer = getSocketServer();

  const update: Update = {
    type: 'auction_end',
    topic: getAuctionTopic(auctionId),
    data: {
      auctionId,
      winnerId,
      endTime: new Date().toISOString(),
    },
    timestamp: Date.now(),
  };

  try {
    await socketServer.publishUpdate(update);
    logger.info('Auction end update sent', { auctionId, winnerId });
  } catch (error) {
    logger.error('Failed to send auction end update', error as Error);
  }
}

/**
 * إرسال تحديثات متعددة دفعة واحدة (Batch)
 */
export async function sendBatchBidUpdates(bids: BidData[]): Promise<void> {
  const socketServer = getSocketServer();

  const updates: Update[] = bids.map((bid) => ({
    type: 'bid' as UpdateType,
    topic: getAuctionTopic(bid.auctionId),
    data: bid,
    timestamp: Date.now(),
  }));

  try {
    await socketServer.publishBatch(updates);
    logger.info('Batch bid updates sent', { count: bids.length });
  } catch (error) {
    logger.error('Failed to send batch bid updates', error as Error);
  }
}

/**
 * Throttled Auction Update
 * يستخدم للتحديثات المتكررة مثل العد التنازلي
 */
const throttleTimers = new Map<string, NodeJS.Timeout>();
const THROTTLE_DELAY = 2000; // 2 ثانية

export function sendThrottledAuctionUpdate(auctionData: AuctionData, immediate = false): void {
  const { auctionId } = auctionData;

  // إذا كان immediate، إرسال فوراً
  if (immediate) {
    sendAuctionUpdate(auctionData);
    return;
  }

  // إذا كان هناك timer موجود، لا نفعل شيء
  if (throttleTimers.has(auctionId)) {
    return;
  }

  // إنشاء timer جديد
  const timer = setTimeout(() => {
    sendAuctionUpdate(auctionData);
    throttleTimers.delete(auctionId);
  }, THROTTLE_DELAY);

  throttleTimers.set(auctionId, timer);
}

/**
 * إلغاء جميع Throttled Updates
 */
export function clearThrottledUpdates(): void {
  throttleTimers.forEach((timer) => clearTimeout(timer));
  throttleTimers.clear();
}

/**
 * الحصول على عدد المشاهدين لمزاد
 */
export async function getAuctionViewersCount(auctionId: string): Promise<number> {
  const socketServer = getSocketServer();
  const topic = getAuctionTopic(auctionId);
  return socketServer.getTopicSubscribersCount(topic);
}

/**
 * إرسال عدد المشاهدين الحالي
 */
export async function broadcastViewersCount(auctionId: string): Promise<void> {
  const count = await getAuctionViewersCount(auctionId);
  const socketServer = getSocketServer();

  socketServer.emitToTopic(getAuctionTopic(auctionId), 'viewers_count', {
    auctionId,
    count,
    timestamp: Date.now(),
  });
}

export default {
  sendBidUpdate,
  sendAuctionUpdate,
  sendAuctionEndUpdate,
  sendBatchBidUpdates,
  sendThrottledAuctionUpdate,
  clearThrottledUpdates,
  getAuctionViewersCount,
  broadcastViewersCount,
};
