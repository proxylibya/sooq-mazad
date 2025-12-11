import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Eye, 
  Heart, 
  Calendar,
  Share2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageCircle,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface CarCardProps {
  car?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    color: string;
    condition: string;
    price: number;
    currency: string;
    seller: string;
    sellerType: string;
    phone: string;
    city: string;
    address: string;
    description: string;
    views: number;
    favorites: number;
    createdAt: string;
    images?: string[];
    rating?: number;
    features?: string[];
    verified?: boolean;
  };
}

const AdvancedCarCard: React.FC<CarCardProps> = ({ car }) => {
  // بيانات تجريبية
  const defaultCar = {
    id: 'cmgadpyu50007vg3csiz3uozs',
    brand: 'نيسان',
    model: 'باثفايندر',
    year: 2022,
    mileage: 68000,
    color: 'فضي',
    condition: 'مستعملة',
    price: 55000,
    currency: 'د.ل',
    seller: 'محمد أحمد',
    sellerType: 'فرد',
    phone: '950000000',
    city: 'صبراتة',
    address: 'صبراتة، شارع الجمهورية',
    description: 'سيارة بحالة ممتازة ونظيفة جداً، تم الاعتناء بها بشكل منتظم. جميع الأوراق سليمة والسيارة جاهزة للاستخدام الفوري.',
    views: 342,
    favorites: 47,
    createdAt: '10/3/2025',
    images: [
      'https://via.placeholder.com/800x600/4f46e5/ffffff?text=نيسان+باثفايندر+1',
      'https://via.placeholder.com/800x600/2563eb/ffffff?text=نيسان+باثفايندر+2',
      'https://via.placeholder.com/800x600/059669/ffffff?text=نيسان+باثفايندر+3',
      'https://via.placeholder.com/800x600/dc2626/ffffff?text=نيسان+باثفايندر+4',
    ],
    rating: 4.5,
    features: [
      'فتحة سقف بانورامية',
      'نظام ملاحة GPS',
      'كاميرا خلفية',
      'مقاعد جلدية',
      'نظام صوتي متطور',
      'تحكم كامل بالمناخ',
    ],
    verified: true,
  };

  const carData = car || defaultCar;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const nextImage = () => {
    if (carData.images && carData.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % carData.images.length);
    }
  };

  const prevImage = () => {
    if (carData.images && carData.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + carData.images.length) % carData.images.length);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* معرض الصور */}
      {carData.images && carData.images.length > 0 && (
        <div className="relative mb-6 overflow-hidden rounded-2xl shadow-2xl">
          <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
            <img
              src={carData.images[currentImageIndex]}
              alt={`${carData.brand} ${carData.model}`}
              className="h-full w-full object-cover"
            />
            
            {/* أزرار التنقل */}
            {carData.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                >
                  <ChevronRight className="h-6 w-6 text-gray-900" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-900" />
                </button>
              </>
            )}

            {/* مؤشرات الصور */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {carData.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>

            {/* شارات */}
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {carData.verified && (
                <span className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-sm font-bold text-white shadow-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  موثّق
                </span>
              )}
              <span className="rounded-full bg-blue-500 px-3 py-1 text-sm font-bold text-white shadow-lg">
                {carData.condition}
              </span>
            </div>

            {/* أزرار التفاعل */}
            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`rounded-full p-3 shadow-lg backdrop-blur-sm transition-all hover:scale-110 ${
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-900 hover:bg-white'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white">
                <Share2 className="h-5 w-5 text-gray-900" />
              </button>
              <button className="rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white">
                <Bookmark className="h-5 w-5 text-gray-900" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* البطاقة الرئيسية */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl transition-shadow duration-300 hover:shadow-3xl">
        {/* العنوان */}
        <div className="rounded-t-2xl border-b border-gray-200 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black text-white drop-shadow-md">
                {carData.brand} {carData.model} {carData.year}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-blue-50">
                <span className="rounded-full bg-white/20 px-3 py-1 font-medium backdrop-blur-sm">
                  رقم الإعلان: {carData.id}
                </span>
              </p>
            </div>
            {carData.rating && (
              <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold text-white">{carData.rating}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* السعر البارز */}
          <div className="mb-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-center shadow-lg">
            <span className="block text-sm font-medium text-green-100">السعر المطلوب</span>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-5xl font-black text-white drop-shadow-md">
                {carData.price.toLocaleString()}
              </span>
              <span className="text-2xl font-bold text-green-100">{carData.currency}</span>
            </div>
            <p className="mt-2 text-sm text-green-100">السعر قابل للتفاوض</p>
          </div>

          {/* شبكة المعلومات */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* معلومات السيارة */}
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                تفاصيل السيارة
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'الماركة', value: carData.brand },
                  { label: 'الموديل', value: carData.model },
                  { label: 'السنة', value: carData.year },
                  { label: 'المسافة المقطوعة', value: `${carData.mileage.toLocaleString()} كم` },
                  { label: 'اللون', value: carData.color },
                  { label: 'الحالة', value: carData.condition },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="text-sm font-semibold text-gray-700">{item.label}:</span>
                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* معلومات البائع */}
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div>
                معلومات البائع
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <span className="text-sm font-semibold text-gray-700">اسم البائع:</span>
                  <span className="text-sm font-bold text-gray-900">{carData.seller}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <span className="text-sm font-semibold text-gray-700">نوع البائع:</span>
                  <span className="text-sm font-bold text-gray-900">{carData.sellerType}</span>
                </div>
                
                {/* عرض رقم الهاتف */}
                <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
                  {!showPhone ? (
                    <button
                      onClick={() => setShowPhone(true)}
                      className="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 py-3 font-bold text-white transition-all hover:from-green-700 hover:to-emerald-700"
                    >
                      <Phone className="mx-auto mb-1 h-5 w-5" />
                      إظهار رقم الهاتف
                    </button>
                  ) : (
                    <a
                      href={`tel:${carData.phone}`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 py-3 font-bold text-white transition-all hover:from-green-700 hover:to-emerald-700"
                    >
                      <Phone className="h-5 w-5" />
                      <span dir="ltr">{carData.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* المميزات */}
          {carData.features && carData.features.length > 0 && (
            <div className="mt-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                المميزات والإضافات
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {carData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* الموقع */}
          <div className="mt-6 rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-5 shadow-md">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-green-900">
              <MapPin className="h-5 w-5 text-green-700" />
              الموقع
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-lg bg-white/60 p-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/80">
                <span className="block text-xs font-medium text-green-700">المدينة:</span>
                <p className="mt-1 text-base font-bold text-green-900">{carData.city}</p>
              </div>
              <div className="rounded-lg bg-white/60 p-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/80">
                <span className="block text-xs font-medium text-green-700">العنوان التفصيلي:</span>
                <p className="mt-1 text-base font-bold text-green-900">{carData.address}</p>
              </div>
            </div>
          </div>

          {/* الوصف */}
          <div className="mt-6 rounded-xl bg-gray-50 p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
              <MessageCircle className="h-5 w-5 text-gray-600" />
              وصف السيارة
            </h3>
            <p className="text-sm leading-relaxed text-gray-700">{carData.description}</p>
          </div>

          {/* الإحصائيات */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="group rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <Eye className="mx-auto h-6 w-6 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
              <p className="mt-2 text-2xl font-black text-blue-900">{carData.views}</p>
              <p className="mt-1 text-xs font-medium text-blue-700">مشاهدة</p>
            </div>

            <div className="group rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-100 p-4 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <Heart className="mx-auto h-6 w-6 text-red-600 transition-transform duration-300 group-hover:scale-110" />
              <p className="mt-2 text-2xl font-black text-red-900">{carData.favorites}</p>
              <p className="mt-1 text-xs font-medium text-red-700">مفضل</p>
            </div>

            <div className="group rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <Calendar className="mx-auto h-6 w-6 text-gray-600 transition-transform duration-300 group-hover:scale-110" />
              <p className="mt-2 text-sm font-black text-gray-900">{carData.createdAt}</p>
              <p className="mt-1 text-xs font-medium text-gray-700">تاريخ النشر</p>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.98]">
              <Phone className="h-5 w-5" />
              اتصل بالبائع
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-4 text-base font-bold text-gray-900 shadow-md transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg active:scale-[0.98]">
              <MessageCircle className="h-5 w-5" />
              أرسل رسالة
            </button>
          </div>

          {/* رابط التفاصيل الكاملة */}
          <div className="mt-4 text-center">
            <a
              href={`/car/${carData.id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              عرض التفاصيل الكاملة
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCarCard;
