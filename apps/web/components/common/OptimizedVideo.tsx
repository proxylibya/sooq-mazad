/**
 * مكون فيديو محسّن مع lazy loading
 */

import React, { useRef, useEffect, useState } from 'react';

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  lazyLoad?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * مكون فيديو محسّن مع:
 * - Lazy loading باستخدام Intersection Observer
 * - دعم صيغ متعددة (MP4, WebM)
 * - Poster image
 * - Responsive
 */
export const OptimizedVideo: React.FC<OptimizedVideoProps> = ({
  src,
  poster,
  width = '100%',
  height = 'auto',
  className = '',
  autoPlay = false,
  loop = false,
  muted = true,
  controls = true,
  playsInline = true,
  preload = 'metadata',
  lazyLoad = true,
  onLoad,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!lazyLoad) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    // استخدام Intersection Observer للـ lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // تحميل قبل 50px من الظهور
      },
    );

    observer.observe(videoElement);

    return () => {
      observer.disconnect();
    };
  }, [lazyLoad]);

  const handleLoadedData = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // الحصول على صيغ الفيديو المتعددة
  const getVideoSources = () => {
    const sources = [];
    const baseSrc = src.replace(/\.[^/.]+$/, '');
    const ext = src.split('.').pop()?.toLowerCase();

    // إضافة WebM إذا كان متاحاً
    if (ext !== 'webm') {
      sources.push({
        src: `${baseSrc}.webm`,
        type: 'video/webm',
      });
    }

    // إضافة MP4
    sources.push({
      src: ext === 'mp4' ? src : `${baseSrc}.mp4`,
      type: 'video/mp4',
    });

    return sources;
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ width, height: height === 'auto' ? 300 : height }}
      >
        <div className="text-center text-gray-500">
          <svg
            className="mx-auto mb-2 h-16 w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">فشل تحميل الفيديو</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* مؤشر التحميل */}
      {!isLoaded && isVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100" role="status" aria-live="polite" aria-busy="true">
          <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
          <span className="sr-only">جاري تحميل الفيديو</span>
        </div>
      )}

      <video
        ref={videoRef}
        width={width}
        height={height}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline={playsInline}
        preload={preload}
        onLoadedData={handleLoadedData}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
        {isVisible &&
          getVideoSources().map((source, index) => (
            <source key={index} src={source.src} type={source.type} />
          ))}
        المتصفح لا يدعم تشغيل الفيديو.
      </video>
    </div>
  );
};

export default OptimizedVideo;
