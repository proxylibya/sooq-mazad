/**
 * صفحة حجوزاتي - خدمات النقل
 * My Transport Bookings Page
 */

import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClipboardDocumentIcon from '@heroicons/react/24/outline/ClipboardDocumentIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { OpensooqNavbar } from '../../components/common';
import useAuth from '../../hooks/useAuth';

interface Booking {
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
  customer?: {
    id: string;
    name: string;
    phone: string;
    profileImage?: string;
  };
  provider?: {
    id: string;
    name: string;
    phone: string;
    profileImage?: string;
    verified?: boolean;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'في انتظار القبول', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
  ACCEPTED: { label: 'تم القبول', color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
  IN_PROGRESS: { label: 'جاري التنفيذ', color: 'bg-purple-100 text-purple-800', icon: TruckIcon },
  COMPLETED: { label: 'مكتمل', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  CANCELLED: { label: 'ملغي', color: 'bg-gray-100 text-gray-800', icon: XCircleIcon },
  REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-800', icon: XCircleIcon },
};

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customer' | 'provider'>('customer');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/transport/bookings?role=${activeTab}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      console.log('📦 [MyBookings] استجابة API:', data);
      if (data.success) {
        // التعامل مع بنية الاستجابة: data.data.bookings أو data.bookings
        const bookingsData = data.data?.bookings || data.bookings || [];
        setBookings(bookingsData);
        console.log('✅ [MyBookings] تم جلب الحجوزات:', bookingsData.length);
      }
    } catch (error) {
      console.error('خطأ في جلب الحجوزات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (bookingId: string, action: string) => {
    try {
      const response = await fetch(`/api/transport/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      if (data.success) {
        fetchBookings();
      } else {
        alert(data.message || 'حدث خطأ');
      }
    } catch (error) {
      console.error('خطأ:', error);
      alert('حدث خطأ في الاتصال');
    }
  };

  const filteredBookings = bookings.filter(
    (b) => statusFilter === 'all' || b.status === statusFilter,
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>حجوزاتي | خدمات النقل</title>
        <meta name="description" content="إدارة حجوزات خدمات النقل" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">حجوزاتي</h1>
            <p className="mt-2 text-gray-600">إدارة ومتابعة حجوزات خدمات النقل</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'customer'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              حجوزاتي كعميل
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'provider'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              طلبات الحجز لخدماتي
            </button>
          </div>

          {/* Status Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            {['all', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'الكل' : STATUS_CONFIG[status]?.label || status}
                </button>
              ),
            )}
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <TruckIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">لا توجد حجوزات</h3>
              <p className="mt-2 text-gray-500">
                {activeTab === 'customer' ? 'لم تقم بأي حجوزات بعد' : 'لم تستلم أي طلبات حجز بعد'}
              </p>
              {activeTab === 'customer' && (
                <Link
                  href="/transport/browse"
                  className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                >
                  تصفح خدمات النقل
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={booking.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                  >
                    <div className="p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        {/* Info */}
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-3">
                            <span
                              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${statusConfig.color}`}
                            >
                              <StatusIcon className="h-4 w-4" />
                              {statusConfig.label}
                            </span>
                            <span className="text-sm text-gray-500">#{booking.id.slice(-8)}</span>
                          </div>

                          <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            {booking.service?.title || 'خدمة نقل'}
                          </h3>

                          <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4 text-gray-400" />
                              <span>
                                {booking.fromCity} ← {booking.toCity}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                              <span>{formatDate(booking.preferredDate)}</span>
                            </div>
                            {booking.carMake && (
                              <div className="flex items-center gap-2">
                                <TruckIcon className="h-4 w-4 text-gray-400" />
                                <span>
                                  {booking.carMake} {booking.carModel}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="h-4 w-4 text-gray-400" />
                              <span>
                                {activeTab === 'customer'
                                  ? booking.provider?.name
                                  : booking.customerName}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-left">
                            {booking.finalPrice ? (
                              <div className="text-2xl font-bold text-green-600">
                                {booking.finalPrice} د.ل
                              </div>
                            ) : booking.estimatedPrice ? (
                              <div>
                                <div className="text-lg font-semibold text-gray-900">
                                  {booking.estimatedPrice} د.ل
                                </div>
                                <div className="text-xs text-gray-500">السعر التقديري</div>
                              </div>
                            ) : null}
                          </div>

                          {/* أزرار التواصل */}
                          <div className="flex flex-wrap gap-2">
                            {activeTab === 'provider' ? (
                              <>
                                <button
                                  onClick={() => {
                                    window.location.href = `tel:${booking.customerPhone}`;
                                  }}
                                  className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                                  title="اتصال بالعميل"
                                >
                                  <PhoneIcon className="h-3.5 w-3.5" />
                                  اتصال
                                </button>
                                <button
                                  onClick={() => {
                                    router.push(
                                      `/messages?chat=${booking.customer?.id}&name=${encodeURIComponent(booking.customerName)}&phone=${encodeURIComponent(booking.customerPhone)}&type=transport`,
                                    );
                                  }}
                                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                  title="مراسلة العميل"
                                >
                                  <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                                  مراسلة
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(booking.customerPhone);
                                    alert('تم نسخ رقم الهاتف');
                                  }}
                                  className="flex items-center gap-1 rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                                  title="نسخ رقم الهاتف"
                                >
                                  <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                                  نسخ
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    window.location.href = `tel:${booking.provider?.phone}`;
                                  }}
                                  className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                                  title="اتصال بمقدم الخدمة"
                                >
                                  <PhoneIcon className="h-3.5 w-3.5" />
                                  اتصال
                                </button>
                                <button
                                  onClick={() => {
                                    router.push(
                                      `/messages?chat=${booking.provider?.id}&name=${encodeURIComponent(booking.provider?.name || '')}&phone=${encodeURIComponent(booking.provider?.phone || '')}&type=transport`,
                                    );
                                  }}
                                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                  title="مراسلة مقدم الخدمة"
                                >
                                  <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                                  مراسلة
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(booking.provider?.phone || '');
                                    alert('تم نسخ رقم الهاتف');
                                  }}
                                  className="flex items-center gap-1 rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                                  title="نسخ رقم الهاتف"
                                >
                                  <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                                  نسخ
                                </button>
                              </>
                            )}
                          </div>

                          {/* Actions for Provider */}
                          {activeTab === 'provider' && booking.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAction(booking.id, 'accept')}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                              >
                                قبول
                              </button>
                              <button
                                onClick={() => handleAction(booking.id, 'reject')}
                                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                              >
                                رفض
                              </button>
                            </div>
                          )}

                          {activeTab === 'provider' && booking.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleAction(booking.id, 'start')}
                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              بدء التنفيذ
                            </button>
                          )}

                          {activeTab === 'provider' && booking.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleAction(booking.id, 'complete')}
                              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                            >
                              إكمال الحجز
                            </button>
                          )}

                          {/* Cancel for Customer */}
                          {activeTab === 'customer' &&
                            ['PENDING', 'ACCEPTED'].includes(booking.status) && (
                              <button
                                onClick={() => {
                                  if (confirm('هل أنت متأكد من إلغاء الحجز؟')) {
                                    handleAction(booking.id, 'cancel');
                                  }
                                }}
                                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                              >
                                إلغاء الحجز
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
