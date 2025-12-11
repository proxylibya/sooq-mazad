import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import CursorArrowRaysIcon from '@heroicons/react/24/outline/CursorArrowRaysIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React, { useEffect, useState } from 'react';
import { libyanCities } from '../data/libyan-cities';
import {
  DEFAULT_GEOLOCATION_CONFIG,
  FAST_GEOLOCATION_CONFIG,
  LIBYA_GEOLOCATION_CONFIG,
  formatErrorMessage,
  formatLocationAddress,
  getAccuracyLevel,
  getAttemptOptions,
  getLocationQuickly,
} from '../utils/geolocationConfig';
import LeafletMap from './maps/LeafletMap';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
  currentLocation?: LocationData;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  currentLocation,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    currentLocation || null,
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [_showMap, setShowMap] = useState(false);

  // تحديث الموقع المحدد عند تغيير currentLocation
  useEffect(() => {
    if (currentLocation) {
      setSelectedLocation(currentLocation);
    }
  }, [currentLocation]);

  // تحويل الإحداثيات إلى عنوان باستخدام Reverse Geocoding
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // أولاً، نحاول العثور على أقرب مدينة ليبية
    const findNearestLibyanCity = (lat: number, lng: number) => {
      let nearestCity = null;
      let minDistance = Infinity;

      libyanCities.forEach((city) => {
        if (city.coordinates) {
          // حساب المسافة التقريبية
          const distance = Math.sqrt(
            Math.pow(lat - city.coordinates.lat, 2) + Math.pow(lng - city.coordinates.lng, 2),
          );

          if (distance < minDistance) {
            minDistance = distance;
            nearestCity = city;
          }
        }
      });

      // إذا كانت المسافة أقل من 0.5 درجة (حوالي 55 كم)
      if (nearestCity && minDistance < 0.5) {
        return `${nearestCity.name}, ${nearestCity.region}, ليبيا`;
      }

      return null;
    };

    // محاولة العثور على أقرب مدينة ليبية أولاً
    const nearestCity = findNearestLibyanCity(lat, lng);
    if (nearestCity) {
      return nearestCity;
    }

    try {
      // استخدام API داخلي (Proxy) لتجاوز قيود CSP
      const response = await fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}&lang=ar&zoom=10`);

      if (response.ok) {
        const data = await response.json();

        // استخراج العنوان بالعربية إذا كان متاحاً
        if (data.display_name) {
          const address = data.display_name;

          // تنظيف العنوان وتحسينه للمواقع الليبية
          if (address.includes('Libya') || address.includes('ليبيا')) {
            const parts = address.split(',').map((part) => part.trim());

            // البحث عن اسم المدينة في قائمة المدن الليبية
            const libyanCity = libyanCities.find((city) =>
              parts.some(
                (part) =>
                  part.toLowerCase().includes(city.name.toLowerCase()) ||
                  city.name.toLowerCase().includes(part.toLowerCase()),
              ),
            );

            if (libyanCity) {
              return `${libyanCity.name}, ${libyanCity.region}, ليبيا`;
            }

            // إذا لم نجد مدينة محددة، نحاول استخراج المنطقة
            const relevantParts = parts
              .filter(
                (part) =>
                  !part.toLowerCase().includes('libya') &&
                  !part.toLowerCase().includes('ليبيا') &&
                  part.length > 2,
              )
              .slice(0, 3);

            if (relevantParts.length > 0) {
              return `${relevantParts.join(', ')}, ليبيا`;
            }
          }

          return address;
        }
      }
    } catch (error) {
      console.error('خطأ في تحويل الإحداثيات إلى عنوان:', error);
    }

    // في حالة فشل جميع الخدمات، إرجاع الإحداثيات مع تحديد المنطقة التقريبية
    const region = lat > 32 ? 'شمال ليبيا' : lat > 27 ? 'وسط ليبيا' : 'جنوب ليبيا';
    return `${lat.toFixed(4)}, ${lng.toFixed(4)} (${region})`;
  };

  // الحصول على الموقع بسرعة (الوضع السريع)
  const getLocationFast = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    getLocationQuickly(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log(`الموقع السريع: ${lat}, ${lng} (دقة: ${Math.round(accuracy)} متر)`);

        // تحويل الإحداثيات إلى عنوان
        const address = await reverseGeocode(lat, lng);
        const config = {
          ...DEFAULT_GEOLOCATION_CONFIG,
          ...FAST_GEOLOCATION_CONFIG,
        };

        const location: LocationData = {
          lat,
          lng,
          address: formatLocationAddress(address, accuracy, config),
        };

        setSelectedLocation(location);
        setIsLoadingLocation(false);
        setShowMap(true);
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
        setLocationError(errorMessage);
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
    setLocationError(null);

    if (navigator.geolocation) {
      // الحصول على إعدادات المحاولة الحالية
      const options = getAttemptOptions(attempt, finalMaxAttempts, config);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          console.log(`المحاولة ${attempt}: ${lat}, ${lng} (دقة: ${Math.round(accuracy)} متر)`);

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

          // تحويل الإحداثيات إلى عنوان
          const address = await reverseGeocode(lat, lng);

          const location: LocationData = {
            lat,
            lng,
            address: formatLocationAddress(address, accuracy, config),
          };

          setSelectedLocation(location);
          setIsLoadingLocation(false);
          setShowMap(true); // إظهار الخريطة بعد تحديد الموقع
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
          setLocationError(errorMessage);
        },
        options,
      );
    } else {
      setIsLoadingLocation(false);
      alert('متصفحك لا يدعم خدمات الموقع.');
    }
  };

  // معالجة النقر على الخريطة
  const handleMapClick = async (lat: number, lng: number) => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      // تحويل الإحداثيات إلى عنوان
      const address = await reverseGeocode(lat, lng);

      const location: LocationData = {
        lat,
        lng,
        address,
      };

      setSelectedLocation(location);
      setShowMap(true);
    } catch (error) {
      console.error('خطأ في تحديد الموقع:', error);
      setLocationError('حدث خطأ في تحديد الموقع');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // تأكيد اختيار الموقع
  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" dir="rtl">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative max-h-[80vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-xl">
          {/* رأس النافذة */}
          <div className="flex items-center justify-between border-b border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-1.5">
                <MapPinIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">تحديد موقع السيارة</h2>
                <p className="text-xs text-gray-600">اختر الموقع من الخريطة أو استخدم GPS</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* محتوى النافذة */}
          <div className="p-3">
            {/* التخطيط الجديد: قسمين جانبيين */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* القسم الأيسر: أزرار GPS والحالة */}
              <div className="space-y-3">
                {/* أزرار الحصول على الموقع */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">خيارات GPS</h3>
                  <div className="space-y-2">
                    <button
                      onClick={getLocationFast}
                      disabled={isLoadingLocation}
                      className="flex w-full items-center justify-start gap-3 rounded-lg border-2 border-dashed border-green-300 bg-green-50 px-4 py-3 text-green-800 transition-all hover:border-green-400 hover:bg-green-100 disabled:opacity-50"
                    >
                      <CursorArrowRaysIcon className="h-5 w-5" />
                      <div className="text-right">
                        <div className="text-sm font-semibold">الموقع السريع</div>
                        <div className="text-xs opacity-80">GPS سريع</div>
                      </div>
                    </button>

                    <button
                      onClick={() => getCurrentLocation()}
                      disabled={isLoadingLocation}
                      className="flex w-full items-center justify-start gap-3 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-blue-800 transition-all hover:border-blue-400 hover:bg-blue-100 disabled:opacity-50"
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                      <div className="text-right">
                        <div className="text-sm font-semibold">الموقع الدقيق</div>
                        <div className="text-xs opacity-80">GPS دقيق</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* رسالة الخطأ */}
                {locationError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-2">
                    <p className="text-xs text-red-800">{locationError}</p>
                  </div>
                )}

                {/* حالة التحميل - تصميم موحد */}
                {isLoadingLocation && (
                  <div className="flex items-center justify-center rounded-lg bg-white/90 p-3">
                    <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 32, height: 32 }}
                      role="status"
                      aria-label="جاري تحديد الموقع"
                    />
                  </div>
                )}

                {/* معلومات الموقع المحدد */}
                {selectedLocation && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-2">
                    <div className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-green-900">تم تحديد الموقع</h4>
                        <p className="mt-1 text-xs text-green-700">{selectedLocation.address}</p>
                        <p className="mt-1 text-xs text-green-600">
                          الإحداثيات: {selectedLocation.lat.toFixed(6)},{' '}
                          {selectedLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* القسم الأيمن: الخريطة */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">اختر الموقع من الخريطة</h3>
                </div>
                <p className="mb-2 text-xs text-gray-600">انقر على الخريطة لتحديد الموقع المطلوب</p>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <LeafletMap
                    latitude={selectedLocation?.lat || 26.3351}
                    longitude={selectedLocation?.lng || 17.2283}
                    address={selectedLocation?.address}
                    height="250px"
                    zoom={selectedLocation ? 15 : 6}
                    showMarker={!!selectedLocation}
                    onMapClick={handleMapClick}
                    interactive={true}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-200 p-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedLocation}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              تأكيد الموقع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
