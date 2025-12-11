import React, { useState } from 'react';
import { ForwardIcon } from './common/icons/RTLIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  name?: string;
}

interface LocationMessageProps {
  location: LocationData;
  isOwn: boolean;
  timestamp: string;
  senderName?: string;
}

const LocationMessage: React.FC<LocationMessageProps> = ({
  location,
  isOwn,
  timestamp,
  senderName,
}) => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // فتح الموقع في خرائط جوجل
  const openInGoogleMaps = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    console.log('[LocationMessage] فتح في خرائط جوجل:', url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // فتح التوجيهات
  const openDirections = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    console.log('[LocationMessage] فتح التوجيهات:', url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // مشاركة الموقع
  const shareLocation = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareData = {
      title: 'موقع مشترك',
      text: `موقع: ${location.address}`,
      url: `https://maps.google.com/?q=${location.lat},${location.lng}`,
    };

    console.log('[LocationMessage] مشاركة الموقع:', shareData);

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('[LocationMessage] ✅ تم المشاركة بنجاح');
      } catch (error) {
        console.log('[LocationMessage] ⚠️ فشل المشاركة، نسخ للحافظة:', error);
        copyToClipboard(shareData.url);
      }
    } else {
      console.log('[LocationMessage] المتصفح لا يدعم المشاركة، نسخ للحافظة');
      copyToClipboard(shareData.url);
    }
  };

  // نسخ الرابط
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('تم نسخ رابط الموقع');
      })
      .catch(() => {
        alert('فشل في نسخ الرابط');
      });
  };

  // تنسيق الوقت بالأرقام الغربية
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // إنشاء رابط خريطة مصغرة - استخدام iframe OSM بدلاً من static image
  const getMapEmbedUrl = () => {
    const lat = Number(location.lat);
    const lng = Number(location.lng);
    const delta = 0.005; // نطاق الخريطة
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  return (
    <div
      className={`max-w-xs overflow-hidden rounded-2xl shadow-lg lg:max-w-md ${
        isOwn
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
          : 'border border-gray-200 bg-white text-gray-900'
      }`}
    >
      {/* Header */}
      <div className="border-b border-white border-opacity-20 p-3">
        <div className="flex items-center gap-2">
          <MapPinIcon className={`h-5 w-5 ${isOwn ? 'text-white' : 'text-blue-500'}`} />
          <span className="text-sm font-semibold">{location.name || 'موقع مشترك'}</span>
        </div>
        {!isOwn && senderName && <div className="mt-1 text-xs text-gray-500">{senderName}</div>}
      </div>

      {/* Map Preview */}
      <div className="relative">
        <div
          className="relative h-32 cursor-pointer overflow-hidden bg-gray-100"
          onClick={() => setIsMapExpanded(!isMapExpanded)}
        >
          {/* خريطة مباشرة من OpenStreetMap */}
          <iframe
            title="map-preview"
            className="h-full w-full pointer-events-none"
            src={getMapEmbedUrl()}
            style={{ border: 0 }}
          />
          
          {/* Overlay شفاف للنقر */}
          <div className="absolute inset-0 bg-transparent" />

          {/* Expand button */}
          <button className="absolute left-2 top-2 rounded-full bg-black bg-opacity-50 p-1 text-white transition-colors hover:bg-opacity-70 z-10">
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Coordinates overlay */}
        <div className="absolute bottom-2 right-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white z-10">
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </div>
      </div>

      {/* Location Info */}
      <div className="p-3">
        <div className={`mb-1 text-sm font-medium ${isOwn ? 'text-white' : 'text-gray-900'}`}>
          {location.address}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex items-center gap-2 relative z-20">
          <button
            type="button"
            onClick={(e) => openInGoogleMaps(e)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors active:scale-95 ${
              isOwn
                ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            title="فتح الموقع في خرائط جوجل"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            عرض
          </button>

          <button
            type="button"
            onClick={(e) => openDirections(e)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors active:scale-95 ${
              isOwn
                ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
            title="الحصول على توجيهات إلى الموقع"
          >
            <ForwardIcon className="h-4 w-4" />
            توجيه
          </button>

          <button
            type="button"
            onClick={(e) => void shareLocation(e)}
            className={`rounded-lg p-2 transition-colors active:scale-95 ${
              isOwn
                ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            title="مشاركة الموقع"
          >
            <ShareIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Timestamp */}
      <div
        className={`px-3 pb-2 text-xs ${isOwn ? 'text-white text-opacity-75' : 'text-gray-500'}`}
      >
        {formatTime(timestamp)}
      </div>

      {/* Expanded Map Modal */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">عرض الموقع</h3>
                <button
                  onClick={() => setIsMapExpanded(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="relative h-80 w-full bg-gray-100">
              <iframe
                title="map"
                className="h-full w-full"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01}%2C${location.lat - 0.01}%2C${location.lng + 0.01}%2C${location.lat + 0.01}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
              />
            </div>

            <div className="p-4">
              <div className="mb-2 text-sm font-medium text-gray-900">{location.address}</div>
              <div className="mb-4 text-xs text-gray-500">
                الإحداثيات: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={openInGoogleMaps}
                  className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                >
                  فتح في خرائط جوجل
                </button>
                <button
                  onClick={openDirections}
                  className="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                >
                  الحصول على التوجيهات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMessage;
