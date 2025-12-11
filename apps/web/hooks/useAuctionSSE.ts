import { useEffect, useMemo, useRef, useState } from 'react';

export interface AuctionSSEPayload {
  auctionId: string;
  currentBid: number;
  bidCount?: number;
  highestBidderId?: string;
  timestamp?: string;
}

export interface AuctionStatusSSEPayload {
  auctionId: string;
  status: 'upcoming' | 'live' | 'ended' | 'sold';
  timestamp?: string;
}

interface Options {
  enabled?: boolean;
  onBid?: (payload: AuctionSSEPayload) => void;
  onStatus?: (payload: AuctionStatusSSEPayload) => void;
}

export const useAuctionSSE = (
  auctionIds: Array<string | number>,
  options: Options = {}
) => {
  const { enabled = true, onBid, onStatus } = options;
  const [connected, setConnected] = useState(false);
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<number>(0);
  const idsRef = useRef<string[]>([]);
  const onBidRef = useRef<typeof onBid>(onBid);
  const onStatusRef = useRef<typeof onStatus>(onStatus);
  const idleTimerRef = useRef<number | null>(null);
  const idleThresholdMsRef = useRef<number>(60000); // 60s بدون أحداث => إعادة الاتصال
  const lastEventAtRef = useRef<number>(0);
  const connectedRef = useRef<boolean>(false);

  useEffect(() => {
    idsRef.current = (auctionIds || []).map((x) => String(x)).filter(Boolean);
  }, [auctionIds]);

  useEffect(() => {
    onBidRef.current = onBid;
  }, [onBid]);

  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  const idsKey = useMemo(
    () => (auctionIds || []).map((x) => String(x)).filter(Boolean).sort().join(','),
    [auctionIds],
  );

  useEffect(() => {
    if (!enabled) return;
    if (!idsRef.current || idsRef.current.length === 0) return;

    const clearIdleTimer = () => {
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };

    const startIdleTimer = () => {
      clearIdleTimer();
      idleTimerRef.current = window.setInterval(() => {
        try {
          const last = lastEventAtRef.current || 0;
          const now = Date.now();
          if (connectedRef.current && now - last > idleThresholdMsRef.current) {
            // إعادة إنشاء الاتصال عند الخمول
            setConnected(false);
            connectedRef.current = false;
            try { esRef.current?.close(); } catch { /* noop */ }
            esRef.current = null;
            connect();
          }
        } catch { /* noop */ }
      }, 15000); // فحص كل 15 ثانية
    };

    const connect = () => {
      try {
        const query = encodeURIComponent(idsRef.current.join(','));
        const url = `/api/auctions/stream?ids=${query}`;
        const es = new EventSource(url);
        esRef.current = es;

        es.addEventListener('open', () => {
          setConnected(true);
          connectedRef.current = true;
          reconnectRef.current = 0;
          startIdleTimer();
        });

        es.addEventListener('bid_updated', (ev: MessageEvent) => {
          try {
            const data = JSON.parse(ev.data) as AuctionSSEPayload;
            const now = new Date();
            setLastEventAt(now);
            lastEventAtRef.current = now.getTime();
            const cb = onBidRef.current;
            if (cb) cb(data);
          } catch {
            // ignore malformed event
          }
        });

        es.addEventListener('status_changed', (ev: MessageEvent) => {
          try {
            const data = JSON.parse(ev.data) as AuctionStatusSSEPayload;
            const now = new Date();
            setLastEventAt(now);
            lastEventAtRef.current = now.getTime();
            const cb = onStatusRef.current;
            if (cb) cb(data);
          } catch {
            // ignore malformed event
          }
        });

        // fallback لرسائل عامة لو تم إرسالها
        es.addEventListener('message', () => {
          const now = new Date();
          setLastEventAt(now);
          lastEventAtRef.current = now.getTime();
        });

        es.addEventListener('error', () => {
          setConnected(false);
          connectedRef.current = false;
          try { es.close(); } catch { /* noop */ }
          esRef.current = null;
          clearIdleTimer();
          // Reconnect with exponential backoff + jitter
          const base = Math.min(30000, 1000 * Math.pow(2, reconnectRef.current));
          const jitter = Math.floor(Math.random() * 400);
          const backoff = Math.max(800, base + jitter);
          reconnectRef.current += 1;
          setTimeout(() => {
            if (enabled) connect();
          }, backoff);
        });
      } catch {
        // silent
      }
    };

    connect();

    return () => {
      try {
        if (esRef.current) esRef.current.close();
      } catch {
        // noop
      }
      esRef.current = null;
      setConnected(false);
      connectedRef.current = false;
      clearIdleTimer();
    };
  }, [enabled, idsKey]);

  return { connected, lastEventAt };
};
