import React, { useState } from 'react';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import ChevronUpIcon from '@heroicons/react/24/outline/ChevronUpIcon';

interface LocationData {
  lat?: number;
  lng?: number;
  address?: string;
  city?: string;
  region?: string;
}

interface CarLocationSectionProps {
  location: LocationData;
  carTitle?: string;
  className?: string;
}

const CarLocationSection: React.FC<CarLocationSectionProps> = ({
  location,
  carTitle = '',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // التحقق من وجود بيانات الموقع
  const hasLocationData = location && (location.lat || location.lng || location.address);

  if (!hasLocationData) {
    return null;
  }

  // فتح الموقع في خرائط جوجل
  const openInGoogleMaps = () => {
    if (location.lat && location.lng) {
      const url = `https://maps.google.com/?q=${location.lat},${location.lng}`;
      window.open(url, '_blank');
    } else if (location.address) {
      const url = `https://maps.google.com/?q=${encodeURIComponent(location.address)}`;
      window.open(url, '_blank');
    }
  };

  // الحصول على التوجيهات
  const getDirections = () => {
    if (location.lat && location.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
      window.open(url, '_blank');
    } else if (location.address) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`;
      window.open(url, '_blank');
    }
  };

  // مشاركة الموقع
  const shareLocation = async () => {
    const locationText = location.address || `${location.lat}, ${location.lng}`;
    const shareData = {
      title: `موقع ${carTitle}`,
      text: `موقع السيارة: ${locationText}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {}
    } else {
      // نسخ الرابط إلى الحافظة
      navigator.clipboard.writeText(window.location.href);
      setShowShareMenu(true);
      setTimeout(() => setShowShareMenu(false), 2000);
    }
  };

  // الحصول على رابط الخريطة الثابتة
  const getStaticMapUrl = () => {
    if (location.lat && location.lng) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01},${location.lat - 0.01},${location.lng + 0.01},${location.lat + 0.01}&layer=mapnik&marker=${location.lat},${location.lng}`;
    }
    return null;
  };

  const displayAddress =
    location.address ||
    (location.city && location.region ? `${location.city}, ${location.region}` : '') ||
    (location.lat && location.lng ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '');

  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-gray-900">موقع السيارة</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={shareLocation}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                title="مشاركة الموقع"
              >
                <ShareIcon className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title="عرض الخريطة"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <MapPinIcon className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="mb-1 font-medium text-gray-900">
              {displayAddress || location.city || location.region || 'موقع غير محدد'}
            </div>
            {location.lat && location.lng && (
              <div className="text-sm text-gray-500">
                الإحداثيات: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            onClick={openInGoogleMaps}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
            فتح في خرائط جوجل
          </button>
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
            onClick={getDirections}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
            الحصول على التوجيهات
          </button>
        </div>
      </div>

      {/* الخريطة المدمجة */}
      {isExpanded && getStaticMapUrl() && (
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-gray-100 px-4 py-2">
            <p className="text-sm font-medium text-gray-700">خريطة تفاعلية للموقع</p>
          </div>
          <iframe
            src={getStaticMapUrl()}
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`خريطة موقع ${carTitle}`}
            className="w-full"
          />
          <div className="bg-gray-50 px-4 py-2 text-center">
            <p className="text-xs text-gray-500">
              اضغط على الخريطة للتفاعل معها أو استخدم زر "فتح في خرائط جوجل" للحصول على الاتجاهات
            </p>
          </div>
        </div>
      )}

      {/* رسالة المشاركة */}
      {showShareMenu && (
        <div className="mt-2 rounded-lg bg-green-50 p-3 text-center">
          <p className="text-sm text-green-700">تم نسخ رابط الموقع إلى الحافظة!</p>
        </div>
      )}
    </div>
  );
};

export default CarLocationSection;
