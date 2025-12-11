export interface ShowroomOwner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  verified: boolean;
  accountType: string;
}

export interface Showroom {
  id: string;
  name: string;
  description: string;
  images: string[];
  phone: string;
  email?: string;
  website?: string;
  city: string;
  area: string;
  address: string;
  rating: number;
  reviewsCount: number;
  totalCars: number;
  activeCars: number;
  verified: boolean;
  featured: boolean;
  vehicleTypes: string[];
  specialties: string[];
  openingHours?: string;
  establishedYear?: number;
  createdAt: string;
  updatedAt: string;
  owner: ShowroomOwner;
}

export interface ShowroomFilters {
  search: string;
  city: string;
  status: string;
  verified: string;
}
