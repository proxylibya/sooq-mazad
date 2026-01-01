import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Car } from '../../../types/car';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import WrenchScrewdriverIcon from '@heroicons/react/24/outline/WrenchScrewdriverIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface InteractiveMapProps {
  cars: Car[];
  selectedCar: Car | null;
  onCarSelect: (car: Car | null) => void;
  center: { lat: number; lng: number };
  zoom: number;
  className?: string;
}

interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  car: Car;
  element?: HTMLDivElement;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  cars,
  selectedCar,
  onCarSelect,
  center,
  zoom,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hoveredCar, setHoveredCar] = useState<Car | null>(null);

  // إنشاء العلامات من بيانات السيارات
  useEffect(() => {
    const newMarkers: MapMarker[] = cars.map((car) => ({
      id: car.id,
      position: car.coordinates,
      car,
    }));
    setMarkers(newMarkers);
  }, [cars]);

  // تحويل الإحداثيات الجغرافية إلى إحداثيات SVG
  const latLngToSVG = useCallback((lat: number, lng: number) => {
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
  }, []);

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

  // رسم الخريطة الأساسية
  const renderLibyaMap = () => (
    <g>
      {/* خلفية الخريطة */}
      <rect width="800" height="600" fill="url(#mapGradient)" />

      {/* شبكة الخطوط */}
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path
            d="M 50 0 L 0 0 0 50"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="0.5"
            opacity="0.3"
          />
        </pattern>
        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0FDF4" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#grid)" />

      {/* حدود ليبيا المبسطة */}
      <path
        d="M 150 200 Q 200 180 300 190 Q 400 200 500 210 Q 600 220 650 240 Q 700 260 720 300 Q 730 350 720 400 Q 700 450 650 480 Q 600 500 500 510 Q 400 520 300 510 Q 200 500 150 480 Q 100 450 90 400 Q 80 350 90 300 Q 100 250 150 200 Z"
        fill="rgba(59, 130, 246, 0.15)"
        stroke="rgba(59, 130, 246, 0.5)"
        strokeWidth="3"
      />

      {/* عنوان الخريطة */}
      <text x="400" y="50" textAnchor="middle" fontSize="24" fill="#1F2937" className="font-bold">
        خريطة ليبيا
      </text>

      {/* المدن الرئيسية */}
      <g className="cities">
        {/* طرابلس */}
        <circle cx="320" cy="280" r="4" fill="#1F2937" />
        <text x="330" y="285" fontSize="12" fill="#374151" className="font-medium">
          طرابلس
        </text>

        {/* بنغازي */}
        <circle cx="520" cy="300" r="3" fill="#1F2937" />
        <text x="530" y="305" fontSize="11" fill="#374151">
          بنغازي
        </text>

        {/* مصراتة */}
        <circle cx="380" cy="290" r="2.5" fill="#1F2937" />
        <text x="390" y="295" fontSize="10" fill="#374151">
          مصراتة
        </text>

        {/* سبها */}
        <circle cx="400" cy="400" r="2" fill="#1F2937" />
        <text x="410" y="405" fontSize="9" fill="#374151">
          سبها
        </text>
      </g>
    </g>
  );

  // رسم علامات السيارات
  const renderCarMarkers = () => (
    <g className="car-markers">
      {markers.map((marker) => {
        const svgPos = latLngToSVG(marker.position.lat, marker.position.lng);
        const isSelected = selectedCar?.id === marker.id;
        const isHovered = hoveredCar?.id === marker.id;
        const isFavorite = favorites.has(marker.id);

        return (
          <g key={marker.id} className="car-marker-group">
            {/* دائرة النبضة للسيارة المحددة */}
            {isSelected && (
              <circle
                cx={svgPos.x}
                cy={svgPos.y}
                r="20"
                fill="none"
                stroke="rgba(59, 130, 246, 0.4)"
                strokeWidth="2"
                className="animate-ping"
              />
            )}

            {/* العلامة الرئيسية */}
            <g
              className="transform cursor-pointer transition-transform hover:scale-110"
              onClick={() => handleMarkerClick(marker.car)}
              onMouseEnter={() => setHoveredCar(marker.car)}
              onMouseLeave={() => setHoveredCar(null)}
            >
              {/* خلفية العلامة */}
              <circle
                cx={svgPos.x}
                cy={svgPos.y}
                r={isSelected || isHovered ? '12' : '10'}
                fill={marker.car.type === 'auction' ? '#DC2626' : '#059669'}
                stroke="white"
                strokeWidth="2"
                className="drop-shadow-md"
              />

              {/* أيقونة السيارة */}
              <foreignObject x={svgPos.x - 6} y={svgPos.y - 6} width="12" height="12">
                <div className="flex h-full w-full items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0m-11 0a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0M17 5H7a1 1 0 00-1 1v9a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1z" />
                  </svg>
                </div>
              </foreignObject>

              {/* شارة النوع */}
              <circle
                cx={svgPos.x + 8}
                cy={svgPos.y - 8}
                r="6"
                fill={marker.car.type === 'auction' ? '#FEE2E2' : '#D1FAE5'}
                stroke={marker.car.type === 'auction' ? '#DC2626' : '#059669'}
                strokeWidth="1"
              />
              <foreignObject x={svgPos.x + 2} y={svgPos.y - 14} width="12" height="12">
                <div className="flex h-full w-full items-center justify-center">
                  <span
                    className={`text-xs font-bold ${
                      marker.car.type === 'auction' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {marker.car.type === 'auction' ? 'م' : 'س'}
                  </span>
                </div>
              </foreignObject>
            </g>

            {/* تسمية السعر */}
            {(isSelected || isHovered) && (
              <g className="price-label">
                <rect
                  x={svgPos.x - 30}
                  y={svgPos.y + 15}
                  width="60"
                  height="20"
                  rx="10"
                  fill="rgba(0, 0, 0, 0.8)"
                />
                <text
                  x={svgPos.x}
                  y={svgPos.y + 28}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  className="font-medium"
                >
                  {marker.car.price.toLocaleString()} د.ل
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* الخريطة الأساسية */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="h-full w-full border border-gray-200"
        style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 50%, #F0FDF4 100%)',
          minHeight: '400px',
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        {renderLibyaMap()}
        {renderCarMarkers()}
      </svg>

      {/* معلومات الخريطة */}
      <div className="absolute left-4 top-4 rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm">
          <MapPinIcon className="h-4 w-4 text-blue-600" />
          <span className="font-medium">عرض {cars.length} سيارة</span>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-red-600"></div>
            <span>مزاد</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-600"></div>
            <span>سوق فوري</span>
          </div>
        </div>
      </div>

      {/* نافذة تفاصيل السيارة المحددة */}
      {selectedCar && (
        <div className="absolute bottom-4 right-4 w-80 overflow-hidden rounded-lg border bg-white shadow-xl">
          {/* رأس النافذة */}
          <div className="flex items-center justify-between border-b bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">تفاصيل السيارة</h3>
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
                <h4 className="text-lg font-semibold text-gray-900">{selectedCar.title}</h4>
                <p className="text-sm text-gray-600">
                  {selectedCar.year} • {selectedCar.mileage?.toLocaleString()} كم
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  selectedCar.type === 'auction'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {selectedCar.type === 'auction' ? 'مزاد' : 'سوق فوري'}
              </span>
            </div>

            <div className="mb-4">
              <span className="text-2xl font-bold text-blue-600">
                {selectedCar.price.toLocaleString()} د.ل
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="ml-2 h-4 w-4" />
                {selectedCar.location}
              </div>
              <div className="flex items-center text-gray-600">
                <span className="ml-2">
                  <WrenchScrewdriverIcon className="h-5 w-5" />
                </span>
                {selectedCar.condition}
              </div>
              <div className="flex items-center text-gray-600">
                <span className="ml-2">
                  <CogIcon className="h-5 w-5" />
                </span>
                {selectedCar.transmission}
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="mt-4 flex items-center gap-2">
              <button className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
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

export default InteractiveMap;
