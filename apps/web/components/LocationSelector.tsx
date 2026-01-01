import React, { useState } from 'react';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import CursorArrowRaysIcon from '@heroicons/react/24/outline/CursorArrowRaysIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import LocationPickerModal from './LocationPickerModal';
import SafeLeafletMap from './maps/SafeLeafletMap';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface LocationSelectorProps {
  selectedLocation?: LocationData;
  onLocationSelect: (location: LocationData) => void;
  className?: string;
  label?: string;
  placeholder?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onLocationSelect,
  className = '',
  label = 'موقع السيارة',
  placeholder = 'اضغط لتحديد الموقع من الخريطة أو GPS',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLocationSelect = (location: LocationData) => {
    onLocationSelect(location);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={`rounded-lg border border-gray-200 bg-gray-50 p-4 ${className}`}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-gray-600" />
            <h5 className="text-base font-semibold text-gray-900">{label}</h5>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
              اختياري
            </span>
          </div>
        </div>

        <p className="mb-4 text-sm text-gray-700">
          تحديد موقع السيارة يساعد المشترين في العثور عليها بسهولة
        </p>

        <div className="rounded-lg border border-white bg-white p-4 shadow-sm">
          {!selectedLocation ? (
            // حالة عدم تحديد الموقع
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="group relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 px-6 py-8 text-blue-800 transition-all duration-300 hover:border-blue-400 hover:bg-blue-100 hover:shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-200 opacity-0 transition-opacity duration-300 group-hover:opacity-50"></div>

              <div className="relative flex items-center gap-4">
                <div className="rounded-full bg-blue-200 p-3">
                  <CursorArrowRaysIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">تحديد موقع السيارة</div>
                  <div className="text-sm opacity-80">{placeholder}</div>
                </div>
              </div>
            </button>
          ) : (
            // حالة تحديد الموقع
            <div className="space-y-4">
              {/* معلومات الموقع المحدد */}
              <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-green-900">تم تحديد الموقع</h4>
                    <p className="mt-1 text-sm text-green-700">{selectedLocation.address}</p>
                    <p className="mt-1 text-xs text-green-600">
                      الإحداثيات: {selectedLocation.lat.toFixed(6)},{' '}
                      {selectedLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              {/* خريطة مصغرة */}
              <div className="overflow-hidden rounded-lg border border-gray-200">
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
                <SafeLeafletMap
                  latitude={selectedLocation.lat}
                  longitude={selectedLocation.lng}
                  address={selectedLocation.address}
                  height="128px"
                  zoom={14}
                  showMarker={true}
                  className="w-full"
                />
              </div>

              {/* زر التعديل */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-blue-800 transition-colors hover:bg-blue-100"
              >
                <PencilIcon className="h-4 w-4" />
                <span>تعديل الموقع</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <LocationPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={selectedLocation}
      />
    </>
  );
};

export default LocationSelector;
