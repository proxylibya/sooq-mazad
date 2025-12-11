import React, { useState, useEffect } from 'react';
import {
  ScaleIcon,
  XMarkIcon,
  PlusIcon,
  CheckIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  location: string;
  condition: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  images: string[];
  features?: string[];
  rating?: number;
  isAuction?: boolean;
  auctionEndTime?: string;
}

interface CarComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  initialCars?: Car[];
}

const CarComparison: React.FC<CarComparisonProps> = ({ isOpen, onClose, initialCars = [] }) => {
  const [comparedCars, setComparedCars] = useState<Car[]>(initialCars);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Car[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const router = useRouter();
  const maxCars = 3;

  // تحميل السيارات المحفوظة من localStorage
  useEffect(() => {
    const saved = localStorage.getItem('comparedCars');
    if (saved && initialCars.length === 0) {
      try {
        const savedCars = JSON.parse(saved);
        setComparedCars(savedCars);
      } catch (error) {
        console.error('خطأ في تحميل المقارنة:', error);
      }
    }
  }, []);

  // حفظ السيارات في localStorage
  useEffect(() => {
    localStorage.setItem('comparedCars', JSON.stringify(comparedCars));
  }, [comparedCars]);

  // البحث عن السيارات (محاكاة - يمكن ربطها بـ API)
  const searchCars = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // محاكاة API call
    setTimeout(() => {
      const mockResults: Car[] = [
        {
          id: '1',
          title: 'تويوتا كامري 2020',
          brand: 'تويوتا',
          model: 'كامري',
          year: 2020,
          price: 85000,
          location: 'طرابلس',
          condition: 'مستعمل',
          mileage: 45000,
          fuelType: 'بنزين',
          transmission: 'أوتوماتيك',
          bodyType: 'سيدان',
          color: 'أبيض',
          images: ['https://via.placeholder.com/300x200'],
          features: ['مكيف', 'نوافذ كهربائية', 'ABS'],
          rating: 4.5,
        },
        {
          id: '2',
          title: 'نيسان التيما 2019',
          brand: 'نيسان',
          model: 'التيما',
          year: 2019,
          price: 75000,
          location: 'بنغازي',
          condition: 'مستعمل',
          mileage: 60000,
          fuelType: 'بنزين',
          transmission: 'أوتوماتيك',
          bodyType: 'سيدان',
          color: 'أسود',
          images: ['https://via.placeholder.com/300x200'],
          features: ['مكيف', 'نوافذ كهربائية', 'مثبت سرعة'],
          rating: 4.2,
        },
      ].filter(
        (car) =>
          car.title.toLowerCase().includes(query.toLowerCase()) ||
          car.brand.toLowerCase().includes(query.toLowerCase()),
      );

      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  // إضافة سيارة للمقارنة
  const addCarToComparison = (car: Car) => {
    if (comparedCars.length >= maxCars) return;
    if (comparedCars.find((c) => c.id === car.id)) return;

    setComparedCars((prev) => [...prev, car]);
    setSearchQuery('');
    setSearchResults([]);
  };

  // إزالة سيارة من المقارنة
  const removeCarFromComparison = (carId: string) => {
    setComparedCars((prev) => prev.filter((car) => car.id !== carId));
  };

  // مسح جميع السيارات
  const clearComparison = () => {
    setComparedCars([]);
  };

  // الانتقال لصفحة السيارة
  const goToCar = (car: Car) => {
    if (car.isAuction) {
      router.push(`/auction/${car.id}`);
    } else {
      router.push(`/marketplace/${car.id}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* خلفية مظلمة */}
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        {/* محتوى المقارنة */}
        <div className="relative w-full max-w-7xl rounded-xl bg-white shadow-2xl">
          {/* رأس المقارنة */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <ScaleIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">مقارنة السيارات</h2>
              <span className="text-sm text-gray-500">
                ({comparedCars.length}/{maxCars})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {comparedCars.length > 0 && (
                <button
                  onClick={clearComparison}
                  className="rounded-lg px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  مسح الكل
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* محتوى المقارنة */}
          <div className="p-6">
            {comparedCars.length === 0 ? (
              // حالة فارغة
              <div className="py-12 text-center">
                <ScaleIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد سيارات للمقارنة</h3>
                <p className="mb-6 text-gray-500">ابحث عن السيارات وأضفها للمقارنة</p>
              </div>
            ) : (
              // جدول المقارنة
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <td className="rounded-tl-lg bg-gray-50 p-4 font-medium text-gray-900">
                        المواصفات
                      </td>
                      {comparedCars.map((car, index) => (
                        <td
                          key={car.id}
                          className={`bg-gray-50 p-4 ${index === comparedCars.length - 1 ? 'rounded-tr-lg' : ''}`}
                        >
                          <div className="relative">
                            <button
                              onClick={() => removeCarFromComparison(car.id)}
                              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                            <img
                              src={car.images[0]}
                              alt={car.title}
                              className="mb-3 h-32 w-full rounded-lg object-cover"
                            />
                            <h3 className="mb-1 font-semibold text-gray-900">{car.title}</h3>
                            <p className="text-sm text-gray-500">
                              {car.year} • {car.location}
                            </p>
                          </div>
                        </td>
                      ))}

                      {/* خانة إضافة سيارة جديدة */}
                      {comparedCars.length < maxCars && (
                        <td className="bg-gray-50 p-4">
                          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                            <PlusIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        </td>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {/* السعر */}
                    <tr>
                      <td className="bg-gray-50 p-4 font-medium text-gray-900">السعر</td>
                      {comparedCars.map((car) => (
                        <td key={`${car.id}-price`} className="p-4">
                          <div className="flex items-center gap-1">
                            <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-600">
                              {car.price.toLocaleString()} د.ل
                            </span>
                          </div>
                          {car.isAuction && <div className="mt-1 text-xs text-blue-600">مزاد</div>}
                        </td>
                      ))}
                      {comparedCars.length < maxCars && <td className="p-4"></td>}
                    </tr>

                    {/* الحالة */}
                    <tr>
                      <td className="bg-gray-50 p-4 font-medium text-gray-900">الحالة</td>
                      {comparedCars.map((car) => (
                        <td key={`${car.id}-condition`} className="p-4">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              car.condition === 'جديد'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {car.condition}
                          </span>
                        </td>
                      ))}
                      {comparedCars.length < maxCars && <td className="p-4"></td>}
                    </tr>

                    {/* المسافة المقطوعة */}
                    <tr>
                      <td className="bg-gray-50 p-4 font-medium text-gray-900">المسافة المقطوعة</td>
                      {comparedCars.map((car) => (
                        <td key={`${car.id}-mileage`} className="p-4">
                          {car.mileage ? `${car.mileage.toLocaleString('en-US')} كم` : 'غير محدد'}
                        </td>
                      ))}
                      {comparedCars.length < maxCars && <td className="p-4"></td>}
                    </tr>

                    {/* نوع الوقود */}
                    <tr>
                      <td className="bg-gray-50 p-4 font-medium text-gray-900">نوع الوقود</td>
                      {comparedCars.map((car) => (
                        <td key={`${car.id}-fuel`} className="p-4">
                          {car.fuelType || 'غير محدد'}
                        </td>
                      ))}
                      {comparedCars.length < maxCars && <td className="p-4"></td>}
                    </tr>

                    {/* ناقل الحركة */}
                    <tr>
                      <td className="bg-gray-50 p-4 font-medium text-gray-900">ناقل الحركة</td>
                      {comparedCars.map((car) => (
                        <td key={`${car.id}-transmission`} className="p-4">
                          {car.transmission || 'غير محدد'}
                        </td>
                      ))}
                      {comparedCars.length < maxCars && <td className="p-4"></td>}
                    </tr>

                    {/* نوع الهيكل */}
                    <tr>
                      <td className="bg-gray-50 p-4 font-medium text-gray-900">نوع الهيكل</td>
                      {comparedCars.map((car) => (
                        <td key={`${car.id}-body`} className="p-4">
                          {car.bodyType || 'غير محدد'}
                        </td>
                      ))}
                      {comparedCars.length < maxCars && <td className="p-4"></td>}
                    </tr>

                    {/* اللون */}
                    <tr>
                      <td className="bg-gray-50 p-4 font-medium text-gray-900">اللون</td>
                      {comparedCars.map((car) => (
                        <td key={`${car.id}-color`} className="p-4">
                          {car.color || 'غير محدد'}
                        </td>
                      ))}
                      {comparedCars.length < maxCars && <td className="p-4"></td>}
                    </tr>

                    {/* التقييم */}
                    <tr>
                      <td className="bg-gray-50 p-4 font-medium text-gray-900">التقييم</td>
                      {comparedCars.map((car) => (
                        <td key={`${car.id}-rating`} className="p-4">
                          {car.rating ? (
                            <div className="flex items-center gap-1">
                              <StarIcon className="h-4 w-4 fill-current text-yellow-400" />
                              <span>{car.rating}</span>
                            </div>
                          ) : (
                            'غير مقيم'
                          )}
                        </td>
                      ))}
                      {comparedCars.length < maxCars && <td className="p-4"></td>}
                    </tr>

                    {/* الإجراءات */}
                    <tr>
                      <td className="bg-gray-50 p-4 font-medium text-gray-900">الإجراءات</td>
                      {comparedCars.map((car) => (
                        <td key={`${car.id}-actions`} className="p-4">
                          <div className="space-y-2">
                            <button
                              onClick={() => goToCar(car)}
                              className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                            >
                              عرض التفاصيل
                            </button>
                            {car.isAuction && (
                              <button
                                onClick={() => goToCar(car)}
                                className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition-colors hover:bg-green-700"
                              >
                                زايد الآن
                              </button>
                            )}
                          </div>
                        </td>
                      ))}
                      {comparedCars.length < maxCars && <td className="p-4"></td>}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* قسم البحث وإضافة السيارات */}
            {comparedCars.length < maxCars && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">إضافة سيارة للمقارنة</h3>

                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchCars(e.target.value);
                    }}
                    placeholder="ابحث عن سيارة..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                  {isSearching && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>

                {/* نتائج البحث */}
                {searchResults.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((car) => (
                      <div key={car.id} className="rounded-lg border border-gray-200 p-4">
                        <img
                          src={car.images[0]}
                          alt={car.title}
                          className="mb-3 h-32 w-full rounded-lg object-cover"
                        />
                        <h4 className="mb-1 font-semibold text-gray-900">{car.title}</h4>
                        <p className="mb-2 text-sm text-gray-500">
                          {car.price.toLocaleString('en-US')} د.ل • {car.location}
                        </p>
                        <button
                          onClick={() => addCarToComparison(car)}
                          disabled={comparedCars.find((c) => c.id === car.id) !== undefined}
                          className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {comparedCars.find((c) => c.id === car.id) ? (
                            <div className="flex items-center justify-center gap-1">
                              <CheckIcon className="h-4 w-4" />
                              مُضافة
                            </div>
                          ) : (
                            'إضافة للمقارنة'
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarComparison;
