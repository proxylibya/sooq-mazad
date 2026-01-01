// Mock companies data for admin dashboard
export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  documents?: string[];
  city?: string;
  commercial_record?: string;
  verification_status?: 'VERIFIED' | 'PENDING' | 'REJECTED';
}

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'شركة السيارات المتقدمة',
    email: 'info@advanced-cars.ly',
    phone: '+218912345678',
    status: 'verified',
    createdAt: '2024-01-15T10:00:00Z',
    documents: ['license.pdf', 'certificate.pdf'],
    city: 'طرابلس',
    commercial_record: 'CR-123456',
    verification_status: 'VERIFIED',
  },
  {
    id: '2',
    name: 'معرض طرابلس للسيارات',
    email: 'contact@tripoli-cars.ly',
    phone: '+218923456789',
    status: 'pending',
    createdAt: '2024-01-20T14:30:00Z',
    documents: ['application.pdf'],
    city: 'طرابلس',
    commercial_record: 'CR-789012',
    verification_status: 'PENDING',
  },
];

export const getCompanyById = (id: string): Company | undefined => {
  return mockCompanies.find((company) => company.id === id);
};

// Alias for consistency with other mock files
export const findCompanyById = getCompanyById;

export const getCompaniesByStatus = (status: Company['status']): Company[] => {
  return mockCompanies.filter((company) => company.status === status);
};

export const getMockCompanies = (): Company[] => {
  return [...mockCompanies];
};
