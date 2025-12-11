// Global type definitions for auction-cars-27 project

declare global {
  interface Window {
    google?: {
      maps: any;
    };
  }
}

// NextAuth session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
      role?: string;
      accountType?: string;
      verified?: boolean;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
    role?: string;
    accountType?: string;
    verified?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
    accountType?: string;
    verified?: boolean;
  }
}

// Dropdown component types
export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ComponentType<any>;
  disabled?: boolean;
}

// Country selector types
export interface Country {
  code: string;
  name: string;
  nameEn: string;
  flag: string;
  countryCode?: string;
}

// Form data types
export interface TransportData {
  truckNumber: string;
  licenseCode: string;
  truckType: string;
  capacity: string;
  serviceArea: string;
  pricePerKm: number;
  priceType: 'fixed' | 'negotiable';
}

export interface AuctionData {
  // Basic car info
  vehicleType: string;
  brand: string;
  model: string;
  year: string;
  manufacturingCountry: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  doors: string;
  color: string;
  condition: string;

  // Auction specific
  startingPrice: number;
  auctionDuration: string;
  contactPhone: string;

  // Additional fields
  regionalSpecs: string;
  bodyType: string;
  seatCount: string;
  interiorColor: string;
  interiorFeatures: string[];
  exteriorFeatures: string[];
  technicalFeatures: string[];

  // Common fields
  location: string;
  description: string;
  images: string;
  featured: boolean;
}

export interface MarketplaceData {
  // Basic car info
  vehicleType: string;
  brand: string;
  model: string;
  year: string;
  manufacturingCountry: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  doors: string;
  color: string;
  condition: string;

  // Marketplace specific
  price: number;
  phone: string;

  // Additional fields
  regionalSpecs: string;
  bodyType: string;
  seatCount: string;
  interiorColor: string;
  interiorFeatures: string[];
  exteriorFeatures: string[];
  technicalFeatures: string[];

  // Common fields
  location: string;
  description: string;
  images: string;
  featured: boolean;
}

export type SaleType = 'auction' | 'marketplace' | null;

// Application tracking types
export interface ApplicationData {
  id: string;
  applicantName: string;
  centerName: string;
  country: string;
  city: string;
  status: string;
  submittedDate: string;
  lastUpdate: string;
  estimatedDecision: string;
  reviewNotes: string;
  nextSteps: string[];
  timeline: Array<{
    date: string;
    status: string;
    description: string;
    completed: boolean;
  }>;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
  };
}

// Settings types
export interface UserSettings {
  theme: 'auto' | 'light' | 'dark';
  language: 'ar' | 'en' | 'fr';
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  numberFormat: 'arabic' | 'western';
  privacy: {
    showPhone: boolean | 'public' | 'private' | 'friends';
    showEmail: boolean | 'public' | 'private' | 'friends';
    showLocation: boolean | 'public' | 'private' | 'friends';
  };
  security: {
    twoFactor: boolean;
    loginNotifications: boolean;
    sessionTimeout: number;
    allowedDevices: string[];
  };
}

// Car condition types
export type CarCondition = 'جديد' | 'مستعمل' | 'تحتاج صيانة' | 'جيد';

// Auction status types
export type AuctionStatus = 'upcoming' | 'live' | 'ended';

// Form errors type
export interface FormErrors {
  [key: string]: string;
}

export {};
