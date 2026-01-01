import { useState, useEffect } from 'react';

interface DatabaseStats {
  users: number;
  cars: number;
  auctions: number;
  transportServices: number;
  showrooms: number;
}

interface FormattedStats {
  users: string;
  cars: string;
  auctions: string;
  transportServices: string;
  showrooms: string;
}

interface UseStatsReturn {
  stats: FormattedStats | null;
  rawStats: DatabaseStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useFormattedStats = (): UseStatsReturn => {
  const [stats, setStats] = useState<FormattedStats | null>(null);
  const [rawStats, setRawStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // استخدام API المبسط مباشرة
      const response = await fetch('/api/stats/simple');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.formatted || data.stats);
        setRawStats(data.stats);
      } else {
        throw new Error(data.error || 'فشل في جلب الإحصائيات');
      }
    } catch (err) {
      console.error('خطأ في جلب الإحصائيات:', err);
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');

      // استخدام بيانات افتراضية في حالة الخطأ
      const fallbackStats = {
        users: '24',
        cars: '40',
        auctions: '29',
        transportServices: '7',
        showrooms: '3',
      };

      setStats(fallbackStats);
      setRawStats({
        users: 24,
        cars: 40,
        auctions: 29,
        transportServices: 7,
        showrooms: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = () => {
    fetchStats();
  };

  return {
    stats,
    rawStats,
    loading,
    error,
    refetch,
  };
};
