/**
 * صفحة تفاصيل حجز النقل
 * Transport Booking Details Page
 */
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
  PrinterIcon,
  TruckIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';

// حالات الحجز
const BOOKING_STATUS = {
  PENDING: { label: 'في انتظار القبول', color: 'bg-amber-500/20 text-amber-300', icon: ClockIcon },
  ACCEPTED: { label: 'تم القبول', color: 'bg-green-500/20 text-green-300', icon: CheckCircleIcon },
  IN_PROGRESS: { label: 'جاري التنفيذ', color: 'bg-blue-500/20 text-blue-300', icon: TruckIcon },
  COMPLETED: { label: 'مكتمل', color: 'bg-slate-500/20 text-slate-300', icon: CheckCircleIcon },
  CANCELLED: { label: 'ملغي', color: 'bg-red-500/20 text-red-300', icon: XCircleIcon },
  REJECTED: { label: 'مرفوض', color: 'bg-red-500/20 text-red-300', icon: XCircleIcon },
};

interface BookingDetails {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  fromCity: string;
  toCity: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  preferredDate: string;
  preferredTime?: string;
  status: keyof typeof BOOKING_STATUS;
  estimatedPrice?: number;
  finalPrice?: number;
  distance?: number;
  specialInstructions?: string;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  carColor?: string;
  carPlateNumber?: string;
  insurance?: boolean;
  tracking?: boolean;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  service?: {
    id: string;
    title: string;
    truckType: string;
    pricePerKm?: number;
    capacity?: number;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    profileImage?: string;
  };
  provider?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    verified?: boolean;
  };
  timeline?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState('');

  // جلب تفاصيل الحجز
  const fetchBooking = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/transport/bookings?id=${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json();

      if (result.success && result.data?.booking) {
        setBooking(result.data.booking);
      } else {
        // بيانات تجريبية
        setBooking({
          id: id as string,
          customerName: 'محمد أحمد',
          customerPhone: '+218912345678',
          customerEmail: 'customer@example.com',
          fromCity: 'طرابلس',
          toCity: 'بنغازي',
          pickupAddress: 'حي الأندلس، شارع النصر',
          deliveryAddress: 'الفويهات، قرب الجامعة',
          preferredDate: new Date().toISOString(),
          preferredTime: '10:00 صباحاً',
          status: 'PENDING',
          estimatedPrice: 1500,
          distance: 650,
          specialInstructions: 'الرجاء التعامل بحذر مع السيارة',
          carMake: 'تويوتا',
          carModel: 'كامري',
          carYear: '2020',
          carColor: 'أبيض',
          carPlateNumber: '123 أ ب ت',
          insurance: true,
          tracking: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          updatedAt: new Date().toISOString(),
          service: {
            id: 'service-1',
            title: 'نقل سيارات فاخرة',
            truckType: 'car_carrier',
            pricePerKm: 2.5,
            capacity: 2,
          },
          provider: {
            id: 'provider-1',
            name: 'شركة النقل السريع',
            phone: '+218913456789',
            verified: true,
          },
          timeline: [
            {
              status: 'CREATED',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              note: 'تم إنشاء الطلب',
            },
          ],
        });
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل الحجز:', error);
      setToast({ message: 'خطأ في جلب البيانات', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // إخفاء Toast تلقائياً
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // تحديث حالة الحجز
  const updateStatus = async (newStatus: string) => {
    if (!booking) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/transport/bookings', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: booking.id, status: newStatus, note }),
      });

      const result = await response.json();

      if (result.success) {
        setToast({ message: 'تم تحديث حالة الحجز', type: 'success' });
        setShowStatusModal(false);
        setNote('');
        fetchBooking();
      } else {
        setToast({ message: result.error || 'خطأ في التحديث', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'خطأ في الاتصال', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // إضافة ملاحظة
  const addNote = async () => {
    if (!booking || !note.trim()) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/transport/bookings', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: booking.id, addNote: note }),
      });

      const result = await response.json();

      if (result.success) {
        setToast({ message: 'تمت إضافة الملاحظة', type: 'success' });
        setShowNoteModal(false);
        setNote('');
        fetchBooking();
      } else {
        setToast({ message: result.error || 'خطأ', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'خطأ في الاتصال', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-LY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="تفاصيل الحجز">
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  if (!booking) {
    return (
      <AdminLayout title="تفاصيل الحجز">
        <div className="py-20 text-center">
          <TruckIcon className="mx-auto h-16 w-16 text-slate-600" />
          <p className="mt-4 text-xl text-slate-400">الحجز غير موجود</p>
          <Link
            href="/admin/transport/bookings"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            العودة للحجوزات
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const statusInfo = BOOKING_STATUS[booking.status] || BOOKING_STATUS.PENDING;
  const StatusIcon = statusInfo.icon;

  return (
    <AdminLayout title="تفاصيل الحجز">
      <Head>
        <title>تفاصيل الحجز #{booking.id.slice(-8)} | لوحة التحكم</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/transport/bookings"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">
                طلب #{booking.id.slice(-8).toUpperCase()}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}
                >
                  <StatusIcon className="h-4 w-4" />
                  {statusInfo.label}
                </span>
                <span className="text-sm text-slate-400">{formatDate(booking.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBooking}
              className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
            >
              <ArrowPathIcon className="h-4 w-4" />
              تحديث
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
            >
              <PrinterIcon className="h-4 w-4" />
              طباعة
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <CheckCircleIcon className="h-4 w-4" />
              تغيير الحالة
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Route Info */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                <MapPinIcon className="h-5 w-5 text-blue-400" />
                معلومات المسار
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-green-500/10 p-4">
                  <p className="text-sm text-green-400">من</p>
                  <p className="text-lg font-bold text-white">{booking.fromCity}</p>
                  {booking.pickupAddress && (
                    <p className="text-sm text-slate-400">{booking.pickupAddress}</p>
                  )}
                </div>
                <div className="rounded-lg bg-blue-500/10 p-4">
                  <p className="text-sm text-blue-400">إلى</p>
                  <p className="text-lg font-bold text-white">{booking.toCity}</p>
                  {booking.deliveryAddress && (
                    <p className="text-sm text-slate-400">{booking.deliveryAddress}</p>
                  )}
                </div>
              </div>
              {booking.distance && (
                <div className="mt-4 text-center">
                  <span className="rounded-full bg-slate-700 px-4 py-2 text-sm text-slate-300">
                    المسافة: {booking.distance} كم
                  </span>
                </div>
              )}
            </div>

            {/* Car Info */}
            {(booking.carMake || booking.carModel) && (
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                  <TruckIcon className="h-5 w-5 text-purple-400" />
                  معلومات السيارة
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="الماركة" value={booking.carMake || '-'} />
                  <InfoRow label="الموديل" value={booking.carModel || '-'} />
                  <InfoRow label="سنة الصنع" value={booking.carYear || '-'} />
                  <InfoRow label="اللون" value={booking.carColor || '-'} />
                  <InfoRow label="رقم اللوحة" value={booking.carPlateNumber || '-'} />
                </div>
                <div className="mt-4 flex gap-4">
                  {booking.insurance && (
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
                      تأمين شامل
                    </span>
                  )}
                  {booking.tracking && (
                    <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-400">
                      تتبع مباشر
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {booking.specialInstructions && (
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                  <DocumentTextIcon className="h-5 w-5 text-amber-400" />
                  ملاحظات العميل
                </h3>
                <p className="text-slate-300">{booking.specialInstructions}</p>
              </div>
            )}

            {/* Timeline */}
            {booking.timeline && booking.timeline.length > 0 && (
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                <h3 className="mb-4 font-semibold text-white">سجل الحالات</h3>
                <div className="space-y-4">
                  {booking.timeline.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
                        <ClockIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.note || item.status}</p>
                        <p className="text-xs text-slate-400">{formatDate(item.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                <UserIcon className="h-5 w-5 text-emerald-400" />
                معلومات العميل
              </h3>
              <div className="space-y-3">
                <p className="text-lg font-bold text-white">{booking.customerName}</p>
                <div className="flex items-center gap-2 text-slate-300">
                  <PhoneIcon className="h-4 w-4" />
                  <a
                    href={`tel:${booking.customerPhone}`}
                    className="hover:text-blue-400"
                    dir="ltr"
                  >
                    {booking.customerPhone}
                  </a>
                </div>
                {booking.customerEmail && (
                  <p className="text-sm text-slate-400">{booking.customerEmail}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <a
                    href={`tel:${booking.customerPhone}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm text-white hover:bg-green-700"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    اتصال
                  </a>
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm text-white hover:bg-blue-700">
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    رسالة
                  </button>
                </div>
              </div>
            </div>

            {/* Provider Info */}
            {booking.provider && (
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                  <TruckIcon className="h-5 w-5 text-sky-400" />
                  مقدم الخدمة
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-white">{booking.provider.name}</p>
                    {booking.provider.verified && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <PhoneIcon className="h-4 w-4" />
                    <a
                      href={`tel:${booking.provider.phone}`}
                      className="hover:text-blue-400"
                      dir="ltr"
                    >
                      {booking.provider.phone}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Service Info */}
            {booking.service && (
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                <h3 className="mb-4 font-semibold text-white">تفاصيل الخدمة</h3>
                <div className="space-y-2">
                  <InfoRow label="الخدمة" value={booking.service.title} />
                  <InfoRow label="نوع الشاحنة" value={booking.service.truckType} />
                  {booking.service.pricePerKm && (
                    <InfoRow label="السعر/كم" value={`${booking.service.pricePerKm} د.ل`} />
                  )}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="mb-4 font-semibold text-white">التسعير</h3>
              <div className="space-y-3">
                {booking.estimatedPrice && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">السعر التقديري</span>
                    <span className="font-bold text-white">{booking.estimatedPrice} د.ل</span>
                  </div>
                )}
                {booking.finalPrice && (
                  <div className="flex justify-between border-t border-slate-700 pt-3">
                    <span className="text-slate-400">السعر النهائي</span>
                    <span className="text-xl font-bold text-green-400">
                      {booking.finalPrice} د.ل
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="mb-4 font-semibold text-white">إجراءات سريعة</h3>
              <div className="space-y-2">
                {booking.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateStatus('ACCEPTED')}
                      disabled={actionLoading}
                      className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      قبول الطلب
                    </button>
                    <button
                      onClick={() => updateStatus('REJECTED')}
                      disabled={actionLoading}
                      className="w-full rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      رفض الطلب
                    </button>
                  </>
                )}
                {booking.status === 'ACCEPTED' && (
                  <button
                    onClick={() => updateStatus('IN_PROGRESS')}
                    disabled={actionLoading}
                    className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    بدء التنفيذ
                  </button>
                )}
                {booking.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => updateStatus('COMPLETED')}
                    disabled={actionLoading}
                    className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    إكمال الطلب
                  </button>
                )}
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="w-full rounded-lg border border-slate-600 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
                >
                  إضافة ملاحظة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">تغيير حالة الطلب</h2>
            <div className="space-y-2">
              {Object.entries(BOOKING_STATUS).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => updateStatus(key)}
                  disabled={actionLoading || booking.status === key}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-right ${
                    booking.status === key
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 hover:bg-slate-700'
                  } disabled:opacity-50`}
                >
                  <info.icon className="h-5 w-5 text-slate-300" />
                  <span className="font-medium text-white">{info.label}</span>
                  {booking.status === key && (
                    <span className="mr-auto text-xs text-blue-400">الحالة الحالية</span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">إضافة ملاحظة</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="اكتب ملاحظتك هنا..."
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNote('');
                }}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={addNote}
                disabled={actionLoading || !note.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 left-4 z-50 rounded-lg px-4 py-3 shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}
        >
          {toast.message}
        </div>
      )}
    </AdminLayout>
  );
}

// مكون صف المعلومات
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
