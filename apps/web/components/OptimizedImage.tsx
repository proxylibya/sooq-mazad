/**
 * @deprecated استخدم @/components/ui/UnifiedImage بدلاً من هذا الملف
 * هذا الملف wrapper للتوافق مع الكود القديم
 *
 * مكون صورة محسّنة مع Lazy Loading
 * يدعم: WebP, AVIF, Responsive, Placeholder
 */

import UnifiedImage from '@/components/ui/UnifiedImage';
import React, { useEffect, useRef, useState } from 'react';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  fallbackSrc?: string;
}

/**
 * مكون صورة محسّنة - يستخدم UnifiedImage داخلياً
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = (props) => {
  return (
    <UnifiedImage
      src={props.src}
      alt={props.alt}
      width={props.width}
      height={props.height}
      className={props.className}
      priority={props.priority}
      quality={props.quality}
      sizes={props.sizes}
      blurDataURL={props.blurDataURL}
      objectFit={props.objectFit}
      objectPosition={props.objectPosition}
      fallbackSrc={props.fallbackSrc}
      onLoad={props.onLoad}
      onError={props.onError}
      placeholder={props.placeholder === 'blur' ? 'blur' : 'shimmer'}
      lazyLoad={props.loading !== 'eager'}
    />
  );
};

/**
 * مكون معرض صور محسّن
 */
export interface OptimizedImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  className?: string;
  imageClassName?: string;
  columns?: 2 | 3 | 4;
  gap?: 2 | 4 | 6 | 8;
}

export const OptimizedImageGallery: React.FC<OptimizedImageGalleryProps> = ({
  images,
  className = '',
  imageClassName = '',
  columns = 3,
  gap = 4,
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-${gap} ${className}`}>
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={imageClassName}
          loading="lazy"
          sizes={`(max-width: 768px) 100vw, ${100 / columns}vw`}
        />
      ))}
    </div>
  );
};

/**
 * مكون صورة خلفية محسّنة
 */
export interface OptimizedBackgroundImageProps {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  priority?: boolean;
}

export const OptimizedBackgroundImage: React.FC<OptimizedBackgroundImageProps> = ({
  src,
  alt,
  children,
  className = '',
  overlay = false,
  overlayOpacity = 0.5,
  priority = false,
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full"
        objectFit="cover"
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
      />
      {overlay && <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
};

/**
 * مكون صورة مع Intersection Observer (Lazy Loading متقدم)
 */
export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  placeholder?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  placeholder = '/placeholder.svg',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return (
    <div ref={imgRef} className={`relative ${className}`} style={{ width, height }}>
      {!isLoaded && <div className="absolute inset-0 animate-pulse rounded bg-gray-200" />}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
};

/**
 * Hook لـ Lazy Loading
 */
export function useLazyLoad(threshold = 0.1, rootMargin = '50px') {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isVisible };
}

/**
 * مكون صورة مع Picture Element (WebP/AVIF)
 */
export interface ProgressiveImageProps {
  srcWebP?: string;
  srcAvif?: string;
  srcJpeg: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  srcWebP,
  srcAvif,
  srcJpeg,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  sizes = '100vw',
}) => {
  return (
    <picture>
      {srcAvif && <source srcSet={srcAvif} type="image/avif" sizes={sizes} />}
      {srcWebP && <source srcSet={srcWebP} type="image/webp" sizes={sizes} />}
      <img
        src={srcJpeg}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
};

export default OptimizedImage;
