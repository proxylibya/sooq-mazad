import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';

interface UseTransportServiceActionsReturn {
  loading: boolean;
  deleteService: (serviceId: string) => Promise<boolean>;
  pauseService: (serviceId: string) => Promise<boolean>;
  activateService: (serviceId: string) => Promise<boolean>;
  updateService: (serviceId: string, data: any) => Promise<boolean>;
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

  const deleteService = useCallback(
    async (serviceId: string): Promise<boolean> => {
      try {
        setLoading(true);

        const token = getAuthToken();
        if (!token) {
          throw new Error('يجب تسجيل الدخول أولاً');
        }

        const response = await fetch('/api/transport/manage-service-actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'delete',
            serviceId: serviceId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'فشل في حذف الخدمة');
        }

        // إعادة تحميل الصفحة أو تحديث البيانات
        router.reload();
        return true;
      } catch (error) {
        console.error('خطأ في حذف الخدمة:', error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const pauseService = useCallback(
    async (serviceId: string): Promise<boolean> => {
      try {
        setLoading(true);

        const token = getAuthToken();
        if (!token) {
          throw new Error('يجب تسجيل الدخول أولاً');
        }

        const response = await fetch('/api/transport/manage-service-actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'pause',
            serviceId: serviceId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'فشل في إيقاف الخدمة مؤقتاً');
        }

        router.reload();
        return true;
      } catch (error) {
        console.error('خطأ في إيقاف الخدمة:', error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const activateService = useCallback(
    async (serviceId: string): Promise<boolean> => {
      try {
        setLoading(true);

        const token = getAuthToken();
        if (!token) {
          throw new Error('يجب تسجيل الدخول أولاً');
        }

        const response = await fetch('/api/transport/manage-service-actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'activate',
            serviceId: serviceId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'فشل في تفعيل الخدمة');
        }

        router.reload();
        return true;
      } catch (error) {
        console.error('خطأ في تفعيل الخدمة:', error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const updateService = useCallback(
    async (serviceId: string, data: any): Promise<boolean> => {
      try {
        setLoading(true);

        const token = getAuthToken();
        if (!token) {
          throw new Error('يجب تسجيل الدخول أولاً');
        }

        const response = await fetch(`/api/transport/services/${serviceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'فشل في تحديث الخدمة');
        }

        router.reload();
        return true;
      } catch (error) {
        console.error('خطأ في تحديث الخدمة:', error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  return {
    loading,
    deleteService,
    pauseService,
    activateService,
    updateService,
  };
};
