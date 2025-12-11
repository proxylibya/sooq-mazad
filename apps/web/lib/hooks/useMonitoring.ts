import { useState, useEffect } from 'react';

interface MonitoringStatus {
  unacknowledgedCount: number;
  totalAlerts?: number;
  criticalCount?: number;
  warningCount?: number;
}

interface UseMonitoringReturn {
  isConnected: boolean;
  status: MonitoringStatus | null;
  isMonitoring: boolean;
}

/**
 * Hook لإدارة حالة المراقبة والتنبيهات
 * @returns {UseMonitoringReturn} حالة الاتصال والمراقبة
 */
export function useMonitoring(): UseMonitoringReturn {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [status, setStatus] = useState<MonitoringStatus | null>(null);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);

  useEffect(() => {
    // التحقق من تفعيل المراقبة من المتغيرات البيئية
    const monitoringEnabled = process.env.NEXT_PUBLIC_MONITORING_ENABLED !== 'false';

    if (!monitoringEnabled) {
      setIsConnected(false);
      setIsMonitoring(false);
      return;
    }

    // محاكاة الاتصال بنظام المراقبة
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      setIsMonitoring(true);
    }, 1000);

    // جلب حالة التنبيهات
    const fetchMonitoringStatus = async () => {
      try {
        const response = await fetch('/api/admin/monitoring/status');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('خطأ في جلب حالة المراقبة:', error);
      }
    };

    // جلب الحالة كل 30 ثانية
    fetchMonitoringStatus();
    const statusInterval = setInterval(fetchMonitoringStatus, 30000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(statusInterval);
    };
  }, []);

  return {
    isConnected,
    status,
    isMonitoring,
  };
}
