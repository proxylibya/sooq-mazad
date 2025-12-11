import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Layout } from '../../components/common';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import LinkIcon from '@heroicons/react/24/outline/LinkIcon';
import ClipboardDocumentIcon from '@heroicons/react/24/outline/ClipboardDocumentIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import ShareModal from '../../components/ShareModal';

const ShowroomSuccessPage = () => {
  const router = useRouter();
  const [copySuccess, setCopySuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const { id } = router.query;
  const showroomUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/showrooms/${id || '1'}`;

  // دالة لإظهار الإشعارات
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'success', message: '' });
    }, 3000);
  };

  useEffect(() => {
    // إضافة تأثير الاحتفال
    const timer = setTimeout(() => {
      // يمكن إضافة تأثيرات بصرية هنا
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCopyLink = async () => {
    try {
      // التحقق من دعم Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(showroomUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        showNotification('success', 'تم نسخ رابط المعرض بنجاح');
      } else {
        // Fallback للمتصفحات القديمة أو غير الآمنة
        const textArea = document.createElement('textarea');
        textArea.value = showroomUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
            showNotification('success', 'تم نسخ رابط المعرض بنجاح');
            console.log('تم نسخ الرابط:', showroomUrl);
          } else {
            throw new Error('فشل في تنفيذ أمر النسخ');
          }
        } catch (fallbackErr) {
          console.error('فشل في نسخ الرابط (fallback):', fallbackErr);
          showNotification('error', 'فشل في نسخ الرابط. يرجى نسخه يدوياً');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('فشل في نسخ الرابط:', err);
      showNotification('error', 'فشل في نسخ الرابط. يرجى المحاولة مرة أخرى');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const quickActions = [
    {
      title: 'إضافة المركبات للمعرض',
      icon: <PlusIcon className="h-5 w-5" />,
      link: `/showroom/add-vehicle/${id || '1'}`,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'مشاهدة المعرض',
      icon: <EyeIcon className="h-5 w-5" />,
      link: `/showrooms/${id || '1'}`,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'لوحة التحكم',
      icon: <CogIcon className="h-5 w-5" />,
      link: '/showroom/dashboard',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  const otherListings = [
    {
      id: 1,
      title: 'تويوتا كامري 2020',
      price: '45,000',
      image: '/images/cars/camry.jpg',
      location: 'طرابلس',
      views: 234,
      likes: 12,
    },
    {
      id: 2,
      title: 'هوندا أكورد 2019',
      price: '38,000',
      image: '/images/cars/accord.jpg',
      location: 'بنغازي',
      views: 189,
      likes: 8,
    },
    {
      id: 3,
      title: 'نيسان التيما 2021',
      price: '52,000',
      image: '/images/cars/altima.jpg',
      location: 'مصراتة',
      views: 156,
      likes: 15,
    },
  ];

  return (
    <Layout title="تم إنشاء المعرض بنجاح!" description="تهانينا! تم إنشاء معرضك بنجاح">
      <Head>
        <title>تم إنشاء المعرض بنجاح!</title>
      </Head>

      {/* Notification */}
      {notification.show && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 ${
              notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Success Header - Compact */}
          <div className="mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">تم إنشاء معرضك بنجاح!</h1>
            <p className="text-gray-600">معرضك الآن جاهز ومتاح للعملاء</p>
          </div>

          {/* Share and Copy Section */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">رابط معرضك</h3>
                <p className="truncate text-xs text-gray-500">{showroomUrl}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700 active:scale-95"
                  title="مشاركة رابط المعرض"
                >
                  <ShareIcon className="h-4 w-4" />
                  <span>مشاركة</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${
                    copySuccess
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  title={copySuccess ? 'تم نسخ الرابط بنجاح' : 'نسخ رابط المعرض'}
                >
                  {copySuccess ? (
                    <CheckCircleIcon className="h-4 w-4" />
                  ) : (
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  )}
                  <span>{copySuccess ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions - Small Cards */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">إجراءات سريعة</h3>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.link}
                  className={`flex flex-col items-center gap-2 rounded-lg p-3 text-white transition-all duration-200 hover:scale-105 hover:shadow-md ${action.color}`}
                >
                  {action.icon}
                  <span className="text-center text-xs font-medium">{action.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Other Listings Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">إعلانات أخرى قد تهمك</h3>
              <Link
                href="/marketplace"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                عرض المزيد
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {otherListings.map((listing) => (
                <div
                  key={listing.id}
                  className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-gray-200">
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <span className="text-sm">صورة السيارة</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {listing.title}
                    </h4>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-green-600">{listing.price} د.ل</span>
                      <span className="text-gray-500">{listing.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-3 w-3" />
                        <span>{listing.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HeartIcon className="h-3 w-3" />
                        <span>{listing.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/add-listing"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
                <span>أضف إعلانك الآن</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* نافذة المشاركة */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="معرضي الجديد"
        description="شاهد معرضي الجديد للسيارات واستكشف أحدث العروض والمركبات المتاحة"
        url={showroomUrl}
      />
    </Layout>
  );
};

export default ShowroomSuccessPage;
