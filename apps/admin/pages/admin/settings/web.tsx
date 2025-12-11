import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface WebSettings {
  siteName: string;
  siteDescription: string;
  siteTitle: string;
  welcomeMessage: string;
}

export default function WebSettingsPage() {
  const [settings, setSettings] = useState<WebSettings>({
    siteName: 'سوق المزاد',
    siteDescription: 'منصة المزادات الأولى في ليبيا',
    siteTitle: 'موقع مزاد السيارات',
    welcomeMessage: 'مرحباً بكم في موقع مزاد السيارات',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/web');
      const data = await response.json();
      if (data) {
        setSettings({
          siteName: data.siteName || 'سوق المزاد',
          siteDescription: data.siteDescription || 'منصة المزادات الأولى في ليبيا',
          siteTitle: data.siteTitle || 'موقع مزاد السيارات',
          welcomeMessage: data.welcomeMessage || 'مرحباً بكم في موقع مزاد السيارات',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showMessage('error', 'فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/settings/web', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'تم حفظ الإعدادات بنجاح');
      } else {
        showMessage('error', 'فشل في حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <AdminLayout title="إعدادات الموقع">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إعدادات الموقع">
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <GlobeAltIcon className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-white">إعدادات عامة للموقع</h2>
            <p className="text-sm text-slate-400">
              تحكم في النصوص والعناوين التي تظهر في الموقع الرئيسي
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-lg border p-4 ${
              message.type === 'success'
                ? 'border-green-500 bg-green-500/10 text-green-400'
                : 'border-red-500 bg-red-500/10 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              اسم الموقع
              <span className="mr-2 text-xs text-slate-400">
                (يظهر في الـ Navbar وعنوان المتصفح)
              </span>
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder="سوق المزاد"
            />
            <p className="mt-1 text-xs text-slate-400">مثال: سوق المزاد</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              وصف الموقع
              <span className="mr-2 text-xs text-slate-400">
                (يظهر أسفل العنوان الرئيسي في الصفحة الرئيسية)
              </span>
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder="منصة المزادات الأولى في ليبيا"
            />
            <p className="mt-1 text-xs text-slate-400">
              مثال: أفضل موقع لبيع وشراء السيارات في ليبيا والدول العربية
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              العنوان الرئيسي للموقع
              <span className="mr-2 text-xs text-slate-400">(H1 في الصفحة الرئيسية)</span>
            </label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder="موقع مزاد السيارات"
            />
            <p className="mt-1 text-xs text-slate-400">مثال: موقع مزاد السيارات</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              رسالة الترحيب
              <span className="mr-2 text-xs text-slate-400">
                (نص وصفي يظهر في منطقة Hero)
              </span>
            </label>
            <textarea
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder="مرحباً بكم في موقع مزاد السيارات"
            />
            <p className="mt-1 text-xs text-slate-400">مثال: مرحباً بكم في موقع مزاد السيارات</p>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-700 pt-6">
            <button
              onClick={fetchSettings}
              disabled={saving}
              className="rounded-lg border border-slate-600 bg-slate-700 px-6 py-2 text-white transition-colors hover:bg-slate-600 disabled:opacity-50"
            >
              إعادة تحميل
            </button>
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

        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <h3 className="mb-2 font-medium text-blue-400">معلومة</h3>
          <p className="text-sm text-blue-300">
            التغييرات ستظهر فوراً في جميع صفحات الموقع بعد الحفظ. قد تحتاج إلى إعادة تحميل
            الصفحة لرؤية التغييرات.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
