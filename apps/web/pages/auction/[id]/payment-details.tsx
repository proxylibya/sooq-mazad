import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import BanknotesIcon from '@heroicons/react/24/outline/BanknotesIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import BuildingLibraryIcon from '@heroicons/react/24/outline/BuildingLibraryIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { OpensooqNavbar } from '../../../components/common';
import PaymentCountdownTimer from '../../../components/PaymentCountdownTimer';
import useAuthProtection from '@/hooks/useAuthProtection';
import { useBidders } from '@/hooks/useBidders';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'mobile' | 'cash';
  details: string;
  icon: React.ReactNode;
  isPreferred?: boolean;
}

interface PaymentStatus {
  status: 'pending' | 'confirmed' | 'overdue' | 'cancelled';
  lastUpdate: Date;
  confirmationCode?: string;
  notes?: string;
}

const PaymentDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // مصادقة واستدعاء بيانات المزايدين للحصول على المشتري الفائز
  const { isAuthenticated: _isAuthed, user, requireLogin } = useAuthProtection({ showModal: true });
  const { bidders } = useBidders(typeof id === 'string' ? id : undefined);
  const winner = useMemo(() => (Array.isArray(bidders) && bidders.length > 0 ? bidders[0] : null), [bidders]);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'pending',
    lastUpdate: new Date(),
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  // تفاصيل البيع (تستخدم الفائز الحقيقي إن توفر، وإلا تعرض قيماً افتراضية)
  const saleDetails = {
    auctionId: id as string,
    buyerName: winner?.name || 'المزايد الفائز',
    buyerPhone: winner?.phone || '-',
    buyerEmail: '-',
    finalAmount: winner?.amount || '0',
    confirmedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // منذ ساعتين (Placeholder)
    paymentDeadline: new Date(Date.now() + 22 * 60 * 60 * 1000), // بعد 22 ساعة (Placeholder)
    carDetails: {
      make: '—',
      model: '—',
      year: '—',
      color: '—',
    },
  };

  // طرق الدفع المتاحة
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bank_transfer',
      name: 'تحويل بنكي',
      type: 'bank',
      details: 'المصرف الأهلي الليبي - رقم الحساب: 123456789',
      icon: <BuildingLibraryIcon className="h-6 w-6" />,
      isPreferred: true,
    },
    {
      id: 'mobile_money',
      name: 'محفظة إلكترونية',
      type: 'mobile',
      details: 'مدى للدفع - رقم المحفظة: 0912345678',
      icon: <CreditCardIcon className="h-6 w-6" />,
    },
    {
      id: 'cash',
      name: 'دفع نقدي',
      type: 'cash',
      details: 'عند استلام المركبة - يفضل في مكان آمن',
      icon: <BanknotesIcon className="h-6 w-6" />,
    },
  ];

  // تنسيق الأرقام
  const formatNumber = (num: string | number): string => {
    const numStr = typeof num === 'number' ? num.toString() : num;
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // معالجة انتهاء وقت الدفع
  const handlePaymentTimeUp = () => {
    setPaymentStatus((prev) => ({
      ...prev,
      status: 'overdue',
      lastUpdate: new Date(),
    }));
  };

  // معالجة تأكيد الدفع
  const handleConfirmPayment = () => {
    setPaymentStatus({
      status: 'confirmed',
      lastUpdate: new Date(),
      confirmationCode: 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      notes: 'تم تأكيد الدفع بنجاح',
    });
  };

  // مراسلة/إشعار المشتري
  const sendMessageToBuyer = async (content: string) => {
    if (!winner?.userIdStr) {
      alert('لا يوجد مشتري فائز لإرسال الرسالة');
      return;
    }
    if (!requireLogin('التواصل مع المشتري')) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          senderId: String(user?.id || ''),
          receiverId: String(winner.userIdStr),
          content,
          type: 'TEXT',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        alert(data?.error || 'فشل في إرسال الرسالة');
        return;
      }
      alert('تم إرسال الرسالة للمشتري');
    } catch (e) {
      alert('حدث خطأ أثناء إرسال الرسالة');
    }
  };

  const handleSendPaymentReminder = async () => {
    const content = `تذكير بالدفع للمزاد ${id}: يرجى إتمام عملية الدفع خلال المهلة المحددة.`;
    await sendMessageToBuyer(content);
  };

  const handleSendPaymentInstructions = async () => {
    const content = 'تعليمات الدفع: يرجى التحويل عبر المصرف المحدد وإرسال إيصال التحويل.';
    await sendMessageToBuyer(content);
  };

  const handleMessageBuyer = async () => {
    if (!winner?.userIdStr) {
      alert('لا يوجد مشتري فائز لبدء محادثة');
      return;
    }
    if (!requireLogin('بدء محادثة مع المشتري')) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId1: String(user?.id || ''), userId2: String(winner.userIdStr) }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        alert(data?.error || 'فشل في فتح المحادثة');
        return;
      }
      const convId = String(data?.data?.id || '');
      router.push(convId ? `/messages?convId=${encodeURIComponent(convId)}` : '/messages');
    } catch (e) {
      alert('حدث خطأ أثناء إنشاء المحادثة');
    }
  };

  // تحديد لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  // تحديد نص الحالة
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'تم تأكيد الدفع';
      case 'overdue':
        return 'تأخر في الدفع';
      case 'cancelled':
        return 'تم إلغاء البيع';
      default:
        return 'في انتظار الدفع';
    }
  };

  return (
    <>
      <Head>
        <title>تفاصيل الدفع - مزاد السيارات</title>
        <meta name="description" content="إدارة عملية الدفع وتتبع حالة البيع" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="container mx-auto px-4 py-8">
          {/* رأس الصفحة */}
          <div className="mb-8">
            <div className="mb-4 flex items-center">
              <Link
                href={`/auction/${id}`}
                className="flex items-center text-blue-600 transition-colors hover:text-blue-800"
              >
                <ArrowRightIcon className="ml-2 h-5 w-5" />
                العودة إلى المزاد
              </Link>
            </div>

            <h1 className="mb-2 text-3xl font-bold text-gray-800">إدارة عملية البيع</h1>
            <p className="text-gray-600">تتبع حالة الدفع وإدارة التواصل مع المشتري</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* العمود الأيسر - تفاصيل البيع */}
            <div className="space-y-6 lg:col-span-2">
              {/* حالة الدفع */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">حالة الدفع</h2>
                  <div
                    className={`rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(paymentStatus.status)}`}
                  >
                    {getStatusText(paymentStatus.status)}
                  </div>
                </div>

                {paymentStatus.status === 'pending' && (
                  <PaymentCountdownTimer
                    deadline={saleDetails.paymentDeadline}
                    onTimeUp={handlePaymentTimeUp}
                    size="large"
                  />
                )}

                {paymentStatus.status === 'confirmed' && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="mb-2 flex items-center">
                      <CheckCircleSolid className="ml-2 h-6 w-6 text-green-600" />
                      <span className="font-semibold text-green-800">تم تأكيد الدفع بنجاح!</span>
                    </div>
                    <p className="mb-2 text-sm text-green-700">
                      رقم التأكيد:{' '}
                      <span className="font-mono">{paymentStatus.confirmationCode}</span>
                    </p>
                    <p className="text-sm text-green-600">{paymentStatus.notes}</p>
                  </div>
                )}

                {paymentStatus.status === 'overdue' && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="mb-2 flex items-center">
                      <ExclamationTriangleIcon className="ml-2 h-6 w-6 text-red-600" />
                      <span className="font-semibold text-red-800">انتهت مهلة الدفع</span>
                    </div>
                    <p className="text-sm text-red-600">
                      يرجى التواصل مع المشتري لتأكيد حالة الدفع أو إعادة طرح المزاد.
                    </p>
                  </div>
                )}
              </div>

              {/* تفاصيل البيع */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">تفاصيل البيع</h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 font-medium text-gray-700">معلومات المركبة</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-500">الماركة:</span>{' '}
                        {saleDetails.carDetails.make}
                      </p>
                      <p>
                        <span className="text-gray-500">الموديل:</span>{' '}
                        {saleDetails.carDetails.model}
                      </p>
                      <p>
                        <span className="text-gray-500">السنة:</span> {saleDetails.carDetails.year}
                      </p>
                      <p>
                        <span className="text-gray-500">اللون:</span> {saleDetails.carDetails.color}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 font-medium text-gray-700">تفاصيل المبلغ</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-500">المبلغ النهائي:</span>
                        <span className="mr-2 text-lg font-bold text-green-600">
                          {formatNumber(saleDetails.finalAmount)} د.ل
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-500">تاريخ التأكيد:</span>
                        {saleDetails.confirmedAt.toLocaleDateString('ar-LY')}
                      </p>
                      <p>
                        <span className="text-gray-500">الموعد النهائي:</span>
                        {saleDetails.paymentDeadline.toLocaleDateString('ar-LY')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* طرق الدفع */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">طرق الدفع المتاحة</h2>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="ml-3 text-gray-600">{method.icon}</div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-800">{method.name}</span>
                              {method.isPreferred && (
                                <span className="mr-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                  مفضل
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{method.details}</p>
                          </div>
                        </div>

                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedPaymentMethod === method.id && (
                            <div className="h-full w-full scale-50 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* العمود الأيمن - معلومات المشتري والإجراءات */}
            <div className="space-y-6">
              {/* معلومات المشتري */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">معلومات المشتري</h2>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <UserIcon className="ml-3 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-800">{saleDetails.buyerName}</p>
                      <p className="text-sm text-gray-500">المشتري</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <PhoneIcon className="ml-3 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-800">{saleDetails.buyerPhone}</p>
                      <p className="text-sm text-gray-500">رقم الهاتف</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <EnvelopeIcon className="ml-3 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-800">{saleDetails.buyerEmail}</p>
                      <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* الإجراءات */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">الإجراءات</h2>

                <div className="space-y-3">
                  <button
                    onClick={handleMessageBuyer}
                    className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <ChatBubbleLeftRightIcon className="ml-2 h-5 w-5" />
                    بدء محادثة مع المشتري
                  </button>

                  <button
                    onClick={handleSendPaymentReminder}
                    className="flex w-full items-center justify-center rounded-lg bg-amber-600 px-4 py-3 font-medium text-white transition-colors hover:bg-amber-700"
                  >
                    <ClockIcon className="ml-2 h-5 w-5" />
                    إرسال تذكير بالدفع
                  </button>

                  <button
                    onClick={handleSendPaymentInstructions}
                    className="flex w-full items-center justify-center rounded-lg bg-cyan-600 px-4 py-3 font-medium text-white transition-colors hover:bg-cyan-700"
                  >
                    <DocumentTextIcon className="ml-2 h-5 w-5" />
                    إرسال تعليمات الدفع
                  </button>

                  {paymentStatus.status === 'pending' && (
                    <button
                      onClick={handleConfirmPayment}
                      className="flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700"
                    >
                      <CheckCircleIcon className="ml-2 h-5 w-5" />
                      تأكيد استلام الدفع
                    </button>
                  )}

                  <button className="flex w-full items-center justify-center rounded-lg bg-gray-600 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-700">
                    <PrinterIcon className="ml-2 h-5 w-5" />
                    طباعة التفاصيل
                  </button>

                  <button className="flex w-full items-center justify-center rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700">
                    <ShareIcon className="ml-2 h-5 w-5" />
                    مشاركة التفاصيل
                  </button>

                  {saleDetails.buyerPhone && saleDetails.buyerPhone !== '-' && (
                    <button
                      onClick={() => window.open(`tel:${saleDetails.buyerPhone}`, '_self')}
                      className="flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700"
                    >
                      <PhoneIcon className="ml-2 h-5 w-5" /> اتصال بالمشتري
                    </button>
                  )}
                </div>
              </div>

              {/* ملاحظات مهمة */}
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="mb-2 font-semibold text-yellow-800">ملاحظات مهمة</h3>
                <ul className="space-y-1 text-sm text-yellow-700">
                  <li>• لا تسلم المركبة قبل تأكيد وصول المبلغ</li>
                  <li>• احتفظ بجميع إيصالات الدفع</li>
                  <li>• تأكد من هوية المشتري عند التسليم</li>
                  <li>• قم بتوثيق عملية التسليم</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentDetailsPage;
