import React, { useRef, useCallback, CSSProperties, useState, useEffect } from 'react';

interface VirtualizedGridProps<T> {
  items: T[];
  itemHeight: number;
  itemsPerRow: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  overscan?: number;
}

export function VirtualizedGrid<T>({
  items,
  itemHeight,
  itemsPerRow,
  gap = 16,
  renderItem,
  className = '',
  emptyMessage = 'لا توجد بيانات',
  loading = false,
  onEndReached,
  endReachedThreshold = 0.9,
  overscan = 2,
}: VirtualizedGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // حساب عدد الصفوف
  const rowCount = Math.ceil(items.length / itemsPerRow);
  const rowHeight = itemHeight + gap;
  const totalHeight = rowCount * rowHeight;

  // حساب الصفوف المرئية
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    rowCount - 1,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan,
  );

  // معالجة التمرير
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      setScrollTop(target.scrollTop);

      // التحقق من الوصول إلى النهاية
      if (onEndReached) {
        const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight;

        if (scrollPercentage >= endReachedThreshold) {
          onEndReached();
        }
      }
    },
    [onEndReached, endReachedThreshold],
  );

  // تحديث ارتفاع الحاوية
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  if (loading && items.length === 0) {
    return (
      <div ref={containerRef} className={`flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div ref={containerRef} className={`flex items-center justify-center ${className}`}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // العناصر المرئية
  const visibleItems: Array<{
    item: T;
    index: number;
    row: number;
    col: number;
  }> = [];
  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < itemsPerRow; col++) {
      const index = row * itemsPerRow + col;
      if (index < items.length) {
        visibleItems.push({
          item: items[index],
          index,
          row,
          col,
        });
      }
    }
  }

  return (
    <div ref={containerRef} className={`overflow-auto ${className}`} onScroll={handleScroll}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col }) => {
          const style: CSSProperties = {
            position: 'absolute',
            top: row * rowHeight,
            left: `calc(${(col / itemsPerRow) * 100}% + ${col > 0 ? gap / 2 : 0}px)`,
            width: `calc(${100 / itemsPerRow}% - ${gap}px)`,
            height: itemHeight,
          };

          return (
            <div key={index} style={style}>
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>

      {loading && items.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        </div>
      )}
    </div>
  );
}

// مكون Grid مع infinite scroll
interface InfiniteScrollGridProps<T> extends VirtualizedGridProps<T> {
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function InfiniteScrollGrid<T>({
  onLoadMore,
  hasMore = true,
  isLoadingMore = false,
  ...props
}: InfiniteScrollGridProps<T>) {
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <VirtualizedGrid
      {...props}
      onEndReached={handleEndReached}
      loading={props.loading || isLoadingMore}
    />
  );
}

// مكون Grid متجاوب
interface ResponsiveVirtualizedGridProps<T> extends Omit<VirtualizedGridProps<T>, 'itemsPerRow'> {
  minItemWidth: number;
  maxItemWidth?: number;
}

export function ResponsiveVirtualizedGrid<T>({
  minItemWidth,
  maxItemWidth,
  ...props
}: ResponsiveVirtualizedGridProps<T>) {
  const [itemsPerRow, setItemsPerRow] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateItemsPerRow = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const itemWidth = maxItemWidth
          ? Math.min(maxItemWidth, Math.max(minItemWidth, containerWidth / 4))
          : minItemWidth;
        const newItemsPerRow = Math.max(1, Math.floor(containerWidth / itemWidth));
        setItemsPerRow(newItemsPerRow);
      }
    };

    updateItemsPerRow();

    const resizeObserver = new ResizeObserver(updateItemsPerRow);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [minItemWidth, maxItemWidth]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <VirtualizedGrid {...props} itemsPerRow={itemsPerRow} />
    </div>
  );
}
