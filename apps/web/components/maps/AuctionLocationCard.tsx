import React, { useState } from 'react';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import LeafletMap from './LeafletMap';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface AuctionLocationCardProps {
  location: LocationData;
  carTitle?: string;
  className?: string;
}

const AuctionLocationCard: React.FC<AuctionLocationCardProps> = ({
  location,
  carTitle,
  className = '',
}) => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // فتح الموقع في خرائط جوجل
  const openInGoogleMaps = () => {
    const url = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    window.open(url, '_blank');
  };

  // فتح التوجيهات
  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(url, '_blank');
  };

  // مشاركة الموقع
  const shareLocation = async () => {
    const shareData = {
      title: `موقع ${carTitle || 'السيارة'}`,
      text: `موقع السيارة: ${location.address}`,
      url: `https://maps.google.com/?q=${location.lat},${location.lng}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {}
    } else {
      // نسخ الرابط إلى الحافظة
      navigator.clipboard.writeText(shareData.url);
      alert('تم نسخ رابط الموقع');
    }
  };

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
            <button
              onClick={shareLocation}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title="مشاركة الموقع"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title={isMapExpanded ? 'إخفاء الخريطة' : 'عرض الخريطة'}
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Location Info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <MapPinIcon className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="mb-1 font-medium text-gray-900">{location.address}</div>
            <div className="text-sm text-gray-500">
              الإحداثيات: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </div>
          </div>
        </div>

        {/* Mini Map - Always Visible */}
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
          <div className="bg-gray-800 px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs text-gray-300">معاينة الموقع</span>
            </div>
          </div>
          <LeafletMap
            latitude={location.lat}
            longitude={location.lng}
            address={location.address}
            height="160px"
            zoom={14}
            showMarker={true}
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={openInGoogleMaps}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            <GlobeAltIcon className="h-4 w-4" />
            فتح في خرائط جوجل
          </button>
          <button
            onClick={openDirections}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            الحصول على التوجيهات
          </button>
        </div>
      </div>

      {/* Expanded Map */}
      {isMapExpanded && (
        <div className="border-t border-gray-100">
          <div className="relative">
            <LeafletMap
              latitude={location.lat}
              longitude={location.lng}
              address={location.address}
              height="320px"
              zoom={16}
              showMarker={true}
              className="w-full"
            />
            <button
              onClick={() => setIsMapExpanded(false)}
              className="absolute right-2 top-2 z-10 rounded-full bg-white p-2 text-gray-600 shadow-md transition-colors hover:bg-gray-50"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionLocationCard;
