// أنواع المراكز الدولية
// International Centers Types

export interface CenterApplicationRequest {
  id?: string;
  applicant: {
    name: string;
    email: string;
    phone: string;
    nationalId?: string;
    businessLicense?: string;
  };
  proposedCenter: {
    name: string;
    country: string;
    city: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  qualifications: {
    experience: number;
    previousWork: string[];
    certifications: string[];
    teamSize: number;
  };
  financialPlan: {
    initialInvestment: number;
    monthlyOperatingCost: number;
    expectedMonthlyRevenue: number;
    breakEvenPeriod: number;
  };
  documents: {
    businessLicense?: string;
    taxCertificate?: string;
    financialStatements?: string[];
    businessPlan?: string;
    certifications?: string[];
    locationPhotos?: string[];
    references?: string[];
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InternationalCenter {
  id: string;
  name: string;
  type: 'dealership' | 'service_center' | 'parts_supplier' | 'auction_house';
  country: string;
  city: string;
  address: string;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  manager: {
    name: string;
    email: string;
    phone: string;
  };
  services: string[];
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  certifications: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  joinedAt: Date;
  lastActivity: Date;
}

export interface CenterPerformance {
  centerId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalSales: number;
    totalRevenue: number;
    customerSatisfaction: number;
    responseTime: number;
    completionRate: number;
  };
  rankings: {
    salesRank: number;
    satisfactionRank: number;
    totalCenters: number;
  };
}

export interface CenterService {
  id: string;
  centerId: string;
  name: string;
  description: string;
  category: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  availability: boolean;
  requirements: string[];
}

export interface CenterReview {
  id: string;
  centerId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  serviceType: string;
  date: Date;
  verified: boolean;
  response?: {
    text: string;
    date: Date;
    responder: string;
  };
}

export interface CenterInventory {
  id: string;
  centerId: string;
  vehicleId: string;
  status: 'available' | 'reserved' | 'sold' | 'maintenance';
  price: number;
  currency: string;
  condition: 'new' | 'used' | 'certified_pre_owned';
  mileage?: number;
  year: number;
  lastUpdated: Date;
}

export interface CenterApplication {
  id: string;
  applicantInfo: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  centerDetails: {
    name: string;
    type: 'dealership' | 'service_center' | 'parts_supplier' | 'auction_house';
    location: {
      country: string;
      city: string;
      address: string;
    };
    services: string[];
  };
  businessInfo: {
    experience: string;
    expectedVolume: string;
    investmentCapacity: string;
    businessPlan: string;
  };
  documents: {
    businessLicense: string;
    taxCertificate: string;
    financialStatements: string[];
    businessPlan?: string;
    certifications?: string[];
    locationPhotos?: string[];
    references: string[];
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface CenterStats {
  totalCenters: number;
  activeCenters: number;
  centersByType: {
    dealership: number;
    service_center: number;
    parts_supplier: number;
    auction_house: number;
  };
  centersByCountry: {
    [country: string]: number;
  };
  averageRating: number;
  totalReviews: number;
  monthlyGrowth: number;
}

export interface CenterSearchFilters {
  country?: string;
  city?: string;
  type?: string[];
  services?: string[];
  rating?: number;
  languages?: string[];
  sortBy?: 'rating' | 'distance' | 'name' | 'joinedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CenterContact {
  id: string;
  centerId: string;
  customerId: string;
  subject: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  respondedAt?: Date;
  response?: string;
}

export interface CenterNotification {
  id: string;
  centerId: string;
  type: 'new_inquiry' | 'review_received' | 'performance_update' | 'system_update';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface CenterDashboardData {
  center: InternationalCenter;
  performance: CenterPerformance;
  recentReviews: CenterReview[];
  pendingInquiries: CenterContact[];
  notifications: CenterNotification[];
  inventory: CenterInventory[];
}
