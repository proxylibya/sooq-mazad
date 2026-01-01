/**
 * صفحة الإعدادات العامة
 */
import {
  BellIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface Settings {
  currency: string;
  language: string;
  timezone: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface BrandingSettings {
  logoType: 'text' | 'image';
  logoImageUrl: string;
  siteName: string;
  siteDescription: string;
  showLogoInNavbar: boolean;
  showSiteNameInNavbar: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    currency: 'LYD',
    language: 'ar',
    timezone: 'Africa/Tripoli',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: true,
  });
  const [branding, setBranding] = useState<BrandingSettings>({
    logoType: 'text',
    logoImageUrl: '',
    siteName: 'سوق المزاد',
    siteDescription: 'منصة المزادات الأولى في ليبيا',
    showLogoInNavbar: true,
    showSiteNameInNavbar: true,
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    let cancelled = false;
    const fetchBranding = async () => {
      try {
        const res = await fetch('/api/admin/site-branding');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.settings) {
          setBranding((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      } catch {
      }
    };
    fetchBranding();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/site-branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branding),
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
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

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      اسم الموقع
                    </label>
                    <input
                      type="text"
                      value={branding.siteName}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          siteName: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      وصف الموقع
                    </label>
                    <textarea
                      value={branding.siteDescription}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          siteDescription: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setBranding({
                          ...branding,
                          logoType: 'text',
                        })
                      }
                      className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        branding.logoType === 'text'
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-slate-600 bg-slate-700 text-slate-200'
                      }`}
                    >
                      شعار نصي
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setBranding({
                          ...branding,
                          logoType: 'image',
                        })
                      }
                      className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        branding.logoType === 'image'
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-slate-600 bg-slate-700 text-slate-200'
                      }`}
                    >
                      شعار صورة
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={branding.showLogoInNavbar}
                        onChange={(e) =>
                          setBranding({
                            ...branding,
                            showLogoInNavbar: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-blue-600"
                      />
                      إظهار الشعار في الشريط العلوي
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={branding.showSiteNameInNavbar}
                        onChange={(e) =>
                          setBranding({
                            ...branding,
                            showSiteNameInNavbar: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-blue-600"
                      />
                      إظهار اسم الموقع بجانب الشعار
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-300">معاينة الشعار</p>

                  <div className="flex items-center gap-4 rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-900">
                      {branding.logoType === 'image' && branding.logoImageUrl ? (
                        <img
                          src={`/api/proxy/images?path=${encodeURIComponent(
                            branding.logoImageUrl.replace(/^\//, ''),
                          )}`}
                          alt={branding.siteName}
                          className="h-14 w-14 rounded object-contain"
                        />
                      ) : (
                        <span className="text-lg font-bold text-blue-500">
                          {branding.siteName.slice(0, 2)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-base font-semibold text-white">{branding.siteName}</p>
                      <p className="text-xs text-slate-400">
                        الشعار كما يظهر في شريط التنقل في الموقع الرئيسي
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="mb-1 block text-sm font-medium text-slate-300">
                      رفع شعار جديد
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setLogoUploading(true);
                        try {
                          const formData = new FormData();
                          formData.append('image', file);
                          const res = await fetch('/api/admin/upload/site-logo', {
                            method: 'POST',
                            body: formData,
                          });
                          const data = await res.json();
                          if (data?.success && data.fileUrl) {
                            setBranding({
                              ...branding,
                              logoType: 'image',
                              logoImageUrl: data.fileUrl,
                            });
                          } else {
                            alert('فشل رفع الشعار');
                          }
                        } catch {
                          alert('حدث خطأ أثناء رفع الشعار');
                        } finally {
                          setLogoUploading(false);
                        }
                      }}
                      className="block w-full cursor-pointer rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
                    />
                    <p className="text-xs text-slate-400">
                      يدعم جميع صيغ الصور الشائعة مع حجم حتى 5 ميجابايت
                    </p>
                  </div>

                  {branding.logoImageUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setBranding({
                          ...branding,
                          logoImageUrl: '',
                          logoType: 'text',
                        })
                      }
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      إزالة الشعار الحالي والرجوع للشعار النصي
                    </button>
                  )}

                  {logoUploading && (
                    <p className="text-xs text-blue-400">جاري رفع الشعار...</p>
                  )}
                </div>
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
