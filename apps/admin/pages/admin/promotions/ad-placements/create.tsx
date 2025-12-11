import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';

const LOCATION_LABELS = {
  HOME_TOP: 'الصفحة الرئيسية - أعلى',
  HOME_MIDDLE: 'الصفحة الرئيسية - وسط',
  HOME_BOTTOM: 'الصفحة الرئيسية - أسفل',
  MARKETPLACE_TOP: 'السوق الفوري - أعلى',
  MARKETPLACE_BOTTOM: 'السوق الفوري - أسفل',
  AUCTIONS_TOP: 'المزادات - أعلى',
  AUCTIONS_BOTTOM: 'المزادات - أسفل',
  TRANSPORT_TOP: 'خدمات النقل - أعلى',
  TRANSPORT_BOTTOM: 'خدمات النقل - أسفل',
  YARDS_TOP: 'الساحات - أعلى',
  YARDS_BOTTOM: 'الساحات - أسفل',
  SIDEBAR: 'الشريط الجانبي',
  HEADER: 'الرأس',
  FOOTER: 'التذييل',
};

const TYPE_LABELS = {
  STATIC: 'ثابت',
  SLIDER: 'سلايدر',
  ROTATING: 'متحرك',
  GRID: 'شبكة',
  CAROUSEL: 'دائري',
};

export default function CreateAdPlacementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: 'HOME_TOP',
    type: 'STATIC',
    maxAds: 1,
    displayOrder: 0,
    autoRotate: false,
    rotateInterval: 5,
    width: '',
    height: '',
    isActive: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/ad-placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin/promotions/ad-placements');
      } else {
        const err = await res.json();
        alert(err.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error creating placement:', error);
      alert('حدث خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="إضافة مكان إعلاني">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            رجوع
          </button>
          <h1 className="text-2xl font-bold text-white">إضافة مكان إعلاني</h1>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">الاسم</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">الوصف</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">الموقع</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                >
                  {Object.entries(LOCATION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">النوع</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                >
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  عدد الإعلانات
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxAds}
                  onChange={(e) =>
                    setFormData({ ...formData, maxAds: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  ترتيب العرض
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  العرض (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: 300px, 100%"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  الارتفاع (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: 250px, auto"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.autoRotate}
                  onChange={(e) => setFormData({ ...formData, autoRotate: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium text-slate-300">دوران تلقائي</span>
              </label>

              {formData.autoRotate && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-300">كل</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.rotateInterval}
                    onChange={(e) =>
                      setFormData({ ...formData, rotateInterval: parseInt(e.target.value) })
                    }
                    className="w-20 rounded-lg border border-slate-600 bg-slate-700 p-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                  <label className="text-sm text-slate-300">ثانية</label>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-slate-300">مفعّل</span>
            </div>

            <div className="flex gap-3 border-t border-slate-700 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-bold text-white hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
              >
                <CheckCircleIcon className="h-5 w-5" />
                {isSubmitting ? 'جاري الحفظ...' : 'إضافة'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-700 py-3 font-bold text-white hover:bg-slate-600"
              >
                <XCircleIcon className="h-5 w-5" />
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
