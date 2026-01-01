import React from 'react';
import Link from 'next/link';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useFavorites } from '../hooks/useFavorites';
import SafeImage from './SafeImage';

interface ShowroomCardGridProps {
  item: {
    id: string;
    title: string;
    location: string;
    phone: string;
    rating: number;
    reviewsCount: number;
    totalCars: number;
    activeCars: number;
    images: string[];
    description: string;
    openingHours: string;
    verified: boolean;
    type: string;
    specialties: string[];
    services: string[];
    features: string[];
    featured?: boolean;
    user?: {
      id: string;
      name: string;
      phone: string;
      verified: boolean;
    };
  };
}

const ShowroomCardGrid: React.FC<ShowroomCardGridProps> = ({ item }) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item.id, 'showroom');
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
      {/* Featured Badge */}
      {item.featured && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-white shadow-lg">
          مميز
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={handleToggleFavorite}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white"
      >
        {isFavorite(item.id, 'showroom') ? (
          <HeartSolid className="h-4 w-4 text-red-500" />
        ) : (
          <HeartIcon className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Image Section */}
      <Link href={`/showrooms/${item.id}`} className="block">
        <div className="relative h-40 overflow-hidden">
          <SafeImage
            src={item.images}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            fallbackSrc="https://via.placeholder.com/300x200?text=معرض"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-2">
          <Link href={`/showrooms/${item.id}`}>
            <h3 className="mb-1 line-clamp-1 cursor-pointer text-base font-bold text-gray-900 transition-colors hover:text-blue-600">
              {item.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              {item.type}
            </span>
            {item.verified && (
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-600">موثق</span>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="mb-2 flex items-center gap-2 text-gray-600">
          <MapPinIcon className="h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-1 text-xs">{item.location}</span>
        </div>

        {/* Rating and Stats */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-gray-900">{formatRating(item.rating)}</span>
            <span className="text-xs text-gray-500">({item.reviewsCount})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <BuildingStorefrontIcon className="h-3 w-3" />
            <span>{item.activeCars}</span>
          </div>
        </div>

        {/* Description */}
        <p className="mb-3 line-clamp-2 text-xs text-gray-600">{item.description}</p>

        {/* Specialties */}
        {item.specialties && item.specialties.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {item.specialties.slice(0, 2).map((specialty, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                >
                  {specialty}
                </span>
              ))}
              {item.specialties.length > 2 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  +{item.specialties.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Opening Hours */}
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-600">
          <ClockIcon className="h-3 w-3" />
          <span className="line-clamp-1">{item.openingHours}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/showrooms/${item.id}`} className="flex-1">
            <button className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700">
              عرض التفاصيل
            </button>
          </Link>
          <a
            href={`tel:${item.phone}`}
            className="flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <PhoneIcon className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShowroomCardGrid;
