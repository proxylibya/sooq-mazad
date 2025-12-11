import React, { useCallback, CSSProperties, useMemo } from 'react';
import { useVirtualization } from '@/hooks/useVirtualization';

export interface Column<T> {
  key: string;
  header: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  sticky?: boolean;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height: number;
  rowHeight?: number;
  headerHeight?: number;
  overscan?: number;
  className?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  onRowClick?: (item: T, index: number) => void;
  emptyMessage?: string;
  loading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  stickyHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
}

export function VirtualizedTable<T extends Record<string, any>>({
  data,
  columns,
  height,
  rowHeight = 60,
  headerHeight = 50,
  overscan = 5,
  className = '',
  rowClassName = '',
  onRowClick,
  emptyMessage = 'لا توجد بيانات',
  loading = false,
  sortBy,
  sortOrder,
  onSort,
  stickyHeader = true,
  striped = true,
  hoverable = true,
  bordered = true,
}: VirtualizedTableProps<T>) {
  const { virtualItems, totalHeight, handleScroll } = useVirtualization({
    itemCount: data.length,
    itemHeight: rowHeight,
    containerHeight: height - headerHeight,
    overscan,
  });

  // معالجة الترتيب
  const handleSort = useCallback(
    (key: string) => {
      if (!onSort) return;

      const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
      onSort(key, newOrder);
    },
    [sortBy, sortOrder, onSort],
  );

  // حساب عرض الأعمدة
  const columnWidths = useMemo(() => {
    const totalFixedWidth = columns
      .filter((col) => typeof col.width === 'number')
      .reduce((sum, col) => sum + (col.width as number), 0);

    const flexColumns = columns.filter((col) => !col.width || typeof col.width === 'string');
    const remainingWidth = 100 - totalFixedWidth;
    const flexWidth = remainingWidth / Math.max(flexColumns.length, 1);

    return columns.map((col) => {
      if (typeof col.width === 'number') {
        return `${col.width}px`;
      }
      if (typeof col.width === 'string') {
        return col.width;
      }
      return `${flexWidth}%`;
    });
  }, [columns]);

  // الحصول على className للصف
  const getRowClassName = useCallback(
    (item: T, index: number) => {
      const base = 'border-b border-gray-200';
      const stripedClass = striped && index % 2 === 1 ? 'bg-gray-50' : 'bg-white';
      const hoverClass = hoverable ? 'hover:bg-gray-100 transition-colors' : '';
      const clickableClass = onRowClick ? 'cursor-pointer' : '';
      const customClass =
        typeof rowClassName === 'function' ? rowClassName(item, index) : rowClassName;

      return `${base} ${stripedClass} ${hoverClass} ${clickableClass} ${customClass}`.trim();
    },
    [striped, hoverable, onRowClick, rowClassName],
  );

  if (loading && data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-lg ${bordered ? 'border border-gray-200' : ''} ${className}`}
      style={{ height }}
    >
      {/* Header */}
      <div
        className={`bg-gray-100 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}
        style={{ height: headerHeight }}
      >
        <div className="flex h-full items-center border-b border-gray-300">
          {columns.map((column, colIndex) => (
            <div
              key={column.key}
              className={`flex items-center px-4 font-semibold text-gray-700 ${
                column.headerAlign === 'center'
                  ? 'justify-center'
                  : column.headerAlign === 'right'
                    ? 'justify-end'
                    : 'justify-start'
              }`}
              style={{
                width: columnWidths[colIndex],
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
              }}
            >
              {column.sortable && onSort ? (
                <button
                  onClick={() => handleSort(column.key)}
                  className="flex items-center gap-2 transition-colors hover:text-blue-600"
                >
                  <span>{column.header}</span>
                  {sortBy === column.key && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {sortOrder === 'asc' ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      )}
                    </svg>
                  )}
                </button>
              ) : (
                <span>{column.header}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div
        className="overflow-auto"
        style={{ height: height - headerHeight, position: 'relative' }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {virtualItems.map((virtualItem) => {
            const item = data[virtualItem.index];
            const rowClass = getRowClassName(item, virtualItem.index);

            return (
              <div
                key={virtualItem.index}
                className={rowClass}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: rowHeight,
                  transform: `translateY(${virtualItem.start}px)`,
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => onRowClick?.(item, virtualItem.index)}
              >
                {columns.map((column, colIndex) => (
                  <div
                    key={column.key}
                    className={`px-4 ${
                      column.align === 'center'
                        ? 'text-center'
                        : column.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                    }`}
                    style={{
                      width: columnWidths[colIndex],
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {column.render ? column.render(item, virtualItem.index) : item[column.key]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {loading && data.length > 0 && (
        <div className="flex justify-center border-t border-gray-200 py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        </div>
      )}
    </div>
  );
}
