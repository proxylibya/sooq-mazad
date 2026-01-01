import React, { useState } from 'react';
import { Car } from '../../../types/car';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface SimpleMapProps {
  cars: Car[];
  selectedCar: Car | null;
  onCarSelect: (car: Car | null) => void;
  center: { lat: number; lng: number };
  zoom: number;
  className?: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  cars,
  selectedCar,
  onCarSelect,
  center,
  zoom,
  className = '',
}) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hoveredCar, setHoveredCar] = useState<Car | null>(null);

  // تحويل الإحداثيات الجغرافية إلى إحداثيات SVG
  const latLngToSVG = (lat: number, lng: number) => {
    // خريطة ليبيا التقريبية
    const libyaBounds = {
      north: 33.2,
      south: 19.5,
      east: 25.2,
      west: 9.3,
    };

    // أبعاد SVG
    const svgWidth = 800;
    const svgHeight = 600;

    // تحويل الإحداثيات
    const x = ((lng - libyaBounds.west) / (libyaBounds.east - libyaBounds.west)) * svgWidth;
    const y = ((libyaBounds.north - lat) / (libyaBounds.north - libyaBounds.south)) * svgHeight;

    return { x, y };
  };

  // معالج النقر على العلامة
  const handleMarkerClick = (car: Car) => {
    onCarSelect(selectedCar?.id === car.id ? null : car);
  };

  // معالج تبديل المفضلة
  const toggleFavorite = (carId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(carId)) {
        newFavorites.delete(carId);
      } else {
        newFavorites.add(carId);
      }
      return newFavorites;
    });
  };

  return (
    <div
      className={`relative h-full w-full bg-gradient-to-br from-blue-50 via-white to-green-50 ${className}`}
    >
      {/* الخريطة الأساسية */}
      <svg
        viewBox="0 0 800 600"
        className="h-full w-full rounded-lg border-2 border-blue-200"
        style={{ minHeight: '500px' }}
      >
        {/* خلفية الخريطة */}
        <rect width="800" height="600" fill="url(#mapGradient)" />

        {/* التدرجات */}
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EFF6FF" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F0FDF4" />
          </linearGradient>
        </defs>

        {/* شبكة الخطوط */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="0.5"
              opacity="0.4"
            />
          </pattern>
        </defs>
        <rect width="800" height="600" fill="url(#grid)" />

        {/* عنوان الخريطة */}
        <text x="400" y="40" textAnchor="middle" fontSize="28" fill="#1F2937" fontWeight="bold">
          خريطة ليبيا - السيارات المتاحة
        </text>

        {/* حدود ليبيا المبسطة */}
        <path
          d="M 150 150 Q 200 130 300 140 Q 400 150 500 160 Q 600 170 650 190 Q 700 210 720 250 Q 730 300 720 350 Q 700 400 650 430 Q 600 450 500 460 Q 400 470 300 460 Q 200 450 150 430 Q 100 400 90 350 Q 80 300 90 250 Q 100 200 150 150 Z"
          fill="rgba(59, 130, 246, 0.2)"
          stroke="rgba(59, 130, 246, 0.6)"
          strokeWidth="4"
        />

        {/* المدن الرئيسية */}
        <g className="cities">
          {/* طرابلس */}
          <circle cx="320" cy="230" r="6" fill="#1F2937" />
          <text x="330" y="235" fontSize="14" fill="#374151" fontWeight="bold">
            طرابلس
          </text>

          {/* بنغازي */}
          <circle cx="520" cy="250" r="5" fill="#1F2937" />
          <text x="530" y="255" fontSize="13" fill="#374151" fontWeight="bold">
            بنغازي
          </text>

          {/* مصراتة */}
          <circle cx="380" cy="240" r="4" fill="#1F2937" />
          <text x="390" y="245" fontSize="12" fill="#374151" fontWeight="bold">
            مصراتة
          </text>

          {/* سبها */}
          <circle cx="400" cy="350" r="3" fill="#1F2937" />
          <text x="410" y="355" fontSize="11" fill="#374151" fontWeight="bold">
            سبها
          </text>
        </g>

        {/* علامات السيارات */}
        <g className="car-markers">
          {cars.map((car) => {
            const svgPos = latLngToSVG(car.coordinates.lat, car.coordinates.lng);
            const isSelected = selectedCar?.id === car.id;
            const isHovered = hoveredCar?.id === car.id;

            return (
              <g key={car.id} className="car-marker-group">
                {/* دائرة النبضة للسيارة المحددة */}
                {isSelected && (
                  <circle
                    cx={svgPos.x}
                    cy={svgPos.y}
                    r="25"
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.6)"
                    strokeWidth="3"
                    className="animate-ping"
                  />
                )}

                {/* العلامة الرئيسية */}
                <g
                  className="transform cursor-pointer transition-all duration-200 hover:scale-125"
                  onClick={() => handleMarkerClick(car)}
                  onMouseEnter={() => setHoveredCar(car)}
                  onMouseLeave={() => setHoveredCar(null)}
                >
                  {/* ظل العلامة */}
                  <circle
                    cx={svgPos.x + 2}
                    cy={svgPos.y + 2}
                    r={isSelected || isHovered ? '16' : '14'}
                    fill="rgba(0, 0, 0, 0.3)"
                  />

                  {/* خلفية العلامة */}
                  <circle
                    cx={svgPos.x}
                    cy={svgPos.y}
                    r={isSelected || isHovered ? '16' : '14'}
                    fill={car.type === 'auction' ? '#DC2626' : '#059669'}
                    stroke="white"
                    strokeWidth="4"
                  />

                  {/* أيقونة السيارة */}
                  <foreignObject x={svgPos.x - 8} y={svgPos.y - 8} width="16" height="16">
                    <div className="flex h-full w-full items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0m-11 0a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0M17 5H7a1 1 0 00-1 1v9a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1z" />
                      </svg>
                    </div>
                  </foreignObject>

                  {/* شارة النوع */}
                  <circle
                    cx={svgPos.x + 12}
                    cy={svgPos.y - 12}
                    r="8"
                    fill={car.type === 'auction' ? '#FEE2E2' : '#D1FAE5'}
                    stroke={car.type === 'auction' ? '#DC2626' : '#059669'}
                    strokeWidth="2"
                  />
                  <text
                    x={svgPos.x + 12}
                    y={svgPos.y - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill={car.type === 'auction' ? '#DC2626' : '#059669'}
                    fontWeight="bold"
                  >
                    {car.type === 'auction' ? 'م' : 'س'}
                  </text>
                </g>

                {/* تسمية السعر */}
                {(isSelected || isHovered) && (
                  <g className="price-label">
                    <rect
                      x={svgPos.x - 40}
                      y={svgPos.y + 20}
                      width="80"
                      height="25"
                      rx="12"
                      fill="rgba(0, 0, 0, 0.8)"
                    />
                    <text
                      x={svgPos.x}
                      y={svgPos.y + 37}
                      textAnchor="middle"
                      fontSize="12"
                      fill="white"
                      fontWeight="bold"
                    >
                      {car.price.toLocaleString()} د.ل
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* معلومات الخريطة */}
      <div className="absolute left-4 top-4 rounded-lg border border-blue-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPinIcon className="h-5 w-5 text-blue-600" />
          <span>عرض {cars.length} سيارة</span>
        </div>
        <div className="mt-3 flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-600"></div>
            <span className="font-medium">
              مزاد ({cars.filter((c) => c.type === 'auction').length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-600"></div>
            <span className="font-medium">
              سوق فوري ({cars.filter((c) => c.type === 'marketplace').length})
            </span>
          </div>
        </div>
      </div>

      {/* نافذة تفاصيل السيارة المحددة */}
      {selectedCar && (
        <div className="absolute bottom-4 right-4 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          {/* رأس النافذة */}
          <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-50 to-green-50 p-4">
            <h3 className="font-bold text-gray-900">تفاصيل السيارة</h3>
            <button
              onClick={() => onCarSelect(null)}
              className="rounded-full p-1 transition-colors hover:bg-gray-200"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* محتوى النافذة */}
          <div className="p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{selectedCar.title}</h4>
                <p className="text-sm text-gray-600">
                  {selectedCar.year} • {selectedCar.mileage?.toLocaleString()} كم
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  selectedCar.type === 'auction'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {selectedCar.type === 'auction' ? 'مزاد' : 'سوق فوري'}
              </span>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-blue-600">
                {selectedCar.price.toLocaleString()} د.ل
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="ml-2 h-4 w-4" />
                {selectedCar.location}
              </div>
              <div className="flex items-center text-gray-600">
                <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {selectedCar.condition}
              </div>
              <div className="flex items-center text-gray-600">
                <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {selectedCar.transmission}
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="mt-4 flex items-center gap-2">
              <button className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700">
                عرض التفاصيل
              </button>
              <button
                onClick={(e) => toggleFavorite(selectedCar.id, e)}
                className="rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-50"
              >
                {favorites.has(selectedCar.id) ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              <button className="rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-50">
                <ShareIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMap;
