import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface ProjectLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  linkTo?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface BrandingSettings {
  logoType: 'text' | 'image';
  logoImage: string;
  logoText: string;
}

const ProjectLogo: React.FC<ProjectLogoProps> = ({
  className = '',
  showText = false,
  textClassName = '',
  linkTo = '/',
  size = 'md',
}) => {
  const [settings, setSettings] = useState<BrandingSettings>({
    logoType: 'text',
    logoImage: '',
    logoText: 'سوق المزاد',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/general');
        const data = await response.json();
        if (data && data.siteName) {
          setSettings((prev) => ({
            ...prev,
            logoText: data.siteName,
          }));
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    if (typeof window !== 'undefined') {
      fetchSettings();
    }
  }, []);

  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-14 w-auto',
    xl: 'h-20 w-auto',
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const logoContent = (
    <div className={`flex items-center ${className}`}>
      {loading ? (
        <div className={`animate-pulse rounded bg-gray-200 ${sizeClasses[size]}`}></div>
      ) : settings.logoType === 'image' && settings.logoImage ? (
        <img src={settings.logoImage} alt={settings.logoText} className={sizeClasses[size]} />
      ) : (
        <div className={`font-bold text-blue-600 ${textSizeClasses[size]} ${textClassName}`}>
          {settings.logoText}
        </div>
      )}
      {showText && settings.logoType === 'image' && (
        <div className={`mr-3 font-bold text-blue-600 ${textSizeClasses[size]} ${textClassName}`}>
          {settings.logoText}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link href={linkTo} className="cursor-pointer">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default ProjectLogo;
