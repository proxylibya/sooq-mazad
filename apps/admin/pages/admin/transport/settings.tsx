/**
 * إعدادات خدمات النقل
 */
import { CurrencyDollarIcon, MapPinIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

export default function TransportSettingsPage() {
  const [settings, setSettings] = useState({
    baseFee: 50,
    pricePerKm: 5,
    minDistance: 10,
    maxDistance: 2000,
    requireApproval: true,
    allowInstantBooking: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('تم حفظ الإعدادات');
    setSaving(false);
  };

  return (
    <AdminLayout title="إعدادات خدمات النقل">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
            الأسعار
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                الرسوم الأساسية (د.ل)
              </label>
              <input
                type="number"
                value={settings.baseFee}
                onChange={(e) => setSettings({ ...settings, baseFee: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                السعر لكل كيلومتر (د.ل)
              </label>
              <input
                type="number"
                step="0.5"
                value={settings.pricePerKm}
                onChange={(e) =>
                  setSettings({ ...settings, pricePerKm: parseFloat(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <MapPinIcon className="h-5 w-5 text-blue-400" />
            المسافات
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                الحد الأدنى (كم)
              </label>
              <input
                type="number"
                value={settings.minDistance}
                onChange={(e) =>
                  setSettings({ ...settings, minDistance: parseInt(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                الحد الأقصى (كم)
              </label>
              <input
                type="number"
                value={settings.maxDistance}
                onChange={(e) =>
                  setSettings({ ...settings, maxDistance: parseInt(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <TruckIcon className="h-5 w-5 text-purple-400" />
            خيارات إضافية
          </h3>
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
                <p className="font-medium text-white">الحجز الفوري</p>
                <p className="text-sm text-slate-400">السماح بالحجز المباشر</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, allowInstantBooking: !settings.allowInstantBooking })
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  settings.allowInstantBooking ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    settings.allowInstantBooking ? 'right-0.5' : 'right-5'
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
