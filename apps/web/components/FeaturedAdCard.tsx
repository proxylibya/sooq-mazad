import { DocumentTextIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';
import type { FeaturedAd } from '../lib/featuredAds';
import { trackAdClick } from '../lib/featuredAds';

interface FeaturedAdCardProps {
  ad: FeaturedAd;
}

const getImageUrl = (ad: FeaturedAd): string => {
  if (ad.imageUrl) return ad.imageUrl;
  if (ad.sourceData) {
    switch (ad.sourceType) {
      case 'car':
        return ad.sourceData.images?.[0]?.url || '/images/default-car.jpg';
      case 'auction':
        return ad.sourceData.images?.[0]?.url || '/images/default-auction.jpg';
      case 'showroom':
        return ad.sourceData.logo || '/images/default-showroom.jpg';
      case 'transport':
        return '/images/default-transport.jpg';
      default:
        return '/images/default-ad.jpg';
    }
  }
  return '/images/default-ad.jpg';
};

const getTitle = (ad: FeaturedAd): string => {
  if (ad.title) return ad.title;
  if (ad.sourceData) {
    switch (ad.sourceType) {
      case 'car':
        return `${ad.sourceData.brand} ${ad.sourceData.model} ${ad.sourceData.year}`;
      case 'auction':
        return `مزاد: ${ad.sourceData.title || 'سيارة مميزة'}`;
      case 'showroom':
        return ad.sourceData.name || 'معرض مميز';
      case 'transport':
        return ad.sourceData.serviceName || 'خدمة نقل';
      default:
        return 'إعلان مميز';
    }
  }
  return 'إعلان مميز';
};

const getDescription = (ad: FeaturedAd): string => {
  if (ad.description) return ad.description;
  if (ad.sourceData) {
    switch (ad.sourceType) {
      case 'car':
        return `${ad.sourceData.mileage || 0} كم - ${ad.sourceData.condition || 'مستعملة'}`;
      case 'auction':
        return ad.sourceData.description || 'مزاد على سيارة مميزة';
      case 'showroom':
        return ad.sourceData.description || 'معرض سيارات معتمد';
      case 'transport':
        return ad.sourceData.description || 'خدمة نقل موثوقة';
      default:
        return 'إعلان مميز متاح الآن';
    }
  }
  return 'إعلان مميز متاح الآن';
};

const getLink = (ad: FeaturedAd): string => {
  // دعم كلا الحقلين: linkUrl (الجديد) و link (القديم)
  const adAny = ad as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (adAny.linkUrl) return adAny.linkUrl;
  if (ad.link) return ad.link;
  if (adAny.sourceId && ad.sourceType) {
    switch (ad.sourceType) {
      case 'car':
        return `/car/${adAny.sourceId}`;
      case 'auction':
        return `/auction/${adAny.sourceId}`;
      case 'showroom':
        return `/showroom/${adAny.sourceId}`;
      case 'transport':
        return `/transport/${adAny.sourceId}`;
      default:
        break;
    }
  }
  if (ad.sourceData) {
    switch (ad.sourceType) {
      case 'car':
        return `/car/${ad.sourceData.id}`;
      case 'auction':
        return `/auction/${ad.sourceData.id}`;
      case 'showroom':
        return `/showroom/${ad.sourceData.id}`;
      case 'transport':
        return `/transport/${ad.sourceData.id}`;
      default:
        return '#';
    }
  }
  return '#';
};

const FeaturedAdCard: React.FC<FeaturedAdCardProps> = ({ ad }) => {
  const imageUrl = getImageUrl(ad);
  const title = getTitle(ad);
  const description = getDescription(ad);
  const link = getLink(ad);

  const handleClick = async () => {
    await trackAdClick(ad.id);
  };

  const getAdTypeLabel = (adType: string) => {
    switch (adType) {
      case 'CAR_LISTING':
        return 'سيارة مميزة';
      case 'AUCTION_LISTING':
        return 'مزاد مميز';
      case 'SHOWROOM_AD':
        return 'معرض مميز';
      case 'TRANSPORT_SERVICE':
        return 'خدمة نقل';
      default:
        return 'إعلان مميز';
    }
  };

  const getContactInfo = () => {
    if (ad.sourceData) {
      switch (ad.sourceType) {
        case 'car':
          return ad.sourceData.seller?.phone || ad.creator.phone;
        case 'auction':
          return ad.sourceData.seller?.phone || ad.creator.phone;
        case 'showroom':
          return ad.sourceData.phone || ad.creator.phone;
        case 'transport':
          return ad.sourceData.user?.phone || ad.creator.phone;
        default:
          return ad.creator.phone;
      }
    }
    return ad.creator.phone;
  };

  const getLocationInfo = () => {
    if (ad.location) return ad.location;

    if (ad.sourceData) {
      switch (ad.sourceType) {
        case 'car':
          return ad.sourceData.location;
        case 'showroom':
          return `${ad.sourceData.city} - ${ad.sourceData.area}`;
        case 'transport':
          return ad.sourceData.serviceArea;
        default:
          return null;
      }
    }
    return null;
  };

  const getPriceInfo = () => {
    if (ad.sourceData) {
      switch (ad.sourceType) {
        case 'car':
          return `${ad.sourceData.price?.toLocaleString()} د.ل`;
        case 'auction':
          return `${ad.sourceData.currentPrice?.toLocaleString()} د.ل`;
        case 'transport':
          return ad.sourceData.pricePerKm ? `${ad.sourceData.pricePerKm} د.ل/كم` : null;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div className="group relative transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
        <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {getAdTypeLabel(ad.adType)}
      </div>

      <div className="relative h-32 overflow-hidden">
        {imageUrl && imageUrl !== '/images/default-ad.jpg' ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          className={`h-full bg-gray-50 ${imageUrl && imageUrl !== '/images/default-ad.jpg' ? 'hidden' : 'flex'} items-center justify-center`}
        >
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 17h4v-6H7v6zM17 17h4v-6h-4v6z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 11V9a4 4 0 118 0v2M7 11h10"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 11h4l1-4h8l1 4h4"
              />
            </svg>
            <p className="mt-1 text-xs text-gray-500">{getAdTypeLabel(ad.adType)}</p>
          </div>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-yellow-400">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold">{ad.views}</span>
          </div>
          <span className="text-xs text-blue-200">
            {new Date(ad.createdAt).toLocaleDateString('ar-LY')}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900">{title}</h3>

        {getPriceInfo() && (
          <div className="mb-3 rounded-lg border border-yellow-200 bg-gradient-to-r from-blue-50 to-yellow-50 p-3">
            <p className="mb-1 text-xs text-gray-600">السعر</p>
            <p className="text-lg font-bold text-blue-700">{getPriceInfo()}</p>
          </div>
        )}

        {getLocationInfo() && (
          <div className="mb-3 flex items-center gap-2 text-gray-600">
            <MapPinIcon className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium">{getLocationInfo()}</span>
          </div>
        )}

        <p className="mb-3 line-clamp-2 text-xs text-gray-600">{description}</p>

        <div className="flex gap-2">
          {getContactInfo() && (
            <a
              href={`tel:${getContactInfo()}`}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2 text-xs font-bold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
              onClick={handleClick}
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              اتصل الآن
            </a>
          )}

          <Link
            href={link}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border-2 border-blue-200 bg-blue-50 py-2 text-xs font-bold text-blue-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100"
            onClick={handleClick}
          >
            <DocumentTextIcon className="h-3 w-3" />
            التفاصيل
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedAdCard;
