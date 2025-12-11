import React from 'react';
import Image from 'next/image';

/**
 * مكون عرض أيقونات الفئات
 * يدعم الأيقونات المخصصة من /public/icons/ أو Heroicons
 */

type CategoryIconProps = {
  category: 'auctions' | 'marketplace' | 'yards' | 'showrooms' | 'transport';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  useCustomIcon?: boolean; // true = استخدام أيقونة خارجية، false = Heroicons
};

const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 'medium',
  className = '',
  useCustomIcon = false,
}) => {
  // تحديد الحجم
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  const sizeClass = sizeClasses[size];

  // إذا كان useCustomIcon = true، استخدم الأيقونات من /public/icons/
  if (useCustomIcon) {
    const iconPaths: Record<string, string> = {
      auctions: '/icons/auction.svg',
      marketplace: '/icons/car.svg',
      yards: '/icons/location.svg',
      showrooms: '/icons/store.svg',
      transport: '/icons/truck.svg',
    };

    const iconNames: Record<string, string> = {
      auctions: 'المزادات',
      marketplace: 'السوق الفوري',
      yards: 'الساحات',
      showrooms: 'المعارض',
      transport: 'خدمات النقل',
    };

    const dimensions = {
      small: 32,
      medium: 48,
      large: 64,
    };

    return (
      <Image
        src={iconPaths[category]}
        alt={iconNames[category]}
        width={dimensions[size]}
        height={dimensions[size]}
        className={`${sizeClass} ${className}`}
      />
    );
  }

  // استخدام Heroicons (الافتراضي)
  const heroIcons: Record<string, JSX.Element> = {
    auctions: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`${sizeClass} ${className}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z"
        />
      </svg>
    ),
    marketplace: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className={`${sizeClass} ${className}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l1.5-5h11l1.5 5M5 13v5h14v-5M5 13h14M7 18h1m8 0h1m-9-5h10"
        />
        <circle cx="7.5" cy="18" r="1.5" fill="currentColor" />
        <circle cx="16.5" cy="18" r="1.5" fill="currentColor" />
      </svg>
    ),
    yards: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`${sizeClass} ${className}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        />
      </svg>
    ),
    showrooms: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`${sizeClass} ${className}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
        />
      </svg>
    ),
    transport: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`${sizeClass} ${className}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
        />
      </svg>
    ),
  };

  return heroIcons[category] || null;
};

export default CategoryIcon;
