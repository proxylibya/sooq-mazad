import SelectField from '../components/ui/SelectField';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import WrenchScrewdriverIcon from '@heroicons/react/24/outline/WrenchScrewdriverIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/common';
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

// بيانات قطع الغيار
const partCategories = [
  'جميع الفئات',
  'قطع المحرك',
  'قطع الفرامل',
  'قطع التعليق',
  'قطع الكهرباء',
  'قطع التبريد',
  'قطع الإضاءة',
  'قطع الداخلية',
  'قطع الخارجية',
  'أخرى',
];

const partConditions = ['جميع الحالات', 'جديد', 'مستعمل - ممتاز', 'مستعمل - جيد', 'مستعمل - مقبول'];

const carBrands = [
  'جميع الماركات',
  'تويوتا',
  'نيسان',
  'هوندا',
  'هيونداي',
  'كيا',
  'مازدا',
  'ميتسوبيشي',
  'سوزوكي',
  'فورد',
  'شيفروليه',
  'مرسيدس',
  'بي إم دبليو',
  'أودي',
  'فولكس واجن',
];

interface CarPart {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  brand: string;
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

interface CarPartsPageProps {
  parts: CarPart[];
  stats: {
    total: number;
    negotiable: number;
    urgent: number;
    newParts: number;
  };
}

const CarPartsPage: React.FC<CarPartsPageProps> = ({ parts: initialParts, stats }) => {
  const router = useRouter();
  const [parts, setParts] = useState<CarPart[]>([]);
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
    // محاكاة بيانات قطع الغيار
    const mockParts: CarPart[] = [
      {
        id: '1',
        title: 'محرك تويوتا كامري 2015',
        price: 15000,
        category: 'قطع المحرك',
        condition: 'مستعمل - ممتاز',
        brand: 'تويوتا',
        location: 'طرابلس',
        images: ['/images/parts/engine1.jpg'],
        description: 'محرك في حالة ممتازة، تم فحصه بالكامل',
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
        title: 'فرامل أمامية نيسان صني',
        price: 800,
        category: 'قطع الفرامل',
        condition: 'جديد',
        brand: 'نيسان',
        location: 'بنغازي',
        images: ['/images/parts/brakes1.jpg'],
        description: 'فرامل أمامية جديدة أصلية',
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

    setParts(mockParts);
  }, []);

  // تطبيق الفلاتر
  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      part.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchesLocation = filters.location === 'جميع المدن' || part.location === filters.location;
    const matchesCategory =
      filters.category === 'جميع الفئات' || part.category === filters.category;
    const matchesBrand = filters.brand === 'جميع الماركات' || part.brand === filters.brand;
    const matchesCondition =
      filters.condition === 'جميع الحالات' || part.condition === filters.condition;
    const matchesPriceMin = filters.priceMin === null || part.price >= filters.priceMin;
    const matchesPriceMax = filters.priceMax === null || part.price <= filters.priceMax;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesCategory &&
      matchesBrand &&
      matchesCondition &&
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
      priceMin: null,
      priceMax: null,
    });
  };

  // تبديل المفضلة
  const toggleFavorite = (partId: string) => {
    setFavorites((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId],
    );
  };

  return (
    <Layout>
      <Head>
        <title>قطع غيار المركبات - سوق السيارات الليبي</title>
        <meta name="description" content="تصفح وابحث عن قطع غيار المركبات في ليبيا" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">قطع غيار المركبات</h1>
                  <p className="text-gray-600">اعثر على قطع الغيار التي تحتاجها</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* إحصائيات سريعة */}
                <div className="hidden items-center gap-6 text-sm md:flex">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">
                      {formatNumber(stats?.total || 2528)}
                    </div>
                    <div className="text-gray-500">إجمالي القطع</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">
                      {formatNumber(stats?.negotiable || 1211)}
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
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`rounded-md p-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Squares2X2Icon className="h-4 w-4" />
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
                  <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-800">الفلاتر</span>
                  {(filters.category !== 'جميع الفئات' || filters.brand !== 'جميع الماركات') && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
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
                      placeholder="ابحث عن قطعة غيار..."
                      value={filters.searchQuery}
                      onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
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
                      size="sm"
                      searchable
                      clearable
                    />
                  </div>

                  {/* فئة القطعة */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      فئة القطعة
                    </label>
                    <SelectField
                      value={filters.category}
                      onChange={(value) => handleFilterChange('category', value)}
                      options={partCategories.map((item) => ({
                        value: item,
                        label: item,
                      }))}
                      placeholder="اختر الفئة"
                    />
                  </div>

                  {/* ماركة السيارة */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      ماركة السيارة
                    </label>
                    <SelectField
                      value={filters.brand}
                      onChange={(value) => handleFilterChange('brand', value)}
                      options={carBrands.map((item) => ({
                        value: item,
                        label: item,
                      }))}
                      placeholder="اختر الماركة"
                    />
                  </div>

                  {/* حالة القطعة */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      حالة القطعة
                    </label>
                    <SelectField
                      value={filters.condition}
                      onChange={(value) => handleFilterChange('condition', value)}
                      options={partConditions.map((item) => ({
                        value: item,
                        label: item,
                      }))}
                      placeholder="اختر الحالة"
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
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
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
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
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
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      تطبيق ({formatNumber(filteredParts.length)})
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
                    <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
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
                      placeholder="ابحث عن قطعة غيار..."
                      value={filters.searchQuery}
                      onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-12 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
                  />
                </div>

                {/* فئة القطعة */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CogIcon className="h-4 w-4 text-purple-600" />
                    فئة القطعة
                  </label>
                  <SelectField
                    value={filters.category}
                    onChange={(value) => handleFilterChange('category', value)}
                    options={partCategories.map((item) => ({
                      value: item,
                      label: item,
                    }))}
                    placeholder="اختر الفئة"
                  />
                </div>

                {/* ماركة السيارة */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <WrenchScrewdriverIcon className="h-4 w-4 text-blue-600" />
                    ماركة السيارة
                  </label>
                  <SelectField
                    value={filters.brand}
                    onChange={(value) => handleFilterChange('brand', value)}
                    options={carBrands.map((item) => ({
                      value: item,
                      label: item,
                    }))}
                    placeholder="اختر الماركة"
                  />
                </div>

                {/* حالة القطعة */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    حالة القطعة
                  </label>
                  <SelectField
                    value={filters.condition}
                    onChange={(value) => handleFilterChange('condition', value)}
                    options={partConditions.map((item) => ({
                      value: item,
                      label: item,
                    }))}
                    placeholder="اختر الحالة"
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* قائمة القطع */}
            <div className={`${screenWidth <= 660 ? 'w-full' : 'flex-1'} min-h-0`}>
              <div className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />
                    <span>قطع الغيار المتاحة</span>
                    <span className="text-sm font-normal text-gray-500">
                      ({formatNumber(filteredParts.length)} قطعة)
                    </span>
                  </h2>

                  {/* عدد النتائج للموبايل */}
                  {screenWidth <= 660 && (
                    <div className="text-sm text-gray-500">
                      {formatNumber(filteredParts.length)} نتيجة
                    </div>
                  )}
                </div>

                {/* عرض القطع */}
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
                  {filteredParts.map((part) => (
                    <div
                      key={part.id}
                      className="cursor-pointer rounded-lg border bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
                      onClick={() => router.push(`/car-parts/${part.id}`)}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={part.images[0] || '/images/parts/default-part.svg'}
                            alt={part.title}
                            className="h-16 w-16 rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== '/images/parts/default-part.svg') {
                                target.src = '/images/parts/default-part.svg';
                              }
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="mb-1 text-lg font-bold">{part.title}</h3>
                            <p className="mb-2 text-sm text-gray-600">{part.description}</p>
                            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                              <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
                                {part.category}
                              </span>
                              <span className="rounded bg-green-100 px-2 py-1 text-green-800">
                                {part.condition}
                              </span>
                              <span className="rounded bg-purple-100 px-2 py-1 text-purple-800">
                                {part.brand}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-red-600">
                                {formatNumber(part.price)} دينار
                              </span>
                              <div className="flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500">{part.location}</span>
                              </div>
                            </div>
                            {(part.negotiable || part.urgent) && (
                              <div className="mt-2 flex items-center gap-2">
                                {part.negotiable && (
                                  <span className="rounded bg-blue-500 px-2 py-1 text-xs text-white">
                                    قابل للتفاوض
                                  </span>
                                )}
                                {part.urgent && (
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
                              toggleFavorite(part.id);
                            }}
                            className={`rounded-full p-2 transition-colors ${
                              favorites.includes(part.id)
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
                {filteredParts.length === 0 && (
                  <div className="py-12 text-center">
                    <WrenchScrewdriverIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد قطع غيار</h3>
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

export default CarPartsPage;

// بيانات وهمية للصفحة
export async function getStaticProps() {
  const stats = {
    total: 2528,
    negotiable: 1211,
    urgent: 878,
    newParts: 821,
  };

  return {
    props: {
      parts: [],
      stats,
    },
    revalidate: 60,
  };
}
