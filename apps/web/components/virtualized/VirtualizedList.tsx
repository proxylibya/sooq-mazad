import React, { useRef, useCallback, CSSProperties } from 'react';
import { useVirtualization } from '@/hooks/useVirtualization';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number, style: CSSProperties) => React.ReactNode;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  onScroll?: (scrollTop: number) => void;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
  emptyMessage = 'لا توجد بيانات',
  loading = false,
  loadingComponent,
  onScroll,
  onEndReached,
  endReachedThreshold = 0.9,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);

  const {
    virtualItems,
    totalHeight,
    isScrolling,
    handleScroll: virtualHandleScroll,
  } = useVirtualization({
    itemCount: items.length,
    itemHeight,
    containerHeight: height,
    overscan,
  });

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      virtualHandleScroll(event);

      const scrollTop = event.currentTarget.scrollTop;
      const scrollHeight = event.currentTarget.scrollHeight;
      const clientHeight = event.currentTarget.clientHeight;

      // استدعاء callback للـ scroll
      if (onScroll) {
        onScroll(scrollTop);
      }

      // التحقق من الوصول إلى النهاية
      if (onEndReached) {
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        // تجنب الاستدعاء المتكرر
        if (scrollPercentage >= endReachedThreshold && scrollTop > lastScrollTopRef.current) {
          onEndReached();
        }
      }

      lastScrollTopRef.current = scrollTop;
    },
    [virtualHandleScroll, onScroll, onEndReached, endReachedThreshold],
  );

  if (loading && items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        {loadingComponent || (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            
          </div>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height, position: 'relative' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const style: CSSProperties = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: virtualItem.size,
            transform: `translateY(${virtualItem.start}px)`,
          };

          return (
            <div key={virtualItem.index} style={style}>
              {renderItem(item, virtualItem.index, style)}
            </div>
          );
        })}
      </div>

      {loading && items.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        </div>
      )}

      {isScrolling && (
        <div className="pointer-events-none fixed left-4 top-4 rounded bg-black bg-opacity-70 px-3 py-2 text-sm text-white">
          التمرير النشط...
        </div>
      )}
    </div>
  );
}

// مكون List مبسط مع infinite scroll
interface InfiniteScrollListProps<T> extends Omit<VirtualizedListProps<T>, 'onEndReached'> {
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function InfiniteScrollList<T>({
  onLoadMore,
  hasMore = true,
  isLoadingMore = false,
  ...props
}: InfiniteScrollListProps<T>) {
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <VirtualizedList
      {...props}
      onEndReached={handleEndReached}
      loading={props.loading || isLoadingMore}
    />
  );
}
