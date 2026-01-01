import { useState, useEffect } from 'react';

interface SellerStats {
  totalListings?: number;
  activeListings?: number;
  totalViews?: number;
  successfulDeals?: number;
  responseRate?: string;
  avgResponseTime?: string;
}

interface SellerData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  profileImage?: string;
  verified: boolean;
  accountType?: string;
  rating?: number;
  reviewsCount?: number;
  city?: string;
  memberSince?: string;
  createdAt?: string;
  stats?: SellerStats;
  description?: string;
  isOnline?: boolean;
}

interface UseSellerDataReturn {
  seller: SellerData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSellerData = (sellerId: string | undefined): UseSellerDataReturn => {
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSellerData = async () => {
    if (!sellerId) {
      setSeller(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/sellers/${sellerId}`);

      if (!response.ok) {
        throw new Error('فشل في جلب بيانات البائع');
      }

      const result = await response.json();

      if (result.success) {
        // تحويل البيانات من API إلى تنسيق المكون
        const sellerData: SellerData = {
          id: result.data.id,
          name: result.data.name,
          phone: result.data.phone,
          email: result.data.email,
          profileImage: result.data.profileImage,
          verified: result.data.isVerified || result.data.verified,
          accountType: result.data.accountType,
          rating: result.data.rating || 0,
          reviewsCount: result.data.reviewsCount || 0,
          city: result.data.city,
          memberSince: result.data.memberSince,
          createdAt: result.data.createdAt,
          description: result.data.description,
          isOnline: result.data.isOnline || false,
          stats: {
            totalListings: result.data.stats?.totalListings || 0,
            activeListings: result.data.stats?.activeListings || 0,
            totalViews: result.data.stats?.totalViews || 0,
            successfulDeals: result.data.stats?.successfulDeals || 0,
            responseRate: result.data.stats?.responseRate || '95%',
            avgResponseTime: result.data.stats?.avgResponseTime || '45 دقيقة',
          },
        };

        setSeller(sellerData);
      } else {
        throw new Error(result.error || 'خطأ في جلب البيانات');
      }
    } catch (err) {
      console.error('خطأ في جلب بيانات البائع:', err);
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      setSeller(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [sellerId]);

  return {
    seller,
    loading,
    error,
    refetch: fetchSellerData,
  };
};

export default useSellerData;
