/**
 * صفحة الإعلانات المميزة لخدمات النقل
 * عرض وإدارة خدمات النقل المروجة والمميزة
 */
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
  StarIcon,
  TruckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface FeaturedService {
  id: string;
  title: string;
  truckType: string;
  serviceArea: string;
  contactPhone: string;
  promotionPackage: string;
  promotionDays: number;
  promotionStartDate: string;
  promotionEndDate: string;
  promotionPriority: number;
  views: number;
  status: string;
  featured: boolean;
  createdAt: string;
  users?: {
    name: string;
    phone: string;
  };
}

// باقات الترويج
const PROMOTION_PACKAGES = [
  { id: 'free', name: 'مجاني', color: 'slate', price: 0 },
  { id: 'bronze', name: 'برونزي', color: 'amber', price: 50 },
  { id: 'silver', name: 'فضي', color: 'slate', price: 100 },
  { id: 'gold', name: 'ذهبي', color: 'yellow', price: 200 },
  { id: 'premium', name: 'بريميوم', color: 'purple', price: 350 },
];

export default function FeaturedTransportPage() {
  const [services, setServices] = useState<FeaturedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchFeaturedServices();
  }, []);

  const fetchFeaturedServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transport?featured=true');
      if (res.ok) {
        const data = await res.json();
        const featuredServices = (data.services || []).filter(
          (s: FeaturedService) => s.featured || s.promotionPackage !== 'free',
        );
        setServices(featuredServices);

        // حساب الإحصائيات
        const now = new Date();
        const active = featuredServices.filter((s: FeaturedService) => {
          if (!s.promotionEndDate) return false;
          return new Date(s.promotionEndDate) > now;
        }).length;

        const revenue = featuredServices.reduce((sum: number, s: FeaturedService) => {
          const pkg = PROMOTION_PACKAGES.find((p) => p.id === s.promotionPackage);
          return sum + (pkg?.price || 0);
        }, 0);

        setStats({
          total: featuredServices.length,
          active,
          expired: featuredServices.length - active,
          revenue,
        });
      }
    } catch (error) {
      console.error('Error fetching featured services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPackageInfo = (packageId: string) => {
    return PROMOTION_PACKAGES.find((p) => p.id === packageId) || PROMOTION_PACKAGES[0];
  };

  const getRemainingDays = (endDate: string) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getPackageColor = (packageId: string) => {
    const colors: Record<string, string> = {
      free: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      bronze: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      silver: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
      gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      premium: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return colors[packageId] || colors.free;
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.truckType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.users?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPackage = filterPackage === 'all' || service.promotionPackage === filterPackage;

    return matchesSearch && matchesPackage;
  });

  return (
    <AdminLayout title="الإعلانات المميزة - خدمات النقل">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-white">
            <SparklesIcon className="h-8 w-8 text-amber-400" />
            الإعلانات المميزة
          </h1>
          <p className="mt-1 text-slate-400">إدارة خدمات النقل المروجة والمميزة</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchFeaturedServices}
            className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-slate-300 transition-colors hover:bg-slate-600"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          <Link
            href="/admin/transport/add"
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-white transition-colors hover:bg-amber-700"
          >
            <PlusIcon className="h-5 w-5" />
            إضافة خدمة مميزة
          </Link>
        </div>
      </div>

      {/* إحصائيات */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2">
              <StarIcon className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">إجمالي المميزة</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">نشطة حالياً</p>
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/20 p-2">
              <ClockIcon className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">منتهية الصلاحية</p>
              <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-blue-400">{stats.revenue} د.ل</p>
            </div>
          </div>
        </div>
      </div>

      {/* فلاتر البحث */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالعنوان أو نوع الساحبة أو اسم المالك..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2.5 pl-4 pr-10 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <select
          value={filterPackage}
          onChange={(e) => setFilterPackage(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="all">جميع الباقات</option>
          {PROMOTION_PACKAGES.filter((p) => p.id !== 'free').map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name} ({pkg.price} د.ل)
            </option>
          ))}
        </select>
      </div>

      {/* قائمة الخدمات المميزة */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center">
          <SparklesIcon className="mx-auto mb-4 h-12 w-12 text-slate-600" />
          <h3 className="mb-2 text-lg font-medium text-white">لا توجد إعلانات مميزة</h3>
          <p className="mb-4 text-slate-400">
            {searchTerm || filterPackage !== 'all'
              ? 'لا توجد نتائج مطابقة للبحث'
              : 'لم يتم ترويج أي خدمة نقل بعد'}
          </p>
          <Link
            href="/admin/transport/add"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
          >
            <PlusIcon className="h-5 w-5" />
            إضافة خدمة مميزة
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service) => {
            const pkgInfo = getPackageInfo(service.promotionPackage);
            const remainingDays = getRemainingDays(service.promotionEndDate);
            const isExpired = remainingDays === 0 && service.promotionPackage !== 'free';

            return (
              <div
                key={service.id}
                className={`rounded-xl border bg-slate-800 p-5 transition-all hover:border-slate-600 ${
                  isExpired ? 'border-red-500/30 opacity-75' : 'border-slate-700'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* معلومات الخدمة */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-xl p-3 ${
                        isExpired ? 'bg-red-500/20' : 'bg-amber-500/20'
                      }`}
                    >
                      <TruckIcon
                        className={`h-8 w-8 ${isExpired ? 'text-red-400' : 'text-amber-400'}`}
                      />
                    </div>

                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-white">
                        {service.title || service.truckType}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span>{service.truckType}</span>
                        <span>•</span>
                        <span>{service.users?.name || 'غير محدد'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <EyeIcon className="h-4 w-4" />
                          {service.views || 0} مشاهدة
                        </span>
                      </div>

                      {/* شارة الباقة */}
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${getPackageColor(
                            service.promotionPackage,
                          )}`}
                        >
                          <StarIcon className="h-3.5 w-3.5" />
                          {pkgInfo.name}
                        </span>

                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                            <XCircleIcon className="h-3.5 w-3.5" />
                            منتهية الصلاحية
                          </span>
                        ) : service.promotionPackage !== 'free' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                            <ClockIcon className="h-3.5 w-3.5" />
                            متبقي {remainingDays} يوم
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-600"
                      title="عرض التفاصيل"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>

                    {(isExpired || service.promotionPackage === 'free') && (
                      <button className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white transition-colors hover:bg-amber-700">
                        <SparklesIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* تفاصيل الترويج */}
                {service.promotionPackage !== 'free' && (
                  <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-slate-700/50 p-3 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-slate-400">تاريخ البدء</p>
                      <p className="text-sm text-white">
                        {service.promotionStartDate
                          ? new Date(service.promotionStartDate).toLocaleDateString('ar-LY')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">تاريخ الانتهاء</p>
                      <p className="text-sm text-white">
                        {service.promotionEndDate
                          ? new Date(service.promotionEndDate).toLocaleDateString('ar-LY')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">مدة الترويج</p>
                      <p className="text-sm text-white">{service.promotionDays || 0} يوم</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">الأولوية</p>
                      <p className="text-sm text-white">{service.promotionPriority || 0}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
        <span>إجمالي: {filteredServices.length} خدمة مميزة</span>
        <Link
          href="/admin/transport"
          className="text-amber-400 hover:text-amber-300 hover:underline"
        >
          العودة لخدمات النقل ←
        </Link>
      </div>
    </AdminLayout>
  );
}
