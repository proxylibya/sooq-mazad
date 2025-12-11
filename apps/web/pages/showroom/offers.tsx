import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout } from '../../components/common';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import TagIcon from '@heroicons/react/24/outline/TagIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import GiftIcon from '@heroicons/react/24/outline/GiftIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';

interface Offer {
  id: string;
  title: string;
  type: 'discount' | 'special' | 'seasonal';
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  endDate: string;
  discountPercentage?: string;
  views: number;
  clicks: number;
  createdAt: string;
}

const ShowroomOffersPage = () => {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Check for success message
    if (router.query.success === 'true') {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }

    // Load mock offers data
    const mockOffers: Offer[] = [
      {
        id: '1',
        title: 'خصم 20% على جميع سيارات BMW',
        type: 'discount',
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        discountPercentage: '20',
        views: 1250,
        clicks: 89,
        createdAt: '2024-01-10',
      },
      {
        id: '2',
        title: 'عرض خاص - ضمان ممتد مجاني',
        type: 'special',
        status: 'active',
        startDate: '2024-01-20',
        endDate: '2024-03-20',
        views: 890,
        clicks: 45,
        createdAt: '2024-01-18',
      },
      {
        id: '3',
        title: 'عرض رمضان - خصم 15%',
        type: 'seasonal',
        status: 'expired',
        startDate: '2023-12-01',
        endDate: '2023-12-31',
        discountPercentage: '15',
        views: 2100,
        clicks: 156,
        createdAt: '2023-11-25',
      },
    ];

    setOffers(mockOffers);
  }, [router.query]);

  const getOfferTypeInfo = (type: string) => {
    switch (type) {
      case 'discount':
        return {
          title: 'عرض خصم',
          icon: <TagIcon className="h-5 w-5 text-red-600" />,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
        };
      case 'special':
        return {
          title: 'عرض خاص',
          icon: <SparklesIcon className="h-5 w-5 text-purple-600" />,
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
        };
      case 'seasonal':
        return {
          title: 'عرض موسمي',
          icon: <GiftIcon className="h-5 w-5 text-green-600" />,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
        };
      default:
        return {
          title: 'عرض',
          icon: <TagIcon className="h-5 w-5 text-blue-600" />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
        };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          title: 'نشط',
          icon: <CheckCircleIcon className="h-4 w-4 text-green-600" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
        };
      case 'inactive':
        return {
          title: 'غير نشط',
          icon: <XCircleIcon className="h-4 w-4 text-gray-600" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
        };
      case 'expired':
        return {
          title: 'منتهي',
          icon: <ClockIcon className="h-4 w-4 text-red-600" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
        };
      default:
        return {
          title: 'غير محدد',
          icon: <ClockIcon className="h-4 w-4 text-gray-600" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddOffer = () => {
    router.push('/showroom/add-offer');
  };

  const handleEditOffer = (offerId: string) => {
    // In a real app, you would load the offer data and redirect to edit page
  };

  const handleDeleteOffer = (offerId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العرض؟')) {
      setOffers((prev) => prev.filter((offer) => offer.id !== offerId));
    }
  };

  const activeOffers = offers.filter((offer) => offer.status === 'active');
  const totalViews = offers.reduce((sum, offer) => sum + offer.views, 0);
  const totalClicks = offers.reduce((sum, offer) => sum + offer.clicks, 0);

  return (
    <Layout title="إدارة العروض - معرض السيارات" description="إدارة عروض معرض السيارات">
      <Head>
        <title>إدارة العروض - معرض السيارات</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-100 p-4">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  تم نشر العرض بنجاح! سيظهر للعملاء خلال دقائق.
                </span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة العروض</h1>
              <p className="mt-2 text-gray-600">إدارة عروض معرضك وتتبع أدائها</p>
            </div>

            <button
              onClick={handleAddOffer}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
            >
              <PlusIcon className="h-5 w-5" />
              <span>إضافة عرض جديد</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <TagIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{offers.length}</div>
                  <div className="text-sm text-gray-600">إجمالي العروض</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{activeOffers.length}</div>
                  <div className="text-sm text-gray-600">العروض النشطة</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-2">
                  <EyeIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalViews.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">إجمالي المشاهدات</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2">
                  <CalendarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalClicks}</div>
                  <div className="text-sm text-gray-600">إجمالي النقرات</div>
                </div>
              </div>
            </div>
          </div>

          {/* Offers List */}
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900">قائمة العروض</h2>
            </div>

            {offers.length === 0 ? (
              <div className="p-12 text-center">
                <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">لا توجد عروض</h3>
                <p className="mt-2 text-gray-600">ابدأ بإنشاء عرضك الأول لجذب المزيد من العملاء</p>
                <button
                  onClick={handleAddOffer}
                  className="mt-4 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                >
                  إضافة عرض جديد
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {offers.map((offer) => {
                  const typeInfo = getOfferTypeInfo(offer.type);
                  const statusInfo = getStatusInfo(offer.status);

                  return (
                    <div key={offer.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${typeInfo.bgColor} ${typeInfo.textColor}`}
                            >
                              {typeInfo.icon}
                              {typeInfo.title}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
                            >
                              {statusInfo.icon}
                              {statusInfo.title}
                            </span>
                          </div>

                          <div className="grid gap-4 text-sm text-gray-600 md:grid-cols-4">
                            <div>
                              <span className="font-medium">فترة العرض:</span>
                              <div>
                                {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                              </div>
                            </div>

                            {offer.discountPercentage && (
                              <div>
                                <span className="font-medium">نسبة الخصم:</span>
                                <div className="font-semibold text-red-600">
                                  {offer.discountPercentage}%
                                </div>
                              </div>
                            )}

                            <div>
                              <span className="font-medium">المشاهدات:</span>
                              <div>{offer.views.toLocaleString()}</div>
                            </div>

                            <div>
                              <span className="font-medium">النقرات:</span>
                              <div>{offer.clicks}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditOffer(offer.id)}
                            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
                            title="تعديل العرض"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="rounded-lg border border-red-300 bg-white p-2 text-red-600 hover:bg-red-50"
                            title="حذف العرض"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShowroomOffersPage;
