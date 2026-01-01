import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClipboardDocumentIcon from '@heroicons/react/24/outline/ClipboardDocumentIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon';
import LightBulbIcon from '@heroicons/react/24/outline/LightBulbIcon';
import MegaphoneIcon from '@heroicons/react/24/outline/MegaphoneIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Layout } from '../../components/common';

// باقات الترويج المتاحة
const PROMOTION_PACKAGES = {
  basic: {
    name: 'الباقة الأساسية',
    price: '10 د.ل',
    days: 7,
    color: 'blue',
    benefits: [
      'ظهور في المقدمة لمدة 7 أيام',
      'شارة "مميز" على إعلانك',
      'زيادة المشاهدات بنسبة 200%',
    ],
  },
  premium: {
    name: 'الباقة المتقدمة',
    price: '20 د.ل',
    days: 14,
    color: 'green',
    popular: true,
    benefits: [
      'ظهور في المقدمة لمدة 14 يوم',
      'شارة "مميز" على إعلانك',
      'زيادة المشاهدات بنسبة 400%',
      'إشعارات للمهتمين',
    ],
  },
  vip: {
    name: 'باقة VIP',
    price: '40 د.ل',
    days: 30,
    color: 'amber',
    benefits: [
      'ظهور في المقدمة لمدة 30 يوم',
      'شارة VIP حصرية',
      'زيادة المشاهدات بنسبة 600%',
      'أولوية في نتائج البحث',
      'دعم فني مميز',
    ],
  },
};

const SuccessPage = () => {
  const router = useRouter();
  const [listingId, setListingId] = useState<string | null>(null);
  const [listingType, setListingType] = useState<string>('instant');
  const [showPromotionCard, setShowPromotionCard] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isViewingListing, setIsViewingListing] = useState(false);
  const [isFromAdminMarketplace, setIsFromAdminMarketplace] = useState(false);
  const [hasPromotion, setHasPromotion] = useState<boolean | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'premium' | 'vip' | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);

  useEffect(() => {
    // التحقق من مصدر الوصول إلى الصفحة
    const referrer = document.referrer;
    const currentPath = window.location.pathname;
    const isFromAdmin =
      referrer.includes('/admin/marketplace/create') ||
      referrer.includes('/admin/marketplace/preview') ||
      localStorage.getItem('adminMarketplaceCreate') === 'true';

    setIsFromAdminMarketplace(isFromAdmin);

    // إعطاء الأولوية لمعرف URL (الأحدث والأدق)
    const { id, type } = router.query;
    if (id && typeof id === 'string') {
      console.log('تم العثور على معرف الإعلان في URL:', id);
      setListingId(id);

      let detectedType = 'marketplace'; // افتراضي

      // إعطاء الأولوية لنوع الإعلان من URL إذا كان متوفراً
      if (type && typeof type === 'string') {
        detectedType = type === 'instant' ? 'marketplace' : type;
      } else {
        // محاولة اكتشاف نوع الإعلان من localStorage
        const savedListingData = localStorage.getItem('publishedListingData');
        const savedListingType = localStorage.getItem('publishedListingType');

        // التحقق من البيانات المحفوظة
        if (savedListingData) {
          try {
            const listingData = JSON.parse(savedListingData);
            if (listingData.id === id && listingData.type) {
              detectedType = listingData.type;
              console.log(
                '[تم بنجاح] تم العثور على نوع الإعلان من البيانات المحفوظة:',
                detectedType,
              );
            }
          } catch (error) {
            console.error('[فشل] خطأ في تحليل بيانات الإعلان:', error);
          }
        } else if (savedListingType) {
          // تصحيح القيم المعروفة
          if (savedListingType === 'instant') {
            detectedType = 'marketplace';
          } else if (savedListingType === 'auction') {
            detectedType = 'auction';
          }
          console.log('[التحرير] تم استخدام نوع الإعلان من localStorage:', detectedType);
        }
      }

      setListingType(detectedType);

      // تحديث localStorage بالمعرف الجديد
      localStorage.setItem('publishedListingId', id);
      localStorage.setItem('publishedListingType', detectedType);

      console.log('[الأدوات] معلومات الإعلان النهائية:', {
        id: id,
        type: detectedType,
        source: 'URL parameter (priority)',
        urlType: type,
        willRedirectTo: detectedType === 'auction' ? 'auction page' : 'marketplace page',
      });

      return;
    }

    // إذا لم يكن هناك معرف في URL، استخدم localStorage كبديل

    const savedListingData = localStorage.getItem('publishedListingData');
    if (savedListingData) {
      try {
        const listingData = JSON.parse(savedListingData);

        if (listingData.id && listingData.type) {
          setListingId(listingData.id);
          setListingType(listingData.type);

          // تحديث URL لتتضمن معرف الإعلان
          router.replace(`/add-listing/success?id=${listingData.id}`, undefined, { shallow: true });
          return;
        }
      } catch (error) {
        console.error('[فشل] خطأ في تحليل بيانات الإعلان:', error);
      }
    }

    // استرجاع معرف الإعلان المنشور (الطريقة القديمة)
    const savedListingId = localStorage.getItem('publishedListingId');
    const savedListingType = localStorage.getItem('publishedListingType');

    if (savedListingId) {
      console.log('Found saved listing ID:', savedListingId);
      setListingId(savedListingId);

      // تصحيح نوع الإعلان
      let correctedListingType = savedListingType;
      if (savedListingType === 'instant') {
        correctedListingType = 'marketplace';
      } else if (
        !savedListingType ||
        savedListingType === 'undefined' ||
        savedListingType === 'null'
      ) {
        correctedListingType = 'marketplace';
      }

      setListingType(correctedListingType || 'marketplace');
      console.log('تم تصحيح نوع الإعلان:', {
        original: savedListingType,
        corrected: correctedListingType,
      });

      // تحديث URL لتتضمن معرف الإعلان
      router.replace(`/add-listing/success?id=${savedListingId}`, undefined, {
        shallow: true,
      });
    } else {
      console.error('[فشل] لم يتم العثور على معرف الإعلان في أي مكان');
      setListingId(null);

      // إذا لم نجد أي معرف، نوجه المستخدم إلى الصفحة الرئيسية
      console.log('[التحديث] توجيه إلى الصفحة الرئيسية بسبب عدم وجود معرف إعلان');
      setTimeout(() => {
        router.push('/');
      }, 3000); // انتظار 3 ثوان لإعطاء المستخدم فرصة لقراءة الرسالة
    }
  }, [router.query, router]);

  // دالة للتحقق من نوع الإعلان من API إذا لم تكن واضحة
  const detectListingType = async (id: string): Promise<string> => {
    try {
      console.log('[التحقق] بدء اكتشاف نوع الإعلان للمعرف:', id);

      // محاولة التحقق من وجود الإعلان في المزادات أولاً
      const auctionResponse = await fetch(`/api/auctions/${id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (auctionResponse.ok) {
        const auctionData = await auctionResponse.json();
        if (auctionData.success && auctionData.data) {
          console.log('[نجح] تم العثور على الإعلان في المزادات');
          return 'auction';
        }
      }

      // إذا لم يكن مزاد، تحقق من السوق الفوري
      const carResponse = await fetch(`/api/cars/${id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (carResponse.ok) {
        const carData = await carResponse.json();
        if (carData.success && carData.data) {
          console.log('[نجح] تم العثور على الإعلان في السوق الفوري');
          return 'marketplace';
        }
      }

      console.log('[افتراضي] لم يتم العثور على الإعلان، استخدام القيمة الافتراضية');
      return 'marketplace'; // افتراضي
    } catch (error) {
      console.error('[فشل] خطأ في اكتشاف نوع الإعلان:', error);
      return 'marketplace'; // افتراضي
    }
  };

  const handleViewListing = async () => {
    if (!listingId) {
      console.error('[فشل] لا يوجد معرف إعلان للعرض');

      // محاولة استرجاع المعرف من localStorage كحل احتياطي
      const savedListingId = localStorage.getItem('publishedListingId');
      const savedListingData = localStorage.getItem('publishedListingData');

      if (savedListingId) {
        console.log('[التحديث] محاولة استخدام معرف الإعلان من localStorage:', savedListingId);
        setListingId(savedListingId);

        // محاولة استرجاع نوع الإعلان أيضاً
        if (savedListingData) {
          try {
            const listingData = JSON.parse(savedListingData);
            if (listingData.type) {
              setListingType(listingData.type);
            }
          } catch (error) {
            console.error('[فشل] خطأ في تحليل بيانات الإعلان:', error);
          }
        }

        // إعادة استدعاء الدالة مع المعرف الجديد
        setTimeout(() => handleViewListing(), 100);
        return;
      }

      alert('عذراً، لا يمكن العثور على معرف الإعلان. سيتم توجيهك إلى الصفحة الرئيسية.');

      // توجيه إلى الصفحة الرئيسية بدلاً من add-listing
      router.push('/');
      return;
    }

    setIsViewingListing(true);

    // تشخيص مفصل للقيم

    console.log(
      '- localStorage publishedListingType:',
      localStorage.getItem('publishedListingType'),
    );
    console.log('- localStorage publishedListingId:', localStorage.getItem('publishedListingId'));

    try {
      // التحقق من نوع الإعلان إذا لم يكن واضحاً
      let finalListingType = listingType;

      if (
        !listingType ||
        listingType === 'undefined' ||
        listingType === 'null' ||
        listingType === 'instant'
      ) {
        console.log('[التحقق] نوع الإعلان غير واضح، بدء اكتشاف النوع...');
        finalListingType = await detectListingType(listingId);
        setListingType(finalListingType);

        // حفظ النوع المكتشف
        localStorage.setItem('publishedListingType', finalListingType);
        console.log('[محفوظ] تم حفظ نوع الإعلان المكتشف:', finalListingType);
      }

      // تحديد المسار بناءً على نوع الإعلان النهائي
      let targetPath = '';

      if (finalListingType === 'auction') {
        targetPath = `/auction/${listingId}`;
      } else {
        // جميع الأنواع الأخرى (marketplace, instant, undefined) تذهب للسوق الفوري
        targetPath = `/marketplace/${listingId}`;
      }

      await router.push(targetPath);

      // تنظيف البيانات المؤقتة بعد التوجيه الناجح
      localStorage.removeItem('publishedListingId');
      localStorage.removeItem('publishedListingType');
      localStorage.removeItem('publishedListingData');
    } catch (error) {
      console.error('[فشل] خطأ في التوجيه المباشر:', error);
      setIsViewingListing(false);

      // في حالة فشل التوجيه المباشر، نحاول التحقق من وجود الإعلان أولاً
      try {
        const checkUrl =
          listingType === 'auction' ? `/api/auctions/${listingId}` : `/api/cars/${listingId}`;

        const response = await fetch(checkUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          // محاولة التوجيه مرة أخرى
          if (listingType === 'auction') {
            router.push(`/auction/${listingId}`);
          } else {
            router.push(`/marketplace/${listingId}`);
          }
        } else {
          console.error('[فشل] الإعلان غير موجود:', result);
          alert('عذراً، لا يمكن العثور على الإعلان. قد يكون هناك خطأ في النشر.');

          // توجيه إلى الصفحة الرئيسية للسوق المناسب
          if (listingType === 'auction') {
            router.push('/auctions');
          } else {
            router.push('/marketplace');
          }
        }
      } catch (checkError) {
        console.error('[فشل] خطأ في التحقق من وجود الإعلان:', checkError);
        alert('حدث خطأ أثناء محاولة عرض الإعلان. سيتم توجيهك إلى الصفحة الرئيسية.');

        // توجيه إلى الصفحة الرئيسية للسوق المناسب
        if (listingType === 'auction') {
          router.push('/auctions');
        } else {
          router.push('/marketplace');
        }
      }
    }
  };

  const handleShare = () => {
    if (!listingId) {
      console.error('[فشل] لا يوجد معرف إعلان للمشاركة');
      alert('عذراً، لا يمكن مشاركة الإعلان. معرف الإعلان غير متوفر.');
      return;
    }

    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    if (!listingId) {
      console.error('[فشل] لا يوجد معرف إعلان لنسخ الرابط');
      alert('عذراً، لا يمكن نسخ رابط الإعلان. معرف الإعلان غير متوفر.');
      return;
    }

    try {
      // إنشاء الرابط الصحيح حسب نوع الإعلان
      const basePath = listingType === 'auction' ? '/auction' : '/marketplace';
      const listingUrl = `${window.location.origin}${basePath}/${listingId}`;

      await navigator.clipboard.writeText(listingUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('[فشل] فشل في نسخ الرابط:', err);

      // محاولة بديلة للنسخ
      try {
        const basePath = listingType === 'auction' ? '/auction' : '/marketplace';
        const listingUrl = `${window.location.origin}${basePath}/${listingId}`;

        // إنشاء عنصر input مؤقت للنسخ
        const tempInput = document.createElement('input');
        tempInput.value = listingUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('[فشل] فشل في النسخ بالطريقة البديلة:', fallbackErr);
        alert('عذراً، فشل في نسخ الرابط. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const handleWhatsAppShare = () => {
    if (!listingId) {
      console.error('[فشل] لا يوجد معرف إعلان للمشاركة على واتساب');
      alert('عذراً، لا يمكن مشاركة الإعلان. معرف الإعلان غير متوفر.');
      return;
    }

    try {
      // إنشاء الرابط الصحيح حسب نوع الإعلان
      const basePath = listingType === 'auction' ? '/auction' : '/marketplace';
      const listingUrl = `${window.location.origin}${basePath}/${listingId}`;
      const message = `شاهد هذا الإعلان الرائع على سوق مزاد: ${listingUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('[فشل] خطأ في مشاركة واتساب:', error);
      alert('عذراً، حدث خطأ أثناء المشاركة على واتساب.');
    }
  };

  const handleTelegramShare = () => {
    if (!listingId) {
      console.error('[فشل] لا يوجد معرف إعلان للمشاركة على تيليجرام');
      alert('عذراً، لا يمكن مشاركة الإعلان. معرف الإعلان غير متوفر.');
      return;
    }

    try {
      // إنشاء الرابط الصحيح حسب نوع الإعلان
      const basePath = listingType === 'auction' ? '/auction' : '/marketplace';
      const listingUrl = `${window.location.origin}${basePath}/${listingId}`;
      const message = `شاهد هذا الإعلان الرائع على سوق مزاد: ${listingUrl}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(listingUrl)}&text=${encodeURIComponent(message)}`;

      window.open(telegramUrl, '_blank');
    } catch (error) {
      console.error('[فشل] خطأ في مشاركة تيليجرام:', error);
      alert('عذراً، حدث خطأ أثناء المشاركة على تيليجرام.');
    }
  };

  // التحقق من حالة الترويج للإعلان
  useEffect(() => {
    const checkPromotionStatus = async () => {
      if (!listingId) return;

      try {
        // محاولة جلب بيانات الإعلان
        const endpoint =
          listingType === 'auction' ? `/api/auctions/${listingId}` : `/api/cars/${listingId}`;
        const response = await fetch(endpoint);

        if (response.ok) {
          const data = await response.json();
          const listing = data.data || data;

          // التحقق من وجود باقة ترويج
          const hasPaidPromotion =
            listing.featured === true ||
            (listing.promotionPackage && listing.promotionPackage !== 'free') ||
            listing.promotionDays > 0;

          setHasPromotion(hasPaidPromotion);
          console.log('[ترويج] حالة الترويج:', { hasPaidPromotion, listing });
        } else {
          // إذا فشل الطلب، افترض عدم وجود ترويج
          setHasPromotion(false);
        }
      } catch (error) {
        console.error('[فشل] خطأ في التحقق من حالة الترويج:', error);
        setHasPromotion(false);
      }
    };

    checkPromotionStatus();
  }, [listingId, listingType]);

  // معالجة اختيار باقة الترويج
  const handleSelectPackage = async (packageType: 'basic' | 'premium' | 'vip') => {
    if (!listingId) return;

    setSelectedPackage(packageType);
    setIsPromoting(true);

    try {
      // توجيه لصفحة الدفع مع بيانات الباقة
      const pkg = PROMOTION_PACKAGES[packageType];
      router.push(
        `/promote/${listingId}?package=${packageType}&type=${listingType}&days=${pkg.days}&price=${encodeURIComponent(pkg.price)}`,
      );
    } catch (error) {
      console.error('[فشل] خطأ في اختيار الباقة:', error);
      setIsPromoting(false);
    }
  };

  if (!listingId) {
    return (
      <Layout>
        <div className="flex min-h-screen select-none items-center justify-center bg-gray-50">
          <div className="mx-auto max-w-md p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">خطأ في عرض الإعلان</h2>
            <p className="mb-6 text-gray-600">
              عذراً، لا يمكن العثور على معرف الإعلان. قد يكون هناك خطأ في عملية النشر.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/add-listing')}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                إنشاء إعلان جديد
              </button>
              <button
                onClick={() => router.push('/marketplace')}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                العودة للسوق الفوري
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="تم نشر الإعلان بنجاح!" description="تم نشر إعلان سيارتك بنجاح">
      <Head>
        <title>تم نشر الإعلان بنجاح!</title>
      </Head>

      <div className="min-h-screen select-none bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mb-2 flex items-center justify-center gap-3 text-3xl font-bold text-gray-900">
              <span>تم نشر إعلانك بنجاح!</span>
              <SparklesIcon className="h-8 w-8 text-yellow-500" />
            </h1>
            <p className="text-lg text-gray-600">
              إعلانك الآن مرئي لجميع المستخدمين ويمكن للمهتمين التواصل معك
            </p>
            {listingId && (
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p>معرف الإعلان: {listingId}</p>
                <p>نوع الإعلان: {listingType === 'auction' ? 'مزاد' : 'سوق فوري'}</p>
              </div>
            )}

            {/* معلومات تشخيصية في حالة عدم وجود معرف */}
            {!listingId && (
              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">تحذير: معرف الإعلان غير متوفر</span>
                </div>
                <p className="mt-2 text-sm text-yellow-700">
                  قد يكون هناك خطأ في عملية النشر. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => router.push('/add-listing')}
                    className="flex items-center justify-center gap-2 rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 transition-colors hover:bg-yellow-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    إضافة إعلان جديد
                  </button>
                  <button
                    onClick={() => router.push('/marketplace')}
                    className="flex items-center justify-center gap-2 rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 transition-colors hover:bg-yellow-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                      />
                    </svg>
                    تصفح السوق
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ⭐ بطاقات الترويج - تظهر في الأعلى مباشرة بعد رسالة النجاح */}
          {showPromotionCard && hasPromotion === false && (
            <div className="relative mb-6 overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 shadow-lg">
              <button
                onClick={() => setShowPromotionCard(false)}
                className="absolute left-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              {/* العنوان */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg">
                  <TrophyIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  🚀 اجعل إعلانك من الأوائل!
                </h3>
                <p className="text-gray-600">
                  روّج لإعلانك واحصل على مشاهدات أكثر بـ 5 مرات ومبيعات أسرع
                </p>
              </div>

              {/* باقات الترويج */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* الباقة الأساسية */}
                <div
                  onClick={() => !isPromoting && handleSelectPackage('basic')}
                  className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-300 ${
                    selectedPackage === 'basic'
                      ? 'scale-[1.02] border-blue-500 bg-blue-50 shadow-lg shadow-blue-200'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <StarIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {PROMOTION_PACKAGES.basic.price}
                    </span>
                  </div>
                  <h4 className="mb-1 text-lg font-bold text-gray-900">
                    {PROMOTION_PACKAGES.basic.name}
                  </h4>
                  <p className="mb-3 text-sm text-gray-500">{PROMOTION_PACKAGES.basic.days} أيام</p>
                  <ul className="space-y-2">
                    {PROMOTION_PACKAGES.basic.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* الباقة المتقدمة - الأكثر طلباً */}
                <div
                  onClick={() => !isPromoting && handleSelectPackage('premium')}
                  className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-300 ${
                    selectedPackage === 'premium'
                      ? 'scale-[1.02] border-green-500 bg-green-50 shadow-lg shadow-green-200'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-4 py-1 text-xs font-bold text-white shadow-lg">
                    ⭐ الأكثر طلباً
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <SparklesIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {PROMOTION_PACKAGES.premium.price}
                    </span>
                  </div>
                  <h4 className="mb-1 text-lg font-bold text-gray-900">
                    {PROMOTION_PACKAGES.premium.name}
                  </h4>
                  <p className="mb-3 text-sm text-gray-500">
                    {PROMOTION_PACKAGES.premium.days} يوم
                  </p>
                  <ul className="space-y-2">
                    {PROMOTION_PACKAGES.premium.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* باقة VIP */}
                <div
                  onClick={() => !isPromoting && handleSelectPackage('vip')}
                  className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-300 ${
                    selectedPackage === 'vip'
                      ? 'scale-[1.02] border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-200'
                      : 'border-gray-200 bg-gradient-to-br from-white to-amber-50/50 hover:border-amber-300 hover:shadow-md'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-amber-400 to-orange-500">
                      <TrophyIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-amber-600">
                      {PROMOTION_PACKAGES.vip.price}
                    </span>
                  </div>
                  <h4 className="mb-1 text-lg font-bold text-gray-900">
                    {PROMOTION_PACKAGES.vip.name}
                  </h4>
                  <p className="mb-3 text-sm text-gray-500">{PROMOTION_PACKAGES.vip.days} يوم</p>
                  <ul className="space-y-2">
                    {PROMOTION_PACKAGES.vip.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* رسالة تحميل عند اختيار باقة */}
              {isPromoting && (
                <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />
                  <span>جاري التوجيه لصفحة الدفع...</span>
                </div>
              )}
            </div>
          )}

          {/* رسالة للإعلان المروج بالفعل */}
          {hasPromotion === true && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800">إعلانك مُروّج بالفعل! ✨</h4>
                <p className="text-sm text-green-600">
                  إعلانك يظهر في المقدمة ويحصل على مشاهدات إضافية
                </p>
              </div>
            </div>
          )}

          {/* Listing Info Card */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">معلومات الإعلان</h2>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                منشور
              </span>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <div className="mb-1 text-2xl font-bold text-blue-600">#{listingId}</div>
                <div className="text-sm text-gray-500">رقم الإعلان</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <div className="mb-1 text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-500">المشاهدات</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <div className="mb-1 text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-gray-500">الاستفسارات</div>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleViewListing}
                disabled={!listingId || isViewingListing}
                className={`flex flex-1 transform items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300 ${
                  listingId && !isViewingListing
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl active:scale-95'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
                title={
                  !listingId
                    ? 'معرف الإعلان غير متوفر'
                    : isViewingListing
                      ? 'جاري التحقق من الإعلان...'
                      : 'انقر لعرض الإعلان'
                }
              >
                {isViewingListing ? (
                  <>
                    <div className="border-3 h-6 w-6 animate-spin rounded-full border-white border-t-transparent"></div>
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <EyeIcon className="h-6 w-6" />
                    <span>عرض الإعلان</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                disabled={!listingId}
                className={`flex flex-1 transform items-center justify-center gap-3 rounded-xl border-2 px-8 py-4 text-lg font-semibold transition-all duration-300 ${
                  listingId
                    ? 'border-gray-300 bg-white text-gray-700 hover:scale-105 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 hover:shadow-xl active:scale-95'
                    : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                }`}
                title={listingId ? 'انقر لمشاركة الإعلان' : 'معرف الإعلان غير متوفر'}
              >
                <ShareIcon className="h-6 w-6" />
                <span>مشاركة</span>
              </button>
            </div>

            {/* Additional Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push('/add-listing')}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-3 font-medium text-gray-600 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>إضافة إعلان جديد</span>
              </button>

              <button
                onClick={() => router.push('/marketplace')}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-600 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
                <span>العودة للسوق</span>
              </button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">الخطوات التالية</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-lg bg-blue-50 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                  <ChartBarIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 font-medium text-gray-900">راقب أداء إعلانك</h4>
                  <p className="text-sm text-gray-600">
                    تابع عدد المشاهدات والاستفسارات من لوحة التحكم
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg bg-green-50 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                  <ClockIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 font-medium text-gray-900">رد على الاستفسارات بسرعة</h4>
                  <p className="text-sm text-gray-600">
                    الرد السريع يزيد من فرص البيع ويبني الثقة مع المشترين
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg bg-orange-50 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600">
                  <MegaphoneIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 font-medium text-gray-900">فكر في الترويج</h4>
                  <p className="text-sm text-gray-600">
                    الإعلانات المروجة تحصل على مشاهدات أكثر بـ 5 مرات
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* زر العودة للإدارة - يظهر فقط إذا جاء من صفحة إدارة السوق الفوري */}
            {isFromAdminMarketplace && (
              <Link
                href="/admin/marketplace"
                className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
                onClick={() => {
                  // تنظيف العلامة من localStorage
                  localStorage.removeItem('adminMarketplaceCreate');
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                  />
                </svg>
                <span>العودة لقسم إدارة السوق</span>
              </Link>
            )}

            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <HomeIcon className="h-5 w-5" />
              <span>العودة للرئيسية</span>
            </Link>

            <Link
              href={
                isFromAdminMarketplace ? '/admin/marketplace/create?type=instant' : '/add-listing'
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
              <span>إضافة إعلان آخر</span>
            </Link>

            {!isFromAdminMarketplace && (
              <Link
                href="/my-account/listings"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600"
              >
                <EyeIcon className="h-5 w-5" />
                <span>إدارة إعلاناتي</span>
              </Link>
            )}
          </div>

          {/* Tips */}
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-4 flex items-center gap-2 font-medium text-blue-900">
              <LightBulbIcon className="h-5 w-5 text-yellow-600" />
              <span>نصائح لبيع أسرع:</span>
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <CameraIcon className="h-4 w-4 text-blue-600" />
                <span>أضف صوراً واضحة وعالية الجودة</span>
              </li>
              <li className="flex items-center gap-2">
                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                <span>اكتب وصفاً مفصلاً وصادقاً</span>
              </li>
              <li className="flex items-center gap-2">
                <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                <span>حدد سعراً تنافسياً</span>
              </li>
              <li className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-600" />
                <span>رد على الاستفسارات خلال ساعات قليلة</span>
              </li>
              <li className="flex items-center gap-2">
                <TrophyIcon className="h-4 w-4 text-blue-600" />
                <span>فكر في ترويج إعلانك للوصول لعدد أكبر من المشترين</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">مشاركة الإعلان</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-right transition-all duration-200 hover:border-green-300 hover:bg-green-50 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 shadow-lg">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">واتساب</div>
                  <div className="text-sm text-gray-500">مشاركة عبر واتساب</div>
                </div>
              </button>

              {/* Telegram */}
              <button
                onClick={handleTelegramShare}
                className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-right transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 shadow-lg">
                  <ShareIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">تليجرام</div>
                  <div className="text-sm text-gray-500">مشاركة عبر تليجرام</div>
                </div>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-right transition-all duration-200 hover:shadow-md ${
                  copySuccess
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg ${
                    copySuccess ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  <ClipboardDocumentIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {copySuccess ? 'تم النسخ!' : 'نسخ الرابط'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {copySuccess ? 'تم نسخ الرابط بنجاح' : 'نسخ رابط الإعلان'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SuccessPage;
