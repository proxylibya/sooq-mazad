import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DateLocationInfo from '../../components/DateLocationInfo';
import { BackButton, Layout } from '../../components/common';

interface ListingData {
  id: string;
  title: string;
  price: string;
  brand: string;
  model: string;
  year: string;
  mileage: string;
  condition: string;
  city: string;
  description: string;
  images: string[];
  seller: {
    name: string;
    phone: string;
    verified: boolean;
  };
  views: number;
  publishedAt: string;
  createdAt: string;
  location: string;
  status: 'active' | 'sold' | 'pending' | 'inactive';
}

const ListingDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchListingData(id as string);
    }
  }, [id]);

  const fetchListingData = async (listingId: string) => {
    try {
      setLoading(true);
      console.log('جلب بيانات الإعلان:', listingId);

      // محاولة جلب البيانات من API
      const response = await fetch(`/api/cars/${listingId}`);

      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الإعلان');
      }

      const result = await response.json();

      if (result.success && result.data) {
        // تحويل بيانات السيارة إلى تنسيق الإعلان
        const carData = result.data;
        const listingData: ListingData = {
          id: carData.id,
          title: carData.title,
          price: carData.price?.toString() || '0',
          brand: carData.brand,
          model: carData.model,
          year: carData.year?.toString() || '',
          mileage: carData.mileage?.toString() || '',
          condition: carData.condition || 'مستعمل',
          city: carData.city || carData.location || '',
          description: carData.description || '',
          images:
            carData.images && Array.isArray(carData.images)
              ? carData.images
              : ['/images/placeholder-car.jpg'],
          seller: {
            name: carData.seller?.name || 'غير محدد',
            phone: carData.seller?.phone || carData.contactPhone || '',
            verified: carData.seller?.verified || false,
          },
          views: carData.views || 0,
          publishedAt: carData.createdAt || new Date().toISOString(),
          createdAt: carData.createdAt || new Date().toISOString(),
          location: carData.location || carData.city || 'غير محدد',
          status: carData.status === 'AVAILABLE' ? 'active' : 'inactive',
        };

        setListing(listingData);
        console.log('تم جلب بيانات الإعلان بنجاح:', listingData.title);
      } else {
        throw new Error(result.error || 'فشل في جلب البيانات');
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات الإعلان:', error);

      // في حالة الخطأ، استخدم بيانات وهمية كبديل
      const mockListing: ListingData = {
        id: listingId,
        title: 'إعلان غير متوفر',
        price: '0',
        brand: 'غير محدد',
        model: 'غير محدد',
        year: '',
        mileage: '',
        condition: 'غير محدد',
        city: '',
        description: 'عذراً، لا يمكن عرض تفاصيل هذا الإعلان حالياً.',
        images: ['/images/placeholder-car.jpg'],
        seller: {
          name: 'غير متوفر',
          phone: '',
          verified: false,
        },
        views: 0,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        location: 'غير محدد',
        status: 'inactive',
      };
      setListing(mockListing);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (listing?.seller.phone) {
      window.open(`tel:${listing.seller.phone}`, '_self');
    }
  };

  const handleChat = () => {
    router.push(`/messages?contact=${listing?.seller.name}&listing=${id}`);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('ar-LY').format(Number(price));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-LY');
  };

  // تم إزالة spinner التحميل - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  if (!listing) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">الإعلان غير موجود</h1>
            <p className="mt-2 text-gray-600">لم يتم العثور على الإعلان المطلوب</p>
            <BackButton
              href="/marketplace"
              text="العودة للسوق"
              variant="blue"
              size="md"
              className="mt-4 justify-center border-transparent bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={listing.title} description={listing.description}>
      <Head>
        <title>{listing.title} - سوق مزاد</title>
        <meta name="description" content={listing.description} />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <BackButton onClick={() => router.back()} text="العودة" variant="gray" size="sm" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Images Section */}
            <div className="lg:col-span-2">
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <div className="relative mb-4 h-96 w-full">
                  <Image
                    src={listing.images[currentImageIndex] || '/images/placeholder-car.jpg'}
                    alt={listing.title}
                    fill
                    className="rounded-lg object-cover"
                    onError={() => {
                      console.error('خطأ في تحميل الصورة:', listing.images[currentImageIndex]);
                    }}
                    onLoad={() => {
                      console.log('تم تحميل الصورة بنجاح:', listing.images[currentImageIndex]);
                    }}
                  />
                </div>

                {listing.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {listing.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative h-20 w-20 flex-shrink-0 rounded-lg border-2 ${
                          currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image || '/images/placeholder-car.jpg'}
                          alt={`صورة ${index + 1}`}
                          fill
                          className="rounded-lg object-cover"
                          onError={() => {
                            console.error('خطأ في تحميل الصورة المصغرة:', image);
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-6 rounded-lg bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">الوصف</h3>
                <p className="leading-relaxed text-gray-700">{listing.description}</p>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Main Info */}
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>

                    {/* التاريخ والمدينة */}
                    <DateLocationInfo
                      date={listing.createdAt ? new Date(listing.createdAt) : new Date()}
                      location={listing.location || 'الزاوية'}
                      className="mb-3 mt-2"
                      size="md"
                    />

                    <div className="mt-2 text-3xl font-bold text-blue-600">
                      {formatPrice(listing.price)} د.ل
                    </div>
                  </div>
                  <button
                    onClick={toggleFavorite}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6" />
                    )}
                  </button>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  {listing.status === 'active' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      <CheckCircleIcon className="h-4 w-4" />
                      متاح للبيع
                    </span>
                  )}
                </div>

                {/* Car Details */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الماركة:</span>
                    <span className="font-medium">{listing.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الموديل:</span>
                    <span className="font-medium">{listing.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">السنة:</span>
                    <span className="font-medium">{listing.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الكيلومترات:</span>
                    <span className="font-medium">{formatPrice(listing.mileage)} كم</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحالة:</span>
                    <span className="font-medium">{listing.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المدينة:</span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPinIcon className="h-4 w-4" />
                      {listing.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">معلومات البائع</h3>

                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <span className="font-semibold text-blue-600">
                      {listing.seller.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{listing.seller.name}</span>
                      {listing.seller.verified && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {listing.seller.verified ? 'بائع موثق' : 'بائع'}
                    </div>
                    {listing.seller.phone && (
                      <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4" />
                        <span dir="ltr">{listing.seller.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleContact}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
                  >
                    <PhoneIcon className="h-5 w-5" />
                    <span>اتصال</span>
                  </button>

                  <button
                    onClick={handleChat}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    <span>دردشة</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">إحصائيات الإعلان</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600">
                      <EyeIcon className="h-4 w-4" />
                      المشاهدات
                    </span>
                    <span className="font-medium">{listing.views}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      تاريخ النشر
                    </span>
                    <span className="font-medium">{formatDate(listing.publishedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingDetailPage;

export async function getServerSideProps({ params }: { params: { id: string } }) {
  return {
    redirect: {
      destination: `/marketplace/${params.id}`,
      permanent: false,
    },
  };
}
