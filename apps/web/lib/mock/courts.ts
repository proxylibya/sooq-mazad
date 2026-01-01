// Mock courts data for admin dashboard
export interface Court {
  id: string;
  name: string;
  location: string;
  type: 'civil' | 'commercial' | 'criminal';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  title?: string;
  description?: string;
  city?: string;
  address?: string;
  phone?: string;
  phones?: string[];
  capacity?: number;
  currentCars?: number;
  liveAuctions?: number;
  vehicleTypes?: string[];
  auctionDays?: string[];
  auctionTime?: string;
  auctionTimeFrom?: string;
  auctionTimeTo?: string;
  images?: string[];
}

export const mockCourts: Court[] = [
  {
    id: '1',
    name: 'محكمة طرابلس التجارية',
    location: 'طرابلس',
    type: 'commercial',
    status: 'ACTIVE',
    createdAt: '2024-01-15T10:00:00Z',
    title: 'محكمة طرابلس التجارية',
    description: 'محكمة تجارية متخصصة',
    city: 'طرابلس',
    address: 'شارع الجمهورية',
    phone: '+218912345678',
    phones: ['+218912345678'],
    capacity: 100,
    currentCars: 25,
    liveAuctions: 3,
    vehicleTypes: ['سيارات', 'شاحنات'],
    auctionDays: ['الأحد', 'الثلاثاء'],
    auctionTime: '10:00-14:00',
    auctionTimeFrom: '10:00',
    auctionTimeTo: '14:00',
    images: [],
  },
  {
    id: '2',
    name: 'محكمة بنغازي المدنية',
    location: 'بنغازي',
    type: 'civil',
    status: 'ACTIVE',
    createdAt: '2024-01-20T14:30:00Z',
    title: 'محكمة بنغازي المدنية',
    description: 'محكمة مدنية',
    city: 'بنغازي',
    address: 'شارع عمر المختار',
    phone: '+218923456789',
    phones: ['+218923456789'],
    capacity: 80,
    currentCars: 15,
    liveAuctions: 2,
    vehicleTypes: ['سيارات'],
    auctionDays: ['الإثنين', 'الأربعاء'],
    auctionTime: '09:00-13:00',
    auctionTimeFrom: '09:00',
    auctionTimeTo: '13:00',
    images: [],
  },
];

export const getCourtById = (id: string): Court | undefined => {
  return mockCourts.find((court) => court.id === id);
};

export const findCourtById = getCourtById;

export const getMockCourts = (): Court[] => {
  return [...mockCourts];
};
