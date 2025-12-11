// SimpleSpinner غير مستخدم - التصميم الموحد مباشر
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import React, { useEffect, useRef, useState } from 'react';

interface MapboxMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  height?: string;
  zoom?: number;
  showMarker?: boolean;
  className?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  latitude,
  longitude,
  address,
  height = '200px',
  zoom = 15,
  showMarker = true,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // تحميل Mapbox GL JS
    const loadMapbox = async () => {
      try {
        // تحقق من وجود Mapbox في النافذة
        if (!(window as any).mapboxgl) {
          // تحميل CSS
          const link = document.createElement('link');
          link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
          link.rel = 'stylesheet';
          document.head.appendChild(link);

          // تحميل JavaScript
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
          script.async = true;

          script.onload = () => {
            initializeMap();
          };

          script.onerror = () => {
            setMapError(true);
          };

          document.head.appendChild(script);
        } else {
          initializeMap();
        }
      } catch (error) {
        console.error('خطأ في تحميل Mapbox:', error);
        setMapError(true);
      }
    };

    const initializeMap = () => {
      if (!mapContainer.current) return;

      try {
        const mapboxgl = (window as any).mapboxgl;

        // استخدام OpenStreetMap كبديل مجاني
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors',
              },
            },
            layers: [
              {
                id: 'osm-tiles',
                type: 'raster',
                source: 'osm-tiles',
                minzoom: 0,
                maxzoom: 19,
              },
            ],
          },
          center: [longitude, latitude],
          zoom: zoom,
          attributionControl: true,
        });

        // إضافة علامة إذا كانت مطلوبة
        if (showMarker) {
          // إنشاء عنصر HTML مخصص للعلامة
          const markerElement = document.createElement('div');
          markerElement.innerHTML = `
            <div style="
              width: 32px;
              height: 32px;
              background: #dc2626;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid #fff;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            ">
              <div style="
                width: 12px;
                height: 12px;
                background: #fff;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          `;

          new mapboxgl.Marker(markerElement).setLngLat([longitude, latitude]).addTo(map.current);
        }

        map.current.on('load', () => {
          setMapLoaded(true);
        });

        map.current.on('error', () => {
          setMapError(true);
        });
      } catch (error) {
        console.error('خطأ في إنشاء الخريطة:', error);
        setMapError(true);
      }
    };

    loadMapbox();

    // تنظيف الخريطة عند إلغاء التحميل
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [latitude, longitude, zoom, showMarker]);

  if (mapError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="relative mx-auto mb-3 h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-75"></div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
              <MapPinIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-700">موقع السيارة</p>
          {address && <p className="text-xs text-gray-500">{address}</p>}
          <p className="mt-1 text-xs text-gray-400">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapContainer} className="h-full w-full rounded-lg" style={{ height: '100%' }} />

      {/* مؤشر تحميل موحد */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/90">
          <div
            className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
            style={{ width: 32, height: 32 }}
            role="status"
            aria-label="جاري تحميل الخريطة"
          />
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
