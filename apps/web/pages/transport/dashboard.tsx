import {
  ArrowPathIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  StarIcon,
  TruckIcon,
  UserIcon,
  WalletIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { OpensooqNavbar } from '../../components/common';
import SimpleTransportCard from '../../components/transport/SimpleTransportCard';
import useAuth from '../../hooks/useAuth';
import { isTransportOwner } from '../../utils/accountTypeUtils';

interface TransportService {
  id: string;
  title: string;
  description: string;
  truckType: string;
  capacity: number;
  serviceArea: string | string[]; // يمكن أن يكون string أو array
  pricePerKm: number | null;
  availableDays: string | string[]; // يمكن أن يكون string أو array
  contactPhone: string;
  images: string[];
  features: string[];
  commission: number;
  status?: string; // ACTIVE, PAUSED, INACTIVE
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    verified: boolean;
    profileImage?: string;
    accountType: string;
  };
}

interface DashboardStats {
  totalServices: number;
  totalViews: number;
  averageRating: number;
  pendingBookings: number;
  acceptedBookings: number;
  completedBookings: number;
  totalBookings: number;
}

// واجهة الطلبات
interface TransportBooking {
  id: string;
  serviceId: string;
  customerId: string;
  providerId: string;
  customerName: string;
  customerPhone: string;
  fromCity: string;
  toCity: string;
  preferredDate: string;
  preferredTime?: string;
  carMake?: string;
  carModel?: string;
  status: string;
  estimatedPrice?: number;
  finalPrice?: number;
  createdAt: string;
  service?: {
    id: string;
    title: string;
    truckType: string;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
    profileImage?: string;
  };
}

// حالات الطلبات
const BOOKING_STATUS = {
  PENDING: { label: 'في انتظار القبول', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
  ACCEPTED: { label: 'تم القبول', color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
  IN_PROGRESS: { label: 'جاري التنفيذ', color: 'bg-cyan-100 text-cyan-800', icon: TruckIcon },
  COMPLETED: { label: 'مكتمل', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  CANCELLED: { label: 'ملغي', color: 'bg-gray-100 text-gray-800', icon: XCircleIcon },
  REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-800', icon: XCircleIcon },
};

export default function TransportDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<TransportService[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // تم إزالة activeTab لأنه غير مستخدم حالياً
  const [refreshing, setRefreshing] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({
    show: false,
    type: 'info',
    message: '',
  });
  const [globalAvailability, setGlobalAvailability] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookings, setBookings] = useState<TransportBooking[]>([]);
  const [activeTab, setActiveTab] = useState<'services' | 'bookings'>('services');
  const [bookingFilter, setBookingFilter] = useState('all');

  // التحقق من صلاحية الوصول
  useEffect(() => {
    if (!loading && (!user || !isTransportOwner(user.accountType))) {
      router.push('/login');
      return;
    }
  }, [user, loading, router]);

  // جلب البيانات
  useEffect(() => {
    if (user && isTransportOwner(user.accountType)) {
      fetchServices();
      fetchBookings();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // التحديث التلقائي عند العودة من التعديل
  useEffect(() => {
    const refreshParam = router.query.refresh;
    if (refreshParam === 'true' && user && isTransportOwner(user.accountType)) {
      console.log('🔄 [Dashboard] تحديث البيانات بعد التعديل...');
      // جلب البيانات بشكل قسري مع منع cache
      fetchServices(true);
      // إزالة معلمة refresh من URL
      router.replace('/transport/dashboard', undefined, { shallow: true });
    }
  }, [router.query.refresh, user, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchServices = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      console.log('🔍 [Dashboard] جلب خدمات النقل...', forceRefresh ? '(تحديث قسري)' : '');
      console.log('🔍 [Dashboard] Token:', token ? 'موجود' : 'غير موجود');

      if (!token) {
        setError('رمز المصادقة غير موجود. الرجاء تسجيل الدخول مرة أخرى.');
        return;
      }

      // إضافة timestamp لمنع cache
      const timestamp = forceRefresh ? `t=${Date.now()}` : `t=${Date.now()}`;
      const response = await fetch(`/api/transport/my-services?${timestamp}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      console.log('📡 [Dashboard] استجابة API:', response.status);

      const data = await response.json();
      console.log('📊 [Dashboard] البيانات المستلمة:', data);

      if (data.success) {
        console.log(`✅ [Dashboard] تم جلب ${data.services?.length || 0} خدمة`);
        const servicesData = data.services || [];
        setServices(servicesData);
        // تحديث الإحصائيات بناءً على البيانات الجديدة
        updateStats(servicesData, bookings);
        if (!data.services || data.services.length === 0) {
          console.log('⚠️ [Dashboard] لا توجد خدمات نقل لهذا المستخدم');
        }
      } else {
        console.error('❌ [Dashboard] فشل في جلب الخدمات:', data.error);
        setError(data.error || 'فشل في جلب الخدمات');
      }
    } catch (error) {
      console.error('❌ [Dashboard] خطأ في جلب الخدمات:', error);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  // جلب الطلبات
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/transport/bookings?role=provider', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });

      const data = await response.json();
      if (data.success) {
        // التعامل مع بنية الاستجابة: data.data.bookings أو data.bookings
        const bookingsData = data.data?.bookings || data.bookings || [];
        setBookings(bookingsData);
        updateStats(services, bookingsData);
        console.log('📦 [Dashboard] تم جلب الطلبات:', bookingsData.length);
      }
    } catch (error) {
      console.error('خطأ في جلب الطلبات:', error);
    }
  };

  // دالة لتحديث الإحصائيات مباشرة
  const updateStats = (servicesData: TransportService[], bookingsData?: TransportBooking[]) => {
    const bookingsList = bookingsData || bookings;

    const pendingBookings = bookingsList.filter((b) => b.status === 'PENDING').length;
    const acceptedBookings = bookingsList.filter(
      (b) => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS',
    ).length;
    const completedBookings = bookingsList.filter((b) => b.status === 'COMPLETED').length;

    const newStats: DashboardStats = {
      totalServices: servicesData.length,
      totalViews: 0,
      averageRating: 0,
      pendingBookings,
      acceptedBookings,
      completedBookings,
      totalBookings: bookingsList.length,
    };
    setStats(newStats);
    console.log('📊 [Dashboard] تحديث الإحصائيات:', newStats);
  };

  // معالجة إجراء على الطلب (قبول/رفض/إكمال)
  const handleBookingAction = async (bookingId: string, action: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/transport/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      if (data.success) {
        showNotification('success', data.message || 'تم تحديث الطلب بنجاح');
        fetchBookings();
      } else {
        showNotification('error', data.message || 'فشل في تحديث الطلب');
      }
    } catch (error) {
      console.error('خطأ في تحديث الطلب:', error);
      showNotification('error', 'حدث خطأ في الاتصال');
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'info', message: '' });
    }, 5000);
  };

  // تبديل حالة التوفر لجميع الخدمات
  const toggleGlobalAvailability = async () => {
    setAvailabilityLoading(true);
    try {
      const response = await fetch('/api/transport/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          updateAll: !globalAvailability,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGlobalAvailability(!globalAvailability);
        showNotification(
          'success',
          globalAvailability
            ? 'تم إيقاف جميع الخدمات - لن تظهر في نتائج البحث'
            : 'تم تفعيل جميع الخدمات - أنت الآن متاح للعمل',
        );
        // تحديث قائمة الخدمات
        fetchServices(true);
      } else {
        showNotification('error', data.message || 'فشل في تحديث حالة التوفر');
      }
    } catch (error) {
      console.error('خطأ في تحديث التوفر:', error);
      showNotification('error', 'خطأ في الاتصال');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchServices(true); // تحديث قسري
      showNotification('success', 'تم تحديث البيانات بنجاح');
    } catch (error) {
      showNotification('error', 'فشل في تحديث البيانات');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/transport/manage-service?serviceId=${serviceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        const updatedServices = services.filter((s) => s.id !== serviceId);
        setServices(updatedServices);
        // تحديث الإحصائيات فوراً
        updateStats(updatedServices, bookings);
        showNotification('success', 'تم حذف الخدمة بنجاح');
        setShowDeleteConfirm(null);
        console.log('✅ [Dashboard] تم حذف الخدمة وتحديث البيانات');
      } else {
        showNotification('error', data.error || 'فشل في حذف الخدمة');
      }
    } catch (error) {
      console.error('خطأ في حذف الخدمة:', error);
      showNotification('error', 'حدث خطأ أثناء حذف الخدمة');
    }
  };

  // معالج إيقاف الخدمة مؤقتاً
  const handlePauseService = async (serviceId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/transport/manage-service-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'pause',
          serviceId: serviceId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // تحديث حالة الخدمة في القائمة
        setServices((prev) =>
          prev.map((s) => (s.id === serviceId ? { ...s, status: 'PAUSED' } : s)),
        );
        showNotification('success', 'تم إيقاف الخدمة مؤقتاً');
        console.log('✅ [Dashboard] تم إيقاف الخدمة مؤقتاً');
      } else {
        showNotification('error', data.error || 'فشل في إيقاف الخدمة');
      }
    } catch (error) {
      console.error('خطأ في إيقاف الخدمة:', error);
      showNotification('error', 'حدث خطأ أثناء إيقاف الخدمة');
    }
  };

  // معالج تفعيل الخدمة
  const handleActivateService = async (serviceId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/transport/manage-service-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'activate',
          serviceId: serviceId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // تحديث حالة الخدمة في القائمة
        setServices((prev) =>
          prev.map((s) => (s.id === serviceId ? { ...s, status: 'ACTIVE' } : s)),
        );
        showNotification('success', 'تم تفعيل الخدمة بنجاح');
        console.log('✅ [Dashboard] تم تفعيل الخدمة');
      } else {
        showNotification('error', data.error || 'فشل في تفعيل الخدمة');
      }
    } catch (error) {
      console.error('خطأ في تفعيل الخدمة:', error);
      showNotification('error', 'حدث خطأ أثناء تفعيل الخدمة');
    }
  };

  // معالج تعديل الخدمة
  const handleEditService = (serviceId: string) => {
    router.push(`/transport/edit/${serviceId}`);
  };

  // معالج فتح نافذة تأكيد الحذف
  const handleDeleteClick = (serviceId: string) => {
    setShowDeleteConfirm(serviceId);
  };

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    );
  };

  const toggleSelectAll = () => {
    setSelectedServices(
      selectedServices.length === services.length ? [] : services.map((s) => s.id),
    );
  };

  // تم إزالة handleCopyServiceLink لأنها غير مستخدمة حالياً

  // تم إزالة spinner التحميل - UnifiedPageTransition يتولى ذلك
  if (loading || isLoading) return null;

  if (!user || !isTransportOwner(user.accountType)) {
    return null;
  }

  return (
    <>
      <Head>
        <title>لوحة تحكم خدمات النقل | موقع مزاد السيارات</title>
        <meta name="description" content="إدارة خدمات النقل الخاصة بك" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
        <OpensooqNavbar />

        {/* الإشعارات */}
        {notification.show && (
          <div
            className={`fixed right-4 top-4 z-50 rounded-lg p-4 shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-500 text-white'
                : notification.type === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
              {notification.type === 'error' && <ExclamationTriangleIcon className="h-5 w-5" />}
              {notification.type === 'info' && <InformationCircleIcon className="h-5 w-5" />}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-blue-600 p-8 shadow-2xl">
            {/* خلفية متحركة */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 via-blue-600/20 to-blue-500/20"></div>
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-white/10"></div>
            <div className="absolute right-1/3 top-1/4 h-24 w-24 rounded-full bg-white/5"></div>

            <div className="relative z-10 flex flex-col items-start justify-between lg:flex-row lg:items-center">
              <div className="mb-6 flex items-center space-x-6 space-x-reverse lg:mb-0">
                <div className="group relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110">
                  <TruckIcon className="h-12 w-12 text-blue-600 transition-transform duration-300 group-hover:rotate-12" />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 to-blue-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </div>
                <div>
                  <h1 className="mb-3 text-4xl font-bold text-white">
                    مرحباً بك، {user?.name || 'مقدم الخدمة'}
                  </h1>
                  <p className="mb-3 text-xl text-blue-100">إدارة خدمات النقل الخاصة بك</p>
                  <div className="flex items-center space-x-6 space-x-reverse">
                    <div className="flex items-center space-x-2 space-x-reverse rounded-full bg-green-100 px-3 py-1 text-green-700 backdrop-blur-sm">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">حساب محقق</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse rounded-full bg-blue-100 px-3 py-1 text-blue-700 backdrop-blur-sm">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {new Date().toLocaleDateString('en-US')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button
                  onClick={() => router.push('/transport/add-service')}
                  className="group flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-blue-600 shadow-md transition-all duration-200 hover:bg-blue-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <PlusIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                  <span className="hidden sm:inline">إضافة خدمة جديدة</span>
                  <span className="sm:hidden">إضافة خدمة</span>
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="group flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 shadow-sm transition-all duration-200 hover:bg-blue-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowPathIcon
                    className={`h-4 w-4 transition-transform duration-200 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`}
                  />
                  <span className="hidden sm:inline">تحديث البيانات</span>
                  <span className="sm:hidden">تحديث</span>
                </button>

                <button
                  onClick={() => router.push('/wallet')}
                  className="group flex items-center justify-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 shadow-sm transition-all duration-200 hover:bg-orange-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  <WalletIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  <span className="hidden sm:inline">المحفظة</span>
                  <span className="sm:hidden">محفظة</span>
                </button>

                {/* زر التوفر */}
                <button
                  onClick={toggleGlobalAvailability}
                  disabled={availabilityLoading}
                  className={`group flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    globalAvailability
                      ? 'border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 focus:ring-green-500'
                      : 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500'
                  }`}
                >
                  <div
                    className={`relative h-6 w-12 rounded-full transition-colors duration-200 ${
                      globalAvailability ? 'bg-green-500' : 'bg-red-400'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        globalAvailability ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </div>
                  <span className="hidden sm:inline">
                    {availabilityLoading ? 'جاري...' : globalAvailability ? 'متاح' : 'مشغول'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* تنبيه الطلبات الجديدة */}
          {stats && stats.pendingBookings > 0 && (
            <div className="mb-6 animate-pulse rounded-2xl border-2 border-red-400 bg-red-50 p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800">
                      لديك {stats.pendingBookings} طلب{stats.pendingBookings > 1 ? 'ات' : ''} جديد
                      {stats.pendingBookings > 1 ? 'ة' : ''} بانتظار الموافقة!
                    </h3>
                    <p className="text-sm text-red-600">
                      يرجى مراجعة الطلبات والرد عليها في أقرب وقت
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  <ClipboardDocumentListIcon className="h-4 w-4" />
                  عرض الطلبات
                </button>
              </div>
            </div>
          )}

          {/* الإحصائيات */}
          {stats && (
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-600"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">الخدمات</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <TruckIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-500 to-yellow-600"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">طلبات معلقة</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                    <ClockIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-500 to-cyan-600"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">قيد التنفيذ</p>
                    <p className="text-2xl font-bold text-cyan-600">{stats.acceptedBookings}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100">
                    <TruckIcon className="h-5 w-5 text-cyan-600" />
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-green-500 to-green-600"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">مكتملة</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedBookings}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-slate-500 to-slate-600"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold text-slate-600">{stats.totalBookings}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-slate-600" />
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-orange-500 to-orange-600"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">التقييم</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                    <StarIcon className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* التبويبات */}
          <div className="mb-6 flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`relative flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
              طلبات الحجز
              {stats && stats.pendingBookings > 0 && (
                <span className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                    {stats.pendingBookings}
                  </span>
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === 'services'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TruckIcon className="h-5 w-5" />
              خدماتي
            </button>
          </div>

          {/* قسم الطلبات */}
          {activeTab === 'bookings' && (
            <div className="mb-8 rounded-3xl bg-white p-8 shadow-xl">
              {/* رأس القسم */}
              <div className="mb-8 flex flex-col items-start justify-between gap-6 border-b border-gray-100 pb-6 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">طلبات الحجز الواردة</h2>
                  <p className="mt-1 text-base text-gray-500">إدارة ومتابعة طلبات العملاء</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['all', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setBookingFilter(status)}
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                        bookingFilter === status
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {status === 'all'
                        ? 'الكل'
                        : BOOKING_STATUS[status as keyof typeof BOOKING_STATUS]?.label || status}
                    </button>
                  ))}
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <ClipboardDocumentListIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">لا توجد طلبات</h3>
                  <p className="mt-2 text-base text-gray-500">لم تستلم أي طلبات حجز بعد</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {bookings
                    .filter((b) => bookingFilter === 'all' || b.status === bookingFilter)
                    .map((booking) => {
                      const statusConfig =
                        BOOKING_STATUS[booking.status as keyof typeof BOOKING_STATUS] ||
                        BOOKING_STATUS.PENDING;

                      // حساب الوقت المنقضي
                      const getTimeAgo = (date: string) => {
                        const now = new Date();
                        const created = new Date(date);
                        const diffMs = now.getTime() - created.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        const diffDays = Math.floor(diffMs / 86400000);

                        if (diffMins < 1) return 'الآن';
                        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
                        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
                        return `منذ ${diffDays} يوم`;
                      };

                      return (
                        <div key={booking.id} className="w-full max-w-sm">
                          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                            {/* رأس البطاقة */}
                            <div className="bg-gray-800 px-4 py-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <TruckIcon className="h-5 w-5 text-white" />
                                  <span className="font-semibold text-white">طلب نقل جديد</span>
                                </div>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.color}`}
                                >
                                  {statusConfig.label}
                                </span>
                              </div>
                            </div>

                            {/* محتوى البطاقة */}
                            <div className="space-y-3 p-4">
                              {/* الخدمة */}
                              <div className="flex items-start gap-2">
                                <TruckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500">الخدمة</p>
                                  <p
                                    className="truncate font-medium text-gray-900"
                                    title={booking.service?.truckType || 'نقل سيارات'}
                                  >
                                    {booking.service?.truckType || 'نقل سيارات'}
                                  </p>
                                </div>
                              </div>

                              {/* العميل */}
                              <div className="flex items-start gap-2">
                                <UserIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500">العميل</p>
                                  <p className="font-medium text-gray-900">
                                    {booking.customerName}
                                  </p>
                                </div>
                              </div>

                              {/* مسار النقل */}
                              <div className="flex items-start gap-2">
                                <MapPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500">مسار النقل</p>
                                  <div className="flex items-center gap-2 font-medium text-gray-900">
                                    <span className="rounded bg-green-100 px-2 py-0.5 text-sm text-green-700">
                                      {booking.fromCity}
                                    </span>
                                    <span className="text-gray-400">←</span>
                                    <span className="rounded bg-blue-100 px-2 py-0.5 text-sm text-blue-700">
                                      {booking.toCity}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* التاريخ المفضل */}
                              <div className="flex items-start gap-2">
                                <CalendarIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500">التاريخ المفضل</p>
                                  <p className="font-medium text-gray-900">
                                    {new Date(booking.preferredDate).toLocaleDateString('ar-LY', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </p>
                                </div>
                              </div>

                              {/* رقم الطلب */}
                              <div className="flex items-start gap-2">
                                <ClipboardDocumentListIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500">رقم الطلب</p>
                                  <p className="font-mono font-medium text-gray-900" dir="ltr">
                                    #{booking.id.slice(-8).toUpperCase()}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* أزرار الإجراءات */}
                            <div className="border-t border-gray-100 bg-gray-50/50 p-3">
                              <div className="flex flex-col gap-2">
                                {/* أزرار التواصل */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      window.location.href = `tel:${booking.customerPhone}`;
                                    }}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                  >
                                    <PhoneIcon className="h-4 w-4" />
                                    <span>اتصل الآن</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(booking.customerPhone);
                                      showNotification('success', 'تم نسخ رقم الهاتف');
                                    }}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
                                    title={booking.customerPhone}
                                  >
                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                    <span>نسخ الرقم</span>
                                  </button>
                                </div>

                                {/* زر المراسلة */}
                                <button
                                  onClick={() => {
                                    router.push(
                                      `/messages?chat=${booking.customerId}&name=${encodeURIComponent(booking.customerName)}&phone=${encodeURIComponent(booking.customerPhone)}&type=transport`,
                                    );
                                  }}
                                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                  <span>مراسلة العميل</span>
                                </button>

                                {/* أزرار الإجراءات حسب الحالة */}
                                {booking.status === 'PENDING' && (
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      onClick={() => handleBookingAction(booking.id, 'accept')}
                                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                                    >
                                      <CheckCircleIcon className="h-4 w-4" />
                                      قبول
                                    </button>
                                    <button
                                      onClick={() => handleBookingAction(booking.id, 'reject')}
                                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                    >
                                      <XCircleIcon className="h-4 w-4" />
                                      رفض
                                    </button>
                                  </div>
                                )}
                                {booking.status === 'ACCEPTED' && (
                                  <button
                                    onClick={() => handleBookingAction(booking.id, 'start')}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
                                  >
                                    <TruckIcon className="h-4 w-4" />
                                    بدء التنفيذ
                                  </button>
                                )}
                                {booking.status === 'IN_PROGRESS' && (
                                  <button
                                    onClick={() => handleBookingAction(booking.id, 'complete')}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                  >
                                    <CheckCircleIcon className="h-4 w-4" />
                                    إكمال الطلب
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* الوقت */}
                            <div className="flex items-center gap-2 px-4 pb-3 text-xs text-gray-500">
                              <ClockIcon className="h-3.5 w-3.5" />
                              <span>{getTimeAgo(booking.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* قسم الخدمات */}
          {activeTab === 'services' && (
            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">خدمات النقل الخاصة بك</h2>
                  <p className="text-gray-600">إدارة وتحديث خدمات النقل المتاحة</p>
                </div>

                {services.length > 0 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleSelectAll}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      {selectedServices.length === services.length
                        ? 'إلغاء تحديد الكل'
                        : 'تحديد الكل'}
                    </button>
                    {selectedServices.length > 0 && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                        {selectedServices.length} محدد
                      </span>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {services.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                    <TruckIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">لا توجد خدمات نقل</h3>
                  <p className="mb-6 text-gray-600">ابدأ بإضافة خدمة النقل الأولى لك</p>
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => router.push('/transport/add-service')}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                    >
                      <PlusIcon className="h-5 w-5" />
                      إضافة خدمة نقل
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch('/api/transport/debug-services', {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          const data = await res.json();
                          console.log('🔍 معلومات التشخيص:', data);
                          if (data.debug) {
                            const info = data.debug;
                            let msg = `معرف المستخدم: ${info.tokenInfo?.userId}\n`;
                            msg += `الخدمات المطابقة: ${info.statistics?.servicesMatchingUserId || 0}\n`;
                            msg += `إجمالي الخدمات: ${info.statistics?.totalServicesInDB || 0}`;
                            alert(msg);
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="text-sm text-gray-500 underline hover:text-gray-700"
                    >
                      تشخيص المشكلة
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-[900px]:grid max-[900px]:grid-cols-1 max-[900px]:gap-4 max-[900px]:space-y-0 min-[901px]:grid min-[901px]:grid-cols-1 min-[901px]:gap-6 min-[901px]:space-y-0">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="relative flex items-start gap-4 max-[900px]:block max-[900px]:space-y-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => toggleServiceSelection(service.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 max-[900px]:absolute max-[900px]:left-4 max-[900px]:top-4 max-[900px]:z-10 max-[900px]:mt-0"
                      />
                      <div className="flex-1 max-[900px]:w-full">
                        <SimpleTransportCard
                          service={{
                            id: service.id,
                            title: service.title,
                            description: service.description || '',
                            truckType: service.truckType,
                            capacity: service.capacity,
                            serviceArea: Array.isArray(service.serviceArea)
                              ? service.serviceArea.join(', ')
                              : service.serviceArea,
                            pricePerKm: service.pricePerKm,
                            availableDays: Array.isArray(service.availableDays)
                              ? service.availableDays.join(', ')
                              : service.availableDays || '',
                            contactPhone: service.contactPhone,
                            images: service.images || [],
                            features: service.features || [],
                            commission: service.commission || 0,
                            status: service.status,
                            createdAt: service.createdAt,
                            user: service.user || {
                              id: user.id,
                              name: user.name,
                              phone: user.phone,
                              verified: user.verified || false,
                              profileImage: user.profileImage || undefined,
                              accountType: String(user.accountType),
                            },
                          }}
                          viewMode="list"
                          showOwnerActions={true}
                          onEdit={handleEditService}
                          onDelete={handleDeleteClick}
                          onPause={handlePauseService}
                          onActivate={handleActivateService}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* نافذة تأكيد الحذف */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
                    <p className="text-gray-600">هل أنت متأكد من حذف هذه الخدمة؟</p>
                  </div>
                </div>
                <p className="mb-6 text-sm text-gray-500">
                  لا يمكن التراجع عن هذا الإجراء. سيتم حذف الخدمة نهائياً.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDeleteService(showDeleteConfirm)}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                  >
                    حذف نهائياً
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
