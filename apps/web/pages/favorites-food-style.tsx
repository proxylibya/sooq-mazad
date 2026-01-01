import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../components/common';
import FoodStyleFavoriteCard from '../components/features/favorites/FoodStyleFavoriteCard';
import ModernFavoriteCard from '../components/features/favorites/ModernFavoriteCard';
import ConfirmationModal from '../components/common/ui/ConfirmationModal';
import { useFavorites } from '../hooks/useFavorites';
import useAuth from '../hooks/useAuth';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import { CarIcon } from '../components/ui/MissingIcons';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import BuildingOfficeIcon from '@heroicons/react/24/outline/BuildingOfficeIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

// فئات مبسطة مثل تطبيقات الطعام
const quickFilters = [
  {
    id: 'all',
    name: 'الكل',
    icon: HeartIcon,
    color: 'bg-gray-100 text-gray-700',
  },
  {
    id: 'auctions',
    name: 'مزادات',
    icon: TrophyIcon,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'marketplace',
    name: 'سوق فوري',
    icon: CarIcon,
    color: 'bg-green-100 text-green-700',
  },
  {
    id: 'transport',
    name: 'نقل',
    icon: TruckIcon,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'showrooms',
    name: 'معارض',
    icon: BuildingOfficeIcon,
    color: 'bg-orange-100 text-orange-700',
  },
];

const FoodStyleFavoritesPage = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, price, rating

  // استخدام hooks
  const { user } = useAuth();
  const { favorites, isLoading, error, removeFromFavorites, refreshFavorites } = useFavorites();

  // حالة نافذة التأكيد
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    item: any;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    item: null,
  });

  const removeFavorite = (item: any) => {
    setConfirmModal({
      isOpen: true,
      title: 'إزالة من المفضلة',
      message: `هل أنت متأكد من إزالة "${item.title}" من المفضلة؟`,
      item: item,
      onConfirm: () => confirmRemoveFavorite(item),
    });
  };

  const confirmRemoveFavorite = async (item: any) => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    const success = await removeFromFavorites(
      item.type === 'marketplace' ? item.itemId : undefined,
      item.type === 'auction' ? item.itemId : undefined,
    );

    if (success) {
      await refreshFavorites();
    }
  };

  // فلترة المفضلة
  const filteredFavorites = favorites.filter((item) => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'auctions' && item.type === 'auction') ||
      (activeFilter === 'marketplace' && item.type === 'marketplace') ||
      (activeFilter === 'transport' && item.type === 'transport') ||
      (activeFilter === 'showrooms' && item.type === 'showroom');

    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // تحميل المفضلة عند تحميل الصفحة
  useEffect(() => {
    if (user?.id) {
      refreshFavorites();
    }
  }, [user?.id]);

  return (
    <>
      <Head>
        <title>المفضلة - مزاد السيارات</title>
        <meta name="description" content="عرض جميع العناصر المفضلة" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Header مبسط */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-3">
              <HeartSolid className="h-7 w-7 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">المفضلة</h1>
            </div>
            <p className="text-gray-600">{filteredFavorites.length} عنصر محفوظ</p>
          </div>

          {/* شريط البحث والفلاتر */}
          <div className="mb-6 space-y-4">
            {/* البحث */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في المفضلة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* فلاتر سريعة */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? filter.color + ' shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{filter.name}</span>
                    {filter.id === 'all' && (
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* أدوات التحكم */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{filteredFavorites.length} نتيجة</span>

              {/* ترتيب */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="recent">الأحدث</option>
                <option value="price">السعر</option>
                <option value="rating">التقييم</option>
              </select>
            </div>

            {/* أزرار العرض */}
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="عرض شبكي"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="عرض قائمة"
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* المحتوى */}
          <div>
            {!user ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <ExclamationTriangleIcon className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">يجب تسجيل الدخول</h3>
                <p className="mb-6 text-gray-600">سجل دخولك لعرض المفضلة</p>
                <button
                  onClick={() => router.push('/login')}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                >
                  تسجيل الدخول
                </button>
              </div>
            ) : isLoading ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">جاري التحميل...</h3>
                <p className="text-gray-600">يتم تحميل المفضلة...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <ExclamationTriangleIcon className="mx-auto mb-4 h-16 w-16 text-red-500" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">حدث خطأ</h3>
                <p className="mb-6 text-gray-600">فشل في تحميل المفضلة</p>
                <button
                  onClick={() => refreshFavorites()}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <HeartIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">لا توجد مفضلة</h3>
                <p className="mb-6 text-gray-600">لم تقم بإضافة أي عناصر للمفضلة بعد</p>
                <Link
                  href="/marketplace"
                  className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                >
                  تصفح السيارات
                </Link>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'space-y-3'
                }
              >
                {filteredFavorites.map((item) => (
                  <ModernFavoriteCard
                    key={item.id}
                    item={item}
                    viewMode={viewMode}
                    onRemove={removeFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* نافذة التأكيد */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type="warning"
        confirmText="إزالة"
        cancelText="إلغاء"
      />
    </>
  );
};

export default FoodStyleFavoritesPage;
