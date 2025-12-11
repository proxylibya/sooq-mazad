/**
 * صفحة الإعدادات العامة
 */
import {
  BellIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface Settings {
  siteName: string;
  siteDescription: string;
  currency: string;
  language: string;
  timezone: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  auctionFeePercent: number;
  minBidAmount: number;
  maxImageSize: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'سوق المزاد',
    siteDescription: 'منصة المزادات الأولى في ليبيا',
    currency: 'LYD',
    language: 'ar',
    timezone: 'Africa/Tripoli',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: true,
    auctionFeePercent: 2.5,
    minBidAmount: 100,
    maxImageSize: 5,
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    setSaving(true);
    try {
      // await fetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('تم حفظ الإعدادات بنجاح');
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'عام', icon: Cog6ToothIcon },
    { id: 'appearance', label: 'المظهر', icon: PaintBrushIcon },
    { id: 'auctions', label: 'المزادات', icon: CurrencyDollarIcon },
    { id: 'notifications', label: 'الإشعارات', icon: BellIcon },
    { id: 'security', label: 'الأمان', icon: ShieldCheckIcon },
    { id: 'localization', label: 'اللغة والمنطقة', icon: GlobeAltIcon },
  ];

  return (
    <AdminLayout title="الإعدادات">
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-xl border border-slate-700 bg-slate-800 p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">الإعدادات العامة</h3>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">اسم الموقع</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">وصف الموقع</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <p className="font-medium text-white">وضع الصيانة</p>
                  <p className="text-sm text-slate-400">إيقاف الموقع مؤقتاً للصيانة</p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      settings.maintenanceMode ? 'right-0.5' : 'right-5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <p className="font-medium text-white">التسجيل الجديد</p>
                  <p className="text-sm text-slate-400">السماح بتسجيل مستخدمين جدد</p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, registrationEnabled: !settings.registrationEnabled })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.registrationEnabled ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      settings.registrationEnabled ? 'right-0.5' : 'right-5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'auctions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">إعدادات المزادات</h3>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  نسبة عمولة المزاد (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.auctionFeePercent}
                  onChange={(e) =>
                    setSettings({ ...settings, auctionFeePercent: parseFloat(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  الحد الأدنى للمزايدة (د.ل)
                </label>
                <input
                  type="number"
                  value={settings.minBidAmount}
                  onChange={(e) =>
                    setSettings({ ...settings, minBidAmount: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  الحد الأقصى لحجم الصورة (ميجابايت)
                </label>
                <input
                  type="number"
                  value={settings.maxImageSize}
                  onChange={(e) =>
                    setSettings({ ...settings, maxImageSize: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">إعدادات الإشعارات</h3>

              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <p className="font-medium text-white">إشعارات البريد الإلكتروني</p>
                  <p className="text-sm text-slate-400">إرسال إشعارات عبر البريد</p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, emailNotifications: !settings.emailNotifications })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      settings.emailNotifications ? 'right-0.5' : 'right-5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <p className="font-medium text-white">إشعارات الرسائل القصيرة</p>
                  <p className="text-sm text-slate-400">إرسال إشعارات عبر SMS</p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, smsNotifications: !settings.smsNotifications })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.smsNotifications ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      settings.smsNotifications ? 'right-0.5' : 'right-5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'localization' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">اللغة والمنطقة</h3>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">العملة</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="LYD">دينار ليبي (LYD)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">اللغة</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  المنطقة الزمنية
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Africa/Tripoli">طرابلس (GMT+2)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          )}

          {(activeTab === 'appearance' || activeTab === 'security') && (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-400">قريباً...</p>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
