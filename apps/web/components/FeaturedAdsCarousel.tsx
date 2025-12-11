import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { translateToArabic } from '../utils/formatters';
import SimpleImageRenderer from './ui/SimpleImageRenderer';

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  condition: string;
  location: string;
  area?: string;
  images: string[];
  user?: {
    id: string;
    name: string;
    phone: string;
    verified: boolean;
  };
}

const FeaturedAdsCarousel: React.FC = () => {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const response = await fetch('/api/cars/featured?limit=6');
        const data = await response.json();

        if (data.success && data.data.cars.length > 0) {
          setCars(data.data.cars);
        }
      } catch (error) {
        console.error('Error fetching featured cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'right' ? scrollAmount : -scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="my-6 rounded-2xl border bg-white p-4 shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-gray-900">
          <span className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            الإعلانات المميزة
          </span>
        </h3>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 w-64 flex-shrink-0 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (cars.length === 0) {
    return null;
  }

  return (
    <div className="my-6 rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-lg">
      <h3 className="mb-4 text-lg font-bold text-gray-900">
        <span className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          الإعلانات المميزة
        </span>
      </h3>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-gray-100 hover:shadow-xl disabled:opacity-50"
          aria-label="السابق"
        >
          <svg
            className="h-5 w-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cars.map((car) => (
            <div
              key={car.id}
              onClick={() => router.push(`/marketplace/${car.id}`)}
              className="group relative w-64 flex-shrink-0 transform cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-2 py-1 text-xs font-bold text-white shadow-md">
                <svg
                  className="h-3 w-3 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                مميز
              </div>

              <div className="relative h-28 overflow-hidden">
                <SimpleImageRenderer
                  images={car.images}
                  alt={car.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  fallbackSrc="/images/cars/default-car.svg"
                />
              </div>

              <div className="p-3">
                <h4 className="mb-1 line-clamp-1 text-sm font-bold text-gray-900">
                  {car.title}
                </h4>

                <div className="mb-2 flex flex-wrap gap-1 text-xs text-gray-600">
                  {car.brand && <span>{car.brand}</span>}
                  {car.model && (
                    <>
                      <span className="text-gray-400">-</span>
                      <span>{car.model}</span>
                    </>
                  )}
                  {car.year && (
                    <>
                      <span className="text-gray-400">-</span>
                      <span>{car.year}</span>
                    </>
                  )}
                </div>

                <div className="mb-2 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-2">
                  <p className="text-xs text-gray-600">السعر</p>
                  <p className="text-base font-bold text-blue-700">
                    {car.price.toLocaleString()} د.ل
                  </p>
                </div>

                {car.location && (
                  <div className="mb-2 flex items-center gap-1 text-xs text-gray-600">
                    <svg
                      className="h-3 w-3 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>
                    <span className="line-clamp-1">
                      {car.location}
                      {car.area && ` - ${car.area}`}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  {car.user?.phone && (
                    <a
                      href={`tel:${car.user.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-1.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                    >
                      <PhoneIcon className="h-3 w-3" />
                      اتصل
                    </a>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/marketplace/${car.id}`);
                    }}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border-2 border-blue-200 bg-blue-50 py-1.5 text-xs font-bold text-blue-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100"
                  >
                    <svg
                      className="h-3 w-3"
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
                    التفاصيل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-gray-100 hover:shadow-xl disabled:opacity-50"
          aria-label="التالي"
        >
          <svg
            className="h-5 w-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default FeaturedAdsCarousel;
