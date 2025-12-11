import { ArrowLeftIcon, CheckCircleIcon, PlusIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';

export default function CreatePackagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    price: '',
    duration: '7',
    type: 'GENERAL',
    features: [''],
    isActive: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, features: newFeatures.length > 0 ? newFeatures : [''] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('اسم الباقة مطلوب');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('السعر يجب أن يكون أكبر من صفر');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/admin/ads/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: formData.features.filter((f) => f.trim() !== ''),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create package');
      }

      router.push('/admin/ads/packages');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="إنشاء باقة جديدة">
      <Head>
        <title>إنشاء باقة جديدة | سوق مزاد</title>
      </Head>

      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/ads/packages"
          className="flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          العودة للباقات
        </Link>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
          <h1 className="mb-6 text-2xl font-bold text-white">إنشاء باقة إعلانية جديدة</h1>

          {error && <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-red-400">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name (English) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                اسم الباقة (إنجليزي) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="مثال: Gold Package"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Name (Arabic) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                اسم الباقة (عربي)
              </label>
              <input
                type="text"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleChange}
                placeholder="مثال: الباقة الذهبية"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">وصف الباقة</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="وصف مختصر للباقة..."
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Price & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  السعر (د.ل) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  المدة (بالأيام) <span className="text-red-500">*</span>
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="1">يوم واحد</option>
                  <option value="3">3 أيام</option>
                  <option value="7">7 أيام</option>
                  <option value="14">14 يوم</option>
                  <option value="30">30 يوم</option>
                  <option value="60">60 يوم</option>
                  <option value="90">90 يوم</option>
                </select>
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">نوع الباقة</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="GENERAL">عام</option>
                <option value="AUCTION">مزادات</option>
                <option value="CAR">سيارات</option>
                <option value="SERVICE">خدمات</option>
              </select>
            </div>

            {/* Features */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">مميزات الباقة</label>
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-500" />
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder="أدخل ميزة..."
                      className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400"
                >
                  <PlusIcon className="h-4 w-4" />
                  إضافة ميزة
                </button>
              </div>
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="isActive" className="text-sm text-slate-300">
                تفعيل الباقة مباشرة
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-500/50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <PlusIcon className="h-5 w-5" />
                    إنشاء الباقة
                  </>
                )}
              </button>
              <Link
                href="/admin/ads/packages"
                className="flex items-center justify-center rounded-xl border border-slate-600 px-6 py-3 font-medium text-slate-300 transition-colors hover:bg-slate-700"
              >
                إلغاء
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
