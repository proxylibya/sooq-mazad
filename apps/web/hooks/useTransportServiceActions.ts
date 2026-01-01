import { useState } from 'react';
import { useRouter } from 'next/router';

interface ServiceActionResult {
  success: boolean;
  message: string;
  data?: any;
}

interface UseTransportServiceActionsReturn {
  loading: boolean;
  deleteService: (serviceId: string) => Promise<ServiceActionResult>;
  pauseService: (serviceId: string) => Promise<ServiceActionResult>;
  activateService: (serviceId: string) => Promise<ServiceActionResult>;
}

export const useTransportServiceActions = (): UseTransportServiceActionsReturn => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('token') ||
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1] ||
      null
    );
  };

  const performAction = async (action: string, serviceId: string): Promise<ServiceActionResult> => {
    setLoading(true);

    try {
      const token = getAuthToken();

      if (!token) {
        return {
          success: false,
          message: 'يجب تسجيل الدخول أولاً',
        };
      }

      const response = await fetch('/api/transport/manage-service-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          serviceId,
        }),
      });

      // التحقق من نوع المحتوى
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('الخادم لم يرجع استجابة JSON صحيحة');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `خطأ HTTP: ${response.status}`);
      }

      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      console.error(`خطأ في ${action}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (serviceId: string): Promise<ServiceActionResult> => {
    return performAction('delete', serviceId);
  };

  const pauseService = async (serviceId: string): Promise<ServiceActionResult> => {
    return performAction('pause', serviceId);
  };

  const activateService = async (serviceId: string): Promise<ServiceActionResult> => {
    return performAction('activate', serviceId);
  };

  return {
    loading,
    deleteService,
    pauseService,
    activateService,
  };
};

export default useTransportServiceActions;
