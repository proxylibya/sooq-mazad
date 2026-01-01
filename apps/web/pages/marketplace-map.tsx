import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { OpensooqNavbar } from '../components/common';
import MarketplaceMapView from '../components/maps/MarketplaceMapView';
import MarketplaceMapFilters from '../components/maps/MarketplaceMapFilters';
import MarketplaceMapStats from '../components/maps/MarketplaceMapStats';

import AdjustmentsHorizontalIcon from '@heroicons/react/24/outline/AdjustmentsHorizontalIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import MapIcon from '@heroicons/react/24/outline/MapIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';

interface Car {
  id: string;
  title: string;
  price: number;
  brand: string;
  model: string;
  year: number;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  condition: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  featured?: boolean;
  urgent?: boolean;
  negotiable?: boolean;
}

interface MapFilters {
  searchQuery: string;
  brand: string;
  model: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  condition: string;
  city: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
}

const MarketplaceMapPage = () => {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const [filters, setFilters] = useState<MapFilters>({
    searchQuery: '',
    brand: '',
    model: '',
    minPrice: 0,
    maxPrice: 1000000,
    minYear: 1990,
    maxYear: new Date().getFullYear(),
    condition: '',
    city: '',
    bodyType: '',
    fuelType: '',
    transmission: '',
  });

  // جلب البيانات من API
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: '500',
          status: 'AVAILABLE',
        });

        const response = await fetch(`/api/cars?${params.toString()}`);
        if (!response.ok) {
          throw new Error('فشل في جلب البيانات');
        }

        const data = await response.json();
        const carsData = data.cars || [];

        // إضافة إحداثيات للسيارات
        const carsWithCoordinates = carsData.map((car: any) => ({
          ...car,
          coordinates: car.coordinates || generateCoordinatesForLocation(car.location),
        }));

        setCars(carsWithCoordinates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // توليد إحداثيات للموقع
  const generateCoordinatesForLocation = (location: string) => {
    const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
      طرابلس: { lat: 32.8872, lng: 13.1913 },
      بنغازي: { lat: 32.1165, lng: 20.0686 },
      مصراتة: { lat: 32.3743, lng: 15.0877 },
      الزاوية: { lat: 32.7569, lng: 12.7277 },
      البيضاء: { lat: 32.7617, lng: 21.7553 },
      صبراتة: { lat: 32.7932, lng: 12.4845 },
      زليتن: { lat: 32.4674, lng: 14.5687 },
      درنة: { lat: 32.7569, lng: 22.6365 },
      سرت: { lat: 31.2089, lng: 16.5887 },
      أجدابيا: { lat: 30.7554, lng: 20.2263 },
      سبها: { lat: 27.0377, lng: 14.4283 },
      غات: { lat: 25.0444, lng: 10.1803 },
      مرزق: { lat: 25.9154, lng: 13.9158 },
      الكفرة: { lat: 24.1333, lng: 23.3167 },
      طبرق: { lat: 32.0769, lng: 23.9589 },
      الخمس: { lat: 32.6489, lng: 14.2619 },
      غريان: { lat: 32.1667, lng: 13.0167 },
    };

    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (location.includes(city)) {
        return {
          lat: coords.lat + (Math.random() - 0.5) * 0.02,
          lng: coords.lng + (Math.random() - 0.5) * 0.02,
        };
      }
    }

    return {
      lat: 32.8872 + (Math.random() - 0.5) * 0.1,
      lng: 13.1913 + (Math.random() - 0.5) * 0.1,
    };
  };

  // فلترة السيارات
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText =
          `${car.title} ${car.brand} ${car.model} ${car.location}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      if (filters.brand && car.brand !== filters.brand) return false;
      if (filters.model && car.model !== filters.model) return false;
      if (car.price < filters.minPrice || car.price > filters.maxPrice) return false;
      if (car.year < filters.minYear || car.year > filters.maxYear) return false;
      if (filters.condition && car.condition !== filters.condition) return false;
      if (filters.city && !car.location.includes(filters.city)) return false;
      if (filters.bodyType && car.bodyType !== filters.bodyType) return false;
      if (filters.fuelType && car.fuelType !== filters.fuelType) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;

      return true;
    });
  }, [cars, filters]);

  // إحصائيات السيارات المفلترة
  const stats = useMemo(() => {
    const totalCars = filteredCars.length;
    const avgPrice =
      totalCars > 0 ? filteredCars.reduce((sum, car) => sum + car.price, 0) / totalCars : 0;

    const priceRange: [number, number] =
      totalCars > 0
        ? [
            Math.min(...filteredCars.map((c) => c.price)),
            Math.max(...filteredCars.map((c) => c.price)),
          ]
        : [0, 0];

    const brandCounts: { [key: string]: number } = {};
    filteredCars.forEach((car) => {
      brandCounts[car.brand] = (brandCounts[car.brand] || 0) + 1;
    });

    const popularBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([brand, count]) => ({ brand, count }));

    const cityCounts: { [key: string]: number } = {};
    filteredCars.forEach((car) => {
      const cityMatch = car.location.match(/^[^،,]+/);
      const city = cityMatch ? cityMatch[0].trim() : car.location;
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const citiesDistribution = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    return {
      totalCars,
      avgPrice,
      priceRange,
      popularBrands,
      citiesDistribution,
    };
  }, [filteredCars]);

  const handleFilterChange = useCallback((newFilters: Partial<MapFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleCarSelect = useCallback((car: Car | null) => {
    setSelectedCar(car);
  }, []);

  const handleCarClick = useCallback(
    (carId: string) => {
      router.push(`/marketplace/${carId}`);
    },
    [router],
  );

  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  if (error) {
    return (
      <>
        <Head>
          <title>خطأ - خريطة سوق المزاد</title>
        </Head>
        <OpensooqNavbar />
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-lg text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>خريطة سوق المزاد - {filteredCars.length} سيارة متاحة</title>
        <meta
          name="description"
          content="اكتشف السيارات المتاحة على الخريطة في جميع أنحاء ليبيا. ابحث عن السيارة الأقرب إليك."
        />
      </Head>

      <OpensooqNavbar />

      <div className="flex h-[calc(100vh-64px)] flex-col bg-gray-50">
        {/* شريط الأدوات العلوي */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">خريطة سوق المزاد</h1>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {filteredCars.length} سيارة
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* زر الإحصائيات */}
              <button
                onClick={() => setShowStats(!showStats)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  showStats
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChartBarIcon className="h-5 w-5" />
                <span className="hidden sm:inline">الإحصائيات</span>
              </button>

              {/* زر الفلاتر */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span className="hidden sm:inline">الفلاتر</span>
              </button>

              {/* زر العرض */}
              <button
                onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                {viewMode === 'map' ? (
                  <>
                    <ListBulletIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">قائمة</span>
                  </>
                ) : (
                  <>
                    <MapIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">خريطة</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* لوحة الفلاتر */}
          {showFilters && (
            <div className="w-80 overflow-y-auto border-l border-gray-200 bg-white shadow-lg">
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">الفلاتر</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <MarketplaceMapFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                totalResults={filteredCars.length}
              />
            </div>
          )}

          {/* منطقة الخريطة */}
          <div className="relative flex-1">
            <MarketplaceMapView
              cars={filteredCars}
              selectedCar={selectedCar}
              onCarSelect={handleCarSelect}
              onCarClick={handleCarClick}
              viewMode={viewMode}
            />

            {/* لوحة الإحصائيات */}
            {showStats && (
              <div className="absolute left-4 top-4 z-10">
                <MarketplaceMapStats stats={stats} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketplaceMapPage;
