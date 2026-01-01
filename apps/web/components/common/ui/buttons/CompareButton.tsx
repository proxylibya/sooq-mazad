import React, { useState, useEffect } from 'react';
import ArrowsRightLeftIcon from '@heroicons/react/24/outline/ArrowsRightLeftIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import { CompareListStorage } from '../../../../utils/localStorage';

interface Car {
  id: number;
  title: string;
  price: string;
  image: string;
  brand: string;
  model: string;
  year: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  engineSize: string;
  color: string;
  condition: string;
  doors: string;
  features: string[];
  safety: string[];
  location: string;
  seller: string;
}

interface CompareButtonProps {
  car: Car;
  className?: string;
}

const CompareButton: React.FC<CompareButtonProps> = ({ car, className = '' }) => {
  const [compareList, setCompareList] = useState<Car[]>([]);
  const [isInCompare, setIsInCompare] = useState(false);

  // تحميل قائمة المقارنة من التخزين المحلي
  useEffect(() => {
    const list = CompareListStorage.getCompareList();
    setCompareList(list);
    setIsInCompare(CompareListStorage.isInCompareList(car.id));
  }, [car.id]);

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCompare) {
      // إزالة من المقارنة
      const success = CompareListStorage.removeFromCompare(car.id);
      if (success) {
        setIsInCompare(false);
        setCompareList(CompareListStorage.getCompareList());
        showNotification('تم إزالة السيارة من المقارنة');
      }
    } else {
      // إضافة للمقارنة
      if (compareList.length >= 3) {
        alert('يمكنك مقارنة 3 سيارات كحد أقصى');
        return;
      }

      // تحويل بيانات السيارة للصيغة المطلوبة
      const carForCompare: Car = {
        id: car.id,
        title: car.title,
        price: car.price,
        image:
          car.image ||
          'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        brand: car.brand || extractBrand(car.title),
        model: car.model || extractModel(car.title),
        year: car.year || extractYear(car.title),
        mileage: car.mileage || 'غير محدد',
        fuelType: car.fuelType || 'بنزين',
        transmission: car.transmission || 'أوتوماتيك',
        engineSize: car.engineSize || 'غير محدد',
        color: car.color || 'غير محدد',
        condition: car.condition || 'مستعمل',
        doors: car.doors || '4 أبواب',
        features: car.features || ['تكييف', 'نوافذ كهربائية'],
        safety: car.safety || ['وسائد هوائية', 'ABS'],
        location: car.location || 'غير محدد',
        seller: car.seller || 'غير محدد',
      };

      const success = CompareListStorage.addToCompare(carForCompare);
      if (success) {
        setIsInCompare(true);
        setCompareList(CompareListStorage.getCompareList());
        showNotification('تم إضافة السيارة للمقارنة');
      }
    }
  };

  // استخراج الماركة من العنوان
  const extractBrand = (title: string): string => {
    const brands = [
      'BMW',
      'تويوتا',
      'مرسيدس',
      'نيسان',
      'هوندا',
      'كيا',
      'هيونداي',
      'فورد',
      'شيفروليه',
    ];
    for (const brand of brands) {
      if (title.includes(brand)) {
        return brand;
      }
    }
    return title.split(' ')[0];
  };

  // استخراج الموديل من العنوان
  const extractModel = (title: string): string => {
    const words = title.split(' ');
    return words.length > 1 ? words[1] : 'غير محدد';
  };

  // استخراج السنة من العنوان
  const extractYear = (title: string): string => {
    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? yearMatch[0] : 'غير محدد';
  };

  // إظهار إشعار
  const showNotification = (message: string) => {
    // يمكن تحسين هذا لاحقاً بمكون إشعارات أفضل
    const notification = document.createElement('div');
    notification.className =
      'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  };

  return (
    <button
      onClick={toggleCompare}
      className={`flex items-center gap-1 rounded-lg px-3 py-2 font-medium transition-colors ${
        isInCompare
          ? 'border border-green-300 bg-green-100 text-green-700'
          : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
      title={isInCompare ? 'إزالة من المقارنة' : 'إضافة للمقارنة'}
    >
      {isInCompare ? (
        <CheckIcon className="h-4 w-4" />
      ) : (
        <ArrowsRightLeftIcon className="h-4 w-4" />
      )}
      <span className="text-sm">{isInCompare ? 'في المقارنة' : 'مقارنة'}</span>
    </button>
  );
};

export default CompareButton;
