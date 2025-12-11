import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { OpensooqNavbar } from '@/components/common';
import UnifiedSearchBar from '@/components/search/UnifiedSearchBar';
import SearchResults from '@/components/search/SearchResults';
import SearchFilters from '@/components/search/SearchFilters';

/**
 * صفحة البحث الموحدة الجديدة
 * تحل مشكلة NavbarSearchBar المعطل
 */

interface SearchResult {
  type: 'car' | 'auction' | 'showroom' | 'transport' | 'user';
  id: string;
  title: string;
  description?: string;
  image?: string;
  price?: number;
  location?: string;
  url: string;
  relevance: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

interface SearchPageData {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  aggregations?: {
    byType: Record<string, number>;
    byCity: Record<string, number>;
    byBrand: Record<string, number>;
  };
}

export default function SearchPage() {
  const router = useRouter();
  const { q, type = 'all', page = '1' } = router.query;

  const [data, setData] = useState<SearchPageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  // البحث عند تغيير المعاملات
  useEffect(() => {
    if (q && typeof q === 'string') {
      performSearch(q, type as string, parseInt(page as string) || 1, filters);
    } else {
      setData(null);
    }
  }, [q, type, page, filters]);

  const performSearch = async (
    query: string,
    searchType: string,
    currentPage: number,
    currentFilters: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);

    try {
      // بناء المعاملات
      const params = new URLSearchParams({
        q: query,
        type: searchType,
        page: currentPage.toString(),
        limit: '20',
        ...currentFilters,
      });

      // حذف المعاملات الفارغة
      Array.from(params.keys()).forEach((key) => {
        if (!params.get(key)) params.delete(key);
      });

      console.log('🔍 [Search Page] بحث:', { query, type: searchType, page: currentPage });

      const response = await fetch(`/api/search?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        console.log('✅ [Search Page] نتائج:', result.data.total);
      } else {
        setError(result.error || 'حدث خطأ في البحث');
        console.error('❌ [Search Page] خطأ:', result.error);
      }
    } catch (err: any) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error('❌ [Search Page] خطأ:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    // تحديث URL بالفلاتر الجديدة (اختياري)
    const newQuery = { ...router.query, ...newFilters };
    router.push({ pathname: '/search', query: newQuery }, undefined, { shallow: true });
  };

  const handlePageChange = (newPage: number) => {
    router.push({ pathname: '/search', query: { ...router.query, page: newPage } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>البحث - {q || 'سوق المزاد'}</title>
        <meta name="description" content="ابحث عن سيارات، مزادات، معارض، وخدمات نقل في سوق المزاد" />
      </Head>

      <OpensooqNavbar />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* شريط البحث */}
          <div className="mb-6">
            <UnifiedSearchBar autoFocus={!q} />
          </div>

          {/* عرض الخطأ */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-semibold">حدث خطأ:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Tabs للأقسام */}
          {q && (
            <div className="mb-6 flex items-center gap-2 overflow-x-auto rounded-lg border border-gray-200 bg-white p-2">
              <TabButton
                label="الكل"
                active={type === 'all'}
                count={data?.aggregations?.byType ? Object.values(data.aggregations.byType).reduce((a, b) => a + b, 0) : undefined}
                onClick={() => router.push({ pathname: '/search', query: { ...router.query, type: 'all' } })}
              />
              <TabButton
                label="سيارات"
                active={type === 'cars'}
                count={data?.aggregations?.byType?.car}
                onClick={() => router.push({ pathname: '/search', query: { ...router.query, type: 'cars' } })}
              />
              <TabButton
                label="مزادات"
                active={type === 'auctions'}
                count={data?.aggregations?.byType?.auction}
                onClick={() => router.push({ pathname: '/search', query: { ...router.query, type: 'auctions' } })}
              />
              <TabButton
                label="معارض"
                active={type === 'showrooms'}
                count={data?.aggregations?.byType?.showroom}
                onClick={() => router.push({ pathname: '/search', query: { ...router.query, type: 'showrooms' } })}
              />
              <TabButton
                label="نقل"
                active={type === 'transport'}
                count={data?.aggregations?.byType?.transport}
                onClick={() => router.push({ pathname: '/search', query: { ...router.query, type: 'transport' } })}
              />
            </div>
          )}

          {/* المحتوى الرئيسي */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* الفلاتر */}
            <aside className="lg:col-span-1">
              <div className="sticky top-4">
                <SearchFilters filters={filters} onChange={handleFilterChange} type={type as string} />
              </div>
            </aside>

            {/* النتائج */}
            <main className="lg:col-span-3">
              <SearchResults
                results={data?.results || []}
                loading={loading}
                query={q as string}
                total={data?.total}
              />

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={data.page}
                    totalPages={data.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * زر Tab
 */
function TabButton({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            active ? 'bg-blue-700 text-white' : 'bg-gray-300 text-gray-700'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * مكون Pagination
 */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages: number[] = [];
  const maxVisible = 5;

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        السابق
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            1
          </button>
          {start > 2 && <span className="text-gray-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium ${
            page === currentPage
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-400">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        التالي
      </button>
    </div>
  );
}
