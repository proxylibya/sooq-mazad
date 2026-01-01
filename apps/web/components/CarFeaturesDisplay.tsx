import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import FireIcon from '@heroicons/react/24/outline/FireIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import WrenchScrewdriverIcon from '@heroicons/react/24/outline/WrenchScrewdriverIcon';
import React from 'react';

interface CarFeaturesDisplayProps {
  features: any;
  title: string;
  iconColor?: string;
  className?: string;
}

const CarFeaturesDisplay: React.FC<CarFeaturesDisplayProps> = ({
  features,
  title,
  iconColor = 'text-gray-600',
  className = '',
}) => {
  // دالة لتحليل وتنظيف البيانات
  const parseFeatures = (data: any): string[] => {
    if (!data) return [];

    // دالة مساعدة لتنظيف النص من الأقواس والرموز غير المرغوبة
    const cleanText = (text: string): string => {
      if (!text || typeof text !== 'string') return '';

      return text
        .replace(/^\[+|\]+$/g, '') // إزالة الأقواس المربعة من البداية والنهاية
        .replace(/^"+|"+$/g, '') // إزالة علامات التنصيص من البداية والنهاية
        .replace(/\\"/g, '"') // إصلاح علامات التنصيص المهربة
        .replace(/\[|\]/g, '') // إزالة جميع الأقواس المربعة
        .replace(/^"([^"]*)"$/g, '$1') // إزالة علامات التنصيص المحيطة بالنص
        .replace(/^[a-zA-Z_]+":"?/, '') // إزالة المفاتيح الإنجليزية مثل "bodyType":"
        .replace(/^[a-zA-Z_]+":/, '') // إزالة المفاتيح الإنجليزية مثل bodyType:
        .replace(/^{[^}]*}:/, '') // إزالة أي JSON objects في البداية
        .replace(/^[^:]*:/, '') // إزالة أي مفتاح متبوع بـ :
        .replace(/[{}]/g, '') // إزالة الأقواس المتعرجة
        .replace(/^"|"$/g, '') // إزالة علامات الاقتباس من البداية والنهاية مرة أخرى
        .replace(/^'|'$/g, '') // إزالة علامات الاقتباس المفردة
        .trim();
    };

    // إذا كانت البيانات مصفوفة بالفعل
    if (Array.isArray(data)) {
      const cleanedItems: string[] = [];

      data.forEach((item) => {
        if (item && typeof item === 'string' && item.trim() !== '') {
          const cleanedItem = cleanText(String(item));

          // إذا كان العنصر يحتوي على JSON array، حاول تحليله
          if (cleanedItem.startsWith('[') && cleanedItem.endsWith(']')) {
            try {
              const parsed = JSON.parse(cleanedItem);
              if (Array.isArray(parsed)) {
                parsed.forEach((subItem) => {
                  const cleanedSubItem = cleanText(String(subItem));
                  if (cleanedSubItem) {
                    cleanedItems.push(cleanedSubItem);
                  }
                });
              } else {
                cleanedItems.push(cleanedItem);
              }
            } catch {
              cleanedItems.push(cleanedItem);
            }
          } else {
            cleanedItems.push(cleanedItem);
          }
        }
      });

      return cleanedItems.filter((item) => item !== '');
    }

    // إذا كانت البيانات نص
    if (typeof data === 'string') {
      // تنظيف النص أولاً
      const cleanedData = cleanText(data);

      // إذا كان النص فارغاً بعد التنظيف
      if (!cleanedData) return [];

      // محاولة تحليل JSON
      try {
        const parsed = JSON.parse(cleanedData);

        // إذا كان JSON object يحتوي على خصائص السيارة
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          const featuresList: string[] = [];

          // تحويل خصائص السيارة إلى قائمة مميزات
          const featureMap: { [key: string]: string } = {
            bodyType: 'نوع الهيكل',
            fuelType: 'نوع الوقود',
            fuel: 'نوع الوقود',
            transmission: 'ناقل الحركة',
            regionalSpec: 'المواصفات الإقليمية',
            regionalSpecs: 'المواصفات الإقليمية',
            exteriorColor: 'اللون الخارجي',
            interiorColor: 'اللون الداخلي',
            seatCount: 'عدد المقاعد',
            engineSize: 'حجم المحرك',
            engineNumber: 'رقم المحرك',
            chassisNumber: 'رقم الشاسيه',
            cylinders: 'عدد الأسطوانات',
            doors: 'عدد الأبواب',
            condition: 'حالة السيارة',
            warranty: 'الضمان',
            vehicleType: 'نوع المركبة',
            manufacturingCountry: 'بلد الصنع',
            customsStatus: 'حالة الجمارك',
            licenseStatus: 'حالة الترخيص',
            insuranceStatus: 'حالة التأمين',
            paymentMethod: 'طريقة الدفع',
          };

          Object.entries(parsed).forEach(([key, value]) => {
            if (
              value &&
              value !== '' &&
              value !== 'غير محدد' &&
              value !== 'undefined' &&
              value !== null
            ) {
              // معالجة خاصة لحقل features - تقسيمه لعناصر منفصلة
              if (key === 'features' && typeof value === 'string') {
                const featureItems = value
                  .split(',')
                  .map((item) => item.trim())
                  .filter((item) => item);
                featureItems.forEach((item) => {
                  if (item) featuresList.push(item);
                });
              } else if (key === 'features' && Array.isArray(value)) {
                value.forEach((item) => {
                  const cleanedItem = cleanText(String(item));
                  if (cleanedItem) featuresList.push(cleanedItem);
                });
              } else {
                const label = featureMap[key] || key;
                const formattedValue = cleanText(String(value));
                if (formattedValue) {
                  featuresList.push(`${label}: ${formattedValue}`);
                }
              }
            }
          });

          return featuresList;
        }

        // إذا كان JSON array
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item) => item && typeof item === 'string' && item.trim() !== '')
            .map((item) => cleanText(String(item)));
        }
      } catch (error) {
        // إذا فشل تحليل JSON، حاول تقسيم النص بالفواصل
        if (cleanedData.includes(',')) {
          return cleanedData
            .split(',')
            .map((item: string) => cleanText(item))
            .filter((item: string) => item !== '');
        }

        // إذا لم يحتوي على فواصل، اعتبره عنصر واحد
        return [cleanedData];
      }
    }

    // إذا كان object مباشرة
    if (typeof data === 'object' && data !== null) {
      const featuresList: string[] = [];

      const featureMap: { [key: string]: string } = {
        bodyType: 'نوع الهيكل',
        fuelType: 'نوع الوقود',
        fuel: 'نوع الوقود',
        transmission: 'ناقل الحركة',
        regionalSpec: 'المواصفات الإقليمية',
        regionalSpecs: 'المواصفات الإقليمية',
        exteriorColor: 'اللون الخارجي',
        interiorColor: 'اللون الداخلي',
        seatCount: 'عدد المقاعد',
        engineSize: 'حجم المحرك',
        engineNumber: 'رقم المحرك',
        chassisNumber: 'رقم الشاسيه',
        cylinders: 'عدد الأسطوانات',
        doors: 'عدد الأبواب',
        condition: 'حالة السيارة',
        warranty: 'الضمان',
        vehicleType: 'نوع المركبة',
        manufacturingCountry: 'بلد الصنع',
        customsStatus: 'حالة الجمارك',
        licenseStatus: 'حالة الترخيص',
        insuranceStatus: 'حالة التأمين',
        paymentMethod: 'طريقة الدفع',
      };

      Object.entries(data).forEach(([key, value]) => {
        if (
          value &&
          value !== '' &&
          value !== 'غير محدد' &&
          value !== 'undefined' &&
          value !== null
        ) {
          // معالجة خاصة لحقل features - تقسيمه لعناصر منفصلة
          if (key === 'features' && typeof value === 'string') {
            const featureItems = value
              .split(',')
              .map((item) => item.trim())
              .filter((item) => item);
            featureItems.forEach((item) => {
              if (item) featuresList.push(item);
            });
          } else if (key === 'features' && Array.isArray(value)) {
            (value as string[]).forEach((item) => {
              const cleanedItem = cleanText(String(item));
              if (cleanedItem) featuresList.push(cleanedItem);
            });
          } else {
            const label = featureMap[key] || key;
            const formattedValue = cleanText(String(value));
            if (formattedValue) {
              featuresList.push(`${label}: ${formattedValue}`);
            }
          }
        }
      });

      return featuresList;
    }

    return [];
  };

  const safeFeatures = parseFeatures(features);

  // فلترة الخيارات المتكررة وغير المفهومة
  const filteredFeatures = safeFeatures.filter((feature) => {
    if (!feature || typeof feature !== 'string') return false;

    const featureText = feature.trim().toLowerCase();

    // إزالة الأرقام المفردة (مثل "4", "2", "7897897899", "879789789")
    if (/^\d+$/.test(featureText)) {
      return false;
    }

    // إزالة النصوص التي تحتوي على أرقام طويلة فقط (أكثر من 6 أرقام)
    if (/^\d{7,}$/.test(featureText)) {
      return false;
    }

    // إزالة النصوص التي تحتوي على "عدد المقاعد: رقم" إذا كان الرقم فقط
    if (featureText.includes('عدد المقاعد:') && /عدد المقاعد:\s*\d+$/.test(featureText)) {
      const numberPart = featureText.split(':')[1]?.trim();
      if (numberPart && /^\d+$/.test(numberPart)) {
        return false;
      }
    }

    // إزالة النصوص القصيرة جداً أو غير المفهومة
    if (featureText.length < 2) {
      return false;
    }

    // إزالة النصوص التي تحتوي على رموز غريبة فقط
    if (
      /^[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s\-:]+$/.test(
        featureText,
      )
    ) {
      return false;
    }

    return true;
  });

  if (filteredFeatures.length === 0) {
    return null;
  }

  // دالة لاختيار الأيقونة المناسبة حسب نوع الميزة
  const getFeatureIcon = (feature: string, title: string) => {
    const featureText = feature.toLowerCase();
    const titleText = title.toLowerCase();

    // أيقونات متخصصة حسب نوع الميزة
    if (
      titleText.includes('أمان') ||
      featureText.includes('أمان') ||
      featureText.includes('حماية') ||
      featureText.includes('airbag') ||
      featureText.includes('abs')
    ) {
      return <ShieldCheckIcon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />;
    }

    if (
      titleText.includes('تقنية') ||
      titleText.includes('تكنولوجيا') ||
      featureText.includes('نظام') ||
      featureText.includes('تقنية') ||
      featureText.includes('ذكي')
    ) {
      return <CogIcon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />;
    }

    if (
      titleText.includes('راحة') ||
      featureText.includes('راحة') ||
      featureText.includes('تكييف') ||
      featureText.includes('مقاعد')
    ) {
      return <SparklesIcon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />;
    }

    if (
      titleText.includes('خارجية') ||
      featureText.includes('عجلات') ||
      featureText.includes('إطارات') ||
      featureText.includes('مصابيح')
    ) {
      return <WrenchScrewdriverIcon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />;
    }

    if (titleText.includes('عامة') || titleText.includes('أساسية')) {
      return <StarIcon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />;
    }

    // أيقونة افتراضية
    return <CheckCircleIcon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />;
  };

  // حساب عدد الأعمدة حسب عدد المميزات
  const getGridCols = () => {
    if (filteredFeatures.length <= 3) return 'grid-cols-1 md:grid-cols-2';
    if (filteredFeatures.length <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  return (
    <div
      className={`rounded-lg border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all hover:shadow-md ${className}`}
    >
      <div className="mb-3 flex items-center gap-2">
        {title.includes('أمان') ? (
          <ShieldCheckIcon className="h-5 w-5 text-red-500" />
        ) : title.includes('تقنية') ? (
          <CogIcon className="h-5 w-5 text-orange-500" />
        ) : title.includes('راحة') ? (
          <SparklesIcon className="h-5 w-5 text-indigo-500" />
        ) : title.includes('خارجية') ? (
          <WrenchScrewdriverIcon className="h-5 w-5 text-purple-500" />
        ) : title.includes('عامة') ? (
          <StarIcon className="h-5 w-5 text-green-500" />
        ) : (
          <FireIcon className="h-5 w-5 text-blue-500" />
        )}
        <h5 className="text-sm font-semibold text-gray-800">{title}</h5>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {filteredFeatures.length}
        </span>
      </div>

      <div className={`grid gap-3 ${getGridCols()}`}>
        {filteredFeatures.map((feature, index) => (
          <div
            key={index}
            className="group flex min-h-[40px] items-start gap-2.5 rounded-md bg-white p-2.5 text-sm transition-all hover:bg-blue-50 hover:shadow-sm"
          >
            {getFeatureIcon(feature, title)}
            <span
              className="line-clamp-2 flex-1 break-words leading-relaxed text-gray-700 group-hover:text-gray-900"
              title={feature}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* شريط التقدم لإظهار مدى اكتمال المميزات */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 rounded-full bg-gray-200">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              filteredFeatures.length >= 10
                ? 'bg-green-500'
                : filteredFeatures.length >= 5
                  ? 'bg-blue-500'
                  : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min((filteredFeatures.length / 10) * 100, 100)}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500">
          {filteredFeatures.length >= 10
            ? 'مميزات شاملة'
            : filteredFeatures.length >= 5
              ? 'مميزات جيدة'
              : 'مميزات أساسية'}
        </span>
      </div>
    </div>
  );
};

export default CarFeaturesDisplay;
