import { useState, useCallback } from 'react';
import { PaymentGateway, TransactionType } from '../lib/payments/paymentGateways';

interface PaymentData {
  amount: number;
  currency?: string;
  auctionId?: string;
  transactionType: TransactionType;
  description?: string;
  metadata?: Record<string, any>;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  status?: string;
}

interface UsePaymentReturn {
  initiatePayment: (gateway: PaymentGateway, data: PaymentData) => Promise<PaymentResult>;
  verifyPayment: (transactionId: string) => Promise<PaymentResult>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const usePayment = (): UsePaymentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return null;
  }, []);

  const initiatePayment = useCallback(
    async (gateway: PaymentGateway, data: PaymentData): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('يجب تسجيل الدخول أولاً');
        }

        const response = await fetch('/api/payments/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...data,
            gateway,
            currency: data.currency || 'SAR',
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'فشل في تهيئة الدفع');
        }

        if (result.success) {
          // إذا كان هناك رابط دفع، افتحه في نافذة جديدة
          if (result.data.paymentUrl) {
            window.open(result.data.paymentUrl, '_blank', 'width=600,height=700');
          }

          return {
            success: true,
            transactionId: result.data.transactionId,
            paymentUrl: result.data.paymentUrl,
            status: result.data.status,
          };
        } else {
          throw new Error(result.error || 'فشل في إنشاء رابط الدفع');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'خطأ غير متوقع';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [getAuthToken],
  );

  const verifyPayment = useCallback(
    async (transactionId: string): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('يجب تسجيل الدخول أولاً');
        }

        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ transactionId }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'فشل في التحقق من الدفع');
        }

        return {
          success: result.success,
          transactionId: result.data?.transactionId,
          status: result.data?.status,
          error: result.error,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'خطأ في التحقق من الدفع';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [getAuthToken],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    initiatePayment,
    verifyPayment,
    loading,
    error,
    clearError,
  };
};

// Hook للحصول على إحصائيات المعاملات
export const usePaymentStats = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const response = await fetch('/api/payments/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل في جلب الإحصائيات');
      }

      setStats(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في جلب الإحصائيات';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
    clearError: () => setError(null),
  };
};

// Hook لمراقبة حالة الدفع
export const usePaymentStatus = (transactionId: string | null) => {
  const [status, setStatus] = useState<string>('PENDING');
  const [loading, setLoading] = useState(false);
  const { verifyPayment } = usePayment();

  const checkStatus = useCallback(async () => {
    if (!transactionId) return;

    setLoading(true);
    const result = await verifyPayment(transactionId);

    if (result.success && result.status) {
      setStatus(result.status);
    }
    setLoading(false);
  }, [transactionId, verifyPayment]);

  // مراقبة دورية لحالة الدفع
  useState(() => {
    if (!transactionId) return;

    const interval = setInterval(checkStatus, 5000); // كل 5 ثوانِ

    // إيقاف المراقبة عند اكتمال الدفع أو فشله
    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  });

  return {
    status,
    loading,
    checkStatus,
    isCompleted: status === 'COMPLETED',
    isFailed: status === 'FAILED' || status === 'CANCELLED',
    isPending: status === 'PENDING' || status === 'PROCESSING',
  };
};
