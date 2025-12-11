/**
 * صفحة السيارات المحسّنة
 * مثال على استخدام Hook + Skeleton
 */

import { useState } from 'react';
import { useOptimizedPagination } from '../../hooks/useOptimizedPagination';
import { GridSkeleton } from '../shared/Skeleton';

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  location: string;
}

export default function CarsPage() {
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
  });

  const { data, loading, hasMore, loadMore, loadPage, page, totalPages } =
    useOptimizedPagination<Car>({
      fetchFn: async (page, limit) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(filters.brand && { brand: filters.brand }),
          ...(filters.minPrice && { minPrice: filters.minPrice }),
          ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        });

        const res = await fetch(`/api/cars/optimized-index?${params}`);
        return await res.json();
      },
      limit: 20,
      autoLoad: true,
    });

  if (loading && data.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <GridSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">السيارات المتاحة</h1>

      {/* Grid السيارات */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((car) => (
          <div
            key={car.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <img
              src={car.images[0] || '/placeholder-car.jpg'}
              alt={car.title}
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="mb-2 font-semibold text-gray-900">
                {car.brand} {car.model}
              </h3>
              <p className="mb-2 text-sm text-gray-600">{car.year}</p>
              <p className="text-lg font-bold text-blue-600">{car.price.toLocaleString()} دينار</p>
              <p className="mt-2 text-xs text-gray-500">{car.location}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => loadPage(pageNum)}
              disabled={loading}
              className={`rounded-lg px-4 py-2 ${
                pageNum === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}

      {/* Loading المزيد */}
      {loading && data.length > 0 && (
        <div className="mt-8">
          <GridSkeleton count={4} />
        </div>
      )}
    </div>
  );
}
