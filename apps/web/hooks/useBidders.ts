import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuctionSSE } from './useAuctionSSE';

export interface Bidder {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: string;
  isWinning: boolean;
  bidder?: {
    id: string;
    name: string | null;
    profileImage: string | null;
    verified: boolean | null;
    phone?: string | null;
    email?: string | null;
    createdAt?: string;
  };
}

export interface BidderForList {
  id: number;
  name: string;
  amount: string | null;
  increaseAmount?: string;
  timestamp: Date;
  isWinning: boolean;
  isVerified: boolean;
  avatar?: string;
  bidRank: number;
  timeAgo: string;
  rating?: number;
  totalBids?: number;
  joinDate?: string;
  phone?: string;
  userIdStr: string;
}

interface UseBiddersReturn {
  bidders: BidderForList[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalBidders: number;
  highestBid: number | null;
}

export const useBidders = (auctionId: string | undefined): UseBiddersReturn => {
  const [bidders, setBidders] = useState<BidderForList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const bidTime = new Date(timestamp);
    const diffMs = now.getTime() - bidTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  const transformBidderData = useCallback((rawBidders: Bidder[]): BidderForList[] => {
    if (!rawBidders || rawBidders.length === 0) return [];

    // محوّل ثابت لإنشاء معرف رقمي مستقر من معرفات السلاسل (cuid/uuid)
    const toNumericId = (s: string) => {
      let h = 0 >>> 0;
      for (let i = 0; i < s.length; i++) {
        h = (h * 31 + s.charCodeAt(i)) >>> 0;
      }
      return h || 0;
    };

    // تجميع المزايدات حسب المزايد (userId)
    type Agg = {
      id: number;
      name: string;
      avatar?: string;
      isVerified: boolean;
      highestAmount: number;
      latestTs: Date;
      totalBids: number;
      joinDate?: string;
      phone?: string;
      userIdStr: string;
    };

    const byUser: Record<string, Agg> = {};
    for (const b of rawBidders) {
      const userIdStr = String(b.userId || b.bidder?.id || '').trim();
      if (!userIdStr) continue;
      const amountNum = typeof b.amount === 'number' ? b.amount : parseInt(String(b.amount || 0), 10);
      const ts = new Date(b.timestamp);
      const existing = byUser[userIdStr];
      if (!existing) {
        byUser[userIdStr] = {
          id: (() => {
            const parsed = parseInt(userIdStr, 10);
            return Number.isFinite(parsed) ? parsed : toNumericId(userIdStr);
          })(),
          name: b.bidder?.name || 'مزايد',
          avatar: b.bidder?.profileImage || undefined,
          isVerified: !!b.bidder?.verified,
          highestAmount: Number.isFinite(amountNum) ? amountNum : 0,
          latestTs: ts,
          totalBids: 1,
          joinDate: b.bidder?.createdAt ? new Date(b.bidder.createdAt).toLocaleDateString('ar-SA') : undefined,
          phone: b.bidder?.phone || undefined,
          userIdStr,
        };
      } else {
        existing.totalBids += 1;
        if (Number.isFinite(amountNum) && amountNum > existing.highestAmount) {
          existing.highestAmount = amountNum;
        }
        if (ts > existing.latestTs) existing.latestTs = ts;
      }
    }

    // تحويل للائحة مرتبة حسب أعلى مبلغ
    const aggregated = Object.values(byUser).sort((a, b) => b.highestAmount - a.highestAmount);

    // بناء عناصر العرض مع حساب الفروقات والترتيب والفائز
    const list: BidderForList[] = aggregated.map((u, index) => {
      const nextLower = index < aggregated.length - 1 ? aggregated[index + 1] : null;
      const increaseAmount = nextLower ? u.highestAmount - nextLower.highestAmount : u.highestAmount;
      return {
        id: u.id,
        name: u.name,
        amount: u.highestAmount.toString(),
        increaseAmount: increaseAmount > 0 ? increaseAmount.toString() : undefined,
        timestamp: u.latestTs,
        isWinning: index === 0,
        isVerified: u.isVerified,
        avatar: u.avatar,
        bidRank: index + 1,
        timeAgo: calculateTimeAgo(u.latestTs.toISOString()),
        rating: Math.floor(Math.random() * 5) + 1,
        totalBids: u.totalBids,
        joinDate: u.joinDate,
        phone: u.phone,
        userIdStr: u.userIdStr,
      };
    });

    return list;
  }, []);

  const fetchBidders = useCallback(async () => {
    if (!auctionId) return;

    setIsLoading(true);
    setError(null);

    try {
      // console.log(`[useBidders] جلب المزايدين للمزاد: ${auctionId}`); // معطل لتقليل console spam

      // إضافة timestamp لكسر الـ cache ومنع مشاكل التخزين المؤقت
      const timestamp = Date.now();
      const response = await fetch(`/api/auctions/${auctionId}/bid?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        // ✅ إذا كان 404 أو 500، نعتبره لا توجد مزايدات بدلاً من رمي خطأ
        if (response.status === 404 || response.status === 500) {
          console.warn(`[useBidders] ⚠️ المزاد غير موجود أو لا توجد مزايدات: ${response.status}`);
          setBidders([]);
          return;
        }
        throw new Error(`خطأ في الحصول على المزايدين: ${response.status}`);
      }

      const data = await response.json();
      // console.log(`[useBidders] استجابة API:`, data); // معطل

      if (data.success && data.data) {
        const transformedBidders = transformBidderData(data.data);
        setBidders(transformedBidders);
        // console.log(`[useBidders] ✅ تم تحويل ${transformedBidders.length} مزايد بنجاح`); // معطل
        // console.log(`[useBidders] 🔍 البيانات المحولة:`, transformedBidders); // معطل
      } else {
        console.warn(`[useBidders] ⚠️ لا توجد مزايدات أو فشل في الاستجابة:`, data.message);
        setBidders([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف في جلب المزايدين';
      console.error(`[useBidders] خطأ:`, errorMessage);
      setError(errorMessage);
      setBidders([]);
    } finally {
      setIsLoading(false);
    }
  }, [auctionId, transformBidderData]);

  // الجلب الأولي
  useEffect(() => {
    fetchBidders();
  }, [fetchBidders]);

  // 🔄 تحديث تلقائي عند استلام أحداث SSE
  const lastRefreshRef = useRef<number>(0);
  useAuctionSSE(auctionId ? [auctionId] : [], {
    enabled: !!auctionId,
    onBid: useCallback((payload) => {
      if (String(payload.auctionId) === String(auctionId)) {
        // Debounce: تحديث مرة واحدة كل 500ms
        const now = Date.now();
        if (now - lastRefreshRef.current > 500) {
          lastRefreshRef.current = now;
          fetchBidders();
        }
      }
    }, [auctionId, fetchBidders]),
  });

  // حساب أعلى مزايدة
  const highestBid = bidders.length > 0 ?
    Math.max(...bidders.map(b => parseInt(b.amount || '0'))) : null;

  return {
    bidders,
    isLoading,
    error,
    refetch: fetchBidders,
    totalBidders: bidders.length,
    highestBid,
  };
};
