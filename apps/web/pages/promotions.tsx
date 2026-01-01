/**
 * صفحة مركز الترويج - عرض الباقات وترويج الإعلانات
 */

import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import MegaphoneIcon from '@heroicons/react/24/outline/MegaphoneIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TagIcon from '@heroicons/react/24/outline/TagIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import WalletIcon from '@heroicons/react/24/outline/WalletIcon';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Layout } from '../components/common';
import { PROMOTION_PACKAGES, getPaidPackages } from '../lib/promotion/promotion-system';

interface UserListing {
  id: string;
  title: string;
  price: number;
  image: string | null;
  type: 'car' | 'auction';
  status: string;
  promotionPackage: string | null;
  promotionEndDate: string | null;
  createdAt: string;
}

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'promoted' | 'not_promoted';

const PromotionsPage = () => {
  const router = useRouter();
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const packages = getPaidPackages();

  // جلب إعلانات المستخدم
  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const response = await fetch('/api/my-listings?includePromotionStatus=true');
        if (response.ok) {
          const data = await response.json();
          setUserListings(data.listings || []);
        }
      } catch (error) {
        console.error('خطأ في جلب الإعلانات:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/wallet/balance');
        if (response.ok) {
          const data = await response.json();
          setWalletBalance(data.totalBalance?.local || 0);
        }
      } catch (error) {
        console.error('خطأ في جلب الرصيد:', error);
      }
    };

    fetchUserListings();
    fetchBalance();
  }, []);

  const handlePromote = (listingId: string, listingType: string) => {
    router.push(`/promote/${listingId}?type=${listingType}`);
  };

  const isPromoted = (listing: UserListing) => {
    return (
      listing.promotionPackage &&
      listing.promotionPackage !== 'free' &&
      listing.promotionEndDate &&
      new Date(listing.promotionEndDate) > new Date()
    );
  };

  // فلترة الإعلانات
  const filteredListings = userListings.filter((listing) => {
    if (filterMode === 'all') return true;
    if (filterMode === 'promoted') return isPromoted(listing);
    if (filterMode === 'not_promoted') return !isPromoted(listing);
    return true;
  });

  // إحصائيات الإعلانات
  const promotedCount = userListings.filter(isPromoted).length;
  const notPromotedCount = userListings.length - promotedCount;

  // حساب الأيام المتبقية للترويج
  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout title="ترويج الإعلانات" description="روّج إعلاناتك واحصل على مشاهدات أكثر">
      <Head>
        <title>ترويج الإعلانات | سوق مزاد</title>
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-16">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 text-center text-white">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <MegaphoneIcon className="h-12 w-12" />
            </div>
            <h1 className="mb-4 text-4xl font-black md:text-5xl">روّج إعلانك الآن!</h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
              اجعل إعلانك يظهر في المقدمة واحصل على مشاهدات أكثر بـ 5 مرات وبيع أسرع
            </p>

            {/* إحصائيات */}
            <div className="mx-auto grid max-w-3xl grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                <div className="text-3xl font-black">+500%</div>
                <div className="text-sm text-white/80">زيادة المشاهدات</div>
              </div>
              <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                <div className="text-3xl font-black">3X</div>
                <div className="text-sm text-white/80">بيع أسرع</div>
              </div>
              <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                <div className="text-3xl font-black">24/7</div>
                <div className="text-sm text-white/80">ظهور مستمر</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-12">
          {/* رصيد المحفظة */}
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500">
                <WalletIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">رصيد محفظتك</h3>
                <p className="text-sm text-gray-500">متاح للدفع والترويج</p>
              </div>
            </div>
            <div className="text-left">
              <div className="text-3xl font-black text-blue-600">
                {walletBalance.toLocaleString('en-US')} <span className="text-lg">د.ل</span>
              </div>
              <Link href="/wallet/topup" className="text-sm text-blue-500 hover:underline">
                شحن المحفظة ←
              </Link>
            </div>
          </div>

          {/* باقات الترويج */}
          <div className="mb-12">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
              <TrophyIcon className="h-8 w-8 text-amber-500" />
              باقات الترويج المتاحة
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {packages.map((pkg) => {
                const gradients: Record<string, string> = {
                  basic: 'from-blue-500 to-blue-600',
                  premium: 'from-green-500 to-emerald-600',
                  vip: 'from-amber-500 to-orange-600',
                };
                const bgColors: Record<string, string> = {
                  basic: 'bg-blue-50 border-blue-200',
                  premium: 'bg-green-50 border-green-200',
                  vip: 'bg-amber-50 border-amber-200',
                };

                return (
                  <div
                    key={pkg.id}
                    className={`relative overflow-hidden rounded-3xl border-2 ${bgColors[pkg.id]} p-6 shadow-lg transition-all hover:shadow-xl`}
                  >
                    {pkg.popular && (
                      <div className="absolute -left-10 top-6 rotate-[-45deg] bg-green-500 px-12 py-1 text-xs font-bold text-white shadow">
                        الأكثر طلباً
                      </div>
                    )}

                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${gradients[pkg.id]} text-white shadow-lg`}
                      >
                        {pkg.id === 'vip' ? (
                          <TrophyIcon className="h-8 w-8" />
                        ) : pkg.id === 'premium' ? (
                          <SparklesIcon className="h-8 w-8" />
                        ) : (
                          <StarIcon className="h-8 w-8" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                        <p className="text-sm text-gray-500">{pkg.days} يوم</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="text-5xl font-black text-gray-900">{pkg.price}</span>
                      <span className="text-xl text-gray-500"> د.ل</span>
                    </div>

                    <ul className="mb-6 space-y-3">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="rounded-xl bg-white/50 p-3 text-center">
                      <span className="text-xs text-gray-500">مضاعفة المشاهدات</span>
                      <div className="text-2xl font-black text-amber-600">
                        ×{pkg.viewsMultiplier}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* طرق الدفع */}
          <div className="mb-12 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
              <CreditCardIcon className="h-8 w-8 text-blue-500" />
              طرق الدفع المتاحة
            </h2>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <WalletIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">المحفظة</h4>
                  <p className="text-xs text-gray-500">فوري ومباشر</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                  <CreditCardIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">ليبيانا</h4>
                  <p className="text-xs text-gray-500">كرت شحن</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <CreditCardIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">مدار</h4>
                  <p className="text-xs text-gray-500">كرت شحن</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <CreditCardIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">تحويل بنكي</h4>
                  <p className="text-xs text-gray-500">مصرف التجارة</p>
                </div>
              </div>
            </div>
          </div>

          {/* إعلانات المستخدم */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            {/* العنوان وزر الترويج الرئيسي */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <MegaphoneIcon className="h-8 w-8 text-purple-500" />
                <h2 className="text-2xl font-bold text-gray-900">إعلاناتك</h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                  {userListings.length}
                </span>
              </div>

              {/* زر روّج الآن الرئيسي */}
              {userListings.length > 0 && notPromotedCount > 0 && (
                <button
                  onClick={() => {
                    const firstNotPromoted = userListings.find((l) => !isPromoted(l));
                    if (firstNotPromoted) {
                      handlePromote(firstNotPromoted.id, firstNotPromoted.type);
                    }
                  }}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  <SparklesIcon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                  <span>روّج إعلان الآن</span>
                  <MegaphoneIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* شريط الأدوات: الفلاتر وتبديل العرض */}
            {userListings.length > 0 && (
              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                {/* الفلاتر */}
                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterMode('all')}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        filterMode === 'all'
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      الكل ({userListings.length})
                    </button>
                    <button
                      onClick={() => setFilterMode('promoted')}
                      className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        filterMode === 'promoted'
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <SparklesIcon className="h-4 w-4" />
                      مروّج ({promotedCount})
                    </button>
                    <button
                      onClick={() => setFilterMode('not_promoted')}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        filterMode === 'not_promoted'
                          ? 'bg-gray-700 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      غير مروّج ({notPromotedCount})
                    </button>
                  </div>
                </div>

                {/* تبديل وضع العرض */}
                <div className="flex items-center gap-2 rounded-lg bg-white p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      viewMode === 'grid'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">شبكة</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      viewMode === 'list'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <ListBulletIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">قائمة</span>
                  </button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500" />
              </div>
            ) : userListings.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <MegaphoneIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-700">لا توجد إعلانات بعد</h3>
                <p className="mb-4 text-gray-500">أنشئ إعلانك الأول وابدأ بالترويج له</p>
                <Link
                  href="/add-listing"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>إنشاء إعلان جديد</span>
                </Link>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <FunnelIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-700">لا توجد نتائج</h3>
                <p className="text-gray-500">لا توجد إعلانات تطابق الفلتر المحدد</p>
              </div>
            ) : viewMode === 'grid' ? (
              /* عرض الشبكة */
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map((listing) => {
                  const promoted = isPromoted(listing);

                  return (
                    <div
                      key={listing.id}
                      className={`group relative overflow-hidden rounded-2xl border-2 transition-all hover:shadow-lg ${
                        promoted
                          ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* شارات */}
                      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                        {promoted && (
                          <div className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                            <SparklesIcon className="h-3 w-3" />
                            مُروَّج
                          </div>
                        )}
                        <div
                          className={`rounded-lg px-2 py-1 text-xs font-medium ${
                            listing.type === 'auction'
                              ? 'bg-blue-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}
                        >
                          {listing.type === 'auction' ? 'مزاد' : 'بيع مباشر'}
                        </div>
                      </div>

                      {/* الصورة */}
                      <div className="relative h-44 bg-gray-100">
                        {listing.image ? (
                          <Image
                            src={listing.image}
                            alt={listing.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            <TagIcon className="h-12 w-12" />
                          </div>
                        )}
                      </div>

                      {/* المحتوى */}
                      <div className="p-4">
                        <h3 className="mb-2 truncate text-lg font-bold text-gray-900">
                          {listing.title}
                        </h3>
                        <p className="mb-3 text-xl font-black text-amber-600">
                          {listing.price.toLocaleString('en-US')}{' '}
                          <span className="text-sm">د.ل</span>
                        </p>

                        {promoted ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-xl bg-green-100 p-3">
                              <div className="flex items-center gap-2">
                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-bold text-green-700">
                                  باقة{' '}
                                  {
                                    PROMOTION_PACKAGES[
                                      listing.promotionPackage as keyof typeof PROMOTION_PACKAGES
                                    ]?.name
                                  }
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>متبقي {getRemainingDays(listing.promotionEndDate!)} يوم</span>
                              </div>
                              <span className="text-xs">
                                حتى {formatDate(listing.promotionEndDate!)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePromote(listing.id, listing.type)}
                            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-bold text-white shadow-md transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg"
                          >
                            <SparklesIcon className="ml-2 inline h-5 w-5" />
                            روّج الآن
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* عرض القائمة */
              <div className="space-y-4">
                {filteredListings.map((listing) => {
                  const promoted = isPromoted(listing);

                  return (
                    <div
                      key={listing.id}
                      className={`group flex flex-col overflow-hidden rounded-2xl border-2 transition-all hover:shadow-lg sm:flex-row ${
                        promoted
                          ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* الصورة */}
                      <div className="relative h-48 w-full flex-shrink-0 bg-gray-100 sm:h-40 sm:w-48">
                        {listing.image ? (
                          <Image
                            src={listing.image}
                            alt={listing.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            <TagIcon className="h-12 w-12" />
                          </div>
                        )}
                        {/* الشارات */}
                        <div className="absolute left-2 top-2 flex flex-col gap-1">
                          {promoted && (
                            <div className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                              <SparklesIcon className="h-3 w-3" />
                              مُروَّج
                            </div>
                          )}
                          <div
                            className={`rounded-lg px-2 py-1 text-xs font-medium ${
                              listing.type === 'auction'
                                ? 'bg-blue-500 text-white'
                                : 'bg-green-500 text-white'
                            }`}
                          >
                            {listing.type === 'auction' ? 'مزاد' : 'بيع مباشر'}
                          </div>
                        </div>
                      </div>

                      {/* المحتوى */}
                      <div className="flex flex-1 flex-col justify-between p-4 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex-1">
                          <h3 className="mb-1 text-lg font-bold text-gray-900">{listing.title}</h3>
                          <p className="mb-2 text-xl font-black text-amber-600">
                            {listing.price.toLocaleString('en-US')}{' '}
                            <span className="text-sm">د.ل</span>
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {formatDate(listing.createdAt)}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                listing.status === 'ACTIVE' || listing.status === 'AVAILABLE'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {listing.status === 'ACTIVE' || listing.status === 'AVAILABLE'
                                ? 'نشط'
                                : listing.status}
                            </span>
                          </div>
                        </div>

                        {/* حالة الترويج والزر */}
                        <div className="mt-4 sm:mt-0 sm:w-56">
                          {promoted ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 rounded-xl bg-green-100 p-3">
                                <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-600" />
                                <div>
                                  <div className="text-sm font-bold text-green-700">
                                    باقة{' '}
                                    {
                                      PROMOTION_PACKAGES[
                                        listing.promotionPackage as keyof typeof PROMOTION_PACKAGES
                                      ]?.name
                                    }
                                  </div>
                                  <div className="text-xs text-green-600">
                                    متبقي {getRemainingDays(listing.promotionEndDate!)} يوم
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePromote(listing.id, listing.type)}
                              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-bold text-white shadow-md transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg"
                            >
                              <SparklesIcon className="ml-2 inline h-5 w-5" />
                              روّج الآن
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* زر روّج إعلان إضافي في نهاية القسم */}
            {userListings.length > 0 && notPromotedCount > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    // الانتقال لأول إعلان غير مروّج
                    const firstNotPromoted = userListings.find((l) => !isPromoted(l));
                    if (firstNotPromoted) {
                      handlePromote(firstNotPromoted.id, firstNotPromoted.type);
                    }
                  }}
                  className="group flex items-center gap-3 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 px-8 py-4 text-amber-700 transition-all hover:border-amber-400 hover:bg-amber-100"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-200 transition-transform group-hover:scale-110">
                    <SparklesIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold">روّج إعلانك الآن</div>
                    <div className="text-sm text-amber-600">
                      لديك {notPromotedCount} إعلان غير مروّج
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* لماذا الترويج؟ */}
          <div className="mt-12 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
            <h2 className="mb-6 text-center text-2xl font-bold">لماذا تروّج إعلانك؟</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <EyeIcon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 font-bold">مشاهدات أكثر</h3>
                <p className="text-sm text-white/80">
                  إعلانك يظهر في المقدمة ويحصل على مشاهدات أكثر بـ 5 مرات
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <SparklesIcon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 font-bold">شارة مميز</h3>
                <p className="text-sm text-white/80">
                  إعلانك يحصل على شارة "مميز" تجذب انتباه المشترين
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <TrophyIcon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 font-bold">بيع أسرع</h3>
                <p className="text-sm text-white/80">
                  الإعلانات المروجة تباع بشكل أسرع 3 مرات من العادية
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PromotionsPage;
