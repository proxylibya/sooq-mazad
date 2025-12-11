// SimpleSpinner غير مستخدم - التصميم الموحد مباشر
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import React, { useEffect, useRef, useState } from 'react';
import {
  safeAddMarker,
  safeInvalidateSize,
  safeMapCleanup,
  safeSetView,
  setupMapSafely,
} from '../../utils/leafletHelpers';

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  height?: string;
  zoom?: number;
  showMarker?: boolean;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  latitude,
  longitude,
  address,
  height = '200px',
  zoom = 15,
  showMarker = true,
  className = '',
  onMapClick,
  interactive = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const loadLeaflet = async () => {
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
          };

          document.head.appendChild(script);
        } else {
          initializeMap();
        }
      } catch (error) {
        console.error('خطأ في تحميل Leaflet:', error);
        setMapError(true);
      }
    };

    const initializeMap = () => {
      if (!mapContainer.current || map.current) return;

      try {
        const L = (window as any).L;
        if (!L) {
          console.error('Leaflet library not loaded');
          setMapError(true);
          return;
        }

        // التأكد من أن العنصر جاهز
        if (!mapContainer.current.offsetParent && mapContainer.current.style.display !== 'block') {
          console.warn('Map container not visible, delaying initialization');
          setTimeout(initializeMap, 100);
          return;
        }

        // إنشاء الخريطة مع معالجة أفضل للأخطاء
        map.current = setupMapSafely(mapContainer.current, L, {
          center: [latitude, longitude],
          zoom: zoom,
          zoomControl: true,
          attributionControl: true,
        });

        if (!map.current) {
          setMapError(true);
          return;
        }

        // ملاحظة: سيتم إضافة طبقة البلاط والمؤشر وأحداث النقر عند جاهزية الخريطة داخل whenReady

        // تعيين حدث التحميل
        map.current.whenReady(() => {
          try {
            // إضافة طبقة OpenStreetMap بعد جاهزية الخريطة لضمان الظهور
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
            }).addTo(map.current);

            // إضافة المؤشر إن لزم
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

              L.marker([latitude, longitude], { icon: customIcon })
                .addTo(map.current)
                .bindPopup(address || 'موقع السيارة');
            }

            // تفعيل حدث النقر إذا كان تفاعلياً
            if (interactive && onMapClick) {
              map.current.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                onMapClick(lat, lng);
              });
            }
          } catch (layerError) {
            console.error('خطأ في إضافة طبقة البلاط أو المؤشر:', layerError);
          }

          // إضافة تأخير قصير لضمان استقرار DOM ثم تحديث الحجم
          setTimeout(() => {
            try {
              if (map.current) {
                safeInvalidateSize(map.current);
              }
            } catch (error) {
              console.warn('تحذير: لا يمكن تحديث حجم الخريطة:', error);
            }
            setMapLoaded(true);
          }, 200);
        });
      } catch (error) {
        console.error('خطأ في إنشاء الخريطة:', error);
        setMapError(true);
      }
    };

    // تنظيف الخريطة القديمة قبل إنشاء جديدة
    if (map.current) {
      try {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      } catch (error) {
        console.error('خطأ في تنظيف الخريطة:', error);
      }
    }

    loadLeaflet();

    // تنظيف الخريطة عند إلغاء التحميل
    return () => {
      if (map.current) {
        safeMapCleanup(map.current);
        map.current = null;
      }
    };
  }, []);

  // useEffect لمعالجة تغيير حجم النافذة
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const handleResize = () => {
      if (map.current && map.current.getContainer()) {
        try {
          const container = map.current.getContainer();
          // استخدام المساعد الآمن لـ invalidateSize
          if (container.offsetWidth > 0 && container.offsetHeight > 0) {
            setTimeout(() => {
              safeInvalidateSize(map.current);
            }, 100);
          }
        } catch (error) {
          console.warn('تحذير: خطأ في معالجة تغيير حجم الخريطة:', error);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapLoaded]);

  // useEffect منفصل لتحديث الخريطة عند تغيير الخصائص
  useEffect(() => {
    if (map.current && mapLoaded) {
      try {
        const L = (window as any).L;
        if (!L) return;

        // تحديث المركز والتكبير باستخدام المساعد الآمن
        safeSetView(map.current, [latitude, longitude], zoom);

        // إزالة العلامات القديمة
        map.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            map.current.removeLayer(layer);
          }
        });

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

          const marker = safeAddMarker(map.current, L, [latitude, longitude], {
            icon: customIcon,
          });
          if (marker) {
            marker.bindPopup(address || 'موقع السيارة');
          }
        }
      } catch (error) {
        console.error('خطأ في تحديث الخريطة:', error);
      }
    }
  }, [latitude, longitude, zoom, showMarker, address, mapLoaded]);

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

export default LeafletMap;
