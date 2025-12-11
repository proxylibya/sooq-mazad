import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import React, { useState } from 'react';

interface EnhancedServiceProviderHTMLProps {
  provider?: {
    name?: string;
    profileImage?: string;
    verified?: boolean;
    serviceType?: string;
    rating?: number;
    reviewsCount?: number;
    location?: string;
    memberSince?: string;
    phone?: string;
  };
}

const EnhancedServiceProviderHTML: React.FC<EnhancedServiceProviderHTMLProps> = ({
  provider = {
    name: 'بيلبيل لبيلبيل',
    profileImage: '/images/profiles/profile_temp_user_1753472292646.jpg',
    verified: true,
    serviceType: 'مقدم خدمة نقل',
    rating: 4.8,
    reviewsCount: 127,
    location: 'طرابلس، ليبيا',
    memberSince: '2023-04-15',
    phone: '+218912345678',
  },
}) => {
  const [showPhone, setShowPhone] = useState(false);

  // دالة لتحويل الأرقام إلى إنجليزية
  const toEnglishDigits = (input: string | number): string => {
    const arabicToEnglish: { [key: string]: string } = {
      '٠': '0',
      '١': '1',
      '٢': '2',
      '٣': '3',
      '٤': '4',
      '٥': '5',
      '٦': '6',
      '٧': '7',
      '٨': '8',
      '٩': '9',
    };
    return String(input).replace(/[٠-٩]/g, (d) => arabicToEnglish[d] || d);
  };

  // دالة لتنسيق تاريخ العضوية
  const formatMemberSince = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return `${diffDays} يوم`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} شهر`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years} سنة`;
      }
    } catch {
      return dateString;
    }
  };

  // رندر النجوم
  const renderStars = () => {
    if (!provider.rating) return null;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          className={`h-4 w-4 ${
            i <= Math.floor(provider.rating!) ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill={i <= Math.floor(provider.rating!) ? 'currentColor' : 'none'}
        />,
      );
    }
    return stars;
  };

  const handleContactClick = () => {
    if (showPhone && provider.phone) {
      window.open(`tel:${provider.phone}`, '_self');
    } else {
      setShowPhone(true);
    }
  };

  const handleMessageClick = () => {
    // يمكن إضافة منطق فتح المحادثة هنا
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
      <h3 className="mb-4 font-semibold text-gray-900">مقدم الخدمة</h3>

      <div className="flex items-center gap-3">
        {/* صورة المستخدم */}
        <div className="relative">
          <img
            src={provider.profileImage || '/images/default-avatar.svg'}
            alt={provider.name || 'مقدم الخدمة'}
            className="h-12 w-12 rounded-full border-2 border-gray-100 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/default-avatar.svg';
            }}
          />
          {/* نقطة الحالة الأونلاين */}
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{provider.name}</h4>
            {provider.verified && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-4 w-4 text-blue-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-500">{provider.serviceType}</p>

          {/* التقييم */}
          {provider.rating && (
            <div className="mt-1 flex items-center gap-1">
              <div className="flex">{renderStars()}</div>
              <span className="text-sm text-gray-600">
                ({toEnglishDigits(provider.rating.toFixed(1))}) •{' '}
                {toEnglishDigits(provider.reviewsCount || 0)} تقييم
              </span>
            </div>
          )}

          {/* الموقع */}
          {provider.location && (
            <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <span>{provider.location}</span>
            </div>
          )}

          {/* تاريخ العضوية */}
          {provider.memberSince && (
            <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span>مسجل منذ {formatMemberSince(provider.memberSince)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {/* زر المراسلة */}
        <button
          onClick={handleMessageClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
          مراسلة
        </button>

        {/* زر الاتصال */}
        <button
          onClick={handleContactClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-center font-medium text-white transition-colors hover:bg-green-700"
        >
          <PhoneIcon className="h-4 w-4" />
          {showPhone ? provider.phone : 'اتصال'}
        </button>
      </div>
    </div>
  );
};

export default EnhancedServiceProviderHTML;
