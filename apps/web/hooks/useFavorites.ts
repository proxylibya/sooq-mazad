import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useBadgeCounts } from './useBadgeCounts';

interface FavoriteItem {
  id: string;
  type: 'marketplace' | 'auction' | 'showroom' | 'transport';
  itemId: string;
  title: string;
  price?: number;
  currentPrice?: number;
  startingPrice?: number;
  year?: number;
  brand?: string;
  model?: string;
  mileage?: number;
  condition?: string;
  location?: string;
  images?: string[];
  seller?: any;
  createdAt: string;
  endTime?: string;
  status?: string;
  totalBids?: number;
  car?: any;
  // حقول إضافية للعرض المحسن
  description?: string;
  verified?: boolean;
  featured?: boolean;
}

interface UseFavoritesReturn {
  favorites: FavoriteItem[];
  setFavorites: React.Dispatch<React.SetStateAction<FavoriteItem[]>>;
  favoritesCount: number;
  isLoading: boolean;
  error: string | null;
  isFavorite: (
    carId?: string,
    auctionId?: string,
    showroomId?: string,
    transportId?: string,
  ) => boolean;
  addToFavorites: (
    carId?: string,
    auctionId?: string,
    showroomId?: string,
    transportId?: string,
  ) => Promise<boolean>;
  removeFromFavorites: (
    carId?: string,
    auctionId?: string,
    showroomId?: string,
    transportId?: string,
  ) => Promise<boolean>;
  removeFavoriteById: (favoriteId: string) => Promise<boolean>;
  toggleFavorite: (
    carId?: string,
    auctionId?: string,
    showroomId?: string,
    transportId?: string,
  ) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

export const useFavorites = (): UseFavoritesReturn => {
  const { user } = useAuth();
  const { setFavoritesCount: setBadgeCount } = useBadgeCounts();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // منع الطلبات المتكررة - نظام محسن
  const [isProcessing, setIsProcessing] = useState(false);
  const lastFetchTimeRef = useRef(0);
  const pendingRequestRef = useRef<Promise<void> | null>(null);
  const FETCH_COOLDOWN = 5000; // 5 ثوان

  // الحصول على token من localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return token && token.trim() !== '' ? token : null;
    }
    return null;
  };

  // دالة مساعدة لمعالجة الاستجابات
  const handleResponse = async (response: Response): Promise<any> => {
    let data: any;
    let responseText: string;

    try {
      if (response.bodyUsed) {
        throw new Error('تم استهلاك response body بالفعل');
      }

      responseText = await response.text();

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('فشل في تحليل JSON:', responseText.substring(0, 200));
          throw new Error('خطأ في تحليل استجابة الخادم');
        }
      } else {
        throw new Error('استجابة فارغة من الخادم');
      }
    } catch (parseError) {
      if (parseError instanceof Error && parseError.message.includes('تحليل')) {
        throw parseError;
      }
      if (parseError instanceof Error && parseError.message.includes('استهلاك')) {
        throw parseError;
      }
      console.warn('فشل في قراءة response:', parseError);
      throw new Error('خطأ في قراءة استجابة الخادم');
    }

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        throw new Error('انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى.');
      }

      const errorMessage = data?.error || `خطأ في الخادم: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  };

  // دالة retry مع backoff تدريجي
  const retryWithBackoff = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (
          lastError.message.includes('401') ||
          lastError.message.includes('400') ||
          lastError.message.includes('403') ||
          lastError.message.includes('جلسة العمل') ||
          lastError.message.includes('استهلاك') ||
          lastError.message.includes('تحليل استجابة الخادم')
        ) {
          throw lastError;
        }

        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(
          `محاولة ${attempt + 1} فشلت، إعادة المحاولة خلال ${delay}ms:`,
          lastError.message,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  };

  // نظام تخزين مؤقت محسن
  const cache = useMemo(() => {
    const cacheMap = new Map<string, { data: any; timestamp: number; ttl: number; }>();

    return {
      get: (key: string) => {
        const item = cacheMap.get(key);
        if (!item) return null;

        const now = Date.now();
        if (now - item.timestamp > item.ttl) {
          cacheMap.delete(key);
          return null;
        }

        return item.data;
      },
      set: (key: string, data: any, ttl: number = 30000) => {
        cacheMap.set(key, { data, timestamp: Date.now(), ttl });
      },
      delete: (key: string) => {
        cacheMap.delete(key);
      },
      clear: () => {
        cacheMap.clear();
      },
    };
  }, []);

  // جلب المفضلة من الخادم - محسن لمنع الطلبات المتكررة
  const fetchFavorites = useCallback(async () => {
    const token = getToken();
    if (!user || !token) {
      setFavorites([]);
      setFavoritesCount(0);
      setError(null);
      setIsLoading(false);
      setIsProcessing(false);
      return;
    }

    // التحقق من التخزين المؤقت أولاً
    const cacheKey = `favorites_${user.id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      setFavorites(cachedData.data || []);
      setFavoritesCount(cachedData.count || 0);
      setError(null);
      setIsLoading(false);
      setIsProcessing(false);
      return;
    }

    // منع الطلبات المتكررة السريعة - نظام محسن
    const now = Date.now();
    if (now - lastFetchTimeRef.current < FETCH_COOLDOWN) {
      console.warn('تم تجاهل طلب متكرر سريع إلى: /api/favorites');
      return;
    }

    // إذا كان هناك طلب معلق، انتظر انتهاؤه
    if (pendingRequestRef.current) {
      try {
        await pendingRequestRef.current;
        return;
      } catch (error) {
        // إذا فشل الطلب المعلق، استمر مع طلب جديد
        pendingRequestRef.current = null;
      }
    }

    if (isProcessing) {
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);
    setError(null);
    lastFetchTimeRef.current = now;

    // إنشاء promise للطلب الحالي
    const currentRequest = (async () => {
      try {
        const data = await retryWithBackoff(async () => {
          const response = await fetch('/api/favorites', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const responseClone = response.clone();
          return await handleResponse(responseClone);
        });

        if (data && data.success) {
          const favoritesData = data.data || [];
          const favoritesCount = data.count || 0;

          setFavorites(favoritesData);
          setFavoritesCount(favoritesCount);
          setError(null);

          // حفظ في التخزين المؤقت
          cache.set(cacheKey, { data: favoritesData, count: favoritesCount }, 30000);
        } else {
          throw new Error(data?.error || 'خطأ في جلب المفضلة');
        }
      } catch (err) {
        console.error('خطأ في جلب المفضلة:', {
          error: err,
          user: user?.id,
          token: !!getToken(),
          errorType: err instanceof Error ? err.constructor.name : typeof err,
          errorMessage: err instanceof Error ? err.message : String(err),
        });

        // معالجة محسنة ومفصلة للأخطاء
        if (err instanceof TypeError) {
          if (err.message.includes('Failed to fetch')) {
            setError('خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.');
          } else if (err.message.includes('JSON')) {
            setError('خطأ في تحليل البيانات من الخادم. يرجى إعادة تحميل الصفحة.');
          } else {
            setError('خطأ في الشبكة. يرجى المحاولة مرة أخرى.');
          }
        } else if (err instanceof Error) {
          if (err.message.includes('401') || err.message.includes('غير مصرح')) {
            setError(null);
            setFavorites([]);
            setFavoritesCount(0);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
            }
          } else if (err.message.includes('403')) {
            setError('ليس لديك صلاحية للوصول إلى هذه البيانات');
          } else if (err.message.includes('404')) {
            setError('لم يتم العثور على البيانات المطلوبة');
          } else if (err.message.includes('429')) {
            setError('تم تجاوز حد الطلبات. يرجى المحاولة بعد قليل.');
          } else if (err.message.includes('500')) {
            setError('خطأ في الخادم، يرجى المحاولة لاحقاً');
          } else if (err.message.includes('502') || err.message.includes('503')) {
            setError('الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.');
          } else if (err.message.includes('504')) {
            setError('انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
          } else if (err.message.includes('Network') || err.message.includes('fetch')) {
            setError('خطأ في الاتصال بالإنترنت. يرجى التحقق من الاتصال.');
          } else if (
            err.message.includes('استهلاك') ||
            err.message.includes('تحليل استجابة الخادم')
          ) {
            setError('خطأ في معالجة البيانات. يرجى إعادة تحميل الصفحة.');
          } else if (err.message.includes('CONNECTION_ERROR')) {
            setError('خطأ في الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً.');
          } else if (err.message.includes('TIMEOUT')) {
            setError('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.');
          } else {
            setError(err.message || 'خطأ في جلب المفضلة');
          }
        } else {
          setError('خطأ غير متوقع، يرجى المحاولة مرة أخرى');
        }
      } finally {
        setIsLoading(false);
        setIsProcessing(false);
        pendingRequestRef.current = null;
      }
    })();

    pendingRequestRef.current = currentRequest;
    await currentRequest;
  }, [user, cache]);

  // جلب عدد المفضلة فقط
  const fetchFavoritesCount = useCallback(async () => {
    const token = getToken();
    if (!user || !token) {
      setFavoritesCount(0);
      setError(null);
      return;
    }

    // منع الطلبات المتكررة السريعة
    const requestKey = `/api/favorites/count`;
    const now = Date.now();
    const lastRequest = (window as any).lastFavoritesCountRequest || 0;

    if (now - lastRequest < 2000) {
      // منع الطلبات خلال ثانيتين
      console.warn('تم تجاهل طلب متكرر سريع إلى:', requestKey);
      return;
    }

    (window as any).lastFavoritesCountRequest = now;

    try {
      const response = await fetch('/api/favorites/count', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await handleResponse(response.clone());

      if (data.success) {
        setFavoritesCount(data.count || 0);
      } else {
        throw new Error(data.error || 'خطأ في جلب عدد المفضلة');
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('401')) {
        setFavoritesCount(0);
        setError(null);
      } else {
        console.error('خطأ في جلب عدد المفضلة:', err);
      }
    }
  }, [user]);

  // التحقق من كون العنصر في المفضلة
  const isFavorite = useCallback(
    (carId?: string, auctionId?: string, showroomId?: string, transportId?: string): boolean => {
      if (!carId && !auctionId && !showroomId && !transportId) return false;
      if (!user || !getToken()) return false;

      return favorites.some(
        (fav) =>
          (carId && fav.type === 'marketplace' && fav.itemId === carId) ||
          (auctionId && fav.type === 'auction' && fav.itemId === auctionId) ||
          (showroomId && fav.type === 'showroom' && fav.itemId === showroomId) ||
          (transportId && fav.type === 'transport' && fav.itemId === transportId),
      );
    },
    [favorites, user],
  );

  // إضافة للمفضلة
  const addToFavorites = useCallback(
    async (
      carId?: string,
      auctionId?: string,
      showroomId?: string,
      transportId?: string,
    ): Promise<boolean> => {
      const token = getToken();
      if (!user || !token || isProcessing) {
        setError('يجب تسجيل الدخول أولاً');
        return false;
      }

      if (!carId && !auctionId && !showroomId && !transportId) {
        setError('يجب تحديد معرف العنصر');
        return false;
      }

      setIsProcessing(true);

      try {
        let type: string;
        let itemId: string;

        if (carId) {
          type = 'car';
          itemId = carId;
        } else if (auctionId) {
          type = 'auction';
          itemId = auctionId;
        } else if (showroomId) {
          type = 'showroom';
          itemId = showroomId;
        } else if (transportId) {
          type = 'transport';
          itemId = transportId;
        } else {
          setError('نوع العنصر غير صحيح');
          return false;
        }

        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type, itemId }),
        });

        const data = await handleResponse(response.clone());

        if (data.success) {
          setFavoritesCount((prev) => prev + 1);

          let itemType: FavoriteItem['type'] = 'marketplace';
          if (carId) itemType = 'marketplace';
          else if (auctionId) itemType = 'auction';
          else if (showroomId) itemType = 'showroom';
          else if (transportId) itemType = 'transport';

          const newItem: FavoriteItem = {
            id: data.data.id,
            type: itemType,
            itemId: carId || auctionId || showroomId || transportId || '',
            title: data.data.title || 'عنصر جديد في المفضلة',
            createdAt: data.data.createdAt || new Date().toISOString(),
            ...(data.data.price && { price: data.data.price }),
            ...(data.data.location && { location: data.data.location }),
            ...(data.data.images && { images: data.data.images }),
            ...(data.data.brand && { brand: data.data.brand }),
            ...(data.data.model && { model: data.data.model }),
            ...(data.data.year && { year: data.data.year }),
          };

          setFavorites((prev) => [newItem, ...prev]);

          if (user) {
            cache.delete(`favorites_${user.id}`);
          }

          setError(null);
          return true;
        } else {
          const errorMessage = data.error || 'خطأ في إضافة المفضلة';
          setError(errorMessage);

          if (data.code === 'ALREADY_EXISTS') {
            await fetchFavorites();
          }

          return false;
        }
      } catch (err) {
        console.error('خطأ في إضافة المفضلة:', {
          error: err,
          carId,
          auctionId,
          user: user?.id,
          token: !!getToken(),
        });

        if (err instanceof Error) {
          if (err.message.includes('401')) {
            setError('يجب تسجيل الدخول أولاً');
          } else if (err.message.includes('400')) {
            setError('بيانات غير صحيحة');
          } else if (err.message.includes('409')) {
            setError('العنصر موجود في المفضلة مسبقاً');
          } else if (err.message.includes('Network')) {
            setError('خطأ في الاتصال بالإنترنت');
          } else {
            setError(err.message || 'خطأ في إضافة المفضلة');
          }
        } else {
          setError('خطأ غير متوقع في إضافة المفضلة');
        }
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [user, fetchFavorites, cache],
  );

  // حذف من المفضلة
  const removeFromFavorites = useCallback(
    async (
      carId?: string,
      auctionId?: string,
      showroomId?: string,
      transportId?: string,
    ): Promise<boolean> => {
      const token = getToken();
      if (!user || !token || isProcessing) {
        setError('يجب تسجيل الدخول أولاً');
        return false;
      }

      if (!carId && !auctionId && !showroomId && !transportId) {
        setError('يجب تحديد معرف العنصر');
        return false;
      }

      setIsProcessing(true);

      try {
        let type: string;
        let itemId: string;

        if (carId) {
          type = 'car';
          itemId = carId;
        } else if (auctionId) {
          type = 'auction';
          itemId = auctionId;
        } else if (showroomId) {
          type = 'showroom';
          itemId = showroomId;
        } else if (transportId) {
          type = 'transport';
          itemId = transportId;
        } else {
          setError('نوع العنصر غير صحيح');
          return false;
        }

        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type, itemId }),
        });

        const data = await handleResponse(response.clone());

        if (data.success) {
          setFavoritesCount((prev) => Math.max(0, prev - 1));
          setFavorites((prev) =>
            prev.filter(
              (fav) =>
                !(
                  (carId && fav.type === 'marketplace' && fav.itemId === carId) ||
                  (auctionId && fav.type === 'auction' && fav.itemId === auctionId) ||
                  (showroomId && fav.type === 'showroom' && fav.itemId === showroomId) ||
                  (transportId && fav.type === 'transport' && fav.itemId === transportId)
                ),
            ),
          );

          if (user) {
            cache.delete(`favorites_${user.id}`);
          }

          return true;
        } else {
          setError(data.error || 'خطأ في حذف المفضلة');
          return false;
        }
      } catch (err) {
        console.error('خطأ في حذف المفضلة:', {
          error: err,
          carId,
          auctionId,
          user: user?.id,
          token: !!getToken(),
        });

        if (err instanceof Error) {
          if (err.message.includes('401')) {
            setError('يجب تسجيل الدخول أولاً');
          } else if (err.message.includes('404')) {
            setError('العنصر غير موجود في المفضلة');
          } else if (err.message.includes('Network')) {
            setError('خطأ في الاتصال بالإنترنت');
          } else {
            setError(err.message || 'خطأ في حذف المفضلة');
          }
        } else {
          setError('خطأ غير متوقع في حذف المفضلة');
        }
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [user, cache],
  );

  // حذف مفضلة باستخدام معرف المفضلة مباشرة
  const removeFavoriteById = useCallback(
    async (favoriteId: string): Promise<boolean> => {
      const token = getToken();
      if (!user || !token || isProcessing) {
        setError('يجب تسجيل الدخول أولاً');
        return false;
      }

      if (!favoriteId) {
        setError('يجب تحديد معرف المفضلة');
        return false;
      }

      setIsProcessing(true);

      try {
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ favoriteId }),
        });

        const data = await handleResponse(response.clone());

        if (data.success) {
          setFavoritesCount((prev) => Math.max(0, prev - 1));
          setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));

          // حذف التخزين المؤقت للقائمة لضمان جلب بيانات حديثة بعد الحذف
          if (user) {
            const cacheKey = `favorites_${user.id}`;
            try {
              // قد لا يكون cache متاحاً في بعض البيئات، لذا نستخدم try/catch بحذر
              (cache as any)?.delete?.(cacheKey);
            } catch (e) {
              // تجاهل مني أخطاء غير متوقعة في نظام التخزين المؤقت
            }
          }

          setError(null);
          return true;
        } else {
          setError(data.error || 'فشل في حذف العنصر من المفضلة');
          return false;
        }
      } catch (error) {
        console.error('خطأ في حذف المفضلة:', error);
        setError('خطأ في الاتصال بالخادم');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [user, isProcessing],
  );

  // تبديل حالة المفضلة
  const toggleFavorite = useCallback(
    async (
      carId?: string,
      auctionId?: string,
      showroomId?: string,
      transportId?: string,
    ): Promise<boolean> => {
      const isCurrentlyFavorite = isFavorite(carId, auctionId, showroomId, transportId);

      if (isCurrentlyFavorite) {
        return await removeFromFavorites(carId, auctionId, showroomId, transportId);
      } else {
        const result = await addToFavorites(carId, auctionId, showroomId, transportId);

        if (!result && error && error.includes('موجود في المفضلة مسبقاً')) {
          await fetchFavorites();
          setError(null);
          return true;
        }

        return result;
      }
    },
    [isFavorite, addToFavorites, removeFromFavorites, error, fetchFavorites],
  );

  // إعادة تحميل المفضلة
  const refreshFavorites = useCallback(async () => {
    if (user && getToken()) {
      await fetchFavorites();
    }
  }, [user, fetchFavorites]);

  // تحميل المفضلة عند تغيير المستخدم - محسن لمنع الطلبات المتكررة
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && getToken() && !isProcessing) {
        fetchFavorites();
      } else {
        setFavorites([]);
        setFavoritesCount(0);
        setError(null);
        setIsLoading(false);
        setIsProcessing(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, fetchFavorites]);

  // تحديث العداد المحسن عند تغيير favoritesCount
  useEffect(() => {
    setBadgeCount(favoritesCount);
  }, [favoritesCount, setBadgeCount]);

  return {
    favorites,
    setFavorites,
    favoritesCount,
    isLoading,
    error,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    removeFavoriteById,
    toggleFavorite,
    refreshFavorites,
  };
};
