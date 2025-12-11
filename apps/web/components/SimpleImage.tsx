import { XCircleIcon } from '@heroicons/react/24/outline';

import React, { useState } from 'react';

interface SimpleImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

const SimpleImage: React.FC<SimpleImageProps> = ({
  src,
  alt,
  className = '',
  fallback = '/images/showrooms/default-showroom.svg',
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imageSrc !== fallback) {
      console.warn(
        `<XCircleIcon className="w-5 h-5 text-red-500" /> فشل تحميل الصورة: ${imageSrc}`,
      );
      setImageSrc(fallback);
      setHasError(true);
    }
  };

  return <img src={imageSrc} alt={alt} className={className} onError={handleError} />;
};

export default SimpleImage;
