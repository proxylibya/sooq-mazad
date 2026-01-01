import React, { useState, useEffect } from 'react';

interface Listing {
  id: number;
  title: string;
  city: string;
  price: number;
  type: 'auction' | 'marketplace';
}

// بيانات تجريبية للإعلانات
const sampleListings: Listing[] = [
  {
    id: 1,
    title: 'تويوتا كامري 2020',
    city: 'طرابلس',
    price: 25000,
    type: 'auction',
  },
  {
    id: 2,
    title: 'هوندا أكورد 2019',
    city: 'بنغازي',
    price: 22000,
    type: 'marketplace',
  },
  {
    id: 3,
    title: 'نيسان التيما 2021',
    city: 'مصراتة',
    price: 28000,
    type: 'auction',
  },
  {
    id: 4,
    title: 'مرسيدس C200 2018',
    city: 'طرابلس',
    price: 35000,
    type: 'marketplace',
  },
  {
    id: 5,
    title: 'BMW 320i 2020',
    city: 'بنغازي',
    price: 40000,
    type: 'auction',
  },
  {
    id: 6,
    title: 'أودي A4 2019',
    city: 'الزاوية',
    price: 38000,
    type: 'marketplace',
  },
  {
    id: 7,
    title: 'فولكس واجن جيتا 2021',
    city: 'سبها',
    price: 24000,
    type: 'auction',
  },
  {
    id: 8,
    title: 'هيونداي إلنترا 2020',
    city: 'مصراتة',
    price: 20000,
    type: 'marketplace',
  },
];

interface SimpleCityListingsProps {
  showTitle?: boolean;
  maxItems?: number;
  type?: 'all' | 'auction' | 'marketplace';
}

const SimpleCityListings: React.FC<SimpleCityListingsProps> = ({
  showTitle = true,
  maxItems = 8,
  type = 'all',
}) => {
  const [filteredListings, setFilteredListings] = useState<Listing[]>(sampleListings);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('جميع المدن');

  // فلترة الإعلانات حسب المدينة والنوع
  const filterListings = (city: string) => {
    setLoading(true);

    setTimeout(() => {
      let filtered = sampleListings;

      // فلترة حسب المدينة
      if (city !== 'جميع المدن' && city !== 'all') {
        filtered = filtered.filter((listing) => listing.city === city);
      }

      // فلترة حسب النوع
      if (type !== 'all') {
        filtered = filtered.filter((listing) => listing.type === type);
      }

      // تحديد العدد الأقصى
      filtered = filtered.slice(0, maxItems);

      setFilteredListings(filtered);
      setLoading(false);
    }, 500); // محاكاة تأخير API
  };

  // مراقبة تغيير المدينة من URL
  useEffect(() => {
    const updateFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const cityFromUrl = urlParams.get('city') || 'جميع المدن';
      setSelectedCity(cityFromUrl);
      filterListings(cityFromUrl);
    };

    // تحديث عند تحميل المكون
    updateFromURL();

    // مراقبة تغيير المدينة
    const handleCityChange = (event: CustomEvent) => {
      const city = event.detail.city;
      setSelectedCity(city);
      filterListings(city);
    };

    // مراقبة تغيير URL
    const handlePopState = () => {
      updateFromURL();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cityChanged', handleCityChange as EventListener);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cityChanged', handleCityChange as EventListener);
        window.removeEventListener('popstate', handlePopState);
      }
    };
  }, [type, maxItems]);

  const getTypeLabel = (listingType: string) => {
    return listingType === 'auction' ? 'مزاد' : 'سوق مفتوح';
  };

  const getTypeColor = (listingType: string) => {
    return listingType === 'auction' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50';
  };

  return (
    <div className="w-full">
      {showTitle && (
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            الإعلانات المتاحة
            {selectedCity !== 'جميع المدن' && ` في ${selectedCity}`}
          </h2>
          <p className="text-gray-600">
            {loading ? 'جاري التحديث...' : `${filteredListings.length} إعلان متاح`}
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse rounded-lg border bg-white shadow-sm">
              <div className="h-48 rounded-t-lg bg-gray-200"></div>
              <div className="p-4">
                <div className="mb-2 h-4 rounded bg-gray-200"></div>
                <div className="mb-2 h-3 w-3/4 rounded bg-gray-200"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-48 items-center justify-center rounded-t-lg bg-gray-100">
                <div className="text-center text-gray-400">
                  <svg className="mx-auto mb-2 h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm">صورة السيارة</p>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{listing.title}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(listing.type)}`}
                  >
                    {getTypeLabel(listing.type)}
                  </span>
                </div>

                <p className="mb-2 text-sm text-gray-600">📍 {listing.city}</p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">
                    {listing.price.toLocaleString('en-US')} د.ل
                  </span>
                  <button className="rounded bg-blue-600 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-700">
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد إعلانات</h3>
          <p className="text-gray-600">
            {selectedCity !== 'جميع المدن'
              ? `لا توجد إعلانات متاحة في ${selectedCity} حالياً`
              : 'لا توجد إعلانات متاحة حالياً'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SimpleCityListings;
