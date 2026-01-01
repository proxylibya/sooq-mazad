import React from 'react';
import {
  translateTransmission,
  translateFuelType,
  translateBodyType,
  translateCondition,
  formatMileage,
  formatYear,
} from '../utils/carTranslations';

interface CarInfoDisplayProps {
  car: {
    brand?: string;
    model?: string;
    year?: string | number;
    mileage?: string | number;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    color?: string;
    condition?: string;
    doors?: number;
  };
  layout?: 'compact' | 'detailed';
  showBadges?: boolean;
}

const CarInfoDisplay: React.FC<CarInfoDisplayProps> = ({
  car,
  layout = 'detailed',
  showBadges = false,
}) => {
  // دالة لتحديد لون المسافة المقطوعة
  const getMileageColor = (mileage: string | number | undefined): string => {
    if (!mileage) return 'text-gray-500';

    const numMileage = typeof mileage === 'string' ? parseInt(mileage) : mileage;
    if (isNaN(numMileage)) return 'text-gray-500';

    if (numMileage < 30000) return 'text-green-600';
    if (numMileage < 80000) return 'text-yellow-600';
    return 'text-red-600';
  };

  // دالة لتحديد لون حالة السيارة
  const getConditionColor = (condition: string | undefined): string => {
    if (!condition) return 'text-gray-500';

    const translatedCondition = translateCondition(condition);
    if (translatedCondition === 'جديد') return 'text-green-600';
    if (translatedCondition === 'مستعمل') return 'text-blue-600';
    return 'text-red-600';
  };

  if (layout === 'compact') {
    return (
      <div className="car-info-enhanced space-y-1">
        {/* السطر الأول: الماركة والموديل والسنة */}
        <div className="brand-model-display flex items-center gap-1">
          {car.brand && car.brand !== 'غير محدد' && (
            <span className="brand font-semibold text-blue-600">{car.brand}</span>
          )}
          {car.model && car.model !== 'غير محدد' && (
            <>
              {car.brand && car.brand !== 'غير محدد' && <span className="text-gray-400">-</span>}
              <span className="model font-medium">{car.model}</span>
            </>
          )}
          {car.year && car.year !== 'غير محدد' && (
            <>
              {((car.brand && car.brand !== 'غير محدد') ||
                (car.model && car.model !== 'غير محدد')) && (
                <span className="text-gray-400">-</span>
              )}
              <span className="year text-gray-600">{formatYear(car.year)}</span>
            </>
          )}
        </div>

        {/* السطر الثاني: المواصفات الأساسية */}
        <div className="specs-display text-xs">
          {car.mileage && car.mileage !== 'غير محدد' && (
            <span className={`mileage-display ${getMileageColor(car.mileage)}`}>
              {formatMileage(car.mileage)}
            </span>
          )}
          {car.transmission && car.transmission !== 'غير محدد' && (
            <>
              {car.mileage && car.mileage !== 'غير محدد' && (
                <span className="text-gray-400">•</span>
              )}
              <span className="text-gray-700">{translateTransmission(car.transmission)}</span>
            </>
          )}
          {car.condition && car.condition !== 'غير محدد' && (
            <>
              {((car.mileage && car.mileage !== 'غير محدد') ||
                (car.transmission && car.transmission !== 'غير محدد')) && (
                <span className="text-gray-400">•</span>
              )}
              <span className={getConditionColor(car.condition)}>
                {translateCondition(car.condition)}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="car-info-enhanced space-y-2">
      {/* السطر الأول: الماركة والموديل والسنة */}
      <div className="brand-model-display flex items-center gap-2 font-medium text-gray-800">
        {car.brand && car.brand !== 'غير محدد' && (
          <span className="brand text-blue-600">{car.brand}</span>
        )}
        {car.model && car.model !== 'غير محدد' && (
          <>
            {car.brand && car.brand !== 'غير محدد' && <span className="text-gray-500">-</span>}
            <span className="model">{car.model}</span>
          </>
        )}
        {car.year && car.year !== 'غير محدد' && (
          <>
            {((car.brand && car.brand !== 'غير محدد') ||
              (car.model && car.model !== 'غير محدد')) && <span className="text-gray-500">-</span>}
            <span className="year text-gray-600">{formatYear(car.year)}</span>
          </>
        )}
      </div>

      {/* السطر الثاني: المسافة وناقل الحركة والحالة */}
      <div className="car-info-row text-xs">
        {car.mileage && car.mileage !== 'غير محدد' && car.mileage !== '0 كم' && (
          <span className={`mileage-display font-semibold ${getMileageColor(car.mileage)}`}>
            {formatMileage(car.mileage)}
          </span>
        )}
        {car.transmission && car.transmission !== 'غير محدد' && (
          <>
            {car.mileage && car.mileage !== 'غير محدد' && car.mileage !== '0 كم' && (
              <span className="car-info-separator">-</span>
            )}
            {showBadges ? (
              <span
                className={`transmission-badge ${car.transmission === 'أوتوماتيك' ? 'automatic' : 'manual'}`}
              >
                {translateTransmission(car.transmission)}
              </span>
            ) : (
              <span className="text-gray-700">{translateTransmission(car.transmission)}</span>
            )}
          </>
        )}
        {car.condition && car.condition !== 'غير محدد' && (
          <>
            {((car.mileage && car.mileage !== 'غير محدد' && car.mileage !== '0 كم') ||
              (car.transmission && car.transmission !== 'غير محدد')) && (
              <span className="car-info-separator">-</span>
            )}
            {showBadges ? (
              <span
                className={`condition-badge ${translateCondition(car.condition).toLowerCase().replace(' ', '-')}`}
              >
                {translateCondition(car.condition)}
              </span>
            ) : (
              <span className={getConditionColor(car.condition)}>
                {translateCondition(car.condition)}
              </span>
            )}
          </>
        )}
      </div>

      {/* السطر الثالث: نوع الوقود ونوع الهيكل واللون */}
      <div className="car-info-row text-xs text-gray-500">
        {car.fuelType && car.fuelType !== 'غير محدد' && (
          <>
            {showBadges ? (
              <span className={`fuel-type-badge ${car.fuelType.toLowerCase()}`}>
                {translateFuelType(car.fuelType)}
              </span>
            ) : (
              <span>{translateFuelType(car.fuelType)}</span>
            )}
          </>
        )}
        {car.bodyType && car.bodyType !== 'غير محدد' && (
          <>
            {car.fuelType && car.fuelType !== 'غير محدد' && (
              <span className="car-info-separator">-</span>
            )}
            <span>{translateBodyType(car.bodyType)}</span>
          </>
        )}
        {car.color && car.color !== 'غير محدد' && (
          <>
            {((car.fuelType && car.fuelType !== 'غير محدد') ||
              (car.bodyType && car.bodyType !== 'غير محدد')) && (
              <span className="car-info-separator">-</span>
            )}
            <span>{car.color}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default CarInfoDisplay;
