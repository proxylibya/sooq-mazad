import Link from 'next/link';
import { useEffect, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const CustomAdCard = ({ ad, onClick }) => {
  const { mediaType, imageUrl, videoUrl, linkUrl, title, description, aspectRatio } = ad;

  const Wrapper = ({ children }) => {
    const className =
      'group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all hover:shadow-xl cursor-pointer h-full';

    if (linkUrl) {
      const isExternal = linkUrl.startsWith('http');
      if (isExternal) {
        return (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
            className={className}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={linkUrl} onClick={onClick} className={className}>
          {children}
        </Link>
      );
    }

    return (
      <div onClick={onClick} className={className}>
        {children}
      </div>
    );
  };

  if (mediaType === 'VIDEO' && videoUrl) {
    return (
      <Wrapper>
        <div className="relative w-full overflow-hidden bg-black">
          <video
            src={videoUrl}
            poster={ad.videoThumbnail}
            autoPlay={ad.videoAutoplay}
            muted={ad.videoMuted}
            loop={ad.videoLoop}
            controls
            playsInline
            className="w-full object-cover"
            style={{ aspectRatio: aspectRatio || '16/9' }}
          />
        </div>
        {(title || description) && (
          <div className="p-4">
            {title && <h3 className="mb-2 font-bold text-gray-900">{title}</h3>}
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>
        )}
      </Wrapper>
    );
  }

  // Image, Banner, or Fallback
  return (
    <Wrapper>
      <div className="relative w-full overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title || 'Advertisement'}
            className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ aspectRatio: aspectRatio || 'auto', minHeight: '200px' }}
          />
        ) : (
          <div className="flex h-48 items-center justify-center bg-gray-200 text-gray-400">
            No Image
          </div>
        )}
      </div>
      {(title || description) && (
        <div className="p-4">
          {title && <h3 className="mb-2 font-bold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}
    </Wrapper>
  );
};

const AdCard = ({ ad, onAdClick }) => {
  const { entity } = ad;

  const handleClick = () => {
    if (onAdClick) {
      onAdClick(ad.id);
    }
  };

  // Handle Custom and External Ads
  if (ad.entityType === 'CUSTOM' || ad.entityType === 'EXTERNAL' || !entity) {
    if (ad.entityType === 'CUSTOM' || ad.entityType === 'EXTERNAL' || ad.imageUrl || ad.videoUrl) {
      return <CustomAdCard ad={ad} onClick={handleClick} />;
    }
    return null;
  }

  switch (ad.entityType) {
    case 'auction':
    case 'AUCTION':
      return (
        <Link
          href={`/auctions/${entity.id}`}
          onClick={handleClick}
          className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all hover:shadow-xl"
        >
          <div className="relative h-48 overflow-hidden bg-gray-100">
            {entity.cars?.images ? (
              <img
                src={
                  typeof entity.cars.images === 'string'
                    ? JSON.parse(entity.cars.images)[0]
                    : entity.cars.images[0]
                }
                alt={entity.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-200">
                <span className="text-gray-400">لا توجد صورة</span>
              </div>
            )}
            <div className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white">
              مزاد مميز
            </div>
          </div>
          <div className="p-4">
            <h3 className="mb-2 font-bold text-gray-900">{entity.title}</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">السعر الحالي</span>
              <span className="font-bold text-amber-600">{entity.currentPrice} د.ل</span>
            </div>
          </div>
        </Link>
      );

    case 'car':
    case 'CAR':
      return (
        <Link
          href={`/marketplace/${entity.id}`}
          onClick={handleClick}
          className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all hover:shadow-xl"
        >
          <div className="relative h-48 overflow-hidden bg-gray-100">
            {entity.images ? (
              <img
                src={
                  typeof entity.images === 'string'
                    ? JSON.parse(entity.images)[0]
                    : entity.images[0]
                }
                alt={entity.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-200">
                <span className="text-gray-400">لا توجد صورة</span>
              </div>
            )}
            <div className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 text-xs font-bold text-white">
              سيارة مميزة
            </div>
          </div>
          <div className="p-4">
            <h3 className="mb-2 font-bold text-gray-900">{entity.title}</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">السعر</span>
              <span className="font-bold text-blue-600">{entity.price} د.ل</span>
            </div>
          </div>
        </Link>
      );

    case 'transport':
    case 'TRANSPORT':
      return (
        <Link
          href={`/transport/${entity.id}`}
          onClick={handleClick}
          className="group block overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{entity.companyName}</h3>
            <div className="rounded-full bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 text-xs font-bold text-white">
              خدمة مميزة
            </div>
          </div>
          <p className="mb-2 text-sm text-gray-600">{entity.serviceType}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">السعر لكل كم</span>
            <span className="font-bold text-green-600">{entity.pricePerKm} د.ل</span>
          </div>
        </Link>
      );

    case 'yard':
    case 'YARD':
      return (
        <Link
          href={`/yards/${entity.id}`}
          onClick={handleClick}
          className="group block overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{entity.name}</h3>
            <div className="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-1 text-xs font-bold text-white">
              ساحة مميزة
            </div>
          </div>
          <p className="text-sm text-gray-600">{entity.location}</p>
        </Link>
      );

    case 'showroom':
    case 'SHOWROOM':
      return (
        <Link
          href={`/showrooms/${entity.id}`}
          onClick={handleClick}
          className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all hover:shadow-xl"
        >
          <div className="relative h-32 overflow-hidden bg-gray-100">
            {entity.logo ? (
              <img
                src={entity.logo}
                alt={entity.name}
                className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-200">
                <span className="text-gray-400">لا يوجد شعار</span>
              </div>
            )}
            <div className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 px-3 py-1 text-xs font-bold text-white">
              معرض مميز
            </div>
          </div>
          <div className="p-4">
            <h3 className="mb-2 font-bold text-gray-900">{entity.name}</h3>
            {entity.location && <p className="text-sm text-gray-600">{entity.location}</p>}
            {entity.rating && (
              <div className="mt-2 flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-bold text-gray-700">{entity.rating}</span>
              </div>
            )}
          </div>
        </Link>
      );

    case 'company':
    case 'COMPANY':
      return (
        <Link
          href={`/companies/${entity.id}`}
          onClick={handleClick}
          className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all hover:shadow-xl"
        >
          <div className="relative h-32 overflow-hidden bg-gray-100">
            {entity.logo ? (
              <img
                src={entity.logo}
                alt={entity.name}
                className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-200">
                <span className="text-gray-400">لا يوجد شعار</span>
              </div>
            )}
            <div className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 px-3 py-1 text-xs font-bold text-white">
              شركة مميزة
            </div>
          </div>
          <div className="p-4">
            <h3 className="mb-2 font-bold text-gray-900">{entity.name}</h3>
            {entity.description && (
              <p className="line-clamp-2 text-sm text-gray-600">{entity.description}</p>
            )}
          </div>
        </Link>
      );

    default:
      return null;
  }
};

export default function AdPlacement({ location, className = '' }) {
  const [placements, setPlacements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlacements();
  }, [location]);

  const fetchPlacements = async () => {
    try {
      const res = await fetch(`/api/public/ad-placements?location=${location}`);
      if (res.ok) {
        const data = await res.json();
        setPlacements(data.placements || []);
      }
    } catch (error) {
      console.error('Error fetching ad placements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdClick = async (adId) => {
    try {
      await fetch('/api/public/track-ad-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId }),
      });
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  if (isLoading || placements.length === 0) {
    return null;
  }

  return (
    <div className={`ad-placements ${className}`}>
      {placements.map((placement) => {
        if (placement.ads.length === 0) return null;

        const displayAds = placement.ads.slice(0, placement.maxAds);

        switch (placement.type) {
          case 'STATIC':
            return (
              <div key={placement.id} className="mb-8">
                {displayAds.length === 1 ? (
                  <div className="flex justify-center">
                    <div className="w-full max-w-md">
                      <AdCard ad={displayAds[0]} onAdClick={handleAdClick} />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayAds.map((ad) => (
                      <AdCard key={ad.id} ad={ad} onAdClick={handleAdClick} />
                    ))}
                  </div>
                )}
              </div>
            );

          case 'SLIDER':
          case 'CAROUSEL':
            return (
              <div key={placement.id} className="mb-8">
                <Swiper
                  modules={[Autoplay, Navigation, Pagination]}
                  spaceBetween={20}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={
                    placement.autoRotate
                      ? {
                          delay: (placement.rotateInterval || 5) * 1000,
                          disableOnInteraction: false,
                        }
                      : false
                  }
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                >
                  {displayAds.map((ad) => (
                    <SwiperSlide key={ad.id}>
                      <AdCard ad={ad} onAdClick={handleAdClick} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            );

          case 'GRID':
            return (
              <div key={placement.id} className="mb-8">
                {displayAds.length === 1 ? (
                  <div className="flex justify-center">
                    <div className="w-full max-w-md">
                      <AdCard ad={displayAds[0]} onAdClick={handleAdClick} />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {displayAds.map((ad) => (
                      <AdCard key={ad.id} ad={ad} onAdClick={handleAdClick} />
                    ))}
                  </div>
                )}
              </div>
            );

          case 'ROTATING':
            return <RotatingAds key={placement.id} ads={displayAds} onAdClick={handleAdClick} />;

          default:
            return null;
        }
      })}
    </div>
  );
}

function RotatingAds({ ads, onAdClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads.length]);

  if (ads.length === 0) return null;

  return (
    <div className="mb-8">
      <AdCard ad={ads[currentIndex]} onAdClick={onAdClick} />
    </div>
  );
}
