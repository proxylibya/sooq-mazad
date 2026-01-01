import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { OpensooqNavbar } from '../components/common';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import BuildingOfficeIcon from '@heroicons/react/24/outline/BuildingOfficeIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import ChatBubbleLeftIcon from '@heroicons/react/24/outline/ChatBubbleLeftIcon';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import ArrowsRightLeftIcon from '@heroicons/react/24/outline/ArrowsRightLeftIcon';
import WrenchScrewdriverIcon from '@heroicons/react/24/outline/WrenchScrewdriverIcon';
import QuestionMarkCircleIcon from '@heroicons/react/24/outline/QuestionMarkCircleIcon';
import UserPlusIcon from '@heroicons/react/24/outline/UserPlusIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import MapIcon from '@heroicons/react/24/outline/MapIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';

interface PageInfo {
  href: string;
  label: string;
  description: string;
  icon: any;
  category: string;
  status: 'active' | 'inactive' | 'new';
}

const SiteMap: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const pages: PageInfo[] = [
    // الصفحات الأساسية
    {
      href: '/',
      label: 'الصفحة الرئيسية',
      description: 'الصفحة الرئيسية للموقع',
      icon: HomeIcon,
      category: 'أساسي',
      status: 'active',
    },
    {
      href: '/auctions',
      label: 'سوق المزاد',
      description: 'صفحة المزادات والمناقصات',
      icon: TrophyIcon,
      category: 'أساسي',
      status: 'active',
    },
    {
      href: '/marketplace',
      label: 'سوق الفوري',
      description: 'السوق الفوري للسيارات',
      icon: BuildingStorefrontIcon,
      category: 'أساسي',
      status: 'active',
    },
    {
      href: '/yards',
      label: 'الساحات',
      description: 'ساحات الفحص والتقييم',
      icon: BuildingOfficeIcon,
      category: 'أساسي',
      status: 'active',
    },
    {
      href: '/transport',
      label: 'خدمات النقل',
      description: 'خدمات نقل السيارات',
      icon: TruckIcon,
      category: 'أساسي',
      status: 'active',
    },

    // حساب المستخدم
    {
      href: '/messages',
      label: 'الرسائل',
      description: 'صندوق الرسائل والمحادثات',
      icon: ChatBubbleLeftIcon,
      category: 'حساب المستخدم',
      status: 'active',
    },
    {
      href: '/notifications',
      label: 'الإشعارات',
      description: 'إشعارات وتنبيهات الحساب',
      icon: BellIcon,
      category: 'حساب المستخدم',
      status: 'new',
    },
    {
      href: '/my-account',
      label: 'حسابي',
      description: 'إدارة الحساب الشخصي',
      icon: UserIcon,
      category: 'حساب المستخدم',
      status: 'active',
    },
    {
      href: '/favorites',
      label: 'المفضلة',
      description: 'السيارات المفضلة',
      icon: HeartIcon,
      category: 'حساب المستخدم',
      status: 'active',
    },

    // الأدوات
    {
      href: '/compare',
      label: 'المقارنة',
      description: 'مقارنة السيارات',
      icon: ArrowsRightLeftIcon,
      category: 'أدوات',
      status: 'active',
    },
    {
      href: '/map',
      label: 'الخريطة',
      description: 'عرض السيارات على الخريطة التفاعلية',
      icon: MapIcon,
      category: 'أدوات',
      status: 'new',
    },

    // فئات السيارات
    {
      href: '/car-parts',
      label: 'قطع الغيار',
      description: 'قطع غيار السيارات',
      icon: WrenchScrewdriverIcon,
      category: 'فئات السيارات',
      status: 'active',
    },
    {
      href: '/motorcycles',
      label: 'الدراجات النارية',
      description: 'الدراجات النارية والهوائية',
      icon: WrenchScrewdriverIcon,
      category: 'فئات السيارات',
      status: 'active',
    },
    {
      href: '/tires-rims',
      label: 'الإطارات والجنطات',
      description: 'إطارات وجنطات السيارات',
      icon: WrenchScrewdriverIcon,
      category: 'فئات السيارات',
      status: 'active',
    },
    {
      href: '/trucks-buses',
      label: 'الحافلات والشاحنات',
      description: 'المركبات التجارية الثقيلة',
      icon: TruckIcon,
      category: 'فئات السيارات',
      status: 'active',
    },
    {
      href: '/heavy-machinery',
      label: 'الآليات الثقيلة',
      description: 'المعدات والآليات الثقيلة',
      icon: WrenchScrewdriverIcon,
      category: 'فئات السيارات',
      status: 'active',
    },
    {
      href: '/car-accessories',
      label: 'إكسسوارات السيارات',
      description: 'إكسسوارات وقطع تزيين السيارات',
      icon: WrenchScrewdriverIcon,
      category: 'فئات السيارات',
      status: 'active',
    },

    // الدعم والمساعدة
    {
      href: '/help',
      label: 'المساعدة',
      description: 'مركز المساعدة والأسئلة الشائعة',
      icon: QuestionMarkCircleIcon,
      category: 'دعم',
      status: 'active',
    },

    // المصادقة
    {
      href: '/login',
      label: 'تسجيل الدخول',
      description: 'تسجيل الدخول للحساب',
      icon: UserIcon,
      category: 'مصادقة',
      status: 'active',
    },
    {
      href: '/register',
      label: 'إنشاء حساب',
      description: 'إنشاء حساب جديد',
      icon: UserPlusIcon,
      category: 'مصادقة',
      status: 'active',
    },
  ];

  const categories = [
    'all',
    'أساسي',
    'حساب المستخدم',
    'أدوات',
    'فئات السيارات',
    'دعم',
    'مصادقة',
    'إجراءات',
  ];

  const filteredPages =
    selectedCategory === 'all' ? pages : pages.filter((page) => page.category === selectedCategory);

  const testLink = async (href: string) => {
    try {
      // محاولة الوصول للصفحة
      const response = await fetch(href, { method: 'HEAD' });
      setTestResults((prev) => ({ ...prev, [href]: response.ok }));
    } catch (error) {
      setTestResults((prev) => ({ ...prev, [href]: false }));
    }
  };

  const testAllLinks = async () => {
    for (const page of pages) {
      await testLink(page.href);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'new':
        return 'جديد';
      case 'inactive':
        return 'غير نشط';
      default:
        return 'غير محدد';
    }
  };

  return (
    <>
      <Head>
        <title>خريطة الموقع - مزاد السيارات</title>
        <meta name="description" content="خريطة شاملة لجميع صفحات الموقع وحالة الروابط" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <MapIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">خريطة الموقع</h1>
            </div>
            <p className="text-gray-600">
              عرض شامل لجميع صفحات الموقع وحالة الروابط ({pages.length} صفحة)
            </p>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-blue-600">{pages.length}</div>
              <div className="text-sm text-gray-600">إجمالي الصفحات</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-green-600">
                {pages.filter((p) => p.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">صفحات نشطة</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-blue-600">
                {pages.filter((p) => p.status === 'new').length}
              </div>
              <div className="text-sm text-gray-600">صفحات جديدة</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-purple-600">{categories.length - 1}</div>
              <div className="text-sm text-gray-600">فئات</div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Category Filter */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">تصفية حسب الفئة:</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full px-3 py-1 text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? 'الكل' : category}
                      {category !== 'all' && (
                        <span className="mr-1">
                          ({pages.filter((p) => p.category === category).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Links Button */}
              <button
                onClick={testAllLinks}
                className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
              >
                اختبار جميع الروابط
              </button>
            </div>
          </div>

          {/* Pages Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPages.map((page) => {
              const IconComponent = page.icon;
              const testResult = testResults[page.href];

              return (
                <div
                  key={page.href}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="truncate text-lg font-semibold text-gray-900">
                          {page.label}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${getStatusColor(page.status)}`}
                        >
                          {getStatusLabel(page.status)}
                        </span>
                      </div>
                      <p className="mb-3 text-sm text-gray-600">{page.description}</p>
                      <div className="mb-3 flex items-center gap-2">
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs">{page.href}</code>
                        {testResult !== undefined && (
                          <div className="flex items-center gap-1">
                            {testResult ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={page.href}
                          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm text-white transition-colors hover:bg-blue-700"
                        >
                          زيارة الصفحة
                        </Link>
                        <button
                          onClick={() => testLink(page.href)}
                          className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200"
                        >
                          اختبار
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredPages.length === 0 && (
            <div className="py-12 text-center">
              <MapIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد صفحات</h3>
              <p className="text-gray-600">لا توجد صفحات في هذه الفئة</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SiteMap;
