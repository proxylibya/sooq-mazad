import type { AccountType } from '../../types/account';

/**
 * نوع المستخدم الوهمي للاختبار
 */
export interface MockUser {
  id: string;
  full_name: string;
  phone: string;
  accountType: AccountType;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING' | 'SUSPENDED';
  is_verified: boolean;
  created_at: string;
  last_active: string;
  auctions_count: number;
  total_spent: number;
}

/**
 * بيانات وهمية للمستخدمين لأغراض التطوير والاختبار
 */
const MOCK_USERS: MockUser[] = [
  {
    id: 'user-001',
    full_name: 'أحمد محمد علي',
    phone: '+218911234567',
    accountType: 'REGULAR_USER',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-01-15T10:30:00Z',
    last_active: '2025-09-29T20:15:00Z',
    auctions_count: 12,
    total_spent: 45000,
  },
  {
    id: 'user-002',
    full_name: 'فاطمة عبدالله',
    phone: '+218921234567',
    accountType: 'REGULAR_USER',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-02-10T14:20:00Z',
    last_active: '2025-09-29T18:45:00Z',
    auctions_count: 8,
    total_spent: 32000,
  },
  {
    id: 'user-003',
    full_name: 'محمد سالم',
    phone: '+218931234567',
    accountType: 'TRANSPORT_OWNER',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-01-20T09:00:00Z',
    last_active: '2025-09-29T21:00:00Z',
    auctions_count: 25,
    total_spent: 0,
  },
  {
    id: 'user-004',
    full_name: 'شركة السلام للسيارات',
    phone: '+218941234567',
    accountType: 'COMPANY',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-01-05T11:30:00Z',
    last_active: '2025-09-29T19:30:00Z',
    auctions_count: 45,
    total_spent: 150000,
  },
  {
    id: 'user-005',
    full_name: 'معرض النور للسيارات',
    phone: '+218951234567',
    accountType: 'SHOWROOM',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-02-01T08:00:00Z',
    last_active: '2025-09-29T22:00:00Z',
    auctions_count: 67,
    total_spent: 280000,
  },
  {
    id: 'user-006',
    full_name: 'خالد إبراهيم',
    phone: '+218961234567',
    accountType: 'REGULAR_USER',
    status: 'PENDING',
    is_verified: false,
    created_at: '2025-09-28T15:00:00Z',
    last_active: '2025-09-28T15:00:00Z',
    auctions_count: 0,
    total_spent: 0,
  },
  {
    id: 'user-007',
    full_name: 'سارة أحمد',
    phone: '+218971234567',
    accountType: 'REGULAR_USER',
    status: 'BLOCKED',
    is_verified: true,
    created_at: '2024-03-10T12:00:00Z',
    last_active: '2025-09-15T10:00:00Z',
    auctions_count: 3,
    total_spent: 8500,
  },
  {
    id: 'user-008',
    full_name: 'يوسف حسن',
    phone: '+218981234567',
    accountType: 'REGULAR_USER',
    status: 'SUSPENDED',
    is_verified: true,
    created_at: '2024-04-20T16:30:00Z',
    last_active: '2025-09-20T14:20:00Z',
    auctions_count: 5,
    total_spent: 12000,
  },
  {
    id: 'user-009',
    full_name: 'عمر الصالح',
    phone: '+218991234567',
    accountType: 'TRANSPORT_OWNER',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-02-25T10:00:00Z',
    last_active: '2025-09-29T17:30:00Z',
    auctions_count: 18,
    total_spent: 0,
  },
  {
    id: 'user-010',
    full_name: 'شركة الأمل التجارية',
    phone: '+218901234567',
    accountType: 'COMPANY',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-03-15T09:30:00Z',
    last_active: '2025-09-29T16:00:00Z',
    auctions_count: 32,
    total_spent: 125000,
  },
  {
    id: 'user-011',
    full_name: 'معرض المستقبل',
    phone: '+218912345678',
    accountType: 'SHOWROOM',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-01-30T13:00:00Z',
    last_active: '2025-09-29T20:45:00Z',
    auctions_count: 54,
    total_spent: 220000,
  },
  {
    id: 'user-012',
    full_name: 'ليلى محمود',
    phone: '+218922345678',
    accountType: 'REGULAR_USER',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-05-10T11:20:00Z',
    last_active: '2025-09-29T15:30:00Z',
    auctions_count: 6,
    total_spent: 18500,
  },
  {
    id: 'user-013',
    full_name: 'حسام الدين',
    phone: '+218932345678',
    accountType: 'REGULAR_USER',
    status: 'ACTIVE',
    is_verified: false,
    created_at: '2025-09-27T14:00:00Z',
    last_active: '2025-09-29T12:00:00Z',
    auctions_count: 1,
    total_spent: 3000,
  },
  {
    id: 'user-014',
    full_name: 'منى سعيد',
    phone: '+218942345678',
    accountType: 'TRANSPORT_OWNER',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-04-05T08:45:00Z',
    last_active: '2025-09-29T19:15:00Z',
    auctions_count: 22,
    total_spent: 0,
  },
  {
    id: 'user-015',
    full_name: 'شركة النجاح',
    phone: '+218952345678',
    accountType: 'COMPANY',
    status: 'PENDING',
    is_verified: false,
    created_at: '2025-09-26T10:30:00Z',
    last_active: '2025-09-26T10:30:00Z',
    auctions_count: 0,
    total_spent: 0,
  },
  {
    id: 'user-016',
    full_name: 'معرض الشروق',
    phone: '+218962345678',
    accountType: 'SHOWROOM',
    status: 'SUSPENDED',
    is_verified: true,
    created_at: '2024-06-15T15:20:00Z',
    last_active: '2025-09-10T11:00:00Z',
    auctions_count: 28,
    total_spent: 95000,
  },
  {
    id: 'user-017',
    full_name: 'رامي عادل',
    phone: '+218972345678',
    accountType: 'REGULAR_USER',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-07-20T12:00:00Z',
    last_active: '2025-09-29T21:30:00Z',
    auctions_count: 9,
    total_spent: 27000,
  },
  {
    id: 'user-018',
    full_name: 'هدى خليل',
    phone: '+218982345678',
    accountType: 'REGULAR_USER',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-08-01T09:15:00Z',
    last_active: '2025-09-29T13:45:00Z',
    auctions_count: 4,
    total_spent: 11500,
  },
  {
    id: 'user-019',
    full_name: 'طارق محمد',
    phone: '+218992345678',
    accountType: 'TRANSPORT_OWNER',
    status: 'BLOCKED',
    is_verified: true,
    created_at: '2024-05-15T14:30:00Z',
    last_active: '2025-08-30T16:00:00Z',
    auctions_count: 15,
    total_spent: 0,
  },
  {
    id: 'user-020',
    full_name: 'شركة الرواد',
    phone: '+218902345678',
    accountType: 'COMPANY',
    status: 'ACTIVE',
    is_verified: true,
    created_at: '2024-02-28T10:45:00Z',
    last_active: '2025-09-29T18:00:00Z',
    auctions_count: 38,
    total_spent: 165000,
  },
];

/**
 * الحصول على قائمة المستخدمين الوهمية
 */
export function getMockUsers(): MockUser[] {
  return [...MOCK_USERS];
}

/**
 * الحصول على مستخدم وهمي بواسطة المعرف
 */
export function getMockUserById(id: string): MockUser | undefined {
  return MOCK_USERS.find((user) => user.id === id);
}

/**
 * إضافة مستخدم وهمي جديد (لأغراض الاختبار فقط)
 */
export function addMockUser(user: MockUser): void {
  MOCK_USERS.push(user);
}

/**
 * تحديث مستخدم وهمي (لأغراض الاختبار فقط)
 */
export function updateMockUser(id: string, updates: Partial<MockUser>): MockUser | null {
  const index = MOCK_USERS.findIndex((user) => user.id === id);
  if (index === -1) return null;

  MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
  return MOCK_USERS[index];
}

/**
 * حذف مستخدم وهمي (لأغراض الاختبار فقط)
 */
export function deleteMockUser(id: string): boolean {
  const index = MOCK_USERS.findIndex((user) => user.id === id);
  if (index === -1) return false;

  MOCK_USERS.splice(index, 1);
  return true;
}

/**
 * البحث عن مستخدم بواسطة المعرف (alias لـ getMockUserById)
 */
export function findUserById(id: string): MockUser | undefined {
  return getMockUserById(id);
}

export default {
  getMockUsers,
  getMockUserById,
  findUserById,
  addMockUser,
  updateMockUser,
  deleteMockUser,
};
