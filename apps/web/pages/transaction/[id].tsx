import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
// // import { useSession } from 'next-auth/react'; // تم تعطيل نظام المصادقة مؤقتاً // تم تعطيل نظام المصادقة مؤقتاً
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import BanknotesIcon from '@heroicons/react/24/outline/BanknotesIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import ReceiptPercentIcon from '@heroicons/react/24/outline/ReceiptPercentIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import DateLocationInfo from '../../components/DateLocationInfo';
import { OpensooqNavbar } from '../../components/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _CurrencyDollarIcon = CurrencyDollarIcon;

// أنواع البيانات
interface Transaction {
  id: string;
  carTitle: string;
  carImage: string;
  type: 'marketplace' | 'auction';

  // معلومات البائع
  seller: {
    name: string;
    phone: string;
    email: string;
    rating: number;
    verified: boolean;
  };

  // معلومات المشتري
  buyer: {
    name: string;
    phone: string;
    email: string;
    rating: number;
    verified: boolean;
  };

  // تفاصيل المعاملة
  originalPrice: number;
  finalPrice: number;
  fees: number;
  taxes: number;
  totalAmount: number;
  paymentMethod: string;

  // التواريخ
  createdAt: string;
  completedAt: string;
  deliveryDate?: string;

  // الحالة
  status: 'pending' | 'completed' | 'cancelled' | 'disputed';

  // معلومات إضافية
  location: string;
  notes?: string;
  documents: Array<{
    name: string;
    url: string;
    type: string;
  }>;

  // تقييمات
  sellerRating?: number;
  buyerRating?: number;
  sellerReview?: string;
  buyerReview?: string;
}

const TransactionPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // محاكاة حالة تسجيل الدخول - يمكن ربطها بنظام المصادقة لاحقاً
  const session = useMemo(
    () => ({
      user: { id: 'user123', name: 'المستخدم التجريبي' },
    }),
    [],
  );
  const status = 'authenticated';

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
      return;
    }
    if (id) {
      loadTransaction(id as string);
    }
  }, [session, status, router, id]);

  // تحميل تفاصيل المعاملة
  const loadTransaction = async (transactionId: string) => {
    setLoading(true);
    try {
      // محاكاة البيانات - في التطبيق الحقيقي ستأتي من API
      const mockTransaction: Transaction = {
        id: transactionId,
        carTitle: 'تويوتا كامري 2020 - مباعة',
        carImage: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400',
        type: 'marketplace',

        seller: {
          name: 'أحمد محمد علي',
          phone: '+218-91-234-5678',
          email: 'ahmed.mohamed@email.com',
          rating: 4.8,
          verified: true,
        },

        buyer: {
          name: 'سارة أحمد حسن',
          phone: '+218-92-345-6789',
          email: 'sara.ahmed@email.com',
          rating: 4.6,
          verified: true,
        },

        originalPrice: 75000,
        finalPrice: 78000,
        fees: 1560, // 2% رسوم الموقع
        taxes: 3900, // 5% ضرائب
        totalAmount: 83460,
        paymentMethod: 'تحويل بنكي',

        createdAt: '2024-01-10T10:00:00',
        completedAt: '2024-01-20T15:30:00',
        deliveryDate: '2024-01-22T12:00:00',

        status: 'completed',

        location: 'طرابلس',
        notes: 'تم الاتفاق على التسليم في مكان آمن بوسط المدينة',

        documents: [
          { name: 'عقد البيع', url: '/documents/contract.pdf', type: 'pdf' },
          { name: 'إيصال الدفع', url: '/documents/receipt.pdf', type: 'pdf' },
          {
            name: 'شهادة التحويل',
            url: '/documents/transfer.pdf',
            type: 'pdf',
          },
        ],

        sellerRating: 5,
        buyerRating: 4,
        sellerReview: 'مشتري ممتاز، دفع سريع وتعامل محترم',
        buyerReview: 'بائع صادق، السيارة كما هو موصوف تماماً',
      };

      setTransaction(mockTransaction);
    } catch (error) {
      console.error('خطأ في تحميل تفاصيل المعاملة:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LYD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      case 'disputed':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'pending':
        return 'في الانتظار';
      case 'cancelled':
        return 'ملغية';
      case 'disputed':
        return 'متنازع عليها';
      default:
        return status;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `تفاصيل المعاملة - ${transaction?.carTitle}`,
        text: `معاملة بيع ${transaction?.carTitle} بقيمة ${formatPrice(transaction?.finalPrice || 0)}`,
        url: window.location.href,
      });
    } else {
      // نسخ الرابط للحافظة
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط المعاملة');
    }
  };

  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (status !== 'authenticated' || loading) return null;

  if (!transaction) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">لم يتم العثور على المعاملة</h3>
          <p className="mb-6 text-gray-500">المعاملة المطلوبة غير موجودة أو تم حذفها</p>
          <Link
            href="/my-account/sold-cars"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            العودة للسيارات المباعة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>تفاصيل المعاملة - {transaction.carTitle}</title>
        <meta name="description" content={`تفاصيل معاملة بيع ${transaction.carTitle}`} />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <Link href="/my-account/sold-cars" className="text-gray-500 hover:text-gray-700">
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">تفاصيل المعاملة</h1>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-gray-500">رقم المعاملة:</span>
                <span className="font-mono text-lg font-bold text-gray-900">#{transaction.id}</span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(transaction.status)}`}
                >
                  {getStatusText(transaction.status)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <PrinterIcon className="h-4 w-4" />
                  طباعة
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  <ShareIcon className="h-4 w-4" />
                  مشاركة
                </button>
              </div>
            </div>
          </div>

          {/* Car Info */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="relative h-24 w-24">
                <Image
                  src={transaction.carImage || '/images/placeholder-car.jpg'}
                  alt={transaction.carTitle}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">{transaction.carTitle}</h2>

                {/* التاريخ والمدينة */}
                <DateLocationInfo
                  date={transaction.createdAt ? new Date(transaction.createdAt) : new Date()}
                  location="الزاوية"
                  className="mb-2"
                  size="md"
                />

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{transaction.location}</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      transaction.type === 'auction'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {transaction.type === 'auction' ? 'مزاد' : 'سوق مفتوح'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Seller Info */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">معلومات البائع</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{transaction.seller.name}</div>
                    {transaction.seller.verified && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircleIcon className="h-4 w-4" />
                        موثق
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900" dir="ltr">
                    {transaction.seller.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {renderStars(transaction.seller.rating)}
                  </div>
                  <span className="text-sm text-gray-600">({transaction.seller.rating}/5)</span>
                </div>
                {transaction.sellerReview && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="mb-1 text-sm font-medium text-gray-900">تقييم المشتري:</div>
                    <div className="mb-2 flex items-center gap-2">
                      {renderStars(transaction.sellerRating || 0)}
                      <span className="text-sm text-gray-600">({transaction.sellerRating}/5)</span>
                    </div>
                    <p className="text-sm text-gray-700">{transaction.sellerReview}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Buyer Info */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">معلومات المشتري</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{transaction.buyer.name}</div>
                    {transaction.buyer.verified && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircleIcon className="h-4 w-4" />
                        موثق
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900" dir="ltr">
                    {transaction.buyer.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {renderStars(transaction.buyer.rating)}
                  </div>
                  <span className="text-sm text-gray-600">({transaction.buyer.rating}/5)</span>
                </div>
                {transaction.buyerReview && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="mb-1 text-sm font-medium text-gray-900">تقييم البائع:</div>
                    <div className="mb-2 flex items-center gap-2">
                      {renderStars(transaction.buyerRating || 0)}
                      <span className="text-sm text-gray-600">({transaction.buyerRating}/5)</span>
                    </div>
                    <p className="text-sm text-gray-700">{transaction.buyerReview}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">التفاصيل المالية</h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">السعر الأصلي:</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(transaction.originalPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">السعر النهائي:</span>
                  <span className="font-bold text-green-600">
                    {formatPrice(transaction.finalPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">رسوم الموقع (2%):</span>
                  <span className="font-medium text-gray-900">{formatPrice(transaction.fees)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الضرائب (5%):</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(transaction.taxes)}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">المبلغ الإجمالي:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(transaction.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <BanknotesIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">طريقة الدفع</span>
                  </div>
                  <span className="text-blue-700">{transaction.paymentMethod}</span>
                </div>

                <div className="rounded-lg bg-green-50 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <ReceiptPercentIcon className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">الربح</span>
                  </div>
                  <span className="font-bold text-green-700">
                    {formatPrice(transaction.finalPrice - transaction.originalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">الجدول الزمني</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">بداية المعاملة</div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(transaction.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">اكتمال المعاملة</div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(transaction.completedAt)}
                  </div>
                </div>
              </div>

              {transaction.deliveryDate && (
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <ClockIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">تاريخ التسليم</div>
                    <div className="text-sm text-gray-500">
                      {formatDateTime(transaction.deliveryDate)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          {transaction.documents.length > 0 && (
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">المستندات</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {transaction.documents.map((doc, index) => (
                  <a
                    key={index}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
                  >
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">{doc.name}</div>
                      <div className="text-sm uppercase text-gray-500">{doc.type}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {transaction.notes && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">ملاحظات</h3>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-gray-700">{transaction.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TransactionPage;

// إضافة getStaticPaths للصفحات الديناميكية
export async function getStaticPaths() {
  // قائمة بجميع معرفات المعاملات المتاحة
  const paths = [
    { params: { id: '1' } },
    { params: { id: '2' } },
    { params: { id: '3' } },
    { params: { id: '4' } },
    { params: { id: '5' } },
    { params: { id: '6' } },
    { params: { id: '7' } },
    { params: { id: '8' } },
    { params: { id: '9' } },
    { params: { id: '10' } },
  ];

  return {
    paths,
    fallback: 'blocking', // سيتم إنشاء الصفحات الجديدة عند الطلب
  };
}

// إضافة getStaticProps لجلب البيانات
export async function getStaticProps({ params }: { params: { id: string } }) {
  try {
    // هنا يمكن جلب البيانات من API أو قاعدة البيانات
    // حالياً نستخدم البيانات الوهمية

    return {
      props: {
        transactionId: params.id,
      },
      revalidate: 60, // إعادة التحقق كل دقيقة
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}
