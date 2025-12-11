/**
 * 📞 صفحة إدارة الاتصالات و SMS
 * لوحة تحكم شاملة لإدارة المكالمات والرسائل النصية
 */

import {
  BellAlertIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  PhoneIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

// أنواع البيانات
interface CallStats {
  totalCalls: number;
  voiceCalls: number;
  videoCalls: number;
  missedCalls: number;
  averageDuration: number;
  totalDuration: number;
}

interface SMSStats {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  cost: number;
}

interface RecentCall {
  id: string;
  callerId: string;
  callerName: string;
  calleeId: string;
  calleeName: string;
  type: 'voice' | 'video';
  status: 'completed' | 'missed' | 'rejected' | 'failed';
  duration: number;
  createdAt?: string;
  startTime?: string;
}

interface RecentSMS {
  id: string;
  phone: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  type: 'otp' | 'notification' | 'marketing';
  createdAt: string;
}

export default function CommunicationsPage() {
  const [callStats, setCallStats] = useState<CallStats>({
    totalCalls: 0,
    voiceCalls: 0,
    videoCalls: 0,
    missedCalls: 0,
    averageDuration: 0,
    totalDuration: 0,
  });

  const [smsStats, setSMSStats] = useState<SMSStats>({
    totalSent: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    cost: 0,
  });

  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [recentSMS, setRecentSMS] = useState<RecentSMS[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'sms'>('overview');

  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب البيانات من APIs
        const [callsRes, smsRes] = await Promise.all([
          fetch('/api/calls/logs?limit=5')
            .then((r) => r.json())
            .catch(() => null),
          fetch('/api/sms/logs?limit=5')
            .then((r) => r.json())
            .catch(() => null),
        ]);

        // تحديث إحصائيات المكالمات
        if (callsRes?.success && callsRes.data?.stats) {
          const stats = callsRes.data.stats;
          setCallStats({
            totalCalls: stats.total || 0,
            voiceCalls: stats.voiceCalls || 0,
            videoCalls: stats.videoCalls || 0,
            missedCalls: stats.missed || 0,
            averageDuration: stats.total > 0 ? Math.floor(stats.totalDuration / stats.total) : 0,
            totalDuration: stats.totalDuration || 0,
          });
          setRecentCalls(callsRes.data.logs || []);
        }

        // تحديث إحصائيات SMS
        if (smsRes?.success && smsRes.data?.stats) {
          const stats = smsRes.data.stats;
          setSMSStats({
            totalSent: stats.total || 0,
            delivered: stats.delivered || 0,
            failed: stats.failed || 0,
            pending: stats.pending || 0,
            cost: stats.totalCost || 0,
          });
          setRecentSMS(smsRes.data.logs || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // تنسيق المدة
  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '-';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}س ${mins}د`;
    if (mins > 0) return `${mins}د ${secs}ث`;
    return `${secs}ث`;
  };

  // تنسيق التاريخ
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'الآن';
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} دقيقة`;
    if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} ساعة`;
    return date.toLocaleDateString('ar-LY');
  };

  // الأقسام الفرعية
  const sections = [
    {
      title: 'سجل المكالمات',
      description: 'عرض جميع المكالمات الصوتية والفيديو',
      icon: PhoneIcon,
      href: '/admin/communications/calls',
      color: 'bg-green-500',
      stats: `${callStats.totalCalls} مكالمة`,
    },
    {
      title: 'رسائل SMS',
      description: 'إدارة الرسائل النصية والإشعارات',
      icon: ChatBubbleLeftRightIcon,
      href: '/admin/communications/sms',
      color: 'bg-blue-500',
      stats: `${smsStats.totalSent} رسالة`,
    },
    {
      title: 'قوالب الرسائل',
      description: 'إنشاء وإدارة قوالب الرسائل',
      icon: DocumentTextIcon,
      href: '/admin/communications/templates',
      color: 'bg-purple-500',
      stats: '12 قالب',
    },
    {
      title: 'إعدادات الاتصال',
      description: 'تكوين STUN/TURN والـ SMS Gateway',
      icon: CogIcon,
      href: '/admin/communications/settings',
      color: 'bg-gray-500',
      stats: 'إعدادات',
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>الاتصالات و SMS | لوحة التحكم</title>
      </Head>

      <div className="space-y-6 p-6">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">الاتصالات و SMS</h1>
            <p className="mt-1 text-sm text-gray-500">
              إدارة المكالمات الصوتية والفيديو والرسائل النصية
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/communications/settings"
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
            >
              <CogIcon className="h-5 w-5" />
              الإعدادات
            </Link>
          </div>
        </div>

        {/* بطاقات الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* إجمالي المكالمات */}
          <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">إجمالي المكالمات</p>
                <p className="mt-1 text-3xl font-bold">
                  {callStats.totalCalls.toLocaleString('ar-LY')}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <PhoneIcon className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <PhoneIcon className="h-4 w-4" />
                {callStats.voiceCalls} صوتية
              </span>
              <span className="flex items-center gap-1">
                <VideoCameraIcon className="h-4 w-4" />
                {callStats.videoCalls} فيديو
              </span>
            </div>
          </div>

          {/* رسائل SMS */}
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">رسائل SMS</p>
                <p className="mt-1 text-3xl font-bold">
                  {smsStats.totalSent.toLocaleString('ar-LY')}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <ChatBubbleLeftRightIcon className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="text-green-200">{smsStats.delivered} مُسلّمة</span>
              <span className="text-red-200">{smsStats.failed} فاشلة</span>
            </div>
          </div>

          {/* متوسط مدة المكالمة */}
          <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">متوسط مدة المكالمة</p>
                <p className="mt-1 text-3xl font-bold">
                  {formatDuration(callStats.averageDuration)}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <ClockIcon className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span>إجمالي: {formatDuration(callStats.totalDuration)}</span>
            </div>
          </div>

          {/* تكلفة SMS */}
          <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">تكلفة SMS</p>
                <p className="mt-1 text-3xl font-bold">
                  {smsStats.cost.toLocaleString('ar-LY')} د.ل
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <ChartBarIcon className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span>{smsStats.pending} رسالة معلقة</span>
            </div>
          </div>
        </div>

        {/* الأقسام الفرعية */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="group rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-sm transition hover:border-slate-600 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-lg ${section.color} p-3 text-white`}>
                  <section.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white group-hover:text-blue-400">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">{section.description}</p>
                  <p className="mt-2 text-xs font-medium text-slate-500">{section.stats}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* الجداول */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* آخر المكالمات */}
          <div className="rounded-xl border border-slate-700 bg-slate-800 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
              <h3 className="font-semibold text-white">آخر المكالمات</h3>
              <Link
                href="/admin/communications/calls"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                عرض الكل
              </Link>
            </div>
            <div className="divide-y divide-slate-700">
              {recentCalls.length === 0 ? (
                <p className="p-5 text-center text-sm text-slate-400">لا توجد مكالمات</p>
              ) : (
                recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center gap-4 p-4">
                    <div
                      className={`rounded-full p-2 ${
                        call.type === 'video'
                          ? 'bg-blue-900/50 text-blue-400'
                          : 'bg-green-900/50 text-green-400'
                      }`}
                    >
                      {call.type === 'video' ? (
                        <VideoCameraIcon className="h-5 w-5" />
                      ) : (
                        <PhoneIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">
                        {call.callerName} → {call.calleeName}
                      </p>
                      <p className="text-sm text-slate-400">
                        {call.type === 'video' ? 'مكالمة فيديو' : 'مكالمة صوتية'}
                      </p>
                    </div>
                    <div className="text-left">
                      <p
                        className={`text-sm font-medium ${
                          call.status === 'completed'
                            ? 'text-green-600'
                            : call.status === 'missed'
                              ? 'text-red-600'
                              : 'text-slate-400'
                        }`}
                      >
                        {call.status === 'completed'
                          ? formatDuration(call.duration)
                          : call.status === 'missed'
                            ? 'فائتة'
                            : 'مرفوضة'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(call.startTime || call.createdAt || new Date().toISOString())}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* آخر رسائل SMS */}
          <div className="rounded-xl border border-slate-700 bg-slate-800 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
              <h3 className="font-semibold text-white">آخر رسائل SMS</h3>
              <Link
                href="/admin/communications/sms"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                عرض الكل
              </Link>
            </div>
            <div className="divide-y divide-slate-700">
              {recentSMS.length === 0 ? (
                <p className="p-5 text-center text-sm text-slate-400">لا توجد رسائل</p>
              ) : (
                recentSMS.map((sms) => (
                  <div key={sms.id} className="flex items-center gap-4 p-4">
                    <div
                      className={`rounded-full p-2 ${
                        sms.type === 'otp'
                          ? 'bg-purple-900/50 text-purple-400'
                          : sms.type === 'notification'
                            ? 'bg-blue-900/50 text-blue-400'
                            : 'bg-orange-900/50 text-orange-400'
                      }`}
                    >
                      {sms.type === 'otp' ? (
                        <BellAlertIcon className="h-5 w-5" />
                      ) : (
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white" dir="ltr">
                        {sms.phone}
                      </p>
                      <p className="truncate text-sm text-slate-400">{sms.message}</p>
                    </div>
                    <div className="text-left">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          sms.status === 'delivered'
                            ? 'bg-green-900/50 text-green-400'
                            : sms.status === 'sent'
                              ? 'bg-blue-900/50 text-blue-400'
                              : sms.status === 'failed'
                                ? 'bg-red-900/50 text-red-400'
                                : 'bg-yellow-900/50 text-yellow-400'
                        }`}
                      >
                        {sms.status === 'delivered'
                          ? 'مُسلّمة'
                          : sms.status === 'sent'
                            ? 'مُرسلة'
                            : sms.status === 'failed'
                              ? 'فاشلة'
                              : 'معلقة'}
                      </span>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(sms.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
