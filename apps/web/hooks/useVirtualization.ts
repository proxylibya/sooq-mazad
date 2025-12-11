import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface UseVirtualizationOptions {
  itemCount: number;
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  scrollingDelay?: number;
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
}

export function useVirtualization({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3,
  scrollingDelay = 150,
}: UseVirtualizationOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingTimeoutRef = useRef<NodeJS.Timeout>();

  // حساب ارتفاع العنصر
  const getItemHeight = useCallback(
    (index: number) => {
      return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
    },
    [itemHeight],
  );

  // حساب المجموع الكلي للارتفاع
  const totalHeight = useMemo(() => {
    if (typeof itemHeight === 'number') {
      return itemCount * itemHeight;
    }

    let total = 0;
    for (let i = 0; i < itemCount; i++) {
      total += getItemHeight(i);
    }
    return total;
  }, [itemCount, itemHeight, getItemHeight]);

  // حساب العناصر المرئية
  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = [];
    let currentOffset = 0;

    const scrollStart = scrollTop;
    const scrollEnd = scrollTop + containerHeight;

    const startWithOverscan = Math.max(0, scrollStart - overscan * getItemHeight(0));
    const endWithOverscan = scrollEnd + overscan * getItemHeight(0);

    for (let index = 0; index < itemCount; index++) {
      const itemSize = getItemHeight(index);
      const start = currentOffset;
      const end = currentOffset + itemSize;

      if (end >= startWithOverscan && start <= endWithOverscan) {
        items.push({
          index,
          start,
          end,
          size: itemSize,
        });
      }

      currentOffset += itemSize;

      if (start > endWithOverscan) {
        break;
      }
    }

    return items;
  }, [scrollTop, containerHeight, itemCount, overscan, getItemHeight]);

  // معالجة التمرير
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = event.currentTarget.scrollTop;
      setScrollTop(scrollTop);

      setIsScrolling(true);

      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }

      scrollingTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, scrollingDelay);
    },
    [scrollingDelay],
  );

  // تنظيف
  useEffect(() => {
    return () => {
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, []);

  // العثور على offset للعنصر
  const getOffsetForIndex = useCallback(
    (index: number) => {
      if (typeof itemHeight === 'number') {
        return index * itemHeight;
      }

      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i);
      }
      return offset;
    },
    [itemHeight, getItemHeight],
  );

  // التمرير إلى العنصر
  const scrollToIndex = useCallback(
    (index: number, align: 'start' | 'center' | 'end' = 'start') => {
      const offset = getOffsetForIndex(index);
      const itemSize = getItemHeight(index);

      let scrollTo = offset;

      if (align === 'center') {
        scrollTo = offset - containerHeight / 2 + itemSize / 2;
      } else if (align === 'end') {
        scrollTo = offset - containerHeight + itemSize;
      }

      setScrollTop(Math.max(0, Math.min(scrollTo, totalHeight - containerHeight)));
    },
    [getOffsetForIndex, getItemHeight, containerHeight, totalHeight],
  );

  return {
    virtualItems,
    totalHeight,
    isScrolling,
    scrollTop,
    handleScroll,
    scrollToIndex,
    getOffsetForIndex,
  };
}

// Hook مبسط للـ window virtualization
export function useWindowVirtualization({
  itemCount,
  itemHeight,
  overscan = 5,
}: {
  itemCount: number;
  itemHeight: number;
  overscan?: number;
}) {
  const [scrollY, setScrollY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 0,
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollY / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollY + windowHeight) / itemHeight) + overscan,
  );

  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight,
      });
    }
    return items;
  }, [startIndex, endIndex, itemHeight]);

  return {
    visibleItems,
    totalHeight: itemCount * itemHeight,
    startIndex,
    endIndex,
  };
}
