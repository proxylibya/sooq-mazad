import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import MainLayout from '../../components/common/layout/Layout';
import SimpleShowroomCardGrid from '../../components/showrooms/SimpleShowroomCardGrid';
import SimpleShowroomFilter from '../../components/showrooms/SimpleShowroomFilter';
import Pagination from '../../components/common/ui/Pagination';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';

interface Showroom {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  totalCars: number;
  activeCars: number;
  images: string[];
  verified: boolean;
  featured: boolean;
  specialties: string[];
  vehicleTypes: string[];
  establishedYear: number;
  openingHours: string;
  type: string;
  user: {
    id: string;
    name: string;
    phone: string;
    verified: boolean;
    profileImage?: string;
    accountType: string;
    rating?: number;
    totalReviews?: number;
  };
}

interface FilterOptions {
  search: string;
  vehicleType: string;
  city: string;
  rating: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    showrooms: Showroom[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  mock?: boolean;
  message?: string;
}

const ShowroomsPage: NextPage = () => {
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalShowrooms, setTotalShowrooms] = useState(0);

  // حالة الفلاتر
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    vehicleType: 'all',
    city: 'all',
    rating: 'all',
  });

  // معالج تغيير الفلاتر
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // إعادة تعيين الصفحة عند تغيير الفلتر
  };

  // معالج إعادة تعيين الفلاتر
  const handleResetFilters = () => {
    setFilters({
      search: '',
      vehicleType: 'all',
      city: 'all',
      rating: 'all',
    });
    setCurrentPage(1);
  };

  // جلب البيانات
  const fetchShowrooms = useCallback(async () => {
    try {
      // إلغاء الطلب السابق إذا كان موجوداً
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // إنشاء مراقب جديد
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setLoading(true);
      setError(null);

      // بناء معاملات الاستعلام
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12', // عرض 12 معرض في الصفحة
        sortBy: 'createdAt',
        sortDir: 'desc',
      });

      // إضافة الفلاتر إذا كانت موجودة
      if (filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      if (filters.city !== 'all') {
        params.append('city', filters.city);
      }

      const response = await fetch(`/api/showrooms?${params}`, {
        method: 'GET',
        signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (signal.aborted) {
        return;
      }

      if (!response.ok) {
        throw new Error(`خطأ في الخادم: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (!signal.aborted) {
        if (data.success) {
          let filteredShowrooms = data.data.showrooms;

          // فلترة أنواع المركبات من جانب العميل
          if (filters.vehicleType !== 'all') {
            filteredShowrooms = filteredShowrooms.filter(
              (showroom) =>
                showroom.vehicleTypes &&
                showroom.vehicleTypes.some(
                  (type) => type.toLowerCase() === filters.vehicleType.toLowerCase(),
                ),
            );
          }

          // فلترة التقييم من جانب العميل
          if (filters.rating !== 'all') {
            const minRating = parseFloat(filters.rating);
            filteredShowrooms = filteredShowrooms.filter(
              (showroom) => showroom.rating >= minRating,
            );
          }

          setShowrooms(filteredShowrooms);
          setTotalPages(data.data.pagination.pages);
          setTotalShowrooms(data.data.pagination.total);
        } else {
          throw new Error('فشل في جلب البيانات');
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // تجاهل أخطاء الإلغاء
      }

      console.error('خطأ في جلب المعارض:', err);
      setError('حدث خطأ في تحميل المعارض. يرجى المحاولة مرة أخرى.');
    } finally {
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [currentPage, filters]);

  // تأثير لجلب البيانات عند تغيير الصفحة أو الفلاتر
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchShowrooms();
    }, 10); // تأخير صغير لمنع الطلبات المتعددة

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (err) {
          // تجاهل أخطاء الإلغاء
        }
      }
    };
  }, [fetchShowrooms]);

  // تنظيف عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (err) {
          // تجاهل أخطاء الإلغاء
        }
      }
    };
  }, []);

  // معالج النقر على معرض
  const handleShowroomClick = (showroom: Showroom) => {
    router.push(`/showrooms/${showroom.id}`);
  };

  // معالج تغيير الصفحة
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <MainLayout>
      <Head>
        <title>المعارض - سوق مزاد</title>
        <meta
          name="description"
          content="تصفح جميع معارض السيارات في ليبيا. اعثر على أفضل المعارض المتخصصة في بيع وشراء السيارات."
        />
        <meta name="keywords" content="معارض السيارات، سيارات ليبيا، معارض، تجار سيارات" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* العنوان الرئيسي */}
        <div className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">المعارض</h1>
                <p className="mt-1 text-sm text-gray-500">اكتشف أفضل معارض السيارات في ليبيا</p>
              </div>
            </div>
            {!loading && (
              <div className="mt-4 text-sm text-gray-600">
                إجمالي المعارض: <span className="font-medium">{totalShowrooms}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* قسم الفلاتر */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <SimpleShowroomFilter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                />
              </div>
            </div>

            {/* قسم النتائج */}
            <div className="lg:col-span-3">
              {/* حالة التحميل */}
              {loading && (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                </div>
              )}

              {/* حالة الخطأ */}
              {error && !loading && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                  <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                  <h3 className="mt-4 text-lg font-medium text-red-800">حدث خطأ</h3>
                  <p className="mt-2 text-red-600">{error}</p>
                  <button
                    onClick={fetchShowrooms}
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    إعادة المحاولة
                  </button>
                </div>
              )}

              {/* عرض النتائج */}
              {!loading && !error && (
                <div className="space-y-6">
                  {showrooms.length > 0 ? (
                    <>
                      <SimpleShowroomCardGrid
                        showrooms={showrooms}
                        onShowroomClick={handleShowroomClick}
                      />

                      {/* الصفحات */}
                      {totalPages > 1 && (
                        <div className="mt-8">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">لا توجد معارض</h3>
                      <p className="mt-2 text-gray-500">
                        لم يتم العثور على معارض تطابق معايير البحث الحالية.
                      </p>
                      {(filters.search ||
                        filters.city !== 'all' ||
                        filters.vehicleType !== 'all' ||
                        filters.rating !== 'all') && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          إزالة جميع الفلاتر
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ShowroomsPage;
