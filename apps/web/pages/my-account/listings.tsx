import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../../components/common';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/outline';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import MegaphoneIcon from '@heroicons/react/24/outline/MegaphoneIcon';

interface Listing {
  id: string;
  title: string;
  image: string;
  location: string;
  date: string;
  status: 'active' | 'expired' | 'pending';
  views: number;
  favorites: number;
  price: string | number;
}

const MyListingsPage = () => {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // تحميل إعلانات المستخدم من قاعدة البيانات
  const loadUserListings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/listings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // تحويل البيانات للتنسيق المطلوب
        const convertedListings = data.data.listings.map((listing: any) => ({
          id: listing.id,
          title: listing.title,
          image: listing.image || '/images/car-placeholder.jpg',
          location: listing.location,
          date: new Date(listing.createdAt).toLocaleDateString('ar-LY'),
          status:
            listing.status === 'AVAILABLE'
              ? 'active'
              : listing.status === 'SOLD'
                ? 'expired'
                : 'pending',
          views: listing.views || 0,
          favorites: 0, // مؤقتاً
          price: listing.price,
        }));

        setListings(convertedListings);
      } else {
        console.error('فشل في جلب الإعلانات:', data.error);
        setListings([]);
      }
    } catch (error) {
      console.error('خطأ في جلب الإعلانات:', error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserListings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'pending':
        return 'نشط';
      case 'expired':
        return 'منتهي الصلاحية';
      default:
        return 'غير محدد';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'expired':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const filteredListings = listings.filter((listing) =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleView = (id: string) => {
    router.push(`/listing/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/add-listing/edit/${id}`);
  };

  const handlePromote = (id: string) => {
    router.push(`/promote-listing/${id}`);
  };

  const handleDelete = (listing: Listing) => {
    setSelectedListing(listing);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedListing) {
      setListings(listings.filter((l) => l.id !== selectedListing.id));
      setShowDeleteModal(false);
      setSelectedListing(null);
    }
  };

  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (isLoading) return null;

  return (
    <Layout title="إدارة الإعلانات" description="إدارة جميع إعلاناتك">
      <Head>
        <title>إعلاناتي - مزاد السيارات</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* رأس الصفحة */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">إدارة الإعلانات</h1>
              <p className="text-gray-600">إدارة جميع إعلاناتك ومتابعة أدائها</p>
            </div>
            <Link
              href="/add-listing"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
              <span>إضافة إعلان جديد</span>
            </Link>
          </div>

          {/* شريط البحث */}
          <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في إعلاناتك..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-4 pr-12 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* قائمة الإعلانات */}
          <div className="space-y-6">
            {filteredListings.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-lg">
                <EyeIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد إعلانات</h3>
                <p className="mb-6 text-gray-600">
                  {searchTerm ? 'لا توجد إعلانات تطابق البحث' : 'لم تقم بإضافة أي إعلانات بعد'}
                </p>
              </div>
            ) : (
              filteredListings.map((listing) => (
                <div key={listing.id} className="overflow-hidden rounded-xl bg-white shadow-lg">
                  <div className="flex flex-col lg:flex-row">
                    {/* صورة الإعلان */}
                    <div className="flex-shrink-0 lg:h-48 lg:w-64">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="h-48 w-full object-cover lg:h-full"
                      />
                    </div>

                    {/* معلومات الإعلان */}
                    <div className="flex-1 p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="mb-2 text-xl font-semibold text-gray-900">
                            {listing.title}
                          </h3>
                          <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
                            <span>{listing.location}</span>
                            <span>•</span>
                            <span>{listing.date}</span>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(listing.status)}`}
                        >
                          {getStatusIcon(listing.status)}
                          {getStatusText(listing.status)}
                        </div>
                      </div>

                      <div className="mb-6 flex items-center justify-between">
                        <div className="text-2xl font-bold text-blue-600">{listing.price}</div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <EyeIcon className="h-4 w-4" />
                            <span>{listing.views} مشاهدة</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            <span>{listing.favorites} مفضلة</span>
                          </div>
                        </div>
                      </div>

                      {/* أزرار الإجراءات */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleView(listing.id)}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                          عرض الإعلان
                        </button>

                        <button
                          onClick={() => handleEdit(listing.id)}
                          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <PencilIcon className="h-4 w-4" />
                          تحرير
                        </button>

                        <button
                          onClick={() => handlePromote(listing.id)}
                          className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-orange-600 transition-colors hover:bg-orange-100"
                        >
                          <MegaphoneIcon className="h-4 w-4" />
                          ترويج
                        </button>

                        <button
                          onClick={() => handleDelete(listing)}
                          className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-red-600 transition-colors hover:bg-red-100"
                        >
                          <TrashIcon className="h-4 w-4" />
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* نافذة تأكيد الحذف */}
      {showDeleteModal && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="text-center">
              <XCircleIcon className="mx-auto mb-4 h-16 w-16 text-red-500" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
              <p className="mb-6 text-gray-600">
                هل أنت متأكد من حذف الإعلان &quot;{selectedListing?.title}
                &quot;؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                  حذف الإعلان
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MyListingsPage;
