import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { type Country } from '../components/CountryCodeSelector';
import PhoneInputField from '../components/PhoneInputField';
import PublicIdBadge from '../components/PublicIdBadge';
import UserAvatar from '../components/UserAvatar';
import { OpensooqNavbar } from '../components/common';
import { useAuth } from '../hooks/useAuth';

// صفحة الملف الشخصي
// واجهة الحجز
interface TransportBooking {
  id: string;
  serviceId: string;
  status: string;
  fromCity: string;
  toCity: string;
  preferredDate: string;
  preferredTime?: string;
  estimatedPrice?: number;
  finalPrice?: number;
  carMake?: string;
  carModel?: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  service?: {
    id: string;
    title: string;
    truckType: string;
    images?: string;
  };
  provider?: {
    id: string;
    name: string;
    phone: string;
    profileImage?: string;
    verified?: boolean;
  };
}

// إعدادات حالات الحجز
const BOOKING_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: { label: 'في انتظار القبول', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
  ACCEPTED: { label: 'تم القبول', color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
  IN_PROGRESS: { label: 'جاري التنفيذ', color: 'bg-purple-100 text-purple-800', icon: TruckIcon },
  COMPLETED: { label: 'مكتمل', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  CANCELLED: { label: 'ملغي', color: 'bg-gray-100 text-gray-800', icon: XCircleIcon },
  REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-800', icon: XCircleIcon },
};

const ProfilePage = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('my-ads');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFloatingSaveButton, setShowFloatingSaveButton] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editDialCode, setEditDialCode] = useState('+218');

  // حالة طلبات النقل
  const [transportBookings, setTransportBookings] = useState<TransportBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // بيانات المستخدم من الحساب المسجل دخول
  const userData = user
    ? {
        name: user.name || 'مستخدم',
        phone: user.phone || 'غير محدد',
        city: 'غير محدد', // يمكن إضافة هذا لاحقاً من قاعدة البيانات
        memberSince: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
            })
          : 'غير محدد',
        rating: 4.8, // يمكن إضافة هذا لاحقاً من قاعدة البيانات
        reviewsCount: 23, // يمكن إضافة هذا لاحقاً من قاعدة البيانات
        isVerified: user.verified || false,
        avatar: user.profileImage || null,
        accountType: user.accountType || 'REGULAR_USER',
        stats: {
          totalAds: 0,
          activeAds: 0,
          soldCars: 0,
          totalViews: 0,
          wonAuctions: 0,
          activeBids: 0,
        },
      }
    : {
        name: 'غير محدد',
        phone: 'غير محدد',
        city: 'غير محدد',
        memberSince: 'غير محدد',
        rating: 0,
        reviewsCount: 0,
        isVerified: false,
        avatar: null,
        accountType: 'REGULAR_USER',
        stats: {
          totalAds: 0,
          activeAds: 0,
          soldCars: 0,
          totalViews: 0,
          wonAuctions: 0,
          activeBids: 0,
        },
      };

  // إعلانات المستخدم - مطابقة للبيانات الوهمية
  const userAds = [
    {
      id: 1,
      title: 'تويوتا كامري 2019 - حالة ممتازة',
      price: '285,000',
      status: 'active',
      views: 1247,
      favorites: 34,
      postedDate: '2024-01-15',
      image:
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      type: 'marketplace',
      location: 'طرابلس',
    },
    {
      id: 2,
      title: 'هوندا أكورد 2020 - فل أوبشن',
      price: '320,000',
      status: 'sold',
      views: 892,
      soldDate: '2024-01-10',
      image:
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      type: 'marketplace',
      location: 'بنغازي',
    },
    {
      id: 3,
      title: 'نيسان التيما 2018 - نظيفة جداً',
      price: '245,000',
      status: 'active',
      views: 634,
      favorites: 18,
      postedDate: '2024-01-20',
      image:
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      type: 'marketplace',
      location: 'مصراتة',
    },
    {
      id: 4,
      title: 'BMW X3 2021 - وكالة',
      price: '520,000',
      status: 'active',
      views: 890,
      favorites: 45,
      postedDate: '2024-01-12',
      image:
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      type: 'marketplace',
      location: 'طرابلس',
    },
    {
      id: 5,
      title: 'مرسيدس C200 2020 - AMG',
      currentBid: '450,000',
      status: 'auction',
      views: 2100,
      bidCount: 28,
      endDate: '2024-01-25',
      image:
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      type: 'auction',
      location: 'بنغازي',
    },
    {
      id: 6,
      title: 'كيا سيراتو 2019 - اقتصادية',
      currentBid: '185,000',
      status: 'auction',
      views: 1150,
      bidCount: 15,
      endDate: '2024-01-22',
      image:
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      type: 'auction',
      location: 'مصراتة',
    },
    {
      id: 7,
      title: 'فولكس واجن جولف 2018',
      price: '195,000',
      status: 'active',
      views: 380,
      favorites: 12,
      postedDate: '2024-01-03',
      image:
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      type: 'marketplace',
      location: 'طرابلس',
    },
    {
      id: 8,
      title: 'هيونداي إلنترا 2017',
      price: '165,000',
      status: 'sold',
      views: 290,
      soldDate: '2023-12-28',
      image:
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      type: 'marketplace',
      location: 'بنغازي',
    },
  ];

  // المزايدات النشطة - مطابقة للبيانات الوهمية
  const activeBids = [
    {
      id: 1,
      carTitle: 'مرسيدس C200 2020 - AMG',
      myBid: '445,000',
      currentBid: '450,000',
      status: 'outbid',
      endTime: '2024-01-25T18:00:00',
      image:
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      seller: 'عبدالله حسن',
    },
    {
      id: 2,
      carTitle: 'كيا سيراتو 2019 - اقتصادية',
      myBid: '180,000',
      currentBid: '185,000',
      status: 'outbid',
      endTime: '2024-01-22T16:30:00',
      image:
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      seller: 'ليلى عثمان',
    },
    {
      id: 3,
      carTitle: 'أودي A4 2021 - فل أوبشن',
      myBid: '420,000',
      currentBid: '420,000',
      status: 'winning',
      endTime: '2024-01-26T14:00:00',
      image:
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      seller: 'محمد أحمد',
    },
    {
      id: 4,
      carTitle: 'فولكس واجن جولف GTI 2020',
      myBid: '285,000',
      currentBid: '290,000',
      status: 'outbid',
      endTime: '2024-01-23T20:15:00',
      image:
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      seller: 'سارة محمود',
    },
    {
      id: 5,
      carTitle: 'تويوتا كورولا 2022 - هايبرد',
      myBid: '195,000',
      currentBid: '195,000',
      status: 'winning',
      endTime: '2024-01-24T11:45:00',
      image:
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      seller: 'أحمد علي',
    },
  ];

  // المفضلة - مختصرة من صفحة المفضلة
  const favorites = [
    {
      id: 1,
      title: 'BMW X3 2021 - وكالة',
      price: '520,000',
      location: 'طرابلس',
      image:
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      type: 'marketplace',
    },
    {
      id: 2,
      title: 'مرسيدس C200 2020 - AMG',
      currentBid: '450,000',
      endTime: '2024-01-25T18:00:00',
      image:
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      type: 'auction',
    },
    {
      id: 3,
      title: 'هوندا أكورد 2020 - فل أوبشن',
      price: '320,000',
      location: 'بنغازي',
      image:
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      type: 'marketplace',
    },
    {
      id: 4,
      title: 'كيا سيراتو 2019 - اقتصادية',
      currentBid: '185,000',
      endTime: '2024-01-22T16:30:00',
      image:
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      type: 'auction',
    },
  ];

  // جلب طلبات النقل عند اختيار التبويب
  useEffect(() => {
    if (activeTab === 'transport' && user) {
      fetchTransportBookings();
    }
  }, [activeTab, user]);

  const fetchTransportBookings = async () => {
    setBookingsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/transport/bookings?role=customer', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        const bookingsData = data.data?.bookings || data.bookings || [];
        setTransportBookings(bookingsData);
      }
    } catch (error) {
      console.error('خطأ في جلب طلبات النقل:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const formatBookingDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // مراقبة التمرير لإظهار/إخفاء زر الحفظ الثابت
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowFloatingSaveButton(scrollY > 200 && showEditModal);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showEditModal]);

  // تهيئة رقم الهاتف القابل للتحرير من بيانات المستخدم
  useEffect(() => {
    const raw = (user?.phone || '').replace(/[^\d]/g, '');
    if (raw.startsWith('218')) {
      setEditPhone(raw.slice(3));
      setEditDialCode('+218');
    } else if (raw.startsWith('0')) {
      setEditPhone(raw.replace(/^0+/, ''));
    } else {
      setEditPhone(raw);
    }
  }, [user?.phone]);

  const handleSave = async () => {
    setIsSaving(true);
    // محاكاة عملية الحفظ
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSaving(false);
    setShowEditModal(false);
  };

  const formatNumber = (num: string | number) => {
    return parseInt(num.toString().replace(/,/g, '')).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'auction':
        return 'bg-blue-100 text-blue-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
      case 'winning':
        return 'bg-green-100 text-green-800';
      case 'outbid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'auction':
        return 'مزاد';
      case 'sold':
        return 'مباع';
      case 'winning':
        return 'رابح';
      case 'outbid':
        return 'تم تجاوزك';
      default:
        return status;
    }
  };

  return (
    <>
      <Head>
        <title>الملف الشخصي - {userData.name}</title>
        <meta
          name="description"
          content="إدارة ملفك الشخصي وإعلاناتك ومزايداتك على موقع مزاد السيارات"
        />
      </Head>

      <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Profile Header */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <div className="relative">
                <UserAvatar
                  src={userData.avatar}
                  alt={userData.name}
                  size="xl"
                  showVerificationBadge={true}
                  isVerified={userData.isVerified}
                />
                <button className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700">
                  <PhotoIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                  {/* عرض المعرف العام */}
                  <PublicIdBadge
                    publicId={(user as any)?.publicId}
                    variant="default"
                    showCopyButton={true}
                  />
                </div>
                <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
                  <StarIcon className="h-4 w-4 fill-current text-amber-400" />
                  <span>{userData.rating}</span>
                  <span>({userData.reviewsCount} تقييم)</span>
                  <span className="mx-2">•</span>
                  <span>عضو منذ {userData.memberSince}</span>
                </div>
                <div className="mb-4 text-sm text-gray-600">
                  {userData.city} • <span dir="ltr">{userData.phone}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-gray-50 p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">{userData.stats.totalAds}</div>
                    <div className="text-sm text-gray-500">إجمالي الإعلانات</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">{userData.stats.soldCars}</div>
                    <div className="text-sm text-gray-500">سيارات مباعة</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {formatNumber(userData.stats.totalViews)}
                    </div>
                    <div className="text-sm text-gray-500">إجمالي المشاهدات</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {userData.stats.wonAuctions}
                    </div>
                    <div className="text-sm text-gray-500">مزادات فائزة</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  <PencilIcon className="h-4 w-4" />
                  تعديل الملف
                </button>
                {/* تم حذف رابط إضافة إعلان */}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('my-ads')}
                  className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'my-ads'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  إعلاناتي ({userData.stats.activeAds})
                </button>
                <button
                  onClick={() => setActiveTab('bids')}
                  className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'bids'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  مزايداتي ({userData.stats.activeBids})
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'favorites'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  المفضلة
                </button>
                <button
                  onClick={() => setActiveTab('transport')}
                  className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'transport'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TruckIcon className="h-4 w-4" />
                  طلبات النقل
                  {transportBookings.length > 0 && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      {transportBookings.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  الإعدادات
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* My Ads Tab */}
              {activeTab === 'my-ads' && (
                <div className="space-y-4">
                  {userAds.map((ad) => (
                    <div
                      key={ad.id}
                      className="flex gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                    >
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="h-18 w-24 flex-shrink-0 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(ad.status)}`}
                          >
                            {getStatusText(ad.status)}
                          </span>
                        </div>
                        <div className="mb-2 text-lg font-bold text-green-600">
                          {ad.type === 'auction'
                            ? `${formatNumber(ad.currentBid)} د.ل (مزايدة حالية)`
                            : `${formatNumber(ad.price)} د.ل`}
                        </div>
                        <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <EyeIcon className="h-4 w-4" />
                            {ad.views} مشاهدة
                          </div>
                          {ad.type === 'marketplace' && ad.favorites && (
                            <div className="flex items-center gap-1">
                              <HeartIcon className="h-4 w-4" />
                              {ad.favorites} مفضلة
                            </div>
                          )}
                          {ad.type === 'auction' && ad.bidCount && (
                            <div className="flex items-center gap-1">
                              <TrophyIcon className="h-4 w-4" />
                              {ad.bidCount} مزايدة
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/${ad.type}/${ad.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            عرض الإعلان
                          </Link>
                          <button className="text-sm font-medium text-gray-600 hover:text-gray-800">
                            تعديل
                          </button>
                          <button className="text-sm font-medium text-red-600 hover:text-red-800">
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bids Tab */}
              {activeTab === 'bids' && (
                <div className="space-y-4">
                  {activeBids.map((bid) => (
                    <div key={bid.id} className="flex gap-4 rounded-lg border border-gray-200 p-4">
                      <img
                        src={bid.image}
                        alt={bid.carTitle}
                        className="h-18 w-24 flex-shrink-0 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900">{bid.carTitle}</h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(bid.status)}`}
                          >
                            {getStatusText(bid.status)}
                          </span>
                        </div>
                        <div className="mb-3 grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">مزايدتي</div>
                            <div className="font-bold text-blue-600">
                              {formatNumber(bid.myBid)} د.ل
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">المزايدة الحالية</div>
                            <div className="font-bold text-green-600">
                              {formatNumber(bid.currentBid)} د.ل
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/auction/${bid.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            عرض المزاد
                          </Link>
                          {bid.status === 'outbid' && (
                            <button className="text-sm font-medium text-green-600 hover:text-green-800">
                              زايد مرة أخرى
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-lg bg-gray-50 transition-shadow hover:shadow-md"
                    >
                      <img src={item.image} alt={item.title} className="h-48 w-full object-cover" />
                      <div className="p-4">
                        <h3 className="mb-2 font-semibold text-gray-900">{item.title}</h3>
                        <div className="mb-2 text-lg font-bold text-green-600">
                          {item.type === 'auction'
                            ? `${formatNumber(item.currentBid)} د.ل`
                            : `${formatNumber(item.price)} د.ل`}
                        </div>
                        {item.location && (
                          <div className="mb-3 text-sm text-gray-500">{item.location}</div>
                        )}
                        <Link
                          href={`/${item.type}/${item.id}`}
                          className="block rounded-lg bg-blue-600 py-2 text-center text-white transition-colors hover:bg-blue-700"
                        >
                          عرض التفاصيل
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Transport Bookings Tab */}
              {activeTab === 'transport' && (
                <div>
                  {bookingsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    </div>
                  ) : transportBookings.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 p-12 text-center">
                      <TruckIcon className="mx-auto h-16 w-16 text-gray-300" />
                      <h3 className="mt-4 text-xl font-semibold text-gray-900">
                        لا توجد طلبات نقل
                      </h3>
                      <p className="mt-2 text-gray-500">لم تقم بأي طلبات نقل بعد</p>
                      <Link
                        href="/transport/browse"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                      >
                        <TruckIcon className="h-5 w-5" />
                        تصفح خدمات النقل
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* رابط لصفحة الحجوزات الكاملة */}
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">آخر طلبات النقل</h3>
                        <Link
                          href="/transport/my-bookings"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          عرض الكل ←
                        </Link>
                      </div>

                      {transportBookings.slice(0, 5).map((booking) => {
                        const statusConfig =
                          BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.PENDING;
                        const StatusIcon = statusConfig.icon;

                        return (
                          <div
                            key={booking.id}
                            className="flex gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                          >
                            {/* صورة الخدمة */}
                            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                              <TruckIcon className="h-10 w-10 text-blue-500" />
                            </div>

                            <div className="flex-1">
                              <div className="mb-2 flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {booking.service?.title || 'خدمة نقل'}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    مقدم الخدمة: {booking.provider?.name || 'غير محدد'}
                                  </p>
                                </div>
                                <span
                                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.color}`}
                                >
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {statusConfig.label}
                                </span>
                              </div>

                              <div className="mb-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                                  <span>
                                    {booking.fromCity} → {booking.toCity}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                                  <span>{formatBookingDate(booking.preferredDate)}</span>
                                </div>
                                {booking.carMake && (
                                  <div className="flex items-center gap-1.5">
                                    <TruckIcon className="h-4 w-4 text-gray-400" />
                                    <span>
                                      {booking.carMake} {booking.carModel}
                                    </span>
                                  </div>
                                )}
                                {booking.estimatedPrice && (
                                  <div className="font-medium text-green-600">
                                    {booking.estimatedPrice} د.ل
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Link
                                  href="/transport/my-bookings"
                                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                  عرض التفاصيل
                                </Link>
                                {booking.provider?.phone && (
                                  <button
                                    onClick={() =>
                                      (window.location.href = `tel:${booking.provider?.phone}`)
                                    }
                                    className="text-sm font-medium text-green-600 hover:text-green-800"
                                  >
                                    اتصال
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* زر عرض الكل */}
                      {transportBookings.length > 5 && (
                        <div className="pt-4 text-center">
                          <Link
                            href="/transport/my-bookings"
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-6 py-2 font-medium text-blue-600 transition-colors hover:bg-blue-50"
                          >
                            عرض جميع الطلبات ({transportBookings.length})
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="max-w-2xl">
                  <h3 className="mb-6 text-lg font-semibold">إعدادات الحساب</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        value={userData.name}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        رقم الهاتف
                      </label>
                      <PhoneInputField
                        value={editPhone}
                        onChange={(v: string) => setEditPhone(v)}
                        onCountryChange={(c: Country) => setEditDialCode(c.code)}
                        placeholder="أدخل رقم الهاتف"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        المدينة
                      </label>
                      <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                        <option value="طرابلس">طرابلس</option>
                        <option value="بنغازي">بنغازي</option>
                        <option value="مصراتة">مصراتة</option>
                        <option value="سبها">سبها</option>
                      </select>
                    </div>
                    <button className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">
                      حفظ التغييرات
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">تعديل الملف الشخصي</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">الاسم</label>
                  <input
                    type="text"
                    defaultValue={userData.name}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">رقم الهاتف</label>
                  <PhoneInputField
                    value={editPhone}
                    onChange={(v: string) => setEditPhone(v)}
                    onCountryChange={(c: Country) => setEditDialCode(c.code)}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  حفظ
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-lg bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* زر الحفظ الثابت في أسفل الشاشة */}
        {showFloatingSaveButton && (
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/50 bg-white/95 shadow-2xl backdrop-blur-lg">
            <div className="mx-auto max-w-4xl px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    لديك تغييرات غير محفوظة في الملف الشخصي
                  </span>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div
                        className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                        style={{ width: 24, height: 24 }}
                        role="status"
                        aria-label="جاري التحميل"
                      />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-6 w-6" />
                      <span>حفظ التغييرات</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
