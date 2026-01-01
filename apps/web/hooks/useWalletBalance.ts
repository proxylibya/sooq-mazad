import { useState, useEffect, useCallback } from 'react';
import { useUserContext } from '../contexts/UserContext';

interface WalletData {
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

interface UseWalletBalanceReturn {
  balance: number;
  currency: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const useWalletBalance = (): UseWalletBalanceReturn => {
  const { user } = useUserContext();
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('LYD');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletBalance = useCallback(async () => {
    const userId = user?.id;
    if (!userId) {
      setBalance(0);
      setCurrency('LYD');
      setError('MISSING_USER_ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`/api/wallet/${userId}`);
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: WalletData = await res.json();
      setBalance(Number(data.balance) || 0);
      setCurrency(data.currency || 'LYD');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UNKNOWN_ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  const refetch = () => {
    fetchWalletBalance();
  };

  return {
    balance,
    currency,
    isLoading,
    error,
    refetch,
  };
};

export { useWalletBalance };
export default useWalletBalance;
