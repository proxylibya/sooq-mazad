import React from 'react';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import { useLocalization } from '../contexts/SimpleLocalizationContext';
import Flag from './Flag';

interface CountrySelectorProps {
  className?: string;
}

interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'LY', name: 'ليبيا', flag: '🇱🇾' },
  { code: 'EG', name: 'مصر', flag: '🇪🇬' },
  { code: 'TN', name: 'تونس', flag: '🇹🇳' },
  { code: 'DZ', name: 'الجزائر', flag: '🇩🇿' },
  { code: 'MA', name: 'المغرب', flag: '🇲🇦' },
  { code: 'SA', name: 'السعودية', flag: '🇸🇦' },
  { code: 'AE', name: 'الإمارات', flag: '🇦🇪' },
  { code: 'US', name: 'الولايات المتحدة', flag: '🇺🇸' },
];

// دالة كشف البلد من IP
const detectCountryFromIP = async (): Promise<Country | null> => {
  try {
    // إنشاء AbortController للتحكم في المهلة الزمنية
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 ثوان

    // استخدام خدمة مجانية لكشف IP
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: فشل في الحصول على بيانات IP`);
    }

    const data = await response.json();
    const countryCode = data.country_code;

    if (!countryCode) {
      console.warn('لم يتم العثور على رمز البلد في الاستجابة');
      return null;
    }

    // البحث عن البلد في قائمتنا
    const detectedCountry = countries.find((c) => c.code === countryCode);

    if (detectedCountry) {
      console.log(`تم اكتشاف البلد: ${detectedCountry.name} (${detectedCountry.code})`);
    } else {
      console.warn(`البلد المكتشف (${countryCode}) غير موجود في قائمتنا`);
    }

    return detectedCountry || null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('انتهت المهلة الزمنية لكشف البلد من IP');
    } else {
      console.warn('تعذر كشف البلد من IP:', error);
    }
    return null;
  }
};

// دالة إظهار إشعار الكشف التلقائي
const showAutoDetectionNotification = (country: Country) => {
  // إنشاء إشعار مؤقت
  const notification = document.createElement('div');
  notification.className =
    'fixed top-20 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 max-w-sm';
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-lg">${country.flag}</span>
      <div class="flex-1">
        <div class="font-medium">تم اكتشاف موقعك تلقائياً</div>
        <div class="text-sm text-blue-100">البلد: ${country.name}</div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="text-blue-200 hover:text-white">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(notification);

  // إزالة الإشعار تلقائياً بعد 5 ثوان
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }, 5000);
};

const CountrySelector: React.FC<CountrySelectorProps> = ({ className = '' }) => {
  const { country, isLoading } = useLocalization();

  return (
    <div className={`relative ${className}`}>
      <div className="ml-4 flex min-w-[120px] items-center gap-2 px-2 py-1 text-sm text-gray-700">
        {isLoading ? (
          <>
            <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
            
          </>
        ) : country ? (
          <>
            <Flag countryCode={country.code} size="sm" />
            <span className="hidden font-medium sm:inline">{country.name}</span>
            <span className="font-medium sm:hidden">{country.code}</span>
          </>
        ) : (
          <>
            <GlobeAltIcon className="h-4 w-4" />
            <span className="text-xs font-medium text-gray-500">ليبيا</span>
          </>
        )}
      </div>
    </div>
  );
};

export default CountrySelector;
