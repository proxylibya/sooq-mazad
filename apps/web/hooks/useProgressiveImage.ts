/**
 * Hook للصور التقدمية (Progressive Images)
 * يحمل low-res أولاً ثم high-res
 */

import { useState, useEffect } from 'react';

interface UseProgressiveImageOptions {
  lowResSrc?: string;
  highResSrc: string;
  placeholder?: string;
}

interface UseProgressiveImageResult {
  src: string;
  isLoading: boolean;
  isError: boolean;
  blur: boolean;
}

/**
 * Hook لتحميل الصور بشكل تقدمي
 *
 * @example
 * const { src, isLoading, blur } = useProgressiveImage({
 *   lowResSrc: '/images/car_small.jpg',
 *   highResSrc: '/images/car_large.jpg'
 * });
 */
export function useProgressiveImage({
  lowResSrc,
  highResSrc,
  placeholder,
}: UseProgressiveImageOptions): UseProgressiveImageResult {
  const [src, setSrc] = useState<string>(placeholder || lowResSrc || highResSrc);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [blur, setBlur] = useState<boolean>(!!placeholder || !!lowResSrc);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);

    // إذا كان هناك low-res، نحمله أولاً
    if (lowResSrc && lowResSrc !== highResSrc) {
      const lowResImage = new Image();
      lowResImage.src = lowResSrc;

      lowResImage.onload = () => {
        setSrc(lowResSrc);
        setBlur(true);
        // ثم نبدأ بتحميل high-res
        loadHighRes();
      };

      lowResImage.onerror = () => {
        // إذا فشل low-res، نذهب مباشرة لـ high-res
        loadHighRes();
      };
    } else {
      // لا يوجد low-res، نحمل high-res مباشرة
      loadHighRes();
    }

    function loadHighRes() {
      const highResImage = new Image();
      highResImage.src = highResSrc;

      highResImage.onload = () => {
        setSrc(highResSrc);
        setIsLoading(false);
        setBlur(false);
      };

      highResImage.onerror = () => {
        setIsLoading(false);
        setIsError(true);
        setBlur(false);
      };
    }
  }, [lowResSrc, highResSrc, placeholder]);

  return { src, isLoading, isError, blur };
}

export default useProgressiveImage;
