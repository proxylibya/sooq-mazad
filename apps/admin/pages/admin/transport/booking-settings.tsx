/**
 * صفحة إعدادات رسائل وإشعارات طلبات النقل
 * Transport Booking Settings Page
 */

import {
  ArrowPathIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface BookingSettings {
  // نموذج الرسالة
  messageTemplate: string;
  // نموذج الإشعار
  notificationTitle: string;
  notificationTemplate: string;
  // إعدادات الإشعارات
  enablePushNotification: boolean;
  enableSmsNotification: boolean;
  enableEmailNotification: boolean;
  // إعدادات الرسالة
  showCustomerPhone: boolean;
  showCallButton: boolean;
  showChatButton: boolean;
  showCopyPhoneButton: boolean;
  showAcceptRejectButtons: boolean;
  // إعدادات البطاقة
  cardStyle: 'modern' | 'classic' | 'minimal';
  cardColor: 'blue' | 'green' | 'gray';
  // إعدادات الحجز التلقائي
  autoAcceptBookings: boolean;
  autoRejectAfterHours: number;
  // رسائل الحالات
  statusMessages: {
    PENDING: string;
    ACCEPTED: string;
    REJECTED: string;
    IN_PROGRESS: string;
    COMPLETED: string;
    CANCELLED: string;
  };
}

const DEFAULT_SETTINGS: BookingSettings = {
  messageTemplate: `طلب نقل جديد

الخدمة: {{serviceTitle}}
العميل: {{customerName}}
من: {{fromCity}}
إلى: {{toCity}}
التاريخ: {{preferredDate}}

رقم الطلب: #{{bookingId}}`,
  notificationTitle: 'طلب نقل جديد',
  notificationTemplate: 'لديك طلب نقل جديد من {{customerName}} - من {{fromCity}} إلى {{toCity}}',
  enablePushNotification: true,
  enableSmsNotification: false,
  enableEmailNotification: false,
  showCustomerPhone: true,
  showCallButton: true,
  showChatButton: true,
  showCopyPhoneButton: true,
  showAcceptRejectButtons: true,
  cardStyle: 'modern',
  cardColor: 'blue',
  autoAcceptBookings: false,
  autoRejectAfterHours: 0,
  statusMessages: {
    PENDING: 'طلبك قيد المراجعة',
    ACCEPTED: 'تم قبول طلبك! سنتواصل معك قريبا',
    REJECTED: 'عذرا، لم نتمكن من قبول طلبك',
    IN_PROGRESS: 'جاري تنفيذ طلبك',
    COMPLETED: 'تم إكمال طلب النقل بنجاح',
    CANCELLED: 'تم إلغاء الطلب',
  },
};

export default function BookingSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<BookingSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<
    'message' | 'notification' | 'buttons' | 'style' | 'status'
  >('message');

  // جلب الإعدادات
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch('/api/admin/transport/booking-settings', {
          credentials: 'include', // إرسال cookies مع الطلب
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const result = await response.json();

        if (result.success && result.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...result.data });
        }
      } catch (error) {
        console.error('خطأ في جلب الإعدادات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // إخفاء Toast تلقائياً
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // حفظ الإعدادات
  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/transport/booking-settings', {
        method: 'PUT',
        credentials: 'include', // إرسال cookies مع الطلب
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        setToast({ message: 'تم حفظ الإعدادات بنجاح', type: 'success' });
      } else {
        setToast({ message: result.error || 'خطأ في حفظ الإعدادات', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'خطأ في الاتصال بالخادم', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // إعادة تعيين الإعدادات
  const resetSettings = async () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات للقيم الافتراضية؟')) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/transport/booking-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'reset' }),
      });

      const result = await response.json();

      if (result.success) {
        setSettings(DEFAULT_SETTINGS);
        setToast({ message: 'تم إعادة تعيين الإعدادات', type: 'success' });
      } else {
        setToast({ message: result.error || 'خطأ في إعادة التعيين', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'خطأ في الاتصال بالخادم', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // تحديث حقل
  const updateField = <K extends keyof BookingSettings>(field: K, value: BookingSettings[K]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // تحديث رسالة حالة
  const updateStatusMessage = (
    status: keyof BookingSettings['statusMessages'],
    message: string,
  ) => {
    setSettings((prev) => ({
      ...prev,
      statusMessages: { ...prev.statusMessages, [status]: message },
    }));
  };

  const tabs = [
    { id: 'message', label: 'نموذج الرسالة', icon: DocumentTextIcon },
    { id: 'notification', label: 'الإشعارات', icon: BellIcon },
    { id: 'buttons', label: 'الأزرار', icon: Cog6ToothIcon },
    { id: 'style', label: 'المظهر', icon: SwatchIcon },
    { id: 'status', label: 'رسائل الحالات', icon: ChatBubbleLeftRightIcon },
  ] as const;

  if (loading) {
    return (
      <AdminLayout title="إعدادات رسائل طلبات النقل">
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إعدادات رسائل طلبات النقل">
      <Head>
        <title>إعدادات رسائل طلبات النقل | لوحة التحكم</title>
      </Head>

      <div className="space-y-6">
        {/* العنوان */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">إعدادات رسائل طلبات النقل</h1>
            <p className="mt-1 text-sm text-slate-400">
              تخصيص الرسائل والإشعارات المرسلة عند إنشاء طلب نقل جديد
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/transport/bookings')}
              className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
            >
              عودة للحجوزات
            </button>
            <button
              onClick={resetSettings}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600 disabled:opacity-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
              إعادة تعيين
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              <CheckCircleIcon className="h-4 w-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        </div>

        {/* التبويبات */}
        <div className="border-b border-slate-700">
          <nav className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* محتوى التبويبات */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          {/* تبويب نموذج الرسالة */}
          {activeTab === 'message' && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  نموذج الرسالة المرسلة لمقدم الخدمة
                </label>
                <p className="mb-2 text-xs text-slate-500">
                  المتغيرات المتاحة: {'{{serviceTitle}}'}, {'{{customerName}}'},{' '}
                  {'{{customerPhone}}'}, {'{{fromCity}}'}, {'{{toCity}}'}, {'{{preferredDate}}'},{' '}
                  {'{{bookingId}}'}
                </p>
                <textarea
                  value={settings.messageTemplate}
                  onChange={(e) => updateField('messageTemplate', e.target.value)}
                  rows={12}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 font-mono text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  dir="rtl"
                />
              </div>

              {/* معاينة */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  معاينة الرسالة
                </label>
                <div className="rounded-lg border border-slate-600 bg-slate-700 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-slate-300" dir="rtl">
                    {settings.messageTemplate
                      .replace('{{serviceTitle}}', 'خدمة نقل ساحبة مسطحة')
                      .replace('{{customerName}}', 'أحمد محمد')
                      .replace('{{customerPhone}}', '0912345678')
                      .replace('{{fromCity}}', 'طرابلس')
                      .replace('{{toCity}}', 'بنغازي')
                      .replace('{{preferredDate}}', '15 ديسمبر 2025')
                      .replace('{{bookingId}}', 'ABC12345')}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* تبويب الإشعارات */}
          {activeTab === 'notification' && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  عنوان الإشعار
                </label>
                <input
                  type="text"
                  value={settings.notificationTitle}
                  onChange={(e) => updateField('notificationTitle', e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">نص الإشعار</label>
                <textarea
                  value={settings.notificationTemplate}
                  onChange={(e) => updateField('notificationTemplate', e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-4 rounded-lg border border-slate-600 bg-slate-700 p-4">
                <h3 className="font-medium text-white">قنوات الإشعار</h3>

                <ToggleField
                  label="إشعارات الدفع (Push Notifications)"
                  description="إرسال إشعار فوري للتطبيق والمتصفح"
                  checked={settings.enablePushNotification}
                  onChange={(v) => updateField('enablePushNotification', v)}
                  icon={BellIcon}
                />

                <ToggleField
                  label="إشعارات SMS"
                  description="إرسال رسالة نصية للهاتف"
                  checked={settings.enableSmsNotification}
                  onChange={(v) => updateField('enableSmsNotification', v)}
                  icon={PhoneIcon}
                />

                <ToggleField
                  label="إشعارات البريد الإلكتروني"
                  description="إرسال بريد إلكتروني"
                  checked={settings.enableEmailNotification}
                  onChange={(v) => updateField('enableEmailNotification', v)}
                  icon={EnvelopeIcon}
                />
              </div>
            </div>
          )}

          {/* تبويب الأزرار */}
          {activeTab === 'buttons' && (
            <div className="space-y-4">
              <h3 className="font-medium text-white">الأزرار المعروضة في بطاقة الطلب</h3>

              <ToggleField
                label="إظهار رقم هاتف العميل"
                description="عرض رقم الهاتف في بطاقة الطلب"
                checked={settings.showCustomerPhone}
                onChange={(v) => updateField('showCustomerPhone', v)}
              />

              <ToggleField
                label="زر اتصل الآن"
                description="زر للاتصال المباشر بالعميل"
                checked={settings.showCallButton}
                onChange={(v) => updateField('showCallButton', v)}
              />

              <ToggleField
                label="زر مراسلة"
                description="زر لبدء محادثة مع العميل"
                checked={settings.showChatButton}
                onChange={(v) => updateField('showChatButton', v)}
              />

              <ToggleField
                label="زر نسخ الرقم"
                description="زر لنسخ رقم هاتف العميل"
                checked={settings.showCopyPhoneButton}
                onChange={(v) => updateField('showCopyPhoneButton', v)}
              />

              <ToggleField
                label="أزرار قبول ورفض الطلب"
                description="إظهار أزرار قبول ورفض الطلب"
                checked={settings.showAcceptRejectButtons}
                onChange={(v) => updateField('showAcceptRejectButtons', v)}
              />
            </div>
          )}

          {/* تبويب المظهر */}
          {activeTab === 'style' && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">نمط البطاقة</label>
                <div className="flex gap-4">
                  {(['modern', 'classic', 'minimal'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => updateField('cardStyle', style)}
                      className={`flex-1 rounded-lg border-2 p-4 text-center transition-colors ${
                        settings.cardStyle === style
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <span className="font-medium text-white">
                        {style === 'modern' ? 'عصري' : style === 'classic' ? 'كلاسيكي' : 'بسيط'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">لون البطاقة</label>
                <div className="flex gap-4">
                  {(['blue', 'green', 'gray'] as const).map((color) => (
                    <button
                      key={color}
                      onClick={() => updateField('cardColor', color)}
                      className={`flex-1 rounded-lg border-2 p-4 text-center transition-colors ${
                        settings.cardColor === color
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div
                        className={`mx-auto mb-2 h-8 w-8 rounded-full ${
                          color === 'blue'
                            ? 'bg-blue-600'
                            : color === 'green'
                              ? 'bg-green-600'
                              : 'bg-gray-600'
                        }`}
                      />
                      <span className="font-medium text-white">
                        {color === 'blue' ? 'أزرق' : color === 'green' ? 'أخضر' : 'رمادي'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-600 bg-slate-700 p-4">
                <h3 className="mb-4 font-medium text-white">إعدادات متقدمة</h3>

                <ToggleField
                  label="القبول التلقائي للطلبات"
                  description="قبول الطلبات تلقائياً بدون تدخل مقدم الخدمة"
                  checked={settings.autoAcceptBookings}
                  onChange={(v) => updateField('autoAcceptBookings', v)}
                />

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    رفض تلقائي بعد (ساعات)
                  </label>
                  <p className="mb-2 text-xs text-slate-500">0 = معطل</p>
                  <input
                    type="number"
                    min="0"
                    max="168"
                    value={settings.autoRejectAfterHours}
                    onChange={(e) =>
                      updateField('autoRejectAfterHours', parseInt(e.target.value) || 0)
                    }
                    className="w-32 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* تبويب رسائل الحالات */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <h3 className="font-medium text-white">رسائل تحديث حالة الطلب</h3>
              <p className="text-sm text-slate-400">هذه الرسائل تُرسل للعميل عند تغيير حالة طلبه</p>

              {Object.entries(settings.statusMessages).map(([status, message]) => (
                <div key={status}>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    {status === 'PENDING' && 'في الانتظار'}
                    {status === 'ACCEPTED' && 'تم القبول'}
                    {status === 'REJECTED' && 'مرفوض'}
                    {status === 'IN_PROGRESS' && 'جاري التنفيذ'}
                    {status === 'COMPLETED' && 'مكتمل'}
                    {status === 'CANCELLED' && 'ملغي'}
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) =>
                      updateStatusMessage(
                        status as keyof BookingSettings['statusMessages'],
                        e.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 left-4 z-50 rounded-lg px-4 py-3 shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}
        >
          {toast.message}
        </div>
      )}
    </AdminLayout>
  );
}

// مكون التبديل - الوضع الداكن
function ToggleField({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700 p-4">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-slate-400" />}
        <div>
          <p className="font-medium text-white">{label}</p>
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-slate-500'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'right-0.5' : 'right-5'
          }`}
        />
      </button>
    </div>
  );
}
