import { useEffect, useRef, useState } from 'react';

/**
 * useGlobalSecondTick
 * Hook بسيط يوفر نبضة زمنية (tick) كل ثانية على مستوى الصفحة لتقليل عدد المؤقتات.
 * - مرن للعمل على المتصفح فقط. لا يقوم بأي عمل على SSR.
 * - يعيد عداداً رقمياً يزداد كل ثانية ويمكن تمريره لمكونات العداد.
 */
export function useGlobalSecondTick(enabled: boolean = true): number {
  const [tick, setTick] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return; // SSR guard

    // بدء المؤقت
    intervalRef.current = setInterval(() => {
      setTick((t) => (t + 1) % 1000000000);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled]);

  return tick;
}
