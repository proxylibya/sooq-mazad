// SimpleSpinner غير مستخدم - التصميم الموحد مباشر
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import React, { useEffect, useRef, useState } from 'react';

interface SafeLeafletMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  height?: string;
  zoom?: number;
  showMarker?: boolean;
  className?: string;
}

const SafeLeafletMap: React.FC<SafeLeafletMapProps> = ({
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
  const marker = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // تنظيف آمن للخريطة
  const cleanupMap = () => {
    try {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.off();
        map.current.remove();
        map.current = null;
      }
    } catch (error) {
      console.warn('تحذير في تنظيف الخريطة:', error);
    }
  };

  // تهيئة الخريطة مرة واحدة فقط
  useEffect(() => {
    if (isInitializing || map.current) return;

    const loadLeaflet = async () => {
      setIsInitializing(true);

      try {
        // تحقق من وجود Leaflet في النافذة
        if (!(window as any).L) {
          // تحميل CSS
          const link = document.createElement('link');
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.rel = 'stylesheet';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);

          // تحميل JavaScript
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.async = true;

          script.onload = () => {
            initializeMap();
          };

          script.onerror = () => {
            setMapError(true);
            setIsInitializing(false);
          };

          document.head.appendChild(script);
        } else {
          initializeMap();
        }
      } catch (error) {
        console.error('خطأ في تحميل Leaflet:', error);
        setMapError(true);
        setIsInitializing(false);
      }
    };

    const initializeMap = () => {
      if (!mapContainer.current || map.current) {
        setIsInitializing(false);
        return;
      }

      try {
        const L = (window as any).L;
        if (!L) {
          console.error('Leaflet library not loaded');
          setMapError(true);
          setIsInitializing(false);
          return;
        }

        // إنشاء الخريطة
        map.current = L.map(mapContainer.current, {
          center: [latitude, longitude],
          zoom: zoom,
          zoomControl: true,
          attributionControl: true,
          preferCanvas: true, // تحسين الأداء
        });

        // إضافة طبقة OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map.current);

        // تعيين حدث التحميل
        map.current.whenReady(() => {
          setMapLoaded(true);
          setIsInitializing(false);

          // إضافة تأخير قصير لضمان استقرار DOM
          setTimeout(() => {
            if (map.current && map.current.getContainer()) {
              try {
                map.current.invalidateSize();
              } catch (error) {
                console.warn('تحذير: لا يمكن تحديث حجم الخريطة:', error);
              }
            }
          }, 100);
        });
      } catch (error) {
        console.error('خطأ في إنشاء الخريطة:', error);
        setMapError(true);
        setIsInitializing(false);
      }
    };

    loadLeaflet();

    // تنظيف عند إلغاء التحميل
    return () => {
      cleanupMap();
    };
  }, []);

  // تحديث الخريطة عند تغيير الخصائص
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    try {
      const L = (window as any).L;
      if (!L) return;

      // تحديث المركز والتكبير
      map.current.setView([latitude, longitude], zoom);

      // إزالة العلامة القديمة
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }

      // إضافة علامة جديدة إذا كانت مطلوبة
      if (showMarker) {
        const customIcon = L.divIcon({
          html: `
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
          `,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        marker.current = L.marker([latitude, longitude], { icon: customIcon })
          .addTo(map.current)
          .bindPopup(address || 'موقع السيارة');
      }
    } catch (error) {
      console.error('خطأ في تحديث الخريطة:', error);
    }
  }, [latitude, longitude, zoom, showMarker, address, mapLoaded]);

  if (mapError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <MapPinIcon className="mx-auto mb-2 h-8 w-8 text-red-600" />
          <p className="text-sm font-medium text-red-800">خطأ في تحميل الخريطة</p>
          <p className="text-xs text-red-600">يرجى المحاولة مرة أخرى</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapContainer} className="h-full w-full rounded-lg" style={{ height: '100%' }} />

      {/* مؤشر تحميل موحد */}
      {(!mapLoaded || isInitializing) && (
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

export default SafeLeafletMap;
