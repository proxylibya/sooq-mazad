/**
 * Avatar - High Performance Avatar Component
 * صورة المستخدم محسنة للأداء
 */

import React, { memo, useCallback, useState } from 'react';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: boolean;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
};

const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const Avatar = memo(function Avatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  rounded = true,
  className = '',
  fallbackIcon,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const handleError = useCallback(() => {
    setImageError(true);
  }, []);

  const showFallback = !src || imageError;

  return (
    <div
      className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden bg-gray-200 ${sizeClasses[size]} ${rounded ? 'rounded-full' : 'rounded-lg'} ${className} `}
    >
      {!showFallback ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={handleError}
          loading="lazy"
        />
      ) : fallbackIcon ? (
        fallbackIcon
      ) : (
        <span className="font-medium text-gray-600">{getInitials(name)}</span>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
