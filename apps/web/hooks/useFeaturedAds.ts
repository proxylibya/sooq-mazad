import { useState, useEffect, useCallback } from 'react';

import type { FeaturedAd } from '../lib/featuredAds';

export interface UseFeaturedAdsResult {
  ads: FeaturedAd[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFeaturedAds = (limit = 3, position?: number): UseFeaturedAdsResult => {
  const [ads, setAds] = useState<FeaturedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (position) {
        params.append('position', position.toString());
      }

      const response = await fetch(`/api/featured-ads?${params}`);
      const result = await response.json();

      if (result.success) {
        setAds(result.data);
      } else {
        setError(result.error || 'خطأ في جلب الإعلانات المميزة');
      }
    } catch (err) {
      console.error('خطأ في جلب الإعلانات المميزة:', err);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }, [limit, position]);

  useEffect(() => {
    fetchFeaturedAds();
  }, [fetchFeaturedAds]);

  return {
    ads,
    loading,
    error,
    refetch: fetchFeaturedAds,
  };
};
export {
  getAdImageUrl,
  getAdTitle,
  getAdDescription,
  getAdLink,
  trackAdClick,
} from '../lib/featuredAds';
