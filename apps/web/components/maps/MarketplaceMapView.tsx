import React, { useEffect, useRef, useState, useMemo } from 'react';
import MapPinIcon from '@heroicons/react/24/solid/MapPinIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { formatPrice } from '../../utils/formatters';

interface Car {
  id: string;
  title: string;
  price: number;
  brand: string;
  model: string;
  year: number;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  condition: string;
  mileage?: number;
  featured?: boolean;
  urgent?: boolean;
}

interface MarketplaceMapViewProps {
  cars: Car[];
  selectedCar: Car | null;
  onCarSelect: (car: Car | null) => void;
  onCarClick: (carId: string) => void;
  viewMode: 'map' | 'list';
}

interface Cluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  cars: Car[];
}

const MarketplaceMapView: React.FC<MarketplaceMapViewProps> = ({
  cars,
  selectedCar,
  onCarSelect,
  onCarClick,
  viewMode,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredCar, setHoveredCar] = useState<Car | null>(null);

  // حساب المركز والتكبير المناسب
  const mapCenter = useMemo(() => {
    if (cars.length === 0) {
      return { lat: 32.8872, lng: 13.1913, zoom: 6 };
    }

    const latSum = cars.reduce((sum, car) => sum + car.coordinates.lat, 0);
    const lngSum = cars.reduce((sum, car) => sum + car.coordinates.lng, 0);

    return {
      lat: latSum / cars.length,
      lng: lngSum / cars.length,
      zoom: cars.length > 50 ? 6 : cars.length > 20 ? 7 : 8,
    };
  }, [cars]);

  // تجميع العلامات القريبة
  const clusters = useMemo(() => {
    if (cars.length === 0) return [];

    const clusterDistance = 0.05; // المسافة بالدرجات
    const clusters: Cluster[] = [];

    cars.forEach((car) => {
      let addedToCluster = false;

      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(cluster.lat - car.coordinates.lat, 2) +
            Math.pow(cluster.lng - car.coordinates.lng, 2),
        );

        if (distance < clusterDistance) {
          cluster.cars.push(car);
          cluster.count++;
          cluster.lat = cluster.cars.reduce((sum, c) => sum + c.coordinates.lat, 0) / cluster.count;
          cluster.lng = cluster.cars.reduce((sum, c) => sum + c.coordinates.lng, 0) / cluster.count;
          addedToCluster = true;
          break;
        }
      }

      if (!addedToCluster) {
        clusters.push({
          id: `cluster-${clusters.length}`,
          lat: car.coordinates.lat,
          lng: car.coordinates.lng,
          count: 1,
          cars: [car],
        });
      }
    });

    return clusters;
  }, [cars]);

  // تحميل Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      try {
        if (!(window as any).L) {
          const link = document.createElement('link');
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.rel = 'stylesheet';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);

          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.async = true;

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        initializeMap();
      } catch (error) {
        console.error('خطأ في تحميل Leaflet:', error);
      }
    };

    const initializeMap = () => {
      if (!mapContainer.current || map.current) return;

      const L = (window as any).L;
      if (!L) return;

      try {
        const mapInstance = L.map(mapContainer.current, {
          center: [mapCenter.lat, mapCenter.lng],
          zoom: mapCenter.zoom,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(mapInstance);

        map.current = mapInstance;
        setMapLoaded(true);
      } catch (error) {
        console.error('خطأ في إنشاء الخريطة:', error);
      }
    };

    if (viewMode === 'map') {
      loadLeaflet();
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        markers.current = [];
        setMapLoaded(false);
      }
    };
  }, [viewMode]);

  // تحديث العلامات
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const L = (window as any).L;
    if (!L) return;

    // إزالة العلامات القديمة
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // إضافة علامات جديدة
    clusters.forEach((cluster) => {
      const isCluster = cluster.count > 1;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: isCluster
          ? `<div class="cluster-marker">
               <div class="cluster-inner">${cluster.count}</div>
             </div>`
          : `<div class="single-marker ${cluster.cars[0].featured ? 'featured' : ''} ${cluster.cars[0].urgent ? 'urgent' : ''}">
               <svg class="marker-icon" fill="currentColor" viewBox="0 0 24 24">
                 <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
               </svg>
             </div>`,
        iconSize: isCluster ? [50, 50] : [40, 40],
        iconAnchor: isCluster ? [25, 25] : [20, 40],
      });

      const marker = L.marker([cluster.lat, cluster.lng], { icon });

      marker.on('click', () => {
        if (isCluster) {
          map.current.setView([cluster.lat, cluster.lng], map.current.getZoom() + 2);
        } else {
          onCarSelect(cluster.cars[0]);
        }
      });

      marker.addTo(map.current);
      markers.current.push(marker);
    });
  }, [mapLoaded, clusters, onCarSelect]);

  // التركيز على السيارة المحددة
  useEffect(() => {
    if (mapLoaded && map.current && selectedCar) {
      map.current.setView([selectedCar.coordinates.lat, selectedCar.coordinates.lng], 15, {
        animate: true,
      });
    }
  }, [mapLoaded, selectedCar]);

  if (viewMode === 'list') {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 p-4">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <div
              key={car.id}
              className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-xl"
              onClick={() => onCarClick(car.id)}
            >
              <div className="relative h-48">
                <img
                  src={car.images[0] || '/placeholder-car.jpg'}
                  alt={car.title}
                  className="h-full w-full object-cover"
                />
                {car.featured && (
                  <span className="absolute left-2 top-2 rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-white">
                    مميز
                  </span>
                )}
                {car.urgent && (
                  <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                    عاجل
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900">{car.title}</h3>
                <p className="mb-2 text-sm text-gray-600">
                  {car.brand} {car.model} - {car.year}
                </p>
                <div className="mb-2 flex items-center text-sm text-gray-500">
                  <MapPinIcon className="ml-1 h-4 w-4" />
                  {car.location}
                </div>
                <div className="text-xl font-bold text-blue-600">
                  {formatPrice(car.price)} دينار
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={mapContainer} className="h-full w-full" />

      {/* بطاقة السيارة المحددة */}
      {selectedCar && (
        <div className="absolute bottom-4 left-1/2 z-20 w-96 max-w-[calc(100%-2rem)] -translate-x-1/2 transform">
          <div className="overflow-hidden rounded-xl bg-white shadow-2xl">
            <button
              onClick={() => onCarSelect(null)}
              className="absolute left-2 top-2 z-10 rounded-full bg-white p-1 shadow-md transition-colors hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="relative h-48">
              <img
                src={selectedCar.images[0] || '/placeholder-car.jpg'}
                alt={selectedCar.title}
                className="h-full w-full object-cover"
              />
              {selectedCar.featured && (
                <span className="absolute left-2 top-2 rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-white">
                  مميز
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="mb-2 text-xl font-bold text-gray-900">{selectedCar.title}</h3>
              <p className="mb-2 text-gray-600">
                {selectedCar.brand} {selectedCar.model} - {selectedCar.year}
              </p>
              <div className="mb-3 flex items-center text-sm text-gray-500">
                <MapPinIcon className="ml-1 h-4 w-4" />
                {selectedCar.location}
              </div>
              <div className="mb-4 text-2xl font-bold text-blue-600">
                {formatPrice(selectedCar.price)} دينار
              </div>
              <button
                onClick={() => onCarClick(selectedCar.id)}
                className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700"
              >
                عرض التفاصيل
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-marker {
          background: none;
          border: none;
        }

        .cluster-marker {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: transform 0.2s;
        }

        .cluster-marker:hover {
          transform: scale(1.1);
        }

        .cluster-inner {
          color: white;
          font-weight: bold;
          font-size: 16px;
        }

        .single-marker {
          width: 40px;
          height: 40px;
          color: #3b82f6;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          cursor: pointer;
          transition: transform 0.2s;
        }

        .single-marker:hover {
          transform: scale(1.15);
        }

        .single-marker.featured {
          color: #eab308;
        }

        .single-marker.urgent {
          color: #ef4444;
          animation: pulse 2s infinite;
        }

        .marker-icon {
          width: 100%;
          height: 100%;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .leaflet-container {
          background: #f3f4f6;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }

        .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
    </>
  );
};

export default MarketplaceMapView;
