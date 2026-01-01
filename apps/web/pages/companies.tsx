import BuildingOfficeIcon from '@heroicons/react/24/outline/BuildingOfficeIcon';
import CheckBadgeIcon from '@heroicons/react/24/outline/CheckBadgeIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { OpensooqNavbar } from '../components/common';

interface CompanyOwner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  verified?: boolean;
  accountType?: string;
}

interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string | null;
  phone?: string;
  email?: string;
  website?: string;
  city: string;
  area?: string;
  address?: string;
  verified?: boolean;
  featured?: boolean;
  rating?: number;
  reviewsCount?: number;
  totalEmployees?: number;
  activeProjects?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  businessType: string[];
  specialties: string[];
  owner: CompanyOwner;
}

interface FiltersState {
  search: string;
  city: string;
  businessType: string;
}

const defaultLogo = '/images/companies/default-company.svg';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    city: 'all',
    businessType: 'all',
  });

  // جلب الشركات من API إداري مؤقتاً (mock)
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب الشركات من API العام
      const res = await fetch('/api/companies');
      const data = await res.json();

      if (res.ok && data?.success && Array.isArray(data?.companies)) {
        setCompanies(data.companies as Company[]);
      } else {
        throw new Error(data?.message || 'Failed to fetch companies');
      }
    } catch (e: any) {
      // بيانات بديلة (fallback) في حال فشل الجلب
      setCompanies([
        {
          id: '1',
          name: 'شركة النقل السريع',
          description: 'شركة متخصصة في خدمات النقل والشحن والخدمات اللوجستية داخل ليبيا وخارجها',
          logo: defaultLogo,
          phone: '0912345678',
          email: 'fast@company.ly',
          website: 'fast-transport.ly',
          city: 'طرابلس',
          area: 'سوق الجمعة',
          address: 'شارع الوادي، مبنى 12',
          verified: true,
          featured: true,
          rating: 4.5,
          reviewsCount: 132,
          totalEmployees: 45,
          activeProjects: 12,
          status: 'APPROVED',
          businessType: ['نقل', 'لوجستيات'],
          specialties: ['نقل سيارات', 'تخزين', 'تغليف'],
          owner: {
            id: 'u1',
            name: 'محمد علي',
            phone: '0911111111',
            email: 'owner@company.ly',
            verified: true,
            accountType: 'COMPANY',
          },
        },
        {
          id: '2',
          name: 'الشركة الهندسية الحديثة',
          description: 'شركة متخصصة في الاستشارات الهندسية وتصميم المشاريع المعمارية',
          logo: defaultLogo,
          phone: '0923456789',
          email: 'eng@company.ly',
          website: 'modern-eng.ly',
          city: 'بنغازي',
          area: 'السلماني',
          address: 'طريق السلماني، مبنى 5',
          verified: false,
          featured: false,
          rating: 4.1,
          reviewsCount: 54,
          totalEmployees: 23,
          activeProjects: 7,
          status: 'PENDING',
          businessType: ['استشارات', 'تصميم'],
          specialties: ['تصميم معماري', 'إشراف'],
          owner: {
            id: 'u2',
            name: 'سالم عمران',
            phone: '0922222222',
            email: 'owner2@company.ly',
            verified: false,
            accountType: 'COMPANY',
          },
        },
      ]);
      setError(e?.message || 'حدث خطأ في جلب الشركات. تم استخدام بيانات افتراضية.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleFilterChange = (key: keyof FiltersState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '', city: 'all', businessType: 'all' });
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        !filters.search ||
        c.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (c.owner?.name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (c.area || '').toLowerCase().includes(filters.search.toLowerCase());

      const matchesCity = filters.city === 'all' || c.city === filters.city;

      const matchesBusinessType =
        filters.businessType === 'all' || c.businessType?.some((t) => t === filters.businessType);

      return matchesSearch && matchesCity && matchesBusinessType;
    });
  }, [companies, filters]);

  const cities = useMemo(
    () => Array.from(new Set(companies.map((c) => c.city).filter(Boolean))),
    [companies],
  );

  const businessTypes = useMemo(
    () => Array.from(new Set(companies.flatMap((c) => c.businessType || []).filter(Boolean))),
    [companies],
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.city !== 'all') count++;
    if (filters.businessType !== 'all') count++;
    return count;
  };

  const RatingStars = ({ rating = 0 }: { rating?: number }) => {
    const r = Math.round(rating);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${i <= r ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const CompanyCard = ({ company }: { company: Company }) => {
    return (
      <div className="group relative flex cursor-default flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg">
        {/* شارة مميزة */}
        {company.verified && (
          <div className="absolute right-2 top-2 z-10">
            <CheckBadgeIcon className="h-5 w-5 text-blue-500" />
          </div>
        )}

        {/* صورة/شعار الشركة */}
        <div className="relative flex h-44 w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
          <img
            src={company.logo || defaultLogo}
            alt={company.name}
            className="h-20 w-20 rounded-lg object-cover shadow"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== defaultLogo) target.src = defaultLogo;
            }}
          />
        </div>

        {/* تفاصيل */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-700">
              {company.name}
            </h3>

            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                <span>
                  {company.city}
                  {company.area ? `، ${company.area}` : ''}
                </span>
              </div>

              {typeof company.rating === 'number' && (
                <div className="flex items-center gap-1">
                  <RatingStars rating={company.rating} />
                  <span className="text-sm font-medium text-gray-700">
                    {(company.rating || 0).toFixed(1)}
                  </span>
                  {company.reviewsCount ? (
                    <span className="text-xs text-gray-500">({company.reviewsCount})</span>
                  ) : null}
                </div>
              )}
            </div>

            {/* أنواع الأعمال */}
            {Array.isArray(company.businessType) && company.businessType.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {company.businessType.slice(0, 3).map((t, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {t}
                  </span>
                ))}
                {company.businessType.length > 3 && (
                  <span className="text-xs text-gray-500">+{company.businessType.length - 3}</span>
                )}
              </div>
            )}

            {/* وصف مختصر */}
            {company.description && (
              <p className="line-clamp-2 text-sm text-gray-600">{company.description}</p>
            )}
          </div>

          {/* ذيل البطاقة */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {company.totalEmployees ? (
                <span className="mr-2">موظفون: {company.totalEmployees}</span>
              ) : (
                <span className="mr-2">موظفون: —</span>
              )}
              {company.activeProjects ? (
                <span>مشاريع نشطة: {company.activeProjects}</span>
              ) : (
                <span>مشاريع نشطة: —</span>
              )}
            </div>
            {company.owner?.name && (
              <div className="truncate text-xs text-gray-500">المالك: {company.owner.name}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Head>
        <title>الشركات | موقع مزاد السيارات</title>
        <meta
          name="description"
          content="تصفح الشركات والخدمات ذات الصلة في ليبيا بنفس تصميم خدمات النقل"
        />
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* الهيدر */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 p-4 shadow-md lg:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shadow-lg lg:h-14 lg:w-14">
                <BuildingOfficeIcon className="h-6 w-6 text-white lg:h-7 lg:w-7" />
              </div>
              <div>
                <h1 className="mb-1 text-2xl font-bold text-gray-900 lg:mb-1 lg:text-3xl">
                  الشركات
                </h1>
                <p className="text-sm leading-relaxed text-gray-600 lg:text-base">
                  استكشف الشركات والخدمات الموثوقة في ليبيا
                </p>
              </div>
            </div>

            {/* شريط الفلاتر المبسط */}
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="ابحث باسم الشركة، المدينة، أو المالك..."
                  className="w-72 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm transition-all duration-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
                <svg
                  className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                  />
                </svg>
              </div>

              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all duration-200 hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">جميع المدن</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={filters.businessType}
                onChange={(e) => handleFilterChange('businessType', e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all duration-200 hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">كل أنواع الأعمال</option>
                {businessTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {(filters.search || filters.city !== 'all' || filters.businessType !== 'all') && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <XMarkIcon className="h-4 w-4" /> مسح الفلاتر
                </button>
              )}
            </div>
          </div>
        </div>

        {/* عداد النتائج ومؤشرات الفلترة */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <BuildingOfficeIcon className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">
                  <span className="text-emerald-700">{filteredCompanies.length}</span> شركة
                </p>
                <div className="flex items-center gap-2">
                  {getActiveFiltersCount() > 0 && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                      مُفلترة
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    آخر تحديث: {new Date().toLocaleDateString('en-US')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* الشبكة أو التحميل */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <div className="h-44 w-full bg-gradient-to-br from-gray-200 to-gray-300" />
                <div className="space-y-3 p-4">
                  <div className="h-6 w-3/4 rounded bg-gradient-to-r from-gray-200 to-gray-300" />
                  <div className="h-4 w-1/2 rounded bg-gradient-to-r from-gray-200 to-gray-300" />
                  <div className="h-12 rounded bg-gradient-to-br from-gray-100 to-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200">
              <BuildingOfficeIcon className="h-14 w-14 text-emerald-600" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">لا توجد شركات مطابقة</h3>
            <p className="mx-auto mb-6 max-w-md text-lg text-gray-600">
              حاول تعديل معايير البحث أو إزالة بعض الفلاتر للحصول على نتائج أكثر
            </p>

            {getActiveFiltersCount() > 0 && (
              <button
                onClick={handleResetFilters}
                className="rounded-lg border-2 border-gray-300 px-8 py-3 font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50"
              >
                <XMarkIcon className="ml-2 inline h-5 w-5" />
                مسح جميع الفلاتر
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CompaniesPage;
