import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
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

const FeaturedMarketplaceAds: React.FC = () => {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-2xl bg-gray-200 shadow-xl"
          />
        ))}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="group relative transform cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="relative flex h-64 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-white/20 p-4 backdrop-blur-sm">
            <svg
              className="h-16 w-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
          </div>

          <h3 className="mb-2 text-2xl font-bold text-white">
            مساحة إعلانية متاحة
          </h3>

          <p className="mb-6 text-sm text-white/90">
            اعرض إعلانك المميز هنا واصل إلى آلاف المشترين
          </p>

          <a
            href="tel:+218"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-bold text-blue-600 shadow-lg transition-all duration-200 hover:bg-blue-50 hover:shadow-xl"
          >
            <PhoneIcon className="h-5 w-5" />
            اتصل بفريق الموقع
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <div
          key={car.id}
          onClick={() => router.push(`/marketplace/${car.id}`)}
          className="group relative transform cursor-pointer overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
        >
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            <svg
              className="h-4 w-4 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            سيارة مميزة
          </div>

          <div className="relative h-32 overflow-hidden">
            <SimpleImageRenderer
              images={car.images}
              alt={car.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              fallbackSrc="/images/cars/default-car.svg"
            />
          </div>

          <div className="p-4">
            <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900">
              {car.title}
            </h3>

            <div className="mb-3 flex flex-wrap gap-1 text-xs text-gray-600">
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

            <div className="mb-3 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
              <p className="mb-1 text-xs text-gray-600">السعر</p>
              <p className="text-lg font-bold text-blue-700">
                {car.price.toLocaleString()} د.ل
              </p>
            </div>

            {car.location && (
              <div className="mb-3 flex items-center gap-1 text-xs text-gray-600">
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
                <span>
                  {car.location}
                  {car.area && ` - ${car.area}`}
                </span>
              </div>
            )}

            <div className="mb-3 flex gap-2 text-xs text-gray-600">
              {car.mileage && (
                <span>{car.mileage.toLocaleString()} كم</span>
              )}
              {car.condition && (
                <>
                  {car.mileage && <span className="text-gray-400">•</span>}
                  <span>{translateToArabic(car.condition)}</span>
                </>
              )}
            </div>

            <div className="flex gap-2">
              {car.user?.phone && (
                <a
                  href={`tel:${car.user.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2 text-xs font-bold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                >
                  <PhoneIcon className="h-3 w-3" />
                  اتصل الآن
                </a>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/marketplace/${car.id}`);
                }}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border-2 border-blue-200 bg-blue-50 py-2 text-xs font-bold text-blue-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100"
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
  );
};

export default FeaturedMarketplaceAds;
