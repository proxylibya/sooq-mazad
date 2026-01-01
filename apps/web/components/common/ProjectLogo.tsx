import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface ProjectLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  linkTo?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  forceTextOnly?: boolean;
}

interface BrandingSettings {
  logoType: 'text' | 'image';
  logoImageUrl: string;
  siteName: string;
}

const ProjectLogo: React.FC<ProjectLogoProps> = ({
  className = '',
  showText = false,
  textClassName = '',
  linkTo = '/',
  size = 'md',
  forceTextOnly = false,
}) => {
  const [settings, setSettings] = useState<BrandingSettings>({
    logoType: 'text',
    logoImageUrl: '',
    siteName: 'سوق المزاد',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadBranding = async () => {
      try {
        const res = await fetch('/api/site-branding');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.settings) {
          const next: BrandingSettings = {
            logoType: data.settings.logoType || 'text',
            logoImageUrl: data.settings.logoImageUrl || '',
            siteName: data.settings.siteName || 'سوق المزاد',
          };
          setSettings(next);
        }
      } catch {
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadBranding();
    return () => {
      cancelled = true;
    };
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
      ) : !forceTextOnly && settings.logoType === 'image' && settings.logoImageUrl ? (
        <img src={settings.logoImageUrl} alt={settings.siteName} className={sizeClasses[size]} />
      ) : (
        <div className={`font-bold text-blue-600 ${textSizeClasses[size]} ${textClassName}`}>
          {settings.siteName}
        </div>
      )}
      {showText && !forceTextOnly && settings.logoType === 'image' && (
        <div className={`mr-3 font-bold text-blue-600 ${textSizeClasses[size]} ${textClassName}`}>
          {settings.siteName}
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
