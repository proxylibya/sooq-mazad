// أنواع البيانات للسيارات والخريطة

export interface Car {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'auction' | 'marketplace';
  brand: string;
  model: string;
  year: number;
  condition: string;
  color: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  views: number;
  favorites: number;
  postedAt: Date;
  sellerId?: string;
  sellerName?: string;
  sellerPhone?: string;
  features?: string[];
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  endDate?: Date; // للمزادات
  currentBid?: number; // للمزادات
  minBid?: number; // للمزادات
  bidsCount?: number; // للمزادات
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface CarFilter {
  searchQuery?: string;
  city?: string;
  type?: 'all' | 'auction' | 'marketplace';
  priceRange?: [number, number];
  brand?: string;
  model?: string;
  yearRange?: [number, number];
  condition?: string;
  color?: string;
  fuelType?: string;
  transmission?: string;
  features?: string[];
}

export interface MarkerCluster {
  id: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  count: number;
  cars: Car[];
  bounds: MapBounds;
}

export interface PopupData {
  car: Car;
  position: {
    lat: number;
    lng: number;
  };
  isVisible: boolean;
}

// أنواع الأحداث
export type MapEventType =
  | 'marker-click'
  | 'marker-hover'
  | 'map-click'
  | 'map-move'
  | 'zoom-change'
  | 'bounds-change';

export interface MapEvent {
  type: MapEventType;
  data?: any;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// إعدادات الخريطة
export interface MapConfig {
  accessToken: string;
  style: string;
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  bearing?: number;
  pitch?: number;
  attributionControl?: boolean;
  navigationControl?: boolean;
  geolocateControl?: boolean;
  scaleControl?: boolean;
  fullscreenControl?: boolean;
}

// أنماط العلامات
export interface MarkerStyle {
  size: number;
  color: string;
  borderColor: string;
  borderWidth: number;
  shadow: boolean;
  animation?: 'bounce' | 'pulse' | 'fade';
}

export interface ClusterStyle {
  size: number;
  color: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
}

// إحصائيات الخريطة
export interface MapStats {
  totalCars: number;
  visibleCars: number;
  auctionCars: number;
  marketplaceCars: number;
  averagePrice: number;
  priceRange: [number, number];
  popularBrands: Array<{
    brand: string;
    count: number;
  }>;
  citiesDistribution: Array<{
    city: string;
    count: number;
  }>;
}

export default Car;
