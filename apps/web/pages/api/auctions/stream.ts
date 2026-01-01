/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { auctionEventBus } from '@/lib/live/auctionEventBus';

export const config = {
  api: { bodyParser: false },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Parse and normalize ids filter
  const idsParam = (req.query.ids as string) || '';
  const ids = idsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((x) => String(x));
  const filter = new Set<string>(ids);

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  // Helpful when sitting behind nginx to disable response buffering
  res.setHeader('X-Accel-Buffering', 'no');

  // Flush headers if supported
  const maybeFlush = (res as unknown as { flushHeaders?: () => void }).flushHeaders;
  if (typeof maybeFlush === 'function') {
    try { maybeFlush.call(res); } catch { /* noop */ }
  }

  // Track if connection is closed
  let isClosed = false;

  const write = (event: string, data: unknown) => {
    if (isClosed) return;
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      // Connection likely closed, mark as closed
      isClosed = true;
    }
  };

  // Initial hello
  write('open', { ok: true, ids: Array.from(filter) });

  // Heartbeat to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    if (isClosed) {
      clearInterval(heartbeat);
      return;
    }
    try {
      res.write(`: ping\n\n`);
    } catch (error) {
      // Connection closed, mark as closed and cleanup
      isClosed = true;
      clearInterval(heartbeat);
    }
  }, 15000);

  const onBidUpdated = (payload: {
    auctionId: string;
    currentBid: number;
    bidCount?: number;
    highestBidderId?: string;
    timestamp: string;
  }) => {
    if (isClosed) return;
    if (filter.size && !filter.has(String(payload.auctionId))) return;
    write('bid_updated', payload);
  };

  const onStatusChanged = (payload: {
    auctionId: string;
    status: 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'SOLD';  // ✅ تطابق Prisma enum
    timestamp: string;
  }) => {
    if (isClosed) return;
    if (filter.size && !filter.has(String(payload.auctionId))) return;
    write('status_changed', payload);
  };

  auctionEventBus.on('bid_updated', onBidUpdated);
  auctionEventBus.on('status_changed', onStatusChanged);

  // Cleanup function
  const cleanup = () => {
    if (isClosed) return;
    isClosed = true;
    try { clearInterval(heartbeat); } catch {}
    try { auctionEventBus.off('bid_updated', onBidUpdated); } catch {}
    try { auctionEventBus.off('status_changed', onStatusChanged); } catch {}
    try { res.end(); } catch {}
  };

  // Cleanup on client disconnect
  req.on('close', cleanup);
  
  // Cleanup on errors (prevents ECONNRESET from crashing the server)
  req.on('error', (error: any) => {
    // Silently handle connection errors (client disconnect, etc.)
    if (error.code === 'ECONNRESET' || error.code === 'EPIPE' || error.message === 'aborted') {
      cleanup();
    } else {
      console.error('[SSE Stream] Unexpected error:', error);
      cleanup();
    }
  });

  res.on('error', (error: any) => {
    // Silently handle response errors
    if (error.code === 'ECONNRESET' || error.code === 'EPIPE' || error.message === 'aborted') {
      cleanup();
    } else {
      console.error('[SSE Stream] Response error:', error);
      cleanup();
    }
  });
}
