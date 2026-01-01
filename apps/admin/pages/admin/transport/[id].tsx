import {
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  SparklesIcon,
  StarIcon,
  TruckIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface TransportService {
  id: string;
  title: string;
  description: string;
  truckType: string;
  capacity: number;
  serviceArea: string;
  pricePerKm: number | null;
  availableDays: string;
  contactPhone: string;
  images: string;
  features: string;
  status: string;
  featured: boolean;
  promotionPackage: string | null;
  promotionDays: number;
  promotionStartDate: string | null;
  promotionEndDate: string | null;
  promotionPriority: number;
  commission: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    verified: boolean;
    accountType: string;
  };
}

function TransportServiceDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [service, setService] = useState<TransportService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transport/${id}`);
      const data = await res.json();
      if (data.success) {
        setService(data.service);
      } else {
        setError(data.message || 'فشل في جلب البيانات');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!service) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/transport?id=${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setService({ ...service, status: newStatus });
        alert('تم تحديث الحالة بنجاح');
      } else {
        alert(data.message || 'فشل التحديث');
      }
    } catch (err) {
      alert('حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  // ترجمة أنواع المركبات للعربية
  const getTruckTypeArabic = (type: string): string => {
    const types: Record<string, string> = {
      flatbed: 'سطحة مسطحة',
      enclosed: 'مغلقة',
      tow_truck: 'ساحبة',
      crane: 'رافعة',
      refrigerated: 'مبردة',
      tanker: 'صهريج',
      pickup: 'بيك أب',
      trailer: 'مقطورة',
      heavy_duty: 'شاحنة ثقيلة',
      light_duty: 'شاحنة خفيفة',
      car_carrier: 'ناقلة سيارات',
      lowboy: 'منخفضة',
      dump_truck: 'قلاب',
      box_truck: 'صندوق مغلق',
    };
    return types[type?.toLowerCase()] || type || 'غير محدد';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
            <CheckCircleIcon className="h-4 w-4" />
            نشط
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/20 px-3 py-1 text-sm font-medium text-slate-400">
            <XCircleIcon className="h-4 w-4" />
            غير نشط
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-400">
            <XCircleIcon className="h-4 w-4" />
            موقوف
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-medium text-yellow-400">
            <ClockIcon className="h-4 w-4" />
            {status}
          </span>
        );
    }
  };

  const getPromotionBadge = (pkg: string | null) => {
    if (!pkg || pkg === 'free') return null;
    const colors: Record<string, string> = {
      basic: 'bg-blue-500/20 text-blue-400',
      premium: 'bg-green-500/20 text-green-400',
      vip: 'bg-amber-500/20 text-amber-400',
      bronze: 'bg-amber-500/20 text-amber-400',
      silver: 'bg-slate-500/20 text-slate-300',
      gold: 'bg-yellow-500/20 text-yellow-400',
    };
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${colors[pkg] || 'bg-purple-100 text-purple-800'}`}
      >
        <SparklesIcon className="h-4 w-4" />
        {pkg.toUpperCase()}
      </span>
    );
  };

  const parseImages = (images: string): string[] => {
    if (!images) return [];
    return images
      .split(',')
      .map((img) => img.trim())
      .filter(Boolean);
  };

  const parseFeatures = (features: string): string[] => {
    if (!features) return [];
    return features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
  };

  const parseDays = (days: string): string[] => {
    if (!days) return [];
    return days
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !service) {
    return (
      <AdminLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <XCircleIcon className="h-16 w-16 text-red-400" />
          <p className="text-lg text-slate-400">{error || 'الخدمة غير موجودة'}</p>
          <Link
            href="/admin/transport"
            className="flex items-center gap-2 text-blue-400 hover:underline"
          >
            <ArrowRightIcon className="h-4 w-4" />
            العودة للقائمة
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const images = parseImages(service.images);
  const features = parseFeatures(service.features);
  const workDays = parseDays(service.availableDays);
  const cities = parseDays(service.serviceArea);

  return (
    <>
      <Head>
        <title>{service.title} - تفاصيل خدمة النقل</title>
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/transport"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">{service.title}</h1>
                <p className="text-sm text-slate-400">معرف: {service.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(service.status)}
              {getPromotionBadge(service.promotionPackage)}
              {service.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-sm font-medium text-purple-400">
                  <StarIcon className="h-4 w-4" />
                  مميز
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Images */}
              {images.length > 0 && (
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">الصور</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {images.map((img, i) => (
                      <div key={i} className="overflow-hidden rounded-lg">
                        <img src={img} alt={`صورة ${i + 1}`} className="h-32 w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">الوصف</h3>
                <p className="whitespace-pre-wrap text-slate-300">
                  {service.description || 'لا يوجد وصف'}
                </p>
              </div>

              {/* Service Details */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">تفاصيل الخدمة</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-4">
                    <TruckIcon className="h-6 w-6 text-blue-400" />
                    <div>
                      <p className="text-sm text-slate-400">نوع المركبة</p>
                      <p className="font-medium text-white">
                        {getTruckTypeArabic(service.truckType)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-4">
                    <UserIcon className="h-6 w-6 text-green-400" />
                    <div>
                      <p className="text-sm text-slate-400">السعة</p>
                      <p className="font-medium text-white">{service.capacity} طن</p>
                    </div>
                  </div>

                  {service.pricePerKm && (
                    <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-4">
                      <CurrencyDollarIcon className="h-6 w-6 text-amber-400" />
                      <div>
                        <p className="text-sm text-slate-400">السعر لكل كم</p>
                        <p className="font-medium text-white">{service.pricePerKm} د.ل</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-4">
                    <PhoneIcon className="h-6 w-6 text-purple-400" />
                    <div>
                      <p className="text-sm text-slate-400">رقم التواصل</p>
                      <p className="font-medium text-white" dir="ltr">
                        {service.contactPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cities */}
              {cities.length > 0 && (
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <MapPinIcon className="h-5 w-5 text-red-400" />
                    مناطق الخدمة
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((city, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Days */}
              {workDays.length > 0 && (
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <CalendarIcon className="h-5 w-5 text-green-400" />
                    أيام العمل
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {workDays.map((day, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {features.length > 0 && (
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <SparklesIcon className="h-5 w-5 text-purple-400" />
                    المميزات
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-400"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">الإجراءات</h3>
                <div className="space-y-3">
                  {service.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleStatusChange('ACTIVE')}
                      disabled={actionLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      تفعيل الخدمة
                    </button>
                  )}
                  {service.status !== 'INACTIVE' && (
                    <button
                      onClick={() => handleStatusChange('INACTIVE')}
                      disabled={actionLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                      <XCircleIcon className="h-5 w-5" />
                      تعطيل الخدمة
                    </button>
                  )}
                  {service.status !== 'SUSPENDED' && (
                    <button
                      onClick={() => handleStatusChange('SUSPENDED')}
                      disabled={actionLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircleIcon className="h-5 w-5" />
                      إيقاف الخدمة
                    </button>
                  )}
                  <Link
                    href={`/admin/transport/edit/${service.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-500/10 px-4 py-2 text-blue-400 hover:bg-blue-500/20"
                  >
                    <PencilIcon className="h-5 w-5" />
                    تعديل الخدمة
                  </Link>
                </div>
              </div>

              {/* Owner Info */}
              {service.user && (
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">معلومات المالك</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                        <UserIcon className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{service.user.name}</p>
                        <p className="text-sm text-slate-400">{service.user.accountType}</p>
                      </div>
                      {service.user.verified && (
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                    <div className="border-t border-slate-700 pt-3">
                      <p className="text-sm text-slate-400">رقم الهاتف</p>
                      <p className="font-medium text-white" dir="ltr">
                        {service.user.phone}
                      </p>
                    </div>
                    <Link
                      href={`/admin/users/${service.user.id}`}
                      className="block text-center text-sm text-blue-400 hover:underline"
                    >
                      عرض ملف المستخدم
                    </Link>
                  </div>
                </div>
              )}

              {/* Promotion Info */}
              {service.promotionPackage && service.promotionPackage !== 'free' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-400">
                    <SparklesIcon className="h-5 w-5" />
                    معلومات الترويج
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-400/80">الباقة:</span>
                      <span className="font-medium text-amber-300">
                        {service.promotionPackage.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-400/80">المدة:</span>
                      <span className="font-medium text-amber-300">
                        {service.promotionDays} يوم
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-400/80">الأولوية:</span>
                      <span className="font-medium text-amber-300">
                        {service.promotionPriority}
                      </span>
                    </div>
                    {service.promotionEndDate && (
                      <div className="flex justify-between">
                        <span className="text-amber-400/80">ينتهي:</span>
                        <span className="font-medium text-amber-300">
                          {new Date(service.promotionEndDate).toLocaleDateString('ar-LY')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">التواريخ</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">تاريخ الإنشاء:</span>
                    <span className="text-white">
                      {new Date(service.createdAt).toLocaleDateString('ar-LY')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">آخر تحديث:</span>
                    <span className="text-white">
                      {new Date(service.updatedAt).toLocaleDateString('ar-LY')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default TransportServiceDetailsPage;
