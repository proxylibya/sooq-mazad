import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import {
  HeartIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface Car {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  condition: string;
  mileage?: number;
  location: string;
  views?: number;
  createdAt: string;
  featured?: boolean;
  seller: {
    id: number;
    name: string;
    verified?: boolean;
  };
}

interface MarketplaceGridProps {
  cars: Car[];
  isLoading?: boolean;
  onToggleFavorite?: (carId: number) => void;
  favoriteIds?: number[];
}

const CarCard = memo<{
  car: Car;
  isFavorite: boolean;
  onToggleFavorite?: (carId: number) => void;
}>(({ car, isFavorite, onToggleFavorite }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-LY').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-LY', {
      day: 'numeric',
      month: 'short'
    });
  };

  const primaryImage = car.images?.[0] || '/images/car-placeholder.jpg';

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* صورة السيارة */}
      <div className="relative aspect-video bg-gray-200">
        <Link href={`/marketplace/${car.id}`}>
          <img
            src={primaryImage}
            alt={car.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        
        {/* أزرار التفاعل */}
        <div className="absolute top-3 right-3 flex gap-2">
          {car.featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              مميز
            </span>
          )}
          <button
            onClick={() => onToggleFavorite?.(car.id)}
            className={`p-2 rounded-full transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            {isFavorite ? (
              <HeartSolid className="w-4 h-4" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* حالة السيارة */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            car.condition === 'NEW' 
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {car.condition === 'NEW' ? 'جديد' : 'مستعمل'}
          </span>
        </div>
      </div>

      {/* تفاصيل السيارة */}
      <div className="p-4">
        <div className="mb-2">
          <Link href={`/marketplace/${car.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
              {car.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 mt-1">
            {car.brand} {car.model} • {car.year}
          </p>
        </div>

        {/* السعر */}
        <div className="mb-3">
          <div className="flex items-center gap-1">
            <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
            <span className="text-xl font-bold text-green-600">
              {formatPrice(car.price)} د.ل
            </span>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="space-y-2 text-sm text-gray-600">
          {car.mileage && (
            <div className="flex items-center justify-between">
              <span>المسافة المقطوعة:</span>
              <span className="font-medium">{formatPrice(car.mileage)} كم</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <MapPinIcon className="w-4 h-4" />
            <span>{car.location}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              <span>{formatDate(car.createdAt)}</span>
            </div>
            
            {car.views && (
              <div className="flex items-center gap-1">
                <EyeIcon className="w-3 h-3" />
                <span>{car.views}</span>
              </div>
            )}
          </div>
        </div>

        {/* معلومات البائع */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {car.seller.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-gray-700">{car.seller.name}</span>
              {car.seller.verified && (
                <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CarCard.displayName = 'CarCard';

const MarketplaceGrid: React.FC<MarketplaceGridProps> = memo(({
  cars,
  isLoading = false,
  onToggleFavorite,
  favoriteIds = [],
}) => {
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="bg-gray-200 rounded h-6 w-3/4" />
              <div className="bg-gray-200 rounded h-4 w-1/2" />
              <div className="bg-gray-200 rounded h-6 w-1/3" />
              <div className="space-y-2">
                <div className="bg-gray-200 rounded h-3 w-full" />
                <div className="bg-gray-200 rounded h-3 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CurrencyDollarIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سيارات متاحة</h3>
        <p className="text-gray-600">جرب تعديل معايير البحث أو تصفح الأقسام الأخرى</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cars.map((car) => (
        <CarCard
          key={car.id}
          car={car}
          isFavorite={favoriteSet.has(car.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
});

MarketplaceGrid.displayName = 'MarketplaceGrid';

export default MarketplaceGrid;
