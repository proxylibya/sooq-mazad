import React, { useState, useEffect } from 'react';
import { UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface UserAvatarProps {
  /** رابط صورة المستخدم */
  src?: string;
  /** النص البديل للصورة */
  alt: string;
  /** حجم الصورة الرمزية */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /** عرض شارة التحقق */
  showVerificationBadge?: boolean;
  /** حالة التحقق */
  isVerified?: boolean;
  /** إظهار نقطة الحالة (متصل/غير متصل) */
  showPresenceDot?: boolean;
  /** حالة الاتصال الحالية */
  isOnline?: boolean;
  /** فئات CSS إضافية */
  className?: string;
  /** دالة النقر */
  onClick?: () => void;
  /** نوع الحساب للتمييز */
  accountType?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  size = 'md',
  showVerificationBadge = false,
  isVerified = false,
  showPresenceDot = false,
  isOnline = false,
  className = '',
  onClick,
  accountType,
}) => {
  // حالة محلية لرابط الصورة مع آلية التحديث التلقائي
  const [imageSrc, setImageSrc] = useState(src);
  const [forceRefresh, setForceRefresh] = useState(0);

  // تحديث الصورة عند تغيير المصدر
  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  // الاستماع لأحداث تحديث الصورة الشخصية
  useEffect(() => {
    const handleProfileImageUpdated = (event: CustomEvent) => {
      const { imageUrl } = event.detail;
      if (imageUrl) {
        console.log('[UserAvatar] تحديث الصورة الشخصية:', imageUrl);
        setImageSrc(imageUrl);
        setForceRefresh(Date.now()); // فرض إعادة التحميل
      }
    };

    const handleAvatarChanged = (event: CustomEvent) => {
      const { newAvatar } = event.detail;
      if (newAvatar) {
        console.log('[UserAvatar] تغيير الصورة الرمزية:', newAvatar);
        setImageSrc(newAvatar);
        setForceRefresh(Date.now());
      }
    };

    window.addEventListener('profileImageUpdated', handleProfileImageUpdated as EventListener);
    window.addEventListener('avatarChanged', handleAvatarChanged as EventListener);

    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdated as EventListener);
      window.removeEventListener('avatarChanged', handleAvatarChanged as EventListener);
    };
  }, []);

  // إنشاء رابط الصورة مع timestamp للتأكد من إعادة التحميل
  const getImageSrc = () => {
    if (!imageSrc) return null;
    
    // إضافة timestamp للتأكد من إعادة التحميل
    const separator = imageSrc.includes('?') ? '&' : '?';
    return forceRefresh > 0 
      ? `${imageSrc}${separator}t=${forceRefresh}`
      : imageSrc;
  };
  // تحديد أحجام الصورة الرمزية
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-24 w-24',
    '3xl': 'h-32 w-32',
  };

  // تحديد أحجام الأيقونة
  const iconSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
    '2xl': 'h-12 w-12',
    '3xl': 'h-16 w-16',
  };

  // تحديد أحجام شارة التحقق
  const badgeSizeClasses = {
    xs: 'h-2 w-2 -bottom-0.5 -right-0.5',
    sm: 'h-2.5 w-2.5 -bottom-0.5 -right-0.5',
    md: 'h-3 w-3 -bottom-1 -right-1',
    lg: 'h-3.5 w-3.5 -bottom-1 -right-1',
    xl: 'h-4 w-4 -bottom-1.5 -right-1.5',
    '2xl': 'h-5 w-5 -bottom-2 -right-2',
    '3xl': 'h-6 w-6 -bottom-2.5 -right-2.5',
  };

  // تحديد أحجام وموقع نقطة الحالة (يسار سفلي لتجنب التعارض مع شارة التحقق)
  const presenceSizeClasses = {
    xs: 'h-2 w-2 -bottom-0.5 -left-0.5',
    sm: 'h-2.5 w-2.5 -bottom-0.5 -left-0.5',
    md: 'h-3 w-3 -bottom-1 -left-1',
    lg: 'h-3.5 w-3.5 -bottom-1 -left-1',
    xl: 'h-4 w-4 -bottom-1.5 -left-1.5',
    '2xl': 'h-5 w-5 -bottom-2 -left-2',
    '3xl': 'h-6 w-6 -bottom-2.5 -left-2.5',
  } as const;

  const finalImageSrc = getImageSrc();

  return (
    <div className={`${className} user-avatar-root relative inline-block ring-0 ring-offset-0 outline-none`}>
      {finalImageSrc ? (
        <img
          src={finalImageSrc}
          alt={alt}
          className={`${sizeClasses[size]} rounded-full object-cover ring-0 ring-offset-0 outline-none ${
            onClick ? 'cursor-pointer hover:opacity-80' : ''
          }`}
          onClick={onClick}
          onError={(e) => {
            // في حالة فشل تحميل الصورة، إخفاؤها وعرض الأيقونة الافتراضية
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
        />
      ) : null}

      {/* الصورة الافتراضية */}
      <div
        className={`${sizeClasses[size]} ${
          finalImageSrc ? 'hidden' : 'flex'
        } items-center justify-center rounded-full bg-gray-200 text-gray-500 ring-0 ring-offset-0 outline-none ${
          onClick ? 'cursor-pointer hover:bg-gray-300' : ''
        }`}
        onClick={onClick}
        style={{ display: finalImageSrc ? 'none' : 'flex' }}
      >
        <UserIcon className={iconSizeClasses[size]} />
      </div>

      {/* شارة التحقق */}
      {showVerificationBadge && isVerified && (
        <div
          className={`absolute ${badgeSizeClasses[size]} flex items-center justify-center rounded-full border-2 border-white bg-green-500`}
        >
          <CheckCircleIcon className="h-full w-full text-white" />
        </div>
      )}

      {/* نقطة الحالة (متصل/غير متصل) */}
      {showPresenceDot && (
        <span
          className={`absolute ${presenceSizeClasses[size]} rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-300'
          }`}
          title={isOnline ? 'متصل الآن' : 'غير متصل'}
          aria-label={isOnline ? 'online' : 'offline'}
        />
      )}
    </div>
  );
};

export default UserAvatar;
