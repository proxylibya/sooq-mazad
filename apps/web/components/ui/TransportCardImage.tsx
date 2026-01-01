import React, { useState } from 'react';

interface TransportCardImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  onError?: () => void;
}

const TransportCardImage: React.FC<TransportCardImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  onError,
}) => {
  const defaultFallback = '/images/transport/default-truck.jpg';
  const [imageSrc, setImageSrc] = useState(src || defaultFallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imageSrc !== defaultFallback) {
      setImageSrc(defaultFallback);
      setHasError(true);
    }
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-200">
          <div
            className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
            role="status"
            aria-label="جاري التحميل"
          />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        className={`h-full w-full object-cover object-center transition-opacity duration-300 ${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
};

export default TransportCardImage;
