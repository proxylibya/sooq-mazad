import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClockIcon, MapPinIcon, EyeIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: string;
  location: string;
  images: string[];
  featured: boolean;
  isAuction: boolean;
  listingType: 'auction' | 'instant';
  createdAt: string;
  seller: {
    id: string;
    name: string;
    verified: boolean;
    rating?: number;
  };
}

interface LatestListingsSectionProps {
  limit?: number;
  type?: 'auction' | 'instant' | 'all';
  title?: string;
  showViewAll?: boolean;
}

const LatestListingsSection: React.FC<LatestListingsSectionProps> = ({
  limit = 6,
  type = 'all',
  title = 'أحدث الإعلانات',
  showViewAll = true,
}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestListings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/listings/latest?limit=${limit}&type=${type}`);
        const data = await response.json();

        if (data.success) {
          setListings(data.data.listings);
        } else {
          setError(data.error || 'فشل في جلب الإعلانات');
        }
      } catch (err) {
        console.error('خطأ في جلب أحدث الإعلانات:', err);
        setError('حدث خطأ في الاتصال');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestListings();
  }, [limit, type]);

  if (loading) {
    return (
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">{title}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-white p-4 shadow-md">
                <div className="mb-4 h-48 rounded-lg bg-gray-200"></div>
                <div className="mb-2 h-4 rounded bg-gray-200"></div>
                <div className="mb-2 h-4 w-2/3 rounded bg-gray-200"></div>
                <div className="h-6 w-1/3 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">{title}</h2>
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return (
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">{title}</h2>
          <p className="mb-4 text-gray-600">لا توجد إعلانات متاحة حالياً</p>
          <Link
            href="/add-listing"
            className="inline-block rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700"
          >
            أضف إعلانك الآن
          </Link>
        </div>
      </section>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-LY', {
      style: 'currency',
      currency: 'LYD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'منذ أقل من ساعة';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    return date.toLocaleDateString('ar-LY');
  };

  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* العنوان الرئيسي */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {showViewAll && (
            <Link
              href={type === 'auction' ? '/auctions' : '/marketplace'}
              className="flex items-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-800"
            >
              عرض الكل
              <EyeIcon className="h-5 w-5" />
            </Link>
          )}
        </div>

        {/* شبكة الإعلانات */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
            >
              {/* الصورة الرئيسية */}
              <div className="relative h-48 bg-gray-200">
                {listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/car-placeholder.jpg';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                    <span className="text-gray-400">لا توجد صورة</span>
                  </div>
                )}

                {/* شارات الحالة */}
                <div className="absolute left-2 top-2 flex gap-2">
                  {listing.featured && (
                    <span className="flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                      <SparklesIcon className="h-3 w-3" />
                      مميز
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      listing.listingType === 'auction'
                        ? 'bg-blue-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {listing.listingType === 'auction' ? 'مزاد' : 'فوري'}
                  </span>
                </div>

                {/* الوقت منذ النشر */}
                <div className="absolute bottom-2 right-2">
                  <span className="flex items-center gap-1 rounded-full bg-black bg-opacity-50 px-2 py-1 text-xs text-white">
                    <ClockIcon className="h-3 w-3" />
                    {getTimeAgo(listing.createdAt)}
                  </span>
                </div>
              </div>

              {/* تفاصيل الإعلان */}
              <div className="p-4">
                {/* العنوان */}
                <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900">
                  {listing.title}
                </h3>

                {/* معلومات السيارة */}
                <div className="mb-3 text-sm text-gray-600">
                  <p>
                    {listing.brand} {listing.model} - {listing.year}
                  </p>
                  <p className="capitalize">{listing.condition}</p>
                </div>

                {/* السعر */}
                <div className="mb-3 text-xl font-bold text-green-600">
                  {formatPrice(listing.price)}
                </div>

                {/* الموقع والبائع */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{listing.seller.name}</span>
                    {listing.seller.verified && <span className="text-blue-500">✓</span>}
                  </div>
                </div>

                {/* زر الانتقال */}
                <div className="mt-4">
                  <Link
                    href={
                      listing.listingType === 'auction'
                        ? `/auction/${listing.id}`
                        : `/marketplace/${listing.id}`
                    }
                    className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-white transition-colors hover:bg-blue-700"
                  >
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* رابط عرض المزيد */}
        {showViewAll && listings.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href={type === 'auction' ? '/auctions' : '/marketplace'}
              className="inline-block rounded-lg bg-gray-100 px-8 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              عرض جميع الإعلانات
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestListingsSection;
