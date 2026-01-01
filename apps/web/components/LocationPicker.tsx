import { CursorArrowRaysIcon } from '@heroicons/react/24/outline';

import React, { useState, useEffect } from 'react';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PaperAirplaneIcon from '@heroicons/react/24/outline/PaperAirplaneIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import {
  DEFAULT_GEOLOCATION_CONFIG,
  LIBYA_GEOLOCATION_CONFIG,
  FAST_GEOLOCATION_CONFIG,
  getAttemptOptions,
  getAccuracyLevel,
  formatErrorMessage,
  formatLocationAddress,
  getLocationQuickly,
} from '../utils/geolocationConfig';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  name?: string;
}

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSendLocation: (location: LocationData) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ isOpen, onClose, onSendLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

  // الحصول على الموقع بسرعة (الوضع السريع)
  const getLocationFast = () => {
    setIsLoadingLocation(true);

    getLocationQuickly(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`الموقع السريع: ${latitude}, ${longitude} (دقة: ${Math.round(accuracy)} متر)`);

        try {
          const address = await reverseGeocode(latitude, longitude);
          const config = {
            ...DEFAULT_GEOLOCATION_CONFIG,
            ...FAST_GEOLOCATION_CONFIG,
          };
          const location: LocationData = {
            lat: latitude,
            lng: longitude,
            address: formatLocationAddress(address || 'الموقع الحالي', accuracy, config),
            name: 'موقعي الحالي (سريع)',
          };
          setCurrentLocation(location);
          setIsLoadingLocation(false);
        } catch (error) {
          console.error('خطأ في تحويل الإحداثيات:', error);
          const location: LocationData = {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (دقة: ${Math.round(accuracy)}م)`,
            name: 'موقعي الحالي (سريع)',
          };
          setCurrentLocation(location);
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error(
          '<XCircleIcon className="w-5 h-5 text-red-500" /> فشل في الحصول على الموقع بسرعة:',
          error,
        );
        setIsLoadingLocation(false);
        const config = {
          ...DEFAULT_GEOLOCATION_CONFIG,
          ...FAST_GEOLOCATION_CONFIG,
        };
        const errorMessage = formatErrorMessage(error, 1, 1, config);
        alert(errorMessage);
      },
      true, // استخدام الوضع السريع
    );
  };

  // الحصول على الموقع الحالي مع آلية إعادة المحاولة المحسنة (الوضع الدقيق)
  const getCurrentLocation = (attempt = 1, maxAttempts?: number) => {
    // استخدام التكوين المحسن لليبيا
    const config = {
      ...DEFAULT_GEOLOCATION_CONFIG,
      ...LIBYA_GEOLOCATION_CONFIG,
    };
    const finalMaxAttempts = maxAttempts || config.retry.maxAttempts;

    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      // الحصول على إعدادات المحاولة الحالية
      const options = getAttemptOptions(attempt, finalMaxAttempts, config);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          console.log(
            `المحاولة ${attempt}: ${latitude}, ${longitude} (دقة: ${Math.round(accuracy)} متر)`,
          );

          // تحديد مستوى الدقة
          const accuracyInfo = getAccuracyLevel(accuracy, config);

          // إذا كانت الدقة غير مقبولة وما زال لدينا محاولات
          if (accuracyInfo.level === 'poor' && attempt < finalMaxAttempts) {
            console.log(`دقة منخفضة (${Math.round(accuracy)}م)، إعادة المحاولة...`);
            setTimeout(
              () => getCurrentLocation(attempt + 1, finalMaxAttempts),
              config.retry.delayBetweenAttempts,
            );
            return;
          }

          // محاولة الحصول على العنوان من الإحداثيات
          try {
            const address = await reverseGeocode(latitude, longitude);
            const location: LocationData = {
              lat: latitude,
              lng: longitude,
              address: formatLocationAddress(address || 'الموقع الحالي', accuracy, config),
              name: 'موقعي الحالي',
            };
            setCurrentLocation(location);
            setSelectedLocation(location);
          } catch (error) {
            const location: LocationData = {
              lat: latitude,
              lng: longitude,
              address: formatLocationAddress('الموقع الحالي', accuracy, config),
              name: 'موقعي الحالي',
            };
            setCurrentLocation(location);
            setSelectedLocation(location);
          }
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error(`خطأ في المحاولة ${attempt}:`, error);

          // إعادة المحاولة في حالة timeout أو position unavailable
          if (
            attempt < finalMaxAttempts &&
            (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)
          ) {
            setTimeout(
              () => getCurrentLocation(attempt + 1, finalMaxAttempts),
              config.retry.delayBetweenAttempts,
            );
            return;
          }

          setIsLoadingLocation(false);
          const errorMessage = formatErrorMessage(error, attempt, finalMaxAttempts, config);
          alert(errorMessage);
        },
        options,
      );
    } else {
      setIsLoadingLocation(false);
      alert('المتصفح لا يدعم خدمة الموقع');
    }
  };

  // البحث عن المواقع
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // مواقع ليبية شائعة للمحاكاة
    const libyanLocations: LocationData[] = [
      {
        lat: 32.8872,
        lng: 13.1913,
        address: 'طرابلس، ليبيا',
        name: 'طرابلس',
      },
      {
        lat: 32.1165,
        lng: 20.0686,
        address: 'بنغازي، ليبيا',
        name: 'بنغازي',
      },
      {
        lat: 32.6396,
        lng: 21.7587,
        address: 'مصراتة، ليبيا',
        name: 'مصراتة',
      },
      {
        lat: 31.2089,
        lng: 16.5887,
        address: 'سبها، ليبيا',
        name: 'سبها',
      },
      {
        lat: 32.7569,
        lng: 22.6503,
        address: 'الزاوية، ليبيا',
        name: 'الزاوية',
      },
    ];

    const filtered = libyanLocations.filter(
      (location) =>
        location.name?.toLowerCase().includes(query.toLowerCase()) ||
        location.address.toLowerCase().includes(query.toLowerCase()),
    );

    setSearchResults(filtered);
  };

  // تحويل الإحداثيات إلى عنوان
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // في التطبيق الحقيقي، ستستخدم خدمة geocoding حقيقية
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  // إرسال الموقع
  const handleSendLocation = () => {
    if (selectedLocation) {
      onSendLocation(selectedLocation);
      onClose();
    }
  };

  // تأثير البحث
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // الحصول على الموقع الحالي عند فتح النافذة (بسرعة)
  useEffect(() => {
    if (isOpen && !currentLocation) {
      getLocationFast(); // استخدام الوضع السريع بدلاً من البطيء
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">إرسال الموقع</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 transition-colors hover:bg-white hover:bg-opacity-20"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-96 flex-col">
          {/* Search Bar */}
          <div className="border-b border-gray-200 p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن موقع..."
                className="w-full rounded-xl border border-gray-300 py-3 pl-4 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Current Location */}
          <div className="border-b border-gray-200 p-4">
            <div className="space-y-2">
              {/* زر الحصول على الموقع بسرعة */}
              <button
                onClick={getLocationFast}
                disabled={isLoadingLocation}
                className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all ${
                  selectedLocation?.name?.includes('سريع')
                    ? 'border-2 border-green-500 bg-green-50'
                    : 'border border-green-200 bg-green-50 hover:bg-green-100'
                }`}
              >
                {isLoadingLocation ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin text-green-500" />
                ) : (
                  <CursorArrowRaysIcon className="h-5 w-5 text-green-500" />
                )}
                <div className="flex-1 text-right">
                  <div className="font-medium text-gray-900">موقعي الحالي (سريع)</div>
                  <div className="text-sm text-green-600">الحصول على الموقع فوراً</div>
                </div>
              </button>

              {/* زر الحصول على الموقع بدقة */}
              <button
                onClick={() => getCurrentLocation()}
                disabled={isLoadingLocation}
                className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all ${
                  selectedLocation?.name === 'موقعي الحالي'
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : 'border border-blue-200 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                {isLoadingLocation ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
                ) : (
                  <MapPinIcon className="h-5 w-5 text-blue-500" />
                )}
                <div className="flex-1 text-right">
                  <div className="font-medium text-gray-900">موقعي الحالي (دقيق)</div>
                  <div className="text-sm text-blue-600">الحصول على الموقع بأعلى دقة</div>
                </div>
              </button>

              {/* عرض الموقع الحالي إذا تم تحديده */}
              {currentLocation && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-sm text-gray-600">{currentLocation.address}</div>
                </div>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-2 p-4">
                <h4 className="mb-3 text-sm font-medium text-gray-700">نتائج البحث</h4>
                {searchResults.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedLocation(location)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-right transition-all ${
                      selectedLocation?.lat === location.lat &&
                      selectedLocation?.lng === location.lng
                        ? 'border-2 border-blue-500 bg-blue-50'
                        : 'border border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <GlobeAltIcon className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{location.name}</div>
                      <div className="text-sm text-gray-500">{location.address}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-4 text-center text-gray-500">
                <GlobeAltIcon className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                <p>لا توجد نتائج للبحث &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <GlobeAltIcon className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                <p>ابحث عن موقع أو استخدم موقعك الحالي</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {selectedLocation && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700">الموقع المحدد:</div>
              <div className="text-sm text-gray-600">{selectedLocation.address}</div>
            </div>
            <button
              onClick={handleSendLocation}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              إرسال الموقع
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
