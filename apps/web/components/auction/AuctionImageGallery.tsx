import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface AuctionImageGalleryProps {
  images: string[];
  title: string;
  activeImageIndex: number;
  setActiveImageIndex: (index: number) => void;
}

const AuctionImageGallery: React.FC<AuctionImageGalleryProps> = React.memo(({
  images,
  title,
  activeImageIndex,
  setActiveImageIndex,
}) => {
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => ({ ...prev, [index]: true }));
  };

  const nextImage = () => {
    setActiveImageIndex((activeImageIndex + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex(activeImageIndex === 0 ? images.length - 1 : activeImageIndex - 1);
  };

  const validImages = useMemo(() => {
    return images.filter((img, index) => img && !imageLoadErrors[index]);
  }, [images, imageLoadErrors]);

  if (!validImages.length) {
    return (
      <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>لا توجد صور متاحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auction-image-gallery">
      {/* الصورة الرئيسية */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden group" style={{ height: '400px' }}>
        <img
          src={validImages[activeImageIndex]}
          alt={`${title} - صورة ${activeImageIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => handleImageError(activeImageIndex)}
          loading="lazy"
        />
        
        {/* أزرار التنقل */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="الصورة السابقة"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="الصورة التالية"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </>
        )}

        {/* مؤشر عدد الصور */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
          {activeImageIndex + 1} / {validImages.length}
        </div>
      </div>

      {/* الصور المصغرة */}
      {validImages.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {validImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImageIndex(index)}
              className={`flex-shrink-0 relative rounded-lg overflow-hidden aspect-video w-20 transition-all duration-200 ${
                index === activeImageIndex
                  ? 'ring-2 ring-blue-500 scale-105'
                  : 'hover:ring-1 hover:ring-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`صورة مصغرة ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

AuctionImageGallery.displayName = 'AuctionImageGallery';

export default AuctionImageGallery;
