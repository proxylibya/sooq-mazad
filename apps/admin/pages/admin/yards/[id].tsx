/**
 * صفحة تعديل ساحة
 * Edit Yard Page
 * يستخدم البيانات المشتركة الموحدة
 */

import {
  ArrowRightIcon,
  BuildingOfficeIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import SearchableSelect from '../../../components/ui/SearchableSelect';

// استيراد البيانات المشتركة الموحدة - 72 مدينة ليبية
import { LIBYAN_CITIES, VEHICLE_TYPES, WEEKDAYS, YARD_SERVICES } from '../../../lib/shared-data';

interface YardFormData {
  name: string;
  description: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  email: string;
  auctionDays: string[];
  auctionTimeFrom: string;
  auctionTimeTo: string;
  capacity: string;
  services: string[];
  vehicleTypes: string[];
  managerName: string;
  managerPhone: string;
  status: string;
  verified: boolean;
  featured: boolean;
}

export default function EditYardPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<YardFormData>({
    name: '',
    description: '',
    city: '',
    area: '',
    address: '',
    phone: '',
    email: '',
    auctionDays: [],
    auctionTimeFrom: '10:00',
    auctionTimeTo: '14:00',
    capacity: '',
    services: [],
    vehicleTypes: ['CARS'],
    managerName: '',
    managerPhone: '',
    status: 'ACTIVE',
    verified: false,
    featured: false,
  });

  useEffect(() => {
    if (id) {
      fetchYard();
    }
  }, [id]);

  const fetchYard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/yards?id=${id}`);
      const data = await res.json();

      if (data.success && data.data && data.data.length > 0) {
        const yard = data.data[0];
        setFormData({
          name: yard.name || '',
          description: yard.description || '',
          city: yard.city || '',
          area: yard.area || '',
          address: yard.address || '',
          phone: yard.phone || '',
          email: yard.email || '',
          auctionDays: yard.auctionDays || [],
          auctionTimeFrom: yard.auctionTimeFrom || '10:00',
          auctionTimeTo: yard.auctionTimeTo || '14:00',
          capacity: yard.capacity?.toString() || '',
          services: yard.services || [],
          vehicleTypes: yard.vehicleTypes || ['CARS'],
          managerName: yard.managerName || '',
          managerPhone: yard.managerPhone || '',
          status: yard.status || 'ACTIVE',
          verified: yard.verified || false,
          featured: yard.featured || false,
        });
      } else {
        setError('الساحة غير موجودة');
      }
    } catch (err) {
      setError('حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof YardFormData>(field: K, value: YardFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'auctionDays' | 'services' | 'vehicleTypes', value: string) => {
    setFormData((prev) => {
      const arr = prev[field];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...arr, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/yards?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('تم تحديث الساحة بنجاح');
        setTimeout(() => router.push('/admin/yards'), 1500);
      } else {
        setError(data.error || 'حدث خطأ أثناء التحديث');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="تعديل الساحة">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="تعديل الساحة">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/yards" className="flex items-center gap-1 hover:text-white">
          <ArrowRightIcon className="h-4 w-4" />
          الساحات
        </Link>
        <span>/</span>
        <span className="text-white">تعديل الساحة</span>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/20 p-2">
            <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">تعديل الساحة</h1>
            <p className="text-sm text-slate-400">{formData.name}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/20 p-3 text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/20 p-3 text-green-400">
            {success}
          </div>
        )}

        {/* Status & Features */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">الحالة والميزات</h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formData.status === 'ACTIVE'}
                onChange={(e) => updateField('status', e.target.checked ? 'ACTIVE' : 'INACTIVE')}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-slate-300">نشطة</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formData.verified}
                onChange={(e) => updateField('verified', e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-slate-300">موثقة</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => updateField('featured', e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-slate-300">مميزة</span>
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <BuildingOfficeIcon className="h-5 w-5 text-blue-400" />
            المعلومات الأساسية
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-slate-400">اسم الساحة *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-slate-400">وصف الساحة</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">سعة السيارات</label>
              <input
                type="number"
                min="0"
                value={formData.capacity}
                onChange={(e) => updateField('capacity', e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <MapPinIcon className="h-5 w-5 text-green-400" />
            الموقع
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-400">المدينة *</label>
              <SearchableSelect
                value={formData.city}
                onChange={(value) => updateField('city', value)}
                options={LIBYAN_CITIES}
                placeholder="اختر المدينة"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">المنطقة</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => updateField('area', e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-slate-400">العنوان التفصيلي</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <PhoneIcon className="h-5 w-5 text-yellow-400" />
            معلومات الاتصال
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-400">رقم الهاتف</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">اسم المدير</label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => updateField('managerName', e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">هاتف المدير</label>
              <input
                type="tel"
                value={formData.managerPhone}
                onChange={(e) => updateField('managerPhone', e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Auction Schedule */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <ClockIcon className="h-5 w-5 text-purple-400" />
            جدول المزادات
          </h2>
          <div className="mb-4">
            <label className="mb-2 block text-sm text-slate-400">أيام المزاد</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleArrayField('auctionDays', day.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    formData.auctionDays.includes(day.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-400">وقت البداية</label>
              <input
                type="time"
                value={formData.auctionTimeFrom}
                onChange={(e) => updateField('auctionTimeFrom', e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">وقت النهاية</label>
              <input
                type="time"
                value={formData.auctionTimeTo}
                onChange={(e) => updateField('auctionTimeTo', e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Services & Vehicle Types */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">الخدمات وأنواع المركبات</h2>
          <div className="mb-4">
            <label className="mb-2 block text-sm text-slate-400">الخدمات المتاحة</label>
            <div className="flex flex-wrap gap-2">
              {YARD_SERVICES.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleArrayField('services', service.id)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    formData.services.includes(service.id)
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span>{service.icon}</span>
                  {service.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-400">أنواع المركبات</label>
            <div className="flex flex-wrap gap-2">
              {VEHICLE_TYPES.map((vt) => (
                <button
                  key={vt.value}
                  type="button"
                  onClick={() => toggleArrayField('vehicleTypes', vt.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    formData.vehicleTypes.includes(vt.value)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {vt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          <Link
            href="/admin/yards"
            className="rounded-lg border border-slate-600 bg-slate-700 px-6 py-3 text-center text-white transition-colors hover:bg-slate-600"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
