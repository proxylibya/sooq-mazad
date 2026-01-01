/**
 * صفحة إضافة ساحة جديدة
 * Add New Yard Page
 * يستخدم البيانات المشتركة الموحدة
 */

import {
  BuildingOfficeIcon,
  ChevronDownIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import StickyActionBar from '../../../components/ui/StickyActionBar';

// استيراد البيانات المشتركة الموحدة
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
}

// مكون قائمة منسدلة مع بحث - موحد للوحة التحكم
interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = 'اختر...',
  required,
  disabled,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-lg border bg-slate-700 px-4 py-2 text-right transition-colors focus:outline-none focus:ring-2 ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } border-slate-600 focus:border-blue-500 focus:ring-blue-500/30`}
      >
        <span className={value ? 'text-white' : 'text-slate-400'}>{value || placeholder}</span>
        <ChevronDownIcon
          className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 shadow-xl">
          {/* حقل البحث */}
          <div className="sticky top-0 border-b border-slate-600 bg-slate-800 p-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث..."
                className="w-full rounded-md border border-slate-600 bg-slate-700 py-2 pl-3 pr-9 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* قائمة الخيارات */}
          <div className="max-h-52 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-4 py-2 text-right text-sm transition-colors hover:bg-slate-700 ${
                    value === opt ? 'bg-blue-600 text-white' : 'text-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-sm text-slate-400">لا توجد نتائج</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AddYardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
  });

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
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/yards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin/yards');
      } else {
        setError(data.error || 'حدث خطأ أثناء الإنشاء');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="إضافة ساحة جديدة">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/20 p-2">
            <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">إضافة ساحة جديدة</h1>
            <p className="text-sm text-slate-400">إنشاء ساحة مزادات على أرض الواقع</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/20 p-3 text-red-400">
            {error}
          </div>
        )}

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
                placeholder="مثال: ساحة مزاد طرابلس المركزية"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-slate-400">وصف الساحة</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                placeholder="وصف مختصر للساحة وخدماتها..."
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">سعة السيارات</label>
              <input
                type="number"
                min="0"
                value={formData.capacity}
                onChange={(e) => updateField('capacity', e.target.value)}
                placeholder="عدد السيارات التي تستوعبها الساحة"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
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
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">المنطقة</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => updateField('area', e.target.value)}
                placeholder="مثال: الهضبة"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-slate-400">العنوان التفصيلي</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="العنوان بالتفصيل"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
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
                placeholder="0910000000"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">اسم المدير</label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => updateField('managerName', e.target.value)}
                placeholder="اسم مسؤول الساحة"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">هاتف المدير</label>
              <input
                type="tel"
                value={formData.managerPhone}
                onChange={(e) => updateField('managerPhone', e.target.value)}
                placeholder="رقم هاتف المدير"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
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
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    formData.vehicleTypes.includes(vt.value)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span>{vt.icon}</span>
                  {vt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* شريط الأزرار الثابت */}
      <StickyActionBar
        leftButton={{
          label: 'إلغاء',
          onClick: () => router.back(),
          variant: 'secondary',
        }}
        rightButton={{
          label: 'إنشاء الساحة',
          onClick: () => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
          },
          variant: 'primary',
          disabled: loading,
          loading: loading,
          loadingText: 'جاري الإنشاء...',
        }}
      />
    </AdminLayout>
  );
}
