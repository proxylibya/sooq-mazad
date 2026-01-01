import React, { useState, useEffect, useRef } from 'react';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import ChevronUpIcon from '@heroicons/react/24/outline/ChevronUpIcon';
import {
  ChatBubbleLeftRightIcon,
  LinkIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/solid';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface CarLocation {
  id: string;
  title: string;
  location: LocationData;
  price: number;
  brand: string;
  model: string;
}

interface MarketplaceLocationSectionProps {
  cars: CarLocation[];
  selectedLocation?: LocationData;
  className?: string;
}

const MarketplaceLocationSection: React.FC<MarketplaceLocationSectionProps> = ({
  cars,
  selectedLocation,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // الحصول على الموقع المحدد أو الموقع للسيارة المختارة
  const currentLocation =
    selectedLocation ||
    (cars.length > 0 ? cars[selectedCarIndex]?.location || cars[0].location : null);
  const currentCar = cars.length > 0 ? cars[selectedCarIndex] || cars[0] : null;

  // فتح الموقع في خرائط جوجل
  const openInGoogleMaps = (location: LocationData) => {
    const url = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    window.open(url, '_blank');
  };

  // فتح التوجيهات
  const openDirections = (location: LocationData) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(url, '_blank');
  };

  // إغلاق قائمة المشاركة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  // نسخ الرابط إلى الحافظة
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('فشل في نسخ الرابط:', error);
    }
  };

  // مشاركة عبر واتساب
  const shareOnWhatsApp = (location: LocationData, title?: string) => {
    const text = encodeURIComponent(
      `${title ? `موقع ${title}` : 'موقع السيارة'}\n${location.address}\nhttps://maps.google.com/?q=${location.lat},${location.lng}`,
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  // مشاركة عبر تيليجرام
  const shareOnTelegram = (location: LocationData, title?: string) => {
    const text = encodeURIComponent(
      `${title ? `موقع ${title}` : 'موقع السيارة'}\n${location.address}`,
    );
    const url = encodeURIComponent(`https://maps.google.com/?q=${location.lat},${location.lng}`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  // مشاركة عبر فيسبوك
  const shareOnFacebook = (location: LocationData) => {
    const url = encodeURIComponent(`https://maps.google.com/?q=${location.lat},${location.lng}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setShowShareMenu(false);
  };

  // مشاركة عبر تويتر
  const shareOnTwitter = (location: LocationData, title?: string) => {
    const text = encodeURIComponent(
      `${title ? `موقع ${title}` : 'موقع السيارة'}\n${location.address}`,
    );
    const url = encodeURIComponent(`https://maps.google.com/?q=${location.lat},${location.lng}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShowShareMenu(false);
  };

  // مشاركة الموقع الأصلية
  const shareLocation = async (location: LocationData, title?: string) => {
    const shareData = {
      title: title ? `موقع ${title}` : 'موقع السيارة',
      text: `موقع السيارة: ${location.address}`,
      url: `https://maps.google.com/?q=${location.lat},${location.lng}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShowShareMenu(false);
      } catch (error) {}
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  if (!currentLocation) {
    return null;
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-gray-900">مواقع السيارات</h3>
            {cars.length > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                {cars.length} سيارة
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* زر المشاركة مع القائمة المنبثقة */}
            <div className="relative" ref={shareMenuRef}>
              <button
                onClick={() => shareLocation(currentLocation, cars[selectedCarIndex]?.title)}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                title="مشاركة الموقع"
              >
                <ShareIcon className="h-4 w-4" />
                {!navigator.share && (
                  <ChevronDownIcon className="absolute -bottom-1 -right-1 h-3 w-3" />
                )}
              </button>

              {/* القائمة المنبثقة للمشاركة */}
              {showShareMenu && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="p-2">
                    <div className="mb-2 px-2 py-1 text-xs font-medium text-gray-500">
                      مشاركة الموقع عبر
                    </div>

                    {/* واتساب */}
                    <button
                      onClick={() =>
                        shareOnWhatsApp(currentLocation, cars[selectedCarIndex]?.title)
                      }
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-right transition-colors hover:bg-green-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">واتساب</div>
                        <div className="text-xs text-gray-500">مشاركة عبر واتساب</div>
                      </div>
                    </button>

                    {/* تيليجرام */}
                    <button
                      onClick={() =>
                        shareOnTelegram(currentLocation, cars[selectedCarIndex]?.title)
                      }
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-right transition-colors hover:bg-blue-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.548c-.12.54-.44.67-.89.42l-2.46-1.81-1.19 1.14c-.13.13-.24.24-.49.24l.17-2.43 4.33-3.91c.19-.17-.04-.26-.29-.1l-5.35 3.37-2.3-.72c-.5-.16-.51-.5.1-.74l8.95-3.45c.42-.16.78.1.65.66z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">تيليجرام</div>
                        <div className="text-xs text-gray-500">مشاركة عبر تيليجرام</div>
                      </div>
                    </button>

                    {/* فيسبوك */}
                    <button
                      onClick={() => shareOnFacebook(currentLocation)}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-right transition-colors hover:bg-blue-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">فيسبوك</div>
                        <div className="text-xs text-gray-500">مشاركة عبر فيسبوك</div>
                      </div>
                    </button>

                    {/* تويتر */}
                    <button
                      onClick={() => shareOnTwitter(currentLocation, cars[selectedCarIndex]?.title)}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-right transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
                        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">تويتر</div>
                        <div className="text-xs text-gray-500">مشاركة عبر تويتر</div>
                      </div>
                    </button>

                    <div className="my-2 border-t border-gray-100"></div>

                    {/* نسخ الرابط */}
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`,
                        )
                      }
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-right transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                        {copySuccess ? (
                          <svg
                            className="h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <DocumentDuplicateIcon className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {copySuccess ? 'تم النسخ!' : 'نسخ الرابط'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {copySuccess ? 'تم نسخ رابط الموقع' : 'نسخ رابط الموقع'}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
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
            <div className="mb-1 font-medium text-gray-900">{currentLocation.address}</div>
            <div className="text-sm text-gray-500">
              الإحداثيات: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </div>
            {currentCar && (
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm text-blue-600">
                  {currentCar.brand} {currentCar.model}
                </div>
                <div className="text-sm font-bold text-green-600">
                  {currentCar.price.toLocaleString()} د.ل
                </div>
              </div>
            )}
            {cars.length > 1 && (
              <div className="mt-1 text-xs text-gray-500">{cars.length} سيارة في هذه المنطقة</div>
            )}
          </div>
        </div>

        {/* Car Selection */}
        {isExpanded && cars.length > 1 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h4 className="mb-3 text-sm font-medium text-gray-700">اختر سيارة لعرض موقعها:</h4>
            <div className="custom-scrollbar max-h-40 space-y-2 overflow-y-auto">
              {cars.map((car, index) => (
                <button
                  key={car.id}
                  onClick={() => setSelectedCarIndex(index)}
                  className={`w-full rounded-lg border p-3 text-right transition-all duration-200 ${
                    index === selectedCarIndex
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {car.brand} {car.model}
                      </div>
                      <div className="text-xs text-gray-500">{car.location.address}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-green-600">
                        {car.price.toLocaleString()} د.ل
                      </div>
                      {index === selectedCarIndex && (
                        <div className="mt-1 text-xs text-blue-600">محدد حالياً</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => openInGoogleMaps(currentLocation)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            <GlobeAltIcon className="h-4 w-4" />
            فتح في خرائط جوجل
          </button>
          <button
            onClick={() => openDirections(currentLocation)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            الحصول على التوجيهات
          </button>
        </div>
      </div>

      {/* Expanded Map Preview */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="relative">
            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-blue-100 to-green-100">
              <div
                className="absolute inset-0 bg-blue-500 bg-opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                }}
              ></div>

              {/* Location Pin */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                <div className="animate-pulse rounded-full bg-red-500 p-3 text-white shadow-lg">
                  <MapPinIcon className="h-6 w-6" />
                </div>
              </div>

              {/* Map Info */}
              <div className="absolute left-4 top-4 rounded-lg bg-white p-2 shadow-md">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4" />
                  {cars.length > 1 ? `${cars.length} سيارة` : 'موقع السيارة'}
                </div>
              </div>

              {/* Coordinates */}
              <div className="absolute bottom-2 right-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </div>

              {/* Click to open in maps */}
              <button
                onClick={() => openInGoogleMaps(currentLocation)}
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-0 transition-all hover:bg-opacity-10"
              >
                <div className="rounded-full bg-white bg-opacity-90 px-3 py-1 text-sm text-gray-700 opacity-0 transition-opacity hover:opacity-100">
                  انقر لفتح الخريطة
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default MarketplaceLocationSection;
