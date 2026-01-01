/**
 * صفحة تعديل خدمة النقل - نسخة محسنة ومكتملة
 * تتضمن جميع العناصر: رفع الصور، أيام العمل، باقات الترويج، وصف الساحبة
 */
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhotoIcon,
  StarIcon,
  TruckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import TransportImageUploader from '../../../../components/transport/TransportImageUploader';
import StickyActionBar from '../../../../components/ui/StickyActionBar';

// استيراد البيانات المشتركة الموحدة
import { LIBYAN_CITIES, TRANSPORT_VEHICLE_TYPES } from '../../../../lib/shared-data';

// أيام الأسبوع
const WEEK_DAYS = [
  { value: 'الأحد', label: 'الأحد' },
  { value: 'الاثنين', label: 'الاثنين' },
  { value: 'الثلاثاء', label: 'الثلاثاء' },
  { value: 'الأربعاء', label: 'الأربعاء' },
  { value: 'الخميس', label: 'الخميس' },
  { value: 'الجمعة', label: 'الجمعة' },
  { value: 'السبت', label: 'السبت' },
];

// باقات الترويج
const PROMOTION_PACKAGES = [
  {
    id: 'free',
    name: 'مجاني',
    price: 0,
    days: 0,
    features: ['ظهور عادي في نتائج البحث'],
    color: 'slate',
    popular: false,
  },
  {
    id: 'bronze',
    name: 'برونزي',
    price: 50,
    days: 7,
    features: ['ظهور مميز لمدة 7 أيام', 'شارة برونزية', 'أولوية في البحث'],
    color: 'amber',
    popular: false,
  },
  {
    id: 'silver',
    name: 'فضي',
    price: 100,
    days: 15,
    features: ['ظهور مميز لمدة 15 يوم', 'شارة فضية', 'أولوية عالية في البحث', 'إشعارات للعملاء'],
    color: 'slate',
    popular: false,
  },
  {
    id: 'gold',
    name: 'ذهبي',
    price: 200,
    days: 30,
    features: [
      'ظهور مميز لمدة 30 يوم',
      'شارة ذهبية',
      'أولوية قصوى',
      'إشعارات + ترويج',
      'دعم أولوية',
    ],
    color: 'yellow',
    popular: true,
  },
  {
    id: 'premium',
    name: 'بريميوم',
    price: 350,
    days: 60,
    features: [
      'ظهور مميز لمدة 60 يوم',
      'شارة بريميوم',
      'ظهور في الصفحة الرئيسية',
      'ترويج على وسائل التواصل',
      'دعم VIP',
    ],
    color: 'purple',
    popular: false,
  },
];

interface FormData {
  title: string;
  description: string;
  truckType: string;
  capacity: number;
  cities: string[];
  availableDays: string[];
  contactPhone: string;
  images: string[];
  features: string[];
  status: string;
  companyName: string;
  ownerName: string;
  truckDescription: string;
  promotionPackage: string;
  promotionDays: number;
  featured: boolean;
  pricePerKm: number | null;
}

function EditTransportServicePage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    truckType: 'flatbed',
    capacity: 1,
    cities: [],
    availableDays: [],
    contactPhone: '',
    images: [],
    features: [],
    status: 'ACTIVE',
    companyName: '',
    ownerName: '',
    truckDescription: '',
    promotionPackage: 'free',
    promotionDays: 0,
    featured: false,
    pricePerKm: null,
  });

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
      if (data.success && data.service) {
        const s = data.service;
        setFormData({
          title: s.title || '',
          description: s.description || '',
          truckType: s.truckType || 'flatbed',
          capacity: s.capacity || 1,
          cities: s.serviceArea
            ? s.serviceArea
                .split(',')
                .map((c: string) => c.trim())
                .filter(Boolean)
            : [],
          availableDays: s.availableDays
            ? s.availableDays
                .split(',')
                .map((d: string) => d.trim())
                .filter(Boolean)
            : [],
          contactPhone: s.contactPhone || '',
          images: s.images
            ? s.images
                .split(',')
                .map((i: string) => i.trim())
                .filter(Boolean)
            : [],
          features: s.features
            ? s.features
                .split(',')
                .map((f: string) => f.trim())
                .filter(Boolean)
            : [],
          status: s.status || 'ACTIVE',
          companyName: s.user?.name || s.title || '',
          ownerName: s.user?.name || '',
          truckDescription: s.description || '',
          promotionPackage: s.promotionPackage || 'free',
          promotionDays: s.promotionDays || 0,
          featured: s.featured || false,
          pricePerKm: s.pricePerKm || null,
        });
      } else {
        setError(data.message || 'فشل في جلب البيانات');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // التحقق من البيانات المطلوبة
    if (!formData.title || formData.cities.length === 0) {
      setError('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/transport/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          truckType: formData.truckType,
          capacity: formData.capacity,
          serviceArea: formData.cities,
          availableDays: formData.availableDays,
          contactPhone: formData.contactPhone,
          images: formData.images,
          features: formData.features,
          status: formData.status,
          promotionPackage: formData.promotionPackage,
          promotionDays: formData.promotionDays,
          featured: formData.featured,
          pricePerKm: formData.pricePerKm,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage('تم تحديث الخدمة بنجاح');
        setTimeout(() => {
          router.push(`/admin/transport/${id}`);
        }, 1500);
      } else {
        setError(data.message || 'فشل في تحديث الخدمة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  const toggleCity = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter((c) => c !== city)
        : [...prev.cities, city],
    }));
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleImagesChange = (newImages: string[]) => {
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  // فلترة المدن حسب البحث
  const filteredCities = useMemo(() => {
    if (!citySearch) return LIBYAN_CITIES;
    return LIBYAN_CITIES.filter((city) => city.toLowerCase().includes(citySearch.toLowerCase()));
  }, [citySearch]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-lg text-red-400">{error}</p>
          <Link href="/admin/transport" className="text-blue-400 hover:underline">
            العودة للقائمة
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>تعديل خدمة النقل</title>
      </Head>

      <AdminLayout>
        <div className="pb-24">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Link
              href={`/admin/transport/${id}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">تعديل خدمة النقل</h1>
              <p className="text-sm text-slate-400">معرف: {id}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <TruckIcon className="h-5 w-5 text-blue-400" />
                المعلومات الأساسية
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    عنوان الخدمة *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    نوع المركبة *
                  </label>
                  <select
                    value={formData.truckType}
                    onChange={(e) => setFormData({ ...formData, truckType: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  >
                    {TRANSPORT_VEHICLE_TYPES.map((type) => (
                      <option key={type.id} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    السعة (طن) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    رقم التواصل *
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="ACTIVE">نشط</option>
                    <option value="INACTIVE">غير نشط</option>
                    <option value="SUSPENDED">موقوف</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">الوصف</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="وصف تفصيلي للخدمة..."
                  />
                </div>
              </div>
            </div>

            {/* Cities */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <MapPinIcon className="h-5 w-5 text-red-400" />
                مناطق الخدمة
              </h3>

              {/* Selected Cities */}
              {formData.cities.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {formData.cities.map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400"
                    >
                      {city}
                      <button
                        type="button"
                        onClick={() => toggleCity(city)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search */}
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="ابحث عن مدينة..."
                className="mb-4 w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />

              {/* Cities Grid */}
              <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto md:grid-cols-4 lg:grid-cols-5">
                {filteredCities.map((city) => (
                  <label
                    key={city}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-all ${
                      formData.cities.includes(city)
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.cities.includes(city)}
                      onChange={() => toggleCity(city)}
                      className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-blue-600"
                    />
                    <span className="text-sm">{city}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Days */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <ClockIcon className="h-5 w-5 text-purple-400" />
                أيام العمل
              </h3>
              <div className="flex flex-wrap gap-3">
                {WEEK_DAYS.map((day) => (
                  <label
                    key={day.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-all ${
                      formData.availableDays.includes(day.value)
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.availableDays.includes(day.value)}
                      onChange={() => toggleDay(day.value)}
                      className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-green-600"
                    />
                    <span className="text-sm font-medium">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images Section */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <PhotoIcon className="h-5 w-5 text-blue-400" />
                صور الساحبة
              </h3>
              <TransportImageUploader
                images={formData.images}
                onImagesChange={handleImagesChange}
                maxImages={5}
              />
            </div>

            {/* Promotion Packages */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                باقة الترويج
              </h3>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                {PROMOTION_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        promotionPackage: pkg.id,
                        promotionDays: pkg.days,
                        featured: pkg.id !== 'free',
                      })
                    }
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      formData.promotionPackage === pkg.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-black">
                        الأكثر شعبية
                      </span>
                    )}
                    <div className="text-center">
                      <h4 className="mb-1 font-bold text-white">{pkg.name}</h4>
                      <p className="text-2xl font-bold text-blue-400">
                        {pkg.price === 0 ? 'مجاني' : `${pkg.price} د.ل`}
                      </p>
                      {pkg.days > 0 && <p className="text-sm text-slate-400">{pkg.days} يوم</p>}
                      <ul className="mt-3 space-y-1 text-right text-xs text-slate-400">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <CheckCircleIcon className="h-3 w-3 text-green-400" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg">
              <CheckCircleIcon className="h-5 w-5" />
              {successMessage}
            </div>
          )}
          {error && !loading && (
            <div className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-white shadow-lg">
              <XMarkIcon className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* StickyActionBar */}
          <StickyActionBar
            leftButton={{
              label: 'إلغاء',
              onClick: () => router.push(`/admin/transport/${id}`),
              variant: 'secondary',
              icon: 'prev',
            }}
            rightButton={{
              label: 'حفظ التغييرات',
              onClick: () => handleSubmit(),
              variant: 'success',
              loading: saving,
              loadingText: 'جاري الحفظ...',
              icon: <CheckCircleIcon className="h-5 w-5" />,
            }}
          />
        </div>
      </AdminLayout>
    </>
  );
}

export default EditTransportServicePage;
