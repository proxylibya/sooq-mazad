/**
 * معرض الصور
 */

import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

export interface GalleryImage {
  src: string;
  alt?: string;
  thumbnail?: string;
  caption?: string;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  initialIndex?: number;
  showThumbnails?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onClose?: () => void;
  className?: string;
}

export function ImageGallery({
  images,
  initialIndex = 0,
  showThumbnails = true,
  showArrows = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  onClose,
  className = '',
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  React.useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval]);

  if (images.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
        <p className="text-gray-500">لا توجد صور</p>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className={`relative ${className}`}>
      {/* الصورة الرئيسية */}
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
        <img
          src={currentImage.src}
          alt={currentImage.alt || `صورة ${currentIndex + 1}`}
          className="h-full w-full object-contain"
        />

        {/* أسهم التنقل */}
        {showArrows && images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          </>
        )}

        {/* زر ملء الشاشة */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute left-2 top-2 rounded-lg bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>

        {/* التسمية التوضيحية */}
        {currentImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-sm text-white">{currentImage.caption}</p>
          </div>
        )}

        {/* العداد */}
        <div className="absolute right-2 top-2 rounded bg-black/50 px-2 py-1 text-sm text-white">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* النقاط */}
      {showDots && images.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* الصور المصغرة */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto py-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                index === currentIndex
                  ? 'border-blue-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={image.thumbnail || image.src}
                alt={image.alt || `صورة مصغرة ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* عرض ملء الشاشة */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-white transition-colors hover:bg-white/20"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-h-full max-w-full object-contain"
          />
          {showArrows && images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/30"
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>
              <button
                onClick={goToNext}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/30"
              >
                <ChevronLeftIcon className="h-8 w-8" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
