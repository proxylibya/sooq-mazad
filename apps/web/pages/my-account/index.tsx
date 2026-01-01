import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import ChatBubbleLeftIcon from '@heroicons/react/24/outline/ChatBubbleLeftIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import ScaleIcon from '@heroicons/react/24/outline/ScaleIcon';
import ShoppingBagIcon from '@heroicons/react/24/outline/ShoppingBagIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TagIcon from '@heroicons/react/24/outline/TagIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import WalletIcon from '@heroicons/react/24/outline/WalletIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import AccountTypeBadge from '../../components/AccountTypeBadge';
import DiagnosticInfo from '../../components/DiagnosticInfo';
import UserAvatar from '../../components/UserAvatar';
import OpensooqNavbar from '../../components/common/layout/OpensooqNavbar';
import { useQuickNotifications } from '../../components/ui/EnhancedNotificationSystem';
import useAuth from '../../hooks/useAuth';

import { formatCityRegion } from '../../utils/formatters';
import {
  convertToWesternNumeralsOnly,
  formatCurrencyWestern,
  formatDateWestern,
  formatNumberWestern,
} from '../../utils/westernNumeralsOnly';

// أنواع مراجعات المستخدم
interface Review {
  id: string;
  rating: number;
  createdAt: string;
  reviewer?: {
    name?: string;
    profileImage?: string;
    verified?: boolean;
  };
  serviceType?: string;
  comment?: string;
}

// تنسيق تاريخ التسجيل بصيغة يوم.شهر.سنة (مثال: 29.08.2025)
const formatRegistrationDate = (dateValue: string | Date | null | undefined): string => {
  try {
    if (!dateValue) return 'غير محدد';
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return 'غير محدد';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return 'غير محدد';
  }
};

const MyAccountPage = () => {
  const router = useRouter();
  const notifications = useQuickNotifications();
  const { user, isLoading: authLoading } = useAuth();
  const initialTab = (router.query?.tab as string | string[] | undefined) ?? 'listings';
  const [activeTab, setActiveTab] = useState(
    Array.isArray(initialTab) ? initialTab[0] : initialTab,
  );
  const [listings, setListings] = useState<
    Array<{
      id: string;
      title: string;
      type: string;
      status: string;
      location: string;
      image?: string;
      price?: string;
      views?: number;
      favorites?: number;
      messages?: number;
      date?: string;
      createdAt: string;
      // حقول إضافية للمزادات
      bidCount?: number;
      auctionType?: string;
      // حقول الترويج
      isPromoted?: boolean;
      promotionExpiry?: string;
      promotionType?: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState<string | null>(null); // لعرض القائمة المنسدلة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // حالة التقييمات
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // حالات نافذة التقييم التفاعلية
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // التحقق من تسجيل الدخول مع تأخير للـ timing
  useEffect(() => {
    // إضافة تأخير صغير للتأكد من اكتمال تحميل useAuth
    const timeoutId = setTimeout(() => {
      if (!authLoading && !user) {
        router.push('/?callbackUrl=' + encodeURIComponent('/my-account'));
      }
    }, 500); // نصف ثانية تأخير

    return () => clearTimeout(timeoutId);
  }, [user, authLoading, router]);

  // جلب التقييمات من API
  const fetchUserReviews = useCallback(async () => {
    if (!user?.id) return;

    setReviewsLoading(true);
    setReviewsError(null);

    try {
      const response = await fetch(`/api/reviews?userId=${user.id}&type=received&limit=20`);
      const data: {
        success: boolean;
        data?: Array<{
          id: string;
          rating: number;
          comment?: string;
          createdAt: string;
          reviewer?: {
            name?: string;
            profileImage?: string;
            verified?: boolean;
          };
        }>;
        error?: string;
      } = await response.json();

      if (data.success) {
        setUserReviews(data.data || []);
      } else {
        setReviewsError(data.error || 'فشل في جلب التقييمات');
      }
    } catch (error) {
      console.error('خطأ في جلب التقييمات:', error);
      setReviewsError('خطأ في الاتصال بالخادم');
    } finally {
      setReviewsLoading(false);
    }
  }, [user?.id]);

  // جلب التقييمات عند تحميل الصفحة
  useEffect(() => {
    if (user?.id && activeTab === 'reviews') {
      fetchUserReviews();
    }
  }, [user?.id, activeTab, fetchUserReviews]);

  // بيانات المستخدم (كائن غير فارغ لتفادي أخطاء null)
  const userData = {
    id: user?.id || '',
    name: user?.name || 'مستخدم',
    accountType: (user as { accountType?: string })?.accountType || 'REGULAR_USER',
    memberSince: user?.createdAt ? formatRegistrationDate(user.createdAt) : 'غير محدد',
    rating: Number((user as { rating?: number })?.rating) || 0,
    totalReviews: Number((user as { totalReviews?: number })?.totalReviews) || 0,
    profileImage: user?.profileImage || '',
  };

  // التقييمات يتم جلبها من API عبر fetchUserReviews

  // تحميل إعلانات المستخدم من قاعدة البيانات
  const loadUserListings = useCallback(async () => {
    if (!user?.id) {
      setListings([]);
      setError('يرجى تسجيل الدخول أولاً');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/user?userId=${user.id}`);

      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.listings)) {
        console.log(`[نجح] تم جلب ${data.listings.length} إعلان من قاعدة البيانات`);

        // تشخيص البيانات المُستلمة
        if (data.listings.length > 0) {
          console.log('[معلومات] عينة من الإعلانات:', {
            firstListing: {
              id: data.listings[0].id,
              title: data.listings[0].title,
              type: data.listings[0].type,
              status: data.listings[0].status,
              image: data.listings[0].image || 'لا توجد صورة',
              price: data.listings[0].price || 'لا يوجد سعر',
            },
          });
        }

        // التحقق من صحة البيانات قبل التعيين
        const validListings = data.listings.filter(
          (listing: { id?: string; title?: string; type?: string; status?: string }) => {
            return listing.id && listing.title && listing.type;
          },
        );

        if (validListings.length < data.listings.length) {
          console.warn(
            `[تحذير] تم تصفية ${data.listings.length - validListings.length} إعلان غير صالح`,
          );
        }

        setListings(validListings);
        setError(null);
      } else {
        console.error('[فشل] استجابة غير صحيحة من API:', data);
        setListings([]);
        setError(data.error || 'فشل في جلب الإعلانات - بيانات غير صحيحة');
      }
    } catch (error) {
      console.error('[خطأ] خطأ في جلب الإعلانات:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      setListings([]);
      setError(`حدث خطأ في الاتصال بالخادم: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('useEffect - تحقق من بيانات المستخدم:', {
      hasUser: !!user,
      userId: user?.id,
      userName: user?.name,
      authLoading,
    });

    if (user?.id) {
      loadUserListings();
    } else if (!authLoading) {
      setListings([]);
      setIsLoading(false);
    }
  }, [user, authLoading, loadUserListings]);

  useEffect(() => {
    const qtab = router.query?.tab as string | string[] | undefined;
    if (qtab) {
      setActiveTab(Array.isArray(qtab) ? qtab[0] : qtab);
    }
  }, [router.query?.tab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      // حالات المزاد
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'ended':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'pending':
        return 'قيد المراجعة';
      case 'expired':
        return 'منتهي الصلاحية';
      case 'sold':
        return 'مباع';
      // حالات المزاد
      case 'live':
        return 'مباشر الآن';
      case 'upcoming':
        return 'قادم قريباً';
      case 'ended':
        return 'انتهى';
      default:
        return 'غير محدد';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'expired':
        return <XCircleIcon className="h-4 w-4" />;
      case 'sold':
        return <CheckCircleIcon className="h-4 w-4" />;
      // حالات المزاد
      case 'live':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'upcoming':
        return <ClockIcon className="h-4 w-4" />;
      case 'ended':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const _getTypeIcon = (type: string) => {
    switch (type) {
      case 'marketplace':
        return <ShoppingBagIcon className="h-4 w-4" />;
      case 'auction':
        return <ScaleIcon className="h-4 w-4" />;
      default:
        return <TagIcon className="h-4 w-4" />;
    }
  };

  const _getTypeText = (type: string) => {
    switch (type) {
      case 'marketplace':
        return 'السوق الفوري';
      case 'auction':
        return 'مزاد';
      default:
        return 'غير محدد';
    }
  };

  const _getTypeColor = (type: string) => {
    switch (type) {
      case 'marketplace':
        return 'bg-green-100 text-green-800';
      case 'auction':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
    const matchesType = filterType === 'all' || listing.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewListing = (listing: { type: string; id: string }) => {
    const url = `/${listing.type}/${listing.id}`;
    router.push(url);
  };

  const handleEditListing = (listing: { type: string; id: string }) => {
    // توجيه إلى صفحة التحرير الموحدة لجميع الإعلانات
    router.push(`/add-listing/edit/${listing.id}`);
  };

  const handleDeleteListing = (listing: { id: string; title: string }) => {
    setSelectedListing(listing);
    setShowDeleteModal(true);
  };

  const handlePromoteListing = (listing: { id: string }) => {
    // توجيه إلى صفحة ترويج الإعلان
    router.push(`/promote-listing/${listing.id}`);
  };

  const handleViewStats = (listing: { id: string }) => {
    // توجيه إلى صفحة إحصائيات الإعلان
    router.push(`/ad-stats/${listing.id}`);
  };

  const handleAddNewListing = () => {
    // توجيه المستخدم إلى صفحة اختيار نوع الإعلان
    router.push('/add-listing');
  };

  const confirmDelete = async () => {
    if (selectedListing) {
      try {
        const response = await fetch(`/api/listings/${selectedListing.id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          setShowDeleteModal(false);
          setSelectedListing(null);

          // إعادة تحميل الإعلانات من قاعدة البيانات
          await loadUserListings();
        } else {
          console.error('[فشل] فشل في حذف الإعلان:', data.error);
          notifications.error('فشل في حذف الإعلان', data.error || 'تعذر حذف الإعلان');
        }
      } catch (error) {
        console.error('[فشل] خطأ في حذف الإعلان:', error);
        notifications.error('خطأ أثناء حذف الإعلان', 'حدث خطأ أثناء حذف الإعلان');
      }
    }
  };

  // دالة لإعادة تحميل الإعلانات (يمكن استدعاؤها من مكونات أخرى)
  const _refreshListings = () => {
    loadUserListings();
  };

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMobileMenu && !target.closest('.listing-actions-more')) {
        setShowMobileMenu(null);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMobileMenu]);

  // دالة إرسال التقييم الجديد
  const handleSubmitRating = async () => {
    if (!user?.id || selectedRating === 0) {
      notifications.warning('إجراء مطلوب', 'يرجى اختيار تقييم أولاً');
      return;
    }

    setSubmittingRating(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: selectedRating,
          comment: ratingComment.trim() || undefined,
          reviewerId: user.id,
          targetUserId: userData.id,
          itemId: userData.id,
          itemType: 'user',
        }),
      });

      const result = await response.json();

      if (result.success) {
        // إغلاق النافذة وإعادة تعيين القيم
        setShowRatingModal(false);
        setSelectedRating(0);
        setRatingComment('');

        // إعادة تحميل التقييمات
        await fetchUserReviews();
        notifications.success('تم إرسال التقييم', 'تم إرسال التقييم بنجاح!');
      } else {
        notifications.error('فشل في إرسال التقييم', result.error || 'خطأ غير معروف');
      }
    } catch (error) {
      console.error('خطأ في إرسال التقييم:', error);
      notifications.error('خطأ في إرسال التقييم', 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setSubmittingRating(false);
    }
  };

  // دالة لعرض النجوم
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // حساب الإحصائيات
  const getStats = () => {
    const total = listings.length;
    const marketplace = listings.filter((l) => l.type === 'marketplace').length;
    const auction = listings.filter((l) => l.type === 'auction').length;
    // حساب الحالات النشطة (تشمل active و live)
    const active = listings.filter((l) => l.status === 'active' || l.status === 'live').length;
    // حساب المباع (تشمل sold و ended)
    const sold = listings.filter((l) => l.status === 'sold' || l.status === 'ended').length;
    const totalViews = listings.reduce((sum, l) => sum + (Number(l.views) || 0), 0);
    const totalFavorites = listings.reduce((sum, l) => sum + (Number(l.favorites) || 0), 0);
    // إحصائيات الإعلانات المميزة
    const promoted = listings.filter((l) => l.isPromoted).length;
    const pending = listings.filter((l) => l.status === 'pending').length;

    return {
      total,
      marketplace,
      auction,
      active,
      sold,
      totalViews,
      totalFavorites,
      promoted,
      pending,
    };
  };

  const stats = getStats();

  const tabs = [
    {
      id: 'listings',
      label: 'إعلاناتي',
      icon: <EyeIcon className="h-5 w-5" />,
    },
    {
      id: 'wallet',
      label: 'المحفظة',
      icon: <WalletIcon className="h-5 w-5" />,
    },
    {
      id: 'stats',
      label: 'الإحصائيات',
      icon: <ChartBarIcon className="h-5 w-5" />,
    },
    {
      id: 'reviews',
      label: 'التقييمات',
      icon: <StarIcon className="h-5 w-5" />,
    },
    {
      id: 'favorites',
      label: 'المفضلة',
      icon: <HeartIcon className="h-5 w-5" />,
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: <CogIcon className="h-5 w-5" />,
    },
  ];

  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (isLoading) return null;

  return (
    <>
      <Head>
        <title>حسابي - مزاد السيارات</title>
      </Head>

      <OpensooqNavbar />

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="page-container mx-auto max-w-7xl px-4 py-8">
          {/* رأس الصفحة مع معلومات المستخدم */}
          <div className="section-spacing mb-8">
            <div className="rounded-card mb-6 rounded-xl bg-white p-6 shadow-lg">
              <div className="my-account-header flex items-center gap-6">
                {/* صورة المستخدم بإطار دائري بسيط */}
                <div className="user-avatar-container relative">
                  <UserAvatar
                    src={userData.profileImage}
                    alt={userData.name}
                    size="xl"
                    accountType={userData.accountType}
                    className="rounded-full"
                  />
                  {/* زر تقييم صغير فوق الصورة للزوار */}
                  {user?.id !== userData.id && (
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-white shadow-md transition-all hover:bg-yellow-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                      title="تقييم هذا المستخدم"
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="user-info flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                    <AccountTypeBadge
                      accountType={userData.accountType}
                      size="md"
                      showIcon={false}
                    />
                    {/* مؤشر التقييم للزوار */}
                    {user?.id !== userData.id && userData.rating > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium text-yellow-600">{userData.rating}</span>
                        <StarIconSolid className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-500">({userData.totalReviews || 0})</span>
                      </div>
                    )}
                  </div>
                  <p className="mb-3 text-gray-600">عضو منذ {userData.memberSince}</p>

                  {/* التقييم ومعلومات إضافية - يظهر فقط لصاحب الحساب */}
                  {user?.id === userData.id && (
                    <div className="rating-badges flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        {renderStars(userData.rating)}
                        <span className="font-medium text-yellow-600">{userData.rating}</span>
                        <span className="text-gray-500">({userData.totalReviews || 0} تقييم)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <EyeIcon className="h-4 w-4" />
                        <span>{formatNumberWestern(stats.totalViews || 0)} مشاهدة</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="user-actions text-left">
                  <div className="flex flex-col gap-2">
                    {/* زر التقييم للزوار */}
                    {user?.id !== userData.id ? (
                      <button
                        onClick={() => setShowRatingModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-white shadow-sm transition-all hover:from-yellow-600 hover:to-orange-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                      >
                        <StarIcon className="h-4 w-4" />
                        تقييم المستخدم
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push('/settings')}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        <CogIcon className="h-5 w-5" />
                        تعديل الملف الشخصي
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="stats-grid mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <div className="mb-1 text-2xl font-bold text-blue-600">
                  {formatNumberWestern(stats.total || 0)}
                </div>
                <div className="text-xs text-gray-600 sm:text-sm">إجمالي الإعلانات</div>
              </div>
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <div className="mb-1 text-2xl font-bold text-green-600">
                  {formatNumberWestern(stats.active || 0)}
                </div>
                <div className="text-xs text-gray-600 sm:text-sm">نشط</div>
              </div>
              <div className="rounded-lg border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center shadow-sm">
                <div className="mb-1 text-2xl font-bold text-amber-600">
                  {formatNumberWestern(stats.promoted || 0)}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-amber-700 sm:text-sm">
                  <StarIcon className="h-3 w-3" />
                  مميز
                </div>
              </div>
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <div className="mb-1 text-2xl font-bold text-yellow-600">
                  {formatNumberWestern(stats.pending || 0)}
                </div>
                <div className="text-xs text-gray-600 sm:text-sm">قيد المراجعة</div>
              </div>
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <div className="mb-1 text-2xl font-bold text-cyan-600">
                  {formatNumberWestern(stats.totalViews || 0)}
                </div>
                <div className="text-xs text-gray-600 sm:text-sm">المشاهدات</div>
              </div>
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <div className="mb-1 text-2xl font-bold text-red-500">
                  {formatNumberWestern(stats.totalFavorites || 0)}
                </div>
                <div className="text-xs text-gray-600 sm:text-sm">المفضلة</div>
              </div>
            </div>
          </div>

          {/* التبويبات */}
          <div className="section-spacing rounded-card card-shadow mb-8 rounded-xl bg-white shadow-lg">
            <div className="border-b border-gray-200">
              <nav className="tabs-nav flex space-x-6 px-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 border-b-2 px-3 py-5 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon}
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'listings' && (
                <div>
                  {/* شريط الأدوات المحسن */}
                  <div className="toolbar-container rounded-card mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    {/* الصف الأول - البحث والإجراءات الرئيسية */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* حقل البحث */}
                      <div className="toolbar-search relative max-w-md flex-1">
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="البحث في الإعلانات..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-4 pr-12 text-sm placeholder-gray-500 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      {/* زر إضافة إعلان جديد */}
                      <button
                        onClick={handleAddNewListing}
                        className="toolbar-add-button inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>إضافة إعلان جديد</span>
                      </button>
                    </div>

                    {/* الصف الثاني - الفلاتر */}
                    <div className="toolbar-filters mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <span className="filter-label text-sm font-medium text-gray-700">
                        تصفية حسب:
                      </span>

                      {/* فلتر النوع */}
                      <div className="relative">
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="all">جميع الأنواع</option>
                          <option value="marketplace">السوق الفوري</option>
                          <option value="auction">المزادات</option>
                        </select>
                      </div>

                      {/* فلتر الحالة */}
                      <div className="relative">
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="all">جميع الحالات</option>
                          <option value="active">نشط</option>
                          <option value="pending">قيد المراجعة</option>
                          <option value="live">مزاد مباشر</option>
                          <option value="upcoming">مزاد قادم</option>
                          <option value="expired">منتهي الصلاحية</option>
                          <option value="sold">مباع</option>
                          <option value="ended">مزاد منتهي</option>
                        </select>
                      </div>

                      {/* عداد النتائج */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 sm:mr-auto">
                        <span className="font-medium">
                          {formatNumberWestern(filteredListings.length)}
                        </span>
                        <span>من</span>
                        <span className="font-medium">{formatNumberWestern(listings.length)}</span>
                        <span>إعلان</span>
                      </div>
                    </div>

                    {/* مؤشر الفلاتر النشطة */}
                    {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
                      <div className="active-filters mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">الفلاتر النشطة:</span>

                        {searchTerm && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                            البحث: &quot;{searchTerm}&quot;
                            <button
                              onClick={() => setSearchTerm('')}
                              className="ml-1 hover:text-blue-600"
                            >
                              <XCircleIcon className="h-3 w-3" />
                            </button>
                          </span>
                        )}

                        {filterType !== 'all' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                            النوع: {filterType === 'marketplace' ? 'السوق الفوري' : 'المزادات'}
                            <button
                              onClick={() => setFilterType('all')}
                              className="ml-1 hover:text-green-600"
                            >
                              <XCircleIcon className="h-3 w-3" />
                            </button>
                          </span>
                        )}

                        {filterStatus !== 'all' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                            الحالة: {getStatusText(filterStatus)}
                            <button
                              onClick={() => setFilterStatus('all')}
                              className="ml-1 hover:text-purple-600"
                            >
                              <XCircleIcon className="h-3 w-3" />
                            </button>
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                            setFilterStatus('all');
                          }}
                          className="text-xs text-gray-500 underline hover:text-gray-700"
                        >
                          مسح جميع الفلاتر
                        </button>
                      </div>
                    )}
                  </div>

                  {/* رسالة الخطأ */}
                  {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="ml-2 h-5 w-5 text-red-400" />
                        <p className="text-red-800">{error}</p>
                      </div>
                      <button
                        onClick={loadUserListings}
                        className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  )}

                  {/* قسم الإعلانات المميزة */}
                  {filteredListings.filter((l) => l.isPromoted).length > 0 && (
                    <div className="mb-8">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500">
                          <StarIcon className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">الإعلانات المميزة</h3>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          {formatNumberWestern(filteredListings.filter((l) => l.isPromoted).length)}
                        </span>
                      </div>
                      <div className="grid gap-4">
                        {filteredListings
                          .filter((l) => l.isPromoted)
                          .map((listing) => (
                            <div
                              key={`promoted-${listing.id}`}
                              className="relative overflow-hidden rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-md"
                            >
                              <div className="absolute -left-8 top-3 rotate-[-35deg] bg-gradient-to-r from-amber-500 to-orange-500 px-10 py-1 text-xs font-bold text-white shadow-sm">
                                مميز
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                                  <Image
                                    src={listing.image || '/images/cars/default-car.svg'}
                                    alt={listing.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="mb-1 truncate font-semibold text-gray-900">
                                    {listing.title}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${listing.type === 'auction' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}
                                    >
                                      {listing.type === 'auction' ? 'مزاد' : 'سوق فوري'}
                                    </span>
                                    {listing.promotionExpiry && (
                                      <span className="text-xs text-gray-500">
                                        ينتهي:{' '}
                                        {formatDateWestern(listing.promotionExpiry, {
                                          month: 'short',
                                          day: 'numeric',
                                        })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleViewListing(listing)}
                                    className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-amber-600"
                                  >
                                    عرض
                                  </button>
                                  <button
                                    onClick={() => handleViewStats(listing)}
                                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200"
                                  >
                                    إحصائيات
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* رابط ترويج الإعلانات */}
                  {listings.length > 0 &&
                    filteredListings.filter((l) => l.isPromoted).length === 0 && (
                      <div className="mb-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <StarIcon className="h-6 w-6 text-amber-500" />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                روّج إعلاناتك لتحصل على مشاهدات أكثر!
                              </h4>
                              <p className="text-sm text-gray-600">
                                اجعل إعلانك يظهر في المقدمة وزد من فرص البيع
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => router.push('/promotions')}
                            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-md"
                          >
                            ابدأ الترويج
                          </button>
                        </div>
                      </div>
                    )}

                  {/* قائمة الإعلانات */}
                  <div className="grid gap-6">
                    {filteredListings.length === 0 && !error ? (
                      <div className="empty-state py-12 text-center">
                        <EyeIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد إعلانات</h3>
                        <p className="mb-4 text-gray-600">
                          {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                            ? 'لا توجد إعلانات تطابق معايير البحث'
                            : 'لم تقم بإضافة أي إعلانات بعد'}
                        </p>
                        {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
                          <button
                            onClick={handleAddNewListing}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                          >
                            <PlusIcon className="h-4 w-4" />
                            إضافة أول إعلان
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredListings.map((listing) => (
                        <div
                          key={listing.id}
                          className={`listing-card rounded-card group relative overflow-hidden rounded-xl bg-white transition-all duration-300 hover:shadow-xl ${
                            listing.isPromoted
                              ? 'border-2 border-amber-400 shadow-lg ring-2 ring-amber-200'
                              : listing.type === 'auction'
                                ? 'border-2 border-yellow-400 shadow-lg'
                                : 'border border-gray-200 shadow-sm hover:border-blue-300'
                          }`}
                        >
                          {/* شارة مميز */}
                          {listing.isPromoted && (
                            <div className="absolute -right-8 top-4 z-10 rotate-[45deg] bg-gradient-to-r from-amber-500 to-orange-500 px-10 py-1 text-xs font-bold text-white shadow-sm">
                              مميز
                            </div>
                          )}
                          <div className="flex flex-col gap-0 md:flex-row">
                            {/* صورة الإعلان */}
                            <div className="listing-card-image relative h-56 flex-shrink-0 md:h-40 md:w-56 lg:w-64">
                              <Image
                                src={listing.image || '/images/cars/default-car.svg'}
                                alt={listing.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 256px, 256px"
                                className="rounded-t-xl object-cover md:rounded-l-xl md:rounded-t-none"
                              />

                              {/* شارة نوع الإعلان */}
                              <div className="absolute left-3 top-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${
                                    listing.type === 'auction'
                                      ? 'border border-amber-300 bg-amber-100 text-amber-800'
                                      : 'border border-green-300 bg-green-100 text-green-800'
                                  }`}
                                >
                                  {listing.type === 'auction' ? (
                                    <TrophyIcon className="h-3.5 w-3.5" />
                                  ) : (
                                    <ShoppingBagIcon className="h-3.5 w-3.5" />
                                  )}
                                  <span>{listing.type === 'auction' ? 'مزاد' : 'سوق فوري'}</span>
                                </span>
                              </div>

                              {/* شارة الحالة */}
                              <div className="absolute right-3 top-3">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shadow-sm ${getStatusColor(listing.status)}`}
                                >
                                  {getStatusIcon(listing.status)}
                                  <span className="hidden sm:inline">
                                    {getStatusText(listing.status)}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* معلومات الإعلان */}
                            <div className="listing-card-content flex-1 p-6">
                              <div className="mb-4">
                                <h3 className="listing-card-title mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                                  {listing.title}
                                </h3>
                                <div className="listing-card-meta mb-3 flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <svg
                                      className="h-4 w-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span>{formatCityRegion(listing.location)}</span>
                                  </div>
                                  <span className="text-gray-400">•</span>
                                  <div className="flex items-center gap-1">
                                    <svg
                                      className="h-4 w-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span>
                                      {formatDateWestern(listing.createdAt, {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-4 flex items-center justify-between">
                                <div className="listing-card-price text-2xl font-bold text-blue-600">
                                  {(() => {
                                    const p: any = (listing as any).price;
                                    if (p === undefined || p === null || p === '') return '—';
                                    if (typeof p === 'string') {
                                      // إذا كانت العملة موجودة بالفعل كجزء من النص، حول الأرقام فقط
                                      if (p.includes('د.ل') || /[A-Za-z]/.test(p))
                                        return convertToWesternNumeralsOnly(p);
                                      return formatCurrencyWestern(p, 'د.ل');
                                    }
                                    if (typeof p === 'number')
                                      return formatCurrencyWestern(p, 'د.ل');
                                    return convertToWesternNumeralsOnly(String(p));
                                  })()}
                                </div>
                              </div>

                              {/* الإحصائيات */}
                              <div className="listing-stats-grid mb-4 grid grid-cols-3 gap-2 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 p-3 sm:gap-4">
                                <div className="text-center">
                                  <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center">
                                    <EyeIcon className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-bold text-gray-800 sm:text-base">
                                      {formatNumberWestern(listing.views || 0)}
                                    </span>
                                  </div>
                                  <div className="stat-label text-xs text-gray-600 sm:text-sm">
                                    مشاهدة
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center">
                                    <HeartIcon className="h-4 w-4 text-red-500" />
                                    <span className="text-sm font-bold text-gray-800 sm:text-base">
                                      {formatNumberWestern(listing.favorites || 0)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600 sm:text-sm">إعجاب</div>
                                </div>
                                <div className="text-center">
                                  <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center">
                                    <ChatBubbleLeftIcon className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-bold text-gray-800 sm:text-base">
                                      {formatNumberWestern(listing.messages || 0)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600 sm:text-sm">رسالة</div>
                                </div>
                              </div>

                              {/* معلومات إضافية للمزادات */}
                              {listing.type === 'auction' && (
                                <div className="auction-info-box mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600">المزايدات:</span>
                                      <span className="ml-2 font-semibold text-yellow-800">
                                        {formatNumberWestern(listing.bidCount || 0)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">الحالة:</span>
                                      <span className="ml-2 font-semibold text-yellow-800">
                                        {listing.auctionType === 'active'
                                          ? 'نشط'
                                          : listing.auctionType === 'ended'
                                            ? 'منتهي'
                                            : 'قادم'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* أزرار الإجراءات */}
                              <div className="listing-actions flex flex-wrap gap-2">
                                {/* الأزرار الأساسية - دائماً مرئية */}
                                <button
                                  onClick={() => handleViewListing(listing)}
                                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-md sm:px-4"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  <span className="hidden sm:inline">عرض التفاصيل</span>
                                  <span className="sm:hidden">عرض</span>
                                </button>

                                <button
                                  onClick={() => handleEditListing(listing)}
                                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-amber-600 hover:shadow-md sm:px-4"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                  <span>تحرير</span>
                                </button>

                                {/* الأزرار الثانوية - مخفية على الشاشات الصغيرة */}
                                <div className="hidden gap-2 sm:flex">
                                  {listing.status === 'active' && (
                                    <button
                                      onClick={() => handlePromoteListing(listing)}
                                      className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-600 hover:shadow-md"
                                    >
                                      <svg
                                        className="h-4 w-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      ترويج
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleViewStats(listing)}
                                    className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-600 hover:shadow-md"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                    </svg>
                                    الإحصائيات
                                  </button>
                                </div>

                                {/* قائمة منسدلة للشاشات الصغيرة */}
                                <div className="listing-actions-more relative sm:hidden">
                                  <button
                                    onClick={() => {
                                      setShowMobileMenu(
                                        showMobileMenu === listing.id ? null : listing.id,
                                      );
                                    }}
                                    className="flex items-center gap-1 rounded-lg bg-gray-500 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-gray-600"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                    المزيد
                                  </button>

                                  {/* القائمة المنسدلة */}
                                  {showMobileMenu === listing.id && (
                                    <div className="absolute left-0 top-full z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                                      {listing.status === 'active' && (
                                        <button
                                          onClick={() => {
                                            handlePromoteListing(listing);
                                            setShowMobileMenu(null);
                                          }}
                                          className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                        >
                                          <svg
                                            className="h-4 w-4 text-green-600"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          ترويج الإعلان
                                        </button>
                                      )}

                                      <button
                                        onClick={() => {
                                          handleViewStats(listing);
                                          setShowMobileMenu(null);
                                        }}
                                        className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                      >
                                        <svg
                                          className="h-4 w-4 text-purple-600"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                        </svg>
                                        عرض الإحصائيات
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleDeleteListing(listing)}
                                  className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-red-600 hover:shadow-md sm:px-4"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  <span className="hidden sm:inline">حذف</span>
                                  <span className="sm:hidden">حذف</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="space-y-6">
                  {/* رأس قسم المحفظة */}
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                          <WalletIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">محفظتي</h3>
                          <p className="text-gray-600">إدارة الرصيد والمعاملات المالية</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* بطاقات الأرصدة */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
                      <div className="mb-2 text-2xl font-bold text-green-600">0.00 د.ل</div>
                      <div className="text-sm text-gray-600">الرصيد المحلي</div>
                      <div className="mt-2 text-xs text-gray-500">دينار ليبي</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
                      <div className="mb-2 text-2xl font-bold text-blue-600">$0.00</div>
                      <div className="text-sm text-gray-600">الرصيد الدولي</div>
                      <div className="mt-2 text-xs text-gray-500">دولار أمريكي</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
                      <div className="mb-2 text-2xl font-bold text-purple-600">0 USDT</div>
                      <div className="text-sm text-gray-600">العملة الرقمية</div>
                      <div className="mt-2 text-xs text-gray-500">Tether USD</div>
                    </div>
                  </div>

                  {/* أزرار الإجراءات المحسنة - الإيداع فقط */}
                  <div className="space-y-4">
                    {/* قسم الإيداع الرئيسي */}
                    <div className="text-center">
                      <h4 className="mb-2 text-lg font-semibold text-gray-900">إيداع الأموال</h4>
                      <p className="mb-4 text-sm text-gray-600">
                        اختر نوع المحفظة لبدء عملية الإيداع
                      </p>
                    </div>

                    {/* أزرار أنواع المحافظ */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <button
                        onClick={() => router.push('/wallet/deposit/local')}
                        className="flex flex-col items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-white transition-all hover:from-green-700 hover:to-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="text-center">
                          <div className="text-sm font-medium">محفظة محلية</div>
                          <div className="text-xs opacity-90">دينار ليبي</div>
                        </div>
                      </button>

                      <button
                        onClick={() => router.push('/wallet/deposit/global')}
                        className="flex flex-col items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-600 px-4 py-3 text-white transition-all hover:from-blue-700 hover:to-sky-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="text-center">
                          <div className="text-sm font-medium">محفظة عالمية</div>
                          <div className="text-xs opacity-90">دولار أمريكي</div>
                        </div>
                      </button>

                      <button
                        onClick={() => router.push('/wallet/deposit/digital/usdt-trc20')}
                        className="flex flex-col items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-white transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      >
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-center">
                          <div className="text-sm font-medium">محفظة رقمية</div>
                          <div className="text-xs opacity-90">USDT-TRC20</div>
                        </div>
                      </button>
                    </div>

                    {/* زر عرض المحفظة الكاملة */}
                    <div className="border-t border-gray-200 pt-4">
                      <button
                        onClick={() => router.push('/wallet')}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-3 text-white transition-all hover:from-gray-800 hover:to-gray-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        <WalletIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">عرض المحفظة الكاملة</span>
                      </button>
                    </div>
                  </div>

                  {/* آخر المعاملات */}
                  <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h4 className="mb-4 text-lg font-semibold text-gray-900">آخر المعاملات</h4>
                    <div className="py-8 text-center">
                      <div className="text-gray-500">لا توجد معاملات حديثة</div>
                      <div className="mt-2 text-sm text-gray-400">
                        ستظهر معاملاتك هنا عند إجرائها
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-6">
                  {/* رأس قسم الإحصائيات */}
                  <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                          <ChartBarIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">إحصائيات الأداء</h3>
                          <p className="text-gray-600">تحليل شامل لإعلاناتك</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* إحصائيات سريعة */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                      <div className="mb-2 text-2xl font-bold text-green-600">
                        {formatNumberWestern(stats.totalViews || 0)}
                      </div>
                      <div className="text-sm text-gray-600">مشاهدات اليوم</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                      <div className="mb-2 text-2xl font-bold text-blue-600">
                        {formatNumberWestern(stats.active || 0)}
                      </div>
                      <div className="text-sm text-gray-600">إعلانات نشطة</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                      <div className="mb-2 text-2xl font-bold text-purple-600">
                        {formatNumberWestern(stats.totalFavorites || 0)}
                      </div>
                      <div className="text-sm text-gray-600">إعجابات</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                      <div className="mb-2 text-2xl font-bold text-orange-600">
                        {formatNumberWestern(
                          Math.round((stats.totalViews || 0) / Math.max(stats.total, 1)),
                        )}
                      </div>
                      <div className="text-sm text-gray-600">متوسط/إعلان</div>
                    </div>
                  </div>

                  {/* أزرار الإحصائيات */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => router.push('/my-account/views-stats')}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-all hover:bg-green-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                      إحصائيات مفصلة
                    </button>
                    <button
                      onClick={() => router.push('/my-account?tab=stats')}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                      </svg>
                      تحليلات متقدمة
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* رأس قسم التقييمات */}
                  <div className="rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                          <StarIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">التقييمات المستلمة</h3>
                          <p className="text-gray-600">آراء العملاء في خدماتك</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {/* إحصائيات التقييمات */}
                        <div className="text-center">
                          <div className="mb-1 text-3xl font-bold text-yellow-600">
                            {userData.rating}
                          </div>
                          <div className="mb-1 flex items-center justify-center gap-1">
                            {renderStars(userData.rating)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {userData.totalReviews || 0} تقييم
                          </div>
                        </div>

                        {/* زر إضافة تقييم - يظهر فقط للمستخدمين الآخرين */}
                        {user?.id !== userData.id && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setShowRatingModal(true)}
                              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-white shadow-sm transition-all hover:from-yellow-600 hover:to-orange-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                              <StarIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">أضف تقييم</span>
                            </button>
                            <div className="text-center text-xs text-gray-500">شارك رأيك</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* توزيع التقييمات */}
                    <div className="grid grid-cols-5 gap-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const reviewsArray = Array.isArray(userReviews) ? userReviews : [];
                        const count = reviewsArray.filter(
                          (review) => review.rating === rating,
                        ).length;
                        const percentage =
                          reviewsArray.length > 0
                            ? Math.round((count / reviewsArray.length) * 100) || 0
                            : 0;
                        return (
                          <div key={rating} className="text-center">
                            <div className="mb-1 flex items-center justify-center gap-1">
                              <span className="text-sm font-medium">{rating}</span>
                              <StarIconSolid className="h-3 w-3 text-yellow-400" />
                            </div>
                            <div className="mb-1 h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-yellow-400"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-600">{count}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* قائمة التقييمات */}
                  <div className="space-y-4">
                    {reviewsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div
                            className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                            style={{ width: 24, height: 24 }}
                            role="status"
                            aria-label="جاري التحميل"
                          />
                          <p className="mt-2 text-gray-600">جاري تحميل التقييمات...</p>
                        </div>
                      </div>
                    ) : reviewsError ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                        <p className="text-red-600">{reviewsError}</p>
                        <button
                          onClick={fetchUserReviews}
                          className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                        >
                          إعادة المحاولة
                        </button>
                      </div>
                    ) : !Array.isArray(userReviews) || userReviews.length === 0 ? (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                        <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">
                          لا توجد تقييمات بعد
                        </h3>
                        <p className="mt-1 text-gray-500">
                          ستظهر التقييمات هنا عندما يقوم العملاء بتقييم خدماتك
                        </p>
                      </div>
                    ) : (
                      userReviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            {/* صورة المراجع */}
                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                              {review.reviewer?.profileImage ? (
                                <Image
                                  src={review.reviewer.profileImage}
                                  alt={review.reviewer.name || 'مستخدم'}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <UserIcon className="h-6 w-6 text-gray-600" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              {/* معلومات المراجع والتقييم */}
                              <div className="mb-2 flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-900">
                                      {review.reviewer?.name || 'مستخدم'}
                                    </h4>
                                    {review.reviewer?.verified && (
                                      <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    {renderStars(review.rating)}
                                    <span className="mr-1 text-sm font-medium text-gray-700">
                                      ({review.rating})
                                    </span>
                                  </div>
                                  {/* زر الرد على التقييم - يظهر فقط لصاحب الحساب */}
                                  <div className="flex items-center gap-2">
                                    {user?.id === userData.id && (
                                      <button
                                        onClick={() => {
                                          // يمكن إضافة منطق الرد لاحقاً
                                          alert('ميزة الرد على التقييمات ستكون متاحة قريباً');
                                        }}
                                        className="text-xs text-blue-600 underline hover:text-blue-700"
                                      >
                                        رد
                                      </button>
                                    )}
                                    {/* زر الإعجاب */}
                                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600">
                                      <svg
                                        className="h-3 w-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      مفيد
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* نوع الخدمة */}
                              {review.serviceType && (
                                <div className="mb-3">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                                    <TruckIcon className="h-4 w-4" />
                                    {review.serviceType}
                                  </span>
                                </div>
                              )}

                              {/* التعليق */}
                              {review.comment && (
                                <p className="mb-3 leading-relaxed text-gray-700">
                                  {review.comment}
                                </p>
                              )}

                              {/* إحصائيات التقييم */}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  تقييم مفيد
                                </span>
                                <span>•</span>
                                <span>
                                  منذ{' '}
                                  {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* رابط عرض جميع التقييمات */}
                  {Array.isArray(userReviews) && userReviews.length > 5 && (
                    <div className="pt-4 text-center">
                      <button className="font-medium text-blue-600 hover:text-blue-700">
                        عرض جميع التقييمات ({userData.totalReviews || 0})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="space-y-6">
                  {/* رأس قسم المفضلة */}
                  <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                          <HeartIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">المفضلة</h3>
                          <p className="text-gray-600">السيارات والإعلانات المحفوظة</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* إحصائيات سريعة */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                      <div className="mb-1 text-2xl font-bold text-red-600">0</div>
                      <div className="text-sm text-gray-600">سيارات مفضلة</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                      <div className="mb-1 text-2xl font-bold text-purple-600">0</div>
                      <div className="text-sm text-gray-600">مزادات مفضلة</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                      <div className="mb-1 text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">معارض مفضلة</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                      <div className="mb-1 text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-gray-600">إجمالي المفضلة</div>
                    </div>
                  </div>

                  {/* قائمة المفضلة */}
                  <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">آخر الإضافات</h4>
                      <button
                        onClick={() => router.push('/favorites')}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        عرض الكل
                      </button>
                    </div>
                    <div className="py-8 text-center">
                      <HeartIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                      <div className="text-gray-500">لا توجد عناصر مفضلة</div>
                      <div className="mt-2 text-sm text-gray-400">
                        استكشف السيارات والمزادات وأضف ما يعجبك إلى المفضلة
                      </div>
                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                          onClick={() => router.push('/marketplace')}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-all hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          <HeartIcon className="h-4 w-4" />
                          استكشف السيارات
                        </button>
                        <button
                          onClick={() => router.push('/auctions')}
                          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-all hover:bg-purple-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          تصفح المزادات
                        </button>
                        <button
                          onClick={() => router.push('/showrooms')}
                          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-all hover:bg-green-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.447.894L10 15.118l-4.553 1.776A1 1 0 014 16V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                              clipRule="evenodd"
                            />
                          </svg>
                          زيارة المعارض
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* رأس قسم الإعدادات */}
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                          <CogIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">إعدادات الحساب</h3>
                          <p className="text-gray-600">إدارة حسابك وتفضيلاتك</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* الإعدادات السريعة */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                      <div className="mb-3 flex items-center gap-3">
                        <UserIcon className="h-8 w-8 text-gray-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">الملف الشخصي</h4>
                          <p className="text-sm text-gray-600">تعديل الاسم والصورة</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/settings?tab=profile')}
                        className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                      >
                        تعديل
                      </button>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                      <div className="mb-3 flex items-center gap-3">
                        <svg
                          className="h-8 w-8 text-gray-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-gray-900">الأمان</h4>
                          <p className="text-sm text-gray-600">كلمة المرور والحماية</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/settings?tab=security')}
                        className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                      >
                        إدارة
                      </button>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                      <div className="mb-3 flex items-center gap-3">
                        <svg
                          className="h-8 w-8 text-gray-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-gray-900">الخصوصية</h4>
                          <p className="text-sm text-gray-600">من يرى معلوماتك</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/settings?tab=preferences')}
                        className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                      >
                        تحكم
                      </button>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                      <div className="mb-3 flex items-center gap-3">
                        <svg
                          className="h-8 w-8 text-gray-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-gray-900">الإشعارات</h4>
                          <p className="text-sm text-gray-600">التنبيهات والرسائل</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/settings?tab=notifications')}
                        className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                      >
                        ضبط
                      </button>
                    </div>
                  </div>

                  {/* زر الإعدادات الكاملة */}
                  <div className="text-center">
                    <button
                      onClick={() => router.push('/settings')}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <CogIcon className="h-5 w-5" />
                      جميع الإعدادات
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* معلومات التشخيص - في أسفل الصفحة */}
          <DiagnosticInfo
            basicInfo={{
              'معرف المستخدم': user?.id || 'غير موجود',
              'اسم المستخدم': user?.name || 'غير موجود',
              'عدد الإعلانات المحملة': listings.length,
              'عدد الإعلانات المفلترة': filteredListings.length,
              'حالة التحميل': isLoading ? 'جاري التحميل' : 'مكتمل',
            }}
            developmentOnly={true}
          />
        </div>
      </div>

      {/* نافذة تأكيد الحذف */}
      {showDeleteModal && selectedListing && (
        <div className="modal-container fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="modal-content rounded-card w-full max-w-md rounded-xl bg-white p-6">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto mb-4 h-16 w-16 text-red-500" />
              <h3 className="modal-title mb-2 text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
              <p className="mb-6 text-gray-600">
                هل أنت متأكد من حذف الإعلان &quot;{selectedListing.title}&quot;؟ لا يمكن التراجع عن
                هذا الإجراء.
              </p>

              <div className="modal-actions flex gap-3">
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

      {/* نافذة التقييم التفاعلية */}
      {showRatingModal && (
        <div className="modal-container fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="modal-content rounded-card w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="modal-title mb-2 text-xl font-bold text-gray-900">تقييم المستخدم</h3>
              <p className="text-gray-600">شاركنا رأيك في هذا المستخدم</p>
            </div>

            {/* اختيار التقييم */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-gray-700">
                التقييم (مطلوب)
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    className={`h-8 w-8 transition-all ${
                      star <= selectedRating
                        ? 'text-yellow-400 hover:text-yellow-500'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    <StarIconSolid className="h-full w-full" />
                  </button>
                ))}
              </div>
              <div className="mt-2 text-center text-sm text-gray-600">
                {selectedRating > 0 && (
                  <span>
                    {selectedRating === 1 && 'ضعيف جداً'}
                    {selectedRating === 2 && 'ضعيف'}
                    {selectedRating === 3 && 'متوسط'}
                    {selectedRating === 4 && 'جيد'}
                    {selectedRating === 5 && 'ممتاز'}
                  </span>
                )}
              </div>
            </div>

            {/* التعليق الاختياري */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                التعليق (اختياري)
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="اكتب تعليقك هنا..."
                rows={3}
                maxLength={500}
                className="rating-modal-textarea w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
              <div className="mt-1 text-left text-xs text-gray-500">{ratingComment.length}/500</div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="modal-actions flex gap-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedRating(0);
                  setRatingComment('');
                }}
                disabled={submittingRating}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={selectedRating === 0 || submittingRating}
                className="flex-1 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-white transition-all hover:from-yellow-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingRating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                    <span>جاري الإرسال...</span>
                  </div>
                ) : (
                  'إرسال التقييم'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyAccountPage;
