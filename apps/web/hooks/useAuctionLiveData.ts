/**
 * Hook متقدم للتحديث التلقائي لبيانات المزادات المباشرة
 * يحدث الأسعار وعدد المزايدات والحالة بشكل تلقائي
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAbortController } from './useSafeAbortController';

interface AuctionData {
  id: string | number;
  currentBid: string | number;
  bidCount: number;
  auctionType: 'upcoming' | 'live' | 'ended';
}

interface AuctionLiveDataHookOptions {
  enabled?: boolean;
  interval?: number; // بالميلي ثانية
  onUpdate?: (data: AuctionData[]) => void;
}

export const useAuctionLiveData = (
  auctionIds: (string | number)[],
  options: AuctionLiveDataHookOptions = {}
) => {
  const {
    enabled = true,
    interval = 15000, // 15 ثانية افتراضياً
    onUpdate,
  } = options;

  const [liveData, setLiveData] = useState<Map<string | number, AuctionData>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // استخدام الhook الآمن لإدارة AbortController
  const { createNewController, abortSafely, isAbortError } = useSafeAbortController();
  // مرجع لتتبع حالة التركيب لتجنّب setState بعد التفكيك
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  // حافظ مستقر لمرجع onUpdate لتجنب تغيير دالة fetchLiveData عند كل إعادة تصيير
  const onUpdateRef = useRef<typeof onUpdate>(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);
  // مرجع مستقر لقائمة المعرّفات لتجنب تغيّر دالة fetchLiveData باستمرار
  const auctionIdsRef = useRef<(string | number)[]>(auctionIds);
  useEffect(() => {
    auctionIdsRef.current = auctionIds;
  }, [auctionIds]);

  // نوع للعنصر القادم من API
  type LiveDataApiAuction = {
    id: string | number;
    currentBid?: string | number;
    currentPrice?: string | number;
    startingPrice?: string | number;
    bidCount?: number;
    totalBids?: number;
    status?: string;
    auctionType?: 'upcoming' | 'live' | 'ended';
  };

  const normalizeAuctionType = (value: unknown): 'upcoming' | 'live' | 'ended' => {
    const v = String(value || '').toLowerCase();
    if (v === 'upcoming') return 'upcoming';
    if (v === 'ended') return 'ended';
    return 'live';
  };

  // دالة جلب البيانات المباشرة
  const fetchLiveData = useCallback(async () => {
    if (!enabled || auctionIdsRef.current.length === 0) return;

    // إنشاء controller جديد بشكل آمن (سيلغي السابق تلقائياً)
    const controller = createNewController();

    try {
      if (isMountedRef.current) setIsLoading(true);

      // فحص حالة الإلغاء قبل البدء
      if (controller.signal.aborted) {
        return;
      }

      // جلب البيانات المباشرة من API مع معالجة صامتة لأخطاء الإلغاء
      const response = await new Promise<Response | null>((resolve) => {
        // فحص الإلغاء قبل بدء الطلب
        if (controller.signal.aborted) {
          resolve(null);
          return;
        }

        fetch('/api/auctions/live-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auctionIds: auctionIdsRef.current }),
          signal: controller.signal,
        })
          .then((res) => resolve(res))
          .catch((err) => {
            // تجاهل صامت لجميع أخطاء الإلغاء - لا ترمي الخطأ
            const errStr = String(err).toLowerCase();
            const isAbort = controller.signal.aborted ||
              err === 'SILENT_ABORT' ||
              errStr === 'silent_abort' ||
              errStr.includes('silent_abort') ||
              err?.name === 'AbortError' ||
              errStr.includes('abort') ||
              errStr.includes('cancelled') ||
              errStr.includes('canceled');

            if (isAbort) {
              resolve(null); // تجاهل صامت
            } else {
              // أخطاء أخرى - أرجع null ولا ترمي
              if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
                console.warn('[Live Data] Fetch error (non-abort):', err?.message || err);
              }
              resolve(null);
            }
          });
      });

      // فحص مرة أخرى بعد fetch
      if (controller.signal.aborted || !response) return;

      // تحليل الاستجابة حتى لو كانت غير ok (لمعالجة graceful)
      let data: { auctions?: LiveDataApiAuction[]; success?: boolean; } = { auctions: [] };

      try {
        // التحقق من نوع المحتوى قبل محاولة التحليل
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // استجابة غير JSON - تجاهل بصمت
          return;
        }
        data = await response.json();
      } catch {
        // فشل في تحليل JSON - تجاهل بصمت (قد يكون بسبب إلغاء الطلب)
        // لا نعرض تحذير لأن هذا يحدث بشكل طبيعي عند التنقل
        return;
      }

      // إذا كان هناك خطأ أو لا توجد بيانات، لا نقوم بأي شيء
      if (!response.ok || !data.auctions) {
        return;
      }

      // تحديث الخريطة
      const newData = new Map<string | number, AuctionData>();

      if (data.auctions && Array.isArray(data.auctions)) {
        (data.auctions as LiveDataApiAuction[]).forEach((auction) => {
          const at = normalizeAuctionType(auction.auctionType ?? auction.status ?? 'live');
          newData.set(auction.id, {
            id: auction.id,
            currentBid: auction.currentBid ?? auction.currentPrice ?? auction.startingPrice ?? '0',
            bidCount: auction.bidCount ?? auction.totalBids ?? 0,
            auctionType: at,
          });
        });
      }

      if (isMountedRef.current) {
        setLiveData(newData);
        setLastUpdate(new Date());
      }

      const cb = onUpdateRef.current;
      if (isMountedRef.current && cb) {
        const normalized: AuctionData[] = Array.from(newData.values());
        cb(normalized);
      }

      // تسجيل خفيف للتحديثات الناجحة (معطل تقريباً - 1% فقط)
      if (Math.random() < 0.01) { // 1% من المرات فقط
        console.log(`[🔄 Live Data] تحديث ${newData.size} مزاد - ${new Date().toLocaleTimeString('ar')}`);
      }
    } catch (error: unknown) {
      // معالجة صامتة لجميع الأخطاء - لا نعرض أخطاء الإلغاء أبداً
      if (!isAbortError(error) && !controller.signal.aborted) {
        // فقط عرض الأخطاء الحقيقية وليس أخطاء الإلغاء (1% فقط)
        if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) {
          const message =
            typeof error === 'object' && error !== null && 'message' in error
              ? String((error as { message?: unknown; }).message)
              : String(error);
          console.warn('[Live Data] خطأ غير متوقع:', message);
        }
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, createNewController]);

  // بدء نظام التحديث التلقائي
  useEffect(() => {
    if (!enabled) return;

    // جلب فوري عند التحميل
    fetchLiveData();

    // إعداد التحديث الدوري
    intervalRef.current = setInterval(() => {
      fetchLiveData();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // استخدام الhook الآمن للتنظيف
      abortSafely();
    };
  }, [enabled, interval, fetchLiveData, abortSafely]);

  // إعادة الجلب مرة واحدة عند تغيّر قائمة المعرفات (مثلاً بعد الترحيل بين الصفحات)
  useEffect(() => {
    if (!enabled) return;
    if (!auctionIdsRef.current || auctionIdsRef.current.length === 0) return;
    fetchLiveData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionIds]);

  // دالة مساعدة للحصول على بيانات مزاد محدد
  const getAuctionData = useCallback(
    (auctionId: string | number): AuctionData | null => {
      return liveData.get(auctionId) || null;
    },
    [liveData]
  );

  // دالة إعادة التحميل اليدوية
  const refetch = useCallback(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  return {
    liveData,
    getAuctionData,
    isLoading,
    lastUpdate,
    refetch,
  };
};
