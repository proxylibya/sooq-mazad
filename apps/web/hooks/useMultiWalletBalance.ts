import { useState, useEffect, useCallback } from 'react';

interface WalletBalanceData {
  local: {
    balance: number;
    currency: string;
    isActive: boolean;
  };
  global: {
    balance: number;
    currency: string;
    isActive: boolean;
  };
  crypto: {
    balance: number;
    currency: string;
    isActive: boolean;
  };
}

interface UseMultiWalletBalanceReturn {
  walletData: WalletBalanceData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const useMultiWalletBalance = (userId?: string): UseMultiWalletBalanceReturn => {
  const [walletData, setWalletData] = useState<WalletBalanceData>({
    local: {
      balance: 0,
      currency: 'LYD',
      isActive: true,
    },
    global: {
      balance: 0,
      currency: 'USD',
      isActive: true,
    },
    crypto: {
      balance: 0,
      currency: 'USDT-TRC20',
      isActive: true,
    },
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletBalances = useCallback(async () => {
    if (!userId) {
      // لا يوجد مستخدم: لا بيانات وهمية
      setWalletData({
        local: { balance: 0, currency: 'LYD', isActive: true },
        global: { balance: 0, currency: 'USD', isActive: true },
        crypto: { balance: 0, currency: 'USDT-TRC20', isActive: true },
      });
      setIsLoading(false);
      setError('MISSING_USER_ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // استدعاء API للحصول على بيانات المحافظ المتعددة مع timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني timeout

      const response = await fetch(`/api/wallet/multi/${userId}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: فشل في تحميل بيانات المحافظ`);
      }

      const data = await response.json();

      if (data.success && data.wallets) {
        // التحقق من صحة البيانات المستلمة
        const validatedWallets = {
          local: {
            balance: Number(data.wallets.local?.balance) || 0,
            currency: data.wallets.local?.currency || 'LYD',
            isActive: Boolean(data.wallets.local?.isActive),
          },
          global: {
            balance: Number(data.wallets.global?.balance) || 0,
            currency: data.wallets.global?.currency || 'USD',
            isActive: Boolean(data.wallets.global?.isActive),
          },
          crypto: {
            balance: Number(data.wallets.crypto?.balance) || 0,
            currency: data.wallets.crypto?.currency || 'USDT-TRC20',
            isActive: Boolean(data.wallets.crypto?.isActive),
          },
        };

        setWalletData(validatedWallets);
      } else {
        throw new Error(data.message || 'خطأ في تحميل البيانات');
      }
    } catch (err: unknown) {
      const isAbortError = (e: unknown): e is { name: string } =>
        typeof e === 'object' && e !== null && 'name' in e && typeof (e as { name?: unknown }).name === 'string' && (e as { name: string }).name === 'AbortError';

      if (isAbortError(err)) {
        setError('انتهت مهلة الاتصال - يرجى المحاولة مرة أخرى');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ غير متوقع');
      }

      // في حالة الخطأ، لا تُظهر بيانات وهمية
      setWalletData({
        local: { balance: 0, currency: 'LYD', isActive: true },
        global: { balance: 0, currency: 'USD', isActive: true },
        crypto: { balance: 0, currency: 'USDT-TRC20', isActive: true },
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWalletBalances();
  }, [fetchWalletBalances]);

  const refetch = () => {
    fetchWalletBalances();
  };

  return {
    walletData,
    isLoading,
    error,
    refetch,
  };
};

export { useMultiWalletBalance };
export default useMultiWalletBalance;
