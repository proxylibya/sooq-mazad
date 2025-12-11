/**
 * صفحة إعدادات المزادات
 * تم تحديثها بنظام إعدادات الوقت المرن وخيارات وقت البداية
 */
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AuctionDurationSelector, {
  DurationValue,
  formatDuration,
} from '../../../components/auctions/AuctionDurationSelector';

// إعدادات مدة المزاد الافتراضية
interface DurationConfig {
  minDuration: DurationValue;
  maxDuration: DurationValue;
  defaultDuration: DurationValue;
}

// خيار وقت بداية المزاد
interface StartTimeOption {
  id: string;
  label: string;
  description: string;
  value: string;
  enabled: boolean;
  order: number;
}

interface AuctionSettings {
  minStartingPrice: number;
  minBidIncrement: number;
  autoExtendTime: number;
  maxImagesPerAuction: number;
  durationConfig: DurationConfig;
  startTimeOptions: StartTimeOption[];
  defaultStartTimeOption: string;
  allowCustomStartTime: boolean;
}

// القيم الافتراضية لإعدادات المدة
const DEFAULT_DURATION_CONFIG: DurationConfig = {
  minDuration: { type: 'preset', presetId: '1_hour', totalMinutes: 60 },
  maxDuration: { type: 'preset', presetId: '30_days', totalMinutes: 43200 },
  defaultDuration: { type: 'preset', presetId: '7_days', totalMinutes: 10080 },
};

// القيم الافتراضية لخيارات وقت البداية
const DEFAULT_START_TIME_OPTIONS: StartTimeOption[] = [
  {
    id: 'now',
    label: 'مزاد مباشر',
    description: 'يبدأ المزاد فوراً',
    value: 'now',
    enabled: true,
    order: 1,
  },
  {
    id: 'after_30_seconds',
    label: 'بعد 30 ثانية',
    description: 'يبدأ المزاد بعد 30 ثانية من النشر',
    value: 'after_30_seconds',
    enabled: true,
    order: 2,
  },
  {
    id: 'after_1_hour',
    label: 'بعد ساعة',
    description: 'يبدأ المزاد بعد ساعة واحدة',
    value: 'after_1_hour',
    enabled: true,
    order: 3,
  },
  {
    id: 'after_24_hours',
    label: 'بعد 24 ساعة',
    description: 'يبدأ المزاد بعد يوم كامل',
    value: 'after_24_hours',
    enabled: true,
    order: 4,
  },
  {
    id: 'after_3_days',
    label: 'بعد 3 أيام',
    description: 'يبدأ المزاد بعد 3 أيام',
    value: 'after_3_days',
    enabled: false,
    order: 5,
  },
  {
    id: 'after_7_days',
    label: 'بعد أسبوع',
    description: 'يبدأ المزاد بعد أسبوع كامل',
    value: 'after_7_days',
    enabled: false,
    order: 6,
  },
  {
    id: 'custom',
    label: 'مخصص',
    description: 'حدد وقت بداية المزاد بنفسك',
    value: 'custom',
    enabled: true,
    order: 99,
  },
];

export default function AuctionSettingsPage() {
  const [settings, setSettings] = useState<AuctionSettings>({
    minStartingPrice: 1000,
    minBidIncrement: 100,
    autoExtendTime: 5,
    maxImagesPerAuction: 10,
    durationConfig: DEFAULT_DURATION_CONFIG,
    startTimeOptions: DEFAULT_START_TIME_OPTIONS,
    defaultStartTimeOption: 'now',
    allowCustomStartTime: true,
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'min' | 'max' | 'default'>('default');

  // جلب الإعدادات من الـ API عند تحميل الصفحة
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/auctions/settings', {
          credentials: 'include',
        });
        const result = await response.json();
        if (result.success && result.data) {
          setSettings({
            minStartingPrice: result.data.minStartingPrice || 1000,
            minBidIncrement: result.data.minBidIncrement || 100,
            autoExtendTime: result.data.autoExtendTime || 5,
            maxImagesPerAuction: result.data.maxImagesPerAuction || 10,
            durationConfig: result.data.durationConfig || DEFAULT_DURATION_CONFIG,
            startTimeOptions: result.data.startTimeOptions || DEFAULT_START_TIME_OPTIONS,
            defaultStartTimeOption: result.data.defaultStartTimeOption || 'now',
            allowCustomStartTime: result.data.allowCustomStartTime ?? true,
          });
        }
      } catch (error) {
        console.error('خطأ في جلب الإعدادات:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const response = await fetch('/api/admin/auctions/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(result.error || 'حدث خطأ في حفظ الإعدادات');
        setTimeout(() => setSaveError(null), 5000);
      }
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      setSaveError('حدث خطأ في الاتصال بالخادم');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // تحديث إعدادات المدة
  const handleDurationChange = useCallback((key: keyof DurationConfig, value: DurationValue) => {
    setSettings((prev) => ({
      ...prev,
      durationConfig: {
        ...prev.durationConfig,
        [key]: value,
      },
    }));
  }, []);

  return (
    <AdminLayout title="إعدادات المزادات">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* رسالة التحميل */}
        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-blue-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            <span>جاري تحميل الإعدادات...</span>
          </div>
        )}

        {/* رسالة النجاح */}
        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-400">
            <CheckCircleIcon className="h-5 w-5" />
            <span>تم حفظ الإعدادات بنجاح في قاعدة البيانات</span>
          </div>
        )}

        {/* رسالة الخطأ */}
        {saveError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            <ExclamationCircleIcon className="h-5 w-5" />
            <span>{saveError}</span>
          </div>
        )}

        {/* إعدادات الأسعار */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
            إعدادات الأسعار
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                الحد الأدنى لسعر البداية (د.ل)
              </label>
              <input
                type="number"
                value={settings.minStartingPrice}
                onChange={(e) =>
                  setSettings({ ...settings, minStartingPrice: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">أقل مبلغ يمكن أن يبدأ به المزاد</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                الحد الأدنى لزيادة المزايدة (د.ل)
              </label>
              <input
                type="number"
                value={settings.minBidIncrement}
                onChange={(e) =>
                  setSettings({ ...settings, minBidIncrement: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">أقل مبلغ للزيادة عند المزايدة</p>
            </div>
          </div>
        </div>

        {/* إعدادات الوقت المرنة */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <ClockIcon className="h-5 w-5 text-blue-400" />
            إعدادات الوقت
          </h3>

          {/* التمديد التلقائي */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              وقت التمديد التلقائي (دقائق)
            </label>
            <input
              type="number"
              value={settings.autoExtendTime}
              onChange={(e) =>
                setSettings({ ...settings, autoExtendTime: parseInt(e.target.value) || 0 })
              }
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              يتم تمديد المزاد تلقائياً إذا وردت مزايدة في آخر دقائق
            </p>
          </div>

          {/* تبويبات إعدادات المدة */}
          <div className="mb-4">
            <div className="flex rounded-lg border border-slate-600 bg-slate-700 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('default')}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === 'default'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                المدة الافتراضية
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('min')}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === 'min' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                الحد الأدنى
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('max')}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === 'max' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                الحد الأقصى
              </button>
            </div>
          </div>

          {/* محتوى التبويب النشط */}
          <div className="rounded-lg border border-slate-600 bg-slate-700/30 p-4">
            {activeTab === 'default' && (
              <div>
                <p className="mb-4 text-sm text-slate-400">
                  المدة الافتراضية التي تظهر للمستخدم عند إنشاء مزاد جديد
                </p>
                <AuctionDurationSelector
                  value={settings.durationConfig.defaultDuration}
                  onChange={(v) => handleDurationChange('defaultDuration', v)}
                  theme="dark"
                  label="المدة الافتراضية للمزاد"
                  minMinutes={settings.durationConfig.minDuration.totalMinutes}
                  maxMinutes={settings.durationConfig.maxDuration.totalMinutes}
                />
              </div>
            )}

            {activeTab === 'min' && (
              <div>
                <p className="mb-4 text-sm text-slate-400">أقل مدة يمكن أن يستمر فيها المزاد</p>
                <AuctionDurationSelector
                  value={settings.durationConfig.minDuration}
                  onChange={(v) => handleDurationChange('minDuration', v)}
                  theme="dark"
                  label="الحد الأدنى لمدة المزاد"
                  minMinutes={1}
                  maxMinutes={settings.durationConfig.maxDuration.totalMinutes}
                />
              </div>
            )}

            {activeTab === 'max' && (
              <div>
                <p className="mb-4 text-sm text-slate-400">أقصى مدة يمكن أن يستمر فيها المزاد</p>
                <AuctionDurationSelector
                  value={settings.durationConfig.maxDuration}
                  onChange={(v) => handleDurationChange('maxDuration', v)}
                  theme="dark"
                  label="الحد الأقصى لمدة المزاد"
                  minMinutes={settings.durationConfig.minDuration.totalMinutes}
                  maxMinutes={129600} // 90 يوم
                />
              </div>
            )}
          </div>

          {/* ملخص الإعدادات */}
          <div className="mt-4 rounded-lg border border-slate-600 bg-slate-700/30 p-4">
            <h4 className="mb-3 text-sm font-medium text-slate-300">ملخص إعدادات المدة</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-slate-700 p-3">
                <div className="text-xs text-slate-400">الحد الأدنى</div>
                <div className="mt-1 text-sm font-semibold text-blue-400">
                  {formatDuration(settings.durationConfig.minDuration.totalMinutes)}
                </div>
              </div>
              <div className="rounded-lg bg-slate-700 p-3">
                <div className="text-xs text-slate-400">الافتراضي</div>
                <div className="mt-1 text-sm font-semibold text-green-400">
                  {formatDuration(settings.durationConfig.defaultDuration.totalMinutes)}
                </div>
              </div>
              <div className="rounded-lg bg-slate-700 p-3">
                <div className="text-xs text-slate-400">الحد الأقصى</div>
                <div className="mt-1 text-sm font-semibold text-purple-400">
                  {formatDuration(settings.durationConfig.maxDuration.totalMinutes)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* قسم خيارات وقت بداية المزاد */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <PlayIcon className="h-5 w-5 text-orange-400" />
            خيارات وقت بداية المزاد
          </h3>
          <p className="mb-4 text-sm text-slate-400">
            حدد الخيارات التي تظهر للمستخدمين عند إنشاء مزاد جديد. يمكنك تفعيل أو إلغاء تفعيل أي
            خيار.
          </p>

          {/* قائمة الخيارات */}
          <div className="space-y-3">
            {settings.startTimeOptions
              .sort((a, b) => a.order - b.order)
              .map((option, index) => (
                <div
                  key={option.id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                    option.enabled
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-slate-600 bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* أزرار الترتيب */}
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (index === 0) return;
                          const newOptions = [...settings.startTimeOptions].sort(
                            (a, b) => a.order - b.order,
                          );
                          const temp = newOptions[index].order;
                          newOptions[index].order = newOptions[index - 1].order;
                          newOptions[index - 1].order = temp;
                          setSettings({ ...settings, startTimeOptions: newOptions });
                        }}
                        disabled={index === 0}
                        className="rounded p-1 text-slate-400 hover:bg-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        title="رفع للأعلى"
                      >
                        <ArrowUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sortedOptions = [...settings.startTimeOptions].sort(
                            (a, b) => a.order - b.order,
                          );
                          if (index === sortedOptions.length - 1) return;
                          const newOptions = [...sortedOptions];
                          const temp = newOptions[index].order;
                          newOptions[index].order = newOptions[index + 1].order;
                          newOptions[index + 1].order = temp;
                          setSettings({ ...settings, startTimeOptions: newOptions });
                        }}
                        disabled={index === settings.startTimeOptions.length - 1}
                        className="rounded p-1 text-slate-400 hover:bg-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        title="إنزال للأسفل"
                      >
                        <ArrowDownIcon className="h-3 w-3" />
                      </button>
                    </div>

                    {/* معلومات الخيار */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${option.enabled ? 'text-white' : 'text-slate-400'}`}
                        >
                          {option.label}
                        </span>
                        {option.id === 'custom' && (
                          <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
                            مخصص
                          </span>
                        )}
                        {settings.defaultStartTimeOption === option.id && (
                          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                            افتراضي
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{option.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* زر تعيين كافتراضي */}
                    {option.enabled && settings.defaultStartTimeOption !== option.id && (
                      <button
                        type="button"
                        onClick={() =>
                          setSettings({ ...settings, defaultStartTimeOption: option.id })
                        }
                        className="rounded-lg border border-blue-500/30 px-3 py-1 text-xs text-blue-400 hover:bg-blue-500/10"
                      >
                        تعيين كافتراضي
                      </button>
                    )}

                    {/* مفتاح التفعيل */}
                    <button
                      type="button"
                      onClick={() => {
                        // لا يمكن إلغاء تفعيل الخيار الافتراضي
                        if (settings.defaultStartTimeOption === option.id && option.enabled) {
                          return;
                        }
                        const newOptions = settings.startTimeOptions.map((o) =>
                          o.id === option.id ? { ...o, enabled: !o.enabled } : o,
                        );
                        setSettings({ ...settings, startTimeOptions: newOptions });
                      }}
                      disabled={settings.defaultStartTimeOption === option.id && option.enabled}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        option.enabled ? 'bg-green-500' : 'bg-slate-600'
                      } ${settings.defaultStartTimeOption === option.id ? 'cursor-not-allowed opacity-70' : ''}`}
                      title={
                        settings.defaultStartTimeOption === option.id
                          ? 'لا يمكن إلغاء تفعيل الخيار الافتراضي'
                          : ''
                      }
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          option.enabled ? 'right-0.5' : 'right-5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* ملخص الخيارات المفعلة */}
          <div className="mt-4 rounded-lg border border-slate-600 bg-slate-700/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-300">الخيارات المفعلة للمستخدمين</h4>
                <p className="text-xs text-slate-500">
                  {settings.startTimeOptions.filter((o) => o.enabled).length} من{' '}
                  {settings.startTimeOptions.length} خيارات
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.startTimeOptions
                  .filter((o) => o.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((option) => (
                    <span
                      key={option.id}
                      className={`rounded-full px-3 py-1 text-xs ${
                        settings.defaultStartTimeOption === option.id
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-600 text-slate-300'
                      }`}
                    >
                      {option.label}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* إعدادات عامة */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Cog6ToothIcon className="h-5 w-5 text-purple-400" />
            إعدادات عامة
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                الحد الأقصى للصور لكل مزاد
              </label>
              <input
                type="number"
                value={settings.maxImagesPerAuction}
                onChange={(e) =>
                  setSettings({ ...settings, maxImagesPerAuction: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">أقصى عدد صور يمكن رفعها لكل مزاد</p>
            </div>
          </div>
        </div>

        {/* زر الحفظ */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || loading}
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
    </AdminLayout>
  );
}
