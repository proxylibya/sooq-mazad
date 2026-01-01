import React, { useCallback, useState } from 'react';
import { VirtualizedTable, Column } from '@/components/virtualized/VirtualizedTable';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import Link from 'next/link';
import Image from 'next/image';

interface Auction {
  id: string;
  startTime: Date;
  endTime: Date;
  currentBid: number;
  startingBid: number;
  status: string;
  car: {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    images: string[];
    city: string;
  };
  _count: {
    bids: number;
  };
}

interface VirtualizedAuctionsTableProps {
  filters?: Record<string, any>;
  className?: string;
}

export function VirtualizedAuctionsTable({
  filters = {},
  className = '',
}: VirtualizedAuctionsTableProps) {
  const [sortBy, setSortBy] = useState('startTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // دالة جلب البيانات
  const fetchAuctions = useCallback(async (params: any) => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      sortBy: params.sortBy || 'startTime',
      sortOrder: params.sortOrder || 'desc',
      ...params.filters,
    });

    const response = await fetch(`/api/auctions/paginated?${queryParams}`);

    if (!response.ok) {
      throw new Error('Failed to fetch auctions');
    }

    return await response.json();
  }, []);

  const {
    data: auctions,
    isLoading,
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    setSorting,
  } = usePaginatedData<Auction>({
    fetchFunction: fetchAuctions,
    initialPageSize: 20,
    initialSortBy: sortBy,
    initialSortOrder: sortOrder,
    initialFilters: filters,
  });

  // معالجة الترتيب
  const handleSort = useCallback(
    (key: string, order: 'asc' | 'desc') => {
      setSortBy(key);
      setSortOrder(order);
      setSorting(key, order);
    },
    [setSorting],
  );

  // تعريف الأعمدة
  const columns: Column<Auction>[] = [
    {
      key: 'car',
      header: 'السيارة',
      width: 300,
      render: (auction) => (
        <Link href={`/auction/${auction.id}`}>
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
              {auction.car.images && auction.car.images.length > 0 ? (
                <Image
                  src={auction.car.images[0]}
                  alt={auction.car.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-gray-900">{auction.car.title}</div>
              <div className="text-sm text-gray-500">
                {auction.car.brand} {auction.car.model} - {auction.car.year}
              </div>
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      width: 120,
      sortable: true,
      align: 'center',
      render: (auction) => {
        const statusColors: Record<string, string> = {
          ACTIVE: 'bg-green-100 text-green-800',
          PENDING: 'bg-yellow-100 text-yellow-800',
          COMPLETED: 'bg-gray-100 text-gray-800',
          CANCELLED: 'bg-red-100 text-red-800',
        };

        const statusLabels: Record<string, string> = {
          ACTIVE: 'نشط',
          PENDING: 'قيد الانتظار',
          COMPLETED: 'منتهي',
          CANCELLED: 'ملغي',
        };

        return (
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[auction.status] || 'bg-gray-100 text-gray-800'}`}
          >
            {statusLabels[auction.status] || auction.status}
          </span>
        );
      },
    },
    {
      key: 'currentBid',
      header: 'السعر الحالي',
      width: 150,
      sortable: true,
      align: 'right',
      render: (auction) => (
        <div className="text-right">
          <div className="font-semibold text-blue-600">
            {auction.currentBid.toLocaleString()} د.ل
          </div>
          <div className="text-xs text-gray-500">
            البداية: {auction.startingBid.toLocaleString()} د.ل
          </div>
        </div>
      ),
    },
    {
      key: 'bids',
      header: 'عدد المزايدات',
      width: 120,
      align: 'center',
      render: (auction) => (
        <div className="flex items-center justify-center gap-1 text-gray-700">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
          <span className="font-medium">{auction._count.bids}</span>
        </div>
      ),
    },
    {
      key: 'startTime',
      header: 'وقت البداية',
      width: 180,
      sortable: true,
      render: (auction) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {new Date(auction.startTime).toLocaleDateString('ar-LY')}
          </div>
          <div className="text-gray-500">
            {new Date(auction.startTime).toLocaleTimeString('ar-LY', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'endTime',
      header: 'وقت الانتهاء',
      width: 180,
      sortable: true,
      render: (auction) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {new Date(auction.endTime).toLocaleDateString('ar-LY')}
          </div>
          <div className="text-gray-500">
            {new Date(auction.endTime).toLocaleTimeString('ar-LY', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'المدينة',
      width: 120,
      render: (auction) => (
        <div className="flex items-center gap-1 text-gray-700">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          <span>{auction.car.city}</span>
        </div>
      ),
    },
  ];

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* معلومات الجدول */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          عرض {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} من أصل {total} مزاد
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">عرض:</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* الجدول المحسن */}
      <VirtualizedTable
        data={auctions}
        columns={columns}
        height={600}
        rowHeight={80}
        loading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        striped
        hoverable
        bordered
        emptyMessage="لا توجد مزادات متاحة"
        onRowClick={(auction) => {
          window.location.href = `/auction/${auction.id}`;
        }}
      />

      {/* أزرار التنقل */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="text-sm text-gray-600">
          الصفحة {page} من {totalPages}
        </div>

        <div className="flex gap-2">
          <button
            onClick={prevPage}
            disabled={!hasPrevPage}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            السابق
          </button>

          <button
            onClick={nextPage}
            disabled={!hasNextPage}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}

export default VirtualizedAuctionsTable;
