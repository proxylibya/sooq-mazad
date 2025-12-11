/**
 * أدوات مساعدة لطلبات API مع دعم الترميز العربي
 */

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * إنشاء headers محسنة للترميز العربي
 */
export function createArabicHeaders(
  additionalHeaders: Record<string, string> = {},
): Record<string, string> {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json',
    'Accept-Charset': 'utf-8',
    'Cache-Control': 'no-cache',
    ...additionalHeaders,
  };
}

/**
 * تنظيف وتحضير النصوص العربية للإرسال
 */
export function prepareArabicText(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // إزالة المسافات الزائدة
  let cleaned = text.trim();

  // تطبيع الأحرف العربية
  cleaned = cleaned
    .replace(/ي/g, 'ي') // توحيد الياء
    .replace(/ك/g, 'ك') // توحيد الكاف
    .replace(/ة/g, 'ة'); // توحيد التاء المربوطة

  return cleaned;
}

/**
 * تحضير بيانات النموذج للإرسال مع معالجة النصوص العربية
 */
export function prepareFormData(data: Record<string, any>): Record<string, any> {
  const prepared: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // معالجة النصوص العربية
      prepared[key] = prepareArabicText(value);
    } else {
      prepared[key] = value;
    }
  }

  return prepared;
}

/**
 * طلب API محسن مع دعم الترميز العربي
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {}, timeout = 30000 } = options;

  try {
    // إنشاء headers محسنة
    const requestHeaders = createArabicHeaders(headers);

    // تحضير البيانات
    let requestBody: string | undefined;
    if (body && method !== 'GET') {
      const preparedData = prepareFormData(body);
      requestBody = JSON.stringify(preparedData);
    }

    // إنشاء AbortController للتحكم في timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Request sent silently

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // قراءة النص الخام أولاً
    const responseText = await response.text();

    // محاولة تحليل JSON
    let responseData: ApiResponse<T>;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      return {
        success: false,
        error: 'خطأ في تحليل استجابة الخادم',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: responseData.error || responseData.message || `خطأ في الخادم: ${response.status}`,
      };
    }

    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
        };
      }

      if (error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'خطأ في الاتصال بالخادم. تحقق من اتصال الإنترنت.',
        };
      }
    }

    return {
      success: false,
      error: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    };
  }
}

/**
 * طلبات API محددة للمصادقة
 */
export const authApi = {
  /**
   * تسجيل مستخدم جديد
   */
  register: async (data: {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    accountType: string;
  }) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * تسجيل الدخول
   */
  login: async (data: { phone: string; password: string }) => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * تسجيل الخروج
   */
  logout: async () => {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },
};

/**
 * اختبار الاتصال بـ API
 */
export async function testApiConnection(): Promise<boolean> {
  try {
    const response = await apiRequest('/api/health');
    return response.success;
  } catch {
    return false;
  }
}

export default {
  apiRequest,
  createArabicHeaders,
  prepareArabicText,
  prepareFormData,
  authApi,
  testApiConnection,
};
