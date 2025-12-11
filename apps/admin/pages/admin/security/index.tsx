/**
 * صفحة الأمان والحماية
 */
import {
  ExclamationTriangleIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface SecurityStats {
  failedLogins: number;
  suspiciousActivities: number;
  blockedIPs: number;
  activeAdmins: number;
}

interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious' | 'blocked' | 'password_reset';
  description: string;
  ip: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export default function SecurityPage() {
  const [stats, setStats] = useState<SecurityStats>({
    failedLogins: 0,
    suspiciousActivities: 0,
    blockedIPs: 0,
    activeAdmins: 0,
  });
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Mock data
      setStats({
        failedLogins: 12,
        suspiciousActivities: 3,
        blockedIPs: 5,
        activeAdmins: 4,
      });
      setEvents([
        {
          id: '1',
          type: 'failed_login',
          description: 'محاولة دخول فاشلة للمستخدم admin',
          ip: '192.168.1.100',
          timestamp: '2024-01-25T10:30:00',
          severity: 'medium',
        },
        {
          id: '2',
          type: 'suspicious',
          description: 'نشاط مشبوه: محاولات متعددة للوصول',
          ip: '10.0.0.50',
          timestamp: '2024-01-25T09:15:00',
          severity: 'high',
        },
        {
          id: '3',
          type: 'blocked',
          description: 'تم حظر IP بسبب محاولات متكررة',
          ip: '203.0.113.0',
          timestamp: '2024-01-24T14:20:00',
          severity: 'high',
        },
        {
          id: '4',
          type: 'password_reset',
          description: 'إعادة تعيين كلمة مرور للمدير',
          ip: '192.168.1.1',
          timestamp: '2024-01-24T11:00:00',
          severity: 'low',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      low: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'منخفض' },
      medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'متوسط' },
      high: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'عالي' },
    };
    const badge = badges[severity] || badges.low;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  return (
    <AdminLayout title="الأمان والحماية">
      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/20 p-2">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.failedLogins}</p>
              <p className="text-sm text-slate-400">محاولات دخول فاشلة</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <ShieldCheckIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.suspiciousActivities}</p>
              <p className="text-sm text-slate-400">أنشطة مشبوهة</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <KeyIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.blockedIPs}</p>
              <p className="text-sm text-slate-400">عناوين IP محظورة</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <UserGroupIcon className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.activeAdmins}</p>
              <p className="text-sm text-slate-400">مديرين نشطين</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/admin/security/login-logs"
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white transition-colors hover:bg-slate-600"
        >
          📋 سجل الدخول
        </Link>
        <Link
          href="/admin/admins"
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white transition-colors hover:bg-slate-600"
        >
          👥 إدارة المديرين
        </Link>
      </div>

      {/* Security Events */}
      <div className="rounded-xl border border-slate-700 bg-slate-800">
        <div className="border-b border-slate-700 p-4">
          <h3 className="text-lg font-semibold text-white">أحداث الأمان الأخيرة</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-white">{event.description}</p>
                  <p className="text-sm text-slate-400">
                    IP: {event.ip} • {new Date(event.timestamp).toLocaleString('ar-LY')}
                  </p>
                </div>
                {getSeverityBadge(event.severity)}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
