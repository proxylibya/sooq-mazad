/**
 * صفحة سجل الدخول
 */
import {
  CheckCircleIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  ip: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  status: 'success' | 'failed';
  timestamp: string;
  failReason?: string;
}

export default function LoginLogsPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Mock data
      setLogs([
        {
          id: '1',
          userId: 'u1',
          userName: 'محمد أحمد',
          ip: '192.168.1.100',
          device: 'desktop',
          browser: 'Chrome 120',
          location: 'طرابلس',
          status: 'success',
          timestamp: '2024-01-25T10:30:00',
        },
        {
          id: '2',
          userId: 'u2',
          userName: 'أحمد علي',
          ip: '192.168.1.101',
          device: 'mobile',
          browser: 'Safari 17',
          location: 'بنغازي',
          status: 'success',
          timestamp: '2024-01-25T09:15:00',
        },
        {
          id: '3',
          userId: 'u3',
          userName: 'admin',
          ip: '10.0.0.50',
          device: 'desktop',
          browser: 'Firefox 122',
          location: 'غير معروف',
          status: 'failed',
          timestamp: '2024-01-25T08:45:00',
          failReason: 'كلمة مرور خاطئة',
        },
        {
          id: '4',
          userId: 'u4',
          userName: 'سالم محمود',
          ip: '192.168.1.102',
          device: 'tablet',
          browser: 'Chrome 120',
          location: 'مصراتة',
          status: 'success',
          timestamp: '2024-01-24T16:20:00',
        },
        {
          id: '5',
          userId: 'u5',
          userName: 'خالد إبراهيم',
          ip: '203.0.113.0',
          device: 'desktop',
          browser: 'Edge 120',
          location: 'غير معروف',
          status: 'failed',
          timestamp: '2024-01-24T14:10:00',
          failReason: 'حساب محظور',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return <DevicePhoneMobileIcon className="h-5 w-5 text-slate-400" />;
      default:
        return <ComputerDesktopIcon className="h-5 w-5 text-slate-400" />;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || log.ip.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="سجل الدخول">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="البحث بالاسم أو IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-4 pr-10 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="all">جميع المحاولات</option>
          <option value="success">ناجحة</option>
          <option value="failed">فاشلة</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-slate-700 bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                  المستخدم
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">الجهاز</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">IP</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">الموقع</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-white">{log.userName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(log.device)}
                      <span className="text-sm text-slate-300">{log.browser}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{log.ip}</td>
                  <td className="px-4 py-3 text-slate-300">{log.location}</td>
                  <td className="px-4 py-3">
                    {log.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                        <CheckCircleIcon className="h-3 w-3" />
                        ناجح
                      </span>
                    ) : (
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
                          <XCircleIcon className="h-3 w-3" />
                          فشل
                        </span>
                        {log.failReason && (
                          <p className="mt-1 text-xs text-red-400">{log.failReason}</p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(log.timestamp).toLocaleString('ar-LY')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
