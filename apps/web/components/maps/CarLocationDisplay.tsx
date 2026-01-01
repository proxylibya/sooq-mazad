import React, { useState, useEffect, useRef } from 'react';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import {
  ChatBubbleLeftRightIcon,
  LinkIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/solid';
import LeafletMap from './LeafletMap';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface CarLocationDisplayProps {
  location: LocationData;
  carTitle?: string;
  className?: string;
  showFullMap?: boolean;
}

const CarLocationDisplay: React.FC<CarLocationDisplayProps> = ({
  location,
  carTitle,
  className = '',
  showFullMap = false,
}) => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

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
  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `${carTitle ? `موقع ${carTitle}` : 'موقع السيارة'}\n${location.address}\nhttps://maps.google.com/?q=${location.lat},${location.lng}`,
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  // مشاركة عبر تيليجرام
  const shareOnTelegram = () => {
    const text = encodeURIComponent(
      `${carTitle ? `موقع ${carTitle}` : 'موقع السيارة'}\n${location.address}`,
    );
    const url = encodeURIComponent(`https://maps.google.com/?q=${location.lat},${location.lng}`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  // مشاركة عبر فيسبوك
  const shareOnFacebook = () => {
    const url = encodeURIComponent(`https://maps.google.com/?q=${location.lat},${location.lng}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setShowShareMenu(false);
  };

  // مشاركة عبر تويتر
  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `${carTitle ? `موقع ${carTitle}` : 'موقع السيارة'}\n${location.address}`,
    );
    const url = encodeURIComponent(`https://maps.google.com/?q=${location.lat},${location.lng}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShowShareMenu(false);
  };

  // مشاركة الموقع الأصلية
  const shareLocation = async () => {
    const shareData = {
      title: carTitle ? `موقع ${carTitle}` : 'موقع السيارة',
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

  // الحصول على رابط الخريطة الثابتة
  const getStaticMapUrl = () => {
    // استخدام خدمة خرائط مجانية أو إنشاء خريطة بسيطة
    // يمكن استخدام OpenStreetMap أو خدمة أخرى مجانية
    return `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01},${location.lat - 0.01},${location.lng + 0.01},${location.lat + 0.01}&layer=mapnik&marker=${location.lat},${location.lng}`;
  };

  // إنشاء خريطة بسيطة بدون API
  const createSimpleMap = () => {
    if (!mapRef.current) return;

    const mapContainer = mapRef.current;
    mapContainer.innerHTML = `
      <div class="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg relative overflow-hidden">
        <div class="absolute inset-0 bg-opacity-20 bg-blue-500" style="
          background-image: 
            radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
        "></div>
        
        <!-- Location Pin -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div class="bg-red-500 text-white p-3 rounded-full shadow-lg animate-pulse">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>

        <!-- Map Info -->
        <div class="absolute top-4 left-4 bg-white rounded-lg shadow-md p-2">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
            موقع السيارة
          </div>
        </div>

        <!-- Coordinates -->
        <div class="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
        </div>

        <!-- Click to open in maps -->
        <div class="absolute inset-0 cursor-pointer flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all">
          <div class="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm text-gray-700 opacity-0 hover:opacity-100 transition-opacity">
            انقر لفتح الخريطة
          </div>
        </div>
      </div>
    `;
  };

  useEffect(() => {
    if (isMapExpanded) {
      createSimpleMap();

      // إضافة حدث النقر على الخريطة
      const mapElement = mapRef.current;
      if (mapElement) {
        const clickHandler = () => {
          openInGoogleMaps();
        };
        mapElement.addEventListener('click', clickHandler);

        return () => {
          mapElement.removeEventListener('click', clickHandler);
        };
      }
    }
  }, [isMapExpanded, location]);

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
            {/* زر المشاركة مع القائمة المنبثقة */}
            <div className="relative" ref={shareMenuRef}>
              <button
                onClick={shareLocation}
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
                      onClick={shareOnWhatsApp}
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
                      onClick={shareOnTelegram}
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
                      onClick={shareOnFacebook}
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
                      onClick={shareOnTwitter}
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
                          `https://maps.google.com/?q=${location.lat},${location.lng}`,
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

            {/* زر عرض الخريطة */}
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
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarLocationDisplay;
