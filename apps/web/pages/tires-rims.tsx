import CircleStackIcon from '@heroicons/react/24/outline/CircleStackIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/common';
import SelectField from '../components/ui/SelectField';
import { libyanCities } from '../data/libyan-cities';
import { formatNumber } from '../utils/numberUtils';

type DropdownOption = { value: string; label: string };

const cityOptions: DropdownOption[] = [
  { value: 'جميع المدن', label: 'جميع المدن' },
  ...libyanCities.map((city) => ({
    value: city.name,
    label: city.name,
  })),
];

// فئات الإطارات والجنطات
const tireCategories = [
  'جميع الفئات',
  'إطارات سيارات',
  'إطارات شاحنات',
  'إطارات دراجات نارية',
  'جنطات حديد',
  'جنطات ألمنيوم',
  'جنطات رياضية',
  'أخرى',
];

const tireConditions = ['جميع الحالات', 'جديد', 'مستعمل - ممتاز', 'مستعمل - جيد', 'مستعمل - مقبول'];

const tireBrands = [
  'جميع الماركات',
  'ميشلان',
  'بريدجستون',
  'جوديير',
  'كونتيننتال',
  'بيريلي',
  'دنلوب',
  'يوكوهاما',
  'هانكوك',
  'كومهو',
  'نيكسن',
  'فالكن',
  'توي',
  'أخرى',
];

const tireSizes = [
  'جميع المقاسات',
  '13 بوصة',
  '14 بوصة',
  '15 بوصة',
  '16 بوصة',
  '17 بوصة',
  '18 بوصة',
  '19 بوصة',
  '20 بوصة',
  '21 بوصة',
  '22 بوصة',
];

interface TireRim {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  brand: string;
  size: string;
  location: string;
  images: string[];
  description: string;
  negotiable: boolean;
  urgent: boolean;
  phone: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    phone: string;
    verified: boolean;
  };
}

interface TiresRimsPageProps {
  items: TireRim[];
  stats: {
    total: number;
    negotiable: number;
    urgent: number;
    newItems: number;
  };
}

const TiresRimsPage: React.FC<TiresRimsPageProps> = ({ items: initialItems, stats }) => {
  const router = useRouter();
  const [items, setItems] = useState<TireRim[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // فلاتر البحث
  const [filters, setFilters] = useState({
    searchQuery: '',
    location: 'جميع المدن',
    category: 'جميع الفئات',
    brand: 'جميع الماركات',
    condition: 'جميع الحالات',
    size: 'جميع المقاسات',
    priceMin: null as number | null,
    priceMax: null as number | null,
  });

  // تحديث عرض الشاشة
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);
    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  // تحديث البيانات عند التحميل
  useEffect(() => {
    // محاكاة بيانات الإطارات والجنطات
    const mockItems: TireRim[] = [
      {
        id: '1',
        title: 'إطارات ميشلان 205/55R16',
        price: 1200,
        category: 'إطارات سيارات',
        condition: 'جديد',
        brand: 'ميشلان',
        size: '16 بوصة',
        location: 'طرابلس',
        images: ['/images/tires/michelin1.jpg'],
        description: 'إطارات ميشلان جديدة مقاس 205/55R16، مناسبة للسيارات الصغيرة والمتوسطة',
        negotiable: true,
        urgent: false,
        phone: '091-234-5678',
        createdAt: '2024-01-15',
        user: {
          id: 'user1',
          name: 'أحمد محمد',
          phone: '091-234-5678',
          verified: true,
        },
      },
      {
        id: '2',
        title: 'جنطات ألمنيوم 17 بوصة',
        price: 2500,
        category: 'جنطات ألمنيوم',
        condition: 'مستعمل - ممتاز',
        brand: 'أخرى',
        size: '17 بوصة',
        location: 'بنغازي',
        images: ['/images/rims/aluminum1.jpg'],
        description: 'جنطات ألمنيوم 17 بوصة في حالة ممتازة، تصميم رياضي',
        negotiable: false,
        urgent: true,
        phone: '092-345-6789',
        createdAt: '2024-01-14',
        user: {
          id: 'user2',
          name: 'سالم علي',
          phone: '092-345-6789',
          verified: true,
        },
      },
    ];

    setItems(mockItems);
  }, []);

  // تطبيق الفلاتر
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchesLocation = filters.location === 'جميع المدن' || item.location === filters.location;
    const matchesCategory =
      filters.category === 'جميع الفئات' || item.category === filters.category;
    const matchesBrand = filters.brand === 'جميع الماركات' || item.brand === filters.brand;
    const matchesCondition =
      filters.condition === 'جميع الحالات' || item.condition === filters.condition;
    const matchesSize = filters.size === 'جميع المقاسات' || item.size === filters.size;
    const matchesPriceMin = filters.priceMin === null || item.price >= filters.priceMin;
    const matchesPriceMax = filters.priceMax === null || item.price <= filters.priceMax;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesCategory &&
      matchesBrand &&
      matchesCondition &&
      matchesSize &&
      matchesPriceMin &&
      matchesPriceMax
    );
  });

  // معالج تغيير الفلاتر
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      location: 'جميع المدن',
      category: 'جميع الفئات',
      brand: 'جميع الماركات',
      condition: 'جميع الحالات',
      size: 'جميع المقاسات',
      priceMin: null,
      priceMax: null,
    });
  };

  // تبديل المفضلة
  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  return (
    <Layout>
      <Head>
        <title>الإطارات والجنطات - سوق السيارات الليبي</title>
        <meta name="description" content="تصفح وابحث عن الإطارات والجنطات في ليبيا" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CircleStackIcon className="h-8 w-8 text-orange-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">الإطارات والجنطات</h1>
                  <p className="text-gray-600">اعثر على الإطارات والجنطات المناسبة لسيارتك</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* إحصائيات سريعة */}
                <div className="hidden items-center gap-6 text-sm md:flex">
                  <div className="text-center">
                    <div className="font-bold text-orange-600">
                      {formatNumber(stats?.total || 878)}
                    </div>
                    <div className="text-gray-500">إجمالي القطع</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">
                      {formatNumber(stats?.negotiable || 365)}
                    </div>
                    <div className="text-gray-500">قابل للتفاوض</div>
                  </div>
                </div>

                {/* أزرار العرض */}
                <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`rounded-md p-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ListBulletIcon className="view-mode-icon h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`rounded-md p-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Squares2X2Icon className="view-mode-icon h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* فلتر محمول للشاشات الصغيرة */}
        {screenWidth <= 660 && (
          <div className="mx-auto max-w-7xl px-4 py-2">
            <div className="rounded-lg border bg-white shadow-sm">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex w-full items-center justify-between p-4 text-right"
              >
                <div className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-gray-800">الفلاتر</span>
                  {(filters.category !== 'جميع الفئات' || filters.brand !== 'جميع الماركات') && (
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">
                      {filters.category !== 'جميع الفئات' ? filters.category : ''}
                      {filters.brand !== 'جميع الماركات' ? ` - ${filters.brand}` : ''}
                    </span>
                  )}
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showMobileFilters && (
                <div className="space-y-4 border-t p-4">
                  {/* البحث */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">البحث</label>
                    <input
                      type="text"
                      placeholder="ابحث عن إطارات أو جنطات..."
                      value={filters.searchQuery}
                      onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  {/* المدينة */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">المدينة</label>
                    <SelectField
                      options={cityOptions}
                      value={filters.location}
                      onChange={(value) => handleFilterChange('location', value)}
                      placeholder="اختر المدينة"
                      searchable
                      clearable
                    />
                  </div>

                  {/* فئة المنتج */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      فئة المنتج
                    </label>
                    <SelectField
                      options={tireCategories}
                      value={filters.category}
                      onChange={(value) => handleFilterChange('category', value)}
                      placeholder="اختر الفئة"
                      searchable
                      clearable
                    />
                  </div>

                  {/* الماركة */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">الماركة</label>
                    <SelectField
                      options={tireBrands}
                      value={filters.brand}
                      onChange={(value) => handleFilterChange('brand', value)}
                      placeholder="اختر الماركة"
                      searchable
                      clearable
                    />
                  </div>

                  {/* المقاس */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">المقاس</label>
                    <SelectField
                      options={tireSizes}
                      value={filters.size}
                      onChange={(value) => handleFilterChange('size', value)}
                      placeholder="اختر المقاس"
                      searchable
                      clearable
                    />
                  </div>

                  {/* حالة المنتج */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      حالة المنتج
                    </label>
                    <SelectField
                      options={tireConditions}
                      value={filters.condition}
                      onChange={(value) => handleFilterChange('condition', value)}
                      placeholder="اختر الحالة"
                      searchable
                      clearable
                    />
                  </div>

                  {/* نطاق السعر */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      نطاق السعر (دينار)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="من"
                        value={filters.priceMin || ''}
                        onChange={(e) =>
                          handleFilterChange(
                            'priceMin',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400"
                      />
                      <input
                        type="number"
                        placeholder="إلى"
                        value={filters.priceMax || ''}
                        onChange={(e) =>
                          handleFilterChange(
                            'priceMax',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={resetFilters}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      إزالة الكل
                    </button>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                    >
                      تطبيق ({formatNumber(filteredItems.length)})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className={`flex items-start gap-4 ${screenWidth <= 660 ? 'flex-col' : ''}`}>
            {/* فلتر جانبي */}
            <aside className={`w-72 flex-shrink-0 ${screenWidth <= 660 ? 'hidden' : ''}`}>
              <div className="space-y-6 rounded-2xl border bg-white p-5 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <MagnifyingGlassIcon className="h-5 w-5 text-orange-600" />
                    الفلاتر
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    إزالة الكل
                  </button>
                </div>

                {/* البحث */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    البحث في العنوان والوصف
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      placeholder="ابحث عن إطارات أو جنطات..."
                      value={filters.searchQuery}
                      onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-12 pr-4 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* المدينة */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPinIcon className="h-4 w-4 text-green-600" />
                    المدينة
                  </label>
                  <SelectField
                    options={cityOptions}
                    value={filters.location}
                    onChange={(value) => handleFilterChange('location', value)}
                    placeholder="اختر المدينة"
                    searchable
                    clearable
                  />
                </div>

                {/* فئة المنتج */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CircleStackIcon className="h-4 w-4 text-orange-600" />
                    فئة المنتج
                  </label>
                  <SelectField
                    options={tireCategories}
                    value={filters.category}
                    onChange={(value) => handleFilterChange('category', value)}
                    placeholder="اختر الفئة"
                    searchable
                    clearable
                  />
                </div>

                {/* الماركة */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CogIcon className="h-4 w-4 text-blue-600" />
                    الماركة
                  </label>
                  <SelectField
                    options={tireBrands}
                    value={filters.brand}
                    onChange={(value) => handleFilterChange('brand', value)}
                    placeholder="اختر الماركة"
                    searchable
                    clearable
                  />
                </div>

                {/* المقاس */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">المقاس</label>
                  <SelectField
                    options={tireSizes}
                    value={filters.size}
                    onChange={(value) => handleFilterChange('size', value)}
                    placeholder="اختر المقاس"
                    searchable
                    clearable
                  />
                </div>

                {/* حالة المنتج */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    حالة المنتج
                  </label>
                  <SelectField
                    options={tireConditions}
                    value={filters.condition}
                    onChange={(value) => handleFilterChange('condition', value)}
                    placeholder="اختر الحالة"
                    searchable
                    clearable
                  />
                </div>

                {/* نطاق السعر */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    نطاق السعر (دينار)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="من"
                      value={filters.priceMin || ''}
                      onChange={(e) =>
                        handleFilterChange(
                          'priceMin',
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="إلى"
                      value={filters.priceMax || ''}
                      onChange={(e) =>
                        handleFilterChange(
                          'priceMax',
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* قائمة المنتجات */}
            <div className={`${screenWidth <= 660 ? 'w-full' : 'flex-1'} min-h-0`}>
              <div className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <CircleStackIcon className="h-5 w-5 text-orange-600" />
                    <span>الإطارات والجنطات المتاحة</span>
                    <span className="text-sm font-normal text-gray-500">
                      ({formatNumber(filteredItems.length)} منتج)
                    </span>
                  </h2>

                  {/* عدد النتائج للموبايل */}
                  {screenWidth <= 660 && (
                    <div className="text-sm text-gray-500">
                      {formatNumber(filteredItems.length)} نتيجة
                    </div>
                  )}
                </div>

                {/* عرض المنتجات */}
                <div
                  className={
                    viewMode === 'grid'
                      ? `grid gap-4 ${
                          screenWidth <= 800
                            ? 'grid-cols-1'
                            : screenWidth < 1080
                              ? 'grid-cols-1 sm:grid-cols-2'
                              : 'grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                        }`
                      : 'space-y-4'
                  }
                >
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="cursor-pointer rounded-lg border bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
                      onClick={() => router.push(`/tires-rims/${item.id}`)}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={item.images[0] || '/images/tires/default-tire.svg'}
                            alt={item.title}
                            className="h-16 w-16 rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== '/images/tires/default-tire.svg') {
                                target.src = '/images/tires/default-tire.svg';
                              }
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="mb-1 text-lg font-bold">{item.title}</h3>
                            <p className="mb-2 text-sm text-gray-600">{item.description}</p>
                            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                              <span className="rounded bg-orange-100 px-2 py-1 text-orange-800">
                                {item.category}
                              </span>
                              <span className="rounded bg-green-100 px-2 py-1 text-green-800">
                                {item.condition}
                              </span>
                              <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
                                {item.size}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-red-600">
                                {formatNumber(item.price)} دينار
                              </span>
                              <div className="flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500">{item.location}</span>
                              </div>
                            </div>
                            {(item.negotiable || item.urgent) && (
                              <div className="mt-2 flex items-center gap-2">
                                {item.negotiable && (
                                  <span className="rounded bg-blue-500 px-2 py-1 text-xs text-white">
                                    قابل للتفاوض
                                  </span>
                                )}
                                {item.urgent && (
                                  <span className="rounded bg-red-500 px-2 py-1 text-xs text-white">
                                    عاجل
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.id);
                            }}
                            className={`rounded-full p-2 transition-colors ${
                              favorites.includes(item.id)
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500'
                            }`}
                          >
                            <HeartIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* رسالة عدم وجود نتائج */}
                {filteredItems.length === 0 && (
                  <div className="py-12 text-center">
                    <CircleStackIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد منتجات</h3>
                    <p className="text-gray-500">
                      جرب تعديل معايير البحث للعثور على المزيد من النتائج
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TiresRimsPage;

// بيانات وهمية للصفحة
export async function getStaticProps() {
  const stats = {
    total: 878,
    negotiable: 365,
    urgent: 315,
    newItems: 421,
  };

  return {
    props: {
      items: [],
      stats,
    },
    revalidate: 60,
  };
}
