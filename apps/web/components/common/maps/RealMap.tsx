import React, { useEffect, useRef, useState } from 'react';
import { Car } from '../../../types/car';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useFavorites } from '../../../hooks/useFavorites';
import { safeMapCleanup, setupMapSafely, safeRemoveLayer } from '../../../utils/leafletHelpers';

interface RealMapProps {
  cars: Car[];
  selectedCar: Car | null;
  onCarSelect: (car: Car | null) => void;
  center: { lat: number; lng: number };
  zoom: number;
  className?: string;
  onZoomChange?: (zoom: number) => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  tileType?: 'streets' | 'satellite';
}

const RealMap: React.FC<RealMapProps> = ({
  cars,
  selectedCar,
  onCarSelect,
  center,
  zoom,
  className = '',
  onZoomChange,
  onBoundsChange,
  tileType = 'streets',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const markerMapRef = useRef<Map<string, any>>(new Map());
  const clusterGroupRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const boundaryLayerRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // استخدام hook المفضلة الموحد
  const { isFavorite, toggleFavorite } = useFavorites();

  // تحميل Leaflet ديناميكياً
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      try {
        // تحميل CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // تحميل JavaScript
        const L = await import('leaflet');

        // إصلاح أيقونات Leaflet الافتراضية
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (mapRef.current && !mapInstanceRef.current) {
          // إنشاء الخريطة باستخدام المساعد الآمن
          const map = setupMapSafely(mapRef.current, L, {
            center: [center.lat, center.lng],
            zoom: zoom,
            minZoom: 5,
            maxZoom: 19,
            dragging: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            touchZoom: true,
            zoomControl: false,
            worldCopyJump: true,
            inertia: true,
            zoomSnap: 1,
            zoomDelta: 1,
            wheelDebounceTime: 25,
            wheelPxPerZoomLevel: 60,
          });

          if (!map) {
            console.error('فشل في إنشاء الخريطة');
            return;
          }

          // دالة مساعدة لإضافة طبقة البلاط بحسب النوع
          const addTiles = (type: 'streets' | 'satellite') => {
            try {
              if (tileLayerRef.current) {
                map.removeLayer(tileLayerRef.current);
                tileLayerRef.current = null;
              }
            } catch {}

            if (type === 'satellite') {
              tileLayerRef.current = L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                {
                  attribution:
                    'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                  maxZoom: 19,
                  minZoom: 5,
                  crossOrigin: true,
                },
              ).addTo(map);
            } else {
              tileLayerRef.current = L.tileLayer(
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                  attribution:
                    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                  maxZoom: 19,
                  minZoom: 5,
                  detectRetina: true,
                  crossOrigin: true,
                },
              ).addTo(map);
            }
          };

          // إضافة طبقة البداية
          addTiles(tileType);

          // إنشاء pane خاص لطبقة حدود ليبيا لضمان ظهورها فوق البلاطات
          try {
            map.createPane('libya-outline');
            const pane = map.getPane('libya-outline');
            if (pane) pane.style.zIndex = '650';
          } catch {}

          // تحميل حدود ليبيا GeoJSON وإضافتها كطبقة خط واضحة
          try {
            fetch(
              'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
            )
              .then((r) => r.json())
              .then((data) => {
                const features = data?.features || [];
                const libya = features.find(
                  (f: any) =>
                    f?.properties?.ADMIN === 'Libya' ||
                    f?.properties?.ISO_A3 === 'LBY' ||
                    f?.properties?.NAME === 'Libya',
                );
                if (libya) {
                  boundaryLayerRef.current = (L as any)
                    .geoJSON(libya, {
                      style: () => ({
                        color: '#2563eb',
                        weight: 3,
                        opacity: 0.9,
                        fill: false,
                        pane: 'libya-outline',
                      }),
                      interactive: false,
                    })
                    .addTo(map);

                  // تعيين المظهر الأولي حسب مركز الخريطة الحالي
                  try {
                    const c = map.getCenter();
                    const inLibya = c.lat >= 19 && c.lat <= 34 && c.lng >= 9 && c.lng <= 26;
                    boundaryLayerRef.current.setStyle({
                      opacity: inLibya ? 1 : 0.35,
                      weight: inLibya ? 3.5 : 2,
                      color: inLibya ? '#2563eb' : '#60a5fa',
                    });
                  } catch {}
                }
              })
              .catch(() => {});
          } catch {}

          // تفعيل السلوكيات التفاعلية صراحةً
          try {
            map.scrollWheelZoom.enable();
            map.dragging.enable();
            map.boxZoom.enable();
            map.touchZoom.enable();
          } catch {}

          // تحميل markercluster ديناميكياً
          try {
            if (!document.querySelector('link[href*="MarkerCluster.css"]')) {
              const css1 = document.createElement('link');
              css1.rel = 'stylesheet';
              css1.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
              document.head.appendChild(css1);
              const css2 = document.createElement('link');
              css2.rel = 'stylesheet';
              css2.href =
                'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
              document.head.appendChild(css2);
            }
            if (
              !(L as any).MarkerClusterGroup &&
              !document.querySelector('script[src*="leaflet.markercluster"]')
            ) {
              await new Promise<void>((resolve) => {
                const script = document.createElement('script');
                script.src =
                  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
                script.onload = () => resolve();
                document.body.appendChild(script);
              });
            }
            if ((L as any).markerClusterGroup) {
              clusterGroupRef.current = (L as any).markerClusterGroup({
                showCoverageOnHover: false,
                maxClusterRadius: 60,
                spiderfyOnEveryZoom: false,
                spiderfyOnClick: true,
                disableClusteringAtZoom: 16,
                chunkedLoading: true,
                iconCreateFunction: (cluster: any) => {
                  const count = cluster.getChildCount();
                  const size = count < 10 ? 44 : count < 100 ? 48 : 52;
                  const fontSize = count < 10 ? 14 : count < 100 ? 13 : 12;
                  const html = `
                  <div style="position:relative;width:${size}px;height:${size + 10}px;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.18))">
                    <div style="width:${size}px;height:${size}px;background:linear-gradient(180deg,#ffffff,#fafafa);border:1px solid #e5e7eb;border-radius:16px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#111827;">
                      <span style="font-size:${fontSize}px;line-height:1.1">${count}</span>
                    </div>
                    <div style="position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:10px solid #ffffff;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.12))"></div>
                  </div>`;
                  return new (L as any).DivIcon({
                    html,
                    className: 'custom-cluster-pin',
                    iconSize: [size, size + 12],
                    iconAnchor: [size / 2, size + 12],
                  });
                },
              });
              map.addLayer(clusterGroupRef.current);
            }
          } catch (e) {
            console.warn('تعذر تحميل markercluster، سيتم استخدام علامات بدون تجميع');
          }

          // إصلاح الحجم بعد الإنشاء وضبطه عند تغيير حجم النافذة
          const invalidate = () => {
            try {
              map.invalidateSize();
            } catch {}
          };

          setTimeout(invalidate, 200);
          window.addEventListener('resize', invalidate);

          // تم إلغاء تقييد حدود الخريطة للسماح بالسحب الحر

          mapInstanceRef.current = map;
          setIsMapLoaded(true);

          // مزامنة مستوى التكبير مع المكون الأب + إرسال حدود الخريطة
          try {
            map.on('zoomend', () => {
              if (typeof onZoomChange === 'function') {
                try {
                  onZoomChange(map.getZoom());
                } catch {}
              }
            });
            map.on('moveend', () => {
              if (typeof onBoundsChange === 'function') {
                try {
                  const b = map.getBounds();
                  onBoundsChange({
                    north: b.getNorth(),
                    south: b.getSouth(),
                    east: b.getEast(),
                    west: b.getWest(),
                  });
                } catch {}
              }

              // تحديث مظهر حدود ليبيا بحسب المركز الحالي للخريطة
              try {
                const c = map.getCenter();
                const inLibya = c.lat >= 19 && c.lat <= 34 && c.lng >= 9 && c.lng <= 26;
                if (boundaryLayerRef.current) {
                  boundaryLayerRef.current.setStyle({
                    opacity: inLibya ? 1 : 0.35,
                    weight: inLibya ? 3.5 : 2,
                    color: inLibya ? '#2563eb' : '#60a5fa',
                  });
                }
              } catch {}
            });
          } catch {}

          // تنظيف مستمع الحجم عند تفكيك الخريطة
          (map as any)._cleanupResize = () => {
            try {
              window.removeEventListener('resize', invalidate);
            } catch {}
          };
        }
      } catch (error) {
        console.error('خطأ في تحميل Leaflet:', error);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        try {
          if ((mapInstanceRef.current as any)._cleanupResize) {
            (mapInstanceRef.current as any)._cleanupResize();
          }
        } catch {}
        try {
          mapInstanceRef.current.off('zoomend');
        } catch {}
        safeMapCleanup(mapInstanceRef.current);
        mapInstanceRef.current = null;
      }
    };
  }, [tileType]);

  // تحديث مركز الخريطة
  useEffect(() => {
    if (mapInstanceRef.current && isMapLoaded) {
      try {
        try {
          mapInstanceRef.current.setView([center.lat, center.lng], zoom);
        } catch (error) {
          setTimeout(() => {
            try {
              mapInstanceRef.current.setView([center.lat, center.lng], zoom);
            } catch {}
          }, 100);
        }
      } catch (error) {
        console.warn('تحذير: خطأ في تحديث مركز الخريطة:', error);
      }
    }
  }, [center, zoom, isMapLoaded]);

  // إضافة علامات السيارات (مع تجميع إذا توفر)
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    try {
      const L = require('leaflet');

      // تنظيف العلامات السابقة
      try {
        markersRef.current.forEach((marker) => {
          safeRemoveLayer(mapInstanceRef.current, marker);
        });
      } catch {}
      markersRef.current = [];
      markerMapRef.current.clear();

      if (clusterGroupRef.current) {
        try {
          clusterGroupRef.current.clearLayers();
        } catch {}
      }

      // إنشاء وإضافة العلامات
      cars.forEach((car) => {
        const thumbUrl =
          car.image ||
          (Array.isArray(car.images) && car.images.length > 0
            ? car.images[0]
            : '/images/cars/default-car.svg');
        const typeColor = car.type === 'auction' ? '#ef4444' : '#16a34a';

        const customIcon = L.divIcon({
          className: 'custom-car-pin',
          html: `
            <div style="position:relative;width:56px;height:78px;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.18))">
              <div style="position:relative;width:56px;height:68px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;">
                <div style="position:relative;flex:1;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);">
                  <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#9ca3af;">
                    <svg viewBox='0 0 24 24' width='20' height='20' fill='currentColor' aria-hidden='true'>
                      <path d='M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0m-11 0a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0M17 5H7a1 1 0 00-1 1v9a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1z'/>
                    </svg>
                  </div>
                  <img src="${thumbUrl}" alt="car" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display='none'" />
                </div>
                <div style="height:6px;background:${typeColor};"></div>
              </div>
              <div style="position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:#ffffff;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;">
                <div style="width:10px;height:10px;border-radius:50%;background:${typeColor};"></div>
              </div>
              <div style="position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:10px solid #ffffff;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.12))"></div>
            </div>
          `,
          iconSize: [56, 78],
          iconAnchor: [28, 78],
          popupAnchor: [0, -70],
        });

        const marker = L.marker([car.coordinates.lat, car.coordinates.lng], {
          icon: customIcon,
        });

        const popupContent = `
        <div class="p-3 min-w-[250px]" dir="rtl">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-bold text-lg text-gray-900">${car.title}</h3>
            <span class="px-2 py-1 rounded-full text-xs font-bold ${
              car.type === 'auction' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }">
              ${car.type === 'auction' ? 'مزاد' : 'سوق فوري'}
            </span>
          </div>
          <div class="mb-3">
            <span class="text-2xl font-bold text-blue-600">${car.price.toLocaleString()} د.ل</span>
          </div>
          <div class="space-y-1 text-sm text-gray-600 mb-3">
            <div class="flex items-center">
              <svg class="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M12 7C14.76 7 17 9.24 17 12S14.76 17 12 17 7 14.76 7 12 9.24 7 12 7Z"/>
              </svg>
              ${car.location}
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              ${car.condition}
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              ${car.transmission}
            </div>
          </div>
          <button 
            onclick="window.selectCar('${car.id}')"
            class="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            عرض التفاصيل
          </button>
        </div>
      `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup',
        });
        marker.on('click', () => onCarSelect(car));

        markerMapRef.current.set(car.id, marker);

        if (clusterGroupRef.current) {
          clusterGroupRef.current.addLayer(marker);
        } else {
          marker.addTo(mapInstanceRef.current);
          markersRef.current.push(marker);
        }
      });

      // دالة عامة لاختيار السيارة
      (window as any).selectCar = (carId: string) => {
        const car = cars.find((c) => c.id === carId);
        if (car) {
          onCarSelect(car);
        }
      };
    } catch (error) {
      console.error('خطأ في إضافة علامات السيارات:', error);
    }
  }, [cars, isMapLoaded, onCarSelect]);

  // تمييز السيارة المحددة
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    if (selectedCar) {
      const marker = markerMapRef.current.get(selectedCar.id);
      if (marker) {
        try {
          marker.openPopup();
        } catch {}
        try {
          mapInstanceRef.current.setView(
            [selectedCar.coordinates.lat, selectedCar.coordinates.lng],
            Math.max(zoom, 12),
          );
        } catch {}
      }
    }
  }, [selectedCar, zoom, isMapLoaded]);

  // معالج تبديل المفضلة
  const handleToggleFavorite = async (carId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(carId);
  };

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* حاوية الخريطة */}
      <div
        ref={mapRef}
        className="h-full w-full overflow-hidden rounded-xl ring-1 ring-gray-200"
        style={{ minHeight: '500px' }}
      />

      {/* مؤشر التحميل */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-100">
          <div className="text-center">
            <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
            <p className="text-gray-600">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}

      {/* معلومات الخريطة */}
      <div className="absolute left-4 top-4 z-[1000] rounded-lg border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
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
        <div className="absolute bottom-4 right-4 z-[1000] w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
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
                onClick={(e) => handleToggleFavorite(selectedCar.id, e)}
                className="rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-50"
              >
                {isFavorite(selectedCar.id) ? (
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

export default RealMap;
