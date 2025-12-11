import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';

export default function CreateZonePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: 'HOME_TOP',
    type: 'STATIC',
    maxAds: 1,
    width: '',
    height: '',
    autoRotate: false,
    rotateInterval: 5,
    isPopup: false,
    popupDelay: 0,
    popupFrequency: 'ONCE_PER_SESSION',
    isActive: true,
  });

  const locations = [
    { value: 'HOME_TOP', label: 'الصفحة الرئيسية - أعلى' },
    { value: 'HOME_MIDDLE', label: 'الصفحة الرئيسية - وسط' },
    { value: 'HOME_BOTTOM', label: 'الصفحة الرئيسية - أسفل' },
    { value: 'MARKETPLACE_TOP', label: 'السوق - أعلى' },
    { value: 'MARKETPLACE_BOTTOM', label: 'السوق - أسفل' },
    { value: 'AUCTIONS_TOP', label: 'المزادات - أعلى' },
    { value: 'AUCTIONS_BOTTOM', label: 'المزادات - أسفل' },
    { value: 'TRANSPORT_TOP', label: 'النقل - أعلى' },
    { value: 'TRANSPORT_BOTTOM', label: 'النقل - أسفل' },
    { value: 'YARDS_TOP', label: 'الساحات - أعلى' },
    { value: 'YARDS_BOTTOM', label: 'الساحات - أسفل' },
    { value: 'SIDEBAR', label: 'الشريط الجانبي' },
    { value: 'HEADER', label: 'الهيدر' },
    { value: 'FOOTER', label: 'الفوتر' },
  ];

  const types = [
    { value: 'STATIC', label: 'صورة ثابتة' },
    { value: 'SLIDER', label: 'سلايدر' },
    { value: 'ROTATING', label: 'متغير (Rotating)' },
    { value: 'GRID', label: 'شبكة (Grid)' },
    { value: 'CAROUSEL', label: 'كاروسيل' },
    { value: 'POPUP', label: 'نافذة منبثقة (Popup)' },
    { value: 'STICKY', label: 'ثابت (Sticky)' },
    { value: 'EXPANDABLE', label: 'قابل للتوسيع' },
    { value: 'INTERSTITIAL', label: 'بيني (Interstitial)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/ads/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create zone');
      }

      router.push('/admin/ads/zones');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? Number(value)
            : value,
    }));
  };

  return (
    <AdminLayout title="إضافة مساحة جديدة">
      <Head>
        <title>إضافة مساحة جديدة | سوق مزاد</title>
      </Head>

      <div className="mb-8">
        <Link
          href="/admin/ads/zones"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowRightIcon className="h-4 w-4" />
          رجوع للقائمة
        </Link>
        <h1 className="text-2xl font-bold text-white">إضافة مساحة إعلانية جديدة</h1>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
        {error && <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-red-500">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">اسم المساحة</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                placeholder="مثال: بانر الصفحة الرئيسية"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">الموقع</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">النوع</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
              >
                {types.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                أقصى عدد للإعلانات
              </label>
              <input
                type="number"
                name="maxAds"
                min="1"
                value={formData.maxAds}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                العرض (px) - اختياري
              </label>
              <input
                type="text"
                name="width"
                value={formData.width}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                placeholder="مثال: 1200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                الارتفاع (px) - اختياري
              </label>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                placeholder="مثال: 400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">الوصف</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="وصف إضافي للمساحة..."
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
              />
              مفعل
            </label>

            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                name="autoRotate"
                checked={formData.autoRotate}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
              />
              تدوير تلقائي
            </label>
          </div>

          {formData.autoRotate && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                فاصل التدوير (ثواني)
              </label>
              <input
                type="number"
                name="rotateInterval"
                min="1"
                value={formData.rotateInterval}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Link
              href="/admin/ads/zones"
              className="rounded-xl border border-slate-700 px-6 py-3 font-bold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ المساحة'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
