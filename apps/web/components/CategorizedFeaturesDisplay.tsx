import React from 'react';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import ComputerDesktopIcon from '@heroicons/react/24/outline/ComputerDesktopIcon';

interface CategorizedFeaturesDisplayProps {
  features: string[];
  className?: string;
}

const CategorizedFeaturesDisplay: React.FC<CategorizedFeaturesDisplayProps> = ({
  features,
  className = '',
}) => {
  // تصنيف الكماليات
  const categorizeFeatures = (featuresList: string[]) => {
    const categories = {
      comfort: {
        title: 'الراحة والتكييف',
        icon: SparklesIcon,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        features: [] as string[],
      },
      interior: {
        title: 'المميزات الداخلية',
        icon: ComputerDesktopIcon,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        features: [] as string[],
      },
      exterior: {
        title: 'المميزات الخارجية',
        icon: TruckIcon,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        features: [] as string[],
      },
      technical: {
        title: 'المميزات التقنية',
        icon: CogIcon,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        features: [] as string[],
      },
      other: {
        title: 'مميزات أخرى',
        icon: CheckCircleIcon,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        features: [] as string[],
      },
    };

    // كلمات مفتاحية لتصنيف الكماليات
    const comfortKeywords = ['تكييف', 'تدفئة', 'مقاعد', 'كراسي', 'راحة', 'تهوية', 'تبريد'];

    const interiorKeywords = [
      'شاشة',
      'لمس',
      'جلد',
      'قماش',
      'داخلية',
      'مقود',
      'عجلة',
      'لوحة',
      'أضواء داخلية',
      'مرايا',
      'نوافذ',
      'ستائر',
      'تحكم',
      'ريموت',
      'مفاتيح',
    ];

    const exteriorKeywords = [
      'جنوط',
      'إطارات',
      'مصابيح',
      'LED',
      'زينون',
      'فتحة سقف',
      'سقف',
      'مرايا جانبية',
      'مصدات',
      'واقيات',
      'خارجية',
      'طلاء',
      'لون',
    ];

    const technicalKeywords = [
      'ABS',
      'ESP',
      'وسائد هوائية',
      'فرامل',
      'نظام',
      'GPS',
      'ملاحة',
      'بلوتوث',
      'USB',
      'كاميرا',
      'حساسات',
      'رادار',
      'تحكم',
      'سرعة',
      'ثبات',
      'مراقبة',
      'إنذار',
      'أمان',
      'حماية',
      'تشخيص',
    ];

    featuresList.forEach((feature) => {
      const lowerFeature = feature.toLowerCase();

      if (comfortKeywords.some((keyword) => lowerFeature.includes(keyword))) {
        categories.comfort.features.push(feature);
      } else if (interiorKeywords.some((keyword) => lowerFeature.includes(keyword))) {
        categories.interior.features.push(feature);
      } else if (exteriorKeywords.some((keyword) => lowerFeature.includes(keyword))) {
        categories.exterior.features.push(feature);
      } else if (technicalKeywords.some((keyword) => lowerFeature.includes(keyword))) {
        categories.technical.features.push(feature);
      } else {
        categories.other.features.push(feature);
      }
    });

    return categories;
  };

  if (!features || features.length === 0) {
    return null;
  }

  const categorizedFeatures = categorizeFeatures(features);

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(categorizedFeatures).map(([key, category]) => {
        if (category.features.length === 0) return null;

        const IconComponent = category.icon;

        return (
          <div key={key} className={`rounded-lg p-4 ${category.bgColor}`}>
            <div className="mb-3 flex items-center gap-2">
              <IconComponent className={`h-5 w-5 ${category.color}`} />
              <h4 className="font-medium text-gray-900">{category.title}</h4>
              <span className="text-sm text-gray-500">({category.features.length})</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {category.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircleIcon className={`h-4 w-4 ${category.color} flex-shrink-0`} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategorizedFeaturesDisplay;
