import { EventEmitter } from 'events';

export type AuctionUpdatePayload = {
  auctionId: string;
  currentBid: number;
  bidCount?: number;
  highestBidderId?: string;
  timestamp: string;
};

export type AuctionStatusUpdatePayload = {
  auctionId: string;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'SOLD';  // ✅ تطابق Prisma enum
  timestamp: string;
};

class AuctionEventBus extends EventEmitter {
  emitBidUpdated(payload: AuctionUpdatePayload) {
    this.emit('bid_updated', payload);
  }

  emitStatusChanged(payload: AuctionStatusUpdatePayload) {
    this.emit('status_changed', payload);
  }
}

// حافظ على نسخة وحيدة عبر عمليات إعادة التحميل في التطوير
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any;

if (!g.__auctionEventBus) {
  g.__auctionEventBus = new AuctionEventBus();
}

export const auctionEventBus: AuctionEventBus = g.__auctionEventBus as AuctionEventBus;
