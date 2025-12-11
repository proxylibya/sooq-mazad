import ArrowsRightLeftIcon from '@heroicons/react/24/outline/ArrowsRightLeftIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { OpensooqNavbar } from '../components/common';
import { CompareListStorage } from '../utils/unifiedLocalStorage';

// نوع بيانات السيارة للمقارنة
interface CompareCar {
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

// صفحة مقارنة السيارات
const ComparePage = () => {
  const router = useRouter();
  const [compareList, setCompareList] = useState<CompareCar[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // تم حذف البيانات التجريبية للسيارات
  const availableCars: CompareCar[] = [];

  // تحميل قائمة المقارنة من التخزين المحلي
  useEffect(() => {
    const list = CompareListStorage.getCompareList();
    setCompareList(list);
  }, []);

  // حفظ قائمة المقارنة في التخزين المحلي
  useEffect(() => {
    CompareListStorage.setCompareList(compareList);
  }, [compareList]);

  const addToCompare = (car: CompareCar) => {
    if (compareList.length >= 3) {
      alert('يمكنك مقارنة 3 سيارات كحد أقصى');
      return;
    }
    if (!compareList.find((c) => c.id === car.id)) {
      setCompareList([...compareList, car]);
    }
    setShowAddModal(false);
  };

  const removeFromCompare = (carId: number) => {
    CompareListStorage.removeFromCompare(carId);
    setCompareList(CompareListStorage.getCompareList());
  };

  const clearAll = () => {
    CompareListStorage.clearCompareList();
    setCompareList([]);
  };

  const filteredCars = availableCars.filter(
    (car) =>
      car.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatNumber = (num: string) => {
    return parseInt(num.replace(/,/g, '')).toLocaleString();
  };

  return (
    <>
      <Head>
        <title>مقارنة السيارات - مزاد السيارات</title>
        <meta name="description" content="قارن بين السيارات المختلفة لاتخاذ القرار الأفضل" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Header */}
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                  <ArrowsRightLeftIcon className="h-8 w-8 text-blue-600" />
                  مقارنة السيارات
                </h1>
                <p className="mt-2 text-gray-600">قارن بين السيارات لاتخاذ القرار الأفضل</p>
              </div>
              <div className="flex items-center gap-3">
                {compareList.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="font-medium text-red-600 hover:text-red-800"
                  >
                    مسح الكل
                  </button>
                )}
                <span className="text-sm text-gray-500">{compareList.length}/3 سيارات</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          {compareList.length === 0 ? (
            // Empty State
            <div className="py-16 text-center">
              <ArrowsRightLeftIcon className="mx-auto mb-6 h-24 w-24 text-gray-300" />
              <h2 className="mb-4 text-2xl font-bold text-gray-900">ابدأ مقارنة السيارات</h2>
              <p className="mx-auto mb-8 max-w-md text-gray-600">
                أضف السيارات التي تريد مقارنتها لمساعدتك في اتخاذ القرار الأفضل
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5" />
                إضافة سيارة للمقارنة
              </button>
            </div>
          ) : (
            // Comparison Table
            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
              {/* Add Car Button */}
              {compareList.length < 3 && (
                <div className="border-b bg-gray-50 p-4">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    إضافة سيارة أخرى
                  </button>
                </div>
              )}

              {/* Cars Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <td className="w-48 p-4 font-semibold text-gray-900">المواصفات</td>
                      {compareList.map((car) => (
                        <td key={car.id} className="min-w-80 p-4 text-center">
                          <div className="relative">
                            <button
                              onClick={() => removeFromCompare(car.id)}
                              className="absolute right-0 top-0 text-red-500 hover:text-red-700"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                            <img
                              src={car.image}
                              alt={car.title}
                              className="mb-3 h-32 w-full rounded-lg object-cover"
                            />
                            <h3 className="mb-1 text-lg font-bold text-gray-900">{car.title}</h3>
                            <div className="text-2xl font-bold text-red-600">
                              {formatNumber(car.price)} د.ل
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Basic Info */}
                    <ComparisonRow label="الماركة" cars={compareList} field="brand" />
                    <ComparisonRow label="الموديل" cars={compareList} field="model" />
                    <ComparisonRow label="السنة" cars={compareList} field="year" />
                    <ComparisonRow label="المسافة المقطوعة" cars={compareList} field="mileage" />
                    <ComparisonRow label="نوع الوقود" cars={compareList} field="fuelType" />
                    <ComparisonRow label="ناقل الحركة" cars={compareList} field="transmission" />
                    <ComparisonRow label="حجم المحرك" cars={compareList} field="engineSize" />
                    <ComparisonRow label="اللون" cars={compareList} field="color" />
                    <ComparisonRow label="الحالة" cars={compareList} field="condition" />
                    <ComparisonRow label="عدد الأبواب" cars={compareList} field="doors" />
                    <ComparisonRow label="الموقع" cars={compareList} field="location" />

                    {/* Features Comparison */}
                    <tr className="bg-gray-50">
                      <td className="p-4 font-semibold text-gray-900">المميزات</td>
                      {compareList.map((car) => (
                        <td key={car.id} className="p-4">
                          <div className="space-y-1">
                            {car.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Safety Features */}
                    <tr>
                      <td className="p-4 font-semibold text-gray-900">ميزات الأمان</td>
                      {compareList.map((car) => (
                        <td key={car.id} className="p-4">
                          <div className="space-y-1">
                            {car.safety.map((safety, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                                {safety}
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Action Buttons */}
                    <tr className="bg-gray-50">
                      <td className="p-4 font-semibold text-gray-900">الإجراءات</td>
                      {compareList.map((car) => (
                        <td key={car.id} className="p-4">
                          <div className="space-y-2">
                            <Link
                              href={`/marketplace/${car.id}`}
                              className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-blue-700"
                            >
                              عرض التفاصيل
                            </Link>
                            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium transition-colors hover:bg-gray-50">
                              <HeartIcon className="h-4 w-4" />
                              إضافة للمفضلة
                            </button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Add Car Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white">
              <div className="border-b p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">إضافة سيارة للمقارنة</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      placeholder="ابحث عن سيارة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="enhanced-scrollbar max-h-96 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCars
                    .filter((car) => !compareList.find((c) => c.id === car.id))
                    .map((car) => (
                      <div
                        key={car.id}
                        className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                      >
                        <img
                          src={car.image}
                          alt={car.title}
                          className="mb-3 h-32 w-full rounded-lg object-cover"
                        />
                        <h3 className="mb-1 font-semibold text-gray-900">{car.title}</h3>
                        <div className="mb-3 text-lg font-bold text-red-600">
                          {formatNumber(car.price)} د.ل
                        </div>
                        <button
                          onClick={() => addToCompare(car)}
                          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          إضافة للمقارنة
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// مكون صف المقارنة
interface ComparisonRowProps {
  label: string;
  cars: CompareCar[];
  field: keyof CompareCar;
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({ label, cars, field }) => {
  // التحقق من وجود قيم مفيدة في هذا الحقل
  const hasValidValues = cars.some((car) => {
    const value = car[field] as string;
    return value && value.trim() !== '' && value !== 'غير محدد' && value !== 'غير متوفر';
  });

  // إخفاء الصف إذا لم تكن هناك قيم مفيدة
  if (!hasValidValues) {
    return null;
  }

  return (
    <tr>
      <td className="p-4 font-semibold text-gray-900">{label}</td>
      {cars.map((car) => (
        <td key={car.id} className="p-4 text-center">
          <span className="font-medium">
            {(() => {
              const value = car[field] as string;
              return value && value.trim() !== '' && value !== 'غير محدد' && value !== 'غير متوفر'
                ? value
                : '-';
            })()}
          </span>
        </td>
      ))}
    </tr>
  );
};

export default ComparePage;
