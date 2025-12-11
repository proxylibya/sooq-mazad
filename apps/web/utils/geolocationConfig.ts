// إعدادات تحديد الموقع الجغرافي المحسنة
export interface GeolocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

export interface GeolocationConfig {
  // إعدادات المحاولات المختلفة
  attempts: {
    first: GeolocationOptions;
    retry: GeolocationOptions;
    final: GeolocationOptions;
  };

  // عتبات الدقة
  accuracyThresholds: {
    excellent: number; // دقة ممتازة
    good: number; // دقة جيدة
    acceptable: number; // دقة مقبولة
  };

  // إعدادات إعادة المحاولة
  retry: {
    maxAttempts: number;
    delayBetweenAttempts: number;
    increaseTimeoutOnRetry: boolean;
  };

  // رسائل الحالة
  messages: {
    loading: string;
    success: string;
    error: {
      permissionDenied: string;
      positionUnavailable: string;
      timeout: string;
      general: string;
    };
    accuracy: {
      excellent: string;
      good: string;
      acceptable: string;
      poor: string;
    };
  };
}

// التكوين الافتراضي المحسن
export const DEFAULT_GEOLOCATION_CONFIG: GeolocationConfig = {
  attempts: {
    // المحاولة الأولى - أقصى دقة ووقت أطول
    first: {
      enableHighAccuracy: true,
      timeout: 20000, // 20 ثانية
      maximumAge: 0, // لا نستخدم cache
    },

    // محاولات إعادة - توازن بين الدقة والسرعة
    retry: {
      enableHighAccuracy: true,
      timeout: 15000, // 15 ثانية
      maximumAge: 30000, // 30 ثانية cache
    },

    // المحاولة الأخيرة - أولوية للسرعة
    final: {
      enableHighAccuracy: false, // تقليل استهلاك البطارية
      timeout: 10000, // 10 ثواني
      maximumAge: 60000, // دقيقة واحدة cache
    },
  },

  accuracyThresholds: {
    excellent: 50, // أقل من 50 متر
    good: 150, // أقل من 150 متر
    acceptable: 500, // أقل من 500 متر (محسن للبيئة الليبية)
  },

  retry: {
    maxAttempts: 3,
    delayBetweenAttempts: 2000, // ثانيتان
    increaseTimeoutOnRetry: false,
  },

  messages: {
    loading: 'جاري تحديد موقعك...',
    success: 'تم تحديد الموقع بنجاح',
    error: {
      permissionDenied:
        'تم رفض الإذن للوصول إلى الموقع. يرجى السماح بالوصول إلى الموقع في إعدادات المتصفح.',
      positionUnavailable: 'معلومات الموقع غير متاحة حالياً. تأكد من تفعيل GPS وأنك في مكان مفتوح.',
      timeout: 'انتهت مهلة الحصول على الموقع. يرجى المحاولة مرة أخرى.',
      general: 'لا يمكن الحصول على موقعك الحالي.',
    },
    accuracy: {
      excellent: 'دقة ممتازة',
      good: 'دقة جيدة',
      acceptable: 'دقة مقبولة',
      poor: 'دقة منخفضة',
    },
  },
};

// دالة لتحديد مستوى الدقة
export function getAccuracyLevel(
  accuracy: number,
  config: GeolocationConfig = DEFAULT_GEOLOCATION_CONFIG,
): {
  level: 'excellent' | 'good' | 'acceptable' | 'poor';
  message: string;
  color: string;
} {
  if (accuracy <= config.accuracyThresholds.excellent) {
    return {
      level: 'excellent',
      message: config.messages.accuracy.excellent,
      color: 'green-600',
    };
  } else if (accuracy <= config.accuracyThresholds.good) {
    return {
      level: 'good',
      message: config.messages.accuracy.good,
      color: 'green-500',
    };
  } else if (accuracy <= config.accuracyThresholds.acceptable) {
    return {
      level: 'acceptable',
      message: config.messages.accuracy.acceptable,
      color: 'yellow-500',
    };
  } else {
    return {
      level: 'poor',
      message: config.messages.accuracy.poor,
      color: 'red-500',
    };
  }
}

// دالة لتحديد إعدادات المحاولة
export function getAttemptOptions(
  attempt: number,
  maxAttempts: number,
  config: GeolocationConfig = DEFAULT_GEOLOCATION_CONFIG,
): GeolocationOptions {
  if (attempt === 1) {
    return config.attempts.first;
  } else if (attempt === maxAttempts) {
    return config.attempts.final;
  } else {
    return config.attempts.retry;
  }
}

// دالة لتنسيق رسالة الخطأ
export function formatErrorMessage(
  error: GeolocationPositionError,
  attempt: number,
  maxAttempts: number,
  config: GeolocationConfig = DEFAULT_GEOLOCATION_CONFIG,
): string {
  let baseMessage = '';

  switch (error.code) {
    case error.PERMISSION_DENIED:
      baseMessage = config.messages.error.permissionDenied;
      break;
    case error.POSITION_UNAVAILABLE:
      baseMessage = config.messages.error.positionUnavailable;
      break;
    case error.TIMEOUT:
      baseMessage = config.messages.error.timeout;
      break;
    default:
      baseMessage = config.messages.error.general;
  }

  if (maxAttempts > 1) {
    baseMessage += ` (المحاولة ${attempt} من ${maxAttempts})`;
  }

  return baseMessage;
}

// دالة لتنسيق عنوان الموقع مع معلومات الدقة
export function formatLocationAddress(
  address: string,
  accuracy: number,
  config: GeolocationConfig = DEFAULT_GEOLOCATION_CONFIG,
): string {
  const accuracyInfo = getAccuracyLevel(accuracy, config);

  if (accuracyInfo.level === 'excellent') {
    return address; // لا نضيف معلومات إضافية للدقة الممتازة
  } else {
    return `${address} (${accuracyInfo.message}: ${Math.round(accuracy)}م)`;
  }
}

// نصائح لتحسين دقة الموقع
export const LOCATION_ACCURACY_TIPS = [
  'تأكد من تفعيل GPS في جهازك',
  'اخرج إلى مكان مفتوح بعيداً عن المباني العالية',
  'انتظر قليلاً للحصول على إشارة أقوى',
  'تأكد من السماح للمتصفح بالوصول للموقع',
  'أغلق التطبيقات الأخرى التي تستخدم GPS',
  'تأكد من أن جهازك متصل بالإنترنت',
  'في الأماكن المغلقة، اقترب من النوافذ',
];

// دالة للحصول على الموقع بسرعة (للاستخدام في المعارض)
export function getLocationQuickly(
  onSuccess: (position: GeolocationPosition) => void,
  onError: (error: GeolocationPositionError) => void,
  useFastConfig: boolean = true,
): void {
  if (!navigator.geolocation) {
    const mockError = {
      code: 2,
      message: 'Geolocation not supported',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;
    onError(mockError);
    return;
  }

  const config = useFastConfig ? FAST_GEOLOCATION_CONFIG : LIBYA_GEOLOCATION_CONFIG;
  const mergedConfig = { ...DEFAULT_GEOLOCATION_CONFIG, ...config };
  const options = mergedConfig.attempts.first;

  console.log('🚀 بدء الحصول على الموقع بالوضع السريع...');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const accuracy = position.coords.accuracy;
      console.log(`✅ تم الحصول على الموقع بدقة ${Math.round(accuracy)} متر`);
      onSuccess(position);
    },
    (error) => {
      console.log(`❌ فشل في الحصول على الموقع: ${error.message}`);
      onError(error);
    },
    options,
  );
}

// إعدادات خاصة بليبيا - محسنة للسرعة
export const LIBYA_GEOLOCATION_CONFIG: Partial<GeolocationConfig> = {
  // إعدادات محسنة للبيئة الليبية مع التركيز على السرعة
  attempts: {
    first: {
      enableHighAccuracy: false, // تقليل الدقة للحصول على سرعة أكبر
      timeout: 8000, // وقت أقل للحصول على استجابة سريعة
      maximumAge: 300000, // 5 دقائق - استخدام cache إذا متوفر
    },
    retry: {
      enableHighAccuracy: false,
      timeout: 6000, // وقت أقل
      maximumAge: 600000, // 10 دقائق cache
    },
    final: {
      enableHighAccuracy: false,
      timeout: 4000, // وقت قصير جداً
      maximumAge: 900000, // 15 دقيقة cache
    },
  },

  // عتبات دقة أكثر تساهلاً للبيئة الليبية
  accuracyThresholds: {
    excellent: 500, // أقل من 500 متر
    good: 2000, // أقل من 2 كيلومتر
    acceptable: 10000, // أقل من 10 كيلومتر (مناسب للمناطق الريفية والصحراوية)
  },

  retry: {
    maxAttempts: 2, // محاولتان فقط لتوفير الوقت
    delayBetweenAttempts: 1000, // ثانية واحدة فقط بين المحاولات
    increaseTimeoutOnRetry: false,
  },
};

// إعدادات سريعة للحصول على الموقع بأسرع وقت ممكن
export const FAST_GEOLOCATION_CONFIG: Partial<GeolocationConfig> = {
  attempts: {
    first: {
      enableHighAccuracy: false,
      timeout: 5000, // 5 ثوان فقط
      maximumAge: 600000, // 10 دقائق cache
    },
    retry: {
      enableHighAccuracy: false,
      timeout: 3000, // 3 ثوان
      maximumAge: 900000, // 15 دقيقة cache
    },
    final: {
      enableHighAccuracy: false,
      timeout: 2000, // ثانيتان فقط
      maximumAge: 1800000, // 30 دقيقة cache
    },
  },

  accuracyThresholds: {
    excellent: 1000, // أقل من 1 كيلومتر
    good: 5000, // أقل من 5 كيلومتر
    acceptable: 50000, // أقل من 50 كيلومتر - مقبول لأي موقع تقريباً
  },

  retry: {
    maxAttempts: 1, // محاولة واحدة فقط
    delayBetweenAttempts: 500, // نصف ثانية
    increaseTimeoutOnRetry: false,
  },
};
