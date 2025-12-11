/**
 * ⚙️ صفحة إعدادات الاتصالات
 * تكوين STUN/TURN servers و SMS Gateway
 */

import {
  ArrowLeftIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ServerIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface WebRTCSettings {
  stunServers: string[];
  turnServer: string;
  turnUsername: string;
  turnPassword: string;
  iceGatheringTimeout: number;
  connectionTimeout: number;
  maxReconnectAttempts: number;
}

interface SMSSettings {
  provider: 'twilio' | 'nexmo' | 'local' | 'custom';
  apiKey: string;
  apiSecret: string;
  senderName: string;
  webhookUrl: string;
  otpTemplate: string;
  notificationTemplate: string;
}

interface NotificationSettings {
  enableCallNotifications: boolean;
  enableSMSNotifications: boolean;
  callRingtone: string;
  messageSound: string;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'webrtc' | 'sms' | 'notifications'>('webrtc');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [webrtcSettings, setWebrtcSettings] = useState<WebRTCSettings>({
    stunServers: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    turnServer: '',
    turnUsername: '',
    turnPassword: '',
    iceGatheringTimeout: 10000,
    connectionTimeout: 30000,
    maxReconnectAttempts: 5,
  });

  const [smsSettings, setSMSSettings] = useState<SMSSettings>({
    provider: 'local',
    apiKey: '',
    apiSecret: '',
    senderName: 'سوق مزاد',
    webhookUrl: '',
    otpTemplate: 'رمز التحقق الخاص بك: {{code}}',
    notificationTemplate: 'لديك إشعار جديد في سوق مزاد',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enableCallNotifications: true,
    enableSMSNotifications: true,
    callRingtone: 'default',
    messageSound: 'default',
    quietHoursStart: '23:00',
    quietHoursEnd: '07:00',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // TODO: جلب الإعدادات من API
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // TODO: حفظ الإعدادات عبر API
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'webrtc', label: 'إعدادات WebRTC', icon: ServerIcon },
    { id: 'sms', label: 'إعدادات SMS', icon: ChatBubbleLeftRightIcon },
    { id: 'notifications', label: 'الإشعارات', icon: BellIcon },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>إعدادات الاتصالات | لوحة التحكم</title>
      </Head>

      <div className="space-y-6 p-6">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/communications"
              className="rounded-lg bg-slate-700 p-2 text-slate-300 transition hover:bg-slate-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">إعدادات الاتصالات</h1>
              <p className="text-sm text-slate-400">تكوين خوادم WebRTC و SMS Gateway</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saved ? (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                تم الحفظ
              </>
            ) : saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                جارٍ الحفظ...
              </>
            ) : (
              'حفظ التغييرات'
            )}
          </button>
        </div>

        {/* التبويبات */}
        <div className="border-b border-slate-700">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* محتوى التبويبات */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
          {/* إعدادات WebRTC */}
          {activeTab === 'webrtc' && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <ServerIcon className="h-5 w-5 text-blue-600" />
                  خوادم STUN
                </h3>
                <div className="space-y-3">
                  {webrtcSettings.stunServers.map((server, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={server}
                        onChange={(e) => {
                          const newServers = [...webrtcSettings.stunServers];
                          newServers[index] = e.target.value;
                          setWebrtcSettings({ ...webrtcSettings, stunServers: newServers });
                        }}
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        dir="ltr"
                      />
                      <button
                        onClick={() => {
                          const newServers = webrtcSettings.stunServers.filter(
                            (_, i) => i !== index,
                          );
                          setWebrtcSettings({ ...webrtcSettings, stunServers: newServers });
                        }}
                        className="rounded-lg bg-red-900/50 p-2 text-red-400 transition hover:bg-red-900"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setWebrtcSettings({
                        ...webrtcSettings,
                        stunServers: [...webrtcSettings.stunServers, ''],
                      });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + إضافة خادم STUN
                  </button>
                </div>
              </div>

              <hr className="border-slate-700" />

              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  خادم TURN (اختياري)
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">
                      عنوان الخادم
                    </label>
                    <input
                      type="text"
                      value={webrtcSettings.turnServer}
                      onChange={(e) =>
                        setWebrtcSettings({ ...webrtcSettings, turnServer: e.target.value })
                      }
                      placeholder="turn:your-server.com:3478"
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">
                      اسم المستخدم
                    </label>
                    <input
                      type="text"
                      value={webrtcSettings.turnUsername}
                      onChange={(e) =>
                        setWebrtcSettings({ ...webrtcSettings, turnUsername: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      value={webrtcSettings.turnPassword}
                      onChange={(e) =>
                        setWebrtcSettings({ ...webrtcSettings, turnPassword: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-700" />

              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">إعدادات الاتصال</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">
                      مهلة جمع ICE (مللي ثانية)
                    </label>
                    <input
                      type="number"
                      value={webrtcSettings.iceGatheringTimeout}
                      onChange={(e) =>
                        setWebrtcSettings({
                          ...webrtcSettings,
                          iceGatheringTimeout: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">
                      مهلة الاتصال (مللي ثانية)
                    </label>
                    <input
                      type="number"
                      value={webrtcSettings.connectionTimeout}
                      onChange={(e) =>
                        setWebrtcSettings({
                          ...webrtcSettings,
                          connectionTimeout: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">
                      محاولات إعادة الاتصال
                    </label>
                    <input
                      type="number"
                      value={webrtcSettings.maxReconnectAttempts}
                      onChange={(e) =>
                        setWebrtcSettings({
                          ...webrtcSettings,
                          maxReconnectAttempts: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* إعدادات SMS */}
          {activeTab === 'sms' && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">مزود الخدمة</label>
                <select
                  value={smsSettings.provider}
                  onChange={(e) =>
                    setSMSSettings({
                      ...smsSettings,
                      provider: e.target.value as SMSSettings['provider'],
                    })
                  }
                  className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="local">محلي (للاختبار)</option>
                  <option value="twilio">Twilio</option>
                  <option value="nexmo">Vonage (Nexmo)</option>
                  <option value="custom">مخصص</option>
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">API Key</label>
                  <input
                    type="password"
                    value={smsSettings.apiKey}
                    onChange={(e) => setSMSSettings({ ...smsSettings, apiKey: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={smsSettings.apiSecret}
                    onChange={(e) => setSMSSettings({ ...smsSettings, apiSecret: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    اسم المرسل
                  </label>
                  <input
                    type="text"
                    value={smsSettings.senderName}
                    onChange={(e) => setSMSSettings({ ...smsSettings, senderName: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={smsSettings.webhookUrl}
                    onChange={(e) => setSMSSettings({ ...smsSettings, webhookUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <hr className="border-slate-700" />

              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">قوالب الرسائل</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">
                      قالب رمز التحقق (OTP)
                    </label>
                    <textarea
                      value={smsSettings.otpTemplate}
                      onChange={(e) =>
                        setSMSSettings({ ...smsSettings, otpTemplate: e.target.value })
                      }
                      rows={2}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      استخدم {'{{code}}'} لإدراج رمز التحقق
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">
                      قالب الإشعارات
                    </label>
                    <textarea
                      value={smsSettings.notificationTemplate}
                      onChange={(e) =>
                        setSMSSettings({ ...smsSettings, notificationTemplate: e.target.value })
                      }
                      rows={2}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* إعدادات الإشعارات */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
                  <div>
                    <p className="font-medium text-white">إشعارات المكالمات</p>
                    <p className="text-sm text-slate-400">إظهار إشعارات عند استقبال مكالمة</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.enableCallNotifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          enableCallNotifications: e.target.checked,
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-slate-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
                  <div>
                    <p className="font-medium text-white">إشعارات SMS</p>
                    <p className="text-sm text-slate-400">إظهار إشعارات عند إرسال/استقبال رسالة</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.enableSMSNotifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          enableSMSNotifications: e.target.checked,
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-slate-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </div>

              <hr className="border-slate-700" />

              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">ساعات الهدوء</h3>
                <p className="mb-4 text-sm text-slate-400">لن يتم إرسال إشعارات خلال هذه الفترة</p>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">من</label>
                    <input
                      type="time"
                      value={notificationSettings.quietHoursStart}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          quietHoursStart: e.target.value,
                        })
                      }
                      className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <span className="mt-6 text-slate-400">إلى</span>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">إلى</label>
                    <input
                      type="time"
                      value={notificationSettings.quietHoursEnd}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          quietHoursEnd: e.target.value,
                        })
                      }
                      className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
