/**
 * مكون تحديد موقع السيارة على الخريطة - قسم موحد
 * Location Picker Section Component - Unified section for admin pages
 * يفتح قائمة منبثقة مع خريطة تفاعلية عند النقر
 */

import { CursorArrowRaysIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import LocationPickerModal from './LocationPickerModal';

export interface LocationData {
  coordinates?: { lat: number; lng: number };
  detailedAddress?: string;
}

interface LocationPickerSectionProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  title?: string;
  description?: string;
  isOptional?: boolean;
}

export default function LocationPickerSection({
  value,
  onChange,
  title = 'موقع السيارة على الخريطة',
  description = 'تحديد موقع السيارة الدقيق يساعد المشترين في العثور عليها بسهولة',
  isOptional = true,
}: LocationPickerSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // فتح القائمة المنبثقة مع الخريطة
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // تأكيد الموقع من الخريطة
  const handleConfirmLocation = (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    onChange({
      coordinates: {
        lat: location.latitude,
        lng: location.longitude,
      },
      detailedAddress: location.address || value.detailedAddress || '',
    });
  };

  // إزالة الموقع
  const handleClearLocation = () => {
    onChange({
      coordinates: undefined,
      detailedAddress: '',
    });
  };

  // تحديث العنوان
  const handleAddressChange = (address: string) => {
    onChange({
      ...value,
      detailedAddress: address,
    });
  };

  return (
    <div className="mt-4 md:col-span-2">
      <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
        {/* رأس القسم */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-slate-400" />
            <h5 className="text-sm font-semibold text-white">{title}</h5>
            {isOptional && (
              <span className="rounded-full bg-slate-600 px-2 py-0.5 text-xs text-slate-300">
                اختياري
              </span>
            )}
          </div>
          {value.coordinates && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
              إزالة الموقع
            </button>
          )}
        </div>

        {/* الوصف */}
        <p className="mb-3 text-xs text-slate-400">{description}</p>

        {/* محتوى القسم */}
        <div className="rounded-xl border border-slate-600 bg-slate-800 p-3 shadow-sm">
          {!value.coordinates ? (
            /* زر فتح الخريطة */
            <button
              type="button"
              onClick={handleOpenModal}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-500/50 bg-blue-500/10 px-4 py-4 text-blue-400 transition-all duration-300 hover:border-blue-400 hover:bg-blue-500/20 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-500/20 p-2.5">
                  <CursorArrowRaysIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">تحديد موقع السيارة</div>
                  <div className="text-xs opacity-80">افتح الخريطة لتحديد الموقع بدقة</div>
                </div>
              </div>
            </button>
          ) : (
            /* عرض الموقع المحدد */
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 p-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-emerald-500/20 p-1.5">
                    <MapPinIcon className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-400">تم تحديد الموقع</p>
                    <p className="text-xs text-slate-400" dir="ltr">
                      {value.coordinates.lat.toFixed(6)}, {value.coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  تعديل الموقع
                </button>
              </div>

              {/* حقل العنوان التفصيلي */}
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  العنوان التفصيلي (اختياري)
                </label>
                <input
                  type="text"
                  value={value.detailedAddress || ''}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="مثال: شارع الجمهورية، بجانب محطة الوقود"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* القائمة المنبثقة مع الخريطة */}
      <LocationPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmLocation}
        initialLocation={
          value.coordinates
            ? {
                latitude: value.coordinates.lat,
                longitude: value.coordinates.lng,
                address: value.detailedAddress,
              }
            : undefined
        }
        title={title}
      />
    </div>
  );
}
