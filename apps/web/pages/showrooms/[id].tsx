import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckBadgeIcon from '@heroicons/react/24/outline/CheckBadgeIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import FireIcon from '@heroicons/react/24/outline/FireIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TagIcon from '@heroicons/react/24/outline/TagIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LoginModal from '../../components/auth/LoginModal';
import { OpensooqNavbar } from '../../components/common';
import MarketplaceCarCard from '../../components/features/marketplace/cards/MarketplaceCarCard';
import ShowroomImages from '../../components/showrooms/ShowroomImages';
import useAuth from '../../hooks/useAuth';
import useAuthProtection from '../../hooks/useAuthProtection';
import { useAnalytics } from '../../lib/hooks/useAnalytics';

import RevealPhoneButton from '@/components/common/ui/buttons/RevealPhoneButton';
import { handlePhoneClickUnified } from '@/utils/phoneActions';

interface Showroom {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  totalCars: number;
  activeCars: number;
  images: string[];
  verified: boolean;
  featured: boolean;
  vehicleTypes: string[];
  vehicleCount: string;
  specialties: string[];
  establishedYear: number;
  openingHours: string;
  type: string;
  user: {
    id: string;
    name: string;
    phone: string;
    verified: boolean;
    profileImage?: string;
    accountType: string;
    rating?: number;
    totalReviews?: number;
  };
}

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  mileage: number;
  fuelType: string;
  transmission: string;
  condition: string;
  location: string;
  featured: boolean;
  urgent: boolean;
  createdAt: string;
}

const ShowroomDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser } = useAuth();
  const { trackShowroomView } = useAnalytics();

  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [carFilter, setCarFilter] = useState('all');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // استخدام نظام الحماية
  const { isAuthenticated, showAuthModal, setShowAuthModal, handleAuthClose } = useAuthProtection({
    showModal: true,
  });

  // فحص ما إذا كان المستخدم الحالي هو مالك المعرض
  const isCurrentUserOwner =
    currentUser &&
    showroom &&
    showroom.user &&
    String(currentUser.id).trim() === String(showroom.user.id).trim();

  // ترجمة أنواع المركبات من الإنجليزية إلى العربية
  const translateVehicleType = (type: string) => {
    const translations: { [key: string]: string } = {
      cars: 'سيارات',
      trucks: 'شاحنات',
      motorcycles: 'دراجات نارية',
      bicycles: 'دراجات هوائية',
      boats: 'قوارب',
      other: 'أخرى',
      // إضافة ترجمات أخرى حسب الحاجة
      سيارات: 'سيارات',
      شاحنات: 'شاحنات',
      'دراجات نارية': 'دراجات نارية',
      'دراجات هوائية': 'دراجات هوائية',
      قوارب: 'قوارب',
      أخرى: 'أخرى',
    };
    return translations[type] || type;
  };

  // ترجمة عدد السيارات التقريبي
  const translateVehicleCount = (count: string) => {
    const translations: { [key: string]: string } = {
      '1-10': '1-10 مركبات',
      '11-50': '11-50 مركبة',
      '51-100': '51-100 مركبة',
      '100+': 'أكثر من 100 مركبة',
    };
    return translations[count] || count;
  };

  // التحقق من معامل النجاح في URL
  useEffect(() => {
    if (router.query.success === 'vehicle-added') {
      setShowSuccessMessage(true);
      // إخفاء الرسالة بعد 5 ثوان
      setTimeout(() => {
        setShowSuccessMessage(false);
        // إزالة معامل النجاح من URL
        router.replace(`/showrooms/${id}`, undefined, { shallow: true });
      }, 5000);
    }
  }, [router.query.success, id, router]);

  // جلب بيانات المعرض
  useEffect(() => {
    if (!id) return;

    const fetchShowroomData = async () => {
      try {
        setLoading(true);

        // جلب بيانات المعرض
        const showroomResponse = await fetch(`/api/showrooms/${id}`);
        if (!showroomResponse.ok) {
          throw new Error('فشل في جلب بيانات المعرض');
        }
        const showroomResult = await showroomResponse.json();

        if (showroomResult.success) {
          console.log('Showroom data received:', showroomResult.data);
          setShowroom(showroomResult.data);

          // تتبع مشاهدة المعرض
          trackShowroomView(showroomResult.data.id, {
            name: showroomResult.data.name,
            location: showroomResult.data.location,
            type: showroomResult.data.type,
            verified: showroomResult.data.verified,
          });
        } else {
          throw new Error(showroomResult.error || 'خطأ في جلب بيانات المعرض');
        }

        // جلب مركبات المعرض
        const vehiclesResponse = await fetch(`/api/showroom/${id}/vehicles`);
        if (vehiclesResponse.ok) {
          const vehiclesResult = await vehiclesResponse.json();
          if (vehiclesResult.success) {
            const vehiclesData = vehiclesResult.vehicles || [];
            setCars(vehiclesData);
            setFilteredCars(vehiclesData);
          }
        }
      } catch (err: any) {
        console.error('خطأ في جلب بيانات المعرض:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShowroomData();
  }, [id]);

  // فلترة وترتيب السيارات
  useEffect(() => {
    let filtered = [...cars];

    // تطبيق الفلتر
    if (carFilter !== 'all') {
      if (carFilter === 'featured') {
        filtered = filtered.filter((car) => car.featured);
      } else if (carFilter === 'urgent') {
        filtered = filtered.filter((car) => car.urgent);
      }
    }

    // تطبيق الترتيب
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'price_low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'year_new') {
      filtered.sort((a, b) => b.year - a.year);
    } else if (sortBy === 'year_old') {
      filtered.sort((a, b) => a.year - b.year);
    }

    setFilteredCars(filtered);
  }, [cars, carFilter, sortBy]);

  // معالج النقر على أزرار التواصل
  const handleContactClick = (type: 'call' | 'chat') => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (type === 'call') {
      const phoneCandidate = (showroom?.phone || showroom?.user?.phone || '').toString().trim();
      if (phoneCandidate) {
        handlePhoneClickUnified({ phone: phoneCandidate });
      } else {
        router.push(
          `/messages?chat=${showroom?.user.id}&name=${encodeURIComponent(showroom?.user.name || '')}&phone=${encodeURIComponent(showroom?.phone || '')}&type=showroom`,
        );
      }
    } else {
      router.push(
        `/messages?chat=${showroom?.user.id}&name=${encodeURIComponent(showroom?.user.name || '')}&phone=${encodeURIComponent(showroom?.phone || '')}&type=showroom`,
      );
    }
  };

  // معالج المشاركة
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: showroom?.name,
          text: showroom?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('خطأ في المشاركة:', err);
      }
    } else {
      // نسخ الرابط للحافظة
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط');
    }
  };

  // معالج الإعجاب
  const handleFavorite = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setIsFavorite(!isFavorite);
    // هنا يمكن إضافة API call لحفظ الإعجاب
  };

  // تم إزالة spinner التحميل - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  if (error || !showroom) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <BuildingStorefrontIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">المعرض غير موجود</h3>
            <p className="mb-4 text-gray-500">{error || 'لم يتم العثور على المعرض المطلوب'}</p>
            <Link
              href="/showrooms"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              العودة للمعارض
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{showroom.name} | معارض السيارات</title>
        <meta name="description" content={showroom.description} />
      </Head>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed right-4 top-4 z-50 max-w-md">
          <div className="rounded-lg bg-green-500 p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">تم بنجاح!</h3>
                <p className="text-sm">تم إضافة المركبة للمعرض بنجاح</p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="ml-auto text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* شريط التنقل */}
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/showrooms" className="hover:text-blue-600">
                معارض السيارات
              </Link>
              <span>/</span>
              <span className="text-gray-900">{showroom.name}</span>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 py-8">
          {/* بطاقة المعرض الموحدة */}
          <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
            <div className="flex flex-col lg:flex-row">
              {/* قسم الصور */}
              <div className="lg:w-2/5 xl:w-1/3">
                {/* الصورة الرئيسية */}
                <div className="relative h-80 lg:h-96">
                  <ShowroomImages
                    showroomId={showroom.id}
                    showroomName={showroom.name}
                    className="h-full w-full"
                    showNavigation={true}
                    showIndicators={true}
                  />

                  {/* شارات */}
                  <div className="absolute right-4 top-4 flex flex-col gap-2">
                    {showroom.verified && (
                      <div className="rounded bg-green-500 px-2 py-1 text-xs text-white">معتمد</div>
                    )}
                    {showroom.featured && (
                      <div className="rounded bg-yellow-500 px-2 py-1 text-xs text-white">مميز</div>
                    )}
                  </div>
                </div>

                {/* معلومات سريعة أسفل الصور */}
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <div className="space-y-3">
                    {/* معلومات الاتصال السريعة */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">اتصال سريع</span>
                      </div>
                      <div className="max-w-[180px]">
                        <RevealPhoneButton
                          phone={showroom.phone}
                          size="md"
                          fullWidth
                          ariaLabel="إظهار رقم الهاتف"
                        />
                      </div>
                    </div>

                    {/* الموقع مع رابط الخريطة */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">الموقع</span>
                      </div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://maps.google.com/?q=${encodeURIComponent(showroom.location)}`,
                            '_blank',
                          )
                        }
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        عرض الخريطة
                      </button>
                    </div>

                    {/* تقييم سريع */}
                    {showroom.rating > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StarIcon className="h-4 w-4 fill-current text-yellow-500" />
                          <span className="text-sm text-gray-600">التقييم</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-gray-900">
                            {showroom.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">({showroom.reviewsCount})</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* معلومات المعرض */}
              <div className="flex flex-1 flex-col p-6 pb-8 lg:p-8 lg:pb-10">
                {/* الرأس */}
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                        {showroom.name}
                      </h1>
                      {showroom.verified && (
                        <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1">
                          <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">معتمد</span>
                        </div>
                      )}
                    </div>
                    <div className="mb-3 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{showroom.location}</span>
                      </div>
                      {showroom.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.round(showroom.rating)
                                    ? 'fill-current text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-gray-900">
                            {showroom.rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({showroom.reviewsCount} تقييم)
                          </span>
                        </div>
                      )}
                    </div>
                    {showroom.description && (
                      <p className="line-clamp-2 text-gray-600">{showroom.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleShare}
                      className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                    >
                      <ShareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleFavorite}
                      className={`rounded-lg border p-2 transition-colors ${
                        isFavorite
                          ? 'border-red-300 bg-red-50 text-red-600'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <HeartIcon className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* الإحصائيات */}
                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">إحصائيات المعرض</h3>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center">
                      <div className="mb-2 flex justify-center">
                        <TruckIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-900">{showroom.totalCars}</div>
                      <div className="text-sm text-blue-700">إجمالي السيارات</div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4 text-center">
                      <div className="mb-2 flex justify-center">
                        <FireIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-900">{showroom.activeCars}</div>
                      <div className="text-sm text-green-700">السيارات المتاحة</div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 text-center">
                      <div className="mb-2 flex justify-center">
                        <StarSolid className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-yellow-900">
                        {showroom.rating > 0 ? showroom.rating.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-sm text-yellow-700">التقييم</div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-center">
                      <div className="mb-2 flex justify-center">
                        <CalendarDaysIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        {showroom.establishedYear
                          ? new Date().getFullYear() - showroom.establishedYear
                          : '0'}
                      </div>
                      <div className="text-sm text-purple-700">سنوات الخبرة</div>
                    </div>
                  </div>
                </div>

                {/* أنواع المركبات وعدد السيارات التقريبي */}
                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">معلومات المعرض</h3>
                  <div className="space-y-4">
                    {/* أنواع المركبات */}
                    {showroom.vehicleTypes && showroom.vehicleTypes.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-700">
                          أنواع المركبات المتخصص بها
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {showroom.vehicleTypes.map((type, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                            >
                              {translateVehicleType(type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* عدد السيارات التقريبي */}
                    {showroom.vehicleCount && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-700">
                          العدد التقريبي للمركبات
                        </h4>
                        <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
                          <TruckIcon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-800">
                            {translateVehicleCount(showroom.vehicleCount)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* التخصصات (إذا كانت موجودة) */}
                    {showroom.specialties && showroom.specialties.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-700">
                          التخصصات الإضافية
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {showroom.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* أزرار التواصل أو إدارة المعرض */}
                <div className="mb-8 flex gap-3">
                  {isCurrentUserOwner ? (
                    // أزرار إدارة المعرض للمالك
                    <>
                      <Link
                        href={`/showroom/add-vehicle/${showroom.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                      >
                        <PlusIcon className="h-5 w-5" />
                        إضافة مركبات للمعرض
                      </Link>
                      <Link
                        href="/showroom/dashboard"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-6 py-3 font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <BuildingStorefrontIcon className="h-5 w-5" />
                        إدارة المعرض
                      </Link>
                    </>
                  ) : (
                    // أزرار التواصل للزوار
                    <>
                      <div className="flex-1">
                        <RevealPhoneButton
                          phone={showroom.phone || showroom.user?.phone}
                          size="lg"
                          fullWidth
                          ariaLabel="إظهار رقم الهاتف"
                        />
                      </div>
                      <button
                        onClick={() => handleContactClick('chat')}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-6 py-3 font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                        مراسلة
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* سيارات المعرض */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">سيارات المعرض</h2>
                <span className="text-sm text-gray-500">
                  {filteredCars.length} من {cars.length} سيارة
                </span>
              </div>

              {/* فلاتر وترتيب */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">الفلتر:</label>
                  <select
                    value={carFilter}
                    onChange={(e) => setCarFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">جميع السيارات</option>
                    <option value="featured">السيارات المميزة</option>
                    <option value="urgent">السيارات العاجلة</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">الترتيب:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="newest">الأحدث أولاً</option>
                    <option value="oldest">الأقدم أولاً</option>
                    <option value="price_low">السعر: من الأقل للأعلى</option>
                    <option value="price_high">السعر: من الأعلى للأقل</option>
                    <option value="year_new">السنة: الأحدث أولاً</option>
                    <option value="year_old">السنة: الأقدم أولاً</option>
                  </select>
                </div>

                {/* أزرار تبديل وضع العرض */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">العرض:</label>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`rounded-md p-2 transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="عرض قائمة"
                    >
                      <ListBulletIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`rounded-md p-2 transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="عرض شبكي"
                    >
                      <Squares2X2Icon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {filteredCars.length > 0 ? (
              <div
                className={
                  viewMode === 'list'
                    ? 'space-y-4'
                    : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }
              >
                {filteredCars.map((car) => (
                  <MarketplaceCarCard
                    key={car.id}
                    car={car}
                    viewMode={viewMode}
                    context="showroom"
                    showroomId={showroom?.id}
                  />
                ))}
              </div>
            ) : cars.length > 0 ? (
              <div className="py-12 text-center">
                <TagIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد نتائج</h3>
                <p className="text-gray-500">لا توجد سيارات تطابق الفلتر المحدد</p>
                <button
                  onClick={() => {
                    setCarFilter('all');
                    setSortBy('newest');
                  }}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            ) : (
              <div className="py-12 text-center">
                <BuildingStorefrontIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد سيارات</h3>
                <p className="text-gray-500">لا توجد سيارات متاحة في هذا المعرض حالياً</p>
              </div>
            )}
          </div>
        </main>

        {/* نافذة تسجيل الدخول */}
        <LoginModal isOpen={showAuthModal} onClose={handleAuthClose} />
      </div>
    </>
  );
};

export default ShowroomDetailPage;
