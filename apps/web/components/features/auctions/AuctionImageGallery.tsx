import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface AuctionImageGalleryProps {
  images: string[];
  title: string;
}

export default function AuctionImageGallery({ images, title }: AuctionImageGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl bg-gray-100" style={{ height: '400px' }}>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-400">لا توجد صور متاحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* الصورة الرئيسية */}
      <div className="relative w-full overflow-hidden rounded-xl bg-gray-100" style={{ height: '400px' }}>
        <Image
          src={images[activeImageIndex]}
          alt={`${title} - صورة ${activeImageIndex + 1}`}
          fill
          className="object-cover"
          priority={activeImageIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* أزرار التنقل */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 shadow-lg transition-all hover:bg-black/90 text-white"
              aria-label="الصورة السابقة"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 shadow-lg transition-all hover:bg-black/90 text-white"
              aria-label="الصورة التالية"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>

            {/* مؤشر عدد الصور */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
              {activeImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* الصور المصغرة */}
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImageIndex(index)}
              className={`relative aspect-video overflow-hidden rounded-lg ${
                index === activeImageIndex ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={image}
                alt={`صورة مصغرة ${index + 1}`}
                fill
                className="object-cover"
                sizes="20vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
