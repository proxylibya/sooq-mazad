// SimpleSpinner غير مستخدم - التصميم الموحد مباشر

import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import React, { useEffect, useRef, useState } from 'react';

interface LocalLeafletMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  height?: string;
  zoom?: number;
  showMarker?: boolean;
  className?: string;
}

const LocalLeafletMap: React.FC<LocalLeafletMapProps> = ({
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
    const loadLeaflet = async () => {
      try {
        // استخدام المكتبة المحلية بدلاً من CDN
        const L = await import('leaflet');

        // تحميل CSS محلياً
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.href = '/leaflet/leaflet.css';
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }

        // إصلاح مسارات الأيقونات
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
          iconUrl: '/leaflet/images/marker-icon.png',
          shadowUrl: '/leaflet/images/marker-shadow.png',
        });

        initializeMap(L);
      } catch (error) {
        console.error('خطأ في تحميل Leaflet:', error);
        setMapError(true);
      }
    };

    const initializeMap = (L: any) => {
      if (!mapContainer.current || map.current) return;

      try {
        // التأكد من أن العنصر جاهز
        if (!mapContainer.current.offsetParent && mapContainer.current.style.display !== 'block') {
          console.warn('Map container not visible, delaying initialization');
          setTimeout(() => initializeMap(L), 100);
          return;
        }

        // إنشاء الخريطة مع معالجة أفضل للأخطاء
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

        // إضافة علامة مخصصة إذا كانت مطلوبة
        if (showMarker) {
          // إنشاء أيقونة مخصصة
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

        setMapLoaded(true);
      } catch (error) {
        console.error('خطأ في إنشاء الخريطة:', error);
        setMapError(true);
      }
    };

    loadLeaflet();

    // تنظيف الخريطة عند إلغاء التحميل
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // تحديث الخريطة عند تغيير الإحداثيات
  useEffect(() => {
    if (map.current && mapLoaded) {
      updateMap();
    }
  }, [latitude, longitude, address, showMarker, mapLoaded]);

  const updateMap = () => {
    if (!map.current) return;

    try {
      // التحقق من أن الخريطة والحاوية جاهزة
      const container = map.current.getContainer();
      if (!container || !container._leaflet_pos) {
        console.warn('تحذير: الخريطة غير جاهزة للتحديث');
        return;
      }

      // تحديث مركز الخريطة
      map.current.setView([latitude, longitude], zoom);

      // مسح العلامات الموجودة
      map.current.eachLayer((layer: any) => {
        if (layer.options && layer.options.icon) {
          map.current.removeLayer(layer);
        }
      });

      // إضافة علامة جديدة إذا كانت مطلوبة
      if (showMarker) {
        const L = (window as any).L || require('leaflet');
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
    } catch (error) {
      console.error('خطأ في تحديث الخريطة:', error);
    }
  };

  if (mapError) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <MapPinIcon className="mx-auto mb-2 h-8 w-8" />
          <p className="text-sm">لا يمكن تحميل الخريطة</p>
          <p className="mt-1 text-xs text-gray-400">{address && `العنوان: ${address}`}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainer}
        className="w-full overflow-hidden rounded-lg border border-gray-300"
        style={{ height }}
      />
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

export default LocalLeafletMap;
