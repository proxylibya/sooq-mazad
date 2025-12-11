// @ts-nocheck
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
/**
 * صفحة مراقبة الأداء والأخطاء
 * /admin/monitoring
 */

interface MonitoringStats {
  errors: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    recent: any /* eslint-disable-line */ /* auto-fixed */ /* auto-fixed */ /* auto-fixed */ /* eslint-disable-line */[];
  };
  performance: {
    total: number;
    avgCLS: number;
    avgFID: number;
    avgFCP: number;
    avgLCP: number;
    avgTTFB: number;
    recent: any /* eslint-disable-line */ /* auto-fixed */ /* auto-fixed */ /* auto-fixed */ /* eslint-disable-line */[];
  };
  analytics: {
    total: number;
    pageViews: number;
    events: number;
    sessions: number;
    users: number;
    recent: any /* eslint-disable-line */ /* auto-fixed */ /* auto-fixed */ /* auto-fixed */ /* eslint-disable-line */[];
  };
  health: {
    status: string;
    uptime: number;
    memory: any /* eslint-disable-line */ /* auto-fixed */ /* auto-fixed */ /* auto-fixed */ /* eslint-disable-line */;
    timestamp: string;
  };
}

export default function MonitoringDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  // جلب البيانات
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/monitoring/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch monitoring stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto refresh كل 30 ثانية
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchStats, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // تنسيق وقت التشغيل
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // تنسيق الذاكرة
  const formatMemory = (bytes: number) => {
    const mb = bytes / 1048576;
    return `${mb.toFixed(2)} MB`;
  };

  // الحصول على لون حسب التقييم
  const getPerformanceColor = (metric: string, value: number) => {
    const thresholds: any /* eslint-disable-line */ /* auto-fixed */ /* auto-fixed */ /* auto-fixed */ /* eslint-disable-line */ =
      {
        CLS: { good: 0.1, poor: 0.25 },
        FID: { good: 100, poor: 300 },
        FCP: { good: 1800, poor: 3000 },
        LCP: { good: 2500, poor: 4000 },
        TTFB: { good: 600, poor: 1800 },
      };

    const threshold = thresholds[metric];
    if (!threshold) return 'text-gray-600';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <AdminLayout title="مراقبة الأداء">
        <div className="flex h-64 items-center justify-center">
          <div className="text-slate-400">جاري التحميل...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="مراقبة الأداء">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">مراقبة الأداء والأخطاء</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">تحديث تلقائي</span>
            </label>
            <button
              onClick={fetchStats}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              تحديث الآن
            </button>
          </div>
        </div>

        {stats && (
          <>
            {/* Health Status */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">حالة النظام</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded bg-green-50 p-4 text-center">
                  <div className="mb-2 text-2xl">✅</div>
                  <div className="text-sm text-gray-600">الحالة</div>
                  <div className="font-semibold text-green-600">سليم</div>
                </div>
                <div className="rounded bg-blue-50 p-4 text-center">
                  <div className="mb-2 text-2xl">⏱️</div>
                  <div className="text-sm text-gray-600">وقت التشغيل</div>
                  <div className="font-semibold text-blue-600">
                    {formatUptime(stats.health.uptime)}
                  </div>
                </div>
                <div className="rounded bg-purple-50 p-4 text-center">
                  <div className="mb-2 text-2xl">💾</div>
                  <div className="text-sm text-gray-600">استخدام الذاكرة</div>
                  <div className="font-semibold text-purple-600">
                    {formatMemory(stats.health.memory.heapUsed)}
                  </div>
                </div>
                <div className="rounded bg-gray-50 p-4 text-center">
                  <div className="mb-2 text-2xl">📅</div>
                  <div className="text-sm text-gray-600">آخر تحديث</div>
                  <div className="font-semibold text-gray-600">
                    {new Date(stats.health.timestamp).toLocaleTimeString('ar-LY')}
                  </div>
                </div>
              </div>
            </div>

            {/* Errors */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">الأخطاء</h2>
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="rounded bg-gray-50 p-3 text-center">
                  <div className="text-2xl font-bold">{stats.errors.total}</div>
                  <div className="text-sm text-gray-600">الإجمالي</div>
                </div>
                <div className="rounded bg-red-50 p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.errors.critical}</div>
                  <div className="text-sm text-gray-600">حرج</div>
                </div>
                <div className="rounded bg-orange-50 p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.errors.high}</div>
                  <div className="text-sm text-gray-600">عالي</div>
                </div>
                <div className="rounded bg-yellow-50 p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.errors.medium}</div>
                  <div className="text-sm text-gray-600">متوسط</div>
                </div>
                <div className="rounded bg-green-50 p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.errors.low}</div>
                  <div className="text-sm text-gray-600">منخفض</div>
                </div>
              </div>

              {/* Recent Errors */}
              {stats.errors.recent.length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-700">آخر الأخطاء:</h3>
                  <div className="space-y-2">
                    {stats.errors.recent.map((error, index) => (
                      <div key={index} className="rounded bg-gray-50 p-2 text-sm">
                        <span
                          className={`font-medium ${
                            error.severity === 'critical'
                              ? 'text-red-600'
                              : error.severity === 'high'
                                ? 'text-orange-600'
                                : error.severity === 'medium'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                          }`}
                        >
                          [{error.severity}]
                        </span>
                        <span className="ml-2">{error.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Performance */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">الأداء (Web Vitals)</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="rounded bg-gray-50 p-3 text-center">
                  <div
                    className={`text-2xl font-bold ${getPerformanceColor('CLS', stats.performance.avgCLS)}`}
                  >
                    {stats.performance.avgCLS.toFixed(3)}
                  </div>
                  <div className="text-sm text-gray-600">CLS</div>
                </div>
                <div className="rounded bg-gray-50 p-3 text-center">
                  <div
                    className={`text-2xl font-bold ${getPerformanceColor('FID', stats.performance.avgFID)}`}
                  >
                    {stats.performance.avgFID}ms
                  </div>
                  <div className="text-sm text-gray-600">FID</div>
                </div>
                <div className="rounded bg-gray-50 p-3 text-center">
                  <div
                    className={`text-2xl font-bold ${getPerformanceColor('FCP', stats.performance.avgFCP)}`}
                  >
                    {(stats.performance.avgFCP / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-600">FCP</div>
                </div>
                <div className="rounded bg-gray-50 p-3 text-center">
                  <div
                    className={`text-2xl font-bold ${getPerformanceColor('LCP', stats.performance.avgLCP)}`}
                  >
                    {(stats.performance.avgLCP / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-600">LCP</div>
                </div>
                <div className="rounded bg-gray-50 p-3 text-center">
                  <div
                    className={`text-2xl font-bold ${getPerformanceColor('TTFB', stats.performance.avgTTFB)}`}
                  >
                    {stats.performance.avgTTFB}ms
                  </div>
                  <div className="text-sm text-gray-600">TTFB</div>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">التحليلات</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded bg-blue-50 p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.analytics.pageViews}
                  </div>
                  <div className="text-sm text-gray-600">مشاهدات الصفحة</div>
                </div>
                <div className="rounded bg-green-50 p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.analytics.events}</div>
                  <div className="text-sm text-gray-600">الأحداث</div>
                </div>
                <div className="rounded bg-purple-50 p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.analytics.sessions}
                  </div>
                  <div className="text-sm text-gray-600">الجلسات</div>
                </div>
                <div className="rounded bg-orange-50 p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.analytics.users}</div>
                  <div className="text-sm text-gray-600">المستخدمين</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
