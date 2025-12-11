/**
 * إعدادات السوق الفوري
 */
import { ClockIcon, CurrencyDollarIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

export default function MarketplaceSettingsPage() {
  const [settings, setSettings] = useState({
    listingDuration: 30,
    maxImages: 15,
    featuredPrice: 50,
    featuredDuration: 7,
    requireApproval: true,
    allowNegotiation: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('تم حفظ الإعدادات');
    setSaving(false);
  };

  return (
    <AdminLayout title="إعدادات السوق الفوري">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <ClockIcon className="h-5 w-5 text-blue-400" />
            إعدادات الوقت
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                مدة الإعلان (أيام)
              </label>
              <input
                type="number"
                value={settings.listingDuration}
                onChange={(e) =>
                  setSettings({ ...settings, listingDuration: parseInt(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                مدة التمييز (أيام)
              </label>
              <input
                type="number"
                value={settings.featuredDuration}
                onChange={(e) =>
                  setSettings({ ...settings, featuredDuration: parseInt(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
            الأسعار
          </h3>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              سعر التمييز (د.ل)
            </label>
            <input
              type="number"
              value={settings.featuredPrice}
              onChange={(e) =>
                setSettings({ ...settings, featuredPrice: parseInt(e.target.value) })
              }
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <PhotoIcon className="h-5 w-5 text-purple-400" />
            الوسائط
          </h3>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              الحد الأقصى للصور
            </label>
            <input
              type="number"
              value={settings.maxImages}
              onChange={(e) => setSettings({ ...settings, maxImages: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">خيارات إضافية</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
              <div>
                <p className="font-medium text-white">موافقة قبل النشر</p>
                <p className="text-sm text-slate-400">يتطلب موافقة المسؤول</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, requireApproval: !settings.requireApproval })
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  settings.requireApproval ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    settings.requireApproval ? 'right-0.5' : 'right-5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
              <div>
                <p className="font-medium text-white">السماح بالتفاوض</p>
                <p className="text-sm text-slate-400">يمكن للمشتري طلب سعر مختلف</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, allowNegotiation: !settings.allowNegotiation })
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  settings.allowNegotiation ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    settings.allowNegotiation ? 'right-0.5' : 'right-5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
