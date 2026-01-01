// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  FingerPrintIcon,
  ExclamationTriangleIcon,
  UserIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  MapPinIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { checkAuth } from '../../lib/auth';

interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  status: 'success' | 'failed' | 'blocked';
  timestamp: string;
  device: string;
  browser: string;
  attempts: number;
}

interface SecurityAlert {
  id: string;
  type: 'login' | 'permission' | 'data' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: string;
  timestamp: string;
  resolved: boolean;
}

interface BlockedIP {
  id: string;
  ipAddress: string;
  reason: string;
  blockedAt: string;
  expiresAt: string;
  attempts: number;
}

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<'logs' | 'alerts' | 'blocked'>('logs');
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);

  // Mock data
  useEffect(() => {
    const mockLogs: LoginLog[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'أحمد محمد',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Chrome/120.0',
        location: 'طرابلس، ليبيا',
        status: 'success',
        timestamp: '2025-01-12T10:30:00',
        device: 'Desktop',
        browser: 'Chrome',
        attempts: 1
      },
      {
        id: '2',
        userId: 'admin1',
        userName: 'مدير النظام',
        ipAddress: '10.0.0.50',
        userAgent: 'Mozilla/5.0 Firefox/121.0',
        location: 'بنغازي، ليبيا',
        status: 'success',
        timestamp: '2025-01-12T09:15:00',
        device: 'Laptop',
        browser: 'Firefox',
        attempts: 1
      },
      {
        id: '3',
        userId: 'unknown',
        userName: 'غير معروف',
        ipAddress: '185.45.67.89',
        userAgent: 'Bot/1.0',
        location: 'غير محدد',
        status: 'failed',
        timestamp: '2025-01-12T08:45:00',
        device: 'Unknown',
        browser: 'Bot',
        attempts: 5
      },
      {
        id: '4',
        userId: 'user2',
        userName: 'سارة أحمد',
        ipAddress: '192.168.2.45',
        userAgent: 'Safari/17.0 iOS',
        location: 'مصراتة، ليبيا',
        status: 'success',
        timestamp: '2025-01-12T08:00:00',
        device: 'Mobile',
        browser: 'Safari',
        attempts: 2
      },
      {
        id: '5',
        userId: 'unknown',
        userName: 'غير معروف',
        ipAddress: '45.67.89.123',
        userAgent: 'Unknown',
        location: 'غير محدد',
        status: 'blocked',
        timestamp: '2025-01-11T23:30:00',
        device: 'Unknown',
        browser: 'Unknown',
        attempts: 10
      }
    ];

    const mockAlerts: SecurityAlert[] = [
      {
        id: 'a1',
        type: 'login',
        severity: 'high',
        message: 'محاولات دخول متكررة فاشلة',
        details: 'تم رصد 10 محاولات دخول فاشلة من العنوان IP: 45.67.89.123',
        timestamp: '2025-01-11T23:30:00',
        resolved: false
      },
      {
        id: 'a2',
        type: 'permission',
        severity: 'medium',
        message: 'محاولة وصول غير مصرح بها',
        details: 'المستخدم user123 حاول الوصول لصفحة المديرين بدون صلاحيات',
        timestamp: '2025-01-11T20:00:00',
        resolved: true
      },
      {
        id: 'a3',
        type: 'system',
        severity: 'critical',
        message: 'تحديث أمني عاجل مطلوب',
        details: 'يوجد تحديث أمني حرج للنظام يجب تثبيته فوراً',
        timestamp: '2025-01-11T18:00:00',
        resolved: false
      },
      {
        id: 'a4',
        type: 'data',
        severity: 'low',
        message: 'نسخ احتياطي تلقائي',
        details: 'تم إنشاء نسخة احتياطية تلقائية بنجاح',
        timestamp: '2025-01-11T02:00:00',
        resolved: true
      }
    ];

    const mockBlocked: BlockedIP[] = [
      {
        id: 'b1',
        ipAddress: '45.67.89.123',
        reason: 'محاولات دخول متكررة فاشلة',
        blockedAt: '2025-01-11T23:30:00',
        expiresAt: '2025-01-12T23:30:00',
        attempts: 10
      },
      {
        id: 'b2',
        ipAddress: '185.45.67.89',
        reason: 'نشاط مشبوه - Bot scanning',
        blockedAt: '2025-01-10T15:00:00',
        expiresAt: '2025-01-17T15:00:00',
        attempts: 50
      },
      {
        id: 'b3',
        ipAddress: '92.34.56.78',
        reason: 'هجوم Brute force',
        blockedAt: '2025-01-09T10:00:00',
        expiresAt: '2025-02-09T10:00:00',
        attempts: 100
      }
    ];

    setLoginLogs(mockLogs);
    setSecurityAlerts(mockAlerts);
    setBlockedIPs(mockBlocked);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { bg: 'bg-green-900/50', text: 'text-green-400', label: 'نجح' },
      failed: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', label: 'فشل' },
      blocked: { bg: 'bg-red-900/50', text: 'text-red-400', label: 'محظور' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.failed;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border border-current`}>
        {config.label}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { bg: 'bg-gray-900/50', text: 'text-gray-400', label: 'منخفض' },
      medium: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', label: 'متوسط' },
      high: { bg: 'bg-orange-900/50', text: 'text-orange-400', label: 'عالي' },
      critical: { bg: 'bg-red-900/50', text: 'text-red-400', label: 'حرج' }
    };

    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.low;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border border-current`}>
        {config.label}
      </span>
    );
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return DevicePhoneMobileIcon;
      case 'desktop':
      case 'laptop':
        return ComputerDesktopIcon;
      default:
        return FingerPrintIcon;
    }
  };

  const stats = {
    totalLogins: loginLogs.length,
    successfulLogins: loginLogs.filter(l => l.status === 'success').length,
    failedLogins: loginLogs.filter(l => l.status === 'failed').length,
    blockedAttempts: loginLogs.filter(l => l.status === 'blocked').length,
    activeAlerts: securityAlerts.filter(a => !a.resolved).length,
    blockedIPs: blockedIPs.length
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">الأمان والحماية</h1>
              <p className="text-sm text-gray-400 mt-1">مراقبة الأمان وسجلات الدخول</p>
            </div>
            <div className="flex gap-3">
              {stats.activeAlerts > 0 && (
                <div className="flex items-center px-3 py-1 bg-red-900/50 border border-red-500 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 ml-2" />
                  <span className="text-red-400 text-sm font-medium">
                    {stats.activeAlerts} تنبيه نشط
                  </span>
                </div>
              )}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                فحص الأمان
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <LockClosedIcon className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-gray-400 text-xs">محاولات الدخول</p>
            <p className="text-xl font-bold text-white">{stats.totalLogins}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <ShieldCheckIcon className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-gray-400 text-xs">دخول ناجح</p>
            <p className="text-xl font-bold text-green-400">{stats.successfulLogins}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mb-2" />
            <p className="text-gray-400 text-xs">دخول فاشل</p>
            <p className="text-xl font-bold text-yellow-400">{stats.failedLogins}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <XCircleIcon className="h-6 w-6 text-red-500 mb-2" />
            <p className="text-gray-400 text-xs">محظور</p>
            <p className="text-xl font-bold text-red-400">{stats.blockedAttempts}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-500 mb-2" />
            <p className="text-gray-400 text-xs">تنبيهات نشطة</p>
            <p className="text-xl font-bold text-orange-400">{stats.activeAlerts}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <ShieldCheckIcon className="h-6 w-6 text-purple-500 mb-2" />
            <p className="text-gray-400 text-xs">IPs محظورة</p>
            <p className="text-xl font-bold text-purple-400">{stats.blockedIPs}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            سجل الدخول ({loginLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            التنبيهات الأمنية ({securityAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'blocked'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            العناوين المحظورة ({blockedIPs.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'logs' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      IP / الموقع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      الجهاز
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      المحاولات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      التوقيت
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loginLogs.map((log) => {
                    const DeviceIcon = getDeviceIcon(log.device);
                    
                    return (
                      <tr key={log.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-500 ml-3" />
                            <div>
                              <div className="text-sm font-medium text-white">{log.userName}</div>
                              <div className="text-xs text-gray-400">{log.userId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{log.ipAddress}</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <MapPinIcon className="h-3 w-3 ml-1" />
                            {log.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-300">
                            <DeviceIcon className="h-4 w-4 ml-2 text-gray-500" />
                            {log.device} / {log.browser}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {log.attempts}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-300">
                            <ClockIcon className="h-4 w-4 ml-2 text-gray-500" />
                            {new Date(log.timestamp).toLocaleString('ar-LY')}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className={`h-6 w-6 ml-3 mt-1 ${
                      alert.severity === 'critical' ? 'text-red-400' :
                      alert.severity === 'high' ? 'text-orange-400' :
                      alert.severity === 'medium' ? 'text-yellow-400' : 'text-gray-400'
                    }`} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{alert.message}</h3>
                      <p className="text-sm text-gray-400">{alert.details}</p>
                    </div>
                  </div>
                  {getSeverityBadge(alert.severity)}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <ClockIcon className="h-3 w-3 ml-1" />
                      {new Date(alert.timestamp).toLocaleString('ar-LY')}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${
                      alert.resolved ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {alert.resolved ? 'تم الحل' : 'قيد المعالجة'}
                    </span>
                  </div>
                  {!alert.resolved && (
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                      معالجة التنبيه
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'blocked' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      عنوان IP
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      السبب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      المحاولات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      تاريخ الحظر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ينتهي في
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {blockedIPs.map((blocked) => (
                    <tr key={blocked.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-white">{blocked.ipAddress}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {blocked.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-red-400 font-medium">{blocked.attempts}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(blocked.blockedAt).toLocaleDateString('ar-LY')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(blocked.expiresAt).toLocaleDateString('ar-LY')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-red-400 hover:text-red-300">
                          إلغاء الحظر
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return checkAuth(context);
};
