/**
 * Hook للتعامل مع البيانات بشكل آمن
 * يمنع الأخطاء الشائعة ويوفر بيانات افتراضية آمنة
 */

import { useState, useEffect, useCallback } from 'react';
import {
  sanitizeCarListing,
  sanitizeAuctionData,
  SafeCarListing,
  SafeAuctionData,
} from '../utils/dataValidation';
import { logError, ErrorType, validateApiResponse } from '../utils/errorPrevention';

// أنواع البيانات المدعومة
export type DataType = 'car' | 'auction' | 'user' | 'generic';

// واجهة خيارات الـ hook
interface UseSafeDataOptions<T> {
  type: DataType;
  defaultData?: Partial<T>;
  validateRequired?: string[];
  onError?: (error: any) => void;
  onSuccess?: (data: T) => void;
}

// واجهة حالة البيانات
interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isValid: boolean;
}

// Hook للتعامل مع البيانات بشكل آمن
export function useSafeData<T = any>(options: UseSafeDataOptions<T>) {
  const [state, setState] = useState<DataState<T>>({
    data: null,
    loading: false,
    error: null,
    isValid: false,
  });

  // دالة تنظيف البيانات حسب النوع
  const sanitizeData = useCallback(
    (rawData: any): T | null => {
      try {
        if (!rawData) {
          logError({
            type: ErrorType.NULL_REFERENCE,
            message: 'البيانات المرسلة فارغة',
            location: `useSafeData.sanitizeData (${options.type})`,
            data: { rawData },
            timestamp: new Date(),
          });
          return null;
        }

        let sanitizedData: any;

        switch (options.type) {
          case 'car':
            sanitizedData = sanitizeCarListing(rawData);
            break;
          case 'auction':
            sanitizedData = sanitizeAuctionData(rawData);
            break;
          case 'user':
            // يمكن إضافة دالة تنظيف للمستخدمين لاحقاً
            sanitizedData = rawData;
            break;
          case 'generic':
          default:
            sanitizedData = rawData;
            break;
        }

        return sanitizedData as T;
      } catch (error) {
        logError({
          type: ErrorType.VALIDATION_ERROR,
          message: `فشل في تنظيف البيانات: ${error}`,
          location: `useSafeData.sanitizeData (${options.type})`,
          data: { rawData, error },
          timestamp: new Date(),
        });
        return null;
      }
    },
    [options.type],
  );

  // دالة تحديث البيانات
  const updateData = useCallback(
    (rawData: any) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const sanitizedData = sanitizeData(rawData);

        if (sanitizedData) {
          setState({
            data: sanitizedData,
            loading: false,
            error: null,
            isValid: true,
          });

          if (options.onSuccess) {
            options.onSuccess(sanitizedData);
          }
        } else {
          const errorMessage = 'فشل في تنظيف البيانات';
          setState({
            data: null,
            loading: false,
            error: errorMessage,
            isValid: false,
          });

          if (options.onError) {
            options.onError(new Error(errorMessage));
          }
        }
      } catch (error) {
        const errorMessage = `خطأ في معالجة البيانات: ${error}`;
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          isValid: false,
        });

        if (options.onError) {
          options.onError(error);
        }
      }
    },
    [sanitizeData, options.onSuccess, options.onError],
  );

  // دالة جلب البيانات من API
  const fetchData = useCallback(
    async (url: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();

        if (!validateApiResponse(responseData, `useSafeData.fetchData (${url})`)) {
          throw new Error('استجابة API غير صحيحة');
        }

        // استخدام البيانات من response.data أو response مباشرة
        const rawData = responseData.data || responseData;
        updateData(rawData);
      } catch (error) {
        const errorMessage = `فشل في جلب البيانات: ${error}`;
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          isValid: false,
        });

        logError({
          type: ErrorType.API_ERROR,
          message: errorMessage,
          location: `useSafeData.fetchData (${url})`,
          data: { url, error },
          timestamp: new Date(),
        });

        if (options.onError) {
          options.onError(error);
        }
      }
    },
    [updateData, options.onError],
  );

  // دالة إعادة تعيين البيانات
  const resetData = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isValid: false,
    });
  }, []);

  // دالة تعيين بيانات افتراضية
  const setDefaultData = useCallback(() => {
    if (options.defaultData) {
      const sanitizedDefault = sanitizeData(options.defaultData);
      if (sanitizedDefault) {
        setState({
          data: sanitizedDefault,
          loading: false,
          error: null,
          isValid: true,
        });
      }
    }
  }, [options.defaultData, sanitizeData]);

  return {
    // الحالة
    data: state.data,
    loading: state.loading,
    error: state.error,
    isValid: state.isValid,

    // الدوال
    updateData,
    fetchData,
    resetData,
    setDefaultData,

    // دوال مساعدة
    sanitizeData,
  };
}

// Hook مخصص للسيارات
export function useSafeCarData(options?: Omit<UseSafeDataOptions<SafeCarListing>, 'type'>) {
  return useSafeData<SafeCarListing>({
    ...options,
    type: 'car',
  });
}

// Hook مخصص للمزادات
export function useSafeAuctionData(options?: Omit<UseSafeDataOptions<SafeAuctionData>, 'type'>) {
  return useSafeData<SafeAuctionData>({
    ...options,
    type: 'auction',
  });
}

// Hook للتعامل مع قوائم البيانات
export function useSafeDataList<T>(options: UseSafeDataOptions<T[]>) {
  const [state, setState] = useState<DataState<T[]>>({
    data: [],
    loading: false,
    error: null,
    isValid: false,
  });

  const updateList = useCallback(
    (rawList: any[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        if (!Array.isArray(rawList)) {
          throw new Error('البيانات المرسلة ليست مصفوفة');
        }

        const sanitizedList: T[] = [];

        for (const item of rawList) {
          let sanitizedItem: any;

          switch (options.type) {
            case 'car':
              sanitizedItem = sanitizeCarListing(item);
              break;
            case 'auction':
              sanitizedItem = sanitizeAuctionData(item);
              break;
            default:
              sanitizedItem = item;
              break;
          }

          if (sanitizedItem) {
            sanitizedList.push(sanitizedItem);
          }
        }

        setState({
          data: sanitizedList,
          loading: false,
          error: null,
          isValid: true,
        });

        if (options.onSuccess) {
          options.onSuccess(sanitizedList);
        }
      } catch (error) {
        const errorMessage = `خطأ في معالجة القائمة: ${error}`;
        setState({
          data: [],
          loading: false,
          error: errorMessage,
          isValid: false,
        });

        if (options.onError) {
          options.onError(error);
        }
      }
    },
    [options],
  );

  const fetchList = useCallback(
    async (url: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();

        if (!validateApiResponse(responseData, `useSafeDataList.fetchList (${url})`)) {
          throw new Error('استجابة API غير صحيحة');
        }

        const rawList = responseData.data || responseData;
        updateList(rawList);
      } catch (error) {
        const errorMessage = `فشل في جلب القائمة: ${error}`;
        setState({
          data: [],
          loading: false,
          error: errorMessage,
          isValid: false,
        });

        if (options.onError) {
          options.onError(error);
        }
      }
    },
    [updateList, options.onError],
  );

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    isValid: state.isValid,
    updateList,
    fetchList,
    resetList: () => setState({ data: [], loading: false, error: null, isValid: false }),
  };
}

export default useSafeData;
