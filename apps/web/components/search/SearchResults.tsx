import Image from 'next/image';
import Link from 'next/link';

/**
 * مكون عرض نتائج البحث الموحد
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

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  total?: number;
}

export default function SearchResults({ results, loading, query, total }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
          style={{ width: 24, height: 24 }}
          role="status"
          aria-label="جاري التحميل"
        />
        <span className="mr-3 text-lg text-gray-600">جاري البحث...</span>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <div className="text-5xl">🔍</div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">ابحث عن أي شيء</h3>
        <p className="mt-2 text-gray-600">سيارات، مزادات، معارض، خدمات نقل، وأكثر...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <div className="text-5xl">😔</div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">لا توجد نتائج</h3>
        <p className="mt-2 text-gray-600">
          لم نعثر على نتائج لـ <span className="font-semibold">"{query}"</span>
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>جرب:</p>
          <ul className="mt-2 space-y-1">
            <li>• استخدام كلمات مختلفة</li>
            <li>• تقليل عدد الفلاتر</li>
            <li>• التحقق من الإملاء</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* عنوان النتائج */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          نتائج البحث عن <span className="text-blue-600">"{query}"</span>
        </h2>
        {total !== undefined && (
          <span className="text-sm text-gray-600">
            {total} {total === 1 ? 'نتيجة' : 'نتيجة'}
          </span>
        )}
      </div>

      {/* قائمة النتائج */}
      <div className="space-y-4">
        {results.map((result) => (
          <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
        ))}
      </div>
    </div>
  );
}

/**
 * بطاقة نتيجة بحث واحدة
 */
function SearchResultCard({ result }: { result: SearchResult }) {
  const typeLabels = {
    car: 'سيارة',
    auction: 'مزاد',
    showroom: 'معرض',
    transport: 'نقل',
    user: 'مستخدم',
  };

  const typeColors = {
    car: 'bg-green-100 text-green-800',
    auction: 'bg-blue-100 text-blue-800',
    showroom: 'bg-purple-100 text-purple-800',
    transport: 'bg-orange-100 text-orange-800',
    user: 'bg-gray-100 text-gray-800',
  };

  return (
    <Link href={result.url}>
      <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-500 hover:shadow-lg">
        <div className="flex gap-4">
          {/* الصورة */}
          {result.image && (
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src={result.image}
                alt={result.title}
                fill
                sizes="96px"
                className="object-cover transition-transform group-hover:scale-110"
              />
            </div>
          )}

          {/* المحتوى */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                {result.title}
              </h3>
              <span
                className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${
                  typeColors[result.type]
                }`}
              >
                {typeLabels[result.type]}
              </span>
            </div>

            {/* الوصف */}
            {result.description && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{result.description}</p>
            )}

            {/* Highlights */}
            {result.highlights && result.highlights.length > 0 && (
              <p className="mt-1 text-sm italic text-gray-500">"{result.highlights[0]}"</p>
            )}

            {/* المعلومات الإضافية */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {result.price !== undefined && (
                <span className="font-semibold text-green-600">
                  {result.price.toLocaleString('ar-LY')} د.ل
                </span>
              )}

              {result.location && (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {result.location}
                </span>
              )}

              {/* Metadata إضافية */}
              {result.metadata?.brand && (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                  {result.metadata.brand}
                </span>
              )}
              {result.metadata?.year && (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                  {result.metadata.year}
                </span>
              )}
              {result.metadata?.verified && (
                <span className="flex items-center gap-1 text-blue-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  موثق
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
