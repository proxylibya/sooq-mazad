import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdPlacement({ location, className = '' }) {
  const [placements, setPlacements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState({});

  useEffect(() => {
    fetchPlacements();
  }, [location]);

  useEffect(() => {
    const intervals = {};

    placements.forEach((placement) => {
      if (placement.autoRotate && placement.ads.length > 1) {
        const interval = setInterval(() => {
          setCurrentIndex((prev) => ({
            ...prev,
            [placement.id]: ((prev[placement.id] || 0) + 1) % placement.ads.length,
          }));
        }, (placement.rotateInterval || 5) * 1000);

        intervals[placement.id] = interval;
      }
    });

    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval));
    };
  }, [placements]);

  const fetchPlacements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/placements/${location}`);
      if (res.ok) {
        const data = await res.json();
        setPlacements(data.placements || []);
        
        const initialIndex = {};
        data.placements.forEach((p) => {
          initialIndex[p.id] = 0;
        });
        setCurrentIndex(initialIndex);
      }
    } catch (error) {
      console.error('Error fetching placements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAdLink = (ad) => {
    switch (ad.entityType) {
      case 'AUCTION':
        return `/auctions/${ad.entityId}`;
      case 'CAR':
        return `/cars/${ad.entityId}`;
      case 'SHOWROOM':
        return `/showrooms/${ad.entityId}`;
      case 'TRANSPORT':
        return `/transport/${ad.entityId}`;
      case 'YARD':
        return `/yards/${ad.entityId}`;
      default:
        return '#';
    }
  };

  const trackImpression = async (adId) => {
    try {
      await fetch('/api/placements/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, action: 'impression' }),
      });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const trackClick = async (adId) => {
    try {
      await fetch('/api/placements/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, action: 'click' }),
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const renderAd = (placement, ad, index) => {
    const isVisible = !placement.autoRotate || currentIndex[placement.id] === index;
    
    if (!isVisible) return null;

    const isVideo = ad.mediaType === 'VIDEO' && ad.videoUrl;

    const adContent = (
      <div
        className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 hover:border-amber-500"
        style={{
          width: placement.width || '100%',
          height: placement.height || 'auto',
          minHeight: placement.height || '200px',
        }}
      >
        {isVideo ? (
          <>
            <video
              src={ad.videoUrl}
              poster={ad.videoThumbnail}
              autoPlay={ad.videoAutoplay}
              muted={ad.videoMuted}
              loop={ad.videoLoop}
              controls
              className="h-full w-full object-cover"
              style={{
                height: placement.height || '300px',
              }}
            />
            {(ad.title || ad.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                {ad.title && (
                  <h3 className="text-xl font-bold text-white">{ad.title}</h3>
                )}
                {ad.description && (
                  <p className="mt-1 text-sm text-slate-300 line-clamp-2">{ad.description}</p>
                )}
              </div>
            )}
          </>
        ) : ad.imageUrl ? (
          <>
            <img
              src={ad.imageUrl}
              alt={ad.title || ad.entityType}
              className="h-full w-full object-cover"
              style={{
                height: placement.height || '300px',
              }}
            />
            {(ad.title || ad.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                {ad.title && (
                  <h3 className="text-xl font-bold text-white">{ad.title}</h3>
                )}
                {ad.description && (
                  <p className="mt-1 text-sm text-slate-300 line-clamp-2">{ad.description}</p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              {ad.title ? (
                <>
                  <p className="text-2xl font-bold text-amber-500">{ad.title}</p>
                  {ad.description && (
                    <p className="mt-2 text-slate-400">{ad.description}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-amber-500">{ad.entityType}</p>
                  <p className="mt-2 text-slate-400">{ad.entityId}</p>
                </>
              )}
              <p className="mt-4 text-sm text-slate-500">انقر للمشاهدة</p>
            </div>
          </div>
        )}
      </div>
    );

    if (ad.linkUrl || ad.entityId) {
      return (
        <Link
          key={ad.id}
          href={ad.linkUrl || getAdLink(ad)}
          className="block transition-opacity duration-500"
          onClick={() => trackClick(ad.id)}
          onLoad={() => trackImpression(ad.id)}
        >
          {adContent}
        </Link>
      );
    }

    return (
      <div key={ad.id} className="transition-opacity duration-500">
        {adContent}
      </div>
    );
  };

  const renderPlacement = (placement) => {
    if (!placement.ads || placement.ads.length === 0) return null;

    switch (placement.type) {
      case 'STATIC':
        return (
          <div key={placement.id} className="relative">
            {renderAd(placement, placement.ads[0], 0)}
          </div>
        );

      case 'SLIDER':
      case 'ROTATING':
        return (
          <div key={placement.id} className="relative">
            {placement.ads.map((ad, index) => renderAd(placement, ad, index))}
            {placement.ads.length > 1 && (
              <div className="mt-3 flex justify-center gap-2">
                {placement.ads.map((_, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setCurrentIndex((prev) => ({ ...prev, [placement.id]: index }))
                    }
                    className={`h-2 w-2 rounded-full transition-all ${
                      currentIndex[placement.id] === index
                        ? 'w-6 bg-amber-500'
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'GRID':
        return (
          <div key={placement.id} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {placement.ads.map((ad) => (
              <Link
                key={ad.id}
                href={getAdLink(ad)}
                className="block"
                onClick={() => trackClick(ad.id)}
              >
                <div className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 hover:border-amber-500">
                  {ad.imageUrl ? (
                    <>
                      <img
                        src={ad.imageUrl}
                        alt={ad.title || ad.entityType}
                        className="h-48 w-full object-cover"
                      />
                      <div className="p-4">
                        {ad.title && (
                          <h3 className="font-bold text-white">{ad.title}</h3>
                        )}
                        {ad.description && (
                          <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                            {ad.description}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center p-6">
                      <div className="text-center">
                        <p className="font-bold text-amber-500">
                          {ad.title || ad.entityType}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {ad.description || ad.entityId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        );

      case 'CAROUSEL':
        return (
          <div key={placement.id} className="relative overflow-hidden">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {placement.ads.map((ad) => (
                <Link
                  key={ad.id}
                  href={getAdLink(ad)}
                  className="block flex-shrink-0"
                  onClick={() => trackClick(ad.id)}
                >
                  <div
                    className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 hover:border-amber-500"
                    style={{ width: '300px', height: '200px' }}
                  >
                    {ad.imageUrl ? (
                      <>
                        <img
                          src={ad.imageUrl}
                          alt={ad.title || ad.entityType}
                          className="h-32 w-full object-cover"
                        />
                        <div className="p-3">
                          {ad.title && (
                            <p className="font-bold text-white text-sm">{ad.title}</p>
                          )}
                          {ad.description && (
                            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                              {ad.description}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center p-6">
                        <div className="text-center">
                          <p className="font-bold text-amber-500">
                            {ad.title || ad.entityType}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {ad.description || ad.entityId}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (placements.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {placements.map((placement) => renderPlacement(placement))}
    </div>
  );
}
